import {WordCloudService} from 'src/app/shared/services/word-cloud.service';
import {InsightViewMetricModel} from '../../brand/models/insight-view-metric.model';
import {InsightViewSummaryReportModel} from '../../brand/models/insight-view-summary-report.model';
import {BrandMentionsReportModel} from '../../brand/models/report-models/brand-mentions-report.model';
import {CategoryBreakupReportModel} from '../../brand/models/report-models/category-breakup-report.model';
import {CommentsPerPostReportModel} from '../../brand/models/report-models/comments-per-post-report.model';
import {ConversationVolumeReportModel} from '../../brand/models/report-models/conversation-volume-report.model';
import {EmotionalAnalysisReportModel} from '../../brand/models/report-models/emotional-analysis-report.model';
import {SentimentalAnalysisReportModel} from '../../brand/models/report-models/sentimental-analysis-report.model';
import {ShareOfVoiceReportModel} from '../../brand/models/report-models/share-of-voice-report.model';
import {SovSubTypeReportModel} from '../../brand/models/report-models/sov-subType-report-model';
import {TopKeywordsReportModel} from '../../brand/models/report-models/top-keywords-report.model';
import {WordCloudReportModel} from '../../brand/models/report-models/word-cloud-report.model';
import {BrandInsightsService} from '../../brand/services/brand-insights/brand-insights.service';
import {ReportDataInputModel} from './group-reports/report-data.model';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {DateTime} from '@sharedModule/models/date-time';
import {BehaviorSubject} from 'rxjs';

export class CampaignInsightViewModel {
	id: string;
	viewName: string;
	level: string;
	keywordBrand: string;
	brandId: string;
	dateRangeSelectors: string;
	customConversationVolumeReport: ConversationVolumeReportModel;
	customCommentsPerPostReport: CommentsPerPostReportModel;
	customTopKeywordsReport: TopKeywordsReportModel;
	customShareOfVoiceReport: ShareOfVoiceReportModel;
	customBrandMentionsReport: BrandMentionsReportModel;
	customCategoryBreakupReport: CategoryBreakupReportModel;
	customSOVIssues: SovSubTypeReportModel;
	customSOVRemedies: SovSubTypeReportModel;
	customSOVProducts: SovSubTypeReportModel;
	customSOVBrands: SovSubTypeReportModel;
	customSOVAmenities: SovSubTypeReportModel;
	customTotalConversationsInSOV: {
		Issues: {count: Number; keywords: string[]};
		Remedies: {count: Number; keywords: string[]};
		Products: {count: Number; keywords: string[]};
		Brands: {count: Number; keywords: string[]};
		Amenities: {count: Number; keywords: string[]};
	};
	customAssociationReport = new BehaviorSubject<any>(null);

	sentimentalAnalysisReport: SentimentalAnalysisReportModel;
	currentMonthConversationVolumeReport: ConversationVolumeReportModel;
	currentMonthCommentsPerPostReport: CommentsPerPostReportModel;
	currentMonthTopKeywordsReport: TopKeywordsReportModel;
	currentMonthShareOfVoiceReport: ShareOfVoiceReportModel;
	currentMonthBrandMentionsReport: BrandMentionsReportModel;
	currentMonthCategoryBreakupReport: CategoryBreakupReportModel;
	currentMonthSOVIssues: SovSubTypeReportModel;
	currentMonthSOVRemedies: SovSubTypeReportModel;
	currentMonthSOVProducts: SovSubTypeReportModel;
	currentMonthSOVBrands: SovSubTypeReportModel;
	currentMonthSOVAmenities: SovSubTypeReportModel;
	currentMonthTotalConversationsInSOV: {
		Issues: {count: Number; keywords: string[]};
		Remedies: {count: Number; keywords: string[]};
		Products: {count: Number; keywords: string[]};
		Brands: {count: Number; keywords: string[]};
		Amenities: {count: Number; keywords: string[]};
	};
	currentMonthAssociationReport = new BehaviorSubject<any>(null);

