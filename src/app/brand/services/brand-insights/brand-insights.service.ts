import {Injectable} from '@angular/core';
import {BrandMentionsReportService} from './brand-insights-reports/brand-mentions-report.service';
import {ConversationReportService} from './brand-insights-reports/conversation-report.service';
import {SentimentAnalysisReportService} from './brand-insights-reports/sentiment-analysis-report.service';
import {ShareOfVoiceReportService} from './brand-insights-reports/share-of-voice-report.service';
import {KeywordDistributionReportService} from './brand-insights-reports/keyword-distribution-report.service';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {CampaignInsightViewModel} from '@sharedModule/models/campaign-insight-view.model';
import {InsightViewSummaryReportService} from './brand-insights-reports/insight-view-summary-report.service';
import {InsightViewSummaryReportModel} from '../../models/insight-view-summary-report.model';
import {AssociationReportService} from './brand-insights-reports/association-report.service';
import {DateTime} from '@sharedModule/models/date-time';
import {HttpClient} from '@angular/common/http';
import {UtilityService} from '@sharedModule/services/utility.service';
import {InsightViewMetricModel} from '@brandModule/models/insight-view-metric.model';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Injectable()
export class BrandInsightsService {
	constructor(
		private readonly brandMentionsReportService: BrandMentionsReportService,
		private readonly conversationReportService: ConversationReportService,
		private readonly sentimentAnalysisReportService: SentimentAnalysisReportService,
		private readonly shareOfVoiceReportService: ShareOfVoiceReportService,
		private summaryReportService: InsightViewSummaryReportService,
		private readonly keywordDistributionReportService: KeywordDistributionReportService,
		private readonly appSyncService: AmplifyAppSyncService,
		private readonly associationReportService: AssociationReportService,
		private readonly httpClient: HttpClient,
		private readonly utils: UtilityService,
		private readonly securedStorage: SecuredStorageProviderService
	) {}

	public async computeGroupSummaryReport(metrics: any): Promise<InsightViewSummaryReportModel> {
		return await this.summaryReportService.getSummaryReport(metrics);
	}

	public async computeKeywordDistributions(inputData: any): Promise<any> {
		return await this.keywordDistributionReportService.getKeywordDistributionReport(inputData);
	}

	public async computeShareOfVoice(inputData: any): Promise<any> {
		return await this.shareOfVoiceReportService.getShareOfVoiceReport(inputData);
	}

	public async computeBrandMentions(inputData: any, brandName: string): Promise<any> {
		return await this.brandMentionsReportService.getBrandMentionsReport(inputData, brandName);
	}

	public async computeConversationReport(inputData: any): Promise<any> {
		return await this.conversationReportService.getConversationReport(inputData);
	}

	public async computeSentimentAnalysis(inputData: any): Promise<any> {
		return await this.sentimentAnalysisReportService.getSentimentAnalysisReport(inputData);
	}

	public async computeAssociationReport(inputData: any): Promise<any> {
		return await this.associationReportService.getAssociationReport(inputData);
	}

	public async getInsightViewMetrics(
		insightViewId: string,
		brandId: string,
		startTicks: DateTime,
		endTicks: DateTime
	): Promise<InsightViewMetricModel[]> {
		const data = await this.getInsightViewMetricsDB(insightViewId, brandId, startTicks.unix(), endTicks.unix());
		return data ? data : [];
	}

	// async getInsightViewMetricsZip(
	// 	insightViewId: string,
	// 	brandId: string,
	// 	startTicks: DateTime,
	// 	endTicks: DateTime
	// ): Promise<Blob> {
	// 	const startTicksEpoch = startTicks.unix() + 1;
	// 	const endTicksEpoch = endTicks.unix() + 1;
	// 	const endOfMonth = new DateTime().parseUnix(startTicksEpoch).endOf('m').unix();
	// 	const key = insightViewId + '_' + startTicksEpoch + '_' + endTicksEpoch;
	// 	const isFullMonthStats = endOfMonth === endTicksEpoch;
	//
	// 	if (!isFullMonthStats) {
	// 		return this.getInsightViewMetricsDB(insightViewId, brandId, startTicksEpoch, endTicksEpoch);
	// 	}
	//
	// 	const storedGzip = this.securedStorage.getLocalStorage(key);
	//
	// 	if (storedGzip) {
	// 		return storedGzip;
	// 	}
	//
	// 	const dataZip = await this.getInsightViewMetricsDB(insightViewId, brandId, startTicksEpoch, endTicksEpoch);
	// 	const expiry = endTicksEpoch + new DateTime().add(2, 'm').endOf('m').unix();
	// 	this.securedStorage.setLocalStorage(key, dataZip, expiry);
	//
	// 	return dataZip;
	// }

	async getInsightViewMetricsDB(
		insightViewId: string,
		brandId: string,
		startTicks: number,
		endTicks: number
	): Promise<InsightViewMetricModel[]> {
		const response = await this.appSyncService.getInsightViewMetricsByInsightViewId(
			brandId,
			insightViewId,
			startTicks,
			endTicks,
			true
		);
		return (await this.httpClient
			.get(response.location, {responseType: 'json'})
			.toPromise()) as undefined as InsightViewMetricModel[];
	}

	async getListAssociationInsightViewMetrics(
		insightViewId,
		brandId,
		startTicks: DateTime,
		endTicks: DateTime,
		nextToken: string = null
	) {
		const groupMetrics = await this.appSyncService.ListAssociationInsightViewMetricsByInsightViewId(
			insightViewId,
			brandId,
			startTicks.unix(),
			endTicks.unix(),
			1000,
			nextToken
		);
		let items = groupMetrics.items;
		if (groupMetrics.nextToken) {
			const metrics = await this.getListAssociationInsightViewMetrics(
				insightViewId,
				brandId,
				startTicks,
				endTicks,
				groupMetrics.nextToken
			);
			items = items.concat(metrics);
		}
		return items;
	}

	public async getInsightViews(campaign: CampaignModel): Promise<CampaignInsightViewModel[]> {
		const insightViews = await this.appSyncService.listInsightViews(campaign.campaignId, campaign.brandId);

		//Start -- changes for Panasonic brand
		const filteredInsightViews = insightViews.items.filter(view => '5a952129-9b47-4bb8-be17-043543658195' !== view.id);
		filteredInsightViews.forEach(view => {
			if (view.id === '88c48bfd-8939-42f1-8b1e-96fcc7764a94') {
				view.viewName = 'Home Appliances';
			}
		});
		//End -- changes for Panasonic brand

		return filteredInsightViews as undefined as CampaignInsightViewModel[];
	}

	public async addDateRangeSelectorToBrandInsights(campaignId, viewName, dateRange) {
		await this.appSyncService.addDateRangeSelectorToBrandInsights(campaignId, viewName, dateRange);
	}
}
