import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Injector,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {PostRecommendationModel} from '@groupAdminModule/models/post-recommendation.model';
import {Location} from '@angular/common';
import {UserModel} from '@sharedModule/models/user.model';
import {FacebookPostModel, PostContentTypeEnum, PostStatusEnum} from '@groupAdminModule/models/facebook-post.model';
import {Subscription} from 'rxjs';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FileService} from '@sharedModule/services/file.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {UserService} from '@sharedModule/services/user.service';
import {CheckSuggestionModel} from '@groupAdminModule/models/check-suggestion.model';
import {PushNotificationService} from '@sharedModule/services/push-notification.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import * as _ from 'lodash';
import {CustomPostTextAreaComponent} from '@sharedModule/components/custom-post-text-area/custom-post-text-area.component';
import {DateTime} from '@sharedModule/models/date-time';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Component({
	selector: 'app-post-composer',
	templateUrl: './post-composer.component.html',
	styleUrls: ['./post-composer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComposerComponent extends BaseComponent implements OnInit, OnDestroy {
	@ViewChild('selectAllGroups')
	publishInProgress = false;
	cancelInProgress = false;
	scheduleInProgress = false;
	isTypeRepost = false;
	user: UserModel;
	installedGroups: GroupModel[];
	group: GroupModel;
	numOfGroupSelected: number;
	recommededEmotions: any[] = null;
	hashParam;
	title;
	postMessage = '';
	nextBestTimeRecommendation: PostRecommendationModel;
	previewImage = [];
	imageFiles = [];
	isPosting = false;
	videoFiles = [];
	showSpinner = false;
	initialGroupId;
	numOfEmotionsToShow = 3;
	@ViewChild('file') fileUpl: ElementRef;
	postType = 'direct';
	isPostEdited: false;
	recommendation: PostRecommendationModel;
	enablePublishPostButton = false;
	groupId;
	selectedGroups = {};
	installedGroupsWithRoleAdmin: GroupModel[];
	selectedPostOption = 'Publish now';
	loadingSuggestions;
	protected subscriptionsToDestroy: Subscription[] = [];
	showAlert = false;
	alertMessage = {heading: '', content: ''};
	selectedPostingOption: string;
	recommendedTimeFromUrl: any;
	recommendedDateFromUrl: string;
	postToBeEdited;
	suggestionMatched: number;
	totalSuggestion: number;
	cancelButtonClicked: false;
	isTimeSuggestionMet = false;
	SuggestionChecked: CheckSuggestionModel;
	postPublishTime;
	toBeShownTime;
	showPostDelayPopup = false;
	minPostDelayTime: number = 0;
	maxPostDelayTime: number = 0;
	daysCountOfCampaign = 0;
	postToBeReShared;
	postIdFromUrl;
	showPublishSuggestionPopup = false;
	nextBestTimeAfterPublishIsClicked;
	nextBestTimeToBeShownAfterPublishIsClicked;
	suggestedTimePopupShownCounter;
	showTemplateModal = false;
	@ViewChild(CustomPostTextAreaComponent) customPostTextAreaComponent: CustomPostTextAreaComponent;
	loaderBodyText: string;
	loaderPopupWithSpinner: boolean = true;
	numOfPostPosted = 0;
	totalPostToBePosted = 0;
	percentageValueForProgressBar = 0;
	showPermissionRequired = false;

	constructor(
		injector: Injector,
		private groupService: GroupsService,
		private route: ActivatedRoute,
		public publishService: PublishService,
		private fileService: FileService,
		private facebookService: FacebookService,
		private userService: UserService,
		private readonly securedStorageProvider: SecuredStorageProviderService,
		private pushNotificationService: PushNotificationService,
		private readonly router: Router,
		public location: Location,
		private readonly cd: ChangeDetectorRef
	) {
		super(injector);
	}
	async ngOnInit() {
		super._ngOnInit();
		window.localStorage.getItem('numTimeSuggestedTimePopupShown')
			? (this.suggestedTimePopupShownCounter = window.localStorage.getItem('numTimeSuggestedTimePopupShown'))
			: (this.suggestedTimePopupShownCounter = '1');
		this.groupId = this.route.snapshot.params.groupId;
		if (!this.groupId) {
			this.subscriptionsToDestroy.push(
				this.publishService.selectedGroup.subscribe(group => {
					this.groupId = group['id'];
					this.group = group;
				})
			);
		}
		this.route.queryParams.subscribe(params => {
			this.recommendedTimeFromUrl = params['time'];
			this.recommendedDateFromUrl = new DateTime(params['date'], 'DD/MM/YYYY').format('MM/DD/YYYY');
			this.postIdFromUrl = params['postid'];
		});
		if (this.postIdFromUrl && this.postIdFromUrl != '') {
			await this.getPostFromPostId(this.groupId, this.postIdFromUrl);
		}
		this.postToBeEdited = this.publishService.postToBeEdited;
		this.initialGroupId = this.groupId;
		this.subscriptionsToDestroy.push(
			this.groupService.groups.subscribe(async groups => {
				if (groups === null) {
					return;
				}
				if (!groups) {
					return;
				}
				this.installedGroups = groups.filter(group => group.state === GroupStateEnum.Installed);
				this.installedGroupsWithRoleAdmin = this.installedGroups.filter(group => group.role !== 'Moderator');
				this.recommendation = this.publishService.recommendation;
				this.group = await new GroupModel(this.installedGroups.find(grp => grp.id === this.groupId));
				this.checkIfPublishGivenForPost(this.group);
				this.selectedGroups[this.group.id] = this.group;
				this.numOfGroupSelected = 1;
				if (this.postToBeEdited) {
					this.loadDataForPostToBeEdited();
					this.selectedPostOption =
						this.postToBeEdited.scheduleOption === 'Publish now' ? this.postToBeEdited.scheduleOption : 'Custom';
					this.recommendation = JSON.parse(this.postToBeEdited.recomObject);
					if (this.recommendation && this.recommendation.emotions) {
						this.extractEmotions();
					}
					if (this.postToBeEdited.campaignTaskDetails) {
						this.daysCountOfCampaign = new DateTime(this.postToBeEdited.campaignTaskDetails.endDateAtUTC).diff(
							new DateTime(this.postToBeEdited.campaignTaskDetails.startDateAtUTC).dayJsObj,
							'days'
						);
					}
				}
				if (this.publishService.postToBeReShared) {
					this.postToBeReShared = this.publishService.postToBeReShared;
				}
				if (this.recommendation) {
					this.loadCheckSuggestFromRecommendation(this.recommendation);
					if (this.recommendation.emotions) {
						this.extractEmotions();
					}
				}
				if (
					this.selectedGroups !== {} &&
					(this.imageFiles?.length !== 0 ||
						this.videoFiles?.length !== 0 ||
						this.postMessage !== '' ||
						this.postToBeReShared)
				) {
					this.enablePublishPostButton = true;
				} else {
					this.enablePublishPostButton = false;
				}
				this.user = await this.userService.getUser();
			})
		);
		this.nextBestTimeRecommendation = this.publishService.nextBestTimeRecommendation;
	}

	async checkIfPublishGivenForPost(group) {
		const groupHasPostPermission = await this.facebookService.checkIfGroupLevelPostPermissionIsValid(group.fbGroupId);

		if (!groupHasPostPermission) {
			this.showPermissionRequired = true;
		}
	}

	cancelPublishPermission(event) {
		try {
			this.showPermissionRequired = false;
			if (this.location && this.location.getState()) {
				const locationState: any = this.location.getState();
				locationState.navigationId === 1 ? this.router.navigateByUrl(this.getRoutePath()) : this.location.back();
			}
		} catch (e) {
			this.router.navigateByUrl(`/group-admin/group/${this.groupId}/scheduledposts`);
		}
	}

	getRoutePath(): string {
		const url = this.location.path();
		if (url.includes('/group/')) {
			return `/group-admin/group/${this.groupId}/scheduledposts`;
		}
		return `/group-admin/publish/${this.groupId}/scheduledposts`;
	}

	getPostFromPostId(groupId, postId) {
		try {
			this.publishService.getPostFromPostId(groupId, postId).then(value => {
				const fbPostId = value.sourceId.split('_')[1];
				this.postToBeReShared = value;
				this.enablePublishPostButton = true;
				this.postToBeReShared.postCreatedAtUTC = new DateTime(value.createdatutc).local().format('YYYY-MM-DD HH:mm:ss');
				this.postToBeReShared.fbPermlink =
					'https://www.facebook.com/groups/' + value.parentSourceId + '/permalink/' + fbPostId + '/';
				if (this.postToBeEdited) {
					if (this.postToBeEdited.imageUrls?.length > 0) {
						this.postToBeReShared.photourl = this.postToBeEdited.imageUrls[0];
					}
					if (this.postToBeEdited.imageUrls?.length > 0) {
						this.postToBeReShared.videothumbnailurl = this.postToBeEdited.videoUrls[0];
					}
				}
			});
		} catch (e) {
			this.logger.debug(
				'getting post from post id failed',
				{
					groupIdFromUrl: groupId,
					postIdFromUrl: postId
				},
				'PostComposerComponent',
				'getPostFromPostId',
				LoggerCategory.AppLogs
			);
		}
	}

	async checkSuggestion(recom, type = 'default') {
		this.loadingSuggestions = true;
		if (this.recommendation) {
			if (type === 'default') {
				this.showSpinner = true;
				this.cancelButtonClicked = false;
			}
			const upadtedCheckRecomList = await this.makeitReadyForCheckSuggestAPI(recom);
			const res: any = await this.publishService.getSuggestionMet(upadtedCheckRecomList, this.groupId);
			this.suggestionMatched = 0;
			this.totalSuggestion = 0;
			this.showSpinner = false;

			if (res && Object.keys(res).length !== 0 && !this.cancelButtonClicked) {
				for (const key of Object.keys(res)) {
					if (key === 'contentType') {
						this.totalSuggestion += 1;
						if (res[key].flag) {
							this.suggestionMatched += 1;
						}
					}
					if (key === 'time') {
						this.isTimeSuggestionMet = false;
						this.totalSuggestion += 1;
						if (res[key].flag) {
							this.suggestionMatched += 1;
							this.isTimeSuggestionMet = true;
						}
					}
					if (key === 'optimumLength') {
						this.SuggestionChecked.optimumLengthResult = res[key];
						for (const optLen of Object.keys(res[key])) {
							this.totalSuggestion += 1;
							if (res[key][optLen].flag) {
								this.suggestionMatched += 1;
							}
						}
					}
					if (key === 'popularCategory') {
						for (const catKey of Object.keys(res[key])) {
							for (const key2 of res[key][catKey]) {
								this.totalSuggestion += 1;
								if (key2.flag) {
									this.suggestionMatched += 1;
								}
							}
							if (catKey === 'trendingTopics') {
								this.SuggestionChecked['topics'] = res[key][catKey];
							} else if (catKey === 'topCategories') {
								this.SuggestionChecked['categories'] = res[key][catKey];
							} else if (catKey === 'suggestedKeywords') {
								this.SuggestionChecked['keywords'] = res[key][catKey];
							}
						}
					}
					if (key === 'emotionAndTone') {
						for (const emo of Object.keys(res[key])) {
							for (let i = 0; i < this.recommededEmotions?.length; i++) {
								if (this.recommededEmotions[i].emotion === emo) {
									for (let y = 0; y < this.recommededEmotions[i].keywords?.length; y++) {
										this.totalSuggestion += 1;
										if (this.recommededEmotions[i].keywords[y].keyword === res[key][emo][y].value) {
											this.recommededEmotions[i].keywords[y].flag = res[key][emo][y].flag;
											if (res[key][emo][y].flag) {
												this.suggestionMatched += 1;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		this.loadingSuggestions = false;
	}

	getOptimumLength(optLen) {
		const optLength = {};
		if (optLen === null) {
			return null;
		} else {
			if (typeof optLen === 'string') {
				optLength['minWord'] = JSON.parse(optLen).minWord;
				optLength['minChar'] = JSON.parse(optLen).minChar;
			} else {
				optLength['minWord'] = optLen.minWord;
				optLength['minChar'] = optLen.minChar;
				optLength['maxWord'] = optLen.maxWord;
				optLength['maxChar'] = optLen.maxChar;
			}
			return optLength;
		}
	}

	getPopularCategory(recom) {
		const popularCat = {};
		if (recom.categories !== null && recom.categories.length !== 0) {
			popularCat['topCategories'] = recom.categories;
		}
		if (recom.keywords !== null && recom.keywords.length !== 0) {
			popularCat['suggestedKeywords'] = recom.keywords;
		}
		if (recom.topics !== null && recom.topics.length !== 0) {
			popularCat['trendingTopics'] = recom.topics;
		}
		if (Object.keys(popularCat).length === 0) {
			return null;
		} else {
			return popularCat;
		}
	}

	getEmotionAndTone(emo) {
		if (emo !== null) {
			const obj = {};
			for (const key of Object.keys(JSON.parse(emo))) {
				if (obj[key] === undefined) {
					obj[key] = [];
				}
				for (const key1 of JSON.parse(emo)[key]) {
					for (const key2 of Object.keys(key1)) {
						obj[key].push(key2);
					}
				}
			}
			return obj;
		} else {
			return null;
		}
	}

	async makeitReadyForCheckSuggestAPI(recom) {
		const checkRecomList = {
			inputString: this.postMessage ? this.postMessage : null,
			time: {
				expectedTime: recom.toBePostedAtUTCTicks,
				actualTime: this.postPublishTime
			},
			contentType: {
				expectedContentType: recom.contentType,
				actualContentType: await this.getPostContentType(this.postToBeEdited)
			},
			optimumLength: await this.getOptimumLength(recom.optLength),
			popularCategory: await this.getPopularCategory(recom),
			emotionAndTone: await this.getEmotionAndTone(recom.emotions)
		};
		if (checkRecomList.inputString === '' && checkRecomList.inputString === null) {
			delete checkRecomList.inputString;
		}
		if (checkRecomList.optimumLength === null || Object.keys(checkRecomList.optimumLength).length === 0) {
			delete checkRecomList.optimumLength;
		}
		if (checkRecomList.popularCategory === null) {
			delete checkRecomList.popularCategory;
		}
		if (checkRecomList.emotionAndTone === null) {
			delete checkRecomList.emotionAndTone;
		}
		return checkRecomList;
	}

	extractEmotions() {
		const emotions = JSON.parse(this.recommendation.emotions);
		this.recommededEmotions = [];
		for (const emotion in emotions) {
			if (emotions.hasOwnProperty(emotion)) {
				const emotionObj = {};
				emotionObj['emotion'] = emotion;
				emotionObj['keywords'] = [];
				emotions[emotion].forEach(keywordObj => {
					for (const word in keywordObj) {
						if (keywordObj.hasOwnProperty(word)) {
							emotionObj['keywords'].push({
								keyword: word,
								mentions: keywordObj[word],
								flag: false
							});
						}
					}
				});

				this.recommededEmotions.push(emotionObj);
			}
		}
	}

	postUpdate(event_original) {
		const event = _.cloneDeep(event_original);
		this.previewImage = event.previewImage;
		this.imageFiles = event.imageFiles;
		this.videoFiles = event.videoFiles;
		this.postMessage = event.postMessage;
		this.isPostEdited = event.isPostEdited;
		if (
			this.selectedGroups !== {} &&
			(this.imageFiles?.length !== 0 ||
				this.videoFiles?.length !== 0 ||
				this.postMessage !== '' ||
				this.postToBeReShared)
		) {
			this.enablePublishPostButton = true;
		} else {
			this.enablePublishPostButton = false;
		}
	}

	split(value, separator) {
		return value.split(separator);
	}

	toggleGroupSelection(event) {
		if (this.selectedGroups[event.group.id]) {
			if (event.group.id !== this.initialGroupId) {
				if (this.numOfGroupSelected !== 1) {
					delete this.selectedGroups[event.group.id];
					this.numOfGroupSelected -= 1;
				}
			}
		} else {
			this.selectedGroups[event.group.id] = event.group;
			this.numOfGroupSelected += 1;
		}
		if (this.renderedOn !== 'Mobile') {
			this.setGroupsSelected();
		}
	}

	toggleAllGroupSelection(value) {
		this.selectedGroups = {};
		if (value === 'checked') {
			this.selectedGroups[this.initialGroupId] = this.installedGroups.filter(
				group => group.id === this.initialGroupId
			)[0];
			this.numOfGroupSelected = 1;
		} else {
			this.installedGroups?.forEach(group => {
				this.selectedGroups[group.id] = group;
			});
			this.numOfGroupSelected = this.installedGroups?.length;
		}
		if (this.renderedOn !== 'Mobile') {
			this.setGroupsSelected();
		}
	}

	async multiGroupPost(element, isTriggeredFromButtonCLick) {
		this.isPosting = true;
		if (this.selectedPostOption !== 'Publish now' && this.postPublishTime <= new DateTime().unix()) {
			this.showAlert = true;
			this.alertMessage = {
				heading: 'Scheduled time can not be in past',
				content: 'Please select a future time for scheduling your post.'
			};
			this.isPosting = false;
			return;
		}
		if (isTriggeredFromButtonCLick) {
			this.recordButtonClick(element, this.group, this.selectedPostOption);
		}
		if (
			this.nextBestTimeToBeShownAfterPublishIsClicked &&
			this.selectedPostOption === 'Publish now' &&
			this.suggestedTimePopupShownCounter === '3'
		) {
			this.showPublishSuggestionPopup = true;
			this.isPosting = false;
			return;
		}
		const totalGroupsSelected = Object.keys(this.selectedGroups).length;
		if (totalGroupsSelected > 13) {
			this.recordDialogBoxShow('Post delay message popup', this.group);
			this.minPostDelayTime = Math.round((totalGroupsSelected / 20) * 5) - 2;
			this.maxPostDelayTime = Math.round((totalGroupsSelected / 20) * 5) + 2;
			this.showPostDelayPopup = true;
			this.isPosting = false;
			return;
		}
		this.publishPost();
	}

	publishAtSuggestedTime() {
		this.postPublishTime = new DateTime(this.nextBestTimeAfterPublishIsClicked, 'MM-DD-YYYY h:mm A').utc().unix();
		this.selectedPostOption = 'Custom';
		this.publishPost();
	}

	async publishPost() {
		this.showPostDelayPopup = false;
		document.getElementsByTagName('body')[0].style.pointerEvents = 'none';
		if (this.publishService.selectedGroups) {
			this.selectedGroups = this.publishService.selectedGroups;
		}
		this.publishInProgress = true;
		if (this.selectedPostOption === 'Publish now') {
			this.selectedPostingOption = 'Publishing';
		} else {
			this.selectedPostingOption = 'Scheduling';
		}
		this.loaderBodyText = this.imageFiles.length > 0 || this.videoFiles.length > 0 ? 'Processing media files' : '';

		const processedFileURLs = await Promise.all([
			this.processFilesForUrls(this.imageFiles),
			this.processFilesForUrls(this.videoFiles)
		]);
		const imageUrls = processedFileURLs[0];
		const videoUrls = processedFileURLs[1];
		const newPosts = [];

		if (this.recommendation) {
			await this.checkSuggestion(this.recommendation, 'publishPost');
		}

		if (this.postToBeEdited && this.postToBeEdited.recomObject) {
			await this.loadCheckSuggestFromRecommendation(JSON.parse(this.postToBeEdited.recomObject));
			await this.checkSuggestion(JSON.parse(this.postToBeEdited.recomObject), 'publishPost');
		}
		this.totalPostToBePosted = Object.keys(this.selectedGroups).length;
		if (this.totalPostToBePosted >= 2) {
			this.logger.info(
				'button_clicked',
				{
					group_count: this.totalPostToBePosted,
					button_label: this.selectedPostOption,
					parent_label: 'Compose post',
					source: 'page',
					is_multi_post: true
				},
				'PostComposerComponent',
				'publishPost'
			);
		}
		for (const id in this.selectedGroups) {
			if (this.selectedGroups.hasOwnProperty(id)) {
				this.numOfPostPosted += 1;
				this.percentageValueForProgressBar = (this.numOfPostPosted / this.totalPostToBePosted) * 100;
				this.loaderBodyText =
					this.totalPostToBePosted > 1
						? `${this.selectedPostingOption} on ${this.numOfPostPosted}/${this.totalPostToBePosted}, please wait...`
						: `${this.selectedPostingOption}, please wait...`;
				this.cd.detectChanges();
				const grp = this.selectedGroups[id];
				const newPost = new FacebookPostModel();

				if (this.postToBeEdited) {
					newPost.id = this.postToBeEdited.id;
					newPost.campaignTaskId = this.postToBeEdited.campaignTaskId;
					newPost.scheduleType = this.postToBeEdited.scheduleType;
					newPost.totalSuggestionMet = this.suggestionMatched;
					newPost.isTimeSuggestionMet = this.isTimeSuggestionMet;
					newPost.totalSuggestions = this.totalSuggestion;
				}
				if (this.postToBeReShared) {
					newPost.toBePostedFbPermlink = this.postToBeReShared.fbPermlink;
					newPost.contentType = PostContentTypeEnum.Link;
				} else {
					newPost.contentType = this.getPostContentType(this.postToBeEdited);
				}
				newPost.toBePostedAtUTCTicks = this.postPublishTime;

				newPost.status = PostStatusEnum.Queued;
				newPost.isDeleted = false;
				switch (newPost.contentType) {
					case 'Video':
						newPost.videoUrls = videoUrls;
						break;
					case 'Photo':
						newPost.imageUrls = imageUrls;
						break;
					case 'Album':
						newPost.imageUrls = imageUrls;
						break;
					case 'Link':
						if (imageUrls) {
							newPost.imageUrls = imageUrls;
						} else if (videoUrls) {
							newPost.videoUrls = videoUrls;
						}
						break;
				}
				newPost.text = this.postMessage !== '' ? this.postMessage : null;
				newPost.groupId = grp.id;
				newPost.createdById = this.user.id;
				newPost.createdByImgUrl = await this.facebookService.getProfilePicture(this.user.fbUserId);
				newPost.createdByRole = grp.role;
				newPost.createdByName = this.user.fullname;
				if (this.selectedPostOption === 'Publish now') {
					newPost.scheduleOption = 'Publish now';
				} else {
					newPost.scheduleOption = 'Schedule';
				}
				if (this.recommendation) {
					newPost.recomId = this.recommendation.id;
					newPost.recomObject = JSON.stringify(this.recommendation);
					newPost.recomSrc = this.recommendation.source;
					newPost.totalSuggestionMet = this.suggestionMatched;
					newPost.isTimeSuggestionMet = this.isTimeSuggestionMet;
					newPost.totalSuggestions = this.totalSuggestion;
				} else {
					newPost.isTimeSuggestionMet = this.selectedPostOption === 'Auto-schedule';
				}

				newPosts.push(newPost);
			}
		}

		if (this.postToBeEdited) {
			newPosts[0].toBePostedAtUTCTicks = this.postToBeEdited.toBePostedAtUTCTicks;
			newPosts[0].isDeleted = true;
			await this.publishService.editPosts(newPosts);
		}
		if (this.postToBeEdited && this.postToBeEdited.campaignId) {
			newPosts[0].campaignId = this.postToBeEdited.campaignId;
		}
		if (this.postToBeEdited && this.postToBeEdited.contentType === 'Link') {
			newPosts[0].toBePostedFbPermlink = this.postToBeEdited.toBePostedFbPermlink;
		}
		newPosts[0].toBePostedAtUTCTicks = this.postPublishTime;
		newPosts[0].isDeleted = false;
		newPosts[0].createdByRole = this.selectedGroups[newPosts[0].groupId].role;
		await this.publishService.createPosts(newPosts);
		this.publishInProgress = false;
		this.cancelInProgress = false;
		this.scheduleInProgress = false;
		document.getElementsByTagName('body')[0].style.pointerEvents = 'auto';
		this.publishService.setSelectedGroup(this.selectedGroups[this.initialGroupId]);
		if (this.selectedPostOption === 'Publish now') {
			if (this.suggestedTimePopupShownCounter !== '3') {
				window.localStorage.setItem(
					'numTimeSuggestedTimePopupShown',
					String(parseInt(this.suggestedTimePopupShownCounter) + 1)
				);
			} else {
				window.localStorage.setItem('numTimeSuggestedTimePopupShown', '1');
			}
		}

		if (this.recommendedTimeFromUrl) {
			window.localStorage.setItem('scheduleForGroup' + newPosts[0].groupId, 'done');
			window.localStorage.setItem(
				'actionTimeForGroup' + newPosts[0].groupId,
				new DateTime().local().format('DD-MM-YYYY')
			);
		}
		if (this.postIdFromUrl) {
			window.localStorage.setItem('resharedPostId', this.postIdFromUrl);
			window.localStorage.setItem('repostForGroup' + this.group.id, 'done');
			window.localStorage.setItem('actionTimeForGroup' + this.group.id, new DateTime().local().format('DD-MM-YYYY'));
		}
		if (this.selectedPostOption === 'Publish now') {
			this.publishService.actionTaken = 'postCreated';
			await this.pushNotificationService.showNotificationPrompt('EventTriggeredPushNotificationForScheduledPosts');
			this.checkForToastNotifications();
		} else {
			this.publishService.actionTaken = 'postScheduledSuccess';
			await this.pushNotificationService.showNotificationPrompt('EventTriggeredPushNotificationForScheduledPosts');
			this.checkForToastNotifications();
		}
		if (this.postIdFromUrl) {
			this.router.navigateByUrl(`/group-admin/group/${this.groupId}/scheduledposts`);
		} else {
			if (this.location && this.location.getState()) {
				const locationState: any = this.location.getState();
				locationState.navigationId <= 2 ? this.router.navigateByUrl(this.getRoutePath()) : this.location.back();
			}
		}
		this.publishService.dateTimeSelectedFromRecommendation = null;
		this.publishService.selectedGroups = null;
		this.publishService.postToBeReShared = null;
	}

	closePostDelayPopup(element) {
		this.recordButtonClick(element, this.group);
		this.showPostDelayPopup = false;
	}

	getPostContentType(post): PostContentTypeEnum {
		if (post?.contentType === 'Link') {
			return PostContentTypeEnum.Link;
		} else {
			if (this.videoFiles?.length > 0) {
				return PostContentTypeEnum.Video;
			} else if (this.imageFiles?.length > 1) {
				return PostContentTypeEnum.Album;
			} else if (this.imageFiles?.length === 1) {
				return PostContentTypeEnum.Photo;
			} else {
				return PostContentTypeEnum.Text;
			}
		}
	}

	async loadDataForPostToBeEdited() {
		this.postMessage = this.postToBeEdited.text;
		this.previewImage = [];
		this.imageFiles = [];
		this.videoFiles = [];
		if (this.postToBeEdited.imageUrls) {
			this.postToBeEdited.imageUrls.forEach(imageUrl => {
				this.previewImage.push({src: imageUrl, type: 'image'});
				this.imageFiles.push(imageUrl);
			});
		}

		if (this.postToBeEdited.videoUrls) {
			this.postToBeEdited.videoUrls.forEach(videoUrl => {
				this.previewImage.push({src: videoUrl, type: 'video'});
				this.videoFiles.push(videoUrl);
			});
		}
		if (this.postToBeEdited.contentType === 'Link') {
			const fbGroup_fbPostId = this.postToBeEdited.toBePostedFbPermlink
				.split('groups/')[1]
				.replace('/permalink/', '_')
				.split('/')[0];
			await this.getPostFromPostId(this.group.id, fbGroup_fbPostId);
		}
	}

	private async processFilesForUrls(files: any) {
		const requestsForProcessingFileURLs = [];

		for (let i = 0; i < files?.length; i++) {
			if (typeof files[i] !== 'string') {
				requestsForProcessingFileURLs.push(this.fileService.uploadToS3(files[i], 'image', this.randomUuid()));
			} else {
				requestsForProcessingFileURLs.push(new Promise(resolve => resolve(files[i])));
			}
		}

		return await Promise.all(requestsForProcessingFileURLs);
	}

	getToBePublishedAtTime(event) {
		this.postPublishTime = event.toBePublishedAtTime;
		this.toBeShownTime = event.toBeShownPublishedAtTime;
		this.selectedPostOption = event.toBePublishedType;
		this.nextBestTimeAfterPublishIsClicked = event.nextBestTime;
		this.nextBestTimeToBeShownAfterPublishIsClicked = event.nextBestDayAndTime;
	}

	loadCheckSuggestFromRecommendation(recom) {
		this.SuggestionChecked = {};
		let cat = '';
		if (recom.optLength) {
			if (typeof recom.optLength === 'string') {
				this.SuggestionChecked.optimumLength = JSON.parse(recom.optLength);
			} else {
				this.SuggestionChecked.optimumLength = recom.optLength;
			}
		}

		if (recom.categories) {
			if (this.SuggestionChecked['categories'] === undefined) {
				this.SuggestionChecked['categories'] = [];
			}
			for (let c = 0; c < recom.categories.length; c++) {
				this.SuggestionChecked['categories'].push({value: recom.categories[c], flag: false});
				if (c < 3) {
					cat += `${recom.categories[c]}.. `;
				}
			}
		}

		if (recom.keywords) {
			if (this.SuggestionChecked['keywords'] === undefined) {
				this.SuggestionChecked['keywords'] = [];
			}
			for (let k = 0; k < recom.keywords.length; k++) {
				this.SuggestionChecked['keywords'].push({value: recom.keywords[k], flag: false});
			}
		}

		if (recom.topics) {
			if (this.SuggestionChecked['topics'] === undefined) {
				this.SuggestionChecked['topics'] = [];
			}
			for (let t = 0; t < recom.topics.length; t++) {
				this.SuggestionChecked['topics'].push({value: recom.topics[t], flag: false});
			}
		}

		if (recom.type === 'ContentType') {
			if (cat && !this.postToBeEdited) {
				this.postMessage = `Write something about ${cat}`;
			}
		}
	}

	setGroupsSelected() {
		this.publishService.selectedGroups = Object.assign({}, this.selectedGroups);
		this.publishService.numOfGroupSelected = this.numOfGroupSelected;
	}

	cancelGroupsSelected() {
		this.selectedGroups = Object.assign({}, this.publishService.selectedGroups);
		this.numOfGroupSelected = this.publishService.numOfGroupSelected;
	}

	navigateToPreviousRoute() {
		if (this.location && this.location.getState()) {
			const locationState: any = this.location.getState();
			locationState.navigationId === 1 ? this.router.navigateByUrl(this.getRoutePath()) : this.location.back();
		}
		// this.publishService.selectedGroup = null;
		this.publishService.postToBeReShared = null;
	}

	private checkForToastNotifications() {
		const queryParams = this.publishService.actionTaken;

		if (queryParams === 'postCreated') {
			this.alert.success('You can view it in your group', 'Post published successfully');
		} else if (queryParams === 'postScheduledSuccess') {
			this.alert.success("You can edit the post before it's published", 'Post scheduled successfully');
		} else if (queryParams === 'recommendationAdded') {
			this.alert.success('You can view it in your group', 'Recommendation added successfully');
		}

		this.publishService.actionTaken = '';
	}

	templateModalShow() {
		this.showTemplateModal = false;
		this.customPostTextAreaComponent.autofocusTextArea();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
