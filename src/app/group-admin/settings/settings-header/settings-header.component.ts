import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '@sharedModule/services/user.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {Router} from '@angular/router';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {CountryISO} from 'ngx-intl-tel-input';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '@sharedModule/services/alert.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {DateTime} from '@sharedModule/models/date-time';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-settings-header',
	templateUrl: './settings-header.component.html',
	styleUrls: ['./settings-header.component.scss']
})
export class SettingsHeaderComponent extends BaseComponent implements OnInit, OnDestroy {
	user;
	groups: GroupModel[];
	hashParam = '';
	userProfilePic;
	isEditEmailClicked = false;
	timeZoneList;
	timeZone;
	timeZonePlaceholder = 'TIME ZONE';
	editingTimezoneInProgress = false;
	isEditing;
	separateDialCode = true;
	success = false;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	editingWhatsappOptIn = false;
	isLoading = false;
	whatsappForm: FormGroup;
	number: string;
	showConfirmation = false;
	unsubcribeOverlay = false;
	countryCode = 'IN';
	showWhatsAppCard = false;
	showDidNotRecievedPopup = false;
	isNotificationPrefOn = false;
	decryptPhoneNumber;
	isInteractionFlow = false;
	private momentScriptLoad;
	doesUserHaveGroupsEligibleForInsightsUpload = false;
	unsubscribeCampaignOverlay = false;
	constructor(
		injector: Injector,
		private userService: UserService,
		private readonly facebookService: FacebookService,
		private readonly alertService: AlertService,
		private readonly formBuilder: FormBuilder,
		private readonly utilityService: UtilityService,
		public readonly router: Router,
		public readonly groupsService: GroupsService
	) {
		super(injector);
		this.insertMomentTimeZoneScript();
		this.evaluateUserEligibilityForInsightsUpload();
	}

