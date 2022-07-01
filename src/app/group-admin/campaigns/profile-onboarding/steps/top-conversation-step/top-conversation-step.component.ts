import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FileSizeEnum} from '@sharedModule/enums/file-size.enum';
import {
	FeatureConversationInput,
	OnboardingStageEnum,
	ProfilePublishStatusEnum
} from '@sharedModule/models/graph-ql.model';
import {UserModel} from '@sharedModule/models/user.model';
import {FileService} from '@sharedModule/services/file.service';
import {UserService} from '@sharedModule/services/user.service';
import _ from 'lodash';
import {Lightbox, LightboxEvent, LIGHTBOX_EVENT} from 'ngx-lightbox';
import {title} from 'process';
import {Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-top-conversation-step',
	templateUrl: './top-conversation-step.component.html',
	styleUrls: ['./top-conversation-step.component.scss']
})
export class TopConversationsStepComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Input() isPitch: boolean = false;
	@Input() groupState: string;
	@Input() resetHook: EventEmitter<boolean>;
	@Output() showPublishedButton = new EventEmitter<boolean>();
	@Output() letOpenSkipModal = new EventEmitter<boolean>();

	@Output() nextStep = new EventEmitter();
	@Output() prevStep = new EventEmitter();
	@Input() isSkipModalOpen: boolean = false;

	showEditFeatureConversation = false;
	stageFetching: boolean = true;
	showAddFeatureTopic = false;
	showDeleteConversationModal = false;
	topicForm: FormGroup;
	postUrlForm: FormGroup;
	featureConversations: FeatureConversationInput[] = [];
	conversation: FeatureConversationInput = {};
	uploadFileError = false;
	uploadTypeError = false;
	uploading = false;
	uploadViaPostUrl = false;
	showPostUrlField = false;
	showSampleConversations = false;
	isRegexMatched;
	user: UserModel;
	fbPermLinkRegex =
		/^(https)?(:\/\/)?((www|m)\.)?facebook.com\/groups\/[a-z|A-Z|0-9|.|_]*\/(permalink|posts)\/[0-9]*[\/]{0,1}$/;
	showErrorOnPostUrlForm = false;
	postUrlState = 'initialState';
	private _subscription: Subscription;
	isLoading = true;
	showDeleteScreenshotPopup = false;
	extraRecordEventData = {};
	selectedIndex;
	selectedConvScreenshotIndex;
	isSaveInProgress;
	previewImage;
	selectedPills = 0;
	selectedSamplePills = 0;
	initialVisibilityValue;
	initialValue: any = [];
	validExtensions = ['jpeg', 'jpg', 'png'];
	sampleConversations = [
		[
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_1.png'
			},
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_2.png'
			},
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_3.png'
			}
		],
		[
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_4.png'
			},
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_5.png'
			},
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_6.png'
			}
		],
		[
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_7.png'
			},
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_8.png'
			},
			{
				screenShotUrl: 'assets/images/sample_screenshots/sample_screenshot_9.png'
			}
		]
	];
	constructor(
		injector: Injector,
		private formBuilder: FormBuilder,
		private fileService: FileService,
		private groupProfilePageService: GroupProfilePagesService,
		readonly userService: UserService,
		private readonly lightbox: Lightbox,
		private _lightboxEvent: LightboxEvent
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.isSaveInProgress = true;
		const {stage} = await this.groupProfilePageService.updateGroupProfileDraft({
			id: this.groupProfilePage.id,
			groupId: this.groupProfilePage.groupId,
			stage: OnboardingStageEnum.CONVERSATIONS
		});
		this.groupProfilePage.stage = stage;
		this.stageFetching = false;

		this.user = await this.userService.getUser();
		this.featureConversations = _.cloneDeep(this.groupProfilePage.featureConversations) ?? [];
		this.extraRecordEventData = this.featureConversations?.reduce(
			(acc, topic, index) => ({
				...acc,
				[`conversation_name_${index + 1}`]: topic.topicName,
				[`screenshot_count_${index + 1}`]: topic.screenShots.length || 0
			}),
			{}
		);

		if (this.isEditable) {
			this.conversation = this.featureConversations[0] ?? {};
			this.selectedPills = 0;
		} else {
			this.selectedPills = this.featureConversations.findIndex(conv => conv.showConversation);
			this.conversation = this.featureConversations.filter(conv => conv.showConversation)[0];
		}
		this.initialVisibilityValue = this.groupProfilePage.showFeatureConversation;
		this.initialValue = _.cloneDeep(this.groupProfilePage.featureConversations ?? []);
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.isSaveInProgress = false;
		});

		this.isLoading = false;
	}

	closeSkipModal() {
		this.isSkipModalOpen = false;
	}

	async nextStepHandler() {
		if (!this.isPitch && this.featureConversations.length === 0) {
			this.isSkipModalOpen = true;
			return;
		}
		this.nextStep.next(true);
	}

	prevStepHandler() {
		this.prevStep.next(true);
	}

	getConversationForPublicPage() {}

	async onChangeFeatureConversation() {
		this.groupProfilePage.showFeatureConversation = !this.groupProfilePage.showFeatureConversation;
		this.isSaveInProgress = true;

		await this.groupProfilePageService.updateGroupProfileDraft({
			id: this.groupProfilePage.id,
			groupId: this.groupProfilePage.groupId,
			showFeatureConversation: this.groupProfilePage.showFeatureConversation,
			publishedStatus: ProfilePublishStatusEnum.DRAFT
		});
		this.showPublishedButton.next(true);
		this.isSaveInProgress = false;
	}

	recordConversationsCommonEvent(element) {
		this.recordButtonClick(
			element,
			null,
			null,
			{
				current_step: 3,
				onboarding_type: this.isPitch ? 'pitch' : 'profile',
				...this.extraRecordEventData
			},
			this.groupProfilePage
		);
	}

	showEditFeaturePopup(element) {
		this.recordConversationsCommonEvent(element);
		this.disableScrolling();
		this.featureConversations = _.cloneDeep(this.groupProfilePage.featureConversations) ?? [];
		this.showEditFeatureConversation = true;
	}

	closeAllFeaturePopup(element) {
		this.recordConversationsCommonEvent(element);
		this.enableScrolling();
		this.showEditFeatureConversation = false;
		this.reset();
		this.resetInitialValue();
	}

	showAddTopicModal(element) {
		this.recordConversationsCommonEvent(element);
		this.disableScrolling();
		this.conversation = {};
		this.buildTopicForm();
		this.selectedIndex = null;
		this.showAddFeatureTopic = true;
		this.showEditFeatureConversation = false;
	}

	editTopicModel(element, index) {
		this.recordConversationsCommonEvent(element);
		this.selectedIndex = index;
		this.disableScrolling();
		this.conversation = this.featureConversations[index] ?? {};

		this.buildTopicForm();
		this.showAddFeatureTopic = true;
		this.showEditFeatureConversation = false;
	}

	async deleteTopicModel(element, index) {
		this.recordConversationsCommonEvent(element);
		// delete the topic
		this.conversation = !index ? null : this.featureConversations[0];
		this.showEditFeatureConversation = true;
		this.featureConversations.splice(index, 1);
		this.isSaveInProgress = true;
		const showFeatureConversation = this.featureConversations.length === 0 ? false : true;
		await this.groupProfilePageService.updateGroupProfileDraft({
			groupId: this.groupProfilePage.groupId,
			featureConversations: this.featureConversations,
			id: this.groupProfilePage.id,
			showFeatureConversation: showFeatureConversation,
			publishedStatus: ProfilePublishStatusEnum.DRAFT
		});
		this.extraRecordEventData = {
			conversation_topics: this.featureConversations?.map(topic => ({
				topic_name: topic.topicName,
				screenshot_count: topic.screenShots.length || 0
			}))
		};
		this.showPublishedButton.next(true);
		this.updateFeatureConvInput(this.featureConversations, showFeatureConversation);
		this.isSaveInProgress = false;
		this.selectedPills = 0;
		this.conversation = this.featureConversations[this.selectedPills];
		this.showDeleteConversationModal = false;
		this.enableScrolling();
		this.selectedIndex = null;
	}

	openDeleteTopicConfirmation(element, index) {
		this.recordConversationsCommonEvent(element);
		this.disableScrolling();
		// open the delete confirmation
		this.showEditFeatureConversation = false;
		this.showDeleteConversationModal = true;
		this.selectedIndex = index;
		this.conversation = this.featureConversations[index];
	}

	closeDeleteTopicModal(element) {
		this.recordConversationsCommonEvent(element);
		this.enableScrolling();
		this.showDeleteConversationModal = false;
	}

	changeInTitle(event, index) {
		this.conversation.screenShots[index].title = event;
	}

	openSampleConversations(element) {
		this.recordConversationsCommonEvent(element);
		this.showSampleConversations = true;
	}

	closeSampleConversations(element) {
		this.recordConversationsCommonEvent(element);
		this.showSampleConversations = false;
	}

	openDeleteScreenshot(element, index) {
		this.recordConversationsCommonEvent(element);
		this.showDeleteScreenshotPopup = true;
		this.selectedConvScreenshotIndex = index;
	}

	deleteScreenshot(element) {
		this.recordConversationsCommonEvent(element);
		this.conversation.screenShots.splice(this.selectedConvScreenshotIndex, 1);
	}

	updateFeatureConversationChanges(element) {
		this.recordConversationsCommonEvent(element);
		this.enableScrolling();
		this.showEditFeatureConversation = false;
		this.reset();
		this.resetInitialValue();
	}

	closeErrorOverlay(event) {
		this.enableScrolling();
		this.uploadFileError = false;
		this.uploadTypeError = false;
	}

	showPostUrlSection(element) {
		this.recordConversationsCommonEvent(element);
		this.postUrlState = 'initialState';
		this.buildPostUrlForm();
		this.showPostUrlField = true;
	}

	buildTopicForm() {
		this.topicForm = this.formBuilder.group({
			topic: [this.conversation?.topicName ?? '', [Validators.required]]
		});
	}

	buildPostUrlForm() {
		this.postUrlForm = this.formBuilder.group({
			postUrl: ['', [Validators.required]]
		});
	}

	async processMetaInfo(event) {
		let data = (event.target as HTMLInputElement).value.trim();
		if (!this.conversation?.screenShots) {
			this.conversation.screenShots = [];
		}
		this.postUrlState = 'processingState';
		this.showErrorOnPostUrlForm = false;
		// check if regex mataches
		this.isRegexMatched = String(data).match(this.fbPermLinkRegex);
		if (!this.isRegexMatched) {
			this.showErrorOnPostUrlForm = true;
			this.postUrlState = 'initialState';
			return;
		}
		const sourceId = await this.getGroupPostIdFormat(data);
		const result = await this.groupProfilePageService.getScreenshotsFromPostIds(
			{sourceId: sourceId, commentEnable: false},
			await this.userService.getCurrentSessionJWTToken()
		);
		if (!result || result.error || result.errorMessage) {
			this.postUrlState = 'errorState';
			return;
		}
		this.postUrlState = 'successState';

		setTimeout(() => {
			this.conversation.screenShots.push({
				title: '',
				screenShotUrl: result.location
			});
			// move to initial state
			this.showPostUrlField = false;
		}, 1600);
	}

	getGroupPostIdFormat(fbPermLink) {
		const link = fbPermLink.split('/');
		const index = link.findIndex(e => e === 'posts' || e === 'permalink');
		return `${link[index - 1]}_${link[index + 1]}`;
	}

	async fileChange(event: any) {
		this.uploadFileError = false;
		this.uploadTypeError = false;
		const file = (<HTMLInputElement>event.target).files[0];
		const extension = file.name.split('.').pop().toLocaleLowerCase();

		if (!file.type.includes('image')) {
			this.uploadTypeError = true;
			return;
		} else {
			if (!this.validExtensions.includes(extension)) {
				this.uploadTypeError = true;
				return;
			}
		}
		if (file.size > FileSizeEnum.THREE_HUNDRED_MB) {
			this.uploadFileError = true;
			return;
		}
		this.uploading = true;
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = _event => {
			this.previewImage = reader.result;
		};
		if (!this.conversation.screenShots) {
			this.conversation.screenShots = [];
		}
		const uploadedFileLink = await this.fileService.uploadToS3(file, 'image', this.randomUuid());
		this.previewImage = false;
		this.conversation.screenShots.push({
			title: '',
			screenShotUrl: uploadedFileLink
		});
		this.uploading = false;
	}

	openImageGallery(element, index, convScreenshot) {
		this.recordConversationsCommonEvent(element);
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
			if (!titleNode) {
				return;
			}
			titleNode.innerHTML = this.conversation?.screenShots[event.data].title || '';
			titleNode.hidden = !this.conversation?.screenShots[event.data].title;
		}
	}

	selectConversationToDisplay(conv, index, element = null) {
		if (element) {
			this.recordConversationsCommonEvent(element);
		}
		this.selectedPills = index;
		this.conversation = conv;
	}

	selectSampleConvToDisplay(e, index) {
		this.recordConversationsCommonEvent(e);
		this.selectedSamplePills = index;
	}

	async onIndividualConversationToggle(index) {
		this.featureConversations[index].showConversation = !this.featureConversations[index].showConversation;
		// check if all the featureConversation is hidden then hide the conversation from public page and disabled the slider

		const enabledFeatureConv = this.featureConversations[index].showConversation;
		const enabledConvLength = this.featureConversations.filter(e => e.showConversation).length;
		this.isSaveInProgress = true;
		this.conversation = this.featureConversations[index];
		if (enabledConvLength === 0) {
			await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.groupProfilePage.id,
				groupId: this.groupProfilePage.groupId,
				featureConversations: this.featureConversations,
				showFeatureConversation: false
			});
			this.updateFeatureConvInput(this.featureConversations, false);
		} else {
			const showFeatureConversation =
				enabledFeatureConv && enabledConvLength === 1 ? true : this.groupProfilePage.showFeatureConversation;
			await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.groupProfilePage.id,
				groupId: this.groupProfilePage.groupId,
				featureConversations: this.featureConversations,
				showFeatureConversation: showFeatureConversation
			});
			this.updateFeatureConvInput(this.featureConversations, showFeatureConversation);
		}
		this.showPublishedButton.next(true);
		this.isSaveInProgress = false;
	}

	async saveConversation(element) {
		this.recordConversationsCommonEvent(element);
		this.enableScrolling();
		if (this.topicForm.invalid || (this.conversation?.screenShots && this.conversation.screenShots.length === 0)) {
			this.reset();
			this.showEditFeatureConversation = true;
			return;
		}

		const topicData = this.topicForm.getRawValue();
		this.conversation.topicName = topicData.topic;

		if (!this.selectedIndex && this.selectedIndex !== 0) {
			this.conversation.showConversation = true;
			this.featureConversations.push(this.conversation);
		} else {
			this.conversation.showConversation = true;
			this.featureConversations[this.selectedIndex] = this.conversation;
		}

		await this.groupProfilePageService.updateGroupProfileDraft({
			groupId: this.groupProfilePage.groupId,
			featureConversations: this.featureConversations,
			id: this.groupProfilePage.id,
			showFeatureConversation: true,
			publishedStatus: ProfilePublishStatusEnum.DRAFT
		});
		this.extraRecordEventData = {
			conversation_topics: this.featureConversations?.map(topic => ({
				topic_name: topic.topicName,
				screenshot_count: topic.screenShots.length || 0
			}))
		};

		this.showPublishedButton.next(true);

		this.updateFeatureConvInput(this.featureConversations, true);
		this.showEditFeatureConversation = true;
		this.reset();
	}

	updateFeatureConvInput(featureConversation, showFeatureConversation) {
		this.groupProfilePage.featureConversations = featureConversation;
		this.groupProfilePage.showFeatureConversation = showFeatureConversation;
	}

	backToEditFeaturePopup(element) {
		this.recordConversationsCommonEvent(element);
		this.selectedIndex = null;
	}

	reset() {
		this.postUrlState = 'initialState';
		this.showPostUrlField = false;
		this.showAddFeatureTopic = false;
		this.showDeleteScreenshotPopup = false;
		this.showErrorOnPostUrlForm = false;
		this.selectedIndex = null;
		// Show the first pills whenever user comes back to page
		if (this.featureConversations.length !== 0) {
			this.selectConversationToDisplay(this.featureConversations[0], 0);
		}
	}

	resetInitialValue() {
		this.initialVisibilityValue = this.groupProfilePage.showFeatureConversation;
		this.initialValue = _.cloneDeep(this.featureConversations);
	}

	isSaveEnabled() {
		return (
			this.initialVisibilityValue !== this.groupProfilePage.showFeatureConversation ||
			JSON.stringify(this.initialValue) !== JSON.stringify(this.featureConversations)
		);
	}

	noOfConversationEnabled(): number {
		return this.groupProfilePage?.featureConversations?.filter(conv => conv.showConversation).length;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
