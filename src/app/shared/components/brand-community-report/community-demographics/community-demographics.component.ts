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
import * as _ from 'lodash';
import {PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {HTMLInputElement} from 'happy-dom';

@Component({
	selector: 'app-community-demographics',
	templateUrl: './community-demographics.component.html',
	styleUrls: ['./community-demographics.component.scss']
})
export class CommunityDemographicsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupId: string;
	@Input() brandId: string;
	@Input() group: GroupModel;
	_selectedTimePeriod: string;
	groupTimezoneName: string | null;
	genderDistributionChartOptions;
	ageWiseGenderDistributionChartOptions;
	userDistributionIn5CountriesChartOptions;
	userDistributionIn10CitiesChartOptions;
	totalWomen;
	totalMen;
	demographicsDataJson = {};
	isGenderDistributionChartVisible = true;
	isAgeWiseDistributionChartVisible = true;
	isCountryWiseUsersChartVisible = true;
	isCityWiseUsersChartVisible = true;
	@Output() demographicsJson = new EventEmitter();
	editingSupportingText = false;
	supportingText;
	@Input() set supportingTextInput(value) {
		this.supportingText = value;
	}

	@Output() openEdit = new EventEmitter();
	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
		this.setChartOptions();
	}
	private dateTimeHelper: DateTimeHelper;

	constructor(injector: Injector, private brandCommunityReportService: BrandCommunityReportService) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.genderDistributionChartOptions = new PieChartModel();
		this.ageWiseGenderDistributionChartOptions = new ColumnStackedChart();
		this.ageWiseGenderDistributionChartOptions = new ColumnStackedChart();
		this.userDistributionIn5CountriesChartOptions = new ColumnWIthTargetChart();
		this.userDistributionIn10CitiesChartOptions = new ColumnWIthTargetChart();
		this.setChartOptions();
	}

	async setChartOptions(isFromPublish = null) {
		if (!this.groupId) {
			return;
		}
		const metrics = await this.brandCommunityReportService.getGroupInsights(this.groupId);
		this.setChartsData(metrics, isFromPublish);
	}

	openSupportingTextArea(event) {
		event.currentTarget.nextElementSibling.classList.add('show');
		event.currentTarget.classList.remove('show');
	}

	editSupportingText(event) {
		event.currentTarget.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.classList.remove('show');
	}

	hideSupportingTextArea(event) {
		event.currentTarget.parentElement.parentElement.classList.remove('show');
		event.currentTarget.parentElement.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.parentElement.nextElementSibling.classList.add('show');
	}

	async saveSupportingText(event, type) {
		this.editingSupportingText = true;
		const text = (event.currentTarget.parentElement.previousSibling as HTMLInputElement).value;
		if (text.trim().length === 0) {
			if (this.supportingText[type]) {
				delete this.supportingText[type];
			}
		} else {
			this.supportingText[type] = text;
		}
		await this.brandCommunityReportService.updateBrandCommunityReport({
			brandId: this.brandId,
			groupId: this.groupId,
			supportingText: JSON.stringify(this.supportingText)
		});
		this.editingSupportingText = false;
		event.target.parentElement.parentElement.classList.remove('show');
		setTimeout(() => {
			event.target.parentElement.parentElement.previousElementSibling.classList.add('show');
			event.target.parentElement.parentElement.nextElementSibling.classList.add('show');
		}, 1000);
	}

	async setChartsData(metrics, isFromPublish = null) {
		const groupsAgeGenderInsights = metrics.groupsAgeGenderInsights;
		const groupsCityCountryInsights = metrics.groupsCityCountryInsights;
		this.totalWomen = 0;
		this.totalMen = 0;
		let ageRange = [];
		let women = [];
		let men = [];
		groupsAgeGenderInsights.forEach(metric => {
			this.totalWomen = this.totalWomen + parseInt(metric.women);
			this.totalMen = this.totalMen + parseInt(metric.men);
			women.push(metric.women);
			men.push(metric.men);
			ageRange.push(metric.ageRange);
		});
		const groupMembersChartsData = {
			women: this.totalWomen,
			men: this.totalMen,
			womenArr: women,
			menArr: men,
			ageRange: ageRange
		};
		const userDistributionIn5CountriesChartData = JSON.parse(metrics.top5Countries);
		const userDistributionIn10CitiesChartData = JSON.parse(metrics.top10Cities);
		this.createGenderDistributionCharts(groupMembersChartsData, 'genderDistribution', isFromPublish);
		this.createGenderDistributionCharts(groupMembersChartsData, 'ageWiseGenderDistribution', isFromPublish);
		this.createGenderDistributionCharts(
			userDistributionIn5CountriesChartData,
			'userDistributionIn5Countries',
			isFromPublish
		);
		this.createGenderDistributionCharts(
			userDistributionIn10CitiesChartData,
			'userDistributionIn10Cities',
			isFromPublish
		);
	}

	async createGenderDistributionCharts(groupMembersChartsData, type, isFromPublish) {
		switch (type) {
			case 'genderDistribution':
				this.genderDistributionChartOptions.chartOptions.series[0].data = [
					['Women', groupMembersChartsData.women],
					['men', groupMembersChartsData.men]
				];
				this.genderDistributionChartOptions.chartOptions.colors = ['#C5B0D5', '#9EDAE5'];
				this.genderDistributionChartOptions.chartOptions.series[0].size = '100%';
				this.genderDistributionChartOptions.chartOptions.series[0].innerSize = '64%';
				this.genderDistributionChartOptions.chartOptions.chart = {
					height: 200
				};
				this.genderDistributionChartOptions.chartOptions.plotOptions.pie.dataLabels.enabled = false;
				if (isFromPublish) {
					this.demographicsDataJson['genderDistributionChartOptions'] =
						this.genderDistributionChartOptions.chartOptions;
				} else {
					this.genderDistributionChartOptions.chartOptions.tooltip = {
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						},
						formatter: null
					};
					this.createChart(type, this.genderDistributionChartOptions.chartOptions);
				}
				break;
			case 'ageWiseGenderDistribution':
				this.ageWiseGenderDistributionChartOptions.chartOptions.colors = ['#C5B0D5', '#9EDAE5'];
				this.ageWiseGenderDistributionChartOptions.chartOptions.series[0].data = groupMembersChartsData.womenArr;
				this.ageWiseGenderDistributionChartOptions.chartOptions.series[0].name = 'Women';
				this.ageWiseGenderDistributionChartOptions.chartOptions.chart.backgroundColor = '#fff';
				this.ageWiseGenderDistributionChartOptions.chartOptions.series[1].data = groupMembersChartsData.menArr;
				this.ageWiseGenderDistributionChartOptions.chartOptions.series[1].name = 'Men';
				this.ageWiseGenderDistributionChartOptions.chartOptions.xAxis.categories = groupMembersChartsData.ageRange;
				this.ageWiseGenderDistributionChartOptions.chartOptions.plotOptions.column['pointWidth'] = 32;
				this.ageWiseGenderDistributionChartOptions.chartOptions.xAxis.title.text = 'Age group';
				this.ageWiseGenderDistributionChartOptions.chartOptions.yAxis.title.text = 'Percentage';
				this.ageWiseGenderDistributionChartOptions.chartOptions.chart['height'] = 200;
				if (isFromPublish) {
					this.demographicsDataJson['ageWiseGenderDistributionChartOptions'] =
						this.ageWiseGenderDistributionChartOptions.chartOptions;
				} else {
					this.ageWiseGenderDistributionChartOptions.chartOptions.tooltip = {
						pointFormat:
							'<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						},
						formatter: null
					};
					this.createChart(type, this.ageWiseGenderDistributionChartOptions.chartOptions);
				}
				break;
			case 'userDistributionIn5Countries':
				let countryData = [];
				let countryKey = [];
				Object.keys(groupMembersChartsData).forEach((key, i) => {
					countryKey.push(key);
					countryData.push(groupMembersChartsData[key]);
				});
				countryKey = countryKey.slice(0, 5);
				countryData = countryData.slice(0, 5);
				this.userDistributionIn5CountriesChartOptions.chartOptions.series[0].data = countryData;
				this.userDistributionIn5CountriesChartOptions.chartOptions.series[0].pointWidth = 10;
				this.userDistributionIn5CountriesChartOptions.chartOptions.colors = ['#8CC7FD', '#9EDAE5'];
				this.userDistributionIn5CountriesChartOptions.chartOptions.chart.type = 'bar';
				this.userDistributionIn5CountriesChartOptions.chartOptions.chart.backgroundColor = '#fff';
				this.userDistributionIn5CountriesChartOptions.chartOptions.xAxis.categories = countryKey;
				this.userDistributionIn5CountriesChartOptions.chartOptions.xAxis.title.text = 'Countries';
				this.userDistributionIn5CountriesChartOptions.chartOptions.yAxis.title.text = 'Number of Users';
				this.userDistributionIn5CountriesChartOptions.chartOptions.chart['height'] = 200;
				if (isFromPublish) {
					this.demographicsDataJson['userDistributionIn5CountriesChartOptions'] =
						this.userDistributionIn5CountriesChartOptions.chartOptions;
				} else {
					this.userDistributionIn5CountriesChartOptions.chartOptions.tooltip = {
						pointFormat:
							'<span style="color:{point.color}">\u25CF</span> <span><b>{point.name}: </span>{point.y:,.0f}<br/>',
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						}
					};
					this.userDistributionIn5CountriesChartOptions.chartOptions.series[0].name = '';
					this.createChart(type, this.userDistributionIn5CountriesChartOptions.chartOptions);
				}
				break;
			case 'userDistributionIn10Cities':
				let cityData = [];
				let cityKey = [];
				Object.keys(groupMembersChartsData).forEach((key, i) => {
					cityKey.push(key);
					cityData.push(groupMembersChartsData[key]);
				});
				this.userDistributionIn10CitiesChartOptions.chartOptions.series[0].data = cityData;
				this.userDistributionIn10CitiesChartOptions.chartOptions.series[0].pointWidth = 32;
				this.userDistributionIn10CitiesChartOptions.chartOptions.chart.backgroundColor = '#fff';
				this.userDistributionIn10CitiesChartOptions.chartOptions.colors = ['#8CC7FD', '#9EDAE5'];
				this.userDistributionIn10CitiesChartOptions.chartOptions.xAxis.categories = cityKey;
				this.userDistributionIn10CitiesChartOptions.chartOptions.xAxis.title.text = 'Cities';
				this.userDistributionIn10CitiesChartOptions.chartOptions.yAxis.title.text = 'Number of Users';
				this.userDistributionIn10CitiesChartOptions.chartOptions.chart['height'] = 200;
				if (isFromPublish) {
					this.demographicsDataJson['userDistributionIn10CitiesChartOptions'] =
						this.userDistributionIn10CitiesChartOptions.chartOptions;
				} else {
					this.userDistributionIn10CitiesChartOptions.chartOptions.tooltip = {
						pointFormat:
							'<span style="color:{point.color}">\u25CF</span> <span><b>{point.name}: </span>{point.y:,.0f}<br/>',
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						}
					};
					this.userDistributionIn10CitiesChartOptions.chartOptions.series[0].name = '';
					this.createChart(type, this.userDistributionIn10CitiesChartOptions.chartOptions);
				}
				break;
		}
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	async getDemographicsJSON() {
		await this.setChartOptions(true);
		this.demographicsDataJson['isGenderDistributionChartVisible'] = this.isGenderDistributionChartVisible;
		this.demographicsDataJson['isAgeWiseDistributionChartVisible'] = this.isAgeWiseDistributionChartVisible;
		this.demographicsDataJson['isCountryWiseUsersChartVisible'] = this.isCountryWiseUsersChartVisible;
		this.demographicsDataJson['isCityWiseUsersChartVisible'] = this.isCityWiseUsersChartVisible;
		this.demographicsJson.emit(this.demographicsDataJson);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
