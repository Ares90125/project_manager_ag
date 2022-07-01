import {Injectable} from '@angular/core';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {LoggerService} from 'src/app/shared/services/logger.service';
import {
	CampaignGroupAndTaskDetails,
	CampaignStatusEnum,
	CampaignTask,
	CommunityDiscoveryFiltersResponse
} from '@sharedModule/models/graph-ql.model';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {BehaviorSubject} from 'rxjs';
import {CampaignGroupsModel} from '@sharedModule/models/campaign-groups.model';

@Injectable({
	providedIn: 'root'
})
export class CampaignService {
	public onUpdateCampaignGroups = new BehaviorSubject<any>(null);
	public onUpdateCampaign = new BehaviorSubject<any>(null);

	constructor(private loggerService: LoggerService, private readonly appSync: AmplifyAppSyncService) {}

	public async getCampaigns(brand: BrandModel) {
		try {
			const campaigns = await this.appSync.getCampaignsByBrandId(brand.id);
			return campaigns.items;
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching campaigns',
				{brandId: brand.id},
				'CampaignService',
				'getCampaigns',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async getCampaignsByBrandId(brandId: string) {
		try {
			const campaigns = await this.appSync.getCampaignsByBrandId(brandId);
			return campaigns.items;
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching campaigns',
				{brandId: brandId},
				'CampaignService',
				'getCampaigns',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async getCampaignsList(campaignId: string, brandId: string) {
		try {
			return await this.appSync.ListCampaignGroups(campaignId, brandId, 1000, null);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching campaign list',
				{brandId: brandId, campaignId: campaignId},
				'CampaignService',
				'getCampaignsList',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async listCampaignGroupsAndTasksDetails(campaignId, brandId, nextToken): Promise<CampaignGroupAndTaskDetails> {
		try {
			return await this.appSync.listCampaignGroupsAndTasksDetails(campaignId, brandId, nextToken);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching campaign groups and tasks',
				{brandId: brandId, campaignId: campaignId},
				'CampaignService',
				'listCampaignGroupsAndTasksDetails',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async createBrandCampaign(campaignInfo) {
		try {
			return await this.appSync.createCampaign(campaignInfo);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while creating brand campaign',
				{campaignInfo: campaignInfo},
				'CampaignService',
				'createBrandCampaign',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async createCMCampaignGroups(campaignGroups) {
		try {
			return await this.appSync.createCMCampaignGroups(campaignGroups);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while creating campaign groups',
				{campaignGroups: campaignGroups},
				'CampaignService',
				'createCMCampaignGroups',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async deleteCMCampaignGroup(campaignId, groupId) {
		try {
			return await this.appSync.deleteCMCampaignGroup(campaignId, groupId);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while deleting campaign group',
				{groupId: groupId, campaignId: campaignId},
				'CampaignService',
				'deleteCMCampaignGroup',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async deleteCMCampaignGroups(campaignId, groupIds, taskIds = []) {
		try {
			return await this.appSync.deleteCMCampaignGroups(campaignId, groupIds, taskIds);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while deleting campaign groups',
				{groupId: groupIds, campaignId: campaignId},
				'CampaignService',
				'deleteCMCampaignGroup',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}

	public async updateCMCampaignGroup(input) {
		try {
			return await this.appSync.updateCMCampaignGroup(input);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while updating campaign group',
				{data: input},
				'CampaignService',
				'updateCMCampaignGroup',
				LoggerCategory.AppLogs
			);
			throw e;
		}
	}

	public async updateCampaignGroupStatus(campaignId, groupId, groupTaskStatus, isAcceptedByCommunityAdmin) {
		try {
			return await this.appSync.updateCampaignGroupStatus({
				campaignId: campaignId,
				groupId: groupId,
				groupTaskStatus: groupTaskStatus,
				isAcceptedByCommunityAdmin: isAcceptedByCommunityAdmin
			});
		} catch (e) {
			throw e;
		}
	}

	public async updateCMCampaignGroups(input) {
		try {
			return await this.appSync.updateCMCampaignGroups(input);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while updating campaign group',
				{data: input},
				'CampaignService',
				'updateCMCampaignGroups',
				LoggerCategory.AppLogs
			);
			throw e;
		}
	}

	public async updateCMCampaignGroupsModeOfCommunication(input) {
		try {
			return await this.appSync.updateCMCampaignGroupsModeOfCommunication(input);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while updating campaign group mode of communication',
				{data: input},
				'CampaignService',
				'updateCMCampaignGroupsModeOfCommunication',
				LoggerCategory.AppLogs
			);
			throw e;
		}
	}

	async discoverCommunities(input) {
		try {
			return await this.appSync.CommunityDiscoveryAPI(input);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching communities',
				{input},
				'CampaignService',
				'discoverCommunities',
				LoggerCategory.AppLogs
			);
			throw e;
		}
	}

	public async markCampaignStatus(brandId: string, campaignId: string, status: CampaignStatusEnum) {
		try {
			return await this.appSync.markCampaignStatus(brandId, campaignId, status);
		} catch (e) {
			this.loggerService.debug(
				'Error while marking campaign status',
				{brandId: brandId, campaignId: campaignId},
				'CampaignService',
				'markCampaignStatus',
				LoggerCategory.AppLogs
			);
			throw e;
		}
	}

	public async markBrandStatus(input) {
		try {
			return this.appSync.updateBrand(input);
		} catch (e) {
			this.loggerService.debug(
				'Error while marking brand status',
				{input: input},
				'CampaignService',
				'markBrandStatus',
				LoggerCategory.AppLogs
			);
			throw e;
		}
	}

	public async communityDiscoveryFilters(): Promise<CommunityDiscoveryFiltersResponse> {
		return await this.appSync.communityDiscoveryFilters();
	}

	public async communityCitiesByCountriesOrRegions(countries, regions): Promise<any> {
		return await this.appSync.communityCitiesByCountriesOrRegions(countries, regions);
	}

	public async downloadCommunitiesExcel(campaignId): Promise<any> {
		return await this.appSync.downloadCommunitiesExcel(campaignId);
	}

	public async downloadCMCExecutionExcel(campaignId) {
		return await this.appSync.downloadCMCExecutionExcel(campaignId);
	}

	public async getCampaignTasks(
		brandId: string,
		campaignId: string,
		nextToken: string = null
	): Promise<CampaignTask[]> {
		try {
			const response = await this.appSync.getCampaignTasks(brandId, campaignId, 1000, nextToken);
			let items = response.items;

			if (response.nextToken) {
				const itemsFromNextToken = await this.getCampaignTasks(brandId, campaignId, response.nextToken);
				items = items.concat(itemsFromNextToken);
			}

			if (nextToken === null) {
				items?.sort((a, b) =>
					a.toBePerformedByUTC < b.toBePerformedByUTC ? -1 : a.toBePerformedByUTC > b.toBePerformedByUTC ? 1 : 0
				);
			}

			return items;
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching campaign Tasks',
				{brandId: brandId, campaignId: campaignId},
				'CampaignService',
				'getCampaignTasks',
				LoggerCategory.AppLogs
			);
			return [];
		}
	}

	public subscribeToUpdateCampaignGroups(campaignId: string) {
		try {
			return this.appSync.OnUpdateCampaignGroupsOnCampaignId(campaignId).subscribe({
				next: (data: any) => this.updateCampaignGroups(data),
				error: () => undefined
			});
		} catch (e) {
			this.loggerService.error(
				e,
				'Error in subscribing to user updates',
				{campaignId: campaignId},
				'User',
				'subscribeToGroupUpdates'
			);
		}
	}

	public unSubscribeToUpdateCampaignGroups(campaignId: string) {
		// this.appSync.wsRealtimeSubscriptions.forEach(item => {

		// });
		this.appSync.unSubscribeToUpdateCampaignGroups(campaignId);
	}

	public subscribeToUpdateBrandCampaign(campaignId: string) {
		try {
			this.appSync.onUpdateBrandCampaign(campaignId).subscribe({
				next: (data: any) => this.updateCampaign(data),
				error: () => undefined
			});
		} catch (e) {
			this.loggerService.error(
				e,
				'Error in subscribing to user updates',
				{campaignId: campaignId},
				'User',
				'subscribeToGroupUpdates'
			);
		}
	}

	async updateCampaign(data) {
		this.onUpdateCampaign.next(data.value.data.onUpdateBrandCampaign);
	}

	async updateCampaignGroups(data) {
		this.onUpdateCampaignGroups.next(data.value.data.onUpdateCampaignGroupsOnCampaignId);
	}

	async getCampaignMedia(campaignId) {
		try {
			return await this.appSync.getCampaignMedia(campaignId);
		} catch (e) {}
	}

	public async brandApproveCampaign(campaignId: string, groupId?: string) {
		try {
			return await this.appSync.brandApproveCampaign(campaignId, groupId);
		} catch (err) {
			this.loggerService.error(
				err,
				'Error while approving brand campaign',
				{campaignId, groupId},
				'CampaignService',
				'brandApproveCampaign',
				LoggerCategory.AppLogs
			);
		}
	}

	public async markDeleteCampaignTask(campaignId: string, groupId: string) {
		try {
			return await this.appSync.markDeleteCampaignTask(campaignId, groupId);
		} catch (err) {
			this.loggerService.error(
				err,
				'Error while marking delete campaign task',
				{campaignId, groupId},
				'CampaignService',
				'markDeleteCampaignTask',
				LoggerCategory.AppLogs
			);
		}
	}

	public async markCampaignTaskDone(campaignId: string, groupId: string) {
		try {
			return await this.appSync.markCampaignTaskDone(campaignId, groupId);
		} catch (err) {
			this.loggerService.error(
				err,
				'Error while marking ',
				{campaignId, groupId},
				'CampaignService',
				'markCampaignTaskDone',
				LoggerCategory.AppLogs
			);
		}
	}
}
