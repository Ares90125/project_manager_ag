import {Injectable} from '@angular/core';
import {BrandInsightsService} from '@brandModule/services/brand-insights/brand-insights.service';
import {CampaignService} from '@brandModule/services/campaign.service';
import {PostContentTypeEnum} from '@groupAdminModule/models/facebook-post.model';
import {INewScreenshotAdded} from '@sharedModule/components/cmcReport-v3/upload-screenshot/upload-screenshot.component';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {
	CampaignTask,
	CmcReportMetrics,
	CMCReportMetricsV2,
	CmcReportWc,
	Keyword,
	ListeningCampaign,
	ListeningCampaignInsightViewsQuery,
	UpdateCampaignInput
} from '@sharedModule/models/graph-ql.model';
import {BackendService} from '@sharedModule/services/backend.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {WordCloudService} from '@sharedModule/services/word-cloud.service';
import {BehaviorSubject} from 'rxjs';
import {CampaignTypeEnum} from 'src/app/shared/enums/campaign-type.enum';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {environment} from 'src/environments/environment';

@Injectable()
export class CreateCampaignService {
	public campaignType = new BehaviorSubject<CampaignTypeEnum>(null);
	public name = new BehaviorSubject<string>(null);
	public communityManagers;

	constructor(
		private readonly appSync: AmplifyAppSyncService,
		private logger: LoggerService,
		private backendService: BackendService,
		private campaignService: CampaignService,
		private groupsService: GroupsService,
		private insightsService: BrandInsightsService,
		private wordCloudService: WordCloudService
	) {}

	public async createCampaignTask(taskDetails, brandId): Promise<CampaignTask> {
		try {
			const campaigns = await this.appSync.createCampaignTask(taskDetails, brandId);
			return campaigns[0];
		} catch (e) {
			return e;
		}
	}

	public async createCampaign(campaignDetails): Promise<CampaignModel> {
		const campaignDet = await this.appSync.createCampaign(campaignDetails);
		const campaign = new CampaignModel(
			campaignDet,
			this.campaignService,
			this.insightsService,
			this.groupsService,
			this.wordCloudService
		);
		return campaign;
	}

	public async triggerWANotifications(input): Promise<any> {
		try {
			return await this.appSync.triggerWANotifications(
				input.notificationType,
				input.selectedCommunities,
				input.campaignName,
				input.campaignId,
				input.campaignStatus,
				input.typeformId
			);
		} catch (error) {
			throw error;
		}
	}

