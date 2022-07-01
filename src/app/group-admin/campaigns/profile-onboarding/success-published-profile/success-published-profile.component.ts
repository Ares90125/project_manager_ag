import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProfilePageDetailsComponent} from '@groupAdminModule/campaigns/profile-pages/details/profile-page-details.component';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AnimationOptions} from 'ngx-lottie';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {getGroupProfileReviewsResponse} from '@sharedModule/models/graph-ql.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-success-published-profile',
	templateUrl: './success-published-profile.component.html',
	styleUrls: ['./success-published-profile.component.scss']
})
export class SuccessPublishedProfileComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	@Input() type;
	@Input() isPitch: boolean = false;
	title: string = '';
	showShareModal = false;
	isCopied = false;
	successAnimationOption: AnimationOptions = {
		path: './assets/json/success-animation.json',
		loop: false
	};

	isLoading = true;
	group: GroupModel;
	loaderCount = [0, 1, 2];
	profilePages: GroupProfilePageModel[];
	reviewsResp: getGroupProfileReviewsResponse | null = null;
	commonProfilePage: GroupProfilePageModel;
	selectedProfilePageForDuplication;
	selectedProfilePageForNameUpdate;
	isUpdateRequestInProgress: boolean = false;
	openShareModal = false;
	openReviewsModal = false;
	copyUrl: string = '';
	averageRating: number = 0;
	ratingCount: number = 0;
	isPageNameExist: boolean = false;
	isPageLimitExceeded: boolean = false;

	projectId: string = '';
	currentBrand: string = 'pitch-nutrition';
	hideSeeMoreBtn: boolean = false;
	showFullDescription: boolean = false;
	selectedPills = 0;
	private _subscription: Subscription;
	readonly route: ActivatedRoute;

	constructor(private readonly groupProfilePages: GroupProfilePagesService, injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.isCopied = false;
		if (!this.isPitch) {
			this.title = 'Here’s your group profile URL';
		} else {
			this.title = 'Share this bio';
		}
		this.groupProfilePages.selectedGroupForProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(group => {
			this.processSelectedGroup(group);
		});
	}

	copyToClipboard(url: string) {
		this.isCopied = true;
		this.appService.copyToClipboard(url);
	}

	processCopyText(element) {
		this.recordButtonClick(
			element,
			null,
			null,
			{
				onboarding_type: this.isPitch ? 'pitch' : 'profile',
				copy_within_onboarding: true
			},
			this.profilePage
		);
		this.logger.info(
			'button_clicked',
			{
				button_cs_id: '18e37796-17bf-4448-863f-14522a7c2e12',
				button_label: 'Copy Field',
				share_from: this.type,
				source: 'dialog',
				default_profile: this.profilePage.isDefaultProfile
			},
			'ShareWidgetComponent',
			'processCopyText',
			LoggerCategory.ClickStream
		);
	}

	whyShareModalOpen(element) {
		this.recordButtonClick(element, null, null, null, this.profilePage);
		this.showShareModal = true;
	}

	whyShareModalClose(element) {
		this.recordButtonClick(element, null, null, null, this.profilePage);
		this.showShareModal = false;
	}

	shareUrl(type) {
		let shareLink: string;
		switch (type) {
			case 'facebook':
				shareLink = `http://www.facebook.com/sharer/sharer.php?u=${this.profilePage.profileUrl}`;
				break;
			case 'whatsapp':
				shareLink = `https://api.whatsapp.com/send?text=${this.profilePage.profileUrl}`;
				break;
			case 'linkedIn':
				shareLink = `https://www.linkedin.com/shareArticle?url=${this.profilePage.profileUrl}&title=${this.profilePage.profileUrl}`;
				break;
			case 'twitter':
				shareLink = `https://twitter.com/share?url=${this.profilePage.profileUrl}`;
				break;
			case 'email':
				shareLink = `mailto:?subject=${this.profilePage.profileUrl}&body=${this.profilePage.profileUrl}&title="${this.profilePage.profileUrl}"`;
				break;
		}

		window.open(shareLink, '_blank');
	}

	openCreatePitchModal(element) {
		this.recordButtonClick(element, null, null, null, this.profilePage);
		this.selectedProfilePageForDuplication = this.commonProfilePage;
	}

	closeCreatePitchModal() {
		this.selectedProfilePageForDuplication = null;
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

	async createBrandPitch(name: string, closeButtonForDuplicationModal: any) {
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

	async processSelectedGroup(group: GroupModel) {
		if (!group) {
			return;
		}
		this.isLoading = true;
		this.group = group;
		await this.group.listProfilePages(this.groupProfilePages);

		this.group.groupProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(async profilePages => {
			this.profilePages = profilePages;

			this.commonProfilePage = this.profilePages.filter(page => page.isDefaultProfile)[0];
			this.isLoading = false;
		});
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
}
