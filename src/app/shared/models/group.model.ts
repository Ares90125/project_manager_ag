import {BehaviorSubject} from 'rxjs';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {FacebookGroupTypeEnum as FacebookGroupPrivacyEnum} from 'src/app/shared/enums/facebook-group-type.enum';
import {GroupTypeEnum} from 'src/app/shared/enums/group-type.enum';
import {GroupMetricModel} from 'src/app/shared/models/group-metric.model';
import {GroupMetricsService} from 'src/app/shared/services/group-metrics/group-metrics.service';
import {GroupStateEnum} from '../enums/group-state.enum';
import {Role} from '../enums/role.enum';
import {GroupRecommendationModel} from './group-recommendation.model';
import {CommentsPerPostReportModel} from './group-reports/comments-per-post-report.model';
import {EngagementPerPostTypeDistReportModel} from './group-reports/engagement-per-post-type-dist-report.model';
import {EngagementReportModel} from './group-reports/engagement-report.model';
import {MemberGrowthReportModel} from './group-reports/member-growth-report.model';
import {PostTypeDistributionReportModel} from './group-reports/post-type-distribution-report.model';
import {ReportDataInputModel} from './group-reports/report-data.model';
import {SummaryReportModel} from './group-reports/summary-report.model';
import {ConversationTrendsModel} from './conversation-trends.model';
import {GroupTrendsReportService} from 'src/app/group-admin/_services/group-conversation-trends.service';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {
	FacebookInsightsDetails,
	KeywordTrackerReport,
	ProfilePublishStatusEnum,
	UpdateGroupProfilePageInput
} from './graph-ql.model';
import {PostTrendsMetricsModel} from './post-trends-metrics.model';
import {TimePeriod} from '@sharedModule/enums/time-period.enum';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {DateTime} from '@sharedModule/models/date-time';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {ButtonState} from '@sharedModule/enums/button-state.enum';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {v4 as uuid} from 'uuid';
import {FileService} from '@sharedModule/services/file.service';

declare var window: any;

export class GroupModel {
	id: string;
	fbGroupId: string;
	email: string;
	name: string;
	description: string;
	coverImageUrl: string;
	coverImageOffsetX: number;
	coverImageOffsetY: number;
	groupType: GroupTypeEnum | string;
	groupCategories: string;
	groupSubCategories: string;
	createdAtUTC: string;
	targetType: string;
	languages: string;
	countries: string;
	cities: string;
	gender: string;
	targetAudienceGender: string;
	privacy: FacebookGroupPrivacyEnum | string;
	memberCount: number;
	state: GroupStateEnum | string;
	initiateInstallation: boolean;
	initiateUninstallation: boolean;
	groupCreatedAtUTC: string;
	iconUrl: string;
	isCurrentUserAdmin?: boolean;
	role: Role;
	businessCategory: string | null;
	country: string | null;
	isConversationalTrendsLoaded = false;
	isPostTrendsLoaded = false;
	areMetricsAvailable: boolean;
	percentageLast3DaysMetricsAvailable: number;
	percentageLast28DaysMetricsAvailable: number;
	percentageLast7DaysMetricsAvailable: number;
	percentageLastMonthMetricsAvailable: number;
	percentagesSecondLastMonthMetricsAvailable: number;
	percentagesThirdLastMonthMetricsAvailable: number;
	percentageLast14DaysMetricsAvailable: number;
	isConversationTrendAvailable: boolean | null;
	areRecommendationsAvailable: boolean | null;
	groupTimezoneName: string | null;
	groupTimezoneInfo: string | null;
	isDead: boolean | null;
	isCSFbGroupAppInstalled: boolean | null;
	isOverviewDataAvailable: boolean | null;
	receiveWANotifications: boolean | null;
	receiveEmailNotifications: boolean | null;
	groupInstallationStartedAtUTC: string | null;
	groupReInstallationStartedAtUTC: string | null;
	facebookInsightsFileDetails: FacebookInsightsDetails | null;
	noOfProfilePagesCreated: number = 0;
	defaultCommunityManager: string | null;

	hide: boolean | null;
	private _buttonState;
	private _showCampaignLinkInHeader = new BehaviorSubject<boolean>(null);
	public showCampaignLinkInHeader$ = this._showCampaignLinkInHeader.asObservable();

	summarydataForLast7Days = null;
	summarydataForLast14Days = null;
	summaryReportForLast30Days = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportForCurrentMonth = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportForLastMonth = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportForLastTwoMonths = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportForLastThreeMonths = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportFor31To60Days = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportForSecondLastMonth = new BehaviorSubject<SummaryReportModel>(null);
	summaryReportForThirdAndFourthLastMonth = new BehaviorSubject<SummaryReportModel>(null);

	engagementReportForLast30Days = new BehaviorSubject<EngagementReportModel>(null);
	engagementReportForLastMonth = new BehaviorSubject<EngagementReportModel>(null);
	engagementReportForLastTwoMonths = new BehaviorSubject<EngagementReportModel>(null);
	engagementReportForLastThreeMonths = new BehaviorSubject<EngagementReportModel>(null);

	commentsPerPostReportForLast30Days = new BehaviorSubject<EngagementReportModel>(null);
	commentsPerPostReportForLastMonth = new BehaviorSubject<CommentsPerPostReportModel>(null);
	commentsPerPostReportForLastTwoMonths = new BehaviorSubject<CommentsPerPostReportModel>(null);
	commentsPerPostReportForLastThreeMonths = new BehaviorSubject<CommentsPerPostReportModel>(null);

	memberGrowthReportForLast30Days = new BehaviorSubject<EngagementReportModel>(null);
	memberGrowthReportForLastMonth = new BehaviorSubject<MemberGrowthReportModel>(null);
	memberGrowthReportForLastTwoMonths = new BehaviorSubject<MemberGrowthReportModel>(null);
	memberGrowthReportForLastThreeMonths = new BehaviorSubject<MemberGrowthReportModel>(null);

	postTypeDistributionReportForLast30Days = new BehaviorSubject<EngagementReportModel>(null);
	postTypeDistributionReportForLastMonth = new BehaviorSubject<PostTypeDistributionReportModel>(null);
	postTypeDistributionReportForLastTwoMonths = new BehaviorSubject<PostTypeDistributionReportModel>(null);
	postTypeDistributionReportForLastThreeMonths = new BehaviorSubject<PostTypeDistributionReportModel>(null);

