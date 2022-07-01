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
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {SelectedTimePeriod} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {DateTime} from '@sharedModule/models/date-time';
import {GroupModel} from '@sharedModule/models/group.model';
import * as _ from 'lodash';
import {UtilityService} from '@sharedModule/services/utility.service';
import {HTMLInputElement} from 'happy-dom';

@Component({
	selector: 'app-brand-community-word-cloud',
	templateUrl: './brand-community-word-cloud.component.html',
	styleUrls: ['./brand-community-word-cloud.component.scss']
})
export class BrandCommunityWordCloudComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupId: string;
	@Input() brandId: string;
	@Input() group: GroupModel;
	_selectedTimePeriod: string;
	groupTimezoneName: string | null;
	wordCloudData: any;
	private timePeriodForReportGeneration: any;
	totalCount;
	wordCloudDataToBeShown;
	isWordCloudVisible = false;
	wordcloudDataJson = {};
	@ViewChild('wordCloud') public wordCloud: ElementRef;

	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
		this.getWordCloudData(this._selectedTimePeriod);
	}
	@Output() wordCloudJson = new EventEmitter();
	@Output() openEdit = new EventEmitter();
	@Output() wordCloudDataToParent = new EventEmitter();
	private dateTimeHelper: DateTimeHelper;
	chartOptions;
	editingSupportingText = false;
	supportingText;
	@Input() set supportingTextInput(value) {
		this.supportingText = value;
	}

	constructor(
		injector: Injector,
		private brandCommunityReportService: BrandCommunityReportService,
		private createCampaignService: CreateCampaignService,
		private utilityService: UtilityService
	) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.getWordCloudData(this._selectedTimePeriod);
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

	async getWordCloudData(selectedTimePeriod, isFromPublish = null) {
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
					startDate: this.utilityService.getLastOneYearInQuartersStartDate().format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.lifetime:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime(this.group.groupCreatedAtUTC).dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
		}
		const data = await this.brandCommunityReportService.getCBRWordCloudData(
			this.groupId,
			this.timePeriodForReportGeneration.startDate,
			this.timePeriodForReportGeneration.endDate
		);
		this.wordcloudDataJson[selectedTimePeriod] = {};
		this.wordcloudDataJson[selectedTimePeriod]['wordCloudData'] = data;
		if (isFromPublish) {
			return;
		}
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
		if (isFromPublish) {
			this.wordcloudDataJson[selectedTimePeriod]['wordCloudData'] = this.chartOptions;
		} else {
			this.createChart(this.wordCloud?.nativeElement, this.chartOptions);
			this.totalCount = 0;
			this.wordCloudData.forEach(data => {
				this.totalCount = this.totalCount + data.weight;
			});
			this.wordCloudDataToBeShown = _.orderBy(this.wordCloudData, 'weight', ['desc']).slice(0, 5);
			this.wordCloudData = _.orderBy(this.wordCloudData, 'weight', ['desc']);
		}
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	async getWordCloudJSON() {
		await this.getWordCloudData('fourWeeks', true);
		await this.getWordCloudData('threeMonths', true);
		await this.getWordCloudData('sixMonths', true);
		await this.getWordCloudData('oneYear', true);
		await this.getWordCloudData('lifetime', true);
		this.wordcloudDataJson['isWordCloudVisible'] = this.isWordCloudVisible;
		this.wordCloudJson.emit(this.wordcloudDataJson);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