	firstMonthConversationVolumeReport: ConversationVolumeReportModel;
	firstMonthCommentsPerPostReport: CommentsPerPostReportModel;
	firstMonthInPastWordCloudReport: WordCloudReportModel;
	firstMonthTopKeywordsReport: TopKeywordsReportModel;
	firstMonthShareOfVoiceReport: ShareOfVoiceReportModel;
	firstMonthBrandMentionsReport: BrandMentionsReportModel;
	firstMonthCategoryBreakupReport: CategoryBreakupReportModel;
	firstMonthInPastEmotionalAnalysisReport: EmotionalAnalysisReportModel;
	firstMonthSOVIssues: SovSubTypeReportModel;
	firstMonthSOVRemedies: SovSubTypeReportModel;
	firstMonthSOVProducts: SovSubTypeReportModel;
	firstMonthSOVBrands: SovSubTypeReportModel;
	firstMonthSOVAmenities: SovSubTypeReportModel;
	firstMonthTotalConversationsInSOV: {
		Issues: {count: Number; keywords: string[]};
		Remedies: {count: Number; keywords: string[]};
		Products: {count: Number; keywords: string[]};
		Brands: {count: Number; keywords: string[]};
		Amenities: {count: Number; keywords: string[]};
	};
	firstMonthAssociationReport = new BehaviorSubject<any>(null);

	twoMonthsConversationVolumeReport: ConversationVolumeReportModel;
	twoMonthsCommentsPerPostReport: CommentsPerPostReportModel;
	secondMonthInPastWordCloudReport: WordCloudReportModel;
	twoMonthsTopKeywordsReport: TopKeywordsReportModel;
	twoMonthsShareOfVoiceReport: ShareOfVoiceReportModel;
	twoMonthsBrandMentionsReport: BrandMentionsReportModel;
	twoMonthsCategoryBreakupReport: CategoryBreakupReportModel;
	secondMonthInPastEmotionalAnalysisReport: EmotionalAnalysisReportModel;
	twoMonthsSOVIssues: SovSubTypeReportModel;
	twoMonthsSOVRemedies: SovSubTypeReportModel;
	twoMonthsSOVProducts: SovSubTypeReportModel;
	twoMonthsSOVBrands: SovSubTypeReportModel;
	twoMonthsSOVAmenities: SovSubTypeReportModel;
	twoMonthsTotalConversationsInSOV: {
		Issues: Number;
		Remedies: Number;
		Products: Number;
		Brands: Number;
		Amenities: Number;
	};
	twoMonthsAssociationReport = new BehaviorSubject<any>(null);

	threeMonthsConversationVolumeReport: ConversationVolumeReportModel;
	threeMonthsCommentsPerPostReport: CommentsPerPostReportModel;
	thirdMonthInPastWordCloudReport: WordCloudReportModel;
	threeMonthsTopKeywordsReport: TopKeywordsReportModel;
	threeMonthsShareOfVoiceReport: ShareOfVoiceReportModel;
	threeMonthsBrandMentionsReport: BrandMentionsReportModel;
	threeMonthsCategoryBreakupReport: CategoryBreakupReportModel;
	thirdMonthInPastEmotionalAnalysisReport: EmotionalAnalysisReportModel;
	threeMonthsSOVIssues: SovSubTypeReportModel;
	threeMonthsSOVRemedies: SovSubTypeReportModel;
	threeMonthsSOVProducts: SovSubTypeReportModel;
	threeMonthsSOVBrands: SovSubTypeReportModel;
	threeMonthsSOVAmenities: SovSubTypeReportModel;
	threeMonthsTotalConversationsInSOV: {
		Issues: {count: Number; keywords: string[]};
		Remedies: {count: Number; keywords: string[]};
		Products: {count: Number; keywords: string[]};
		Brands: {count: Number; keywords: string[]};
		Amenities: {count: Number; keywords: string[]};
	};
	threeMonthsAssociationReport = new BehaviorSubject<any>(null);

	isAmenitiesEnabled = new BehaviorSubject<boolean>(null);
	isInsightsLoaded = new BehaviorSubject<any>(null);
	summaryMetrics = new BehaviorSubject<any>(null);

	downloadMetrics = {currentMonth: null, firstMonth: null, twoMonths: null, threeMonths: null, custom: null};

	private _isMetricsFetchingInitiated = false;
	private _insightsService: BrandInsightsService;
	private _summaryMetrics: any;
	private _customMonthMetrics: any[];
	private _currentMonthMetrics: any[];
	private _oneMonthMetrics: any[];
	private _twoMonthsMetrics: any[];
	private _threeMonthsMetrics: any[];
	private _wordCloudService: WordCloudService;
	private dateTimeHelper: DateTimeHelper;