	public async sendProposalToCommunityAdmin({campaignId, communityAdminId, groupId}) {
		try {
			return await this.appSync.sendProposalToCommunityAdmin({campaignId, communityAdminId, groupId});
		} catch (error) {
			this.logger.error(
				error,
				'Error while sending proposal to community admin',
				{campaignId, communityAdminId, groupId},
				'CreateCampaignService',
				'sendProposalToCommunityAdmin',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async createListeningCampaign(campaignDetails): Promise<ListeningCampaign> {
		return await this.appSync.createListeningCampaign(campaignDetails);
	}

	public async createInsightViews(insightView): Promise<ListeningCampaignInsightViewsQuery> {
		return await this.appSync.createInsightViews(insightView);
	}

	public async updateInsightViews(insightView): Promise<ListeningCampaignInsightViewsQuery> {
		return await this.appSync.updateInsightViews(insightView);
	}

	public async getGroupsDetailsByName(name) {
		try {
			return await this.appSync.getGroupsDetailsByName(name);
		} catch (e) {
			this.logger.error(
				e,
				'Error while fetching groups',
				{groupName: name},
				'CreateCampaignService',
				'getGroupsDetailsByName',
				LoggerCategory.AppLogs
			);
			return [];
		}
	}

	public async getGroupMembersByGroupId(groupId) {
		try {
			return await this.appSync.getGroupMembersByGroupId(groupId);
		} catch (e) {
			this.logger.error(
				e,
				'Error while fetching group members',
				{groupId: groupId},
				'CreateCampaignService',
				'getGroupMembersByGroupId',
				LoggerCategory.AppLogs
			);
			return null;
		}
	}

	public async getGroupModeratorsByGroupId(groupId) {
		return await this.appSync.getGroupModeratorsByGroupId(groupId);
	}

	public async getUserByUserId(userId) {
		return await this.appSync.getUserById(userId);
	}

	public async getCommunityManagers() {
		if (this.communityManagers) {
			return;
		}
		this.communityManagers = await this.appSync.getCommunityManagers();
	}

	public async getCommunityAdmins(groupId) {
		return await this.appSync.getCommunityAdmins(groupId);
	}

	public async triggerNotificationsForWAorEmailUpdate(input) {
		return await this.appSync.triggerNotificationsForWAorEmailUpdate(input);
	}

	public async updateCampaignDetails(campaignDetails: UpdateCampaignInput): Promise<CampaignModel> {
		const campaignDet = await this.appSync.updateCampaignDetails(campaignDetails);
		const campaign = new CampaignModel(
			campaignDet,
			this.campaignService,
			this.insightsService,
			this.groupsService,
			this.wordCloudService
		);
		return campaign;
	}

	public async updateListeningCampaignDetails(campaignDetails): Promise<ListeningCampaign> {
		return await this.appSync.updateListeningCampaignInput(campaignDetails);
	}

	public async updateCampaignTaskDetails(taskDetails): Promise<CampaignTask> {
		return await this.appSync.updateCampaignTaskDetails(taskDetails);
	}

	public async listKeywords(nextToken = null): Promise<Keyword[]> {
		const listKeywords = await this.appSync.listKeywords(1000, nextToken);
		let brandListKeywords = listKeywords.items.filter(keyword => keyword.keywordCategory === 'Brands');
		if (listKeywords.nextToken) {
			const keywords = await this.listKeywords(listKeywords.nextToken);
			brandListKeywords = brandListKeywords.concat(keywords);
		}
		return brandListKeywords;
	}

	public async listCommunityKeywords(nextToken = null): Promise<Keyword[]> {
		const listCommunityKeywords = await this.appSync.listCommunityKeywords(1000, nextToken);
		let brandListKeywords = listCommunityKeywords.items;
		if (listCommunityKeywords.nextToken) {
			const keywords = await this.listCommunityKeywords(listCommunityKeywords.nextToken);
			brandListKeywords = brandListKeywords.concat(keywords);
		}
		return brandListKeywords;
	}

	public async getCmcReportMetrics(campaignId): Promise<CmcReportMetrics> {
		return await this.appSync.getCmcReportMetrics(campaignId);
	}

	public async getCMCReportMetricsV2(campaignId): Promise<CMCReportMetricsV2> {
		return await this.appSync.getCMCReportMetricsV2(campaignId);
	}

	public addManualUploadedScreenshot(data: INewScreenshotAdded) {
		return this.appSync.createScreenshotUploadData(data);
	}

	public getManualUploadedScreenshot(key: String, limit: number, nextToken: String) {
		return this.appSync.getManuallyUploadedScreenshots(key, limit, nextToken);
	}

	public async getCmcReportWc(campaignId): Promise<CmcReportWc> {
		return await this.appSync.getCmcReportWc(campaignId);
	}

	public async getParticipantGroupsDetails(campaignId): Promise<string> {
		return await this.appSync.getParticipantGroupsDetails(campaignId);
	}

	public async getCampaignPosts(campaignId, limit, nextToken) {
		return await this.appSync.getCampaignPosts(campaignId, limit, nextToken);
	}

	public async deleteCampaignTask(campaignId, taskId): Promise<CampaignTask> {
		return await this.appSync.deleteCampaignTask(campaignId, taskId);
	}

	public async getScreenshotsFromPostIds(body, token = null) {
		const apiPath = environment.envName === 'production' ? 'generate-screenshot-production' : 'generate-screenshot';
		try {
			return await this.backendService.postScreenshotUrl('/' + apiPath, body, token);
		} catch (e) {
			return e;
		}
	}

	public getTimesOnWhichPostCanBePublished() {
		const timeOptions = [];
		let ampmSuffix = 'AM';
		timeOptions.push('12:00 AM');
		timeOptions.push('12:15 AM');
		timeOptions.push('12:30 AM');
		timeOptions.push('12:45 AM');

		for (let i = 0; i < 2; i++) {
			for (let j = 1; j < 12; j++) {
				timeOptions.push(j + ':00 ' + ampmSuffix);
				timeOptions.push(j + ':15 ' + ampmSuffix);
				timeOptions.push(j + ':30 ' + ampmSuffix);
				timeOptions.push(j + ':45 ' + ampmSuffix);
			}

			if (i === 1) {
				break;
			}

			ampmSuffix = 'PM';
			timeOptions.push('12:00 PM');
			timeOptions.push('12:15 PM');
			timeOptions.push('12:30 PM');
			timeOptions.push('12:45 PM');
		}

		return timeOptions;
	}

	validatingMissingDetails(campaignTasks) {
		let numberOfMissings = 0;
		campaignTasks.forEach(task => {
			if (!task['GROUP ID']) {
				numberOfMissings += 1;
			}
			if (!task['GROUP NAME']) {
				numberOfMissings += 1;
			}
			if (!task['GROUP ADMIN/MODERATOR']) {
				numberOfMissings += 1;
			}
			if (!task['POST TYPE']) {
				numberOfMissings += 1;
			}
			if (!task['TITLE']) {
				numberOfMissings += 1;
			}
			if (!task['PERIOD']) {
				numberOfMissings += 1;
			}
			if (
				task['POST TYPE'] &&
				task['POST TYPE'] !== PostContentTypeEnum.Text &&
				task['POST TYPE'] !== 'Image' &&
				task['POST TYPE'] !== PostContentTypeEnum.Video &&
				task['POST TYPE'] !== PostContentTypeEnum.Link &&
				task['POST TYPE'] !== PostContentTypeEnum.LiveVideo &&
				task['POST TYPE'] !== PostContentTypeEnum.MultiVideo &&
				task['POST TYPE'] !== PostContentTypeEnum.VideoImage
			) {
				task['errorPostType'] = true;
				numberOfMissings += 1;
			} else {
				task['errorPostType'] = false;
			}
			if (!task['TEXT'] && task['POST TYPE'] === 'Text') {
				numberOfMissings += 1;
			}
			if (!task['DATE']) {
				numberOfMissings += 1;
			}

			numberOfMissings += CampaignTaskModel.validationForDate(task);

			numberOfMissings += CampaignTaskModel.validationForTime(task);
		});
		return numberOfMissings;
	}
}
