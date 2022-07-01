import {Injectable} from '@angular/core';
import {SelfMonetizationCampaign} from '@sharedModule/models/graph-ql.model';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {BackendService} from './backend.service';

@Injectable({
	providedIn: 'root'
})
export class CampaignReportService {
	conversations = {};
	conversationsInlast2Days = {};
	conversationsInLast14Days = {};
	totalConversationsIn2DaysForReport = {};

	constructor(private readonly appSync: AmplifyAppSyncService, private readonly backendService: BackendService) {}

	public async createSelfMonetizationCampaign(campaignDetails) {
		return await this.appSync.createSelfMonetizationCampaign(campaignDetails);
	}

	public async updateSelfMonetizationCampaignDetails(campaignDetails) {
		return await this.appSync.updateSelfMonetizationCampaignDetails(campaignDetails);
	}

	public async createCampaignPosts(campaignDetails) {
		return await this.appSync.createCampaignPosts(campaignDetails);
	}

	public async updateCampaignPosts(campaignDetails) {
		return await this.appSync.updateCampaignPosts(campaignDetails);
	}

	public async getUserSelfMonetizationCampaigns(
		limit: number = 100,
		nextToken: string = null
	): Promise<SelfMonetizationCampaign[]> {
		const response = await this.appSync.getUserSelfMonetizationCampaigns(limit, nextToken);
		let items = response.items ? response.items : [];

		if (response.nextToken) {
			const itemsFromNextToken = await this.getUserSelfMonetizationCampaigns(limit, response.nextToken);
			items = items.concat(itemsFromNextToken);
		}
		return items;
	}

	public async getCampaignPosts(campaignId, limit, nextToken) {
		return await this.appSync.getCampaignPosts(campaignId, limit, nextToken);
	}

	public async getShortenUrl(url) {
		return await this.appSync.shortenUrl(url);
	}

	public async getCampaignReportWithPosts(campaignId) {
		return await this.backendService.get('/getCampaignReportWithPosts?campaignId=' + campaignId);
	}

	public async selfMonetizeAnalyse(campaignId) {
		return await this.backendService.post('/report-ondemand-execution', {campaignId: campaignId});
	}
}
