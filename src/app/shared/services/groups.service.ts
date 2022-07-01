import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {
	FacebookInsightsDetails,
	Group,
	PutGroupProfileReviewTypeInput,
	PutGroupReviewTypeInput,
	UpdateGroupInput
} from '../models/graph-ql.model';
import {GroupModel} from '../models/group.model';
import {UserModel} from '../models/user.model';
import {AmplifyAppSyncService} from './amplify-app-sync.service';
import {LoggerService} from './logger.service';
import {UserService} from './user.service';
import {GroupTypeEnum} from 'src/app/shared/enums/group-type.enum';
import {SecuredStorageProviderService} from './secured-storage-provider.service';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {Role} from '@sharedModule/enums/role.enum';
import {UserTypeEnum} from '@sharedModule/enums/user-type.enum';
import {ResponseObject} from '@sharedModule/models/graph-ql.model';
import {auditTime, distinctUntilChanged, skipWhile, take} from 'rxjs/operators';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable({
	providedIn: 'root'
})
export class GroupsService {
	private _isInitialized = false;
	private _newlyAddedGroupsCount = new Subject<number>();
	private _emailVerifiedSubscription = null;
	private _last30DaysConversations;

	public groups = new BehaviorSubject<GroupModel[]>(null);
	private _selectedGroupid: string;
	public isBusinessCategoryFilledForOneGroup = false;
	public isBusinessCategoryPopOpenOnLogin;
	public newlyAddedGroupsCount$ = this._newlyAddedGroupsCount.asObservable();
	public isAddAppToGroupPopupStillOpened;
	private groupsList = {};
	private groupsFirstLoad$ = this.groups
		.pipe(
			skipWhile(val => val === null),
			take(1)
		)
		.toPromise();

	get selectedGroupid(): string {
		this._selectedGroupid = this._selectedGroupid
			? this._selectedGroupid
			: this.groups.getValue().find(group => group.state === GroupStateEnum.Installed).id;
		return this._selectedGroupid;
	}

	set selectedGroupid(groupId: string) {
		this._selectedGroupid = groupId;
	}

	constructor(
		private userService: UserService,
		private readonly logger: LoggerService,
		private readonly appSync: AmplifyAppSyncService,
		private readonly securedStorageProvider: SecuredStorageProviderService
	) {}

	public init() {
		if (this._isInitialized) {
			return;
		}

		this._isInitialized = true;

		this.userService.isLoggedIn.subscribe(async loggedInStatus => {
			if (loggedInStatus === null) {
				this.groups.next(null);
				return;
			}
			this.logger.debug('Change in login status', {loggedInStatus}, 'GroupService', 'init');
			if (loggedInStatus) {
				const user = await this.userService.getUser();

				if (user.userType !== UserTypeEnum.GroupMember) {
					return;
				}
				this.userService.userJustSignedUp.getValue()
					? this.fetchUserGroups(user)
					: this.groups.next(await this.getGroups(user));
			}
		});

		this._emailVerifiedSubscription = this.userService.userEvents$.subscribe(eventName => {
			if (eventName !== 'EmailVerified') {
				return;
			}

			this.fetchModeratorGroups();
		});

		this.resubscribeOnWSClose();
	}

	private resubscribeOnWSClose() {
		this.appSync.websocketClosed.subscribe(() => {
			this.groups.getValue().forEach(group => this.subscribeToGroupUpdates(group.id));
		});
	}

	public getFbGroupIdFromGroupId(groupId) {
		return this.groups.getValue().find(group => group.id === groupId).fbGroupId;
	}

	public async refresh() {
		const currentUser = await this.userService.getUser();
		return this.fetchUserGroups(currentUser);
	}

	async updateGroupProfilePageCount(groupId: string, profilePageCount: number) {
		const group = await this.getGroupDetails(groupId);
		await this.updateGroup({id: group.id, noOfProfilePagesCreated: profilePageCount});
	}

	private async updateGroup(group: UpdateGroupInput) {
		const updatedGroup = await this.appSync.updateGroup(group);
		this.updateGroupObservable(updatedGroup);
	}

