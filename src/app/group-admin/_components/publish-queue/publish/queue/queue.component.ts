import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {Router} from '@angular/router';
import {Lightbox} from 'ngx-lightbox';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {GroupCampaignService} from 'src/app/group-admin/_services/group-campaign.service';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {environment} from 'src/environments/environment';
import {Role} from '@sharedModule/enums/role.enum';
import {FacebookPostModel, PostContentTypeEnum} from '../../../../models/facebook-post.model';
import {PostRecommendationModel} from '../../../../models/post-recommendation.model';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {UtilityService} from '@sharedModule/services/utility.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {DateTime} from '@sharedModule/models/date-time';
import {GroupsService} from '@sharedModule/services/groups.service';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Component({
	selector: 'app-queue',
	templateUrl: './queue.component.html',
	styleUrls: ['./queue.component.scss']
})
export class QueueComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Input() queueData: any;
	@Output() isFilterApplied = new EventEmitter();

	isBDAdmin = false;
	loadingRecommendationsAndPosts = true;
	currentUser;
	selectedGroup: GroupModel;
	containerWidth = 0;
	boxWidth: any;
	slider: any;
	popover = true;

	calenderDates = [];

	viewScheduledPost = true;
	viewSuggestedTime = true;
	viewSuggestedPost = true;
	viewModeratorPost = true;

	scheduledPostsToBeDeletedHashMap = {};
	selectedDateId = 0;
	recommendations = {};
	recommendationIdHashMap = {};
	contentTypeRecommendations = {};
	posts: any;
	isCampaignPostsExists = false;
	isScheduledTasksExists = false;
	campaignTasks = [];

	unixThreeDays;
	userTimezone: string = new DateTime().format('Z');
	showVideoGallery = false;
	preview = [];
	showSubNav = false;
	from = '';
	showAdditionalInfo = false;
	showAddToGroupPopup = false;
	userProfilePicture;
	showPostPublisherModal = false;

	constructor(
		injector: Injector,
		private readonly publishService: PublishService,
		private readonly groupCampaignService: GroupCampaignService,
		private readonly router: Router,
		private readonly lightbox: Lightbox,
		private utilityService: UtilityService,
		private readonly facebookService: FacebookService,
		private readonly groupService: GroupsService,
		private readonly securedStorageProvider: SecuredStorageProviderService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.publishService.resetData();
		this.checkIfPostPublishModalIsShown();

		this.selectedDateId = 0;
		this.posts = {};
		this.calenderDates = await this.publishService.getCalenderDates();

		this.containerWidth = $('.calendar-container').outerWidth() - 120;
		this.slider = document.getElementById('calendarSlider');

		window.addEventListener('scroll', this.scroll, true);

		this.subscriptionsToDestroy.push(
			this.groupCampaignService.campaigns.subscribe(campaigns => {
				if (campaigns) {
					campaigns.forEach(campaign => {
						if (campaign.campaignTasks) {
							campaign.campaignTasks.forEach(task => {
								let taskInfo = {};
								taskInfo = task;
								taskInfo['brandName'] = campaign.brandName;
								taskInfo['brandLogoURL'] = campaign.brandLogoURL;
								taskInfo['campaignName'] = campaign.campaignName;
								taskInfo['details'] = campaign.details;
								taskInfo['objective'] = campaign.objective;
								taskInfo['startDateAtUTC'] = campaign.startDateAtUTC;
								taskInfo['endDateAtUTC'] = campaign.endDateAtUTC;
								this.campaignTasks.push(taskInfo);
							});
						}
					});
				}
			})
		);
	}

	checkIfPostPublishModalIsShown() {
		try {
			const isPostPublishModalShown = this.securedStorageProvider.getCookie('postPublisherModalShown');
			if (isPostPublishModalShown) {
				return;
			}
			this.recordDialogBoxShow('Post Publish Modal');
			this.securedStorageProvider.setCookie('postPublisherModalShown', 'true');
			this.showPostPublisherModal = true;
		} catch (e) {}
	}

	async loadRecommendationsAndPosts() {
		this.loadingRecommendationsAndPosts = true;
		this.recommendations = {};
		this.contentTypeRecommendations = {};
		if (this.selectedGroup) {
			await this.selectedGroup.loadRecommendations(this.publishService);
			const generatedRecommendations = this.selectedGroup.recommendations;
			this.recommendations = generatedRecommendations.recommendations;
			this.recommendationIdHashMap = generatedRecommendations.recommendationIdHashMap;
			this.publishService.nextBestTimeRecommendation = await generatedRecommendations.getNextRecommendedSchedule();
			await this.loadScheduledPosts();
		}
		this.loadingRecommendationsAndPosts = false;
		$('#calendarSlider').find('.box:first .date-box').addClass('selected');
	}

	async toPostPageRedirect(recommendation: PostRecommendationModel, element: any, suggestedDate: number) {
		this.recordButtonClick(element, this.selectedGroup);
		if (this.selectedGroup.state !== GroupStateEnum.Installed) {
			this.showAddToGroupPopup = true;
			return;
		}

		this.groupService.selectedGroupid = this.selectedGroup.id;
		if (recommendation) {
			this.publishService.recommendation = recommendation;
			if (this.from === 'groupPublish') {
				this.router.navigateByUrl(`/group-admin/group/${this.selectedGroup.id}/post/create?method=recommendation`);
			} else {
				this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/post/create?method=recommendation`);
			}
			if (suggestedDate) {
				this.publishService.dateTimeSelectedFromRecommendation = new DateTime().parseUnix(suggestedDate);
				this.publishService.selectedPostOption = 'Schedule';
			}
		} else {
			if (this.from === 'groupPublish') {
				this.router.navigateByUrl(`/group-admin/group/${this.selectedGroup.id}/post/create?method=direct`);
			} else {
				this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/post/create?method=direct`);
			}
		}
	}

	closeAuthorizeConvoOverlay(event) {
		this.showAddToGroupPopup = false;
	}

	async ngOnChanges(changes: SimpleChanges) {
		if (!changes.queueData.currentValue.currentUser || !changes.queueData.currentValue.selectedGroup) {
			return;
		}
		this.publishService.resetData();
		this.selectedGroup = changes.queueData.currentValue.selectedGroup;
		this.showSubNav = changes.queueData.currentValue.isNavRequired;
		this.currentUser = changes.queueData.currentValue.currentUser;
		this.isBDAdmin = this.checkIfCurrentUserIsBDAdmin(this.currentUser.id);
		this.userProfilePicture = await this.facebookService.getProfilePicture(this.currentUser.fbUserId);
		if (!changes.queueData.currentValue.isNavRequired) {
			this.from = 'groupPublish';
			this.setUrlParamAndLog('groupPublish');
		} else {
			this.from = 'publish';
			this.setUrlParamAndLog('publish');
		}
		this.loadRecommendationsAndPosts();
	}

	setUrlParamAndLog(from) {
		if (from === 'groupPublish') {
			this.router.navigateByUrl(`/group-admin/group/${this.selectedGroup.id}/scheduledposts`);
			this.logPageTitle(`GA - ${this.selectedGroup.name} - Schedule Posts`, 'GA - Schedule Posts', {
				group_id: this.selectedGroup.id,
				group_name: this.selectedGroup.name,
				group_fb_id: this.selectedGroup.fbGroupId
			});
		} else {
			this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/scheduledposts`);
			this.logPageTitle(
				`GA - Schedule Posts - ${this.selectedGroup.name} - Scheduled Posts`,
				'GA - Schedule Posts - Schedule Posts',
				{
					group_id: this.selectedGroup.id,
					group_name: this.selectedGroup.name,
					group_fb_id: this.selectedGroup.fbGroupId
				}
			);
		}
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	async loadScheduledPosts() {
		const posts = await this.publishService.getScheduledFbPosts(this.selectedGroup.id);
		this.posts = {};
		this.isCampaignPostsExists = posts.filter(post => post.campaignTaskId).length > 0;
		this.isScheduledTasksExists = posts.filter(post => !post.campaignTaskId).length > 0;
		for (const post of posts) {
			this.makeItReadyForDisplay(post);
			if (post.contentType === 'Link' && post.toBePostedFbPermlink !== null) {
				const fbGroup_fbPostId = post.toBePostedFbPermlink
					.split('groups/')[1]
					.replace('/permalink/', '_')
					.split('/')[0];
				const postFromPostId = await this.publishService.getPostFromPostId(this.selectedGroup.id, fbGroup_fbPostId);
				post.originalPostText = postFromPostId.rawText;
				if (postFromPostId.videothumbnailurl && postFromPostId.videothumbnailurl !== '') {
					post.videoUrls = [];
					post.videoUrls.push(postFromPostId.videothumbnailurl);
				}
				if (postFromPostId.photourl && postFromPostId.photourl !== '') {
					post.imageUrls = [];
					post.imageUrls.push(postFromPostId.photourl);
				}
			}
			const dateToMatch = post.toBePostedAtInLocalDate;

			if (this.posts[dateToMatch]) {
				this.posts[dateToMatch].push(post);
			} else {
				this.posts[dateToMatch] = [post];
			}

			if (post.campaignTaskId) {
				const taskDetails = this.campaignTasks.filter(task => task.taskId === post.campaignTaskId);
				post.campaignTaskDetails = taskDetails.length > 0 ? taskDetails[0] : null;
			}
		}
	}

	async showDeleteConfirmation(post: FacebookPostModel) {
		this.scheduledPostsToBeDeletedHashMap[post.id] = true;
	}

	async cancelDeleteConfirmation(post: FacebookPostModel, element) {
		this.recordButtonClick(element, this.selectedGroup);
		delete this.scheduledPostsToBeDeletedHashMap[post.id];
	}

	async deletePost(post: FacebookPostModel, element) {
		this.recordButtonClick(element, this.selectedGroup);
		const removeTarget = element.currentTarget.offsetParent;
		removeTarget.style.opacity = '0';
		removeTarget.style.height = '0';
		removeTarget.style.overflow = 'hidden';
		removeTarget.style.paddingTop = '0';
		removeTarget.style.paddingBottom = '0';

		post.isDeleted = true;
		post.deleting = true;
		await this.publishService.markScheduledPostDeleted(post);
		await this.loadScheduledPosts();
		post.deleting = false;
		this.alert.success('Scheduled post is deleted and will not be published', 'Post deleted successfully');
		setTimeout(function () {
			removeTarget.parentNode.removeChild(removeTarget);
		}, 100);
	}

	async editPost(post: FacebookPostModel, element) {
		this.recordButtonClick(element, this.selectedGroup);
		this.publishService.postToBeEdited = post;
		this.groupService.selectedGroupid = this.selectedGroup.id;
		if (post.recomId) {
			this.publishService.recommendation = this.recommendationIdHashMap[post.recomId];
		}
		if (this.from === 'groupPublish') {
			this.router.navigateByUrl(`/group-admin/group/${this.selectedGroup.id}/post/edit`);
		} else {
			this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/post/edit`);
		}
	}

	toggleGroupSelection(group) {
		this.selectedGroup = group;
		this.loadRecommendationsAndPosts();
	}

	scroll(): void {
		clearTimeout($.data(this, 'scrollTimer'));
		const position = $(document).scrollTop();
		$.data(
			this,
			'scrollTimer',
			setTimeout(function () {
				$('.date-wrapper-parent').each(function (i) {
					const top_of_element = $(this).offset().top;
					const bottom_of_element = $(this).offset().top + $(this).outerHeight();
					const bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
					const top_of_screen = $(window).scrollTop();
					const slider = document.getElementById('calendarSlider');
					if (bottom_of_screen > top_of_element && top_of_screen < bottom_of_element) {
						if ($(this).position().top <= position - 30) {
							$('.date-box.selected').removeClass('selected');
							$('.date-box').eq(i).addClass('selected');

							if ($(window).outerWidth() >= 800) {
								slider.style.marginLeft = i * -35 + 'px';
							} else {
								slider.style.marginLeft = i * -60 + 'px';
							}
						}
					}

					if ($(this).position().top < 110) {
						$('.date-box.selected').removeClass('selected');
						$('#calendarSlider .box:eq(0)').find('.date-box').addClass('selected');
						slider.style.marginLeft = 0 + 'px';
					}
				});
			}, 120)
		);
	}

	moveLeft(element) {
		this.recordButtonClick(element, this.selectedGroup);
		const elemWidth = $('.box').outerWidth() + 20;
		const elem = $('.box').length;
		const totalWidth = elem * elemWidth;
		const val = (parseInt(this.slider.style.marginLeft, 0) || 0) - $('.box').outerWidth() - 20;

		$('.move-left').removeClass('stop');
		if (totalWidth - Math.abs(val) <= $('.calendar-container').outerWidth() - 120) {
			$('.move-right').addClass('stop');
		}

		if (totalWidth - Math.abs(val) >= $('.calendar-container').outerWidth() - 120) {
			this.slider.style.marginLeft = val + 'px';
		}
	}

	moveRight(element) {
		this.recordButtonClick(element, this.selectedGroup);
		const val = (parseInt(this.slider.style.marginLeft, 0) || 0) + $('.box').outerWidth() + 20;

		if (val < 1) {
			this.slider.style.marginLeft = val + 'px';
			$('.move-right').removeClass('stop');
		}

		if (val > 0) {
			this.slider.style.marginLeft = '0px';
			$('.move-left').addClass('stop');
		}
	}

	hidePopover() {
		this.popover = false;
	}

	changeSelectedDate(id, element) {
		this.recordButtonClick(element, this.selectedGroup, `${this.calenderDates[id][1]} ${this.calenderDates[id][0]}`);
		this.selectedDateId = id;
		$('html, body').animate(
			{
				scrollTop: $('#' + id).offset().top - 180
			},
			500
		);
	}

	removeItem(event) {
		const removeTarget = event.currentTarget.offsetParent;
		removeTarget.style.opacity = '0';
		setTimeout(() => {
			removeTarget.parentNode.removeChild(removeTarget);
		}, 500);
	}

	makeItReadyForDisplay(post: FacebookPostModel) {
		if (post.text) {
			post['shortString'] = post.text.length <= 250 ? post.text : post.text.substr(0, post.text.lastIndexOf(' ', 250));
		}
		post['stringEnum'] = 'notClicked';
		post.toBePostedAtInLocalDate = new DateTime().parseUnix(post.toBePostedAtUTCTicks).format('MMM D');
		post.toBePostedAtInLocalTime = new DateTime().parseUnix(post.toBePostedAtUTCTicks).format('hh:mm A');
		post.createdByImgUrl = post.createdByImgUrl
			? post.createdByImgUrl
			: environment.baseUrl + 'assets/images/image.png';
	}

	private checkIfCurrentUserIsBDAdmin(userId) {
		if (environment.envName === 'production') {
			const ids = environment.bdAdmins.split(';');
			return ids.indexOf(userId) > -1;
		} else {
			return true;
		}
	}

	filterChanged() {
		if (!this.viewScheduledPost || !this.viewModeratorPost || !this.viewSuggestedPost || !this.viewSuggestedTime) {
			this.isFilterApplied.emit(false);
		} else {
			this.isFilterApplied.emit(true);
		}
	}

	openImgGallery(images, index) {
		const imagesUrl = [];
		for (let i = 0; i < images.length; i++) {
			imagesUrl[i] = {
				src: images[i]
			};
		}

		this.lightbox.open(imagesUrl, index, {centerVertically: true, enableTransition: false, resizeDuration: '0'});
	}

	close(): void {
		this.lightbox.close();
	}

	openVideoGallery(video) {
		this.preview = [
			{
				src: video
			}
		];
		this.showVideoGallery = true;
	}

	closeVideoGallery() {
		this.showVideoGallery = false;
	}

	private generateDescription(contentType: PostContentTypeEnum) {
		const randomTextDesc = [
			'Publish a new text post related to hot topics being discussed in your group and drive higher group activity.',
			"Publish a new post in your group's top 5 category. Category specific posts helps in driving engagement.",
			'Publish a new text post related to seasonal issues. Relevance of post to seasonal issues help in driving higher engagement.',
			'Asking a question that other group members also have can drive a lot of members to participate.',
			'Providing unique and original content for your group members always help in driving engagement. Invest in original content.',
			'Keeping your post short and to the point is always helpful. Go ahead count your words :)',
			'Using emotion generating keywords helps in driving higher engagement with the audience. '
		];
		const randomPhotoDesc = [
			'While posting a photo post keep in mind that using pictures with real people helps in connecting with audience.',
			"Pictures with emotions visible on people's faces help in driving higher activity.",
			'Publish a new photo related to hot topics being discussed in your group and drive higher group activity.',
			"Publish a new photo/album in your group's top 5 category. Category specific photos helps in driving engagement.",
			'Publish a new photo/album related to seasonal issues. Relevance of photos to seasonal issues help in driving higher engagement.',
			'Is your photo asking a question that other group members also have? Such photos can drive a lot of members to participate.',
			'Is your photo unique and original? Investing in original photos for your group members always help in driving engagement.',
			'"A picture is worth a thousand words." Post pictures of noble actions you or your community members have done.'
		];
		const randomVideoDesc = [
			'Videos with purpose or social causes help in uniting your community and driving massive engagement.',
			'Videos should be recorded for mobile devices, they tend to perform better and drive high activity.',
			"Ask your group members to share the video. That's how movements are built.",
			'Useful content for your community in a video post helps in driving engagement. Go ahead post a useful video!',
			'Does your video tell a story? A good story is way better than high production value.',
			'Keeping a good pace in providing information or storytelling is important. Post a video that keeps up the pace with your community.'
		];

		const arrayToChooseFrom =
			contentType === PostContentTypeEnum.Text
				? randomTextDesc
				: contentType === PostContentTypeEnum.Photo
				? randomPhotoDesc
				: randomVideoDesc;

		const min = 1;
		const max = arrayToChooseFrom.length;
		const index = Math.floor(Math.random() * (+max - +min)) + +min;
		return arrayToChooseFrom[index - 1];
	}

	isScheduledPostModificationAllowed(role: Role, createdByUserId: string) {
		return this.selectedGroup.role === Role.Moderator
			? role === Role.Moderator && createdByUserId === this.currentUser.id
			: true;
	}

	isScheduledPostModificationAllowedForCampaignTask(role: Role, createdByUserId: string, taskUser: string) {
		return taskUser === this.currentUser.fullname;
	}

	showDetails() {
		this.showAdditionalInfo = !this.showAdditionalInfo;
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
		window.removeEventListener('scroll', this.scroll, true);
	}
}