	constructor(
		data: any,
		brandId: string,
		insightViewService: BrandInsightsService,
		wordCloudService: WordCloudService
	) {
		Object.assign(this, data);
		this.brandId = brandId;
		this._insightsService = insightViewService;
		this._wordCloudService = wordCloudService;
		this.dateTimeHelper = new DateTimeHelper('');
		return this;
	}

	public async getMetrics() {
		if (this._isMetricsFetchingInitiated) {
			return;
		}

		this._isMetricsFetchingInitiated = true;
		this.isInsightsLoaded.next(false);

		await this.getCurrentMonthMetrics();
		await this.getFirstMonthMetrics();
		await this.getSecondMonthMetrics();
		await this.getThirdMonthMetrics();
	}

	public async getSummaryMetrics(): Promise<InsightViewSummaryReportModel> {
		if (this._summaryMetrics) {
			return this._summaryMetrics;
		}

		if (this.level === 'Association') {
			await this._insightsService.getListAssociationInsightViewMetrics(
				this.id,
				this.brandId,
				this.dateTimeHelper.twentyEighthDayInPastStart,
				this.dateTimeHelper.yesterdayEnd
			);
			return;
		}

		const _currentMonthMetrics = await this.isSummaryMetricsAvailable();

		if (!_currentMonthMetrics['isPastMetricsAllowed']) {
			this._summaryMetrics = await this._insightsService.computeGroupSummaryReport(_currentMonthMetrics['metrics']);
		} else {
			const metrics = await this._insightsService.getInsightViewMetrics(
				this.id,
				this.brandId,
				this.dateTimeHelper.twentyEighthDayInPastStart,
				this.dateTimeHelper.lastMonthEnd
			);

			const summaryMetrics = _currentMonthMetrics['metrics'].concat(metrics);
			this._summaryMetrics = await this._insightsService.computeGroupSummaryReport(summaryMetrics);
		}

		this.summaryMetrics.next(this._summaryMetrics);

		return this._summaryMetrics;
	}