	public async updateGroups(input) {
		const updatedGroup = await this.appSync.updateGroups(input);
	}

	public async markGroupAsNotDead(group: GroupModel) {
		await this.updateGroup({id: group.id, isDead: false});
	}

	public async updateBusinessCategoryAndCountryDetails(groupId, businessCategory, country) {
		this.logger.debug(
			'Updating business category details of group',
			{groupId},
			'GroupService',
			'updateBusinessCategoryAndCountryDetails'
		);
		try {
			const updateGroupInput = {id: groupId, businessCategory, country} as UpdateGroupInput;
			await this.updateGroup(updateGroupInput);
		} catch (e) {
			const error = new Error('Error while updating business category details of group');
			this.logger.error(
				error,
				'Error while updating business category details of group',
				{groupId},
				'GroupService',
				'updateBusinessCategoryAndCountryDetails'
			);
		}
	}

	public async triggerGroupStateCheck(groupId: string, userId: string) {
		this.logger.debug(
			'Recheck for CS app installation status triggered',
			{groupId, userId},
			'GroupService',
			'triggerGroupStateCheck'
		);
		try {
			const updateGroupInput = {id: groupId, recheckIfCSAppIsInstalledUsingUserId: userId};
			await this.updateGroup(updateGroupInput);
		} catch (e) {
			const error = new Error('Error while triggering recheck for CS app installation status');
			this.logger.error(
				error,
				'Error while triggering recheck for CS app installation status',
				{groupId, userId},
				'GroupService',
				'triggerGroupStateCheck'
			);
		}
	}

	public async addMoreGroupsFromFacebook(user: UserModel) {
		await this.fetchUserGroups(user);
	}

	public async fetchModeratorGroups() {
		const user = await this.userService.getUser();
		let groups = await this.getGroups(user, Role.Moderator);
		let existingGroups = this.groups.getValue();
		existingGroups = existingGroups ? existingGroups : [];
		groups = groups ? groups : [];
		this.groups.next(existingGroups.concat(groups));
		this._emailVerifiedSubscription.unsubscribe();
	}

	async fetchMemberGroups() {
		const user = await this.userService.getUser();
		let groups = await this.getGroups(user, Role.Member);
		return groups;
	}

	async fetchAdminGroups() {
		const user = await this.userService.getUser();
		let groups = await this.getGroups(user);
		return groups;
	}

	private async fetchUserGroups(user: UserModel): Promise<void> {
		this.logger.debug('Creating groups for user', {userId: user.id}, 'GroupService', 'createGroupsForUser');
		const utmCountryFromSession = await this.getUtmCountryFromSession();
		let groups;

		try {
			groups = await this.createAndFetchGroupsFromFacebook(user);
			if (!groups) {
				this.logger.debug('No groups fetch from Facebook', {}, 'GroupService', 'createGroupsForUser');
				this.groups.next([]);
				return;
			}
		} catch (e) {
			this.logger.debug(
				'Error while fetching groups from facebook for user',
				{userId: user.id},
				'GroupService',
				'createGroupsForUser'
			);
			return;
		}

		groups.forEach(group => {
			group.isCurrentUserAdmin = true;
			this.subscribeToGroupUpdates(group.id);
			!!utmCountryFromSession ? this.updateGroup({id: group.id, countryFromUTM: utmCountryFromSession}) : '';
		});

		this.groups.next(groups);
	}

