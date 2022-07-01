import {Injectable} from '@angular/core';
import {GroupMetricModel} from 'src/app/shared/models/group-metric.model';
import {EngagementReportModel} from 'src/app/shared/models/group-reports/engagement-report.model';
import {ReportDataInputModel} from 'src/app/shared/models/group-reports/report-data.model';
import {SummaryReportModel} from 'src/app/shared/models/group-reports/summary-report.model';
import {EngagementPerPostTypeDistReportModel} from '../../models/group-reports/engagement-per-post-type-dist-report.model';
import {PostTypeDistributionReportModel} from '../../models/group-reports/post-type-distribution-report.model';
import {AmplifyAppSyncService} from '../amplify-app-sync.service';
import {EngagementPerPostTypeDistReportService} from './group-metrics-reports/engagement-per-post-type-dist-report.service';
import {EngagementReportService} from './group-metrics-reports/engagement-report.service';
import {PostTypeDistributionReportService} from './group-metrics-reports/post-type-distribution-report.service';
import {SummaryReportService} from './group-metrics-reports/summary-report.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable({
	providedIn: 'root'
})
export class GroupMetricsService {
	constructor(
		private readonly loggerService: LoggerService,
		private readonly amplifyAppSyncService: AmplifyAppSyncService,
		private summaryReportService: SummaryReportService,
		private engagementReportService: EngagementReportService,
		private engagementPerPostTypeDistReportService: EngagementPerPostTypeDistReportService,
		private postTypeDistributionReportService: PostTypeDistributionReportService
	) {}

	public async computeEngagementReport(inputData: ReportDataInputModel): Promise<EngagementReportModel> {
		const reportData = await this.engagementReportService.getEngagementReport(inputData);
		return new EngagementReportModel(reportData);
	}

	public async computePostTypeDistributionReport(
		inputData: ReportDataInputModel
	): Promise<PostTypeDistributionReportModel> {
		const reportData = await this.postTypeDistributionReportService.getpostTypeDistributionReport(inputData);
		return new PostTypeDistributionReportModel(reportData);
	}

	public async computeEngagementPerPostTypeDistReport(
		inputData: ReportDataInputModel
	): Promise<EngagementPerPostTypeDistReportModel> {
		const reportData = await this.engagementPerPostTypeDistReportService.getEngagementPerPostTypeDistReport(inputData);
		return new EngagementPerPostTypeDistReportModel(reportData);
	}

	public async computeGroupSummaryReport(metrics: GroupMetricModel[]): Promise<SummaryReportModel> {
		return new Promise<SummaryReportModel>(async resolve => {
			const summary = this.summaryReportService.getSummaryReport(metrics);
			resolve(summary);
		});
	}

	public async getGroupMetrics(groupId, startDateAtUtc: DateTime, endDateAtUtc: DateTime): Promise<GroupMetricModel[]> {
		return this.getListGroupMetrics(groupId, startDateAtUtc, endDateAtUtc, null);
	}

	async getListGroupMetrics(groupId, startTicks: DateTime, endTicks: DateTime, nextToken?: string) {
		const groupMetrics = await this.amplifyAppSyncService.ListGroupMetricsByGroupId(
			groupId,
			startTicks.unix(),
			endTicks.unix(),
			10000,
			nextToken
		);
		let items = groupMetrics.items;
		if (groupMetrics.nextToken) {
			const metrics = await this.getListGroupMetrics(groupId, startTicks, endTicks, groupMetrics.nextToken);
			items = items.concat(metrics);
		}
		return items;
	}

	async getYesterdaysMetrics(groupId) {
		return await this.amplifyAppSyncService.getLastdayGroupMetricsByGroupId(groupId);
	}
}
