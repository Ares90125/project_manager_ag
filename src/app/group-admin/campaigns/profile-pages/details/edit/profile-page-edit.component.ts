import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProfilePageDetailsComponent} from '@campaigns/profile-pages/details/profile-page-details.component';
import {FileService} from '@sharedModule/services/file.service';
import {UserService} from '@sharedModule/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import $ from 'jquery';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {GroupProfileReview, OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';
import {ProfilePublishStatusEnum} from '@sharedModule/models/graph-ql.model';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {AnimationOptions} from 'ngx-lottie';

@Component({
	selector: 'app-profile-page-edit',
	templateUrl: './profile-page-edit.component.html',
	styleUrls: ['./profile-page-edit.component.scss']
})
export class ProfilePageEditComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	@Input() isEditAvailable: boolean = true;
	@Input() onboardingPreview: boolean = false;
	@Input() isPitch: boolean = false;
	@ViewChild('coverImageForGroupProfile', {static: false}) coverImageForGroupProfile: ElementRef;
	@ViewChild('coverBackgroundImageForGroupProfile', {static: false}) coverBackgroundImageForGroupProfile: ElementRef;
	draftSavedAnimationOption: AnimationOptions = {
		path: './assets/json/draft-saved-animation.json'
	};

	panelOpenState = false;
	currentUserId: string;
	currentAdminProfileObj: any;
	currentAdminProfileIndex: number;
	resetEditChanges = new EventEmitter();
	isSaveInProgress = false;
	openShareModal = false;
	scrollIntoViewOptions: ScrollIntoViewOptions = {behavior: 'smooth', block: 'center', inline: 'nearest'};
	groupInsightsForAge = [];
	reviewSettingModal: boolean = false;
	openReviewsModal: boolean = false;
	reviews: GroupProfileReview[];
	visibleReviews: GroupProfileReview[];
	averageRating: number | null;
	ratingCount: number | null;
	totalRating: number | null;
	showReviewsVideo: boolean = false;
	@ViewChild('tooltip') tooltip;
	showInstallationStepsPopup: boolean = false;
	isProfileLoaded = false;
	fbGroupToBeInstalled: string;
	initCalled: boolean = false;
	showMobileInstallationOverlay: boolean = false;
	constructor(
		injector: Injector,
		readonly fileService: FileService,
		readonly userService: UserService,
		readonly router: Router,
		readonly route: ActivatedRoute,
		readonly groupProfilePagesService: GroupProfilePagesService,
		readonly groupsService: GroupsService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.groupProfilePagesService.isProfilePageData$.pipe(takeUntil(this.destroy$)).subscribe(profilePage => {
			if (profilePage) {
				this.profilePage = profilePage;
				this.initProfilePage();
			}
		});
		this.subscriptionsToDestroy.push(
			this.groupsService.groups.subscribe(async groups => this.processGroupsData(groups))
		);
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

	async initProfilePage() {
		super.setPageTitle('GA - Group Profile Edit Page', 'GA - Group Profile Edit Page', {
			is_public_url: false,
			group_id: this.profilePage.groupId,
			group_name: this.profilePage.groupName,
			internal_page: true
		});
		if (!this.initCalled) {
			setTimeout(() => {
				this.tooltip?.show();
			}, 2500);
		}
		this.fbGroupToBeInstalled = 'https://www.facebook.com/groups/' + this.profilePage.fbGroupId + '/apps/store';
		this.getGroupInsights();
		this.processEditOptions();
		this.getReviews(this.profilePage.groupId);
		this.groupProfilePagesService.profilePageOnboardingTracker.pipe(takeUntil(this.destroy$)).subscribe(value => {
			switch (value) {
				case 2:
					document.getElementById('profile-page-stats').scrollIntoView(this.scrollIntoViewOptions);
					break;
				case 3:
					document.getElementById('profile-page-topics').scrollIntoView(this.scrollIntoViewOptions);
					break;
				case 4:
					document.getElementById('profile-page-files').scrollIntoView(this.scrollIntoViewOptions);
					break;
			}
		});
		this.isProfileLoaded = true;
		this.initCalled = true;
	}

	showTooltip() {
		this.tooltip.show();
	}

	hideTooltip() {
		this.tooltip.hide();
	}

	consolelog(x) {
		console.log(x);
	}

	closeInstallationPopup(event) {
		this.showInstallationStepsPopup = false;
		this.showMobileInstallationOverlay = false;
	}

	openInstallationOverlay() {
		if (this.renderedOn === 'Mobile') {
			this.showMobileInstallationOverlay = true;
			return;
		}
		this.showInstallationStepsPopup = true;
	}

	async getReviews(groupProfileId: string) {
		const response = await this.groupProfilePagesService.getGroupReviews(groupProfileId);
		this.reviews = response.reviews;
		this.visibleReviews = response.reviews.filter(review => !review.isDisabled);
		this.averageRating = response.averageRating;
		this.ratingCount = response.ratingCount;
		this.totalRating = response.totalRating;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	openReviewHelpVideo() {
		this.showReviewsVideo = true;
	}

	closeVideoPlayer() {
		this.showReviewsVideo = false;
	}

	backToEditPage() {
		if (this.onboardingPreview) {
			const lastUrlChunk = this.isPitch ? 'pitch-onboarding' : 'profile-onboarding';
			this.router.navigateByUrl(
				`/group-admin/campaigns/${this.group.id}/profile-pages/${this.profilePage.id}/${lastUrlChunk}`
			);
			return;
		}
		window.history.back();
	}

	triggerOnBoarding() {
		this.enableScrolling();
		this.groupProfilePagesService.isProfilePageOnboardingPerformed = false;
		const currentCount = this.groupProfilePagesService.profilePageOnboardingTracker.getValue();
		this.groupProfilePagesService.profilePageOnboardingTracker.next(currentCount + 1);
	}

	async processEditOptions() {
		this.currentUserId = this.currentUserId ? this.currentUserId : (await this.userService.getUser()).id;
		this.currentAdminProfileIndex = this.profilePage?.admins?.findIndex(admin => admin.userId === this.currentUserId);
		this.currentAdminProfileObj = this.profilePage?.admins[this.currentAdminProfileIndex];
	}

	async getGroupInsights() {
		try {
			const groupInsights = await this.groupProfilePagesService.getGroupInsights(this.profilePage.groupId);

			this.groupInsightsForAge = groupInsights?.groupsAgeGenderInsights;
		} catch (e) {
			this.groupInsightsForAge = [];
		}
	}

	closeReviewsPopup(event) {
		this.enableScrolling();
		this.openReviewsModal = false;
	}

	processReviewsModal(element, profilePage: GroupProfilePageModel) {
		this.recordButtonClick(element, this.group, null, null, profilePage);
		this.reviewSettingModal = false;
		this.openReviewsModal = true;
	}

	displayImageAsCover(file) {
		const reader = new FileReader();
		reader.onload = e => {
			this.coverImageForGroupProfile.nativeElement.src = e.target.result;
			this.coverBackgroundImageForGroupProfile.nativeElement.src = e.target.result;
		};
		reader.readAsDataURL(file);
	}

	async fileChange(event: any) {
		const file = event.target.files[0] ? event.target.files[0] : null;
		if (!file) {
			return;
		}
		if (!file.type.includes('image/')) {
			this.alert.error('Invalid File Format', 'Please choose a image');
			return;
		}

		this.displayImageAsCover(file);
		this.profilePage.isSavingCoverImageNeeded = true;
		this.profilePage.coverImageToBeSaved = file;
		this.saveProfilePage();
	}

	async saveProfilePage($event?) {
		const event = $event;
		this.isSaveInProgress = true;
		if (this.profilePage.isAdminsSectionPreferenceChanged) {
			if (this.currentAdminProfileIndex !== -1) {
				this.profilePage.admins[this.currentAdminProfileIndex] = $event.currentUserProfileObj;
			}
		}

		setTimeout(async () => {
			await this.group.saveProfilePage(this.profilePage, this.groupProfilePagesService, this.fileService);

			this.resetEditChanges.emit(true);
			event?.closeButtonForPopup?.removeAttribute('disabled');
			event?.closeButtonForPopup?.click();
			if (this.profilePage.isAdminsSectionPreferenceChanged) {
				this.processEditOptions();
			}
			this.isSaveInProgress = false;
		}, 100);
	}

	showPublishedButton(event) {
		this.profilePage.publishedStatus = ProfilePublishStatusEnum.DRAFT;
	}

	openSharePopup(element) {
		this.recordButtonClick(element, null, null, null, this.profilePage);
		this.openShareModal = true;
	}

	bannerAction(banner) {
		switch (banner.bannerType) {
			case 'ConnectToConvosight':
				this.openInstallationOverlay();
				break;
			case 'NoReviewsBanner':
				this.openShareModal = true;
				break;
			case 'CreateBrandPitchBanner':
				this.router.navigateByUrl(`/group-admin/campaigns/${this.profilePage.groupId}/profile-pages`);
				break;
			case 'AddManualFieldBanner':
				this.groupProfilePagesService.openAudienceInsightsEditModal();
				break;
			default:
				this.router.navigateByUrl(`/group-admin/campaigns/${this.profilePage.groupId}/profile-pages`);
		}
	}

	async closeAudienceInsights($event?) {
		const event = $event;
		event?.closeButtonForPopup?.removeAttribute('disabled');
		event?.closeButtonForPopup?.click();
	}

	async publishProfilePage() {
		this.isSaveInProgress = true;
		const response = await this.group.publishProfilePage(this.profilePage, this.groupProfilePagesService);
		if (!response) {
			this.alert.error('Something went wrong, please try again !', '');
		}
		if (this.onboardingPreview) {
			await this.groupProfilePagesService.updateGroupProfileDraft({
				id: this.profilePage.id,
				groupId: this.profilePage.groupId,
				stage: OnboardingStageEnum.COMPLETED
			});
			const successPublishUrl = this.isPitch ? 'pitch' : 'profile';
			const url =
				'/group-admin/campaigns/' +
				this.profilePage?.groupId +
				'/profile-pages/' +
				this.profilePage?.id +
				'/success-publish/' +
				successPublishUrl;
			this.router.navigateByUrl(url);
		}
		this.isSaveInProgress = false;
	}

	onboardingPublish(element) {
		this.recordButtonClick(
			element,
			null,
			null,
			{
				immediate_publish: true,
				onboarding_type: this.isPitch ? 'pitch' : 'profile',
				internal_page: true
			},
			this.profilePage
		);
		this.publishProfilePage();
	}

	scrollToSection(event) {
		event.preventDefault();
		var dataHref = event.currentTarget.attributes.datahref.nodeValue;
		$('.nav-link-wrap li a').removeClass('active');
		event.currentTarget.classList.add('active');
		$('html, body').animate(
			{
				scrollTop: $('#' + dataHref).offset().top - 120
			},
			500
		);
	}

	getFlexInfoForBanner(type) {
		let flexValue = '2.5';
		switch (type) {
			case 'NoReviewsBanner':
				flexValue = '2.5';
				break;
			case 'AddManualFieldBanner':
				flexValue = '2.5';
				break;
			case 'CreateBrandPitchBanner':
				flexValue = '3.5';
				break;
			case 'ConnectToConvosight':
				flexValue = '4.5';
				break;
			default:
				flexValue = '2.5';
				break;
		}
		return flexValue;
	}

	closePopup(event) {
		this.enableScrolling();
		this.openShareModal = false;
	}

	async handleDisplayReviewsSetting(showReviews: boolean) {
		this.profilePage.isReviewsSectionPreferenceChanged = true;
		this.profilePage.showReviews = showReviews;
		this.saveProfilePage();
	}
}