	public async getcustomMetrics(customStartDate: Date, customEndDate: Date, associationInsightId): Promise<boolean> {
		this.customConversationVolumeReport = null;
		this.customCommentsPerPostReport = null;
		this.customTopKeywordsReport = null;
		this.customCategoryBreakupReport = null;
		this.customTotalConversationsInSOV = null;
		this.customSOVIssues = null;
		this.customSOVRemedies = null;
		this.customSOVProducts = null;
		this.customSOVBrands = null;
		this.customSOVAmenities = null;
		this.customShareOfVoiceReport = null;
		const startDate = new DateTime(customStartDate).utc();
		const endDate = new DateTime(customEndDate).utc();
		const diff = endDate.diff(startDate.dayJsObj, 'days');

		if (associationInsightId) {
			const associationMetrics: any[] = await this._insightsService.getListAssociationInsightViewMetrics(
				associationInsightId,
				this.brandId,
				startDate,
				endDate
			);

			let associationReportInputData;
			if (diff < 31 && startDate.month() === endDate.month()) {
				associationReportInputData = new ReportDataInputModel(associationMetrics, 'weekly', [startDate, endDate]);
			} else {
				const numberOfMonths = Math.ceil(endDate.diff(startDate.dayJsObj, 'months', true));
				const months = [];
				for (let month = numberOfMonths === 1 ? numberOfMonths : numberOfMonths - 1; month > -1; month--) {
					months.push(new DateTime(endDate.dayJsObj).subtract(month, 'months').format('MMM YYYY'));
				}
				associationReportInputData = new ReportDataInputModel(associationMetrics, 'monthly', months);
			}

			this.customAssociationReport.next(
				await this._insightsService.computeAssociationReport(associationReportInputData)
			);
			return;
		}
		const metrics = await this._insightsService.getInsightViewMetrics(this.id, this.brandId, startDate, endDate);
		this.downloadMetrics.custom = metrics as InsightViewMetricModel[];
		this._customMonthMetrics = metrics as InsightViewMetricModel[];
		let reportInputData;
		if (diff < 31 && startDate.month() === endDate.month()) {
			reportInputData = new ReportDataInputModel(this._customMonthMetrics, 'weekly', [startDate, endDate]);
		} else {
			const numberOfMonths = Math.ceil(endDate.diff(startDate.dayJsObj, 'months', true));
			const months = [];
			for (let month = numberOfMonths === 1 ? numberOfMonths : numberOfMonths - 1; month > -1; month--) {
				months.push(new DateTime(endDate.dayJsObj).subtract(month, 'months').format('MMM YYYY'));
			}
			reportInputData = new ReportDataInputModel(this._customMonthMetrics, 'monthly', months);
		}

		const conversationReport = await this._insightsService.computeConversationReport(reportInputData);
		const keywordDistributionReport = await this._insightsService.computeKeywordDistributions(reportInputData);
		this.customConversationVolumeReport = new ConversationVolumeReportModel(conversationReport);
		this.customCommentsPerPostReport = new CommentsPerPostReportModel(conversationReport);
		this.customTopKeywordsReport = new TopKeywordsReportModel(keywordDistributionReport);
		this.customCategoryBreakupReport = new CategoryBreakupReportModel(keywordDistributionReport, this.id);

		if (this.level.toLowerCase() === 'brand') {
			this.customBrandMentionsReport = new BrandMentionsReportModel(
				await this._insightsService.computeBrandMentions(
					reportInputData,
					this.keywordBrand ? this.keywordBrand : this.viewName
				)
			);
		}

		if (this.level.toLowerCase() === 'subcategory') {
			const sovOutput = await this._insightsService.computeShareOfVoice(reportInputData);
			const sovReport = sovOutput.reportDataOutput;
			if (!this.isAmenitiesEnabled.getValue()) {
				this.isAmenitiesEnabled.next(sovOutput.isAmenitiesEnabled);
			}
			this.customTotalConversationsInSOV = sovOutput.totalConversations;
			this.customSOVIssues = new SovSubTypeReportModel(sovReport, 'Issues');
			this.customSOVRemedies = new SovSubTypeReportModel(sovReport, 'Remedies');
			this.customSOVProducts = new SovSubTypeReportModel(sovReport, 'Products', this.id);
			this.customSOVBrands = new SovSubTypeReportModel(sovReport, 'Brands');
			this.customSOVAmenities = new SovSubTypeReportModel(sovReport, 'Amenities');
			this.customShareOfVoiceReport = new ShareOfVoiceReportModel(sovReport);
		}
		return true;
	}

	public async isSummaryMetricsAvailable() {
		const startTicks = this.dateTimeHelper.twentyEighthDayInPastStart.unix();
		const endTicks = this.dateTimeHelper.yesterdayEnd.unix();
		const metrics = this._currentMonthMetrics.sort((a, b) => b.metricForHourUTCStartTick - a.metricForHourUTCStartTick);

		if (metrics?.length > 0 && metrics?.[0]?.metricForHourUTCStartTick < startTicks) {
			return {
				metrics: this._currentMonthMetrics.filter(
					metric => metric.metricForHourUTCStartTick >= startTicks && metric.metricForHourUTCStartTick <= endTicks
				),
				isPastMetricsAllowed: false
			};
		} else {
			return {
				metrics: this._currentMonthMetrics.filter(
					metric => metric.metricForHourUTCStartTick >= startTicks && metric.metricForHourUTCStartTick <= endTicks
				),
				isPastMetricsAllowed: true
			};
		}
	}

	public getPillNameBasedOnReportType(reportType) {
		if (reportType === 'currentMonth') {
			return this.dateTimeHelper.currentMonthName;
		} else if (reportType === 'firstMonth') {
			return this.dateTimeHelper.lastMonthName;
		} else if (reportType === 'twoMonths') {
			return this.dateTimeHelper.secondLastMonthName + ' - ' + this.dateTimeHelper.lastMonthName;
		} else if (reportType === 'threeMonths') {
			return this.dateTimeHelper.thirdLastMonthName + ' - ' + this.dateTimeHelper.lastMonthName;
		}
	}