	async insertMomentTimeZoneScript() {
		const momentTimeZoneScriptTag = document.createElement('script');
		const momentScriptTag = document.createElement('script');
		momentTimeZoneScriptTag.src = 'https://momentjs.com/downloads/moment-timezone-with-data.js';
		momentScriptTag.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
		document.head.append(momentScriptTag);

		this.momentScriptLoad = Promise.all([
			new Promise(
				resolve =>
					(momentScriptTag.onload = () => {
						document.head.append(momentTimeZoneScriptTag);
						resolve(true);
					})
			),
			new Promise(resolve => (momentTimeZoneScriptTag.onload = () => resolve(true)))
		]);
	}

	ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(async user => {
				if (user === null) {
					return;
				}
				this.user = user;
				this.decryptPhoneData();
				this.userProfilePic = await this.facebookService.getProfilePicture(user.fbUserId);
				this.loadGeneralSettings();
			})
		);
	}

	changeInteractionFlow(value: boolean) {
		this.isInteractionFlow = value;
	}

	async evaluateUserEligibilityForInsightsUpload() {
		this.doesUserHaveGroupsEligibleForInsightsUpload =
			await this.groupsService.doesHaveGroupsEligibleForInsightsUpload();
	}

	async decryptPhoneData() {
		try {
			const decryptedData = await this.userService.decryptUserData();
			this.decryptPhoneNumber = decryptedData.body ?? '';
		} catch (e) {
			// error while decrypting Number
		}
	}

	loadGeneralSettings() {
		this.subscriptionsToDestroy.push(
			this.headerService.hasGroupsInstalled$.subscribe(hasGrpInstalled => {
				this.showWhatsAppCard = hasGrpInstalled;
			})
		);
		this.displayDataInUI();
		super.setPageTitle(`GA - ${this.user.fullname} - Group Settings`, 'GA - Admin Name - Group Settings', {
			userId: this.user.id
		});
		this.checkQueryStringForOpeningWAPopup();
		this.whatsappForm = this.formBuilder.group({
			phoneNumber: [this.user.mobileNumber ? this.user.mobileNumber : '', [Validators.required]]
		});
	}

	async signOut(element) {
		this.recordButtonClick(element);
		await this.userService.logOut();
	}

	checkQueryStringForOpeningWAPopup() {
		const openWAPopup = this.utilityService.getParameterByName('open_wa_popup');

		if (!openWAPopup) {
			return;
		}

		// To open the modal
		($('#convosight-whatsapp-opt') as any).modal('show');
	}

	async displayDataInUI() {
		this.countryCode = this.user.mobileCountryCode;
		await this.momentScriptLoad;
		//@ts-ignore
		this.timeZone = `(UTC ${moment.tz(this.user.timezoneName).format('Z')}) ${this.user.timezoneName}`;
	}

	openUnsubscribeOverlay(element) {
		this.showConfirmation = false;
		this.recordButtonClick(element);
		this.recordDialogBoxShow('Unsubscribe Overlay');
		this.unsubcribeOverlay = true;
	}

	openUnsubscribeCampaignOverlay(element) {
		this.recordButtonClick(element);
		this.recordDialogBoxShow('Unsubscribe Overlay');
		this.unsubscribeCampaignOverlay = true;
	}

	whatsappUnsubscribe(element) {
		this.recordButtonClick(element);
		// if (!this.isInteractionFlow) {
		this.userService.unsubscribeWhatsApp(this.user);
		// } else {
		this.userService.unsubscribeInteractionWhatsApp();
		// }
		this.unsubcribeOverlay = false;
	}

	editWhatsAppOptIn() {
		this.whatsappForm.patchValue({
			phoneNumber: this.user.mobileNumber ? this.user.mobileNumber : ''
		});
		this.editingWhatsappOptIn = true;
	}

	hideWAConfirmOptInCard() {
		($('#convosight-whatsapp-opt') as any).modal('hide');
		this.showConfirmation = false;
	}

	hideWhatsAppOverlay() {
		($('#convosight-whatsapp-opt') as any).modal('hide');
		this.showConfirmation = false;
	}

	didNotReceiveCardStatus(event) {
		this.showDidNotRecievedPopup = event;
	}

	async openSubscribeNowOverlay(element) {
		this.recordButtonClick(element);
		// To open the modal
		($('#convosight-whatsapp-opt') as any).modal('show');
	}

	async updateWhatsAppInNumber(form) {
		if (form.valid) {
			this.isLoading = true;
			try {
				const mobileNumber = form.value.phoneNumber.number.replace(/[ ]/g, '');
				const dialCode = form.value.phoneNumber.dialCode.replace(/[+]/g, '');

				if (mobileNumber === this.user.mobileNumber) {
					this.alert.error('Already Subscribed', 'Please enter another number');
					this.isLoading = false;
					this.editingWhatsappOptIn = false;
					return;
				}
				const maskedNumber = await this.appService.getMaskedNumber(mobileNumber);

				const whatsAppResponse = await this.userService.triggerWhatsAppOptIn(
					this.user.cognitoId,
					dialCode,
					mobileNumber,
					form.value.phoneNumber.countryCode,
					maskedNumber,
					true
				);
				this.isLoading = false;
				this.editingWhatsappOptIn = false;

				if (whatsAppResponse && whatsAppResponse.errors) {
					this.alert.error('Something went wrong', 'Please try again');
					return;
				}
				this.showConfirmation = true;
				// To open the modal
				($('#convosight-whatsapp-opt') as any).modal('show');
			} catch (error) {
				this.showConfirmation = false;
				this.isLoading = false;
				const e = new Error('Error in WhatsApp Opt In');
				this.logger.error(
					e,
					'Error in WhatsApp Opt In',
					{user_id: this.user.id},
					'SettingsHeaderComponent',
					'updateWhatsAppInNumber'
				);
			}
		}
	}

	async subscribeCampaignUpdates() {
		await this.userService.updateCampaignSubscribedStatus(this.user.cognitoId, true);
	}

	pushTimezoneNames() {
		this.timeZoneList = [];
		//@ts-ignore
		moment.tz.names().forEach(timezone => {
			try {
				//@ts-ignore
				this.timeZoneList.push('(UTC ' + moment.tz(timezone).format('Z') + ') ' + timezone);
			} catch {}
		});
	}

	async getTimeZoneFormatForDisplay() {
		//@ts-ignore
		if (moment) {
			this.pushTimezoneNames();
		} else {
			setTimeout(() => this.pushTimezoneNames(), 500);
		}
	}

	editTimezone($event) {
		this.getTimeZoneFormatForDisplay();
		this.editingTimezoneInProgress = true;
		this.recordButtonClick($event);
	}

	async optionSelected(event: string) {
		let timezoneName = event.substr(13);
		this.user['timezoneName'] = timezoneName;
		this.user['timezoneInfo'] = new DateTime().tz(timezoneName).format('z');
		this.user['timezoneOffsetInMins'] = new DateTime().tz(timezoneName).utcOffset();
	}

	async updateTimeZoneInfo(element) {
		this.recordButtonClick(element);
		try {
			await this.userService.updateUserTimeZoneInfo(
				this.user.cognitoId,
				this.user.timezoneInfo,
				this.user.timezoneName,
				this.user.timezoneOffsetInMins
			);
			await this.alertService.success('Settings updated successfully!', 'Successfull');
			this.displayDataInUI();
		} catch (e) {
			this.alertService.error('Unsuccessful', 'An unknown error has occured. Please try again');
			return;
		}
		this.isEditing = false;
		this.editingTimezoneInProgress = false;
	}

	editEmailClicked(event) {
		this.isEditEmailClicked = event.editEmailClicked;
	}

	goToSettingBioPage(element) {
		this.recordButtonClick(element);
		this.router.navigateByUrl('/group-admin/settings/admin-bio');
	}

	unsubscribeCampaignUpdate(element) {
		this.userService.updateCampaignSubscribedStatus(this.user.cognitoId, false);
		this.alert.success('Unsubscribed successfully!', '');
	}

	goToCampaignPage(element) {
		this.recordButtonClick(element);
		this.router.navigateByUrl('/group-admin/campaigns');
	}

	togglePreferenceForUser() {
		this.userService.updateNotificationPreferences({
			cognitoId: this.user.cognitoId,
			receiveNotifications: !this.user.receiveNotifications
		});
		this.logger.setUserProperty(this.user.id, {
			email_opt_in: !this.user.receiveNotifications
		});
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