	private async createAndFetchGroupsFromFacebook(user: UserModel): Promise<GroupModel[]> {
		this.logger.debug(
			'Triggering creation of groups for user',
			{userId: user.id},
			'GroupService',
			'createAndFetchGroupsFromFacebook'
		);
		let response;
		try {
			const userIpInfo = await this.userService.getUserIpInfo();
			userIpInfo && userIpInfo.country
				? (response = await this.appSync.queryFacebookGroups(userIpInfo.country))
				: (response = await this.appSync.queryFacebookGroups());
		} catch (e) {
			const errorMessage = 'Error while fetching groups from facebook for user';
			this.logger.error(
				new Error(errorMessage),
				errorMessage,
				{userId: user.id},
				'GroupService',
				'createGroupsForUser'
			);
			return;
		}

		if (!response?.groups) {
			return;
		}

		let existingGroups = this.groups.getValue();
		existingGroups = existingGroups ? existingGroups : [];
		const existingGroupIds = existingGroups.map(group => group.id);
		let groups = response?.groups
			?.filter(newGroup => !!newGroup && !existingGroupIds.includes(newGroup.id))
			.map(group => new GroupModel(group));
		groups = existingGroups.concat(groups);

		this.logger.info(
			'groups_acquired',
			{user_id: user.id, group_count: groups.length, count_of_new_groups: response.newGroupsCount},
			'GroupService',
			'createAndFetchGroupsFromFacebook'
		);
		if (response.newGroupsCount > 0) {
			this._newlyAddedGroupsCount.next(response.newGroupsCount);
		}
		return groups as unknown as GroupModel[];
	}

	getUtmCountryFromSession() {
		const queryString = this.securedStorageProvider.getSessionStorage('queryString');
		try {
			if (!!queryString) {
				const queryParamsSnapshot = JSON.parse(queryString);
				if (queryParamsSnapshot.utm_country) {
					return queryParamsSnapshot.utm_country;
				} else {
					return null;
				}
			} else {
				return null;
			}
		} catch {
			return null;
		}
	}

	public async addModeratorForGroups(
		groups: GroupModel[],
		inviterName: string,
		inviterUserId: string,
		email: string,
		mobileNumber: string,
		name: string
	): Promise<any> {
		const groupDetailsJSON = groups.map(group => Object.assign({}, {id: group.id, name: group.name}));
		const groupDetailsString = JSON.stringify(groupDetailsJSON);
		try {
			return await this.appSync.addModeratorForGroup(
				groupDetailsString,
				inviterName,
				inviterUserId,
				email,
				mobileNumber,
				name
			);
		} catch (e) {
			return e;
		}
	}

	public async getGroupMembersDetails(groupId) {
		try {
			return await this.appSync.getGroupModeratorsByGroupId(groupId);
		} catch (e) {
			return e;
		}
	}

	public async removeGroupModerator(email: string, groupId: string): Promise<ResponseObject> {
		try {
			return await this.appSync.removeGroupModerator(email, groupId);
		} catch (e) {
			return e;
		}
	}

	async getGroup(groupId: string) {
		if (this.groupsList[groupId] === undefined) {
			this.groupsList[groupId] = await this.appSync.GetGroup(groupId);
		}
		return new GroupModel(this.groupsList[groupId]);
	}

	async getGroupDetails(groupId: string): Promise<GroupModel> {
		await this.groupsFirstLoad$;
		const group = this.groups.getValue().find(group => group.id === groupId);
		if (!!group) {
			return group;
		} else {
			this.logger.debug(
				'Group details not found in the groups collection',
				{groupId},
				'GroupService',
				'getGroupDetails'
			);
			return await this.getGroup(groupId);
		}
	}

	async getGroupForCEPOnboarding(): Promise<GroupModel> {
		const groupsWithProfilePagesAccess = await this.listGroupsWithProfilePagesAccess();
		if (groupsWithProfilePagesAccess.length > 0) {
			return groupsWithProfilePagesAccess.sort((groupA, groupB) => groupB.memberCount - groupA.memberCount)[0];
		}

		const err = new Error('No groups eligible for CEP Onboarding');
		const groups = this.groups?.getValue();
		this.logger.error(
			err,
			err.message,
			groups.map(group => {
				return {
					id: group.id,
					role: group.role,
					state: group.state,
					isDead: !group.isDead,
					isAdminTokenAvailable: group.isAdminTokenAvailable,
					metricsAvailableSinceUTC: group.metricsAvailableSinceUTC,
					metricsAvailableUntilUTC: group.metricsAvailableUntilUTC
				};
			}),
			'GroupService',
			'getGroupForCEPOnboarding'
		);
		return undefined;
	}