	private async getCurrentMonthMetrics(): Promise<boolean> {
		if (this.level === 'Association') {
			const associationMetrics: any[] = await this._insightsService.getListAssociationInsightViewMetrics(
				this.id,
				this.brandId,
				this.dateTimeHelper.currentMonthStart,
				this.dateTimeHelper.yesterdayEnd
			);
			const associationReportInputData = new ReportDataInputModel(associationMetrics, 'weekly', [
				this.dateTimeHelper.currentMonthStart,
				this.dateTimeHelper.now
			]);

			const associationOutputMetrics = await this._insightsService.computeAssociationReport(associationReportInputData);
			this.currentMonthAssociationReport.next(associationOutputMetrics);
			return;
		}

		const metrics = await this._insightsService.getInsightViewMetrics(
			this.id,
			this.brandId,
			this.dateTimeHelper.currentMonthStart,
			this.dateTimeHelper.now
		);

		this.downloadMetrics.currentMonth = metrics as InsightViewMetricModel[];

		this._currentMonthMetrics = metrics as InsightViewMetricModel[];

		this.getSummaryMetrics();

		const reportInputData = new ReportDataInputModel(this._currentMonthMetrics, 'weekly', [
			this.dateTimeHelper.currentMonthStart,
			this.dateTimeHelper.now
		]);

		const conversationReport = await this._insightsService.computeConversationReport(reportInputData);
		const keywordDistributionReport = await this._insightsService.computeKeywordDistributions(reportInputData);

		this.currentMonthConversationVolumeReport = new ConversationVolumeReportModel(conversationReport);
		this.currentMonthCommentsPerPostReport = new CommentsPerPostReportModel(conversationReport);
		this.currentMonthTopKeywordsReport = new TopKeywordsReportModel(keywordDistributionReport);
		this.currentMonthCategoryBreakupReport = new CategoryBreakupReportModel(keywordDistributionReport, this.id);

		if (this.level.toLowerCase() === 'brand') {
			this.currentMonthBrandMentionsReport = new BrandMentionsReportModel(
				await this._insightsService.computeBrandMentions(
					reportInputData,
					this.keywordBrand ? this.keywordBrand : this.viewName
				)
			);
		}

		if (this.level.toLowerCase() === 'subcategory') {
			const sovOutput = await this._insightsService.computeShareOfVoice(reportInputData);
			const sovReport = sovOutput.reportDataOutput;
			if (!this.isAmenitiesEnabled.getValue()) {
				this.isAmenitiesEnabled.next(sovOutput.isAmenitiesEnabled);
			}
			this.currentMonthTotalConversationsInSOV = sovOutput.totalConversations;
			this.currentMonthSOVIssues = new SovSubTypeReportModel(sovReport, 'Issues');
			this.currentMonthSOVRemedies = new SovSubTypeReportModel(sovReport, 'Remedies');
			this.currentMonthSOVProducts = new SovSubTypeReportModel(sovReport, 'Products', this.id);
			this.currentMonthSOVBrands = new SovSubTypeReportModel(sovReport, 'Brands');
			this.currentMonthSOVAmenities = new SovSubTypeReportModel(sovReport, 'Amenities');
			this.currentMonthShareOfVoiceReport = new ShareOfVoiceReportModel(sovReport);
		}

		return true;
	}

