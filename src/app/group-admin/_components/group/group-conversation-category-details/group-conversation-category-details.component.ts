import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {WordCloudService} from 'src/app/shared/services/word-cloud.service';
import {BarChartModel, PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {GroupTrendsReportService} from '../../../_services/group-conversation-trends.service';
import {OnPropertyChange} from '@sharedModule/decorator/property-changes.decorator';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-group-conversation-category-details',
	templateUrl: './group-conversation-category-details.component.html',
	styleUrls: ['./group-conversation-category-details.component.scss']
})
export class GroupConversationCategoryDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() category: string;
	@Input() groupId: string;
	@Input() @OnPropertyChange('onGroupChange') group: GroupModel;
	@Input() days;
	@Output() closeCategory = new EventEmitter<boolean>();
	@Output() goToOverviewPage = new EventEmitter<string>();
	container = null;

	summaryReportForLast30Days;

	metricsForLastMonth = new BehaviorSubject<any>(null);
	metricsForSecondMonth = new BehaviorSubject<any>(null);
	metricsForThirdMonth = new BehaviorSubject<any>(null);
	metricsForCurrentMonth = new BehaviorSubject<any>(null);

	wordCloudForLastMonth;
	wordCloudForSecondMonth;
	wordCloudForThirdMonth;

	pieChartForCurrentMonth;
	pieChartForLastMonth;
	pieChartForLastTwoMonths;
	pieChartForLastThreeMonths;

	barChartForCurrentMonth;
	barChartForLastMonth;
	barChartForLastTwoMonths;
	barChartForLastThreeMonths;

	selectedMonth = 'currentMonth';
	hashParam = '';
	monthWords = DateTime.getMonths();

	constructor(
		injector: Injector,
		private readonly groupTrendsReportService: GroupTrendsReportService,
		private readonly wordCloudService: WordCloudService,
		private readonly router: Router
	) {
		super(injector);
	}

	onGroupChange(group: GroupModel) {
		if (group.businessCategory !== 'Parenting') {
			this.goToOverviewPage.next('overview');
		}
	}

	ngOnInit() {
		super._ngOnInit();
		this.container = $('.group-conversation-category-details');
		this.navigateAsPerHash(this.appService.currentGroupPageUrl);
		this.getLast30DaysMetrics();
		this.generateReportForCurrentMonth();
		this.getDetailsFromLastThreeMonths();
		window.scrollTo(0, 0);
	}

	async getLast30DaysMetrics() {
		const startDateAtUtc = new DateTime().subtract(28, 'days').startOf('day');
		const endDateAtUtc = new DateTime().startOf('day');
		const metrics = await this.groupTrendsReportService.getKeywordMetrics(
			this.groupId,
			startDateAtUtc.dayJsObj,
			endDateAtUtc.dayJsObj
		);
		let numOfComments = 0;
		let numOfPosts = 0;
		let numOfReactions = 0;
		let numOfConversations = 0;
		metrics.items.forEach(item => {
			for (const i of Object.keys(item.categories)) {
				if (i.toLowerCase() === this.category.toLowerCase()) {
					numOfComments += item.categories[i].numComment ? item.categories[i].numComment : 0;
					numOfPosts += item.categories[i].numPost ? item.categories[i].numPost : 0;
					numOfReactions += item.categories[i].numReactions ? item.categories[i].numReactions : 0;
				}
			}
		});

		numOfConversations += numOfComments + numOfPosts;

		this.summaryReportForLast30Days = {
			numOfComments: numOfComments,
			numOfPosts: numOfPosts,
			numOfReactions: numOfReactions,
			numOfConversations: numOfConversations
		};
	}

	async getDetailsFromLastThreeMonths() {
		for (let k = 1; k <= 3; k++) {
			const startDateAtUtc = new DateTime().subtract(k, 'months').startOf('month');
			const endDateAtUtc = new DateTime().subtract(k, 'months').endOf('month');
			const metrics = await this.groupTrendsReportService.getKeywordMetrics(
				this.groupId,
				startDateAtUtc.dayJsObj,
				endDateAtUtc.dayJsObj
			);
			const categoryData = await this.setCategoryTrendsData(metrics.items);
			if (Object.keys(categoryData).length > 0) {
				const wordCloudRawData = this.setWordCloudChartForKeyWords(categoryData);
				const wordCloudData = wordCloudRawData ? await this.wordCloudService.getWordCloudData(wordCloudRawData) : null;
				if (k === 1 && metrics.items) {
					this.wordCloudForLastMonth = wordCloudRawData ? {wordCloudData: wordCloudData} : {wordCloudData: null};
					this.metricsForLastMonth.next(categoryData);
				} else if (k === 2 && metrics.items) {
					this.wordCloudForSecondMonth = wordCloudRawData ? {wordCloudData: wordCloudData} : {wordCloudData: null};
					this.metricsForSecondMonth.next(categoryData);
				} else if (metrics.items) {
					this.wordCloudForThirdMonth = wordCloudRawData ? {wordCloudData: wordCloudData} : {wordCloudData: null};
					this.metricsForThirdMonth.next(categoryData);
				}
			} else {
				if (k === 1) {
					this.wordCloudForLastMonth = {};
				} else if (k === 2) {
					this.wordCloudForSecondMonth = {};
				} else {
					this.wordCloudForThirdMonth = {};
				}
			}
		}

		this.generateReportForLastMonth();
		this.generateReportForLastTwoMonths();
		this.generateReportForLastThreeMonths();
	}

	async generateReportForCurrentMonth() {
		const startDateAtUtc = new DateTime().startOf('month');
		const endDateAtUtc = new DateTime();
		const metrics = await this.groupTrendsReportService.getKeywordMetrics(
			this.groupId,
			startDateAtUtc.dayJsObj,
			endDateAtUtc.dayJsObj
		);
		const categoryData = this.setCategoryTrendsData(metrics.items);
		this.metricsForCurrentMonth.next(categoryData);
		const currentMonth = [];
		currentMonth.push(this.metricsForCurrentMonth.getValue());
		const chartData = this.setCategoryTrendsDataByGivenMonths(currentMonth);
		this.pieChartForCurrentMonth = new PieChartModel();
		this.pieChartForCurrentMonth.chartOptions = this.generatePieChartForKeyWords(chartData, '');
		this.barChartForCurrentMonth = new BarChartModel();
		this.barChartForCurrentMonth.chartOptions = this.generateBarChartForKeyWords(chartData, 'Current Month');
	}

	generateReportForLastMonth() {
		if (!this.metricsForLastMonth.getValue()) {
			this.pieChartForLastMonth = {};
			this.barChartForLastMonth = {};
			return;
		}
		const lastMonthData = [];
		lastMonthData.push(this.metricsForLastMonth.getValue());
		const chartData = this.setCategoryTrendsDataByGivenMonths(lastMonthData);
		this.pieChartForLastMonth = new PieChartModel();
		this.pieChartForLastMonth.chartOptions = this.generatePieChartForKeyWords(chartData, '');
		this.barChartForLastMonth = new BarChartModel();
		this.barChartForLastMonth.chartOptions = this.generateBarChartForKeyWords(chartData, 'Last Month');
	}

	generateReportForLastTwoMonths() {
		const lastTwoMonthsData = [];

		if (!this.metricsForLastMonth.getValue() && !this.metricsForSecondMonth.getValue()) {
			this.pieChartForLastTwoMonths = {};
			this.barChartForLastTwoMonths = {};
			return;
		} else if (this.metricsForLastMonth.getValue()) {
			lastTwoMonthsData.push(this.metricsForLastMonth.getValue());
		} else if (this.metricsForSecondMonth.getValue()) {
			lastTwoMonthsData.push(this.metricsForSecondMonth.getValue());
		}

		const chartData = this.setCategoryTrendsDataByGivenMonths(lastTwoMonthsData);
		this.pieChartForLastTwoMonths = new PieChartModel();
		this.pieChartForLastTwoMonths.chartOptions = this.generatePieChartForKeyWords(chartData, '');
		this.barChartForLastTwoMonths = new BarChartModel();
		this.barChartForLastTwoMonths.chartOptions = this.generateBarChartForKeyWords(chartData, 'Last Month');
	}

	generateReportForLastThreeMonths() {
		const lastThreeMonthsData = [];
		if (
			!this.metricsForLastMonth.getValue() &&
			!this.metricsForSecondMonth.getValue() &&
			this.metricsForThirdMonth.getValue()
		) {
			this.pieChartForLastThreeMonths = {};
			this.barChartForLastThreeMonths = {};
			return;
		} else if (this.metricsForLastMonth.getValue()) {
			lastThreeMonthsData.push(this.metricsForLastMonth.getValue());
		} else if (this.metricsForSecondMonth.getValue()) {
			lastThreeMonthsData.push(this.metricsForSecondMonth.getValue());
		} else if (this.metricsForThirdMonth.getValue()) {
			lastThreeMonthsData.push(this.metricsForThirdMonth.getValue());
		}

		const chartData = this.setCategoryTrendsDataByGivenMonths(lastThreeMonthsData);
		this.pieChartForLastThreeMonths = new PieChartModel();
		this.pieChartForLastThreeMonths.chartOptions = this.generatePieChartForKeyWords(chartData, '');
		this.barChartForLastThreeMonths = new BarChartModel();
		this.barChartForLastThreeMonths.chartOptions = this.generateBarChartForKeyWords(chartData, 'Last Month');
	}

	setCategoryTrendsData(items) {
		const topKeyWords = {};
		items.forEach(item => {
			for (const i of Object.keys(item.categories)) {
				if (this.category.toLowerCase() === i.toString().toLowerCase()) {
					for (const j of Object.keys(item.categories[i].keyWords)) {
						const key = this.getTitleCase(j);
						if (topKeyWords.hasOwnProperty(key)) {
							topKeyWords[key] = {
								numOccurrences: item.categories[i].keyWords[j].numOccurrences + topKeyWords[key].numOccurrences,
								type: item.categories[i].keyWords[j].type
							};
						} else {
							topKeyWords[key] = {
								numOccurrences: item.categories[i].keyWords[j].numOccurrences,
								type: item.categories[i].keyWords[j].type
							};
						}
					}
				}
			}
		});
		return topKeyWords;
	}

	setCategoryTrendsDataByGivenMonths(items) {
		if (!items) {
			return;
		}

		const topKeyWords = {};
		items.forEach(item => {
			for (const j of Object.keys(item)) {
				const key = this.getTitleCase(j);
				if (topKeyWords.hasOwnProperty(key)) {
					topKeyWords[key] = {
						numOccurrences: item[j].numOccurrences + topKeyWords[key].numOccurrences,
						type: item[j].type
					};
				} else {
					topKeyWords[key] = {numOccurrences: item[j].numOccurrences, type: item[j].type};
				}
			}
		});
		return topKeyWords;
	}

	getTitleCase(keyword: string) {
		return keyword.replace(/\w\S*/g, txt => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	setWordCloudChartForKeyWords(data) {
		let total = 0;
		const wordCloudData = {};
		for (const j of Object.keys(data)) {
			total += Number(data[j].numOccurrences);
			wordCloudData[j.toUpperCase()] = data[j].numOccurrences;
		}
		if (total === 0) {
			return null;
		}

		return wordCloudData;
	}

	generatePieChartForKeyWords(data, title) {
		const chartOptions = new PieChartModel().chartOptions;
		const dataPoints = [];

		dataPoints.push({name: 'Issues', y: this.getValueByType(data, 'Issues'), color: '#FD9433'});
		dataPoints.push({name: 'Remedies', y: this.getValueByType(data, 'Remedies'), color: '#08B99C'});
		dataPoints.push({name: 'Products', y: this.getValueByType(data, 'Products'), color: '#E4007C'});
		dataPoints.push({name: 'Brands', y: this.getValueByType(data, 'Brands'), color: '#2EAADF'});
		chartOptions.title.text = title;

		chartOptions.series[0].data =
			_.reduce(dataPoints, (sum, datapoint) => sum + Number(datapoint.y), 0) === 0 ? [] : dataPoints;
		return chartOptions;
	}

	generateBarChartForKeyWords(data, title) {
		const chartOptions = new BarChartModel().chartOptions;
		chartOptions.series[0].data = [];
		chartOptions.series = [];
		const categories = [];
		const series = [
			{
				name: 'Keyword Volume',
				color: '#08B99C',
				data: [],
				stack: 'keyword'
			}
		];
		const requiredData = JSON.parse(JSON.stringify(data));
		const dataPoints = this.sortJSONKeysByValue(requiredData);
		const keys = Object.keys(dataPoints);
		const keysLength = keys.length > 10 ? 10 : keys.length;
		let total = 0;
		for (let i = 0; i < keysLength; i++) {
			categories.push(keys[i]);
			series[0].data.push(dataPoints[keys[i]].numOccurrences);
			total += Number(dataPoints[keys[i]].numOccurrences);
		}

		if (total === 0) {
			series[0].data = [];
		}

		chartOptions.xAxis.categories = categories;
		chartOptions.series = series;
		chartOptions.yAxis.title.text = 'Keyword Volume';
		return chartOptions;
	}

	getValueByType(data: any, type: string) {
		let sum = 0;
		for (const j of Object.keys(data)) {
			if (data[j].type === type) {
				sum += data[j].numOccurrences;
			}
		}

		return sum;
	}

	sortJSONKeysByValue(object) {
		const sortedObject = {};
		let objectKeys = Object.keys(object);
		let max = object[objectKeys[0]];
		let key;
		while (objectKeys.length > 0) {
			max = Number(object[objectKeys[0]].numOccurrences);
			key = objectKeys[0];
			for (const j of objectKeys) {
				if (Number(object[j].numOccurrences) > max) {
					max = Number(object[j].numOccurrences);
					key = j;
				}
			}
			sortedObject[key] = object[key];
			delete object[key];
			objectKeys = Object.keys(object);
		}
		return sortedObject;
	}

	getMonthDisplayNameForChart(mothsInPast: 1 | 2 | 3 = 1) {
		const currentMonthIndex = new DateTime().month();
		const currentYear = new DateTime().subtract(mothsInPast, 'months').year();
		let monthIndex = currentMonthIndex - mothsInPast;
		monthIndex = monthIndex < 0 ? monthIndex + 12 : monthIndex;
		return this.monthWords[monthIndex] + ', ' + currentYear;
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	changeSelectedTab(selectedTab) {
		this.selectedMonth = selectedTab;
		if (selectedTab === 'currentMonth') {
			this.router.navigateByUrl(
				`/group-admin/group/${this.group.id}/conversationtrends#CT-${this.days}D-category-${this.category}`
			);
			this.logPageTitle(
				`GA - ${this.group.name} - CT - ${this.days}D - Category - ${this.category}`,
				`GA - CT - Category - Details`,
				{
					group_fb_id: this.group.fbGroupId,
					group_id: this.group.id,
					group_name: this.group.name,
					category: this.category
				}
			);
		} else if (selectedTab === 'lastMonth') {
			this.router.navigateByUrl(
				`/group-admin/group/${this.group.id}/conversationtrends#CT-${this.days}D-category-${this.category}-1month`
			);
			this.logPageTitle(
				`GA - ${this.group.name} - CT - ${this.days}D - Category - ${this.category} - 1 month`,
				`GA - CT - Category - Details`,
				{
					group_fb_id: this.group.fbGroupId,
					group_id: this.group.id,
					group_name: this.group.name,
					category: this.category
				}
			);
		} else if (selectedTab === 'lastSecondMonth') {
			this.router.navigateByUrl(
				`/group-admin/group/${this.group.id}/conversationtrends#CT-${this.days}D-category-${this.category}-2months`
			);
			this.logPageTitle(
				`GA - ${this.group.name} - CT - ${this.days}D - Category - ${this.category} - 2 months`,
				`GA - CT - Category - Details`,
				{
					group_fb_id: this.group.fbGroupId,
					group_id: this.group.id,
					group_name: this.group.name,
					category: this.category
				}
			);
		} else if (selectedTab === 'lastThirdMonth') {
			this.router.navigateByUrl(
				`/group-admin/group/${this.group.id}/conversationtrends#CT-${this.days}D-category-${this.category}-3months`
			);
			this.logPageTitle(
				`GA - ${this.group.name} - CT - ${this.days}D - Category - ${this.category} - 3 months`,
				`GA - CT - Category - Details`,
				{
					group_fb_id: this.group.fbGroupId,
					group_id: this.group.id,
					group_name: this.group.name,
					category: this.category
				}
			);
		}
	}
	navigateAsPerHash(hash) {
		const hashArray = hash.split('-');
		if (hashArray[4] === '1month') {
			this.changeSelectedTab('lastMonth');
		} else if (hashArray[4] === '2months') {
			this.changeSelectedTab('lastSecondMonth');
		} else if (hashArray[4] === '3months') {
			this.changeSelectedTab('lastThirdMonth');
		} else {
			this.changeSelectedTab('currentMonth');
		}
	}

	closeKeyWordCategory(element) {
		this.recordButtonClick(element, this.group);
		this.closeCategory.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