	public async checkForCSAppInstallationState(groupId: string, groupState: string) {
		this.logger.debug(
			'Checking the installation state',
			{groupId, groupState},
			'GroupService',
			'checkForCSAppInstallationState'
		);
		try {
			const updatedGroup = await this.getGroup(groupId);

			if (updatedGroup.state !== GroupStateEnum.Installed) {
				return false;
			}

			const existingGroups = this.groups.getValue();
			const indexOfUpdatedGroup = existingGroups.findIndex(group => group.id === groupId);
			existingGroups[indexOfUpdatedGroup] = updatedGroup;
			this.groups.next(existingGroups);
			return true;
		} catch (e) {
			this.logger.error(
				e,
				'Error while checking the installation state',
				{groupId},
				'GroupService',
				'checkForCSAppInstallationState'
			);
		}
	}

	public async getAllConversationsInLast30Days(): Promise<number | string> {
		if (this._last30DaysConversations) {
			return this._last30DaysConversations;
		}
		const data = await this.appSync.getConversationsHourlyByUserId(
			new DateTime().add(-30, 'd').utc().startOf('d').unix(),
			new DateTime().add(-1, 'd').utc().endOf('d').unix()
		);
		try {
			this._last30DaysConversations = data.reduce(
				(accVal, curVal) => (curVal.error ? accVal : accVal + curVal.totalPosts + curVal.totalComments),
				0
			);
			return this._last30DaysConversations;
		} catch (e) {
			const error = new Error(e.message);
			this.logger.error(
				error,
				error.message,
				{user_id: (await this.userService.getUser()).id},
				'GroupsService',
				'getAllConversationsInLast30Days'
			);
			return 'NA';
		}
	}

	public async updateFacebookInsightFileDetailsOnGroup(groupId: string, insightsFileDetails: FacebookInsightsDetails) {
		try {
			await this.updateGroup({id: groupId, facebookInsightsFileDetails: insightsFileDetails});
		} catch (e) {
			const error = new Error('Error while updating facebook insight file details on the group');
			this.logger.error(
				error,
				'Change in login status',
				{groupId, insightsFileDetails},
				'GroupService',
				'updateFacebookInsightFileDetailsOnGroup'
			);

			return null;
		}
	}

	async listGroupsWithProfilePagesAccess() {
		await this.groupsFirstLoad$;
		const groups = this.groups?.getValue();
		return groups ? groups.filter(group => group.role === Role.Admin && group.memberCount >= 0) : [];
	}

	async eligibleGroupsForInsightsUpload(): Promise<GroupModel[]> {
		await this.groupsFirstLoad$;
		const groups = this.groups?.getValue();
		return groups ? groups.filter(group => this.checkGroupEligibilityForInsightsUpload(group)) : [];
	}

	checkGroupEligibilityForInsightsUpload(group: GroupModel) {
		return (
			group.memberCount > 250 &&
			group.role === 'Admin' &&
			group.state === GroupStateEnum.Installed &&
			!group.isDead &&
			(group.country === 'IN' || group.country === 'US')
		);
	}

	checkEligibilityForInsightsUploadCard() {
		return (
			this.groups.getValue().filter(group => {
				const isInsightFileDetailsAvailable = !(group.facebookInsightsFileDetails === null);
				const basicEligibility = this.checkGroupEligibilityForInsightsUpload(group);

				if (isInsightFileDetailsAvailable) {
					const isFileStatusValid = group.facebookInsightsFileDetails?.fileStatus === 'Valid';
					const fileUploadedAtUTCObj = new DateTime().parseUTCString(
						group.facebookInsightsFileDetails?.fileUploadedAtUTC
					);
					return isFileStatusValid
						? basicEligibility && new DateTime().diff(fileUploadedAtUTCObj.dayJsObj, 'days') > 90
						: basicEligibility;
				} else {
					return basicEligibility;
				}
			}).length > 0
		);
	}

	public async doesHaveGroupsEligibleForInsightsUpload() {
		return (await this.eligibleGroupsForInsightsUpload()).length > 0;
	}