	engagementPerPostTypeDistributionForLast30Days = new BehaviorSubject<EngagementPerPostTypeDistReportModel>(null);
	engagementPerPostTypeDistributionForLastMonth = new BehaviorSubject<EngagementPerPostTypeDistReportModel>(null);
	engagementPerPostTypeDistributionForLastTwoMonths = new BehaviorSubject<EngagementPerPostTypeDistReportModel>(null);
	engagementPerPostTypeDistributionForLastThreeMonths = new BehaviorSubject<EngagementPerPostTypeDistReportModel>(null);

	recommendations;
	loadPostsCreatedForPostAnalytics = {};

	conversationTrendsForLast7Days: ConversationTrendsModel;
	conversationTrendsForLast14Days: ConversationTrendsModel;
	reports = new BehaviorSubject<KeywordTrackerReport[]>(null);

	postAnalyticsForCurrentMonth = new BehaviorSubject<any>(null);
	postAnalyticsForLastMonth = new BehaviorSubject<any>(null);
	postAnalyticsForLastTwoMonths = new BehaviorSubject<any>(null);
	postAnalyticsForLastThreeMonths = new BehaviorSubject<any>(null);

	private summaryDataForLastMonth: SummaryReportModel;
	private summaryDataForSecondLastMonth: SummaryReportModel;
	private summaryDataForThirdAndFourthLastMonth: SummaryReportModel;
	private summaryDataForThirdLastMonth: SummaryReportModel;

	private summaryMetricsLoadingPromise: Promise<SummaryReportModel> = null;
	private isDetailsMetricsLoadingTriggered: boolean = null;

	metricsForLast30Days = new BehaviorSubject<GroupMetricModel[]>(null);
	metricsForLast31DaysTo60Days = new BehaviorSubject<GroupMetricModel[]>(null);
	private metricsForLastMonth = new BehaviorSubject<GroupMetricModel[]>(null);
	private metricsForSecondLastMonth = new BehaviorSubject<GroupMetricModel[]>(null);
	private metricsForThirdLastMonth = new BehaviorSubject<GroupMetricModel[]>(null);

	private _metricService: GroupMetricsService;
	private _publishService: PublishService;
	private _groupTrendsReportService: GroupTrendsReportService;
	private _keywordTrackerService: KeywordTrackerService;
	public yesterdaysMetrics = new BehaviorSubject(null);

	private dateTimeHelper: DateTimeHelper;

	_recommendationTimings = new BehaviorSubject(null);
	numOfActionRequired = new BehaviorSubject(null);
	topPostsOfAllTypes = new BehaviorSubject(null);
	recommendationTimings;
	nextRecommendationDate;
	hasPercentageReached100 = false;
	unansweredPostsForToday = [];
	unansweredPostsForLastSevenDays = [];
	private _isUnansweredPostsLoaded = false;

	isThirdLastMonthPillDisabled = false;
	isSecondLastMonthPillDisabled = false;
	isLastMonthPillDisabled = false;
	isLast30DaysPillDisabled = false;

	isAdminTokenAvailable: boolean;
	isMonetized: boolean;
	metricsAvailableSinceUTC: string;
	metricsAvailableUntilUTC: string;

	private _noOfDaysFromInstall: number;

	private _groupProfilePage = new BehaviorSubject<GroupProfilePageModel[]>(null);
	public groupProfilePage$ = this._groupProfilePage.asObservable();
	private _defaultGroupProfilePage = null;

