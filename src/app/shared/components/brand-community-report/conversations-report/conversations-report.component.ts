import {
	Component,
	EventEmitter,
	ElementRef,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';
import dayjs from 'dayjs';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {ConversationTrendsModel} from '@sharedModule/models/conversation-trends.model';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {GroupTrendsReportService} from '@groupAdminModule/_services/group-conversation-trends.service';
import Highcharts from 'highcharts';
import {PieChartModel, StackedColumnChartModel} from '@sharedModule/models/group-reports/chart.model';
import {DateTime} from '@sharedModule/models/date-time';
import {UtilityService} from '@sharedModule/services/utility.service';
import * as _ from 'lodash';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {SelectedTimePeriod} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {ReferenceConversationData} from '@sharedModule/components/cmcReport-v3/reference-conversation/reference-conversation.component';
import {Keyword} from '@sharedModule/models/graph-ql.model';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {HTMLInputElement} from 'happy-dom';

@Component({
	selector: 'app-conversations-report',
	templateUrl: './conversations-report.component.html',
	styleUrls: ['./conversations-report.component.scss']
})
export class ConversationsReportComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaignId: string;
	@Input() groupId: string;
	@Input() brandId: string;
	@Input() brand;
	@Input() group: GroupModel;
	_selectedTimePeriod: string;
	private dateTimeHelper: DateTimeHelper;
	private conversationTrends;
	groupTimezoneName: string | null;
	@ViewChild('brandChart') public brandChart: ElementRef;
	@ViewChild('topicChart') public topicChart: ElementRef;
	@ViewChild('keywordChart') public keywordChart: ElementRef;
	@ViewChild('productChart') public productChart: ElementRef;
	@ViewChild('sentimentChart') public sentimentChart: ElementRef;
	brandOptions;
	categoryOptions;
	topicOptions;
	keywordOptions;
	productOptions;
	sentimentOptions;
	totalTopicData;
	totalKeywordData;
	totalProductData;
	timePeriodForReportGeneration: any;
	totalSentimentData;
	isBrandChartVisible = false;
	isTopicChartVisible = true;
	isKeywordChartVisible = true;
	isProductChartVisible = true;
	isSentimentChartVisible = false;
	listKeywords;
	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
		this.generateConversationTrends(this._selectedTimePeriod);
	}
	referenceConversationData;
	showReferenceConversationDialog = false;
	categoryBarClicked;
	conversationsDataJson = {};
	@Output() conversationsJson = new EventEmitter();
	editingSupportingText = false;
	supportingText;
	@Input() set supportingTextInput(value) {
		this.supportingText = value;
	}

	constructor(
		injector: Injector,
		private _groupTrendsReportService: GroupTrendsReportService,
		private utilityService: UtilityService,
		private createCampaignService: CreateCampaignService,
		private brandCommunityReportService: BrandCommunityReportService,
		private changeDetector: ChangeDetectorRef,
		private conversationService: ConversationService
	) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.brandOptions = new StackedColumnChartModel();
		this.topicOptions = new PieChartModel();
		this.keywordOptions = new PieChartModel();
		this.productOptions = new PieChartModel();
		this.sentimentOptions = new PieChartModel();
		this.generateConversationTrends(this._selectedTimePeriod);
		this.listKeywords = await this.createCampaignService.listCommunityKeywords();
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

	private async generateConversationTrends(selectedTimePeriod, isFromPublish = null) {
		if (!this.groupId) {
			return;
		}
		let lifetime = false;
		switch (selectedTimePeriod) {
			case SelectedTimePeriod.fourWeeks:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime().startOf('week').subtract(3, 'weeks').dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.threeMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(2, 'months').dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.sixMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(5, 'months').dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.oneYear:
				this.timePeriodForReportGeneration = {
					startDate: this.utilityService.getLastOneYearInQuartersStartDate().dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.lifetime:
				lifetime = true;
				this.timePeriodForReportGeneration = {
					startDate: new DateTime(this.group.groupCreatedAtUTC).dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
		}
		let metrics = await this._groupTrendsReportService.listBCRConversationData(
			this.groupId,
			this.timePeriodForReportGeneration.startDate,
			this.timePeriodForReportGeneration.endDate
		);
		const conversationData = await this.brandCommunityReportService.getCBRConversationData(
			this.groupId,
			this.timePeriodForReportGeneration.startDate.format('YYYY-MM-DD'),
			this.timePeriodForReportGeneration.endDate.format('YYYY-MM-DD'),
			lifetime
		);
		this.conversationsDataJson[selectedTimePeriod] = conversationData;
		if (isFromPublish) {
			return;
		}
		this.createBrandSOVChart(conversationData.brandSOV, selectedTimePeriod, isFromPublish);
		this.createDonutChartsForConversations(conversationData.topics, 'topTopics', selectedTimePeriod, isFromPublish);
		this.createDonutChartsForConversations(
			conversationData.keywords,
			'top10Keywords',
			selectedTimePeriod,
			isFromPublish
		);
		this.createDonutChartsForConversations(conversationData.products, 'topProducts', selectedTimePeriod, isFromPublish);
		this.createDonutChartsForSentiment(conversationData.brandSentiment, selectedTimePeriod, isFromPublish);
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	createBrandSOVChart(data, selectedTimePeriod, isFromPublish = null) {
		const categories = [];
		const series = [];
		const serieKeys = [];
		for (const item of data) {
			const brandData = JSON.parse(item.brandSOV);
			for (const key in brandData) {
				if (serieKeys.indexOf(key) < 0) {
					serieKeys.push(key);
					series.push({
						name: key,
						data: []
					});
				}
			}
		}

		for (const item of data) {
			const category = item.startDate;
			categories.push(category);
			if (item.startDate) {
				const serie = JSON.parse(item.brandSOV);
				for (const key of serieKeys) {
					const index = series.findIndex(e => e.name == key);
					if (index >= 0) {
						if (serie[key]) {
							series[index].data.push(serie[key]);
						} else {
							series[index].data.push('');
						}
					}
				}
			}
		}
		this.brandOptions.chartOptions.xAxis = {
			categories: categories,
			title: {
				text: 'Timeline'
			}
		};
		this.brandOptions.chartOptions.yAxis = {
			title: {
				text: 'Percentage'
			}
		};
		this.brandOptions.chartOptions.colors = [
			'#98DF8A',
			'#F7B6D2',
			'#9EDAE5',
			'#C5B0D5',
			'#FFBB78',
			'#8CC7FD',
			'#E68686',
			'#A799FF',
			'#FAF1A2',
			'#767575',
			'#767575',
			'#767575',
			'#767575',
			'#767575'
		];
		this.brandOptions.chartOptions.series = series;
		this.brandOptions.chartOptions.plotOptions = {
			series: {
				cursor: 'pointer',
				point: {
					events: {
						click: (event: Highcharts.SeriesClickEventObject) => {
							this.onChartColumnClick(event, 'SOV');
						}
					}
				}
			}
		};
		this.brandOptions.chartOptions.legend.enabled = false;
		if (isFromPublish) {
			this.conversationsDataJson[selectedTimePeriod]['brandOptions'] = this.brandOptions.chartOptions;
		} else {
			this.brandOptions.chartOptions.tooltip = {
				pointFormat:
					'<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
				shared: true,
				backgroundColor: 'rgba(0, 0, 0, 0.85)',
				style: {
					color: '#F0F0F0'
				}
			};
			this.brandOptions.chartOptions.plotOptions['column'] = {
				stacking: 'percent'
			};
			this.createChart(this.brandChart?.nativeElement, this.brandOptions.chartOptions);
		}
	}

	onChartColumnClick = (data, type, subcategoryType = null) => {
		const category = data.point.category as any;
		switch (type) {
			case 'SOV':
				this.categoryBarClicked = {
					brandName: data.point.series.name,
					type: category
				};
				break;
			case 'sentiment':
				this.categoryBarClicked = {
					brandName: data.point.options.name,
					type: category
				};
				break;
			case 'topics':
				this.categoryBarClicked = {
					brandName: data.point.options.name,
					type: category
				};
				break;
		}

		this.showReferenceConversation(this.categoryBarClicked, type, category, subcategoryType);
	};

	createDonutChartsForConversations(data, type, selectedTimePeriod, isFromPublish) {
		switch (type) {
			case 'topTopics':
				const topicData = JSON.parse(data);
				const topicSeries = [];
				this.totalTopicData = 0;
				for (const key in topicData) {
					const upperKey = this.capitalizeFirstLetter(key);
					topicSeries.push([upperKey, topicData[key]]);
					this.totalTopicData += topicData[key];
				}

				topicSeries.sort(function (a, b) {
					return b[1] - a[1];
				});

				this.topicOptions.chartOptions.series[0].data = topicSeries;
				this.topicOptions.chartOptions.series[0].size = '64%';
				this.topicOptions.chartOptions.series[0].innerSize = '56%';
				this.topicOptions.chartOptions.colors = ['#9EDAE5', '#8CC7FD', '#F7B6D2', '#98DF8A', '#C5B0D5'];

				this.topicOptions.chartOptions.plotOptions = {
					series: {
						cursor: 'pointer',
						point: {
							events: {
								click: (event: Highcharts.SeriesClickEventObject) => {
									this.onChartColumnClick(event, 'topics', 'Topics');
								}
							}
						}
					}
				};
				if (isFromPublish) {
					this.conversationsDataJson[selectedTimePeriod]['topicOptions'] = this.topicOptions.chartOptions;
				} else {
					this.topicOptions.chartOptions.tooltip = {
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						},
						formatter: null
					};
					this.createChart(this.topicChart?.nativeElement, this.topicOptions.chartOptions);
				}
				break;
			case 'top10Keywords':
				const keywordData = JSON.parse(data);
				const keywordSeries = [];
				this.totalKeywordData = 0;
				for (const key in keywordData) {
					const upperKey = this.capitalizeFirstLetter(key);
					keywordSeries.push([upperKey, keywordData[key]]);
					this.totalKeywordData += keywordData[key];
				}

				keywordSeries.sort(function (a, b) {
					return b[1] - a[1];
				});

				this.keywordOptions.chartOptions.series[0].data = keywordSeries;
				this.keywordOptions.chartOptions.series[0].size = '64%';
				this.keywordOptions.chartOptions.series[0].innerSize = '56%';
				this.keywordOptions.chartOptions.colors = ['#9EDAE5', '#8CC7FD', '#F7B6D2', '#98DF8A', '#C5B0D5'];
				this.keywordOptions.chartOptions.plotOptions = {
					series: {
						cursor: 'pointer',
						point: {
							events: {
								click: (event: Highcharts.SeriesClickEventObject) => {
									this.onChartColumnClick(event, 'topics', 'Keywords');
								}
							}
						}
					}
				};
				if (isFromPublish) {
					this.conversationsDataJson[selectedTimePeriod]['keywordOptions'] = this.keywordOptions.chartOptions;
				} else {
					this.keywordOptions.chartOptions.tooltip = {
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						},
						formatter: null
					};
					this.createChart(this.keywordChart?.nativeElement, this.keywordOptions.chartOptions);
				}
				break;
			case 'topProducts':
				const productData = JSON.parse(data);
				const productSeries = [];
				this.totalProductData = 0;
				for (const key in productData) {
					const upperKey = this.capitalizeFirstLetter(key);
					productSeries.push([upperKey, productData[key]]);
					this.totalProductData += productData[key];
				}

				productSeries.sort(function (a, b) {
					return b[1] - a[1];
				});

				this.productOptions.chartOptions.series[0].data = productSeries;
				this.productOptions.chartOptions.series[0].size = '64%';
				this.productOptions.chartOptions.series[0].innerSize = '56%';
				this.productOptions.chartOptions.colors = ['#9EDAE5', '#8CC7FD', '#F7B6D2', '#98DF8A', '#C5B0D5'];
				this.productOptions.chartOptions.plotOptions = {
					series: {
						cursor: 'pointer',
						point: {
							events: {
								click: (event: Highcharts.SeriesClickEventObject) => {
									this.onChartColumnClick(event, 'topics', 'Products');
								}
							}
						}
					}
				};
				if (isFromPublish) {
					this.conversationsDataJson[selectedTimePeriod]['productOptions'] = this.productOptions.chartOptions;
				} else {
					this.productOptions.chartOptions.tooltip = {
						shared: true,
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
						style: {
							color: '#F0F0F0'
						},
						formatter: null
					};
					this.createChart(this.productChart.nativeElement, this.productOptions.chartOptions);
				}
				break;
		}
	}

	createDonutChartsForSentiment(data, selectedTimePeriod, isFromPublish) {
		const sentimentData = JSON.parse(data);
		const series = [];
		for (const key in sentimentData) {
			series.push({
				name: key,
				y: sentimentData[key]
			});
		}

		this.sentimentOptions.chartOptions.series[0].data = series;
		this.sentimentOptions.chartOptions.series[0].size = '100%';
		this.sentimentOptions.chartOptions.chart['height'] = 200;
		this.sentimentOptions.chartOptions.colors = ['#F99999', '#F6E96D', '#98DF8A'];
		this.sentimentOptions.chartOptions.plotOptions = {
			series: {
				cursor: 'pointer',
				point: {
					events: {
						click: (event: Highcharts.SeriesClickEventObject) => {
							this.onChartColumnClick(event, 'sentiment');
						}
					}
				}
			}
		};
		if (isFromPublish) {
			this.conversationsDataJson[selectedTimePeriod]['sentimentOptions'] = this.sentimentOptions.chartOptions;
		} else {
			this.sentimentOptions.chartOptions.tooltip = {
				shared: true,
				backgroundColor: 'rgba(0, 0, 0, 0.85)',
				style: {
					color: '#F0F0F0'
				},
				formatter: null
			};
			this.createChart(this.sentimentChart.nativeElement, this.sentimentOptions.chartOptions);
		}

		this.totalSentimentData = 0;
		for (const serie of series) {
			this.totalSentimentData += serie.y;
		}
	}

	capitalizeFirstLetter(string) {
		if (string && string.length > 0) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		return '';
	}

	async showReferenceConversation(category, type, startDate, subcategoryType = null) {
		try {
			let referenceConversation;
			switch (type) {
				case 'SOV':
					{
						this.showReferenceConversationDialog = true;
						const element = document.getElementById('openReferenceConversationButton') as HTMLButtonElement;
						element.click();
						const uploadDataSectionName = `Brand Share of Voice_${category.brandName}`;
						let posts = [];
						referenceConversation = await this.fetchReferenceConversation(category.brandName, type, null, startDate);
						if (referenceConversation?.length) {
							posts = [...posts, ...referenceConversation];
						}

						this.referenceConversationData = {
							conversationList: posts,
							brandName: category.brandName,
							section: 'Brand Share of Voice',
							stage: '',
							percentage: category.percentage,
							uploadDataSectionName
						};
					}
					break;
				case 'sentiment':
					{
						this.showReferenceConversationDialog = true;
						const element = document.getElementById('openReferenceConversationButton') as HTMLButtonElement;
						element.click();
						const uploadDataSectionName = `Brand Sentiment_${category.type}_${category.brandName}`;
						let posts = [];
						referenceConversation = await this.fetchReferenceConversation(category.brandName, type);
						if (referenceConversation.length) {
							posts = [...posts, ...referenceConversation];
						}
						this.referenceConversationData = {
							conversationList: posts,
							brandName: category.brandName,
							section: 'Brand Sentiment',
							stage: '',
							percentage: category.percentage,
							uploadDataSectionName
						};
					}
					break;
				case 'topics':
					{
						let posts = [];

						this.showReferenceConversationDialog = true;
						const element = document.getElementById('openReferenceConversationButton') as HTMLButtonElement;
						element.click();
						const uploadDataSectionName = `Brand Sentiment_${category.type}_${category.brandName}`;

						referenceConversation = await this.fetchReferenceConversation(category.brandName, type);
						if (referenceConversation.length) {
							posts = [...posts, ...referenceConversation];
						}
						this.referenceConversationData = {
							conversationList: posts,
							brandName: category.brandName,
							section: subcategoryType,
							stage: '',
							percentage: category.percentage,
							uploadDataSectionName
						};
					}
					break;
			}
			this.changeDetector.detectChanges();
		} catch (error) {}
	}

	resetModalData() {
		this.referenceConversationData = null;
	}

	async fetchReferenceConversation(brandName: string, type, insightsType = null, startDate = null) {
		try {
			let terms;
			if (type === 'SOV' || type === 'topics') {
				terms = await this.fetchTransformationKeywords(brandName);
				if (terms.length === 0) {
					terms = [brandName];
				}
			}
			let list;
			try {
				list = [this.groupId];
			} catch (error) {
				console.warn('error while fetch camapign groups ', error);
				return;
			}
			let startDateForConversations;
			let endDateForConversations;
			if (type === 'SOV') {
				if (this._selectedTimePeriod === SelectedTimePeriod.fourWeeks) {
					startDateForConversations = new DateTime(startDate, 'YYYY MM DD').dayJsObj;
					endDateForConversations = new DateTime(startDate, 'YYYY MM DD').add(1, 'week').dayJsObj;
				}
				if (
					this._selectedTimePeriod === SelectedTimePeriod.threeMonths ||
					this._selectedTimePeriod === SelectedTimePeriod.sixMonths
				) {
					startDateForConversations = new DateTime(startDate, 'YYYY MM DD').dayJsObj;
					endDateForConversations = new DateTime(startDate, 'YYYY MM DD').add(1, 'month').dayJsObj;
				}
				if (this._selectedTimePeriod === SelectedTimePeriod.oneYear) {
					startDateForConversations = new DateTime(startDate, 'YYYY MM DD').dayJsObj;
					endDateForConversations = new DateTime(startDate, 'YYYY MM DD').add(3, 'months').dayJsObj;
				}
				if (this._selectedTimePeriod === SelectedTimePeriod.lifetime) {
					startDateForConversations = new DateTime(startDate, 'YYYY MM DD').dayJsObj;
					endDateForConversations = new DateTime(startDate, 'YYYY MM DD').add(1, 'year').dayJsObj;
				}
			}
			let keywords = type === 'SOV' ? terms : type === 'sentiment' ? [] : type === 'insights' ? terms : [];
			let sentiments = type === 'sentiment' ? [brandName?.toLowerCase()] : null;
			return await this.conversationService.getConversations(
				type === 'sentiment' ? [this.brand.name] : terms,
				[this.groupId],
				[],
				0,
				50,
				sentiments,
				null,
				type === 'SOV' ? startDateForConversations : this.timePeriodForReportGeneration.startDate,
				type === 'SOV' ? endDateForConversations : this.timePeriodForReportGeneration.endDate
			);
		} catch (error) {
			return [];
		}
	}

	async fetchTransformationKeywords(brandName) {
		const filteredKeywords = this.listKeywords.filter(obj => obj.uiFriendlyName === brandName);
		const transformationKeywords = {};
		filteredKeywords.forEach(obj => {
			if (!obj.transformations) {
				return;
			}
			this.getKeywordTRansformations(obj).forEach(key => (transformationKeywords[key] = true));
		});
		return Object.keys(transformationKeywords);
	}

	private getKeywordTRansformations(obj: Keyword) {
		return obj.transformations.replace(/_/g, ' ').split(',');
	}

	async getConversationsJSON() {
		this.conversationsDataJson['fourWeeks'] = {};
		this.conversationsDataJson['threeMonths'] = {};
		this.conversationsDataJson['sixMonths'] = {};
		this.conversationsDataJson['oneYear'] = {};
		this.conversationsDataJson['lifetime'] = {};
		await this.generateConversationTrends('fourWeeks', true);
		await this.generateConversationTrends('threeMonths', true);
		await this.generateConversationTrends('sixMonths', true);
		await this.generateConversationTrends('oneYear', true);
		await this.generateConversationTrends('lifetime', true);
		this.conversationsDataJson['isBrandChartVisible'] = this.isBrandChartVisible;
		this.conversationsDataJson['isTopicChartVisible'] = this.isTopicChartVisible;
		this.conversationsDataJson['isKeywordChartVisible'] = this.isKeywordChartVisible;
		this.conversationsDataJson['isProductChartVisible'] = this.isProductChartVisible;
		this.conversationsDataJson['isSentimentChartVisible'] = this.isSentimentChartVisible;
		this.conversationsJson.emit(this.conversationsDataJson);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
