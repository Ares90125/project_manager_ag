import {Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import Highcharts from 'highcharts';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {SelectedTimePeriod} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {DateTime} from '@sharedModule/models/date-time';
import {GroupModel} from '@sharedModule/models/group.model';
import * as _ from 'lodash';

@Component({
	selector: 'app-brand-CBR-word-cloud',
	templateUrl: './brand-cbr-word-cloud.component.html',
	styleUrls: ['./brand-cbr-word-cloud.component.scss']
})
export class BrandCbrWordCloudComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupId: string;
	@Input() group: GroupModel;
	@Input() data;
	@Input() supportingText;
	_selectedTimePeriod: string;
	groupTimezoneName: string | null;
	private wordCloudData: any;
	private timePeriodForReportGeneration: any;
	totalCount;
	wordCloudDataToBeShown;
	@ViewChild('wordCloud') public wordCloud: ElementRef;

	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
		setTimeout(async () => {
			await this.getWordCloudData(this._selectedTimePeriod);
		}, 1000);
	}
	private dateTimeHelper: DateTimeHelper;
	chartOptions;

	constructor(
		injector: Injector,
		private brandCommunityReportService: BrandCommunityReportService,
		private createCampaignService: CreateCampaignService
	) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		setTimeout(async () => {
			await this.getWordCloudData(this._selectedTimePeriod);
		}, 1000);
	}

	async getWordCloudData(selectedTimePeriod) {
		if (!this.groupId) {
			return;
		}
		switch (selectedTimePeriod) {
			case SelectedTimePeriod.fourWeeks:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime().startOf('week').subtract(3, 'weeks').dayJsObj.format('YYYY-MM-DD'),
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
					startDate: new DateTime(this.group.groupCreatedAtUTC).dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
		}
		const data = this.data[selectedTimePeriod]['wordCloudData'];
		this.wordCloudData = [];
		Object.keys(JSON.parse(data)).forEach(key => {
			this.wordCloudData.push({name: key, weight: JSON.parse(data)[key]});
		});
		this.chartOptions = {
			tooltip: {
				enabled: false
			},
			chart: {
				backgroundColor: 'transparent'
			},
			credits: {
				enabled: false
			},
			title: {
				text: ''
			},
			legend: {
				shadow: false,
				enabled: false
			},
			colors: ['#1f77b4'],
			series: [
				{
					minFontSize: 45,
					maxFontSize: 90,

					type: 'wordcloud',
					spiral: 'archimedean',
					data: _.orderBy(this.wordCloudData, 'weight', ['desc']).slice(0, 30),
					name: ''
				}
			]
		};
		this.createChart(this.wordCloud?.nativeElement, this.chartOptions);
		this.totalCount = 0;
		this.wordCloudData.forEach(data => {
			this.totalCount = this.totalCount + data.weight;
		});
		this.wordCloudDataToBeShown = _.orderBy(this.wordCloudData, 'weight', ['desc']).slice(0, 5);
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
