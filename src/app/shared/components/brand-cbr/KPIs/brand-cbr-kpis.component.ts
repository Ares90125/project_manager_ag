import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import Highcharts from 'highcharts';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {
	ColumnAndGroupedLineChart,
	ColumnStackedChart,
	ColumnWIthTargetChart,
	SelectedTimePeriod
} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-brand-CBR-kpis',
	templateUrl: './brand-cbr-kpis.component.html',
	styleUrls: ['./brand-cbr-kpis.component.scss']
})
export class BrandCbrKpisComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
	@Input() groupId: string;
	@Input() data;
	@Input() supportingText;
	@Input() group: GroupModel;
	brandCommunity;
	@Input() showAllPDF: boolean = false;
	@Input() targets;
	_selectedTimePeriod: string;
	private timePeriodForReportGeneration: any;
	@Output() openEdit = new EventEmitter();
	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
		setTimeout(async () => {
			await this.setChartOptions(this._selectedTimePeriod);
		}, 1000);
	}
	@Input()
	public set _brandCommunity(value: string) {
		this.brandCommunity = value;
		setTimeout(async () => {
			await this.setChartOptions(this._selectedTimePeriod);
		}, 1000);
	}
	totalViewsOptions = new ColumnAndGroupedLineChart();
	monthlyViewsOptions = new ColumnWIthTargetChart();
	dailyViewsOptions = new ColumnWIthTargetChart();
	membersOnboardedOptions = new ColumnAndGroupedLineChart();
	DauMauOptions = new ColumnWIthTargetChart();
	dailyActiveUsersOptions = new ColumnWIthTargetChart();
	dailyActiveUsersPercentageOptions = new ColumnWIthTargetChart();
	monthlyActiveUsersOptions = new ColumnWIthTargetChart();
	monthlyActiveUsersPercentageOptions = new ColumnWIthTargetChart();

	postsChartOptions = new ColumnAndGroupedLineChart();
	commentsChartOptions = new ColumnAndGroupedLineChart();
	conversationsChartOptions = new ColumnAndGroupedLineChart();
	reactionsChartOptions = new ColumnAndGroupedLineChart();
	engagementChartOptions = new ColumnAndGroupedLineChart();
	percentageEngagementChartOptions = new ColumnWIthTargetChart();
	engagementPerPostChartOptions = new ColumnWIthTargetChart();

	memberAdminPostRatioChartOptions = new ColumnWIthTargetChart();
	surveyOptions = new ColumnWIthTargetChart();
	impressionsChartOptions = new ColumnAndGroupedLineChart();
	membershipRequestsChartOptions = new ColumnStackedChart();

	kpiTrapezoidChartData;
	private dateTimeHelper: DateTimeHelper;
	groupTimezoneName: string | null;
	memberval1 = 0;
	memberval2 = 0;
	memberval3 = 0;
	memberval21 = (this.memberval2 * 100) / 220;
	memberval11;
	showAllCharts = false;
	tabSelected = 'Members';
	engagementval1 = 0;
	engagementval2 = 0;
	engagementval3 = 0;
	engagementval4 = 0;
	engagementval11 = (this.engagementval2 * 100) / 220;
	engagementval21 = (this.engagementval2 * 100) / 220;
	engagementval32 = (this.engagementval3 * 100) / 220;
	// to be refactored after demo

	maxEngagementNumber;
	maxMemberNumber;
	isMemberTrapezoidChartVisible = true;
	isUserEngagementTrapezoidChartVisible = true;
	isTotalMembersOnboardedChartVisible = true;
	isDAUMAUChartVisible = true;
	isMonthlyActiveUsersChartVisible = true;
	isMonthlyActiveUsersPercentageChartVisible = true;
	isDailyActiveUsersChartVisible = true;
	isDailyActiveUsersPercentageChartVisible = true;
	isPostsChartVisible = true;
	isCommentsChartVisible = true;
	isConversationsChartVisible = true;
	isReactionsChartVisible = true;
	isTotalEngagementChartVisible = true;
	isAverageEngagementPercentageChartVisible = true;
	isAverageEngagementPerPosChartVisible = true;
	isMemberAdminRatioChartVisible = true;
	isSurveysChartVisible = true;
	isImpressionsChartVisible = true;
	isMembershipRequestsChartVisible = true;
	kpiDataJson = {};
	@Output() kpiJson = new EventEmitter();
	idToScrollTo = '';

	constructor(injector: Injector, private brandCommunityReportService: BrandCommunityReportService) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		Highcharts.SVGRenderer.prototype.symbols['c-rect'] = function (x, y, w, h) {
			return ['M', x, y + h / 2, 'L', x + w, y + h / 2];
		};
		setTimeout(async () => {
			await this.setChartOptions(this._selectedTimePeriod);
		}, 2000);
	}

	ngOnChanges(changes): void {
		if (changes.showAllPDF && changes.showAllPDF.currentValue) {
			this.showAllCharts = true;
		} else {
			this.showAllCharts = false;
		}
	}

	scrollToKPI(el: HTMLElement, type = null) {
		this.showAllCharts = true;
		if (type === 'activity') {
			this.tabSelected = 'Activity';
		} else {
			this.tabSelected = 'Members';
		}
		setTimeout(() => {
			el.scrollIntoView({behavior: 'smooth'});
		}, 100);
	}

	async setChartOptions(selectedTimePeriod, isFromPublish = null) {
		if (!this.groupId) {
			return;
		}
		if (typeof this.targets === 'string') {
			this.targets = JSON.parse(this.targets);
		}
		this.kpiTrapezoidChartData = null;
		this.kpiTrapezoidChartData = this.data[selectedTimePeriod]['trapezoidChartData'];
		switch (selectedTimePeriod) {
			case SelectedTimePeriod.fourWeeks:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime().startOf('week').subtract(3, 'weeks').format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.threeMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(2, 'months').dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.sixMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(5, 'months').dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.oneYear:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.lastYearStart.dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.lastYearEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.lifetime:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime(this.group.groupCreatedAtUTC).format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD'),
					lifetime: true
				};
				break;
		}
		let groupMembersChartsData;
		groupMembersChartsData = this.data[selectedTimePeriod]['groupMembersChartsData'];
		this.createKPICharts(selectedTimePeriod, isFromPublish);
		if (this.brandCommunity?.privacy === 'OPEN') {
			this.createKPIMemberCharts(groupMembersChartsData, 'membersOnboardedChartCBR', selectedTimePeriod, isFromPublish);
			this.createKPIMemberCharts(groupMembersChartsData, 'totalViewsChartCBR', selectedTimePeriod, isFromPublish);
			this.createKPIMemberCharts(groupMembersChartsData, 'monthlyViewsChartCBR', selectedTimePeriod, isFromPublish);
			this.createKPIMemberCharts(groupMembersChartsData, 'dailyViewsChartCBR', selectedTimePeriod, isFromPublish);
		} else {
			this.createKPIMemberCharts(groupMembersChartsData, 'membersOnboardedChartCBR', selectedTimePeriod, isFromPublish);
			this.createKPIMemberCharts(groupMembersChartsData, 'DauMauChartCBR', selectedTimePeriod, isFromPublish);
			this.createKPIMemberCharts(groupMembersChartsData, 'dailyActiveUsersChartCBR', selectedTimePeriod, isFromPublish);
			this.createKPIMemberCharts(
				groupMembersChartsData,
				'dailyActiveUsersPercentageChartCBR',
				selectedTimePeriod,
				isFromPublish
			);
			this.createKPIMemberCharts(
				groupMembersChartsData,
				'MonthlyActiveUsersChartCBR',
				selectedTimePeriod,
				isFromPublish
			);
			this.createKPIMemberCharts(
				groupMembersChartsData,
				'monthlyActiveUsersPercentageChartCBR',
				selectedTimePeriod,
				isFromPublish
			);
		}
		const groupActivityChartsData = this.data[selectedTimePeriod]['groupActivityChartsData'];
		this.createKPIActivityCharts(groupActivityChartsData, 'postsChartCBR', selectedTimePeriod, isFromPublish);
		this.createKPIActivityCharts(groupActivityChartsData, 'commentsChartCBR', selectedTimePeriod, isFromPublish);
		this.createKPIActivityCharts(groupActivityChartsData, 'conversationsChartCBR', selectedTimePeriod, isFromPublish);
		this.createKPIActivityCharts(groupActivityChartsData, 'reactionsChartCBR', selectedTimePeriod, isFromPublish);
		this.createKPIActivityCharts(groupActivityChartsData, 'engagementChartCBR', selectedTimePeriod, isFromPublish);
		this.createKPIActivityCharts(
			groupActivityChartsData,
			'percentageEngagementChartCBR',
			selectedTimePeriod,
			isFromPublish
		);
		this.createKPIActivityCharts(
			groupActivityChartsData,
			'engagementPerPostChartCBR',
			selectedTimePeriod,
			isFromPublish
		);
		const getGroupInsightsChartsData = this.data[selectedTimePeriod]['groupInsightsChartsData'];
		this.createKPIInsightsCharts(
			getGroupInsightsChartsData,
			'memberAdminPostRatioCBR',
			selectedTimePeriod,
			isFromPublish
		);
		this.createKPIInsightsCharts(getGroupInsightsChartsData, 'surveysCBR', selectedTimePeriod, isFromPublish);
		if (this.brandCommunity?.privacy !== 'OPEN') {
			this.createKPIInsightsCharts(getGroupInsightsChartsData, 'impressionsCBR', selectedTimePeriod, isFromPublish);
			this.createKPIInsightsCharts(
				getGroupInsightsChartsData,
				'membershipRequestsChartCBR',
				selectedTimePeriod,
				isFromPublish
			);
		}
	}

	async createKPIMemberCharts(groupMembersChartsData, type, selectedTimePeriod = null, isFromPublish = null) {
		this.DauMauOptions.chartOptions.yAxis.title.text = 'Ratio';
		this.dailyActiveUsersOptions.chartOptions.yAxis.title.text = 'Number of Users';
		this.dailyActiveUsersPercentageOptions.chartOptions.yAxis.title.text = 'Percentage of Users';
		this.dailyActiveUsersPercentageOptions.chartOptions.yAxis['labels'] = {
			formatter: function () {
				return this.value + '%';
			}
		};
		this.monthlyActiveUsersPercentageOptions.chartOptions.yAxis['labels'] = {
			formatter: function () {
				return this.value + '%';
			}
		};
		this.DauMauOptions.chartOptions.yAxis['labels'] = {
			formatter: function () {
				return this.value + '%';
			}
		};
		this.percentageEngagementChartOptions.chartOptions.yAxis['labels'] = {
			formatter: function () {
				return this.value + '%';
			}
		};
		this.percentageEngagementChartOptions.chartOptions.tooltip = {
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}%<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		};
		this.dailyActiveUsersPercentageOptions.chartOptions.tooltip = {
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}%<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		};
		this.monthlyActiveUsersPercentageOptions.chartOptions.tooltip = {
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}%<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		};
		this.percentageEngagementChartOptions.chartOptions.tooltip = {
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}%<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		};
		this.DauMauOptions.chartOptions.tooltip = {
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}%<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		};
		this.monthlyActiveUsersOptions.chartOptions.yAxis.title.text = 'Number of Users';
		this.monthlyActiveUsersPercentageOptions.chartOptions.yAxis.title.text = 'Percentage of Users';
		this.engagementPerPostChartOptions.chartOptions.yAxis.title.text = 'Engagement per Post';
		this.percentageEngagementChartOptions.chartOptions.yAxis.title.text = 'Percentage';
		this.memberAdminPostRatioChartOptions.chartOptions.yAxis.title.text = 'Ratio';
		this.surveyOptions.chartOptions.yAxis.title.text = 'Number of Surveys';
		if (isFromPublish) {
			return;
		}
		let memberSeriesData = {
			data: [],
			total: [],
			key: []
		};
		if (typeof this.targets === 'string') {
			this.targets = JSON.parse(this.targets);
		}
		switch (type) {
			case 'membersOnboardedChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.totalMembersOnboarded);
					memberSeriesData.total.push(data.barData.totalMembersCount);
					memberSeriesData.key.push(data.startDate);
				});
				this.membersOnboardedOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.membersOnboardedOptions.chartOptions.series[1].data = [];
				this.membersOnboardedOptions.chartOptions.colors = ['#9edae5', '#3654FF', '#27AE60'];
				this.membersOnboardedOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.membersOnboardedOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.totalMembersOnboarded?.visibility === false) {
					this.membersOnboardedOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.totalMembersOnboarded) {
						this.membersOnboardedOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.totalMembersOnboarded
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['membersOnboardedOptions'] = this.membersOnboardedOptions.chartOptions;
				} else {
					this.createChart(type, this.membersOnboardedOptions.chartOptions);
				}

				break;
			case 'DauMauChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.dailyActiveUsersRatio);
					memberSeriesData.key.push(data.startDate);
				});
				this.DauMauOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.DauMauOptions.chartOptions.colors = ['#D4EDE0', '#3654FF', '#27AE60'];
				this.DauMauOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.DAUMAURatio?.visibility === false) {
					this.DauMauOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.DAUMAURatio) {
						this.DauMauOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.DAUMAURatio,
							true
						);
					}
				}
				this.createChart(type, this.DauMauOptions.chartOptions);

				break;
			case 'dailyActiveUsersChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.dailyActiveUsersCount);
					memberSeriesData.key.push(data.startDate);
				});
				this.dailyActiveUsersOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.dailyActiveUsersOptions.chartOptions.colors = ['#98DF8A', '#3654FF', '#27AE60'];
				this.dailyActiveUsersOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.dailyActiveUsers?.visibility === false) {
					this.dailyActiveUsersOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.dailyActiveUsers) {
						this.dailyActiveUsersOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.dailyActiveUsers,
							true
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['dailyActiveUsersOptions'] = this.dailyActiveUsersOptions.chartOptions;
				} else {
					this.createChart(type, this.dailyActiveUsersOptions.chartOptions);
				}
				break;
			case 'dailyActiveUsersPercentageChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.dailyActiveUsersPercentage);
					memberSeriesData.key.push(data.startDate);
				});
				this.dailyActiveUsersPercentageOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.dailyActiveUsersPercentageOptions.chartOptions.colors = ['#98DF8A', '#3654FF', '#27AE60'];
				this.dailyActiveUsersPercentageOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.dailyActiveUsersPercentage?.visibility) {
					this.dailyActiveUsersPercentageOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.dailyActiveUsersPercentage) {
						this.dailyActiveUsersPercentageOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.dailyActiveUsersPercentage,
							true
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['dailyActiveUsersPercentageOptions'] =
						this.dailyActiveUsersPercentageOptions.chartOptions;
				} else {
					this.createChart(type, this.dailyActiveUsersPercentageOptions.chartOptions);
				}
				break;
			case 'MonthlyActiveUsersChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.monthlyActiveUsersCount);
					memberSeriesData.key.push(data.startDate);
				});
				this.monthlyActiveUsersOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.monthlyActiveUsersOptions.chartOptions.colors = ['#8CE5CE', '#3654FF', '#27AE60'];
				this.monthlyActiveUsersOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.monthlyActiveUsers?.visibility === false) {
					this.monthlyActiveUsersOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.monthlyActiveUsers) {
						this.monthlyActiveUsersOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.monthlyActiveUsers,
							true
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['monthlyActiveUsersOptions'] =
						this.monthlyActiveUsersOptions.chartOptions;
				} else {
					this.createChart(type, this.monthlyActiveUsersOptions.chartOptions);
				}
				break;
			case 'monthlyActiveUsersPercentageChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.monthlyActiveUsersPercentage);
					memberSeriesData.key.push(data.startDate);
				});
				this.monthlyActiveUsersPercentageOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.monthlyActiveUsersPercentageOptions.chartOptions.colors = ['#8CE5CE', '#3654FF', '#27AE60'];
				this.monthlyActiveUsersPercentageOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.monthlyActiveUsersPercentage?.visibility === false) {
					this.monthlyActiveUsersPercentageOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.monthlyActiveUsersPercentage) {
						this.monthlyActiveUsersPercentageOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.monthlyActiveUsersPercentage,
							true
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['monthlyActiveUsersPercentageOptions'] =
						this.monthlyActiveUsersPercentageOptions.chartOptions;
				} else {
					this.createChart(type, this.monthlyActiveUsersPercentageOptions.chartOptions);
				}
				break;
			case 'totalViewsChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.totalViews);
					memberSeriesData.total.push(data.barData.aggregateViews);
					memberSeriesData.key.push(data.startDate);
				});
				this.totalViewsOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.totalViewsOptions.chartOptions.series[1].data = [];
				this.totalViewsOptions.chartOptions.colors = ['#9edae5', '#3654FF', '#27AE60'];
				this.totalViewsOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.totalViewsOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.totalViews) {
					this.totalViewsOptions.chartOptions.series[1].data = this.getTargetsForCharts(
						memberSeriesData,
						this.targets?.totalViews
					);
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['totalViewsOptions'] = this.totalViewsOptions.chartOptions;
				} else {
					this.createChart(type, this.totalViewsOptions.chartOptions);
				}

				break;
			case 'monthlyViewsChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.monthlyViews);
					memberSeriesData.key.push(data.startDate);
				});
				this.monthlyViewsOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.monthlyViewsOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				this.monthlyViewsOptions.chartOptions.colors = ['#D4EDE0', '#3654FF', '#27AE60'];
				this.monthlyViewsOptions.chartOptions.yAxis.title.text = 'Number of Users';
				if (this.targets?.monthlyViews) {
					this.monthlyViewsOptions.chartOptions.series[1].data = this.getTargetsForCharts(
						memberSeriesData,
						this.targets?.monthlyViews,
						true
					);
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['monthlyViewsOptions'] = this.monthlyViewsOptions.chartOptions;
				} else {
					this.createChart(type, this.monthlyViewsOptions.chartOptions);
				}
				break;
			case 'dailyViewsChartCBR':
				groupMembersChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.dailyViews);
					memberSeriesData.key.push(data.startDate);
				});
				this.dailyViewsOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.dailyViewsOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				this.dailyViewsOptions.chartOptions.yAxis.title.text = 'Number of Users';
				this.dailyViewsOptions.chartOptions.colors = ['#D4EDE0', '#3654FF', '#27AE60'];
				if (this.targets?.dailyViews) {
					this.dailyViewsOptions.chartOptions.series[1].data = this.getTargetsForCharts(
						memberSeriesData,
						this.targets?.dailyViews,
						true
					);
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['dailyViewsOptions'] = this.dailyViewsOptions.chartOptions;
				} else {
					this.createChart(type, this.dailyViewsOptions.chartOptions);
				}
				break;
		}
	}

	getTargetsForCharts(memberSeriesData, targets, toBeShownAsItIs = null) {
		let target = [];
		let monthsInBetween = {};
		memberSeriesData['key'].forEach((date, i) => {
			let dateLabel = new DateTime(date).format('YYYY-MM');
			switch (this._selectedTimePeriod) {
				case SelectedTimePeriod.fourWeeks:
					if (toBeShownAsItIs) {
						if (targets[dateLabel]) {
							target[i] = Math.ceil(parseInt(targets[dateLabel]));
						} else {
							target[i] = 0;
						}
					} else {
						if (targets[dateLabel]) {
							target[i] = Math.ceil(parseInt(targets[dateLabel]) / 4);
						} else {
							target[i] = 0;
						}
					}
					break;
				case SelectedTimePeriod.threeMonths:
					if (targets[dateLabel]) {
						target[i] = parseInt(targets[dateLabel]);
					} else {
						target[i] = 0;
					}
					break;
				case SelectedTimePeriod.sixMonths:
					if (targets[dateLabel]) {
						target[i] = parseInt(targets[dateLabel]);
					} else {
						target[i] = 0;
					}
					break;
				case SelectedTimePeriod.oneYear:
					const firstMonthOfQuarter = new DateTime(date).format('YYYY-MM');
					const secondMonthOfQuarter = new DateTime(date).add(1, 'month').format('YYYY-MM');
					const thirdMonthOfQuarter = new DateTime(date).add(2, 'months').format('YYYY-MM');
					if (targets[firstMonthOfQuarter] && targets[secondMonthOfQuarter] && targets[thirdMonthOfQuarter]) {
						target[i] =
							(parseInt(targets[firstMonthOfQuarter]) +
								parseInt(targets[secondMonthOfQuarter]) +
								parseInt(targets[thirdMonthOfQuarter])) /
							3;
					} else {
						target[i] = 0;
					}
					break;
				case SelectedTimePeriod.lifetime:
					let year = dateLabel.split('-')[0];
					monthsInBetween[year] = [];
					let diff;
					if (i < memberSeriesData['key'].length) {
						diff = new DateTime(memberSeriesData['key'][i + 1]).diff(date, 'months');
					} else {
						diff = this.dateTimeHelper.yesterdayEnd.diff(date, 'months');
					}
					for (let j = 0; j < diff; j++) {
						monthsInBetween[year].push(new DateTime(date).add(j, 'months').format('YYYY-MM'));
					}
					for (let year in monthsInBetween) {
						let targetsForOneYear = 0;
						const targetKeys = Object.keys(targets);
						const isSubset = monthsInBetween[year].every(function (val) {
							return targetKeys.indexOf(val) >= 0;
						});
						if (isSubset) {
							monthsInBetween[year].forEach(month => {
								targetsForOneYear = targetsForOneYear + parseInt(targets[month]) / monthsInBetween[year].length;
							});
						}
						target[i] = targetsForOneYear;
					}
					break;
			}
		});
		return target;
	}

	async createKPIActivityCharts(groupActivityChartsData, type, selectedTimePeriod = null, isFromPublish = null) {
		if (isFromPublish) {
			return;
		}
		let memberSeriesData = {
			data: [],
			total: [],
			key: []
		};
		switch (type) {
			case 'postsChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.posts);
					memberSeriesData.total.push(data.barData.aggregatePosts);
					memberSeriesData.key.push(data.startDate);
				});
				this.postsChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.postsChartOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.postsChartOptions.chartOptions.colors = ['#D3A8F5', '#3654FF', '#27AE60'];
				this.postsChartOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.posts?.visibility === false) {
					this.postsChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.posts) {
						this.postsChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.posts
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['postsChartOptions'] = this.postsChartOptions.chartOptions;
				} else {
					this.createChart(type, this.postsChartOptions.chartOptions);
				}
				break;
			case 'commentsChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.comments);
					memberSeriesData.total.push(data.barData.aggregateComments);
					memberSeriesData.key.push(data.startDate);
				});
				this.commentsChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.commentsChartOptions.chartOptions.colors = ['#D3A8F5', '#3654FF', '#27AE60'];
				this.commentsChartOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.commentsChartOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.comments?.visibility === false) {
					this.commentsChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.comments) {
						this.commentsChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.comments
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['commentsChartOptions'] = this.commentsChartOptions.chartOptions;
				} else {
					this.createChart(type, this.commentsChartOptions.chartOptions);
				}
				break;
			case 'conversationsChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.conversations);
					memberSeriesData.total.push(data.barData.aggregateConversations);
					memberSeriesData.key.push(data.startDate);
				});
				this.conversationsChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.conversationsChartOptions.chartOptions.colors = ['#E8AFC7', '#3654FF', '#27AE60'];
				this.conversationsChartOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.conversationsChartOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.conversations?.visibility === false) {
					this.conversationsChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.conversations) {
						this.conversationsChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.conversations
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['conversationsChartOptions'] =
						this.conversationsChartOptions.chartOptions;
				} else {
					this.createChart(type, this.conversationsChartOptions.chartOptions);
				}
				break;
			case 'reactionsChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.reactions);
					memberSeriesData.total.push(data.barData.aggregateReactions);
					memberSeriesData.key.push(data.startDate);
				});
				this.reactionsChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.reactionsChartOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.reactionsChartOptions.chartOptions.colors = ['#E8AFC7', '#3654FF', '#27AE60'];
				this.reactionsChartOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.reactions?.visibility === false) {
					this.reactionsChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.reactions) {
						this.reactionsChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.reactions
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['reactionsChartOptions'] = this.reactionsChartOptions.chartOptions;
				} else {
					this.createChart(type, this.reactionsChartOptions.chartOptions);
				}
				break;
			case 'engagementChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.totalEngagement);
					memberSeriesData.total.push(data.barData.aggregateTotalEngagement);
					memberSeriesData.key.push(data.startDate);
				});
				this.engagementChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.engagementChartOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.engagementChartOptions.chartOptions.colors = ['#D5B0B0', '#3654FF', '#27AE60'];
				this.engagementChartOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.totalEngagement?.visibility === false) {
					this.engagementChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.totalEngagement) {
						this.engagementChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.totalEngagement
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['engagementChartOptions'] = this.engagementChartOptions.chartOptions;
				} else {
					this.createChart(type, this.engagementChartOptions.chartOptions);
				}
				break;
			case 'percentageEngagementChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.averageEngagementPercentage);
					memberSeriesData.key.push(data.startDate);
				});
				this.percentageEngagementChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.percentageEngagementChartOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				this.percentageEngagementChartOptions.chartOptions.colors = ['#D5B0B0', '#3654FF', '#27AE60'];
				if (this.targets?.averageEngagementPercentage?.visibility === false) {
					this.percentageEngagementChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.averageEngagementPercentage) {
						this.percentageEngagementChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.averageEngagementPercentage,
							true
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['percentageEngagementChartOptions'] =
						this.percentageEngagementChartOptions.chartOptions;
				} else {
					this.createChart(type, this.percentageEngagementChartOptions.chartOptions);
				}
				break;
			case 'engagementPerPostChartCBR':
				groupActivityChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.averageEngagementPerPost);
					memberSeriesData.key.push(data.startDate);
				});
				this.engagementPerPostChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.engagementPerPostChartOptions.chartOptions.colors = ['#D5B0B0', '#3654FF', '#27AE60'];
				this.engagementPerPostChartOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.averageEngagementPerPost?.visibility === false) {
					this.engagementPerPostChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.averageEngagementPerPost) {
						this.engagementPerPostChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.averageEngagementPerPost
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['engagementPerPostChartOptions'] =
						this.engagementPerPostChartOptions.chartOptions;
				} else {
					this.createChart(type, this.engagementPerPostChartOptions.chartOptions);
				}
				break;
		}
	}

	async createKPIInsightsCharts(getGroupInsightsChartsData, type, selectedTimePeriod = null, isFromPublish = null) {
		this.memberAdminPostRatioChartOptions.chartOptions.yAxis.title.text = 'Percentage';
		this.surveyOptions.chartOptions.yAxis.title.text = 'Number of Surveys';
		this.membershipRequestsChartOptions.chartOptions.yAxis.title.text = 'Percentage';
		if (isFromPublish) {
			return;
		}
		let memberSeriesData = {
			data: [],
			total: [],
			key: []
		};
		switch (type) {
			case 'memberAdminPostRatioCBR':
				getGroupInsightsChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.averageMemberToAdminPostRatio);
					memberSeriesData.key.push(data.startDate);
				});
				this.memberAdminPostRatioChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.memberAdminPostRatioChartOptions.chartOptions.colors = ['#D3A8F5', '#3654FF', '#27AE60'];
				this.memberAdminPostRatioChartOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.memberAdminPostRatio?.visibility === false) {
					this.memberAdminPostRatioChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.memberAdminPostRatio) {
						this.memberAdminPostRatioChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.memberAdminPostRatio,
							true
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['memberAdminPostRatioChartOptions'] =
						this.memberAdminPostRatioChartOptions.chartOptions;
				} else {
					this.createChart(type, this.memberAdminPostRatioChartOptions.chartOptions);
				}
				break;
			case 'surveysCBR':
				getGroupInsightsChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.surveys);
					memberSeriesData.total.push(data.barData.aggregateComments);
					memberSeriesData.key.push(data.startDate);
				});
				this.surveyOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.surveyOptions.chartOptions.colors = ['#767575', '#3654FF', '#27AE60'];
				this.surveyOptions.chartOptions.xAxis.categories = memberSeriesData['key'];
				if (this.targets?.surveys?.visibility === false) {
					this.surveyOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.surveys) {
						this.surveyOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.surveys
						);
					}
				}
				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['surveyOptions'] = this.surveyOptions.chartOptions;
				} else {
					this.createChart(type, this.surveyOptions.chartOptions);
				}
				break;
			case 'impressionsCBR':
				getGroupInsightsChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.impressions);
					memberSeriesData.total.push(data.barData.aggregateImpressions);
					memberSeriesData.key.push(data.startDate);
				});
				this.impressionsChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.impressionsChartOptions.chartOptions.series[2].data = memberSeriesData['total'];
				this.impressionsChartOptions.chartOptions.colors = ['#FFBB78', '#3654FF', '#27AE60'];
				this.impressionsChartOptions.chartOptions.xAxis[0].categories = memberSeriesData['key'];
				if (this.targets?.impressions?.visibility === false) {
					this.impressionsChartOptions.chartOptions.series[1].data = [];
				} else {
					if (this.targets?.impressions) {
						this.impressionsChartOptions.chartOptions.series[1].data = this.getTargetsForCharts(
							memberSeriesData,
							this.targets?.impressions
						);
					}
				}

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['impressionsChartOptions'] = this.impressionsChartOptions.chartOptions;
				} else {
					this.createChart(type, this.impressionsChartOptions.chartOptions);
				}
				break;

			case 'membershipRequestsChartCBR':
				getGroupInsightsChartsData.forEach(data => {
					memberSeriesData.data.push(data.barData.membershipRequestsAccepted);
					memberSeriesData.total.push(data.barData.membershipRequestsDeclined);
					memberSeriesData.key.push(data.startDate);
				});
				this.membershipRequestsChartOptions.chartOptions.series[0].data = memberSeriesData['data'];
				this.membershipRequestsChartOptions.chartOptions.series[1].data = memberSeriesData['total'];
				this.membershipRequestsChartOptions.chartOptions.colors = ['#8CC7FD', '#F99999'];
				this.membershipRequestsChartOptions.chartOptions.xAxis.categories = memberSeriesData['key'];

				if (isFromPublish) {
					this.kpiDataJson[selectedTimePeriod]['membershipRequestsChartOptions'] =
						this.membershipRequestsChartOptions.chartOptions;
				} else {
					this.createChart(type, this.membershipRequestsChartOptions.chartOptions);
				}
				break;
		}
	}

	async createKPICharts(selectedTimePeriod, isFromPublish) {
		this.memberval1 = this.kpiTrapezoidChartData?.totalMembers;
		this.memberval2 = this.kpiTrapezoidChartData?.monthlyActiveUsers
			? this.kpiTrapezoidChartData.monthlyActiveUsers
			: 0;
		this.memberval3 = this.kpiTrapezoidChartData?.dailyActiveUsers;
		this.maxMemberNumber = Math.max(this.memberval1, this.memberval2, this.memberval3);
		this.memberval11 = (this.memberval1 * 220) / this.maxMemberNumber;
		this.memberval21 = (this.memberval2 * 220) / this.maxMemberNumber;
		this.engagementval1 = this.kpiTrapezoidChartData?.impressions;
		this.engagementval2 = this.kpiTrapezoidChartData?.engagement;
		this.engagementval3 = this.kpiTrapezoidChartData?.conversations;
		this.engagementval4 = this.kpiTrapezoidChartData?.posts;
		this.maxEngagementNumber = Math.max(
			this.engagementval1,
			this.engagementval2,
			this.engagementval3,
			this.engagementval4
		);
		this.engagementval11 = (this.engagementval1 * 220) / this.maxEngagementNumber;
		this.engagementval21 = (this.engagementval2 * 220) / this.maxEngagementNumber;
		this.engagementval32 = (this.engagementval3 * 220) / this.maxEngagementNumber;
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	selectTab(tab) {
		this.tabSelected = tab;
		switch (tab) {
			case 'Members':
				this.DauMauOptions.chartOptions.yAxis.title.text = 'Ratio';
				this.dailyActiveUsersOptions.chartOptions.yAxis.title.text = 'Number of Users';
				this.dailyActiveUsersPercentageOptions.chartOptions.yAxis.title.text = 'Percentage of Users';
				this.monthlyActiveUsersOptions.chartOptions.yAxis.title.text = 'Number of Users';
				this.monthlyActiveUsersPercentageOptions.chartOptions.yAxis.title.text = 'Percentage of Users';
				this.createChart('membersOnboardedChart', this.membersOnboardedOptions.chartOptions);
				this.createChart('DauMauChart', this.DauMauOptions.chartOptions);
				this.createChart('dailyActiveUsersChart', this.dailyActiveUsersOptions.chartOptions);
				this.createChart('MonthlyActiveUsersChart', this.monthlyActiveUsersOptions.chartOptions);
				this.createChart('dailyActiveUsersPercentageChart', this.dailyActiveUsersPercentageOptions.chartOptions);
				this.createChart('monthlyActiveUsersPercentageChart', this.monthlyActiveUsersPercentageOptions.chartOptions);
				break;
			case 'Activity':
				this.engagementPerPostChartOptions.chartOptions.yAxis.title.text = 'Engagement per Post';
				this.percentageEngagementChartOptions.chartOptions.yAxis.title.text = 'Percentage';
				this.createChart('postsChart', this.postsChartOptions.chartOptions);
				this.createChart('commentsChart', this.commentsChartOptions.chartOptions);
				this.createChart('conversationsChart', this.conversationsChartOptions.chartOptions);
				this.createChart('reactionsChart', this.reactionsChartOptions.chartOptions);
				this.createChart('engagementChart', this.engagementChartOptions.chartOptions);
				this.createChart('percentageEngagementChart', this.percentageEngagementChartOptions.chartOptions);
				this.createChart('engagementPerPostChart', this.engagementPerPostChartOptions.chartOptions);
				break;
			case 'Insights':
				this.memberAdminPostRatioChartOptions.chartOptions.yAxis.title.text = 'Percentage';
				this.surveyOptions.chartOptions.yAxis.title.text = 'Number of Surveys';
				this.membershipRequestsChartOptions.chartOptions.yAxis.title.text = 'Percentage';
				this.createChart('memberAdminPostRatio', this.memberAdminPostRatioChartOptions.chartOptions);
				this.createChart('surveys', this.surveyOptions.chartOptions);
				this.createChart('impressions', this.impressionsChartOptions.chartOptions);
				this.createChart('membershipRequestsChart', this.membershipRequestsChartOptions);
				break;
		}
	}

	async getKpiJSON() {
		// ['fourWeeks', 'threeMonths', 'sixMonths', 'oneYear', 'lifetime'].forEach(async selectedTimePeriod => {
		// 	this.kpiDataJson[selectedTimePeriod] = {};
		// 	await this.setChartOptions(selectedTimePeriod, true);
		// });
		this.kpiDataJson['fourWeeks'] = {};
		this.kpiDataJson['threeMonths'] = {};
		this.kpiDataJson['sixMonths'] = {};
		this.kpiDataJson['oneYear'] = {};
		this.kpiDataJson['lifetime'] = {};
		await this.setChartOptions('fourWeeks', true);
		await this.setChartOptions('threeMonths', true);
		await this.setChartOptions('sixMonths', true);
		await this.setChartOptions('oneYear', true);
		await this.setChartOptions('lifetime', true);
		this.kpiDataJson['isMemberTrapezoidChartVisible'] = this.isMemberTrapezoidChartVisible;
		this.kpiDataJson['isUserEngagementTrapezoidChartVisible'] = this.isUserEngagementTrapezoidChartVisible;
		this.kpiDataJson['isTotalMembersOnboardedChartVisible'] = this.isTotalMembersOnboardedChartVisible;
		this.kpiDataJson['isDAUMAUChartVisible'] = this.isDAUMAUChartVisible;
		this.kpiDataJson['isMonthlyActiveUsersChartVisible'] = this.isMonthlyActiveUsersChartVisible;
		this.kpiDataJson['isMonthlyActiveUsersPercentageChartVisible'] = this.isMonthlyActiveUsersPercentageChartVisible;
		this.kpiDataJson['isDailyActiveUsersChartVisible'] = this.isDailyActiveUsersChartVisible;
		this.kpiDataJson['isDailyActiveUsersPercentageChartVisible'] = this.isDailyActiveUsersPercentageChartVisible;
		this.kpiDataJson['isPostsChartVisible'] = this.isPostsChartVisible;
		this.kpiDataJson['isCommentsChartVisible'] = this.isCommentsChartVisible;
		this.kpiDataJson['isConversationsChartVisible'] = this.isConversationsChartVisible;
		this.kpiDataJson['isReactionsChartVisible'] = this.isReactionsChartVisible;
		this.kpiDataJson['isTotalEngagementChartVisible'] = this.isTotalEngagementChartVisible;
		this.kpiDataJson['isAverageEngagementPercentageChartVisible'] = this.isAverageEngagementPercentageChartVisible;
		this.kpiDataJson['isAverageEngagementPerPosChartVisible'] = this.isAverageEngagementPerPosChartVisible;
		this.kpiDataJson['isMemberAdminRatioChartVisible'] = this.isMemberAdminRatioChartVisible;
		this.kpiDataJson['isSurveysChartVisible'] = this.isSurveysChartVisible;
		this.kpiDataJson['isImpressionsChartVisible'] = this.isImpressionsChartVisible;
		this.kpiDataJson['isMembershipRequestsChartVisible'] = this.isMembershipRequestsChartVisible;
		this.kpiJson.emit(this.kpiDataJson);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
