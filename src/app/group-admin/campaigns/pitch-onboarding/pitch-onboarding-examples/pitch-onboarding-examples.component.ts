import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import $ from 'jquery';
import {BaseComponent} from '@sharedModule/components/base.component';
import {Subscription} from 'rxjs';
import {Lightbox, LightboxEvent, LIGHTBOX_EVENT} from 'ngx-lightbox';
import {GroupModel} from '@sharedModule/models/group.model';
// import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
// import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {takeUntil} from 'rxjs/operators';
import {getGroupProfileReviewsResponse} from '@sharedModule/models/graph-ql.model';
import {AlertTypeEnum} from '@sharedModule/enums/alert-type.enum';
import {AlertService} from '@sharedModule/services/alert.service';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {ProfilePageDetailsComponent} from '@groupAdminModule/campaigns/profile-pages/details/profile-page-details.component';

@Component({
	selector: 'app-pitch-onboarding-examples',
	templateUrl: './pitch-onboarding-examples.component.html',
	styleUrls: ['./pitch-onboarding-examples.component.scss']
})
export class PitchOnboardingExamplesComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
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
	showShareModal = false;
	currentBrand: string = 'pitch-nutrition';
	hideSeeMoreBtn: boolean = false;
	showFullDescription: boolean = false;
	selectedPills = 0;
	private _subscription: Subscription;
	readonly route: ActivatedRoute;

	featureNutritionConversations = [
		{
			topicName: 'Nutrition brand Campaign',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/1343435782401455_4735376946540638.png',
					title: 'Admin Post'
				},
				{
					screenShotUrl:
						'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/1343435782401455_4746105635467769.png',
					title: 'UGC by members'
				},
				{
					screenShotUrl:
						'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/1343435782401455_4752778108133855.png',
					title: 'Admin Post'
				}
			]
		},
		{
			topicName: 'Nutrition and diet',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/456a54e3-1a63-4305-9fc3-a1ae83b56a2f_1649154382571.53',
					title: 'Baby diet'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/87c8f996-dbe5-4485-98d6-d7ca750ae9f3_1649154403154.55',
					title: 'Baby diet'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/1a20f70c-105d-427e-a6da-eaa61e45885a_1649154418589.55',
					title: 'Baby diet'
				}
			]
		}
	];

	featureParentingConversations = [
		{
			topicName: 'Parenting brands Campaign',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/1343435782401455_4735376946540638.png',
					title: 'Admin Post'
				},
				{
					screenShotUrl:
						'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/1343435782401455_4746105635467769.png',
					title: 'UGC by members'
				},
				{
					screenShotUrl:
						'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/1343435782401455_4752778108133855.png',
					title: 'Admin Post'
				}
			]
		},
		{
			topicName: 'Parenting Polls in group',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/0a403ab9-782a-461b-b4ef-1c7b30ca194e_1649153189375.34',
					title: 'Admin Post'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/2ed4fcb5-af39-4d72-b65a-eaf7f4833919_1649153197921.35',
					title: 'UGC by members'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/18c002c9-6639-4564-92fb-2c5514a9addc_1649153268148.37',
					title: 'Admin Post'
				}
			]
		},
		{
			topicName: 'Nutrition and diet',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/456a54e3-1a63-4305-9fc3-a1ae83b56a2f_1649154382571.53',
					title: 'Baby diet'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/87c8f996-dbe5-4485-98d6-d7ca750ae9f3_1649154403154.55',
					title: 'Baby diet'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/1a20f70c-105d-427e-a6da-eaa61e45885a_1649154418589.55',
					title: 'Baby diet'
				}
			]
		},
		{
			topicName: 'Skin care discussions',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/28989a67-4abc-4e27-9e47-2c773fa611fa_1649157111315.30',
					title: 'Skin Care tips'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/0884e407-8da3-4455-817c-485b79258223_1649157130291.30',
					title: 'Skin Care challenges'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/c86fac04-48da-47e3-9ba3-8a5cea623f52_1649157195491.29',
					title: 'Skin Care tips'
				}
			]
		}
	];

	featureHealthcareConversations = [
		{
			topicName: 'Discussions on health',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/af50752b-6225-446f-89e3-32a3e75bddcf_1649153980903.49',
					title: 'Health tips'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/a58427e2-ae85-4007-95a6-f0b3fe0daaa0_1649153988768.48',
					title: 'Health tips'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/fc14d2c7-425c-48e4-91cb-e6ffe32ea807_1649154019045.48',
					title: 'Health tips'
				}
			]
		},
		{
			topicName: 'Nutrition and diet',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/456a54e3-1a63-4305-9fc3-a1ae83b56a2f_1649154382571.53',
					title: 'Baby diet'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/87c8f996-dbe5-4485-98d6-d7ca750ae9f3_1649154403154.55',
					title: 'Baby diet'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/1a20f70c-105d-427e-a6da-eaa61e45885a_1649154418589.55',
					title: 'Baby diet'
				}
			]
		},
		{
			topicName: 'Exercise tips',
			screenShots: [
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/c3196939-a3a8-4aaa-815c-2bb2ab48fea2_1649155638500.15',
					title: 'Exercise tips'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/4d83536c-1b01-4c16-a557-f351429f2cd0_1649155652194.15',
					title: 'Weight loss excercise'
				},
				{
					screenShotUrl:
						'https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/399fda66-c9c8-4d79-9838-3080e53def19_1649155675948.15',
					title: 'Exercise tips'
				}
			]
		}
	];

	defaultConversation = {
		'pitch-nutrition': this.featureNutritionConversations,
		'pitch-parenting': this.featureParentingConversations,
		'pitch-healthcare': this.featureHealthcareConversations
	};

	conversation = this.featureNutritionConversations[this.selectedPills];

	constructor(
		private readonly lightbox: Lightbox,
		private readonly groupProfilePages: GroupProfilePagesService,
		private alertService: AlertService,
		private _lightboxEvent: LightboxEvent,
		injector: Injector
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	changeSection(event) {
		event.preventDefault();
		this.currentBrand = event.currentTarget.attributes.datahref.nodeValue;

		this.conversation = this.defaultConversation[this.currentBrand][0];
		this.selectedPills = 0;

		$('.nav-link-wrap li a').removeClass('active');
		event.currentTarget.classList.add('active');
	}

	selectConversationToDisplay(conv, index) {
		this.selectedPills = index;
		this.conversation = conv;
	}

	openImageGallery(element, index, convScreenshot) {
		this.recordButtonClick(element, null, null, null);
		this.disableScrolling();
		this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(event => this._onReceivedEvent(event));

		const previewImages = convScreenshot.map(e => {
			return {src: e.screenShotUrl};
		});
		this.lightbox.open(previewImages, index, {
			centerVertically: false,
			enableTransition: false,
			resizeDuration: '0',
			disableScrolling: false,
			fitImageInViewPort: false
		});
		setTimeout(() => {
			this.setOtherElement(index);
		});
	}

	setOtherElement(index) {
		// Create a Div ELement
		const newDiv = document.createElement('div');
		newDiv.classList.add('screenshot-description-wrap');

		// Create a new H6 Topic element
		const newH6 = document.createElement('h6');
		newH6.append(this.conversation.topicName);
		newH6.className = 'top-section';

		newH6.style.color = '#fff';

		// Check and create Input Element
		// if (this.conversation.screenShots[0].title) {
		const newInput = document.createElement('div');
		newInput.innerHTML = this.conversation?.screenShots[0]?.title;
		newInput.hidden = !this.conversation.screenShots[0].title;
		newInput.id = 'title-name';
		newInput.className = 'screenshot-description';
		newDiv.append(newInput);
		// }

		// Get the child node info
		//const imageNode = document.getElementById('image');
		const outerContainerNode = document.getElementById('outerContainer');
		const containerNode = document.getElementById('container');
		containerNode.classList.add('screenshot-wrap');

		// Create parent node to put element
		const outerContainerParentNode = outerContainerNode.parentNode;
		//const imageParentNode = imageNode.parentNode;

		// update the DOM
		outerContainerNode.classList.add('screenshot-container');
		outerContainerParentNode.insertBefore(newH6, outerContainerNode);
		outerContainerParentNode.insertBefore(newDiv, outerContainerNode);
	}

	private _onReceivedEvent(event: any): void {
		// event CLOSED is fired
		if (event.id === LIGHTBOX_EVENT.CLOSE) {
			this._subscription.unsubscribe();
			this.enableScrolling();
			this.lightbox.close();
		}
		if (event.id === LIGHTBOX_EVENT.CHANGE_PAGE) {
			// Pick the title and update as per the number
			const titleNode = document.getElementById('title-name');
			titleNode.innerHTML = this.conversation.screenShots[event.data].title;
			titleNode.hidden = !this.conversation.screenShots[event.data].title;
		}
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Group Pitch Onboarding Examples', 'GA - Group Pitch Onboarding Examples');
		this.route.params.subscribe(params => {
			this.projectId = params['profileId'];
		});
		this.conversation = this.featureNutritionConversations[0];

		this.groupProfilePages.selectedGroupForProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(group => {
			this.processSelectedGroup(group);
		});
	}

	openCreatePitchModal() {
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
