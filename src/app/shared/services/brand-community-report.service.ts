import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {DateTime} from '@sharedModule/models/date-time';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';

@Injectable({
	providedIn: 'root'
})
export class BrandCommunityReportService {
	constructor(private readonly appSync: AmplifyAppSyncService) {}

	public async getGroupOverviewStats(groupId, startDateUTC, endDateUTC) {
		return await this.appSync.getGroupOverviewStats(groupId, startDateUTC, endDateUTC);
	}

	public async getGroupInsights(groupId) {
		return await this.appSync.getGroupInsights(groupId);
	}

	public async getScreenshotData(groupId) {
		return await this.appSync.getScreenshotData(groupId);
	}

	public async getGroupMemberAndEngagementStats(groupId, startDateUTC, endDateUTC) {
		return await this.appSync.getGroupMemberAndEngagementStats(groupId, startDateUTC, endDateUTC);
	}

	public async getCBREditMembersData(groupId) {
		return await this.appSync.getCBREditMembersData(groupId);
	}

	public async editGroupTotalMembers(input) {
		return await this.appSync.editGroupTotalMembers(input);
	}

	public async getGroupMembersChartsData(groupId, startDateUTC, endDateUTC, lifetime = null) {
		return await this.appSync.getGroupMembersChartsData(groupId, startDateUTC, endDateUTC, lifetime);
	}

	public async getGroupActivityChartsData(groupId, startDateUTC, endDateUTC, lifetime = null) {
		return await this.appSync.getGroupActivityChartsData(groupId, startDateUTC, endDateUTC, lifetime);
	}

	public async getGroupInsightsChartsData(groupId, startDateUTC, endDateUTC, lifetime = null) {
		return await this.appSync.getGroupInsightsChartsData(groupId, startDateUTC, endDateUTC, lifetime);
	}

	public async listBrandCommunities(brandId, limit = null, nextToken = null) {
		return await this.appSync.listBrandCommunities(brandId, limit, nextToken);
	}

	public async getCBRWordCloudData(groupId, startDate, endDate) {
		return await this.appSync.getCBRWordCloudData(groupId, startDate, endDate);
	}

	public async updateBrandCommunityReport(input) {
		return await this.appSync.updateBrandCommunityReport(input);
	}

	public async createBrandCommunityReport(input) {
		return await this.appSync.createBrandCommunityReport(input);
	}

	public async triggerInsightsParsing(group, sheetUid): Promise<boolean> {
		try {
			await this.appSync.facebookInsightsParser(group, sheetUid);
			return true;
		} catch (error) {
			return false;
		}
	}

	public async getCBRCustomConversationByGroupId(groupId) {
		return await this.appSync.getCBRCustomConversationByGroupId(groupId);
	}

	public async createCBRCustomConversation(groupId, sectionTitle, sectionSubtitle, buckets) {
		try {
			return await this.appSync.createCBRCustomConversation(groupId, sectionTitle, sectionSubtitle, buckets);
		} catch (e) {
			return e;
		}
	}

	public async updateCBRCustomConversation(groupId, sectionTitle, sectionSubtitle, buckets) {
		try {
			return await this.appSync.updateCBRCustomConversation(groupId, sectionTitle, sectionSubtitle, buckets);
		} catch (e) {
			return e;
		}
	}

	public async deleteCBRCustomConversation(groupId, sectionTitle) {
		try {
			return await this.appSync.deleteCBRCustomConversation(groupId, sectionTitle);
		} catch (e) {
			return e;
		}
	}

	public async getCBRConversationData(groupId, startDate, endDate, lifetime = false) {
		return await this.appSync.getCBRConversationData(groupId, startDate, endDate, lifetime);
	}

	getWeekLabels(number) {
		let label = [];
		for (let i = 0; i < number; i++) {
			const date = new DateTime().subtract(7 * i, 'days').format('YYYY-MM-DD');
			label.push(date);
		}
		return label;
	}

	getMonthLabels(number) {
		let label = [];
		for (let i = 1; i <= number; i++) {
			const month = new DateTime().subtract(i, 'months').format('MMM');
			label.push(month);
		}
		return label;
	}

	getWeekLabelsForTimePeriod(startDate, endDate) {
		let weekLabels = [];
		const daysInTimePeriod = endDate.diff(startDate, 'weeks');
		const weeksInTimePeriod = Math.floor(daysInTimePeriod);
		for (let i = 0; i < weeksInTimePeriod + 2; i++) {
			const end = new DateTime().subtract(i, 'weeks').endOf('week');
			const endFormatted = new DateTime().subtract(i, 'weeks').endOf('week').format('DD/MM');
			const start = new DateTime().subtract(i, 'weeks').startOf('week');
			const startFormatted = new DateTime().subtract(i, 'weeks').startOf('week').format('DD/MM');
			if (start.diff(startDate, 'days') > 0) {
				weekLabels.push({
					start: start,
					startOfWeek: start.format('YYYY-MM-DD'),
					end: end,
					startFormatted: startFormatted,
					endFormatted: endFormatted
				});
			}
		}
		const length = weekLabels?.length;
		if (new DateTime(startDate).diff(weekLabels[length - 1]['start'], 'days') < 0) {
			const daysLeft = {
				start: new DateTime(startDate),
				startOfWeek: new DateTime(startDate).format('YYYY-MM-DD'),
				end: new DateTime(weekLabels[length - 1]['start']).subtract(1, 'day'),
				startFormatted: new DateTime(startDate).format('DD/MM'),
				endFormatted: new DateTime(weekLabels[length - 1]['start']).subtract(1, 'day').format('DD/MM')
			};
			weekLabels.push(daysLeft);
		}
		if (weekLabels[0].end.diff(new DateTime().subtract(1, 'day')) > 1) {
			weekLabels[0].end = new DateTime().subtract(1, 'day');
			weekLabels[0].endFormatted = new DateTime().subtract(1, 'day').format('DD/MM');
		}
		return weekLabels;
	}

	getMonthLabelsForTimePeriod(startDate, endDate) {
		let monthLabels = [];
		const monthsInTimePeriod = endDate.diff(startDate, 'months');
		for (let i = 0; i < monthsInTimePeriod + 2; i++) {
			const start = new DateTime().subtract(i, 'months').startOf('month');
			const startFormatted = start.format('DD/MM');
			if (start.diff(startDate, 'days') > -1) {
				monthLabels.push({
					start: start,
					startFormatted: startFormatted
				});
			}
		}
		return monthLabels;
	}
}