	private updateGroupObservable(updatedGroup: Group) {
		if (!updatedGroup) {
			return;
		}

		try {
			const updatedGroups = this.groups
				.getValue()
				.map(group => (group.id === updatedGroup.id ? Object.assign(group, updatedGroup) : group));
			this.groups.next(updatedGroups);
		} catch (error) {
			this.logger.error(error, 'Error in updateGroupObservable', {}, 'GroupsService', 'updateGroupObservable');
		}
	}

	private async getGroups(
		user: UserModel,
		filterByRole?: Role,
		nextToken?: string,
		fetchedGroups: GroupModel[] = []
	): Promise<GroupModel[]> {
		try {
			const _groups = await this.appSync.getGroupsByUserId(user.id, filterByRole, nextToken);
			fetchedGroups = fetchedGroups.concat(_groups.items as undefined as GroupModel[]);

			if (_groups.nextToken) {
				return await this.getGroups(user, filterByRole, _groups.nextToken, fetchedGroups);
			}

			const fetchGroupsDataForLog = [];
			const processedGroupsData = fetchedGroups
				.filter(group => !!group && group.groupType === GroupTypeEnum.Facebook)
				.map(group => {
					this.subscribeToGroupUpdates(group.id);
					fetchGroupsDataForLog.push({groupId: group.id, groupName: group.name, fbGroupId: group.fbGroupId});
					if (group.businessCategory) {
						this.isBusinessCategoryFilledForOneGroup = true;
					}
					return new GroupModel(group);
				});

			this.logger.debug(
				'Groups fetched',
				{groupData: JSON.stringify(fetchGroupsDataForLog)},
				'GroupService',
				'getGroups'
			);
			return processedGroupsData;
		} catch (e) {
			this.logger.error(e, 'Error while fetching groups', null, 'GroupService', 'getGroups');
		}
	}

	private subscribeToGroupUpdates(id: string) {
		try {
			this.appSync
				.OnUpdateGroupsListener(id)
				.pipe(distinctUntilChanged(), auditTime(1000))
				.subscribe((data: any) => this.updateGroupObservable(data.value.data.onUpdateGroups));
		} catch (e) {
			this.logger.error(
				e,
				'Error in subscribing to group updates',
				{groupId: id},
				'GroupService',
				'subscribeToGroupUpdates'
			);
		}
	}

	public async putGroupProfileReview({
		groupProfileId,
		isDisabled,
		rating,
		reviewText,
		reviewUserId
	}: PutGroupProfileReviewTypeInput) {
		try {
			return await this.appSync.putGroupProfileReview({groupProfileId, isDisabled, rating, reviewText, reviewUserId});
		} catch (error) {
			this.logger.error(
				error,
				'Error in sending group profile review',
				{groupProfileId, isDisabled, rating, reviewText, reviewUserId},
				'GroupService',
				'putGroupProfileReview'
			);
		}
	}

	public async putGroupReview({groupId, isDisabled, reviewText, reviewUserId, rating}: PutGroupReviewTypeInput) {
		try {
			return await this.appSync.putGroupReview({groupId, isDisabled, reviewText, reviewUserId, rating});
		} catch (error) {
			this.logger.error(
				error,
				'Error in sending group review',
				{groupId, isDisabled, reviewText, reviewUserId, rating},
				'GroupService',
				'putGroupReview'
			);
		}
	}

	public async deleteGroupProfileReview({groupProfileId}) {
		try {
			return await this.appSync.deleteGroupProfileReview({groupProfileId});
		} catch (err) {
			this.logger.error(
				err,
				'Error while deleting group profile review',
				{groupProfileId},
				'GroupService',
				'deleteGroupProfileReview'
			);
		}
	}

	public async deleteGroupReview({groupId}) {
		try {
			return await this.appSync.deleteGroupReview({groupId});
		} catch (err) {
			this.logger.error(
				err,
				'Error while deleting group profile review',
				{groupId},
				'GroupService',
				'deleteGroupReview'
			);
		}
	}
}
