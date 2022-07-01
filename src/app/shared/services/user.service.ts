import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserTypeEnum} from 'src/app/shared/enums/user-type.enum';
import {CognitoUserModel} from '../models/cognito-user.model';
import {UserModel} from '../models/user.model';
import {AmplifyAppSyncService} from './amplify-app-sync.service';
import {SecuredStorageProviderService} from './secured-storage-provider.service';
import {LoggerService} from './logger.service';
import {FacebookService} from './facebook.service';
import {FacebookUserModel} from '@sharedModule/models/facebook-user.model';
import {Auth} from 'aws-amplify';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {InvitationsService} from '@groupAdminModule/_services/invitations.service';
import {environment} from 'src/environments/environment';
import {DateTime} from '@sharedModule/models/date-time';
import {UserIPInfo} from '@sharedModule/models/user-ip-info.model';
import {BackendService} from './backend.service';
import {CEPOnboardingStateEnum} from '@campaigns/_enums/CEP-onboarding-state.enum';
import {UpdateUserInput} from '@sharedModule/models/graph-ql.model';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	public userJustSignedUp = new BehaviorSubject<Boolean>(null);
	public isInitialized = false;
	public isUserInitialized = false;
	private requestInProgress: Promise<any> = null;
	private _currentUser = new BehaviorSubject<UserModel>(null);
	public currentUser$ = this._currentUser.asObservable();
	private _userEvents = new BehaviorSubject<string>(null);
	public userEvents$ = this._userEvents.asObservable();
	// To-Do: Move this to Authentication Service
	private _isLoggedIn = new BehaviorSubject<Boolean>(null);
	public isLoggedIn = this._isLoggedIn.asObservable();
	private isPostComposerUsed;
	private userIPInfo: UserIPInfo;
	private countriesList;
	constructor(
		private readonly appSync: AmplifyAppSyncService,
		private readonly securedStorage: SecuredStorageProviderService,
		private readonly facebookService: FacebookService,
		private readonly invitationsService: InvitationsService,
		private readonly loggerService: LoggerService,
		private readonly backendService: BackendService
	) {}

	get isPersonaSurveyFilled() {
		return !!this._currentUser.getValue().personaSurvey;
	}

	public async init() {
		if (this.isInitialized) {
			return;
		}

		this.isInitialized = true;

		this.facebookService.isLoggedIn$.subscribe(isLoggedIn => this.handleFBAccessTokenExpiration(isLoggedIn));

		this.refreshUser();

		// re-connect on web socket close
		this.appSync.websocketClosed.subscribe(() => this.subscribeToUserUpdate(this._currentUser.getValue().id));
	}

	async getCurrentSessionJWTToken() {
		return await (await Auth.currentSession()).getIdToken().getJwtToken();
	}

	public async refreshUser() {
		this.loggerService.debug('refresh the user', null, 'UserService', 'refreshUser', LoggerCategory.AppLogs);

		const currentAuthStatus = await this.isUserAuthenticated();
		if (!currentAuthStatus) {
			return;
		}

		if (this.requestInProgress) {
			this.loggerService.debug('returning existing request', null, 'UserService', 'getUser', LoggerCategory.AppLogs);
			return this.requestInProgress;
		}

		this.requestInProgress = this.isUserInitialized
			? this.updateUserAttributes(this._currentUser.getValue())
			: this.setUser();

		return this.requestInProgress;
	}

	public async getUserIpInfo(): Promise<any> {
		this.userIPInfo = this.userIPInfo ?? (await this.backendService.get('/getClientInformation')).body;
		return this.userIPInfo;
	}

	// To-Do: Move this to Authentication Service
	public async refreshAuthStatus(): Promise<boolean> {
		this.loggerService.debug('refresh the auth state', null, 'UserService', 'refreshUser', LoggerCategory.AppLogs);
		return await this.isUserAuthenticated();
	}

	public async getUser(): Promise<UserModel> {
		if (!this._currentUser.getValue()) {
			this.loggerService.debug('user not found', null, 'UserService', 'getUser', LoggerCategory.AppLogs);
			await this.refreshUser();
		}

		this.loggerService.debug('user found', null, 'UserService', 'getUser', LoggerCategory.AppLogs);
		return this._currentUser.getValue();
	}

	public async setUserPersonaDetail(user: UserModel) {
		return await this.appSync.updateUser({cognitoId: user.cognitoId, personaSurvey: user.personaSurvey});
	}

	public async updateUserTimeZoneInfo(cognitoId, timezoneInfo, timezoneName, timezoneOffsetInMins) {
		await this.appSync.updateUser({
			cognitoId: cognitoId,
			timezoneInfo: timezoneInfo,
			timezoneName: timezoneName,
			timezoneOffsetInMins: timezoneOffsetInMins
		});
	}

	// To-Do: Move this to Authentication Service
	public async logOut() {
		this.loggerService.debug('Logging out the user', null, 'UserService', 'logOut', LoggerCategory.AppLogs);
		const platformQueryParam = this.getQueryStringFromSecuredStorage('qs_platform');
		const fcmTokenQueryParam = this.getQueryStringFromSecuredStorage('qs_fcm_token');
		const userType = this.securedStorage.getCookie('userType');
		await this.removeFCMToken(fcmTokenQueryParam);

		this.loggerService.resetAnalytics();
		this.securedStorage.setCookie('fbToken', '', -1, '.convosight.com');
		this.securedStorage.setCookie('convosightLoginStatus', 'false', 3650);
		this.securedStorage.expireAllCookies();
		this.securedStorage.clearLocalStorage();
		this.securedStorage.clearSessionStorage();

		//retain query strings for mobile application
		this.securedStorage.setSessionStorage(
			'queryString',
			JSON.stringify({qs_platform: platformQueryParam, qs_fcm_token: fcmTokenQueryParam})
		);

		if (userType === UserTypeEnum.GroupMember || userType === null) {
			const redirectSignOut =
				platformQueryParam === 'android'
					? environment.baseUrl + 'group-admin-login'
					: environment.amplifyConfiguration.oauth.redirectSignOut;
			window.location.href = `https://${environment.amplifyConfiguration.oauth.domain}/logout?&client_id=${environment.amplifyConfiguration.aws_user_pools_web_client_id}&logout_uri=${redirectSignOut}`;
		} else {
			await Auth.signOut();
			window.location.reload();
		}
	}

	public async signIn() {
		// @ts-ignore
		await Auth.federatedSignIn({provider: 'Facebook'});
	}

	public async triggerEmailVerification(email, isTriggerTypeResend, doNotProcessError) {
		await this.appSync.triggerEmailVerification(email, isTriggerTypeResend, doNotProcessError);
	}

	public async updateUserState(user: UserModel) {
		this._currentUser.next(user);
	}

	public async triggerWhatsAppOptIn(
		cognitoId,
		dialCode,
		mobileNumber,
		countryCode,
		maskedNumber,
		doNotProcessError = false
	) {
		try {
			const whatsAppNumForOptIn = `${dialCode}${mobileNumber}`.replace(/[+ ]/g, '');
			const whatsAppUpdatedUser: UserModel = await this.appSync.triggerWhatsAppOptIn(
				whatsAppNumForOptIn,
				doNotProcessError
			);
			// encrypt the phone number
			const encryptMobileNumber = (await this.encryptUserData(mobileNumber)).body;

			this._currentUser.next(
				await this.appSync.updateUser({
					cognitoId: cognitoId,
					mobileNumber: encryptMobileNumber,
					mobileDialCode: dialCode,
					mobileCountryCode: countryCode,
					mobileNumberMasked: maskedNumber
				})
			);

			return whatsAppUpdatedUser;
		} catch (e) {
			const error = new Error('Error in Trigger WhatsApp Opt In');
			this.loggerService.error(error, 'Error in Trigger WhatsApp Opt In', {}, 'WhatsappOptInComponent', 'SubmitForm');
			return e;
		}
	}

	public async triggerInteractionLandbotOptIn(dialCode, mobileNumber, doNotProcessError = false) {
		try {
			const whatsAppNumForOptIn = `+${dialCode}${mobileNumber}`;
			const interactionWhatsAppOptInStatus: any = await this.appSync.interactionLandbotOptIn(
				whatsAppNumForOptIn,
				doNotProcessError
			);
			this.isUserInitialized = false;
			this.setUser();
			return interactionWhatsAppOptInStatus;
		} catch (err) {
			const error = new Error('Error in Trigger Interaction WhatsApp Opt In');
			this.loggerService.error(
				error,
				'Error in Trigger Interaction WhatsApp Opt In',
				{},
				'WhatsappOptInComponent',
				'SubmitForm'
			);
			return err;
		}
	}

	public async encryptUserData(phoneNumber: string) {
		return await this.appSync.encryptUserData(phoneNumber);
	}

	public async decryptUserData() {
		return await this.appSync.decryptUserData();
	}

	public async updateNotificationPreferences(input) {
		this._currentUser.next(await this.appSync.updateUser(input));
	}

	public async updateAdminBioContactInfo(input) {
		this._currentUser.next(await this.appSync.updateUser(input));
	}

	public async updateModeOfCommunicationVerificationStatus(input = null, type = null) {
		if (type === 'decline') {
			await this.appSync.updateUser(input);
		}
		const user = await this.getUser();
		user['modeOfCommunicationVerificationStatus'] = 'Verified';
		this._currentUser.next(user);
	}

	public async unsubscribeWhatsApp(user) {
		this._currentUser.next(await this.appSync.triggerWhatsAppOptOut());
	}

	async unsubscribeInteractionWhatsApp() {
		await this.appSync.interactionLandbotOptOut();
		this.isUserInitialized = false;
		this.setUser();
	}

	public async subscribeToWhatsApp(landbotCustomerId, phone, dialCode, countryCode, isEdited) {
		const updatedUser = await this.appSync.subscribeToWhatsApp(
			landbotCustomerId,
			phone,
			dialCode,
			countryCode,
			isEdited
		);
		this._currentUser.next(updatedUser);
		return updatedUser;
	}

	public async verifyEmail(input, doNotProcessError) {
		const updatedUser = await this.appSync.verifyEmail(input, doNotProcessError);
		this._currentUser.next(updatedUser);
		await this.invitationsService.processInvitations(updatedUser);
		this._userEvents.next('EmailVerified');
		return updatedUser;
	}

	public async updateFbAccessTokenFromCognito(user) {
		const cognitoUser = await this.getCognitoUser();
		const valuesToBeUpdated = {
			cognitoId: user.cognitoId,
			fbUserAccessToken: cognitoUser.attributes['custom:facebookAccessToken']
		};
		this._currentUser.next(await this.appSync.updateUser(valuesToBeUpdated));
	}

	public async getIfPostComposerUsed() {
		this.isPostComposerUsed = this.isPostComposerUsed ?? (await this.appSync.getIfPostComposerUsed());
		return this.isPostComposerUsed;
	}

	public async updateCEPOnboardingState(cognitoId: string, state: CEPOnboardingStateEnum): Promise<boolean> {
		return await this.updateUserAndProcessUpdate({cognitoId, CEPOnboardingState: state});
	}

	private async updateUserAndProcessUpdate(updateUserInput: UpdateUserInput): Promise<boolean> {
		try {
			const updatedUserObj = await this.appSync.updateUser(updateUserInput);
			this._currentUser.next(updatedUserObj);
			return true;
		} catch {
			return false;
		}
	}

	private async removeFCMToken(fcmToken: string) {
		const user = this._currentUser.getValue();

		if (!user?.fcmTokens || !this._isLoggedIn.getValue()) {
			return;
		}

		const fcmTokens = user.fcmTokens;
		const updatedFcmTokens = fcmTokens.filter(token => token !== fcmToken);
		const updatedUser = await this.appSync.updateUser({cognitoId: user.cognitoId, fcmTokens: updatedFcmTokens});

		await this._currentUser.next(updatedUser);
	}

	// To-Do: Move this to Authentication Service
	private isUserAuthenticated(): Promise<boolean> {
		this.loggerService.debug(
			'Checking for authentication status',
			null,
			'UserService',
			'isUserAuthenticated',
			LoggerCategory.AppLogs
		);
		return new Promise(resolve => {
			Auth.currentAuthenticatedUser()
				.then(() => {
					this.loggerService.debug(
						'User authentication done',
						null,
						'UserService',
						'isUserAuthenticated',
						LoggerCategory.AppLogs
					);
					resolve(true);

					if (!this._isLoggedIn.getValue()) {
						this._isLoggedIn.next(true);
					}
				})
				.catch(() => {
					this.loggerService.debug(
						'User authentication failed',
						null,
						'UserService',
						'isUserAuthenticated',
						LoggerCategory.AppLogs
					);
					resolve(false);

					if (this._isLoggedIn.getValue() !== false) {
						this._isLoggedIn.next(false);
					}
				});
		});
	}

	private getQueryStringFromSecuredStorage(queryStringName: string): string {
		const queryString = this.securedStorage.getSessionStorage('queryString');
		if (!queryString) {
			return;
		}

		try {
			const queryStringJSON = JSON.parse(queryString);
			return queryStringJSON[queryStringName];
		} catch {
			return;
		}
	}

	private async updateUserAttributes(user: UserModel) {
		const loggedInData: FacebookUserModel = await this.facebookService.getFacebookUser();

		if (!loggedInData) {
			return;
		}

		const valuesToBeUpdated = {
			cognitoId: user.cognitoId
		};

		const fcmToken = this.getQueryStringFromSecuredStorage('qs_fcm_token');
		if (fcmToken) {
			const existingTokens = user.fcmTokens ? user.fcmTokens : [];
			if (!existingTokens.includes(fcmToken)) {
				existingTokens.push(fcmToken);
				valuesToBeUpdated['fcmTokens'] = existingTokens;
			}
		}

		const profile = await this.facebookService.getProfile();
		if (profile) {
			(valuesToBeUpdated['profilePictureUrl'] = profile['profilePictureUrl']),
				(valuesToBeUpdated['fullname'] = profile['name']);
		}

		valuesToBeUpdated['lastLoggedInAtUTC'] = new DateTime().toISOString();

		if (!user.timezoneInfo || !user.timezoneOffsetInMins || !user.timezoneName) {
			const timezoneName = DateTime.guess();
			const momentWithTimezoneInfo = new DateTime().tz(timezoneName);

			valuesToBeUpdated['timezoneName'] = timezoneName;
			valuesToBeUpdated['timezoneInfo'] = momentWithTimezoneInfo.format('z');
			valuesToBeUpdated['timezoneOffsetInMins'] = momentWithTimezoneInfo.utcOffset();
		}

		this.loggerService.debug(
			'user_info_updating',
			{
				user_id: user ? user.id : '',
				lastLoggedInAtUTC: valuesToBeUpdated['lastLoggedInAtUTC'] ? valuesToBeUpdated['lastLoggedInAtUTC'] : ''
			},
			'UserService',
			'updateUserAttributes',
			LoggerCategory.ClickStream
		);

		if (Object.keys(valuesToBeUpdated).length > 1) {
			this._currentUser.next(await this.appSync.updateUser(valuesToBeUpdated));
		}

		this.requestInProgress = null;
	}

	private async setUser() {
		if (this.isUserInitialized) {
			return;
		}

		this.isUserInitialized = true;
		const usr = await this.getUserFromCognitoUser();
		let updateRequest = null;

		if (usr.userType === UserTypeEnum.GroupMember) {
			this.setFacebookUser();
			this.subscribeToUserUpdate(usr.id);
			updateRequest = this.updateUserAttributes(usr);
		}

		this._currentUser.next(usr);
		this.requestInProgress = updateRequest;
	}

	private async getCognitoUser(): Promise<CognitoUserModel> {
		const currentUserInfo = await Auth.currentUserInfo();
		this.loggerService.debug(
			'attribute_property',
			{isAttributePresent: currentUserInfo.attributes ? true : false},
			'UserService',
			'getCognitoUser'
		);
		if (currentUserInfo && currentUserInfo.attributes) {
			return new CognitoUserModel(currentUserInfo);
		} else {
			await this.logOut();
		}
	}

	private async getUserFromCognitoUser(): Promise<UserModel> {
		let cognitoUser: UserModel = await this.appSync.getUserDetails();
		if (!cognitoUser) {
			const newUser = await this.getCognitoUser();
			cognitoUser = await this.appSync.CreateUsers(newUser.getUserModel());
			await this.loggerService.setUserId(cognitoUser.id);
			await this.invitationsService.processInvitations(cognitoUser);
			this.securedStorage.setCookie('newUser', 'true', 365);
			this.loggerService.isNewUser = true;
			this.userJustSignedUp.next(true);
			this.loggerService.info(
				'user_signedUp',
				{
					user_id: cognitoUser.id
				},
				'UserService',
				'getUserFromCognitoUser',
				LoggerCategory.ClickStream
			);
			this.loggerService.info(
				'CompleteRegistration',
				{
					user_id: cognitoUser.id
				},
				'UserService',
				'getUserFromCognitoUser',
				LoggerCategory.ClickStream
			);
			this.updateUserAcquisitionSrc();
			this.loggerService.setUserProperty(cognitoUser.id, {
				email_opt_in: true
			});
		} else {
			if (!cognitoUser.fbUserAccessToken) {
				await this.updateFbAccessTokenFromCognito(cognitoUser);
			}
			await this.loggerService.setUserId(cognitoUser.id);
			this.loggerService.isNewUser = false;
			this.loggerService.info(
				'user_loggedIn',
				{
					user_id: cognitoUser.id
				},
				'UserService',
				'getUserFromCognitoUser',
				LoggerCategory.ClickStream
			);
			this.userJustSignedUp.next(false);
		}
		await this.loggerService.setFreshchatAndUpscodeNameAndEmail(
			cognitoUser.id,
			cognitoUser.givenname,
			cognitoUser.familyname,
			cognitoUser.email
		);
		await this.loggerService.setUserProperty(cognitoUser.id, {
			first_name: cognitoUser.givenname,
			last_name: cognitoUser.familyname,
			email: cognitoUser.email
		});
		await this.securedStorage.setCookie('convosightLoginStatus', 'true', 3650);
		await this.securedStorage.setCookie('userType', cognitoUser.userType);
		return cognitoUser as UserModel;
	}

	private async updateUserAcquisitionSrc() {
		try {
			const queryString = JSON.parse(this.securedStorage.getSessionStorage('queryString'));
			const acquisition_src = queryString && queryString.qs_utm_source ? queryString.qs_utm_source : 'direct';
			const acquisition_campaign = queryString && queryString.qs_utm_campaign ? queryString.qs_utm_campaign : 'direct';
			const result = await this.appSync.SaveAcqusitionSourceAndCampaign(acquisition_campaign, acquisition_src);
			if (result && result.error) {
				this.loggerService.debug(
					'Error updating acquisition details',
					{acquisition_src: acquisition_src, acquisition_campaign: acquisition_campaign, error_message: result.message},
					'UserService',
					'updateUserAquisitionSrc'
				);
				return;
			}
			this.loggerService.debug(
				'acquisition_details',
				{acquisition_src: acquisition_src, acquisition_campaign: acquisition_campaign},
				'UserService',
				'updateUserAquisitionSrc'
			);
		} catch (e) {
			this.loggerService.debug('Error updating acquisition details', {}, 'UserService', 'updateUserAquisitionSrc');
		}
	}

	private async handleFBAccessTokenExpiration(isLoggedIn) {
		this.loggerService.debug(
			"change in 'isLoggedIn' state from facebook service",
			{is_loggedIn_status: isLoggedIn},
			'UserService',
			'handleFBAccessTokenExpiration',
			LoggerCategory.AppLogs
		);

		if (!isLoggedIn && this._currentUser.getValue().fbUserAccessToken) {
			const valuesToBeUpdated = {
				cognitoId: this._currentUser.getValue().cognitoId,
				fbUserAccessToken: null
			};
			await this.securedStorage.removeCookie('convosightLoginStatus');
			await this._currentUser.next(await this.appSync.updateUser(valuesToBeUpdated));
			await this.logOut();
		}
	}

	// To-Do : move the following code to facebook service and trigger when isLogged in from the auth service is set to true and logged in user is group member
	private async setFacebookUser() {
		const cognitoUser = await this.getCognitoUser();
		this.facebookService.sessionDetails = new FacebookUserModel(
			cognitoUser.getFacebookUserId(),
			cognitoUser.attributes['custom:facebookAccessToken'],
			cognitoUser.attributes['custom:fbAccessTokenExpiry']
		);
	}

	public async getCountries() {
		if (this.countriesList && typeof this.countriesList !== typeof '') {
			return this.countriesList;
		}

		const locallyStoredCountryList = await this.securedStorage.getLocalStorage('countriesListWithFlags');
		if (!locallyStoredCountryList) {
			this.countriesList = await this.appSync.getCountries();
			this.securedStorage.setLocalStorage('countriesListWithFlags', JSON.stringify(this.countriesList));
		} else {
			this.countriesList = JSON.parse(locallyStoredCountryList);
		}
		return this.countriesList;
	}

	async updateCampaignSubscribedStatus(cognitoId, subscribeCampaignStatu) {
		this._currentUser.next(
			await this.appSync.updateUser({cognitoId: cognitoId, campaignUpdatesSubscribed: subscribeCampaignStatu})
		);
	}

	private subscribeToUserUpdate(id: string) {
		try {
			this.appSync.OnUpdateUser(id).subscribe({
				next: (data: any) => this.updateUserObservable(data.value.data.onUpdateUser),
				error: () => undefined
			});
		} catch (e) {
			this.loggerService.error(
				e,
				'Error in subscribing to user updates',
				{user_id: id},
				'User',
				'subscribeToGroupUpdates'
			);
		}
	}

	private async updateUserObservable(data) {
		const user = await this.getUser();
		user['whatsappSubscriptionStatus'] = data.whatsappSubscriptionStatus;
		user['productDemoedAtDate'] = data.productDemoedAtDate;
		user['joinedCSGroupAtDate'] = data.joinedCSGroupAtDate;
		user['monetizationWorkshopAttendedAtDate'] = data.monetizationWorkshopAttendedAtDate;

		this._currentUser.next(user);
	}
}