	private async getFirstMonthMetrics(): Promise<boolean> {
		if (this.level === 'Association') {
			const associationMetrics: any[] = await this._insightsService.getListAssociationInsightViewMetrics(
				this.id,
				this.brandId,
				this.dateTimeHelper.lastMonthStart,
				this.dateTimeHelper.lastMonthEnd
			);
			const associationReportInputData = new ReportDataInputModel(associationMetrics, 'weekly', [
				this.dateTimeHelper.lastMonthStart,
				this.dateTimeHelper.lastMonthEnd
			]);

			this.firstMonthAssociationReport.next(
				await this._insightsService.computeAssociationReport(associationReportInputData)
			);
			return;
		}
		const metrics = await this._insightsService.getInsightViewMetrics(
			this.id,
			this.brandId,
			this.dateTimeHelper.lastMonthStart,
			this.dateTimeHelper.lastMonthEnd
		);

		this.downloadMetrics.firstMonth = metrics as InsightViewMetricModel[];

		this._oneMonthMetrics = metrics as InsightViewMetricModel[];
		const reportInputData = new ReportDataInputModel(this._oneMonthMetrics, 'weekly', [
			this.dateTimeHelper.lastMonthStart.format(),
			this.dateTimeHelper.lastMonthEnd.format()
		]);
		const conversationReport = await this._insightsService.computeConversationReport(reportInputData);
		const keywordDistributionReport = await this._insightsService.computeKeywordDistributions(reportInputData);

		this.firstMonthConversationVolumeReport = new ConversationVolumeReportModel(conversationReport);
		this.firstMonthCommentsPerPostReport = new CommentsPerPostReportModel(conversationReport);
		this.firstMonthInPastWordCloudReport = new WordCloudReportModel(keywordDistributionReport);

		delete this.firstMonthInPastWordCloudReport.wordCloudData[this.viewName];

		this.firstMonthInPastWordCloudReport.wordCloudImage = this.firstMonthInPastWordCloudReport.isEmpty
			? null
			: await this._wordCloudService.getWordCloudData(this.firstMonthInPastWordCloudReport.wordCloudData);

		this.firstMonthTopKeywordsReport = new TopKeywordsReportModel(keywordDistributionReport);

		if (this.level.toLowerCase() === 'subcategory') {
			const sovOutput = await this._insightsService.computeShareOfVoice(reportInputData);
			const sovReport = sovOutput.reportDataOutput;
			if (!this.isAmenitiesEnabled.getValue()) {
				this.isAmenitiesEnabled.next(sovOutput.isAmenitiesEnabled);
			}
			this.firstMonthTotalConversationsInSOV = sovOutput.totalConversations;
			this.firstMonthSOVIssues = new SovSubTypeReportModel(sovReport, 'Issues');
			this.firstMonthSOVRemedies = new SovSubTypeReportModel(sovReport, 'Remedies');
			this.firstMonthSOVProducts = new SovSubTypeReportModel(sovReport, 'Products', this.id);
			this.firstMonthSOVBrands = new SovSubTypeReportModel(sovReport, 'Brands');
			this.firstMonthSOVAmenities = new SovSubTypeReportModel(sovReport, 'Amenities');
			this.firstMonthShareOfVoiceReport = new ShareOfVoiceReportModel(sovReport);
		}

		if (this.level.toLowerCase() === 'brand') {
			this.firstMonthInPastEmotionalAnalysisReport = new EmotionalAnalysisReportModel(
				await this._insightsService.computeSentimentAnalysis(reportInputData)
			);
			this.firstMonthBrandMentionsReport = new BrandMentionsReportModel(
				await this._insightsService.computeBrandMentions(
					reportInputData,
					this.keywordBrand ? this.keywordBrand : this.viewName
				)
			);
		}
		this.firstMonthCategoryBreakupReport = new CategoryBreakupReportModel(keywordDistributionReport, this.id);
		return true;
	}

