import {Injectable} from '@angular/core';
import {ConversationReportModel} from '@sharedModule/models/conversation-reports/conversation-report.model';
import {KeywordTrackerReport} from '@sharedModule/models/graph-ql.model';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable()
export class KeywordTrackerService {
	public selectedReport = null;

	constructor(private readonly amplifyAppSyncService: AmplifyAppSyncService) {}

	async getReportsForGroup(ownerId): Promise<KeywordTrackerReport[]> {
		return await this.amplifyAppSyncService.getKeywordTrackerReport(ownerId);
	}

	async getKeywordTrackerMetric(reportId: string, startDateAtUtc: DateTime, endDateAtUtc: DateTime): Promise<any> {
		const reports = await this.amplifyAppSyncService.listKeywordTrackerMetricByReportId(
			reportId,
			startDateAtUtc.unix(),
			endDateAtUtc.unix(),
			1000,
			null
		);
		return reports.items as undefined as any[];
	}

	async updateReport(input) {
		await this.amplifyAppSyncService.UpdateKeywordTrackerReport(input);
	}

	async updateReportForSelectedGroups(groupIds, keywords, reportName, append): Promise<ConversationReportModel[]> {
		return await this.amplifyAppSyncService.copyKeywordsToGroups(groupIds, keywords, reportName, append);
	}
}
