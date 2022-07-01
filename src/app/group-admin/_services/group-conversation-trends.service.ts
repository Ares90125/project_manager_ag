import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {DateTimeObj} from '@sharedModule/models/date-time';

@Injectable()
export class GroupTrendsReportService {
	constructor(private readonly amplifyAppSyncService: AmplifyAppSyncService) {}

	public async getKeywordMetrics(groupId, startDateAtUtc: DateTimeObj, endDateAtUtc: DateTimeObj): Promise<any> {
		try {
			const metrics = await this.amplifyAppSyncService.ListGroupKeywordMetricsByGroupId(
				groupId,
				startDateAtUtc.unix(),
				endDateAtUtc.unix(),
				10000
			);
			metrics.items.forEach(item => {
				item.top10Tokens = JSON.parse(item.top10Tokens);
				item.top10Keywords = JSON.parse(item.top10Keywords);
				item.categories = JSON.parse(item.categories);
				for (const i of Object.keys(item.categories)) {
					item.categories[i].keyWords = JSON.parse(item.categories[i].keyWords);
					item.categories[i].tokens = JSON.parse(item.categories[i].tokens);
				}
			});
			return metrics;
		} catch (error) {
			return error;
		}
	}
	public async listBCRConversationData(groupId, startDateAtUtc: DateTimeObj, endDateAtUtc: DateTimeObj): Promise<any> {
		try {
			const metrics = await this.amplifyAppSyncService.listBCRConversationData(
				groupId,
				startDateAtUtc.unix(),
				endDateAtUtc.unix(),
				10000
			);
			metrics.items.forEach(item => {
				item.top10Tokens = JSON.parse(item.top10Tokens);
				item.top10Keywords = JSON.parse(item.top10Keywords);
				item.categories = JSON.parse(item.categories);
				for (const i of Object.keys(item.categories)) {
					item.categories[i].keyWords = JSON.parse(item.categories[i].keyWords);
					item.categories[i].tokens = JSON.parse(item.categories[i].tokens);
				}
			});
			return metrics;
		} catch (error) {
			return error;
		}
	}
}