	public constructor(groupData) {
		Object.assign(this, groupData);
		this.areMetricsAvailable = this.areMetricsAvailable ? this.areMetricsAvailable : !this.isThirdLastMonthPillDisabled;
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	get areMetricsForLast30DaysAvailable(): boolean {
		const metricsAvailableSinceUTCTicks = new DateTime().parseUTCString(this.metricsAvailableSinceUTC).unix();
		const metricsAvailableUntilUTCTicks = new DateTime().parseUTCString(this.metricsAvailableUntilUTC).unix();
		const yesterdayEndTicks = this.dateTimeHelper.yesterdayEnd.unix();
		const thirtyFirstDayInPastStart = this.dateTimeHelper.thirtyFirstDayInPastStart.unix();
		return (
			metricsAvailableSinceUTCTicks < thirtyFirstDayInPastStart && metricsAvailableUntilUTCTicks > yesterdayEndTicks
		);
	}

	get buttonState() {
		return this._buttonState
			? this._buttonState
			: this.isDead && this.state === GroupStateEnum.Installed
			? ButtonState.Resume
			: ButtonState.AddApp;
	}

	set buttonState(state: ButtonState) {
		this._buttonState = state;
	}

	get isInstalled() {
		return this.state && this.state === GroupStateEnum.Installed && this.areMetricsAvailable;
	}

	get isLast3DaysDataIsLoaded() {
		return !this.hasPercentageReached100 && this.percentageLast3DaysMetricsAvailable === 100;
	}

	public async getYesterdaysData() {
		if (this.yesterdaysMetrics.getValue()) {
			return;
		}
		await this._metricService.getYesterdaysMetrics(this.id).then(response => {
			this.yesterdaysMetrics.next(response);
		});
	}

	async getUrgentAlertsActionables(keywordTrackerService: KeywordTrackerService, convService: ConversationService) {
		if (this.numOfActionRequired.getValue()) {
			return;
		}
		const getReportsForGroup = await keywordTrackerService.getReportsForGroup(this.id);
		let numberOfConversations = 0;
		for (const value of getReportsForGroup) {
			if (value) {
				if (!convService.conversations[value.displayName]) {
					await convService.fetchConversationsForReport(value, 'navigation', [], 0, [], this.id);
				}
				numberOfConversations =
					numberOfConversations + convService.totalConversationsIn2DaysForReport[value.displayName];
			}
		}
		this.numOfActionRequired.next(numberOfConversations);
		//Below line is being used in Automation Test cases, Please dont remove it.
		window.Cypress && (window.numOfActionRequired = numberOfConversations);
	}

	async loadAutoRecommendationsForOverview(publishService: PublishService) {
		if (this.recommendationTimings?.length > 0) {
			return;
		}
		const recommendation = await publishService.getAutoGeneratedRecommendation(this.id);
		this.recommendationTimings = [];
		if (recommendation !== null) {
			let currentDay = new DateTime().format('dddd');
			this.getNextBestRecommendation(recommendation, currentDay, false);
			if (this.recommendationTimings.length === 0) {
				currentDay = new DateTime().add(1, 'day').format('dddd');
				this.nextRecommendationDate = new DateTime().local().format('DD-MM-YYYY');
				this.getNextBestRecommendation(recommendation, currentDay, true);
			}
		}
		this._recommendationTimings.next(this.recommendationTimings);
		//Below line is being used in Automation Test cases, Please dont remove it.
		window.Cypress && (window.recommendationTimings = this.recommendationTimings);
	}

	getNextBestRecommendation(recommendation, currentDay, hasPassed) {
		const recommendationForToday = JSON.parse(recommendation.timings)[currentDay];
		if (recommendationForToday) {
			if (hasPassed) {
				recommendationForToday.forEach(timings => {
					this.recommendationTimings.push(new DateTime(0).add(timings, 'hours').local().format('hh:mm A'));
					this.nextRecommendationDate = new DateTime().add(1, 'day').local().format('DD-MM-YYYY');
				});
			} else {
				const dateTimeInUtC = this.dateTimeHelper.now;
				recommendationForToday.forEach(timings => {
					const recommendationTime = new DateTime(
						`${this.dateTimeHelper.now.format('ddd MMM DD YYYY')} ${timings}:00 GMT+0000`
					);
					if (!dateTimeInUtC.isAfter(recommendationTime.dayJsObj)) {
						this.recommendationTimings.push(new DateTime(0).add(timings, 'hours').local().format('hh:mm A'));
					}
				});
				this.nextRecommendationDate = new DateTime().local().format('DD-MM-YYYY');
			}
		}
	}

	async getZeroCommentPostsByGroupId(publishService) {
		if (this._isUnansweredPostsLoaded) {
			return;
		}

		if (!this.isUnAnsweredPosts7DaysSectionAvailable() && !this.isUnAnsweredPostsTodaySectionAvailable()) {
			this._isUnansweredPostsLoaded = true;
			return;
		}

		const dateTime = new DateTime();
		const endDate = new DateTime().utc();
		const startDate = new DateTime().subtract(7, 'days').utc().startOf('day');
		const calls = [];
		let unansweredPostsData = [];
		['Video', 'Photo', 'Text'].forEach(type => {
			calls.push(
				publishService.getZeroCommentPostsByGroupId(
					this.id,
					type,
					startDate.month() + 1,
					startDate.year(),
					endDate.month() + 1,
					endDate.year(),
					25
				)
			);
		});

		(await Promise.all(calls)).forEach(data => {
			if (data) {
				unansweredPostsData = unansweredPostsData.concat(data);
			}
		});
		unansweredPostsData.forEach(post => {
			post.fbPermlink =
				'https://www.facebook.com/groups/' +
				post.fbGroupId +
				'/permalink/' +
				post.id.replace(post.fbGroupId + '_', '') +
				'/';
			const isPostCreatedToday =
				dateTime.local().format('DD MM YYYY') === new DateTime(post.postCreatedAtUTC).local().format('DD MM YYYY');

			if (isPostCreatedToday && dateTime.diff(post.postCreatedAtUTC, 'hours') > 2) {
				this.unansweredPostsForToday.push(post);
			} else if (!isPostCreatedToday && dateTime.diff(post.postCreatedAtUTC, 'days') <= 8) {
				this.unansweredPostsForLastSevenDays.push(post);
			}
		});
		this._isUnansweredPostsLoaded = true;
	}

	async getTopPost(limit, publishService) {
		if (this.topPostsOfAllTypes.getValue()?.length > 0) {
			return;
		}
		const now = new DateTime();
		const endDate = new DateTime();
		const startDate = new DateTime().subtract(11, 'months');
		const calls = [];
		let topPostsdata: any = await publishService.getTopPostsAllTypeByGroupId(
			this.id,
			limit,
			startDate.month() + 1,
			endDate.month() + 1,
			startDate.year(),
			endDate.year()
		);

		const alreadyResharedPostId = window.localStorage.getItem('resharedPostId');
		this.topPostsOfAllTypes.next(
			topPostsdata
				? topPostsdata.filter(
						topPost => now.diff(topPost.postCreatedAtUTC, 'days') > 15 && topPost.id !== alreadyResharedPostId
				  )
				: []
		);

		if (this.topPostsOfAllTypes.getValue()?.length === 0) {
			if (limit === 10) {
				return;
			}
			this.getTopPost(10, publishService);
		}
	}

	public getPillNameBasedOnReportType(reportType) {
		if (reportType === 'last30Days') {
			return 'Last 30 days';
		} else if (reportType === 'currentMonth') {
			return this.dateTimeHelper.currentMonthName;
		} else if (reportType === 'lastMonth') {
			return this.dateTimeHelper.lastMonthName;
		} else if (reportType === 'lastTwoMonths') {
			return this.dateTimeHelper.secondLastMonthName + ' - ' + this.dateTimeHelper.lastMonthName;
		} else if (reportType === 'lastThreeMonths') {
			return this.dateTimeHelper.thirdLastMonthName + ' - ' + this.dateTimeHelper.lastMonthName;
		} else if (reportType === '7_DAYS') {
			return this.dateTimeHelper.sixthDayInPastName + ' - Today';
		} else if (reportType === '14_DAYS') {
			return this.dateTimeHelper.thirteenthDayInPastName + ' - Today';
		}
	}

	public getPreviousDurationOfComparison(reportType) {
		if (reportType === 'last30Days') {
			return this.dateTimeHelper.sixtiethDayInPastName + ' - ' + this.dateTimeHelper.thirtyFirstDayInPastName;
		} else if (reportType === 'lastMonth') {
			return this.dateTimeHelper.secondLastMonthStartName + ' - ' + this.dateTimeHelper.secondLastMonthEndName;
		} else if (reportType === 'lastTwoMonths') {
			return this.dateTimeHelper.fourthLastMonthStartName + ' - ' + this.dateTimeHelper.thirdLastMonthEndName;
		}
	}

	initializeMetricsService(metricService: GroupMetricsService) {
		this._metricService = metricService;
	}

	public async loadSummaryMetrics(metricService: GroupMetricsService): Promise<SummaryReportModel> {
		if (this.summaryMetricsLoadingPromise) {
			return this.summaryMetricsLoadingPromise;
		}

		this._metricService = metricService;
		this.checkToHideMonthPills();
		this.generateReportsForLast30Days(this.id);
		this.generateReportsForTheLast31DaysTo60Days(this.id);
		this.summaryMetricsLoadingPromise = new Promise<SummaryReportModel>(resolve => {
			this.summaryReportForLast30Days.subscribe(summaryData => {
				if (summaryData) {
					resolve(summaryData);
				}
			});
		});

		return this.summaryMetricsLoadingPromise;
	}

	private dateTimeOfInstallation(): DateTime {
		let dateOfInstallation;

		if (!this.groupReInstallationStartedAtUTC && !this.groupInstallationStartedAtUTC) {
			dateOfInstallation = this.areMetricsAvailable
				? this.dateTimeHelper.thirdLastMonthStart
				: new DateTime().utc().startOf('day');
		} else {
			dateOfInstallation = this.groupReInstallationStartedAtUTC
				? new DateTime().parseUTCString(this.groupReInstallationStartedAtUTC)
				: new DateTime().parseUTCString(this.groupInstallationStartedAtUTC);
		}
		return dateOfInstallation.endOf('day');
	}

	private dateOfInstallation(): DateTime {
		return this.dateTimeOfInstallation().endOf('day');
	}

	private noOfDaysFromInstall(): number {
		if (this._noOfDaysFromInstall) {
			return this._noOfDaysFromInstall;
		}

		if (this.state === null || this.state !== GroupStateEnum.Installed) {
			this._noOfDaysFromInstall = 0;
			return this._noOfDaysFromInstall;
		}

		const startOfDayUTC = new DateTime().utc().startOf('day');
		this._noOfDaysFromInstall = startOfDayUTC.diff(this.dateOfInstallation().dayJsObj, 'day');
		return this._noOfDaysFromInstall;
	}

	isOverViewTabAvailable() {
		return this.noOfDaysFromInstall() >= 2;
	}

	isReSharePostTabAvailable() {
		return this.noOfDaysFromInstall() >= 1;
	}

	isGroupHealthTabAvailable() {
		return this.noOfDaysFromInstall() >= 2;
	}

	isUnAnsweredPostsTodaySectionAvailable() {
		return new DateTime().utc().diff(this.dateTimeOfInstallation().dayJsObj, 'hour') >= 2;
	}

	isUnAnsweredPosts7DaysSectionAvailable() {
		return this.noOfDaysFromInstall() >= 1;
	}

	private checkToHideMonthPills() {
		const dateOfInstallation = this.dateOfInstallation();
		this.isLast30DaysPillDisabled = this.noOfDaysFromInstall() < 2;
		if (this.isLast30DaysPillDisabled) {
			this.isLastMonthPillDisabled = true;
			this.isSecondLastMonthPillDisabled = true;
			this.isThirdLastMonthPillDisabled = true;

			return;
		}
		this.isLastMonthPillDisabled = dateOfInstallation.isAfter(this.dateTimeHelper.currentMonthStart.dayJsObj);
		this.isSecondLastMonthPillDisabled = dateOfInstallation.isAfter(this.dateTimeHelper.lastMonthStart.dayJsObj);
		this.isThirdLastMonthPillDisabled = dateOfInstallation.isAfter(this.dateTimeHelper.secondLastMonthStart.dayJsObj);
	}

	public async loadDetailsMetrics(metricService: GroupMetricsService): Promise<boolean> {
		if (this.isDetailsMetricsLoadingTriggered) {
			return this.isDetailsMetricsLoadingTriggered;
		}

		this.isDetailsMetricsLoadingTriggered = true;
		this._metricService = metricService;

		this.queueReportGeneration();

		return this.isDetailsMetricsLoadingTriggered;
	}

	private async queueReportGeneration() {
		await Promise.all([
			this.generateReportsForLast30Days(this.id),
			this.generateReportsForTheLast31DaysTo60Days(this.id),
			this.generateReportsForTheLastMonth(this.id)
		]);
		await this.generateReportsForTheLastTwoMonths(this.id);
		await this.generateReportsForTheLastThreeMonths(this.id);
		await this.generateReportsForTheLastFourMonths(this.id);
	}

	public async loadRecommendations(publishService: PublishService): Promise<GroupRecommendationModel> {
		if (this.recommendations) {
			return;
		}

		this._publishService = publishService;
		this.recommendations = new GroupRecommendationModel(this.id, this._publishService);
		await this.recommendations.loadRecommendations();
	}

	public async loadConversationTrends(groupTrendsReportService: GroupTrendsReportService) {
		if (this.isConversationalTrendsLoaded) {
			return;
		}

		this._groupTrendsReportService = groupTrendsReportService;

		await this.generateConversationTrends7days(this.id);
		await this.generateConversationTrends14days(this.id);
		this.isConversationalTrendsLoaded = true;
	}

	public async loadReports(keywordTrackerService: KeywordTrackerService) {
		if (this.reports.getValue()) {
			return;
		}

		this._keywordTrackerService = keywordTrackerService;
		this.reports.next(await this._keywordTrackerService.getReportsForGroup(this.id));
	}

	public async loadPostTrends(publishService: PublishService) {
		if (this.isPostTrendsLoaded) {
			return;
		}

		this.isPostTrendsLoaded = true;
		const postTrends = new PostTrendsMetricsModel(publishService, this.id);

		await this.getPostTrendsForCurrentMonth(postTrends);
		await this.getPostTrendsForLastMonth(postTrends);
		await this.getPostTrendsForLastTwoMonths(postTrends);
		await this.getPostTrendsForLastThreeMonths(postTrends);
	}

	async generateReportsForLast30Days(groupId) {
		if (this.metricsForLast30Days.getValue()) {
			return;
		}

		const metricsForLast30DaysIncludingToday = this.appendMemberCountOnLastMetricRecord(
			await this._metricService.getGroupMetrics(
				groupId,
				this.dateTimeHelper.thirtiethDayInPastStart,
				this.dateTimeHelper.now
			)
		);
		const dateCheckForToday = this.dateTimeHelper.todayStart.unix();
		const dateCheckForPast30Days = this.dateTimeHelper.thirtiethDayInPastStart.unix();
		const metricsForLast30Days = metricsForLast30DaysIncludingToday.filter(
			metric =>
				dateCheckForPast30Days <= metric.metricForHourUTCStartTick &&
				dateCheckForToday >= metric.metricForHourUTCStartTick
		);
		const metricsForToday = metricsForLast30DaysIncludingToday.filter(
			metric => dateCheckForToday <= metric.metricForHourUTCStartTick
		);
		const metricsForCurrentMonth = metricsForLast30Days.filter(
			metric => this.dateTimeHelper.currentMonthStart.unix() <= metric.metricForHourUTCStartTick
		);
		const metricsFor7Days = metricsForLast30Days.filter(
			metric => this.dateTimeHelper.sixthDayInPast.unix() <= metric.metricForHourUTCStartTick
		);
		const metricsFor14Days = metricsForLast30Days.filter(
			metric => this.dateTimeHelper.thirteenthDayInPast.unix() <= metric.metricForHourUTCStartTick
		);
		this.summarydataForLast7Days = await this._metricService.computeGroupSummaryReport(
			metricsFor7Days.concat(metricsForToday)
		);
		this.summarydataForLast14Days = await this._metricService.computeGroupSummaryReport(
			metricsFor14Days.concat(metricsForToday)
		);
		const summaryDataForLast30Days = await this._metricService.computeGroupSummaryReport(metricsForLast30Days);
		const summaryDataForCurrentMonth = await this._metricService.computeGroupSummaryReport(metricsForCurrentMonth);
		const reportInputData = new ReportDataInputModel(metricsForLast30Days, 'last30Days', [
			this.dateTimeHelper.thirtiethDayInPastStart,
			this.dateTimeHelper.yesterdayEnd
		]);
		const engagementReport = await this._metricService.computeEngagementReport(reportInputData);

		this.metricsForLast30Days.next(metricsForLast30Days);
		this.summaryReportForLast30Days.next(summaryDataForLast30Days);
		//Below line is being used in Automation Test cases, Please dont remove it.
		const IncreaseMemberCountLast30Days = await this.differenceInMemberCount(metricsForLast30Days);
		const engagementRateLast30Days = await summaryDataForLast30Days.totalEngagementRate;
		const activityRateLast30Days = await summaryDataForLast30Days.totalActivityRate;
		const unansweredPosts = this.unansweredPostsForToday ? this.unansweredPostsForToday.length : null;
		window.Cypress &&
			(window.DataLast30Days = {
				engagementRateLast30Days,
				activityRateLast30Days,
				IncreaseMemberCountLast30Days,
				unansweredPosts
			});

		this.summaryReportForCurrentMonth.next(summaryDataForCurrentMonth);

		this.postTypeDistributionReportForLast30Days.next(
			await this._metricService.computePostTypeDistributionReport(reportInputData)
		);
		this.engagementPerPostTypeDistributionForLast30Days.next(
			await this._metricService.computeEngagementPerPostTypeDistReport(reportInputData)
		);

		this.engagementReportForLast30Days.next(engagementReport);
		this.memberGrowthReportForLast30Days.next(new MemberGrowthReportModel(engagementReport.reportData));
		this.commentsPerPostReportForLast30Days.next(new CommentsPerPostReportModel(engagementReport.reportData));
	}

	async generateReportsForTheLastMonth(groupId) {
		if (this.metricsForLastMonth.getValue()) {
			return;
		}
		const metricsForLastMonth = await this._metricService.getGroupMetrics(
			groupId,
			this.dateTimeHelper.lastMonthStart,
			this.dateTimeHelper.lastMonthEnd
		);

		this.summaryDataForLastMonth = await this._metricService.computeGroupSummaryReport(metricsForLastMonth);
		const reportInputData = new ReportDataInputModel(metricsForLastMonth, 'weekly', [
			this.dateTimeHelper.lastMonthStart,
			this.dateTimeHelper.lastMonthEnd
		]);
		const engagementReport = await this._metricService.computeEngagementReport(reportInputData);

		this.metricsForLastMonth.next(metricsForLastMonth);

		this.summaryReportForLastMonth.next(this.summaryDataForLastMonth);

		this.postTypeDistributionReportForLastMonth.next(
			await this._metricService.computePostTypeDistributionReport(reportInputData)
		);
		this.engagementPerPostTypeDistributionForLastMonth.next(
			await this._metricService.computeEngagementPerPostTypeDistReport(reportInputData)
		);

		this.engagementReportForLastMonth.next(engagementReport);
		this.memberGrowthReportForLastMonth.next(new MemberGrowthReportModel(engagementReport.reportData));
		this.commentsPerPostReportForLastMonth.next(new CommentsPerPostReportModel(engagementReport.reportData));
	}

	private async generateReportsForTheLastTwoMonths(groupId) {
		const metricsForSecondLastMonth = await this._metricService.getGroupMetrics(
			groupId,
			this.dateTimeHelper.secondLastMonthStart,
			this.dateTimeHelper.secondLastMonthEnd
		);
		const metricsForLastTwoMonths = metricsForSecondLastMonth.concat(this.metricsForLastMonth.value);

		this.summaryDataForSecondLastMonth = await this._metricService.computeGroupSummaryReport(metricsForSecondLastMonth);
		this.summaryReportForSecondLastMonth.next(this.summaryDataForSecondLastMonth);
		const reportInputData = new ReportDataInputModel(metricsForLastTwoMonths, 'monthly', [
			this.dateTimeHelper.secondLastMonthStart.format('MMM YYYY'),
			this.dateTimeHelper.lastMonthStart.format('MMM YYYY')
		]);

		const engagementReport = await this._metricService.computeEngagementReport(reportInputData);

		this.metricsForSecondLastMonth.next(metricsForSecondLastMonth);

		this.summaryReportForLastTwoMonths.next(
			this.calculateAggregateSummaryReport([this.summaryDataForSecondLastMonth, this.summaryDataForLastMonth])
		);

		this.postTypeDistributionReportForLastTwoMonths.next(
			await this._metricService.computePostTypeDistributionReport(reportInputData)
		);
		this.engagementPerPostTypeDistributionForLastTwoMonths.next(
			await this._metricService.computeEngagementPerPostTypeDistReport(reportInputData)
		);

		this.engagementReportForLastTwoMonths.next(engagementReport);
		this.memberGrowthReportForLastTwoMonths.next(new MemberGrowthReportModel(engagementReport.reportData));
		this.commentsPerPostReportForLastTwoMonths.next(new CommentsPerPostReportModel(engagementReport.reportData));
	}

	async generateReportsForTheLast31DaysTo60Days(groupId) {
		if (this.metricsForLast31DaysTo60Days.getValue()) {
			return;
		}
		const metricsForLast31DaysTo60Days = await this._metricService.getGroupMetrics(
			groupId,
			this.dateTimeHelper.sixtiethDayInPastStart,
			this.dateTimeHelper.thirtyFirstDayInPastEnd
		);
		this.metricsForLast31DaysTo60Days.next(metricsForLast31DaysTo60Days);
		const summaryDataFor31TO60Days = await this._metricService.computeGroupSummaryReport(metricsForLast31DaysTo60Days);
		this.summaryReportFor31To60Days.next(summaryDataFor31TO60Days);
		//Below line is being used in Automation Test cases, Please dont remove it.
		const activityRate31To60Days = summaryDataFor31TO60Days.totalActivityRate;
		const engagementRate31To60Days = summaryDataFor31TO60Days.totalEngagementRate;
		const increaseinMemberCount31To60Days = this.differenceInMemberCount(metricsForLast31DaysTo60Days);
		window.Cypress &&
			(window.Data31To60Days = {activityRate31To60Days, engagementRate31To60Days, increaseinMemberCount31To60Days});
	}

	async getPostsCreated(timePeriod, publishService: PublishService) {
		if (this.loadPostsCreatedForPostAnalytics) {
			if (this.loadPostsCreatedForPostAnalytics[timePeriod]) {
				return;
			}
		}
		this._publishService = publishService;
		this.loadPostsCreatedForPostAnalytics[timePeriod] = await this._publishService.getPostsCreated(
			this.id,
			TimePeriod[timePeriod]
		);
	}

	get defaultProfilePage(): GroupProfilePageModel {
		return this._defaultGroupProfilePage;
	}

	async listProfilePages(groupProfilePagesService: GroupProfilePagesService): Promise<void> {
		if (this._groupProfilePage.getValue() !== null) {
			return;
		}

		const res = await groupProfilePagesService.listGroupProfilePages(this.id);
		this._groupProfilePage.next(res);
	}

	async createGroupProfilePage(
		name: string,
		isDefaultProfile: boolean,
		groupProfilePagesService: GroupProfilePagesService
	): Promise<boolean | string> {
		try {
			await this.listProfilePages(groupProfilePagesService);
			let existingProfilePages = this._groupProfilePage.getValue();
			existingProfilePages = existingProfilePages ? existingProfilePages : [];

			if (existingProfilePages.length > 0 && isDefaultProfile) {
				this._defaultGroupProfilePage = existingProfilePages[0];
				this._groupProfilePage.next(existingProfilePages);
				return this._defaultGroupProfilePage.id;
			} else {
				const createdProfilePage = await groupProfilePagesService.createGroupProfilePage(
					this.id,
					name,
					existingProfilePages ? existingProfilePages.length : 0,
					isDefaultProfile
				);
				this._defaultGroupProfilePage = createdProfilePage;
				existingProfilePages.push(createdProfilePage);
				this._groupProfilePage.next(existingProfilePages);
				return createdProfilePage.id;
			}
		} catch (e) {
			return false;
		}
	}

	async duplicateGroupProfilePage(
		profileIdForDuplication: string,
		name: string,
		groupProfilePagesService: GroupProfilePagesService
	): Promise<string | null> {
		try {
			const existingProfilePages = this._groupProfilePage.getValue();
			const createdProfilePage = await groupProfilePagesService.duplicateProfilePage(
				this.id,
				profileIdForDuplication,
				name,
				existingProfilePages.length
			);
			existingProfilePages.push(createdProfilePage);
			this._groupProfilePage.next(existingProfilePages);
			return createdProfilePage.id;
		} catch (e) {
			return null;
		}
	}

	async updateGroupProfileOverviewSection(
		{groupId, profileId, description, country}: any,
		groupProfilePagesService: GroupProfilePagesService
	): Promise<boolean> {
		const updateObject = {groupId, id: profileId, description, country};
		return await this.updateProfilePageDraft(updateObject, groupProfilePagesService);
	}

	async updateGroupProfileName(
		profileId: string,
		name: string,
		groupProfilePagesService: GroupProfilePagesService
	): Promise<boolean> {
		const updateObject = {groupId: this.id, id: profileId, name};
		return await this.updateProfilePageDraft(updateObject, groupProfilePagesService);
	}

	async uploadProfilePageImage(file: any, fileService: FileService): Promise<string | void> {
		return await this.uploadFileToS3(file, 'image', fileService);
	}

	async uploadFileToS3(file: any, type, fileService: FileService, id = uuid()): Promise<string | void> {
		return await fileService.uploadToS3(file, type, id);
	}

	async saveProfilePage(
		profilePage: GroupProfilePageModel,
		groupProfilePagesService: GroupProfilePagesService,
		fileService: FileService
	) {
		const updateObj = new UpdateGroupProfilePageInput();
		updateObj.groupId = profilePage.groupId;
		updateObj.id = profilePage.id;
		updateObj.publishedStatus = ProfilePublishStatusEnum.DRAFT;
		let isSaveSuccess = true;

		if (profilePage.isSavingCoverImageNeeded) {
			const updatedCoverImageUrl = await this.uploadProfilePageImage(profilePage.coverImageToBeSaved, fileService);
			if (updatedCoverImageUrl) {
				updateObj.isCustomCoverAdded = true;
				updateObj.coverImageUrl = updatedCoverImageUrl;
			} else {
				isSaveSuccess = false;
			}
		}

		if (profilePage.isAdminsSectionPreferenceChanged) {
			updateObj.showAdmins = profilePage.showAdmins;
			updateObj.admins = profilePage.admins;
		}

		if (profilePage.isInfluencersSectionPreferenceChanged) {
			updateObj.showInfluencers = profilePage.showInfluencers;
		}

		if (profilePage.isOverviewSectionChanged) {
			updateObj.description = profilePage.description;
			updateObj.country = profilePage.country;
			updateObj.category = profilePage.category;
		}

		if (profilePage.isReviewsSectionPreferenceChanged) {
			updateObj.showReviews = profilePage.showReviews;
		}

		if (profilePage.isKeyStatisticsSectionChanged) {
			updateObj.showActivityRate = profilePage.showActivityRate;
			updateObj.showEngagementRate = profilePage.showEngagementRate;
			updateObj.showMonthlyConversations = profilePage.showMonthlyConversations;
		}

		if (profilePage.isPopularTopicsSectionChanged) {
			updateObj.showPopularTopics = profilePage.showPopularTopics;
			updateObj.popularTopics = profilePage.popularTopics;
		}

		if (profilePage.isMostTalkedAboutBrandsSectionChanged) {
			updateObj.showMostTalkedAboutBrands = profilePage.showMostTalkedAboutBrands;
			updateObj.mostTalkedAboutBrands = profilePage.mostTalkedAboutBrands;
		}

		if (profilePage.isAudienceInsightsSectionChanged) {
			updateObj.showAudienceInsights = profilePage.showAudienceInsights;
			updateObj.showAgeAndGender = profilePage.showAgeAndGender;
			updateObj.showTopCities = profilePage.showTopCities;
			updateObj.showTopCountries = profilePage.showTopCountries;
			updateObj.audienceInsightsSheetUID = profilePage.audienceInsightsSheetUID;
			updateObj.topCountries = [];
			profilePage.topCountries.forEach(country => {
				updateObj.topCountries.push({name: country.name, value: country.value});
			});
			updateObj.topCities = [];
			profilePage.topCities.forEach(city => {
				updateObj.topCities.push({name: city.name, value: city.value});
			});
			updateObj.ageMetrics = [];
			profilePage.ageMetrics.forEach(ageMetric => {
				updateObj.ageMetrics.push({
					ageRange: ageMetric.ageRange,
					percentageMen: ageMetric.percentageMen,
					percentageWomen: ageMetric.percentageWomen,
					percentageCustomGender: ageMetric.percentageCustomGender,
					male: ageMetric.male,
					female: ageMetric.female,
					others: ageMetric.others
				});
			});
		}

		if (profilePage.isFilesSectionChanged) {
			const fileUploadCalls = [];
			const filesToBeUploaded = profilePage.filesDetails.filter(file => file.fileToBeUploaded);
			let uploadedFiles = profilePage.filesDetails.filter(file => !file.fileToBeUploaded);

			updateObj.filesDetails = [];
			updateObj.showFiles = profilePage.showFiles;
			filesToBeUploaded.forEach(file => {
				file.fileUUID = uuid();
				fileUploadCalls.push(this.uploadFileToS3(file.fileToBeUploaded, file.fileType, fileService, file.fileUUID));
			});
			(await Promise.all(fileUploadCalls)).forEach((fileURL, index) => (filesToBeUploaded[index].fileURL = fileURL));
			uploadedFiles = uploadedFiles.concat(filesToBeUploaded);

			uploadedFiles.forEach(file => {
				if (file.updateToFileName) {
					updateObj.filesDetails.push({
						fileType: file.fileType,
						fileURL: file.fileURL,
						fileName: file.updateToFileName.includes(file.fileType)
							? file.updateToFileName.trim()
							: file.updateToFileName.trim() + '.' + file.fileType,
						fileSize: file.fileSize,
						fileUUID: file.fileUUID,
						fileThumbnailURL: file.fileThumbnailURL ? file.fileThumbnailURL : null
					});
				} else {
					updateObj.filesDetails.push({
						fileType: file.fileType,
						fileURL: file.fileURL,
						fileName: file.fileName,
						fileSize: file.fileSize,
						fileUUID: file.fileUUID,
						fileThumbnailURL: file.fileThumbnailURL ? file.fileThumbnailURL : null
					});
				}
			});
		}

		await this.updateProfilePageDraft(updateObj, groupProfilePagesService);

		return isSaveSuccess;
	}

	async publishProfilePage(profilePage: GroupProfilePageModel, groupProfilePagesService: GroupProfilePagesService) {
		try {
			await groupProfilePagesService.publishGroupProfile(profilePage.groupId, profilePage.id);
			const updateObj = new UpdateGroupProfilePageInput();
			updateObj.groupId = profilePage.groupId;
			updateObj.id = profilePage.id;
			updateObj.publishedStatus = ProfilePublishStatusEnum.LIVE;
			updateObj.isPublished = true;
			await this.updateProfilePageDraft(updateObj, groupProfilePagesService);
			return true;
		} catch (e) {
			return false;
		}
	}

	private async updateProfilePageDraft(
		updateObj: UpdateGroupProfilePageInput,
		groupProfilePagesService: GroupProfilePagesService
	) {
		// const profilePages = this._groupProfilePage.getValue();
		// const indexOfUpdate = profilePages.findIndex(profilePage => profilePage.id === updateObj.id);
		try {
			const updatedProfilePage = (await groupProfilePagesService.updateGroupProfileDraft(
				updateObj
			)) as unknown as GroupProfilePageModel;
			updatedProfilePage.isSuccessAnimationNeeded = updatedProfilePage.publishedStatus === 'Live';
			groupProfilePagesService.updateProfilePage(updatedProfilePage);
			groupProfilePagesService.setIsProfilePageData(updatedProfilePage);
			// profilePages[indexOfUpdate] = updatedProfilePage;
			// this._groupProfilePage.next(profilePages);
			return true;
		} catch (e) {
			return false;
		}
	}

	private async getPostTrendsForCurrentMonth(postTrends) {
		const currentMonth = this.dateTimeHelper.currentMonthNumber;
		const currentYear = this.dateTimeHelper.currentYear;
		this.postAnalyticsForCurrentMonth.next(
			await postTrends.getPostAnalyticsData(currentMonth, currentMonth, currentYear, currentYear)
		);
	}

	private async getPostTrendsForLastMonth(postTrends) {
		const currentYear = this.dateTimeHelper.currentYear;
		const lastMonth = this.dateTimeHelper.lastMonthNumber;
		this.postAnalyticsForLastMonth.next(
			await postTrends.getPostAnalyticsData(lastMonth, lastMonth, currentYear, currentYear)
		);
	}

	private async getPostTrendsForLastTwoMonths(postTrends) {
		this.postAnalyticsForLastTwoMonths.next(
			await postTrends.getPostAnalyticsData(
				this.dateTimeHelper.secondLastMonthNumber,
				this.dateTimeHelper.lastMonthNumber,
				this.dateTimeHelper.currentYear,
				this.dateTimeHelper.currentYear
			)
		);
	}

	private async getPostTrendsForLastThreeMonths(postTrends) {
		this.postAnalyticsForLastThreeMonths.next(
			await postTrends.getPostAnalyticsData(
				this.dateTimeHelper.thirdLastMonthNumber,
				this.dateTimeHelper.lastMonthNumber,
				this.dateTimeHelper.currentYear,
				this.dateTimeHelper.currentYear
			)
		);
	}

	private async generateConversationTrends7days(groupId) {
		const metrics = await this._groupTrendsReportService.getKeywordMetrics(
			groupId,
			this.dateTimeHelper.seventhDayInPast.dayJsObj,
			this.dateTimeHelper.yesterdayEnd.dayJsObj
		);
		this.conversationTrendsForLast7Days = new ConversationTrendsModel(metrics);
	}

	private async generateConversationTrends14days(groupId) {
		const metrics = await this._groupTrendsReportService.getKeywordMetrics(
			groupId,
			this.dateTimeHelper.thirteenthDayInPast.dayJsObj,
			this.dateTimeHelper.yesterdayEnd.dayJsObj
		);
		this.conversationTrendsForLast14Days = new ConversationTrendsModel(metrics);
	}

	private async generateReportsForTheLastThreeMonths(groupId) {
		const metricsForThirdLastMonth = await this._metricService.getGroupMetrics(
			groupId,
			this.dateTimeHelper.thirdLastMonthStart,
			this.dateTimeHelper.thirdLastMonthEnd
		);
		const metricsForLastThreeMonths = metricsForThirdLastMonth.concat(
			this.metricsForSecondLastMonth.getValue().concat(this.metricsForLastMonth.getValue())
		);

		this.summaryDataForThirdLastMonth = await this._metricService.computeGroupSummaryReport(metricsForLastThreeMonths);
		const reportInputData = new ReportDataInputModel(metricsForLastThreeMonths, 'monthly', [
			this.dateTimeHelper.thirdLastMonthName,
			this.dateTimeHelper.secondLastMonthName,
			this.dateTimeHelper.lastMonthName
		]);
		const engagementReport = await this._metricService.computeEngagementReport(reportInputData);
		this.metricsForThirdLastMonth.next(metricsForThirdLastMonth);
		this.summaryReportForLastThreeMonths.next(
			this.calculateAggregateSummaryReport([
				this.summaryDataForThirdLastMonth,
				this.summaryDataForSecondLastMonth,
				this.summaryDataForLastMonth
			])
		);

		this.postTypeDistributionReportForLastThreeMonths.next(
			await this._metricService.computePostTypeDistributionReport(reportInputData)
		);
		this.engagementPerPostTypeDistributionForLastThreeMonths.next(
			await this._metricService.computeEngagementPerPostTypeDistReport(reportInputData)
		);

		this.engagementReportForLastThreeMonths.next(engagementReport);
		this.commentsPerPostReportForLastThreeMonths.next(new CommentsPerPostReportModel(engagementReport.reportData));
		this.memberGrowthReportForLastThreeMonths.next(new MemberGrowthReportModel(engagementReport.reportData));
	}

	private async generateReportsForTheLastFourMonths(groupId) {
		const metricsForFourthLastMonth = await this._metricService.getGroupMetrics(
			groupId,
			this.dateTimeHelper.fourthLastMonthStart,
			this.dateTimeHelper.fourthLastMonthEnd
		);
		const metricsForThirdAndFourthMonths = metricsForFourthLastMonth.concat(this.metricsForThirdLastMonth.getValue());

		this.summaryDataForThirdAndFourthLastMonth = await this._metricService.computeGroupSummaryReport(
			metricsForThirdAndFourthMonths
		);
		this.summaryReportForThirdAndFourthLastMonth.next(this.summaryDataForThirdAndFourthLastMonth);
	}

	private calculateAggregateSummaryReport(summaryReportArray: SummaryReportModel[]): SummaryReportModel {
		const numberOfElements = summaryReportArray.length;
		return summaryReportArray.reduce((prvVal, curVal) => {
			prvVal.totalPosts += curVal.totalPosts;
			prvVal.totalConversations += curVal.totalConversations;
			prvVal.totalComments += curVal.totalComments;

			prvVal.totalActivityRate = prvVal.totalActivityRate + curVal.totalActivityRate / numberOfElements;
			prvVal.totalCommentsPerPosts = prvVal.totalCommentsPerPosts + curVal.totalCommentsPerPosts / numberOfElements;
			prvVal.totalEngagementRate = prvVal.totalEngagementRate + curVal.totalEngagementRate / numberOfElements;

			prvVal.totalVideoPosts += curVal.totalVideoPosts;
			prvVal.totalPhotoPosts += curVal.totalPhotoPosts;
			prvVal.totalTextPosts += curVal.totalTextPosts;

			prvVal.totalActivityOnVideoPosts += curVal.totalActivityOnVideoPosts;
			prvVal.totalActivityOnPhotoPosts += curVal.totalActivityOnPhotoPosts;
			prvVal.totalActivityOnTextPosts += curVal.totalActivityOnTextPosts;

			return prvVal;
		}, new SummaryReportModel());
	}

	private appendMemberCountOnLastMetricRecord(metrics: GroupMetricModel[]): GroupMetricModel[] {
		if (!metrics || metrics.length < 1) {
			return [];
		}

		if (metrics[metrics.length - 1]) {
			metrics[metrics.length - 1].memberCount = this.memberCount;
		}
		return metrics;
	}

	private differenceInMemberCount(metricsPulled) {
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
}
