import {Component, Injector, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {UtilityService} from '@sharedModule/services/utility.service';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {Router} from '@angular/router';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {DateTime} from '@sharedModule/models/date-time';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {environment} from 'src/environments/environment';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

declare var window: any;

@Component({
	selector: 'app-group-overview',
	templateUrl: './group-overview.component.html',
	styleUrls: ['./group-overview.component.scss']
})
export class GroupOverviewComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	group: GroupModel;
	numOfActionRequired;
	unansweredPosts;
	selectedSummaryMetrics = null;
	toBeComparedToSummaryMetrics = null;
	isUrgentAlertDoneForToday = false;
	isRepostPostDoneForToday = false;
	isSchedulePostDoneForToday = false;
	previousMonth;
	yesterdaysDate;
	yesterdaysMetrics;
	showYesterdaysOverview = false;
	private unlisten;
	promptCard;
	isLoading = true;
	showFacebookJoinCard = false;
	showComposeCard = false;
	videoLink = 'https://www.youtube.com/embed/SUAw-esdHL4';

	constructor(
		injector: Injector,
		private publishService: PublishService,
		private userService: UserService,
		private router: Router,
		private keywordTrackerService: KeywordTrackerService,
		private convService: ConversationService,
		private utilityService: UtilityService,
		private readonly metricService: GroupMetricsService,
		private readonly renderer2: Renderer2,
		private readonly securedStorage: SecuredStorageProviderService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.initialDataLoad();
	}

	async initialDataLoad() {
		this.user = await this.userService.getUser();
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				if (this.group && this.group?.id === group.id) {
					return;
				}
				this.group = group;
				this.resetData();
				this.unansweredPosts = group.isLast3DaysDataIsLoaded;
				this.setUrlParamAndLog();
				this.group.loadSummaryMetrics(this.metricService);
				this.group.loadDetailsMetrics(this.metricService);
				this.checkIfActionIsDoneForToday();
				this.getYesterdaysMetrics();
				if (!this.group.isOverViewTabAvailable()) {
					this.getPromptCardData(this.user.id);
				}
			})
		);
		this.isLoading = false;
	}

	async getPromptCardData(userId) {
		// this.userPostedAtLeastOnce = await this.userService.getIfPostComposerUsed();
		const promptCard = this.securedStorage.getCookie('promptCard');
		if (promptCard) {
			this.promptCard = JSON.parse(promptCard);
			this.checkWhichCardToShowInUI(this.promptCard);
			return;
		}
		const initialData = [
			{
				cardId: '1',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '2',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '3',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '4',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '5',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '6',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '-1',
				userId: userId,
				cardActivity: {},
				cardOrder: [1, 2, 3, 4, 5]
			}
		];
		this.securedStorage.setCookie('promptCard', JSON.stringify(initialData));
		this.promptCard = initialData;
		this.checkWhichCardToShowInUI(this.promptCard);
	}

	differenceInMemberCount(metricsPulled) {
		if (metricsPulled.length > 0) {
			const firstNonNullMemberCount = metricsPulled.find(value => value.memberCount !== null);
			const reverseMetrics = metricsPulled.reduce((accumulator, value) => {
				return [value, ...accumulator];
			}, []);
			const lastNonNullMemberCount = reverseMetrics.find(value => value.memberCount !== null);
			if (lastNonNullMemberCount && firstNonNullMemberCount) {
				return firstNonNullMemberCount.memberCount - lastNonNullMemberCount.memberCount;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	resetData() {
		this.showYesterdaysOverview = false;
		this.previousMonth = this.group.getPreviousDurationOfComparison('last30Days');
		//Automation code, Please dont remove it.
		window.Cypress && (window.past30DayDaterange = this.previousMonth);
		this.yesterdaysDate = new DateTime().startOf('day').subtract(1, 'day').local().format('DD MMM YYYY');
		this.resetLocalStorage();
	}

	resetLocalStorage() {
		if (
			window.localStorage.getItem('actionTimeForGroup' + this.group.id) !== new DateTime().local().format('DD-MM-YYYY')
		) {
			window.localStorage.removeItem('keywordsForGroup' + this.group.id);
			window.localStorage.removeItem('scheduleForGroup' + this.group.id);
			window.localStorage.removeItem('repostForGroup' + this.group.id);
			window.localStorage.removeItem('actionTimeForGroup' + this.group.id);
		}
	}

	setUrlParamAndLog() {
		this.logPageTitle(`GA - ${this.group.name} - Overview`, 'Overview', {
			group_id: this.group.id,
			group_name: this.group.name,
			group_fb_id: this.group.fbGroupId
		});
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	async getYesterdaysMetrics() {
		if (this.group.isOverviewDataAvailable) {
			await this.group.getYesterdaysData();
			this.showYesterdaysOverview = true;
			this.group.yesterdaysMetrics.subscribe(data => (this.yesterdaysMetrics = data));
		}
	}

	checkIfActionIsDoneForToday() {
		this.group.getZeroCommentPostsByGroupId(this.publishService);
		if (window.localStorage.getItem('scheduleForGroup' + this.group.id)) {
			this.isSchedulePostDoneForToday = true;
		} else {
			this.group.loadAutoRecommendationsForOverview(this.publishService);
		}
		if (window.localStorage.getItem('repostForGroup' + this.group.id)) {
			this.isRepostPostDoneForToday = true;
		} else {
			this.group.getTopPost(5, this.publishService);
		}
		if (window.localStorage.getItem('keywordsForGroup' + this.group.id)) {
			this.isUrgentAlertDoneForToday = true;
		} else {
			this.group.getUrgentAlertsActionables(this.keywordTrackerService, this.convService);
			this.isUrgentAlertDoneForToday = false;
		}
	}

	async redirectToComposePost() {
		this.router.navigateByUrl(
			`/group-admin/group/${this.group.id}/post/create?date=${this.group.nextRecommendationDate}&time=${
				this.group._recommendationTimings.getValue()[0]
			}`
		);
	}

	redirectToUnansweredPost() {
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/unanswered`);
	}

	redirectToUrgentAlerts() {
		window.localStorage.setItem('keywordsForGroup' + this.group.id, 'done');
		window.localStorage.setItem('actionTimeForGroup' + this.group.id, new DateTime().local().format('DD-MM-YYYY'));
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/urgentAlerts`);
	}

	async redirectToSchedulePost() {
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/scheduledposts`);
	}

	async redirectToPostTrends() {
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/postTrends`);
	}

	async redirectToResharePost() {
		this.router.navigateByUrl(
			`group-admin/group/${this.group.id}/post/create?postid=${this.group.topPostsOfAllTypes.getValue()[0].id}`
		);
	}

	triggerChangeInNavigation(hash) {
		this.router.navigateByUrl(`group-admin/group/${this.group.id}/statistics`);
	}

	absoluteValue(number) {
		return Math.abs(number);
	}

	getUserTimeZone() {
		return DateTime.guess();
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	async checkWhichCardToShowInUI(promptCard) {
		this.showComposeCard = !(await this.userService.getIfPostComposerUsed());
		const dateNowTicks = new DateTime().unix();

		promptCard.map(card => {
			const nextDayShownTime = card.cardActivity.nextDayToBeShownAtUtc;
			const hasNumberOfTime7DaysExceedTwo = card.cardActivity.numberOfTime7DaysIntervalConsume > 2;
			const nextDateTicks = new DateTime().parseUTCString(nextDayShownTime).unix();
			switch (card.cardId) {
				case '3':
					this.showFacebookJoinCard = false;
					if (nextDayShownTime) {
						if (!this.user.joinedCSGroupAtDate && dateNowTicks > nextDateTicks && !hasNumberOfTime7DaysExceedTwo) {
							this.showFacebookJoinCard = true;
						}
					} else {
						if (!this.user.joinedCSGroupAtDate) {
							this.showFacebookJoinCard = true;
						}
					}
					break;
				case '6':
					if (nextDayShownTime) {
						if (dateNowTicks < nextDateTicks || hasNumberOfTime7DaysExceedTwo) {
							this.showComposeCard = false;
						}
					}
					break;
			}
		});
	}

	async closePromptCard(cardId) {
		let cardIndex = this.promptCard.findIndex(card => card.cardId === cardId);
		const nextDate = this.getNextDateToShown(cardId);

		if (cardIndex === -1 && cardId === '6') {
			this.promptCard.push({
				cardId: '6',
				userId: this.user.id,
				cardActivity: {}
			});
			cardIndex = this.promptCard.findIndex(card => card.cardId === cardId);
		}

		this.promptCard[cardIndex].cardActivity.nextDayToBeShownAtUtc = nextDate;

		if (!this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume) {
			this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume = 1;
		} else {
			this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume += 1;
		}

		this.updateCardActivity(this.promptCard);
		this.checkWhichCardToShowInUI(this.promptCard);
	}

	getNextDateToShown(cardId) {
		const todayDate = new DateTime().startOf('d');

		// For Others
		return todayDate.add(7, 'd').toDate();
	}

	updateCardActivity(cardActivity) {
		this.securedStorage.setCookie('promptCard', JSON.stringify(cardActivity));
	}

	OpenFacebookLink() {
		if (this.user.timezoneName.includes('Asia/Calcutta') || this.user.timezoneName.includes('Asia/Kolkata')) {
			this.openFbJoinGroupPopup('https://www.facebook.com/groups/fbgroupgrowth');
		} else {
			this.openFbJoinGroupPopup('https://www.facebook.com/groups/1293580737757204');
		}
	}

	openFbJoinGroupPopup(url) {
		window.open(
			url,
			'popUpWindow',
			'height=560,width=680,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes'
		);
		this.closePromptCard('3');
	}

	async redirectToDefaultComposePost() {
		await this.closePromptCard('6');
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/post/create`);
	}

	closeModal() {
		this.videoLink = '';
	}

	playVideo() {
		this.videoLink = 'https://www.youtube.com/embed/SUAw-esdHL4';
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
