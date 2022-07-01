import {WordCloudService} from 'src/app/shared/services/word-cloud.service';
import {BrandInsightsService} from '../../brand/services/brand-insights/brand-insights.service';
import {CampaignService} from '../../brand/services/campaign.service';
import {GroupsService} from '../services/groups.service';
import {CampaignModel} from './campaign.model';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {BehaviorSubject} from 'rxjs';
import {KeywordTrackerReport} from './graph-ql.model';

export class BrandModel {
	id: string;
	name: string;
	iconUrl?: string;
	status?: string;
	hide: boolean | null;

	reports = new BehaviorSubject<KeywordTrackerReport[]>(null);

	private _areCampaignsAvailable = false;
	private _campaignsList: CampaignModel[];
	private _keywordTrackerService: KeywordTrackerService;

	constructor(
		data: any,
		private _campaignService: CampaignService,
		private _insightsService: BrandInsightsService,
		private _groupService: GroupsService,
		private _wordCloudService: WordCloudService
	) {
		Object.assign(this, data);

		return this;
	}

	public async loadReports(keywordTrackerService: KeywordTrackerService) {
		if (this.reports.getValue()) {
			return;
		}

		this._keywordTrackerService = keywordTrackerService;
		this.reports.next(await this._keywordTrackerService.getReportsForGroup(this.id));
	}

	public async getCampaigns(): Promise<CampaignModel[]> {
		if (this._areCampaignsAvailable) {
			return this._campaignsList;
		}

		const campaigns = await this._campaignService.getCampaigns(this);
		this._campaignsList = campaigns.map(
			campaign =>
				new CampaignModel(
					campaign,
					this._campaignService,
					this._insightsService,
					this._groupService,
					this._wordCloudService
				)
		);
		this._areCampaignsAvailable = true;

		return this._campaignsList;
	}

	public async getCampaignById(campaignId: string): Promise<CampaignModel> {
		if (!this._areCampaignsAvailable) {
			await this.getCampaigns();
		}

		const campaign = this._campaignsList.find(_campaign => _campaign.campaignId === campaignId);

		if (campaign) {
			await campaign.initiateLoadingMetrics();
		}

		return campaign;
	}

	public resetDetails() {
		this._areCampaignsAvailable = false;
		this._campaignsList = [];
	}
}
