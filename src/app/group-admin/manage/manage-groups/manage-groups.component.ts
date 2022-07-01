import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Injector,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewChild
} from '@angular/core';
import {Observable, of} from 'rxjs';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UserService} from '@sharedModule/services/user.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {UserModel} from '@sharedModule/models/user.model';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import * as _ from 'lodash';
import {ActivatedRoute, Router} from '@angular/router';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {PushNotificationService} from '@sharedModule/services/push-notification.service';
import {CEPOnboardingStateEnum} from '@campaigns/_enums/CEP-onboarding-state.enum';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';

declare var window: any;

@Component({
	selector: 'app-manage-groups',
	templateUrl: './manage-groups.component.html',
	styleUrls: ['./manage-groups.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageGroupsComponent extends BaseComponent implements OnInit, OnDestroy {
	@ViewChild('video') myVideo: ElementRef;
	isLoading = true;
	showCategorySurvey = false;
	loaderForCard = true;
	user: UserModel;
	installedGroups: GroupModel[] = [];
	nonInstalledGroups: GroupModel[] = [];
	sortedGroupsOnMemberCount: GroupModel[] = [];
	totalGroups: number;
	totalMemberCount = 0;
	totalConversations$: Observable<number | string> = null;
	areThereAnyNonInstalledGroups = false;
	areThereAnyInstalledGroups = false;
	areAllGroupsHasNonInstallState = false;
	gettingGroupsFromFacebook: boolean;
	groupId: string;
	installingGrp: GroupModel = null;
	selectedGroup: GroupModel;
	showHowToAddGroupPopup = false;
	showAddAppGroupPopup = false;
	showMobileInstallationOverlay = false;
	showInstallationStepsPopup = false;
	fbGroupToBeInstalled = '';
	selectedGroupForInstallation;
	isTabActive = true;
	hasTitleChanged = false;
	showModeOfCommunicationConfirmationDialog = true;
	showAdminPromptModal = false;
	CEPOnboardingStateEnum = CEPOnboardingStateEnum;
	private unlistener;
	groupHavingProfilePages = [];
	openShareModal: boolean = false;
	shareUrl;
	loadingBannerCard: boolean = true;
	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly metricService: GroupMetricsService,
		public readonly groupsService: GroupsService,
		public readonly fbService: FacebookService,
		private readonly renderer2: Renderer2,
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly securedStorageProvider: SecuredStorageProviderService,
		private readonly pushNotificationService: PushNotificationService,
		private readonly cdRef: ChangeDetectorRef
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.cdRef.detectChanges();
		super.setPageTitle('Group Admin Manage Groups', 'Group Admin Manage Groups');
		this.checkIfTabIsActive();
		this.checkQueryStringForStateParameter();
		this.checkQueryStringForStartingUserFlow();
		this.headerService.checkToShowAllLink();
		this.checkForUserHaveProfilePageAccess();
		this.groupsService.init();
		this.subscriptionsToDestroy.concat([
			this.groupsService.groups.subscribe(async groups => this.processGroupsData(groups)),
			this.groupsService.newlyAddedGroupsCount$.subscribe(newlyAddedGroupsCount => {
				if (!this.appService.hideGroupsAddedToastMessage) {
					this.showToastMessageForGroupsAdded(newlyAddedGroupsCount);
				}
			})
		]);
		this.appService.setFreshchatFAQ('');
	}

	async checkForAdminBioJourneyPopup() {
		this.user = await this.userService.getUser();
		if (!this.user.isAdminBioCompleted && !this.securedStorageProvider.getCookie('AdminBioJourneyInManagePage')) {
			setTimeout(() => {
				this.recordDialogBoxShow('Admin bio journey');
				this.securedStorageProvider.setCookie('AdminBioJourneyInManagePage', 'true');
				this.showAdminPromptModal = true;
				this.disableScrolling();
				this.cdRef.detectChanges();
			}, 3000);
		}
	}

	async openAdminBioJourneyPopup() {
		this.showAdminPromptModal = true;
	}

	async checkForGroupBioJourneyPopup() {
		this.user = await this.userService.getUser();
		const groupWithProfilePageAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
			(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
		);
		if (groupWithProfilePageAccess && groupWithProfilePageAccess.length > 0 && !this.user.ownsGroupProfile) {
			this.router.navigateByUrl(
				`/group-admin/campaigns/${groupWithProfilePageAccess[0].id}/profile-pages#groupProfile`
			);
		}
	}

	async checkIfGroupJourneyCanBeStarted() {
		this.user = await this.userService.getUser();
		if (
			(this.user.isAdminBioCompleted || this.securedStorageProvider.getCookie('AdminBioJourneyInManagePage')) &&
			!this.securedStorageProvider.getCookie('GroupJourneyInManagePage')
		) {
			setTimeout(() => {
				this.recordDialogBoxShow('Group profile journey');
				this.securedStorageProvider.setCookie('GroupJourneyInManagePage', 'true');
				this.checkForGroupBioJourneyPopup();
			}, 1000);
		}
	}

	closeInstallationPopup(event) {
		this.showInstallationStepsPopup = false;
	}

	checkIfTabIsActive() {
		this.unlistener = this.renderer2.listen('window', 'visibilitychange', () => {
			const isDocumentHidden = document.hidden;
			this.isTabActive = !isDocumentHidden;
			if (!isDocumentHidden && this.hasTitleChanged) {
				this.setPageTitle('Group Admin Manage Groups', 'Group Admin Manage Groups');
				Array.from(document.getElementsByClassName('appFavicon')).forEach(element =>
					element.setAttribute('href', './favicon.ico')
				);
			}
			this.cdRef.detectChanges();
		});
	}

	async processGroupsData(groups) {
		if (groups === null) {
			return null;
		}

		if (this.appService.currentPageUrl.getValue().includes('/public/')) {
			return;
		}

		this.totalGroups = groups.length;
		if (this.totalGroups === 0) {
			this.router.navigateByUrl('/group-admin/no-groups');
			return;
		}
		this.checkForAdminBioJourneyPopup();
		this.checkIfGroupJourneyCanBeStarted();
		this.sortedGroupsOnMemberCount = groups.sort((a, b) => b.memberCount - a.memberCount);
		this.installingGrp = null;
		this.areThereAnyNonInstalledGroups = groups.some(
			group => group.state !== GroupStateEnum.Installed || (group.state === GroupStateEnum.Installed && group.isDead)
		);
		this.areThereAnyInstalledGroups = groups.some(group => group.state === GroupStateEnum.Installed && !group.isDead);
		this.areAllGroupsHasNonInstallState = groups.every(group => group.state === GroupStateEnum.NotInstalled);
		this.isLoading = false;
		await groups.map(group => this.processGroupByState(group));
		this.cdRef.detectChanges();
		const conversations = await this.groupsService.getAllConversationsInLast30Days();
		this.totalConversations$ = of(conversations);
		this.cdRef.detectChanges();
	}

	checkForOpenPushNotification() {
		if (this.areThereAnyInstalledGroups) {
			this.pushNotificationService.showNotificationPrompt('DailyPushNotificationForManageGroup');
		}
	}

	async navigateToGroupProfilePages(element) {
		this.recordButtonClick(element);
		if (this.groupHavingProfilePages.length > 0) {
			this.router.navigateByUrl(`/group-admin/campaigns/${this.groupHavingProfilePages[0].id}/profile-pages`);
		}
	}

	async checkForUserHaveProfilePageAccess() {
		this.groupHavingProfilePages = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
			(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
		);
		this.loadingBannerCard = false;
	}

	navigateToEditAdminBio() {
		this.router.navigateByUrl(`/group-admin/settings/admin-bio?ref=open_admin_bio_popup`);
	}

	processGroupByState(group: GroupModel): Promise<boolean> {
		const indexInNonInstalledItems = this.nonInstalledGroups.findIndex(groupItem => groupItem.id === group.id);
		const indexInInstalledItems = this.installedGroups.findIndex(groupItem => groupItem.id === group.id);
		const groupAlreadyListed = indexInInstalledItems > -1 || indexInNonInstalledItems > -1;
		const isStateChangeDetected =
			(group.state === GroupStateEnum.Installed && indexInNonInstalledItems > -1) ||
			(group.state !== GroupStateEnum.Installed && indexInInstalledItems > -1);

		if (!isStateChangeDetected && groupAlreadyListed) {
			indexInNonInstalledItems > -1
				? (this.nonInstalledGroups[indexInNonInstalledItems] = group)
				: (this.installedGroups[indexInInstalledItems] = group);
			return;
		}

		if (indexInNonInstalledItems > -1) {
			this.nonInstalledGroups.splice(indexInNonInstalledItems, 1);
		}

		if (indexInInstalledItems > -1) {
			this.totalMemberCount -= group.memberCount;
			this.installedGroups.splice(indexInInstalledItems, 1);
		}

		if (group.state === GroupStateEnum.Installed && !group.isDead) {
			this.totalMemberCount += group.memberCount;
			this.installedGroups.push(group);
			this.checkForBusinessCategory(group);
		} else {
			this.nonInstalledGroups.push(group);
		}
		if (group.fbGroupId === this.selectedGroupForInstallation && group.state === GroupStateEnum.Installed) {
			this.showInstallationStepsPopup = false;
		}
	}

	closeAuthorizeConvoOverlay(event) {
		this.showHowToAddGroupPopup = false;
		super.setPageTitle('Group Admin Manage Groups', 'Group Admin Manage Groups');
	}

	checkQueryStringForStateParameter() {
		this.subscriptionsToDestroy.push(
			this.route.queryParams.subscribe(queryParams => this.checkStateHasGroupPermission(queryParams))
		);
	}

	checkQueryStringForStartingUserFlow() {
		try {
			const queryString = JSON.parse(this.securedStorageProvider.getSessionStorage('queryString'));
			if (queryString && queryString.qs_userflow_id && window.userflow) {
				window.userflow.start(queryString.qs_userflow_id);
				this.logger.info(
					'userflow_opened',
					{userflow_id: queryString.qs_userflow_id},
					'ManageGroupsComponent',
					'checkQueryStringForStartingUserFlow'
				);
				this.securedStorageProvider.removeSessionStorage('queryString');
			}
		} catch (e) {}
	}

	async checkStateHasGroupPermission(queryParams) {
		if (!_.isEmpty(queryParams)) {
			const currentUser = await this.userService.getUser();
			try {
				if (JSON.parse(queryParams.state).permissionAskFor === FacebookPermissionEnum.GroupPermission) {
					await this.groupsService.addMoreGroupsFromFacebook(currentUser);
				}
			} catch {
				// Json.parse may throw serialization exception is queryParams.state is not json
			}
		}
	}

	async getMoreGroupsFromFacebook(element) {
		this.recordButtonClick(element);
		this.gettingGroupsFromFacebook = true;
		await this.fbService.revokeAccessPermission(FacebookPermissionEnum.GroupPermission);
		await this.fbService.reAskAccessPermission(
			FacebookPermissionEnum.GroupPermission,
			`${JSON.stringify({permissionAskFor: FacebookPermissionEnum.GroupPermission})}`
		);
	}

	openHowToAddGroupPopup(element) {
		this.recordButtonClick(element);
		this.recordDialogBoxShow('How to add app to group');
		this.showHowToAddGroupPopup = true;
	}

	showToastMessageForGroupsAdded(count: number) {
		let title;
		let message;
		switch (count) {
			case 0:
				title = 'No more groups were found';
				message = 'Check again later';
				break;
			case 1:
				title = 'You can now install Convosight in this group';
				message = count + ' new group was added';
				break;
			default:
				title = 'You can now install Convosight in these groups';
				message = count + ' new groups were added';
		}

		this.alert.success(title, message);
	}

	checkForBusinessCategory(group) {
		if (group.businessCategory && group.country) {
			return;
		}
		if (!group.groupInstallationStartedAtUTC && !this.isTabActive) {
			this.hasTitleChanged = true;
			this.playAudio();
			this.setPageTitle('Convosight : Group Installation started', 'Convosight : Group Installation started');
			Array.from(document.getElementsByClassName('appFavicon')).forEach(element => {
				element.setAttribute('href', './assets/favicons/favicon-notif-32x32.png');
			});
		}
		this.recordDialogBoxShow('Business category survey', group);
		this.selectedGroup = group;
		this.showAddAppGroupPopup = false;
		this.showCategorySurvey = true;
		this.groupsService.isBusinessCategoryPopOpenOnLogin = true;
	}

	playAudio() {
		let audio = new Audio();
		audio.src = './assets/audio/notification.mp3';
		audio.load();
		audio.play();
	}

	closeBusinessCategory(event) {
		this.showCategorySurvey = false;
		if (this.groupsService.isAddAppToGroupPopupStillOpened) {
			this.showAddAppGroupPopup = true;
			this.disableScrolling();
		}
	}

	closeAddAppToGroup(event) {
		this.groupsService.isAddAppToGroupPopupStillOpened = false;
		this.showAddAppGroupPopup = false;
		this.enableScrolling();
		this.checkForOpenPushNotification();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
		if (this.unlistener) {
			this.unlistener();
		}
	}

	openMobileOverlay(group) {
		this.showMobileInstallationOverlay = true;
	}

	closeMobileInstallOverlay() {
		this.showMobileInstallationOverlay = false;
	}

	addAppToGroupPopup(event) {
		this.showInstallationStepsPopup = true;
		this.selectedGroupForInstallation = event.group.fbGroupId;
		this.fbGroupToBeInstalled = 'https://www.facebook.com/groups/' + event.group.fbGroupId + '/apps/store';
	}

	openFreshChat() {
		window.fcWidget.open();
		window.fcWidget.show();
	}

	closeAdminOverlay() {
		this.enableScrolling();
		this.showAdminPromptModal = false;
		this.router.navigateByUrl('/group-admin/settings/admin-bio');
	}

	trackByGroupId(index: number, group: GroupModel) {
		return group.id;
	}
}
