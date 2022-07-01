import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {takeUntil} from 'rxjs/operators';
import {AlertService} from '@sharedModule/services/alert.service';
import {AlertTypeEnum} from '@sharedModule/enums/alert-type.enum';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {getGroupProfileReviewsResponse, OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupsService} from '@sharedModule/services/groups.service';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-profile-pages-dashboard',
	templateUrl: './profile-pages-dashboard.component.html',
	styleUrls: ['./profile-pages-dashboard.component.scss']
})
export class ProfilePagesDashboardComponent extends BaseComponent implements OnInit, OnDestroy {
	isLoading = true;
	group: GroupModel;
	loaderCount = [0, 1, 2];
	profilePages: GroupProfilePageModel[];
	profilePage: GroupProfilePageModel;
	reviewsResp: getGroupProfileReviewsResponse | null = null;
	customProfilePages: GroupProfilePageModel[];
	commonProfilePage: GroupProfilePageModel;
	listOfGroupsWithProfilePageAccessObj: GroupModel[];
	oneGroupSelectMode: boolean = false;
	selectedProfilePageForDuplication;
	selectedProfilePageForNameUpdate;
	isUpdateRequestInProgress: boolean = false;
	showSamplePitchesModal: boolean = false;
	openGroupSelectionModal: boolean = false;
	openProfileIntroModal: boolean = false;
	openShareModal = false;
	openReviewsModal = false;
	copyUrl: string = '';
	averageRating: number = 0;
	ratingCount: number = 0;
	isPageNameExist: boolean = false;
	isPageLimitExceeded: boolean = false;
	showInstallationStepsPopup: boolean = false;
	fbGroupToBeInstalled: string;
	title: string;
	helpVideoLink: string;
	showProfileVideo: boolean = false;
	user: UserModel;
	showMobileInstallationOverlay: boolean = false;

	constructor(
		injector: Injector,
		private readonly groupProfilePages: GroupProfilePagesService,
		private readonly router: Router,
		private readonly groupsService: GroupsService,
		private alertService: AlertService,
		private readonly route: ActivatedRoute,
		private readonly secureStorageService: SecuredStorageProviderService,
		private readonly userService: UserService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Profile Pages', 'GA - Campaign Profile Pages');
		this.subscriptionsToDestroy.concat([
			this.route.params.subscribe(async param => {
				const group = await this.groupsService.getGroup(param.groupId);
				this.fbGroupToBeInstalled = 'https://www.facebook.com/groups/' + group.fbGroupId + '/apps/store';
				this.processSelectedGroup(group);
				this.checkToOpenReviewModal();
				this.checkForGroupProfileJourneyPopup();
			}),
			this.groupsService.groups.subscribe(async groups => this.processGroupsData(groups))
		]);
		this.getGroupWithAccess();
	}

	async getGroupWithAccess() {
		this.listOfGroupsWithProfilePageAccessObj = await this.groupProfilePages.listGroupsWithProfilePagesAccess();
	}

	async processGroupsData(groups) {
		if (groups === null) {
			return null;
		}
		const groupId = await this.route.snapshot.params.groupId;
		groups.map(group => {
			if (group.id === groupId && group.state === GroupStateEnum.Installed) {
				this.showInstallationStepsPopup = false;
			}
		});
	}

	checkToOpenReviewModal() {
		if (this.appService.currentPageFragment === 'review' || this.appService.currentPageFragment === 'reviews') {
			setTimeout(() => {
				this.openReviewsModal = true;
				this.appService.setPageFragment('');
			}, 200);
		}
	}

	closeInstallationPopup(event) {
		this.showInstallationStepsPopup = false;
		this.showMobileInstallationOverlay = false;
	}

	openInstallationOverlay(element) {
		this.recordButtonClick(element);
		if (this.renderedOn === 'Mobile') {
			this.showMobileInstallationOverlay = true;
			return;
		}
		this.showInstallationStepsPopup = true;
	}

	async checkForGroupProfileJourneyPopup() {
		if (
			this.appService.currentPageFragment === 'groupProfile' ||
			this.appService.currentPageFragment === 'groupsProfile' ||
			this.appService.currentPageFragment === 'editProfile'
		) {
			this.user = await this.userService.getUser();

			if (this.appService.currentPageFragment === 'editProfile') {
				this.openGroupSelectionModal = true;
				return;
			}
			if (!this.user.ownsGroupProfile) {
				setTimeout(() => {
					this.openProfileIntroModal = true;
					this.recordDialogBoxShow('Group onboarding flow');
					this.appService.setPageFragment('');
					this.secureStorageService.removeSessionStorage('login_through_OAuthState');
				}, 200);
			}
		}
	}