	private async getSecondMonthMetrics() {
		if (this.level === 'Association') {
			const associationMetrics: any[] = await this._insightsService.getListAssociationInsightViewMetrics(
				this.id,
				this.brandId,
				this.dateTimeHelper.secondLastMonthStart,
				this.dateTimeHelper.secondLastMonthEnd
			);
			const metrics = this.firstMonthAssociationReport.getValue().metrics.concat(associationMetrics);
			const associationReportInputData = new ReportDataInputModel(metrics, 'monthly', [
				this.dateTimeHelper.secondLastMonthName,
				this.dateTimeHelper.lastMonthName
			]);

			this.twoMonthsAssociationReport.next(
				await this._insightsService.computeAssociationReport(associationReportInputData)
			);
			return;
		}
		const metrics = await this._insightsService.getInsightViewMetrics(
			this.id,
			this.brandId,
			this.dateTimeHelper.secondLastMonthStart,
			this.dateTimeHelper.secondLastMonthEnd
		);

		this.downloadMetrics.twoMonths = metrics as InsightViewMetricModel[];

		this._twoMonthsMetrics = this._oneMonthMetrics.concat(metrics as InsightViewMetricModel[]);

		const reportInputData = new ReportDataInputModel(this._twoMonthsMetrics, 'monthly', [
			this.dateTimeHelper.secondLastMonthStart.format('MMM YYYY'),
			this.dateTimeHelper.lastMonthStart.format('MMM YYYY')
		]);
		const conversationReport = await this._insightsService.computeConversationReport(reportInputData);
		const keywordDistributionReport = await this._insightsService.computeKeywordDistributions(reportInputData);

		this.twoMonthsConversationVolumeReport = new ConversationVolumeReportModel(conversationReport);
		this.twoMonthsCommentsPerPostReport = new CommentsPerPostReportModel(conversationReport);
		this.twoMonthsTopKeywordsReport = new TopKeywordsReportModel(keywordDistributionReport);

		if (this.level.toLowerCase() === 'subcategory') {
			const sovOutput = await this._insightsService.computeShareOfVoice(reportInputData);
			const sovReport = sovOutput.reportDataOutput;
			if (!this.isAmenitiesEnabled.getValue()) {
				this.isAmenitiesEnabled.next(sovOutput.isAmenitiesEnabled);
			}
			this.twoMonthsTotalConversationsInSOV = sovOutput.totalConversations;
			this.twoMonthsSOVIssues = new SovSubTypeReportModel(sovReport, 'Issues');
			this.twoMonthsSOVRemedies = new SovSubTypeReportModel(sovReport, 'Remedies');
			this.twoMonthsSOVProducts = new SovSubTypeReportModel(sovReport, 'Products', this.id);
			this.twoMonthsSOVBrands = new SovSubTypeReportModel(sovReport, 'Brands');
			this.twoMonthsSOVAmenities = new SovSubTypeReportModel(sovReport, 'Amenities');
			this.twoMonthsShareOfVoiceReport = new ShareOfVoiceReportModel(sovReport);
		}

		if (this.level.toLowerCase() === 'brand') {
			const reportInputDataSecondMonth = new ReportDataInputModel(metrics as any, 'monthly', [
				this.dateTimeHelper.secondLastMonthName,
				this.dateTimeHelper.lastMonthName
			]);
			this.secondMonthInPastEmotionalAnalysisReport = new EmotionalAnalysisReportModel(
				await this._insightsService.computeSentimentAnalysis(reportInputDataSecondMonth)
			);
			this.twoMonthsBrandMentionsReport = new BrandMentionsReportModel(
				await this._insightsService.computeBrandMentions(
					reportInputData,
					this.keywordBrand ? this.keywordBrand : this.viewName
				)
			);
		}

		const reportWordCloudInputDataSecondMonth = new ReportDataInputModel(metrics as any, 'monthly', [
			this.dateTimeHelper.secondLastMonthName,
			this.dateTimeHelper.lastMonthName
		]);

		const keywordDistributionReportForSecondMonth = await this._insightsService.computeKeywordDistributions(
			reportWordCloudInputDataSecondMonth
		);
		this.secondMonthInPastWordCloudReport = new WordCloudReportModel(keywordDistributionReportForSecondMonth);
		delete this.secondMonthInPastWordCloudReport.wordCloudData[this.viewName];
		this.secondMonthInPastWordCloudReport.wordCloudImage = this.secondMonthInPastWordCloudReport.isEmpty
			? null
			: await this._wordCloudService.getWordCloudData(this.secondMonthInPastWordCloudReport.wordCloudData);

		this.twoMonthsCategoryBreakupReport = new CategoryBreakupReportModel(keywordDistributionReport, this.id);

		return true;
	}

	public async getCustomDateRangeSelection(campaignId, viewName, dateRange) {
		const selectedViewName = this.level.toLowerCase() === 'brand' && this.keywordBrand ? this.keywordBrand : viewName;
		await this._insightsService.addDateRangeSelectorToBrandInsights(campaignId, selectedViewName, dateRange);
	}

