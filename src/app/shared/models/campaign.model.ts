import {CampaignTask} from '@sharedModule/models/graph-ql.model';
import {WordCloudService} from 'src/app/shared/services/word-cloud.service';

import {BrandInsightsService} from '../../brand/services/brand-insights/brand-insights.service';
import {CampaignService} from '../../brand/services/campaign.service';
import {CampaignStatusEnum, CampaignTypeEnum} from '../enums/campaign-type.enum';
import {GroupsService} from '../services/groups.service';
import {CampaignInsightViewModel} from './campaign-insight-view.model';
import {GroupModel} from './group.model';

export class CampaignModel {
	id: string;
	name: string;
	iconUrl: string;
	numConversationsListenedInLastThreeMonths: number;
	brandId: string;
	brands: string[] = [];
	campaignName: string;
	campaignId: string;
	startDateAtUTC: string;
	endDateAtUTC: string;
	campaignGroupIds: string[];
	status: CampaignStatusEnum;
	type: CampaignTypeEnum;
	details: string;
	objective: string;
	category: string;
	subCategory: string;
	brandName: string;
	cmcReportName: string;
	keywords: string[] = [];
	keywordsExcluded: string[] = [];
	campaignTasks: CampaignTask[] = [];
	keywordBrand: string;
	keywordCategory: string;
	keywordSubCategories: string[] = [];
	proposalEmails: string[] = [];
	taskTitle: string;
	campaignPeriod: string;
	communities;
	KPIs;
	primaryObjective: string;
	secondaryObjective: string;
	cmcType: string;
	timezoneName: string;
	powerBIDashboardUrl: string | null;
	s3CoverImageUrl: string | null;

	cmcReportVersion: number | null;
	s3ReportUrl?: string;
	brandIconUrl?: string;
	phaseIdea: string;
	currentPhase?: string;
	totalPhase?: string;
	currency?: ICampaignModelProperty['currency'];
	communicationChannel?: ICampaignModelProperty['communicationChannel'];

	keyFindings?: string;
	brandObjective?: string;
	phaseIdeaSupportingText?: string;
	keyFindingsSupportingText?: string;
	resultsSupportingText?: string;
	kpiSupportingText?: string;
	brandShareOfVoiceSupportingText?: string;
	brandSentimentSupportingText?: string;
	wordCloudSupportingText?: string;
	useWAForContentAutomation: boolean | null;
	trainingLinkMessage: string | null;
	assetsTextRequired: boolean | null;
	assetsImagesRequired: number | null;
	assetsVideoRequired: boolean | null;

	private _groups: GroupModel[];
	private _areInsightViewsAvailable = false;
	private _areGroupDetailsAvailable = false;
	private _insightViewsList: CampaignInsightViewModel[];
	private _areCampaignGroupIdsAvailable = false;
	private _campaignTasks;

	constructor(
		campaign: any,
		private _campaignService: CampaignService,
		private _insightsService: BrandInsightsService,
		private _groupService: GroupsService,
		private _wordCloudService: WordCloudService
	) {
		return this.init(campaign);
	}

	public async getCampaignGroupDetails(): Promise<GroupModel[]> {
		if (this._areGroupDetailsAvailable) {
			return this._groups;
		}

		const groupDetailsRequests = [];

		this.campaignGroupIds.forEach(groupId => groupDetailsRequests.push(this._groupService.getGroup(groupId)));
		this._groups = (await Promise.all(groupDetailsRequests)).map(group => new GroupModel(group));
		this._groups = this._groups.filter(group => group.id);
		this._areGroupDetailsAvailable = true;
		return this._groups;
	}

	public async initiateLoadingMetrics() {
		if (this.type === CampaignTypeEnum.CommunityMarketing) {
			return;
		}

		if (this.status !== CampaignStatusEnum.Suspended) {
			this._insightViewsList.forEach(insightView => insightView.getMetrics());
		}
	}

	public async getInsightViews(): Promise<CampaignInsightViewModel[]> {
		if (this._areInsightViewsAvailable) {
			return this._insightViewsList;
		}

		const insightViews = await this._insightsService.getInsightViews(this);
		this._insightViewsList = insightViews.map(insightView => {
			if (insightView.level === 'Brand') {
				this.brands.push(insightView.viewName.toLowerCase());
			}

			return new CampaignInsightViewModel(insightView, this.brandId, this._insightsService, this._wordCloudService);
		});
		this._areInsightViewsAvailable = true;

		return this._insightViewsList;
	}

	public async markCampaignStatus(status) {
		return this._campaignService.markCampaignStatus(this.brandId, this.campaignId, status);
	}

	public async markBrandStatus(input) {
		return this._campaignService.markBrandStatus(input);
	}

	public async getCampaignTasks() {
		if (this._campaignTasks) {
			return this._campaignTasks;
		}

		if (this.type !== CampaignTypeEnum.CommunityMarketing) {
			this._campaignTasks = [];
			return this._campaignTasks;
		}
		this._campaignTasks = await this._campaignService.getCampaignTasks(this.brandId, this.campaignId);

		// this._campaignTasks = await this._campaignService.listCampaignGroupsAndTasksDetails(this.campaignId, this.brandId);
		return this._campaignTasks;
	}

	private init(campaign: any) {
		Object.assign(this, campaign);
		this.getInsightViews();
		return this;
	}

	public resetCampaignTasksData() {
		this._campaignTasks = null;
	}

	private async getCampaignGroups() {
		if (!this._areCampaignGroupIdsAvailable) {
			let campaignGroups = [];
			try {
				campaignGroups = (await this._campaignService.getCampaignsList(this.campaignId, this.brandId))?.map(
					item => item.groupId
				);
			} catch (e) {
				campaignGroups = [];
			}
			this.campaignGroupIds = campaignGroups?.map(item => item.groupId);
			this._areCampaignGroupIdsAvailable = true;
		}
	}
}

export interface ICampaignModelProperty {
	cmcReportName: string;
	details: string;
	typeformId?: any;
	startDate: Date;
	endDate: Date;
	primaryObjective: string;
	secondaryObjective?: string;
	keywordCategory?: string;
	keywordBrand?: string;
	keywordSubCategories: string[];
	taskTitle?: any;
	campaignPeriod?: any;
	phaseIdea?: string;
	totalPhase?: any;
	currentPhase?: any;
	defaultPostContentType: string;
	communicationChannel?: 'WhatsApp' | 'Email';
	KPIs: string;
	cmcType: string;
	keywords?: string[];
	keywordsExcluded?: string[];
	publishTime: string;
	endDateAtUTC: Date;
	startDateAtUTC: Date;
	timezoneOffMins: number;
	timezoneName: string;
	currency?: 'INR' | 'USD' | 'SGD';
	assetsTextRequired?: boolean;
	assetsImagesRequired?: number;
	assetsVideoRequired?: boolean;
}