	resetRenamePage(event, group, newProfilePageNameInput) {
		this.recordButtonClick(event, group);
		newProfilePageNameInput.value = '';
		this.isPageNameExist = false;
		this.isPageLimitExceeded = false;
		this.selectedProfilePageForNameUpdate = null;
	}

	validateProfileName(id) {
		let inputData = (<HTMLInputElement>document.getElementById(id)).value;
		inputData = inputData.trim();
		if (inputData.length > 75) {
			this.isPageLimitExceeded = true;
		} else {
			this.isPageLimitExceeded = false;
			this.isPageNameExist =
				this.profilePages.findIndex(page => page.name.toLowerCase().trim() === inputData.toLowerCase()) !== -1;
		}
	}

	closeVideo(type) {
		let vid = <HTMLVideoElement>document.getElementById(type);
		vid.pause();
	}

	async createNewProfilePage(name: string, defaultProfile = false) {
		this.isUpdateRequestInProgress = true;
		const responseUrl = await this.group.createGroupProfilePage(name.trim(), defaultProfile, this.groupProfilePages);
		this.isUpdateRequestInProgress = false;
		if (!defaultProfile || !responseUrl) {
			responseUrl
				? this.alertService.success('', 'Page created successfully!')
				: this.alertService.error(AlertTypeEnum.Error, 'Something went wrong, please try again!');
			return;
		}
		this.router.navigateByUrl(`group-admin/campaigns/${this.group.id}/profile-pages/${responseUrl}/profile-onboarding`);
	}

	async updateProfilePageName(name: string, closeButtonForUpdateProfilePageName: any) {
		this.isUpdateRequestInProgress = true;
		const isRequestSuccess = await this.group.updateGroupProfileName(
			this.selectedProfilePageForNameUpdate.id,
			name.trim(),
			this.groupProfilePages
		);
		isRequestSuccess
			? this.alertService.success('', 'Page name updated successfully!')
			: this.alertService.success(AlertTypeEnum.Error, 'Something went wrong, please try again!');
		this.selectedProfilePageForNameUpdate = null;
		closeButtonForUpdateProfilePageName.click();
		this.isUpdateRequestInProgress = false;
	}

	async duplicateProfilePage(name: string, closeButtonForDuplicationModal: any) {
		this.isUpdateRequestInProgress = true;
		const id = await this.group.duplicateGroupProfilePage(
			this.selectedProfilePageForDuplication.id,
			name.trim(),
			this.groupProfilePages
		);

		this.router.navigateByUrl('/group-admin/campaigns/' + this.group.id + '/profile-pages/' + id + '/pitch-onboarding');
		this.selectedProfilePageForDuplication = null;
		closeButtonForDuplicationModal.click();
		this.isUpdateRequestInProgress = false;
	}

	openProfileHelpVideos(type) {
		if (type === 'groupProfile') {
			this.title = 'Group Profile';
			this.helpVideoLink = './assets/videos/group_profiles.mp4';
		} else {
			this.title = 'Brand Pitches';
			this.helpVideoLink = './assets/videos/brand_pitches.mp4';
		}
		this.showProfileVideo = true;
	}

	navigateToProfilePageInnerPage(pagePath: string, profilePage: GroupProfilePageModel, isPitch?: boolean) {
		// this.groupProfilePages.setSelectedProfilePageOfSelectedGroup(profilePage.id);
		if (profilePage.stage && profilePage.stage !== OnboardingStageEnum.COMPLETED) {
			this.router.navigateByUrl(
				`group-admin/campaigns/${profilePage.groupId}/profile-pages/${profilePage.id}/${
					isPitch ? 'pitch' : 'profile'
				}-onboarding`
			);
			return;
		}
		this.router.navigateByUrl(
			`group-admin/campaigns/${profilePage.groupId}/profile-pages/${profilePage.id}/${pagePath}`
		);
	}

	openSamplePitchesModal(element) {
		this.recordButtonClick(element, this.group, null, {example_source: 'brand_pitch_example'});
		this.showSamplePitchesModal = true;
	}

	closeSamplePitchesModal(element) {
		this.recordButtonClick(element, this.group, null, {example_source: 'brand_pitch_example'});
		this.showSamplePitchesModal = false;
	}

