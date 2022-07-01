import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {CampaignTask, UpcomingUserCampaign} from '@sharedModule/models/graph-ql.model';
import {BehaviorSubject} from 'rxjs';
import {CampaignGroupsModel} from '@sharedModule/models/campaign-groups.model';
import {UserService} from '@sharedModule/services/user.service';

@Injectable()
export class GroupCampaignService {
	public campaigns = new BehaviorSubject<any>(null);
	private campaignFetchRequest: Promise<any> = null;
	public upcomingCampaigns = new BehaviorSubject<UpcomingUserCampaign[]>(null);

	constructor(
		private readonly amplifyAppSyncService: AmplifyAppSyncService,
		private readonly userService: UserService
	) {}

	async getUserCampaigns(limit: number = 100, nextToken: string = null): Promise<CampaignGroupsModel[]> {
		if (this.campaignFetchRequest) {
			return this.campaignFetchRequest;
		}

		this.campaignFetchRequest = new Promise(async resolve => {
			const calls = [];
			const campaigns = await this.getAllUserCampaigns();

			const items = campaigns.filter(
				campaign => campaign.status !== 'Draft' && campaign.status !== 'PendingApproval' && campaign.status
			);
			const draftItems = campaigns.filter(
				campaign => campaign.status === 'Draft' || campaign.status === 'PendingApproval' || campaign.status
			);

			items.forEach(campaign => calls.push(this.getUserCampaignTasks(campaign.campaignId)));
			(await Promise.all(calls)).forEach((task, i) => (items[i]['campaignTasks'] = task));

			this.campaigns.next(draftItems.concat(items));
			resolve(campaigns);
		});

		return this.campaignFetchRequest;
	}

	public async getCampaignGroupsForUser() {
		try {
			return await this.amplifyAppSyncService.getCampaignGroupsForUser();
		} catch (e) {
			return e;
		}
	}

	async getUpcomingCampaignsForUsers() {
		if (this.upcomingCampaigns.getValue()) {
			return this.upcomingCampaigns.value;
		}
		const campaigns = await this.amplifyAppSyncService.getUpcomingCampaignsForUsers();
		this.upcomingCampaigns.next(campaigns);
		return this.upcomingCampaigns.value;
	}

	async getAllUserCampaigns() {
		const response = await this.amplifyAppSyncService.getCampaignGroupsForUser();
		let items = response ? response : [];
		return items;
	}

	public async getUserCampaignTasks(campaignId: string, nextToken: string = null): Promise<CampaignTask[]> {
		const response = await this.amplifyAppSyncService.getUserCampaignTasks(campaignId, 1000, nextToken);
		let items = response.items ? response.items : [];

		if (response.nextToken) {
			const itemsFromNextToken = await this.getUserCampaignTasks(campaignId, response.nextToken);
			items = items.concat(itemsFromNextToken);
		}

		if (nextToken === null) {
			items.sort((a, b) =>
				a.toBePerformedByUTC < b.toBePerformedByUTC ? -1 : a.toBePerformedByUTC > b.toBePerformedByUTC ? 1 : 0
			);
		}

		return items;
	}

	async markUserCampaignStatus(campaignId, status) {
		return await this.amplifyAppSyncService.markUserCampaignStatus(campaignId, status);
	}

	async updateTypeform(formId, responseId) {
		return await this.amplifyAppSyncService.updateTypeform(formId, responseId);
	}

	resetUpcomingCampaigns() {
		this.campaignFetchRequest = null;
	}
}
