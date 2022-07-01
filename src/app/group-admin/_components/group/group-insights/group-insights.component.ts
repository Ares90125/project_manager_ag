import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {GroupMetricsService} from 'src/app/shared/services/group-metrics/group-metrics.service';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {DateTime} from '@sharedModule/models/date-time';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-group-insights',
	templateUrl: './group-insights.component.html',
	styleUrls: ['./group-insights.component.scss']
})
export class GroupInsightsComponent extends BaseComponent implements OnInit, OnDestroy {
	description = 'Insights on engagement and growth of your group since you installed the group';
	group: GroupModel;
	container = null;
	hashParam = '';
	reportType = 'last30Days';
	selectedSummaryMetrics = null;
	toBeComparedToSummaryMetrics = null;
	previousMonth;
	monthSelected;
	fbCrisisTooltipMsg = 'We are facing API issues with Facebook and past data should be available after 15 days';

	constructor(
		injector: Injector,
		private readonly metricService: GroupMetricsService,
		private router: Router,
		private publishService: PublishService,
		public readonly userService: UserService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				this.group = group;
				this.navigateAsPerHash('');
				this.group.loadSummaryMetrics(this.metricService);
				this.group.loadDetailsMetrics(this.metricService);
			})
		);
		this.container = $('.group-insight-container');
		window.addEventListener('scroll', this.scroll, true);
	}

	getMonthDisplayNameForChart(mothsInPast: 0 | 1 | 2 | 3 = 1) {
		return 0 === mothsInPast ? 'Last 30 days' : new DateTime().subtract(mothsInPast, 'month').format('MMM[, ]YYYY');
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

	get isPercentageForHealthReport100() {
		return (
			(this.group?.percentagesThirdLastMonthMetricsAvailable === 100 && this.reportType === 'lastThreeMonths') ||
			(this.group?.percentagesSecondLastMonthMetricsAvailable === 100 && this.reportType === 'lastTwoMonths') ||
			(this.group?.percentageLastMonthMetricsAvailable === 100 && this.reportType === 'lastMonth') ||
			this.group?.areMetricsAvailable
		);
	}

	get isPercentageForHealthReportlessThan100() {
		return (
			((this.group?.percentagesThirdLastMonthMetricsAvailable < 100 && this.reportType === 'lastThreeMonths') ||
				(this.group?.percentagesSecondLastMonthMetricsAvailable < 100 && this.reportType === 'lastTwoMonths') ||
				(this.group?.percentageLastMonthMetricsAvailable < 100 && this.reportType === 'lastMonth') ||
				(this.group?.percentageLast28DaysMetricsAvailable < 100 && this.reportType === 'last30Days')) &&
			!this.group?.areMetricsAvailable
		);
	}

	changeReportType(type) {
		const data = {group_fb_id: this.group.fbGroupId, group_id: this.group.id, group_name: this.group.name};
		let arg1 = '';
		let navigationURL = '';
		this.reportType = type;
		if (type === 'last30Days') {
			arg1 = `GA - ${this.group.name} - Group Health`;
			this.group.summaryReportForLast30Days.subscribe(data => (this.selectedSummaryMetrics = data));
			this.group.summaryReportFor31To60Days.subscribe(data => (this.toBeComparedToSummaryMetrics = data));
			this.previousMonth = this.group.getPreviousDurationOfComparison('last30Days');
		} else if (type === 'lastMonth') {
			arg1 = `GA - ${this.group.name} - Group Health 1 Month`;
			this.group.summaryReportForLastMonth.subscribe(data => (this.selectedSummaryMetrics = data));
			this.group.summaryReportForSecondLastMonth.subscribe(data => (this.toBeComparedToSummaryMetrics = data));
			this.previousMonth = this.group.getPreviousDurationOfComparison('lastMonth');
		} else if (type === 'lastTwoMonths') {
			arg1 = `GA - ${this.group.name} - Group Health 2 Months`;
			this.group.summaryReportForLastTwoMonths.subscribe(data => (this.selectedSummaryMetrics = data));
			this.group.summaryReportForThirdAndFourthLastMonth.subscribe(data => (this.toBeComparedToSummaryMetrics = data));
			this.previousMonth = this.group.getPreviousDurationOfComparison('lastTwoMonths');
		} else if (type === 'lastThreeMonths') {
			arg1 = `GA - ${this.group.name} - Group Health 3 Months`;
			this.group.summaryReportForLastThreeMonths.subscribe(data => (this.selectedSummaryMetrics = data));
			this.toBeComparedToSummaryMetrics = '';
		}
		this.monthSelected = type;
		this.logPageTitle(arg1, 'GA - Statistics', data);
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	navigateAsPerHash(hash) {
		if (hash === '1month') {
			this.changeReportType('lastMonth');
		} else if (hash === '2months') {
			this.changeReportType('lastTwoMonths');
		} else if (hash === '3months') {
			this.changeReportType('lastThreeMonths');
		} else {
			this.changeReportType('last30Days');
		}
	}

	redirectToSchedulePost() {
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/scheduledposts`);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
