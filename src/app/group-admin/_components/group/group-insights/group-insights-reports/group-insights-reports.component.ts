import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupModel} from '@sharedModule/models/group.model';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-group-insights-reports',
	templateUrl: './group-insights-reports.component.html',
	styleUrls: ['./group-insights-reports.component.scss']
})
export class GroupInsightsReportsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Input() container = null;
	@Input() hashParam = '';
	@Input() reportType = '';
	@Input() selectedSummaryMetrics = null;
	@Input() toBeComparedToSummaryMetrics = null;
	@Input() previousMonth;
	@Input() monthSelected;

	constructor(private injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	getMonthDisplayNameForChart(mothsInPast: 0 | 1 | 2 | 3 = 1) {
		return 0 === mothsInPast ? 'Last 30 days' : new DateTime().subtract(mothsInPast, 'month').format('MMM[, ]YYY');
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

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