	private async getThirdMonthMetrics() {
		if (this.level === 'Association') {
			const associationMetrics: any[] = await this._insightsService.getListAssociationInsightViewMetrics(
				this.id,
				this.brandId,
				this.dateTimeHelper.thirdLastMonthStart,
				this.dateTimeHelper.thirdLastMonthEnd
			);
			const metrics = this.twoMonthsAssociationReport.getValue().metrics.concat(associationMetrics);
			const associationReportInputData = new ReportDataInputModel(metrics, 'monthly', [
				this.dateTimeHelper.thirdLastMonthName,
				this.dateTimeHelper.secondLastMonthName,
				this.dateTimeHelper.lastMonthName
			]);

			this.threeMonthsAssociationReport.next(
				await this._insightsService.computeAssociationReport(associationReportInputData)
			);
			return;
		}
		const metrics = await this._insightsService.getInsightViewMetrics(
			this.id,
			this.brandId,
			this.dateTimeHelper.thirdLastMonthStart,
			this.dateTimeHelper.thirdLastMonthEnd
		);

		this.downloadMetrics.threeMonths = metrics as InsightViewMetricModel[];

		this._threeMonthsMetrics = this._twoMonthsMetrics.concat(metrics as InsightViewMetricModel[]);

		const reportInputData = new ReportDataInputModel(this._threeMonthsMetrics, 'monthly', [
			this.dateTimeHelper.thirdLastMonthStart.format('MMM YYYY'),
			this.dateTimeHelper.secondLastMonthStart.format('MMM YYYY'),
			this.dateTimeHelper.lastMonthStart.format('MMM YYYY')
		]);
		const conversationReport = await this._insightsService.computeConversationReport(reportInputData);
		const keywordDistributionReport = await this._insightsService.computeKeywordDistributions(reportInputData);

		this.threeMonthsConversationVolumeReport = new ConversationVolumeReportModel(conversationReport);
		this.threeMonthsCommentsPerPostReport = new CommentsPerPostReportModel(conversationReport);
		this.threeMonthsTopKeywordsReport = new TopKeywordsReportModel(keywordDistributionReport);

		if (this.level.toLowerCase() === 'subcategory') {
			const sovOutput = await this._insightsService.computeShareOfVoice(reportInputData);
			const sovReport = sovOutput.reportDataOutput;
			if (!this.isAmenitiesEnabled.getValue()) {
				this.isAmenitiesEnabled.next(sovOutput.isAmenitiesEnabled);
			}
			this.threeMonthsTotalConversationsInSOV = sovOutput.totalConversations;
			this.threeMonthsSOVIssues = new SovSubTypeReportModel(sovReport, 'Issues');
			this.threeMonthsSOVRemedies = new SovSubTypeReportModel(sovReport, 'Remedies');
			this.threeMonthsSOVProducts = new SovSubTypeReportModel(sovReport, 'Products', this.id);
			this.threeMonthsSOVBrands = new SovSubTypeReportModel(sovReport, 'Brands');
			this.threeMonthsSOVAmenities = new SovSubTypeReportModel(sovReport, 'Amenities');
			this.threeMonthsShareOfVoiceReport = new ShareOfVoiceReportModel(sovReport);
		}

		if (this.level.toLowerCase() === 'brand') {
			const reportInputDataForThirdMonth = new ReportDataInputModel(metrics as any, 'monthly', [
				this.dateTimeHelper.thirdLastMonthName,
				this.dateTimeHelper.secondLastMonthName,
				this.dateTimeHelper.lastMonthName
			]);
			const sentimentAnalysisReport = await this._insightsService.computeSentimentAnalysis(reportInputData);
			this.thirdMonthInPastEmotionalAnalysisReport = new EmotionalAnalysisReportModel(
				await this._insightsService.computeSentimentAnalysis(reportInputDataForThirdMonth)
			);
			this.sentimentalAnalysisReport = new SentimentalAnalysisReportModel(
				sentimentAnalysisReport,
				this.keywordBrand ? this.keywordBrand : this.viewName
			);
			this.threeMonthsBrandMentionsReport = new BrandMentionsReportModel(
				await this._insightsService.computeBrandMentions(
					reportInputData,
					this.keywordBrand ? this.keywordBrand : this.viewName
				)
			);
		}

		const reportWordCloudInputDataForThirdMonth = new ReportDataInputModel(metrics as any, 'monthly', [
			this.dateTimeHelper.thirdLastMonthName,
			this.dateTimeHelper.secondLastMonthName,
			this.dateTimeHelper.lastMonthName
		]);

		const keywordDistributionReportForThirdMonth = await this._insightsService.computeKeywordDistributions(
			reportWordCloudInputDataForThirdMonth
		);
		this.thirdMonthInPastWordCloudReport = new WordCloudReportModel(keywordDistributionReportForThirdMonth);
		delete this.thirdMonthInPastWordCloudReport.wordCloudData[this.viewName];
		this.thirdMonthInPastWordCloudReport.wordCloudImage = this.thirdMonthInPastWordCloudReport.isEmpty
			? null
			: await this._wordCloudService.getWordCloudData(this.thirdMonthInPastWordCloudReport.wordCloudData);

		this.threeMonthsCategoryBreakupReport = new CategoryBreakupReportModel(keywordDistributionReport, this.id);
		this.isInsightsLoaded.next(true);

		return true;
	}
}
