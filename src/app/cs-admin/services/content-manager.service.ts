import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {LoggerService} from 'src/app/shared/services/logger.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {CreateAssetInput, UpdateAssetInput} from '@sharedModule/models/graph-ql.model';
import {BackendService} from 'src/app/shared/services/backend.service';
import {UserService} from '../../shared/services/user.service';

@Injectable()
export class ContentManagerService {
	constructor(
		private loggerService: LoggerService,
		private readonly appSync: AmplifyAppSyncService,
		private readonly backendService: BackendService,
		private readonly userService: UserService
	) {}

	public async getCampaignAssets(campaignId: string) {
		try {
			const campaignAssets = await this.appSync.getCampaignAssetsByCampaignId(campaignId);
			return campaignAssets;
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while fetching campaign assets',
				{campaignId},
				'ContentManagerService',
				'getCampaignAssets',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async getCampaignGroupAssets(campaignId: string, groupId: string) {
		try {
			const campaignGroupAssets = await this.appSync.getCampaignGroupAssetsByIds(campaignId, groupId);
			return campaignGroupAssets;
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while fetching campaign group assets',
				{campaignId, groupId},
				'ContentManagerService',
				'getCampaignGroupAssets',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async updateCampaignGroupAssets(campaignId: string, groupId: string, input: UpdateAssetInput) {
		try {
			const campaignGroupAssets = await this.appSync.updateCampaignGroupAssetsByIds(campaignId, groupId, input);
			return campaignGroupAssets;
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while updating assets',
				{campaignId, groupId, input},
				'ContentManagerService',
				'updateCampaignGroupAssets',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async createCampaignGroupAsset({
		campaignId,
		groupId,
		input
	}: {
		campaignId: string;
		groupId: string;
		input: CreateAssetInput;
	}) {
		try {
			const campaignGroupAsset = await this.appSync.createCampaignGroupAsset({campaignId, groupId, input});
			return campaignGroupAsset;
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while creating group asset',
				{campaignId, groupId, input},
				'ContentManagerService',
				'createCampaignGroupAsset',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async deleteCampaignGroupAsset({campaignId, groupId, itemId}) {
		try {
			return await this.appSync.deleteCampaignGroupAsset({campaignId, groupId, itemId});
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while deleting campaign group asset',
				{campaignId, groupId, itemId},
				'ContentManagerService',
				'deleteCampaignGroupAsset',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async getCMCNotifications({
		userId,
		count = 10,
		campaignId,
		type
	}: {
		userId: any;
		count: number;
		campaignId?: string;
		type: 'asset' | 'support';
	}) {
		const timestamp = new Date();
		timestamp.setDate(timestamp.getDate() - 1);
		const timestampMs = timestamp.getMilliseconds();
		try {
			return await this.appSync.getCMCNotifications({userId, timestamp: timestampMs, count, campaignId, type});
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while updating assets',
				{userId, timestamp, count},
				'ContentManagerService',
				'updateCampaignGroupAssets',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async markCMCNotificationAsRead({id}) {
		try {
			return await this.appSync.markCMCNotificationAsRead({id});
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while marking notification as read',
				{id},
				'ContentManagerService',
				'markCMCNotificationAsRead',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async createTaskForCampaignGroupAsset({campaignId, groupId}) {
		try {
			return await this.appSync.createTaskForCampaignGroupAsset({campaignId, groupId});
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while creating task for campaign group asset',
				{campaignId, groupId},
				'ContentManagerService',
				'createTaskForCampaignGroupAsset',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async getUsersByRoles() {
		try {
			return await this.appSync.getUsersByRoles();
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while fetching users by roles',
				{},
				'ContentManagerService',
				'getUsersByRoles',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async getCampaignGroupAssetKpis(campaignId: string) {
		try {
			return await this.appSync.getCampaignGroupAssetKpis(campaignId);
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while fetching campaign group asset kpis',
				{campaignId},
				'ContentManagerService',
				'getCampaignGroupAssetKpis',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async requireAssetReminder({
		campaignId,
		groupId,
		message
	}: {
		campaignId: string;
		groupId: string;
		message?: string;
	}) {
		try {
			return await this.appSync.requireAssetReminder({campaignId, groupId, message});
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while requiring asset reminder',
				{campaignId, groupId, message},
				'ContentManagerService',
				'requireAssetReminder',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async getCampaignByCampaignId({campaignId}): Promise<any> {
		const url = `/cmc/getCampaign/${campaignId}`;
		return await this.backendService.restGet(url);
	}

	public async downloadCampaignGroupAssetsExcel({campaignId}): Promise<any> {
		try {
			return await this.appSync.downloadCampaignGroupAssetsExcel({campaignId});
		} catch (error) {
			this.loggerService.error(
				error,
				'Error while downloading campaign group assets excel',
				{campaignId},
				'ContentManagerService',
				'downloadCampaignGroupAssetsExcel',
				LoggerCategory.AppLogs
			);
			return error;
		}
	}

	public async cmcSendRating({campaignId, groupId, rating}): Promise<{status: string}> {
		try {
			return await this.appSync.cmcSendRating({campaignId, groupId, rating});
		} catch (err) {
			this.loggerService.error(
				err,
				'Error while sending cmc rating',
				{campaignId, groupId, rating},
				'ContentManagerService',
				'cmcSendRating',
				LoggerCategory.AppLogs
			);
			return err;
		}
	}
}

