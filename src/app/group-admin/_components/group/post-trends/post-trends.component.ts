import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {UserService} from 'src/app/shared/services/user.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import {SummaryReportModel} from '@sharedModule/models/group-reports/summary-report.model';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {Router} from '@angular/router';

@Component({
	selector: 'app-post-trends',
	templateUrl: './post-trends.component.html',
	styleUrls: ['./post-trends.component.scss']
})
export class PostTrendsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@ViewChild('openRepostModal') openRepostModal: ElementRef<HTMLElement>;
	@Output() changeInNavigationHash = new EventEmitter();
	selectedPostAnalyticsData = new BehaviorSubject<any>(null);
	selectedSummaryReport = new BehaviorSubject<SummaryReportModel>(null);
	container = null;
	timeOptions = [];
	postMessage = '';
	publishTime: string;
	nextRecommendationSchedule;
	timePeriod = 'currentMonth';
	showAlert = false;
	alertMessage = null;
	isRecommendationsLoading = false;
	postTypes = ['Video', 'Image', 'Plain Text'];
	fbCrisisTooltipMsg = 'We are facing API issues with Facebook and past data should be available after 15 days';

	constructor(
		injector: Injector,
		private metricsService: GroupMetricsService,
		private publishService: PublishService,
		private userService: UserService,
		private facebookService: FacebookService,
		private utilityService: UtilityService,
		private router: Router
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				this.group = group;
				super.setPageTitle(`GA - ${this.group.name} - Reshare Post`, 'Reshare Post', {
					group_id: this.group.id,
					group_name: this.group.name,
					group_fb_id: this.group.fbGroupId
				});
				this.initiateDataLoad();
			})
		);
		this.container = $('.group-post-trends-component');
		window.addEventListener('scroll', this.scroll, true);
	}

	async initiateDataLoad() {
		this.group.loadSummaryMetrics(this.metricsService);
		this.group.loadDetailsMetrics(this.metricsService);
		this.group.loadPostTrends(this.publishService);

		this.selectedPostAnalyticsData = this.group.postAnalyticsForCurrentMonth;
		this.selectedSummaryReport = this.group.summaryReportForCurrentMonth;

		this.isRecommendationsLoading = true;
		this.group.loadRecommendations(this.publishService).then(result => {
			this.group.recommendations.getNextRecommendedSchedule().then(nextRecommendation => {
				this.nextRecommendationSchedule = nextRecommendation;
				this.isRecommendationsLoading = false;
			});
		});
	}

	async repostPost(element, selectedPost) {
		if (element) {
			this.recordButtonClick(element, this.group);
		}

		this.publishService.postToBeReShared = selectedPost;
		this.router.navigateByUrl(
			'/group-admin/group/' + this.group.id + '/post/create?method=reshare&postid=' + selectedPost.id
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	scroll(): void {
		if (!this.container) {
			return;
		}

		const scrolled = $(window).scrollTop();
		if (scrolled >= 450) {
			this.container.find('.fixed-tabs').addClass('fixed');
		} else {
			this.container.find('.fixed-tabs').removeClass('fixed');
		}
	}

	getSummaryDataByType(dataForSelectedPeriod, type) {
		const postData = dataForSelectedPeriod.value[type];
		let totalActivity = 0;
		postData.forEach(post => {
			totalActivity += Number(post.reactions) + Number(post.commentCount);
		});
		const activityRate = postData.length !== 0 ? Math.round(totalActivity / postData.length) : 0;
		return {postData: postData.length, activityRate: activityRate};
	}

	async getPostAnalyticsDataBySelectedPeriod(timePeriod) {
		this.timePeriod = timePeriod;
		switch (timePeriod) {
			case 'currentMonth':
				this.selectedSummaryReport = this.group.summaryReportForCurrentMonth;
				this.selectedPostAnalyticsData = this.group.postAnalyticsForCurrentMonth;
				break;
			case 'lastMonth':
				this.selectedSummaryReport = this.group.summaryReportForLastMonth;
				this.selectedPostAnalyticsData = this.group.postAnalyticsForLastMonth;
				break;
			case 'lastTwoMonths':
				this.selectedSummaryReport = this.group.summaryReportForLastTwoMonths;
				this.selectedPostAnalyticsData = this.group.postAnalyticsForLastTwoMonths;
				break;
			case 'lastThreeMonths':
				this.selectedSummaryReport = this.group.summaryReportForLastThreeMonths;
				this.selectedPostAnalyticsData = this.group.postAnalyticsForLastThreeMonths;
				break;
		}
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	async redirectToCreatePost() {
		await this.router.navigateByUrl('/group-admin/group/' + this.group.id + '/post/create?method=direct');
	}

	isTheGroupInAnalysingState() {
		let timePeriodCheck;
		switch (this.timePeriod) {
			case 'currentMonth':
				timePeriodCheck = this.group?.percentageLast28DaysMetricsAvailable < 100;
				break;
			case 'lastMonth':
				timePeriodCheck = this.group?.percentageLastMonthMetricsAvailable < 100;
				break;
			case 'lastTwoMonths':
				timePeriodCheck = this.group?.percentagesSecondLastMonthMetricsAvailable < 100;
				break;
			case 'lastThreeMonths':
				timePeriodCheck = this.group?.percentagesThirdLastMonthMetricsAvailable < 100;
				break;
		}

		return timePeriodCheck && !this.group?.areMetricsAvailable;
	}

	isGroupAnalysisComplete() {
		let timePeriodCheck;

		switch (this.timePeriod) {
			case 'currentMonth':
				timePeriodCheck =
					this.group?.percentageLast28DaysMetricsAvailable === 100 || this.group.isReSharePostTabAvailable();
				break;
			case 'lastMonth':
				timePeriodCheck =
					this.group?.percentageLastMonthMetricsAvailable === 100 || !this.group.isLastMonthPillDisabled;
				break;
			case 'lastTwoMonths':
				timePeriodCheck =
					this.group?.percentagesSecondLastMonthMetricsAvailable === 100 || !this.group.isSecondLastMonthPillDisabled;
				break;
			case 'lastThreeMonths':
				timePeriodCheck =
					this.group?.percentagesThirdLastMonthMetricsAvailable === 100 || !this.group.isThirdLastMonthPillDisabled;
				break;
		}

		return timePeriodCheck || this.group?.areMetricsAvailable;
	}
}