	createPitchHandle(element) {
		this.recordButtonClick(element, this.group, null, {
			example_source: 'brand_pitch_example',
			default_profile: false,
			internal_page: true,
			profile_name: this.commonProfilePage.name,
			profile_id: this.commonProfilePage.id,
			profile_group_id: this.commonProfilePage.groupId,
			profile_group_name: this.commonProfilePage.groupName,
			profile_group_category: this.commonProfilePage.category,
			profile_is_published: this.commonProfilePage.isPublished,
			profile_group_country: this.commonProfilePage.country
		});
		if (!this.customProfilePages.length) {
			this.router.navigateByUrl(
				`group-admin/campaigns/${this.group.id}/profile-pages/${this.commonProfilePage.id}/pitch-onboarding/intro`
			);
			return;
		}
		this.selectedProfilePageForDuplication = this.commonProfilePage;
	}

	async processSelectedGroup(group: GroupModel) {
		if (!group) {
			return;
		}
		this.isLoading = true;
		this.group = group;
		await this.group.listProfilePages(this.groupProfilePages);
		await this.groupProfilePages.setSelectedGroupForProfilePage(this.group);
		this.group.groupProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(async profilePages => {
			if (profilePages === null) {
				return;
			}
			// if (profilePages.length === 0) {
			// 	await this.group.createGroupProfilePage(this.group.name, true, this.groupProfilePages);
			// }

			this.profilePages = profilePages;

			const groupReviewsResp = await this.groupProfilePages.getGroupReviews(this.group.id);
			this.averageRating = groupReviewsResp.averageRating;
			this.ratingCount = groupReviewsResp.ratingCount;
			this.reviewsResp = groupReviewsResp;

			this.commonProfilePage = this.profilePages.filter(page => page.isDefaultProfile)[0];
			if (!this.commonProfilePage) {
				this.oneGroupSelectMode = true;
				this.openGroupSelectionModal = true;
				return;
			}

			this.customProfilePages = this.profilePages.filter(page => !page.isDefaultProfile);
			this.isLoading = false;
		});
	}

	recordEvent(element, groupProfile) {
		this.recordButtonClick(element, this.group, null, {
			default_profile: false,
			internal_page: true,
			profile_name: groupProfile.name,
			profile_id: groupProfile.id,
			profile_group_id: groupProfile.groupId,
			profile_group_name: groupProfile.groupName,
			profile_group_category: groupProfile.category,
			profile_is_published: groupProfile.isPublished,
			profile_group_country: groupProfile.country
		});
	}

	getGroupPages() {
		return this.profilePages;
	}

	closeSharePopup(event) {
		this.enableScrolling();
		this.openShareModal = false;
	}

	closeReviewsPopup() {
		this.enableScrolling();
		this.openReviewsModal = false;
	}

	openSelectionPopup() {
		this.disableScrolling();
		this.openGroupSelectionModal = true;
	}

	closeSelectionPopup() {
		this.enableScrolling();
		if (this.profilePages.length === 0) {
			this.router.navigateByUrl('group-admin/manage');
		}
		this.openGroupSelectionModal = false;
	}

	openProfileIntroPopup() {
		this.disableScrolling();
		this.openProfileIntroModal = true;
	}

	closeProfileIntroPopup() {
		this.enableScrolling();
		this.openProfileIntroModal = false;
	}

	closeVideoPlayer(event) {
		this.showProfileVideo = false;
	}

	processReviewsModal(element, profilePage: GroupProfilePageModel) {
		this.recordButtonClick(element, this.group, null, null, profilePage);
		this.openReviewsModal = true;
	}

	processShareModal(element, profilePage: GroupProfilePageModel) {
		this.recordButtonClick(element, this.group, null, null, profilePage);
		this.disableScrolling();
		this.profilePage = profilePage;
		this.copyUrl = profilePage.profileUrl;
		this.openShareModal = true;
	}

	setProfileDuplicateName(profileName) {
		let incrementor = 2;
		let profileNames = [];
		let duplicateCheckFailed = false;
		this.profilePages.forEach(page => profileNames.push(page.name));
		while (!duplicateCheckFailed) {
			if (profileNames.includes(profileName + '_' + incrementor)) {
				incrementor++;
			} else {
				duplicateCheckFailed = true;
			}
		}
		return profileName + '_' + incrementor;
	}

	openPitchProfile(element, url) {
		this.recordButtonClick(element, this.group, null, {example_source: 'brand_pitch_example'});
		window.open(url, '_blank');
	}
}
