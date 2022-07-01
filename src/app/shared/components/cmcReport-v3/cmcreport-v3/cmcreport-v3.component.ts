import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	Injector,
	Input,
	OnDestroy,
	OnInit
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {CMCReportMetricsV2, CmcReportWc, Keyword, UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {CircularModel} from '@sharedModule/models/group-reports/chart.model';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {FileService} from '@sharedModule/services/file.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import * as _ from 'lodash';
import {Lightbox, LIGHTBOX_EVENT, LightboxEvent} from 'ngx-lightbox';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

import {BrandSentitmentSection} from '../brand-sentiments/brand-sentiments.component';
import {BrandShareofVoiceDetails} from '../brand-share-of-voice/brand-share-of-voice.component';
import {StackedBarGraphConent} from '../brand-share-of-voice/stacked-bar-chart/stacked-bar-chart.component';
import {
	IEngagementInshightLevel1,
	IEngagementInshightLevel2,
	IEngagementInsightSection
} from '../engagement-insight/engagement-insight.component';
import {IUpdatedKPISection} from '../kpis/kpis.component';
import {CMCReportv3S3Data} from '../models/s3Data.interface';
import {IUpdatedPhaseIdeaValues} from '../phase-idea/phase-idea.component';
import {
	IUpdatedReferenceConversationDetails,
	ReferenceConversationData
} from '../reference-conversation/reference-conversation.component';
import {IUpdatedResultSection} from '../results/results.component';
import {TopPerformingPost, TopPerformingPostSection} from '../top-performing-post/top-performing-post.component';
import {calculateKpiMetrics, convertAbsoluteToPercentage} from '../util';
import {IWordCloudSection} from '../wordcloud/wordcloud.component';

declare const TextDecoder;

export enum CampaignPostSortKeys {
	ReactionPercentage = 'reactionPercentage',
	CommentPercentage = 'commentPercentage',
	Engagement = 'engagement'
}

interface CampaignPostsSortMetrics {
	name: 'Comments' | 'Reactions' | 'Engagement';
	list: any[];
	value: `${CampaignPostSortKeys}`;
}

export class CampaignModelv3 extends CampaignModel {
	campaignBriefForCommunityAdmin: any;
	engagementInsightSupportingText?: string;
	topPerformingPostSupportingText?: string;
	engagementInsights: string[];
}

export enum TemplateType {
	'Advanced' = 'Advanced',
	'Unbranded' = 'Unbranded',
	'Basic' = 'Basic',
	'Custom' = 'Custom'
}

@Component({
	selector: 'app-cmcreport-v3',
	templateUrl: './cmcreport-v3.component.html',
	styleUrls: ['./cmcreport-v3.component.scss']
})
export class CMCReportV3Component extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign: CampaignModelv3;
	@Input() isFromBrand = false;
	@Input()
	campaignReportS3Data: CMCReportv3S3Data;
	@Input()
	previewImage = null;

	isReportEdit = true;

	isPublishing = false;
	isPublished = false;
	isCampaignHasS3Url = false;
	showReferenceConversationDialog: boolean;
	afterSOV = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: null};
	beforeSOV = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: null};
	duringSOV = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: null};

	isLoading = false;
	nextToken = null;
	from = 0;
	end = 0;
	limit = 20;
	campaignPosts = [];
	filteredCampaignPosts = [];
	isConversationsLoaded = false;
	participantGroupFrom = 0;
	participantGroupEnd = 20;
	participantGroupsDetails;
	cmcType = [];
	logo = null;
	isLogoRemoved = false;
	visibleCampaignReport = {
		keyMetrics: false,
		campaignStatistics: false,
		shareOfVoice: false,
		sentimentMap: false,
		brandConversationsAndMentions: false,
		participationByGroups: false,
		participatingGroups: false,
		campaignHighlights: false,
		wordCloud: false,
		allPosts: false,
		participationByGroupsMetrics: false
	};
	editCampaignStatsNumber = [];
	campaignReportFormHeaderValues;
	storageUrl = '';
	shareOfVoiceKeys = [];
	selectedShareOfVoiceKeys = [];

	campaignReportForm: FormGroup;
	wordCloudEmptyState = {withOutCampaign: false, withCampaign: false};
	postDistributionSeriesColors = ['#3654FF', '#27AE60'];
	shareOfVoiceColors = ['#3654FF', '#B7B7DC', '#A0A0C2', '#76768D', '#646475'];
	timer = null;
	showTopPosts = false;
	selectedIndex = 0;
	reportMetrics: CMCReportMetricsV2;
	totalAudience: number;
	totalCommunities: number;
	showKPIsInExtendedMode = false;
	public campaignGroups: any;
	userHasUpdatedData = false;
	templateTypeSelected = TemplateType.Advanced;
	templateForm: FormGroup;
	showReportPreview = false;
	referenceConversationData: ReferenceConversationData;
	originalSOVs: StackedBarGraphConent;
	brandListForShareOfVoice: string[];
	private _subscription: Subscription;
	private updatedScrollEvent: Subject<string> = new Subject();

	constructor(
		injector: Injector,
		private readonly fileService: FileService,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService,
		private loggerService: LoggerService,
		private accountService: AccountServiceService,
		private readonly lightbox: Lightbox,
		private _lightboxEvent: LightboxEvent,
		private conversationService: ConversationService,
		private changeDetector: ChangeDetectorRef
	) {
		super(injector);
	}

	@HostListener('window:scroll', ['$event']) // for window scroll events
	scrollOnSections(event) {
		this.updatedScrollEvent.next(event);
	}

	createTemplateForm() {
		this.templateForm = this.formBuilder.group({templateSelected: [TemplateType.Advanced]});
	}

	resetTemplateSelection() {
		this.templateForm.get('templateSelected').setValue(this.templateTypeSelected);
	}

	onSelectingNewTemplate(newTemplate: TemplateType) {
		this.templateTypeSelected = newTemplate;

		this.applyTemplate(newTemplate);
	}

	applyTemplate(templateType: TemplateType) {
		try {
			switch (templateType) {
				case TemplateType.Basic:
					return this.applyBasicTemplate();
				case TemplateType.Advanced:
					return this.applyAdvancedTemplate();
				case TemplateType.Unbranded:
					return this.applyUnbraidedTemplate();
			}
		} catch (error) {}
	}

	checkForTemplateUpdate(data: CMCReportv3S3Data) {
		if (this.isFromBrand) {
			return;
		}
		if (this.isDataAligendWithAdvancedTemplate(data)) {
			this.templateForm.get('templateSelected').setValue(TemplateType.Advanced);
			this.templateTypeSelected = TemplateType.Advanced;
			return;
		}

		if (this.isDataAligendWithBasicTemplate(data)) {
			this.templateForm.get('templateSelected').setValue(TemplateType.Basic);
			this.templateTypeSelected = TemplateType.Basic;
			return;
		}

		if (this.isDataAligendWithUnbraidedTemplate(data)) {
			this.templateForm.get('templateSelected').setValue(TemplateType.Unbranded);
			this.templateTypeSelected = TemplateType.Unbranded;
			return;
		}

		this.templateForm.get('templateSelected').setValue(TemplateType.Custom);
		this.templateTypeSelected = TemplateType.Custom;
	}

	isDataAligendWithAdvancedTemplate(data: CMCReportv3S3Data) {
		const allTrue =
			this.campaignReportS3Data.wordCloud.visibleToBrand &&
			this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand &&
			this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand &&
			this.campaignReportS3Data.keyFindings.visibleToBrand &&
			this.campaignReportS3Data.results.visibleToBrand &&
			this.campaignReportS3Data.results.content.brandMentionsVisibleToBrand &&
			this.campaignReportS3Data.results.content.brandShareofVoiceVisibleToBrand &&
			this.campaignReportS3Data.results.content.categoryConversationVisibleToBrand &&
			this.campaignReportS3Data.results.content.totalReactionAndCommentsVisibleToBrand &&
			this.campaignReportS3Data.results.content.ugcVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.visibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.brandMentionsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.brandShareofVoiceVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.categoryConversationVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.estimateImpressionVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numAdminPostsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentAdminPostVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentUGCPostVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numUGCCommentsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numUGCPostsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalEngagementVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalReactionAndCommentVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalUGCVisibleToBrand &&
			this.campaignReportS3Data.brandShareOfVoice.visibleToBrand &&
			this.campaignReportS3Data.brandShareOfVoice.afterSOV &&
			this.campaignReportS3Data.brandShareOfVoice.beforeSOV &&
			this.campaignReportS3Data.brandShareOfVoice.duringSOV &&
			this.campaignReportS3Data.brandShareOfVoice.nonHashTag &&
			this.campaignReportS3Data.brandSentiment.visibleToBrand &&
			this.campaignReportS3Data.brandSentiment.content.afterSentimentMapVisibleToBrand &&
			this.campaignReportS3Data.brandSentiment.content.beforeSentimentMapVisibleToBrand &&
			this.campaignReportS3Data.brandSentiment.content.duringSentimentMapVisibleToBrand &&
			this.campaignReportS3Data.engagementInsight.benefitsVisibleToBrand &&
			this.campaignReportS3Data.engagementInsight.emotionsVisibleToBrand &&
			this.campaignReportS3Data.engagementInsight.intentVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.visibleToBrand &&
			this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand;
		if (allTrue) {
			return false;
		}

		if (this.campaignReportS3Data.engagementInsight?.content?.benefits) {
			const isAllVisible = this.campaignReportS3Data.engagementInsight.content?.benefits?.every(
				obj => obj.visibleToBrand
			);

			if (!isAllVisible) {
				return false;
			}
		}

		if (this.campaignReportS3Data.engagementInsight?.content?.emotions) {
			const isAllVisible = this.campaignReportS3Data.engagementInsight.content?.emotions?.every(
				obj => obj.visibleToBrand
			);

			if (!isAllVisible) {
				return false;
			}
		}

		if (!this.campaignReportS3Data.engagementInsight.benefitsVisibleToBrand) {
			return false;
		}
		if (!this.campaignReportS3Data.engagementInsight.emotionsVisibleToBrand) {
			return false;
		}
		if (!this.campaignReportS3Data.engagementInsight.intentVisibleToBrand) {
			return false;
		}
		if (this.campaignReportS3Data.engagementInsight?.content?.intent) {
			const isAllVisible = this.campaignReportS3Data.engagementInsight.content?.intent?.every(
				obj => obj.visibleToBrand
			);

			if (!isAllVisible) {
				return false;
			}
		}

		return true;
	}

	isDataAligendWithBasicTemplate(data: CMCReportv3S3Data) {
		let allTrue =
			this.campaignReportS3Data.wordCloud.visibleToBrand &&
			this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand &&
			this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand &&
			this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand &&
			this.campaignReportS3Data.keyFindings.visibleToBrand &&
			this.campaignReportS3Data.results.visibleToBrand &&
			this.campaignReportS3Data.results.content.brandMentionsVisibleToBrand &&
			this.campaignReportS3Data.results.content.brandShareofVoiceVisibleToBrand &&
			this.campaignReportS3Data.results.content.categoryConversationVisibleToBrand &&
			this.campaignReportS3Data.results.content.totalReactionAndCommentsVisibleToBrand &&
			this.campaignReportS3Data.results.content.ugcVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.visibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.brandMentionsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.brandShareofVoiceVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.categoryConversationVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.estimateImpressionVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numAdminPostsVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentAdminPostVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentUGCPostVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.numUGCCommentsVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.numUGCPostsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalEngagementVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalReactionAndCommentVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalUGCVisibleToBrand &&
			this.campaignReportS3Data.brandShareOfVoice.visibleToBrand &&
			!this.campaignReportS3Data.brandShareOfVoice.afterSOV &&
			this.campaignReportS3Data.brandShareOfVoice.beforeSOV &&
			this.campaignReportS3Data.brandShareOfVoice.duringSOV &&
			!this.campaignReportS3Data.brandShareOfVoice.nonHashTag &&
			this.campaignReportS3Data.brandSentiment.visibleToBrand &&
			this.campaignReportS3Data.brandSentiment.content.afterSentimentMapVisibleToBrand &&
			this.campaignReportS3Data.brandSentiment.content.beforeSentimentMapVisibleToBrand &&
			this.campaignReportS3Data.brandSentiment.content.duringSentimentMapVisibleToBrand &&
			!this.campaignReportS3Data.engagementInsight.benefitsVisibleToBrand &&
			!this.campaignReportS3Data.engagementInsight.emotionsVisibleToBrand &&
			!this.campaignReportS3Data.engagementInsight.intentVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.visibleToBrand &&
			this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand;
		if (!allTrue) {
			return false;
		}
		if (this.campaignReportS3Data.engagementInsight.content?.benefits) {
			const value = this.campaignReportS3Data.engagementInsight.content?.benefits?.every(obj => obj.visibleToBrand);
			if (!value) {
				return false;
			}
		}

		if (this.campaignReportS3Data.engagementInsight.content?.emotions) {
			const value = this.campaignReportS3Data.engagementInsight.content?.emotions?.every(obj => obj.visibleToBrand);
			if (!value) {
				return false;
			}
		}

		if (this.campaignReportS3Data.engagementInsight.content?.intent) {
			const value = this.campaignReportS3Data.engagementInsight.content?.intent?.every(obj => obj.visibleToBrand);
			if (!value) {
				return false;
			}
		}
		return true;
	}

	isDataAligendWithUnbraidedTemplate(data: CMCReportv3S3Data) {
		let allValid =
			this.campaignReportS3Data.wordCloud.visibleToBrand &&
			this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand &&
			this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand &&
			this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand &&
			this.campaignReportS3Data.keyFindings.visibleToBrand &&
			this.campaignReportS3Data.results.visibleToBrand &&
			this.campaignReportS3Data.results.content.brandMentionsVisibleToBrand &&
			this.campaignReportS3Data.results.content.brandShareofVoiceVisibleToBrand &&
			this.campaignReportS3Data.results.content.categoryConversationVisibleToBrand &&
			this.campaignReportS3Data.results.content.totalReactionAndCommentsVisibleToBrand &&
			this.campaignReportS3Data.results.content.ugcVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.visibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.brandMentionsVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.brandShareofVoiceVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.categoryConversationVisibleToBrand &&
			!this.campaignReportS3Data.kpiDetails.content.estimateImpressionVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numAdminPostsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentAdminPostVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentUGCPostVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numUGCCommentsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.numUGCPostsVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalEngagementVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalReactionAndCommentVisibleToBrand &&
			this.campaignReportS3Data.kpiDetails.content.totalUGCVisibleToBrand &&
			!this.campaignReportS3Data.brandShareOfVoice.visibleToBrand &&
			!this.campaignReportS3Data.brandShareOfVoice.afterSOV &&
			!this.campaignReportS3Data.brandShareOfVoice.beforeSOV &&
			!this.campaignReportS3Data.brandShareOfVoice.duringSOV &&
			!this.campaignReportS3Data.brandShareOfVoice.nonHashTag &&
			!this.campaignReportS3Data.brandSentiment.visibleToBrand &&
			!this.campaignReportS3Data.brandSentiment.content.afterSentimentMapVisibleToBrand &&
			!this.campaignReportS3Data.brandSentiment.content.beforeSentimentMapVisibleToBrand &&
			!this.campaignReportS3Data.brandSentiment.content.duringSentimentMapVisibleToBrand &&
			!this.campaignReportS3Data.engagementInsight.benefitsVisibleToBrand &&
			!this.campaignReportS3Data.engagementInsight.emotionsVisibleToBrand &&
			this.campaignReportS3Data.engagementInsight.intentVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.visibleToBrand &&
			this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand &&
			this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand;
		if (!allValid) {
			return false;
		}
		if (this.campaignReportS3Data.engagementInsight.content?.benefits) {
			const value = this.campaignReportS3Data.engagementInsight.content?.benefits?.every(obj => obj.visibleToBrand);
			if (!value) {
				return false;
			}
		}

		if (this.campaignReportS3Data.engagementInsight.content?.emotions) {
			const value = this.campaignReportS3Data.engagementInsight.content?.emotions?.every(obj => obj.visibleToBrand);
			if (!value) {
				return false;
			}
		}

		if (this.campaignReportS3Data.engagementInsight.content?.intent) {
			const value = this.campaignReportS3Data.engagementInsight.content?.intent?.every(obj => obj.visibleToBrand);
			if (!value) {
				return false;
			}
		}
		return true;
	}

	async fetchCampaignGroups() {
		const camapignGroupList = await this.campaignService.getCampaignsList(
			this.campaign.campaignId,
			this.campaign.brandId
		);
		return camapignGroupList;
	}

	async fetchTransformationKeywords(brandName) {
		const listKeywords = await this.createCampaignService.listKeywords();

		const filteredKeywords = listKeywords.filter(
			obj => obj.category == this.campaign.keywordCategory && obj.uiFriendlyName === brandName
		);
		const transformationKeywords = {};
		filteredKeywords.forEach(obj => {
			if (!obj.transformations) {
				return;
			}
			this.getKeywordTRansformations(obj).forEach(key => (transformationKeywords[key] = true));
		});
		return Object.keys(transformationKeywords);
	}

	async fetchReferenceConversation(brandName: string, type, insightsType = null) {
		try {
			let terms;
			if (type === 'SOV' || type === 'insights') {
				terms = await this.fetchTransformationKeywords(brandName);
			}
			let list;
			try {
				list = await this.fetchCampaignGroups();
				this.campaignGroups = list;
			} catch (error) {
				console.warn('error while fetch camapign groups ', error);
				return;
			}
			// if (type === 'insights') {
			// 	terms = this.campaignReportS3Data.engagementInsight.content[insightsType]
			// 		.find(type => type.name === brandName)
			// 		.keywords.split(',');
			// }
			let keywords = type === 'SOV' ? terms : type === 'sentiment' ? [] : type === 'insights' ? terms : [];
			let sentiments = type === 'sentiment' ? [brandName?.toLowerCase()] : null;
			return await this.conversationService.getConversations(
				keywords,
				list.map(obj => obj.groupId),
				[],
				0,
				50,
				sentiments,
				null,
				this.campaign?.startDateAtUTC,
				this.campaign?.endDateAtUTC
			);
		} catch (error) {
			this.loggerService.error(error, `Failed to get the reference conversation ${brandName} ${type} ${insightsType} `);
			return [];
		}
	}

	async ngOnInit() {
		super._ngOnInit();

		this.createTemplateForm();
		try {
			this.fetchCampaignGroups().then(list => {
				this.campaignGroups = list;
			});
		} catch (err) {}
		this.storageUrl = environment.storageUrl;
		this.subscribeToScrollEventChanges();
		// const keywords = this.campaign['keywords'] ? this.campaign['keywords'] : [];
		// this.transformedKeywords = [];
		// this.campaign['selectedKPIs'] = JSON.parse(this.campaign['KPIs']);
		// this.campaign['selectedCmcType'] = JSON.parse(this.campaign['cmcType']);

		// keywords.forEach(keyword => {
		// 	const selectedKeyword = keyword.split('_');
		// 	this.transformedKeywords.push(selectedKeyword[0].trim());
		// });
		// this.transformedKeywords = this.transformedKeywords.filter(el => !!el);

		if (!this.isFromBrand) {
			this.setSectionDetails(this.campaign, this.reportMetrics);
			this.setWordCloud(this.campaign.campaignId);
		}

		if (this.campaign.s3ReportUrl && this.isFromBrand) {
			this.isCampaignHasS3Url = true;
			this.setReportData(this.campaign.s3ReportUrl);
		} else if (!this.campaign.s3ReportUrl && this.isFromBrand) {
			this.isCampaignHasS3Url = false;
		} else {
			this.getReportMetrics();
		}
		if (this.isFromBrand && !this.isCampaignHasS3Url && !this.campaignReportS3Data) {
			this.campaignReportS3Data = {totalCommunities: 0, totalAudience: 0} as CMCReportv3S3Data;
		}
		if (!this.isFromBrand) {
			this.applyTemplate(TemplateType.Advanced);
		}
		if (this.campaign.s3CoverImageUrl) {
			// this.previewImage = await this.fileService.getImage(this.campaign.s3CoverImageUrl);
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	onClickingShowPreview() {
		this.campaignReportS3Data = {...this.campaignReportS3Data};
		this.showReportPreview = true;
	}

	setSectionDetails(data: CampaignModelv3, reportMetric: CMCReportMetricsV2) {
		this.onUpdatingBrandObjective(data.brandObjective);
		this.onUpdatingPhaseIdeaDetails({
			content: data.phaseIdea || null,
			supportingText: data.phaseIdeaSupportingText || '',
			visibleToBrand: true
		});
		this.onUpdatingKeyFindingsDetails({
			content: data.keyFindings || null,
			supportingText: data.keyFindingsSupportingText || '',
			visibleToBrand: true
		});

		this.onUpdatingResultsDetails({supportingText: data.resultsSupportingText} as IUpdatedResultSection);
		if (reportMetric) {
			const kpis = calculateKpiMetrics(reportMetric, this.campaign.keywordBrand);
			this.onUpdatingKPIDetails({
				content: kpis,
				supportingText: this.campaign?.kpiSupportingText || '',
				visibleToBrand: true
			});
		}

		this.applyTemplate(TemplateType.Advanced);
	}

	async fetchManualScreenshot(key: string) {
		try {
			const response = await this.createCampaignService.getManualUploadedScreenshot(key, 100, '');
			return response.items;
		} catch (error) {
			this.logger.error(error, `Error during fetching all post manual screenshot for ${key}`);
			return [];
		}
	}

	onGettingUpdatedReferenceConversationDetails(data: IUpdatedReferenceConversationDetails) {
		this.userHasUpdatedData = true;

		switch (data.section) {
			case 'Brand Share of Voice': {
				if (data.stage === 'During Campaign') {
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation
					};
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation.duringSOV = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation.duringSOV,
						[data.brandName]: data.visibleToBrand
					};
				} else if (data.stage === 'Pre-Campaign') {
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation
					};
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation.beforeSOV = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation.beforeSOV,
						[data.brandName]: data.visibleToBrand
					};
				} else if (data.stage === 'Post-Campaign') {
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation
					};
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation.afterSOV = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation.afterSOV,
						[data.brandName]: data.visibleToBrand
					};
				} else if (data.stage === 'Non-Hastag') {
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation
					};
					this.campaignReportS3Data.brandShareOfVoice.referenceConversation.nonHashTag = {
						...this.campaignReportS3Data.brandShareOfVoice.referenceConversation.nonHashTag,
						[data.brandName]: data.visibleToBrand
					};
				}

				return _.set(
					this.campaignReportS3Data,
					`referenceConversation.brandShareOfVoice.${data.stage}.${data.brandName}`,
					data.postDetails
				);
			}
			case 'Brand Sentiment': {
				if (data.stage === 'Pre-Campaign') {
					this.campaignReportS3Data.brandSentiment.content = {...this.campaignReportS3Data.brandSentiment.content};
					this.campaignReportS3Data.brandSentiment.content.referenceConversations = {
						...this.campaignReportS3Data.brandSentiment.content.referenceConversations
					};
					this.campaignReportS3Data.brandSentiment.content.referenceConversations.beforeSentimentMap[data.brandName] =
						data.visibleToBrand;
				} else if (data.stage === 'During Campaign') {
					this.campaignReportS3Data.brandSentiment.content = {...this.campaignReportS3Data.brandSentiment.content};
					this.campaignReportS3Data.brandSentiment.content.referenceConversations = {
						...this.campaignReportS3Data.brandSentiment.content.referenceConversations
					};
					this.campaignReportS3Data.brandSentiment.content.referenceConversations.duringSentimentMap[data.brandName] =
						data.visibleToBrand;
				}
				if (data.stage === 'Post-Campaign') {
					this.campaignReportS3Data.brandSentiment.content = {...this.campaignReportS3Data.brandSentiment.content};
					this.campaignReportS3Data.brandSentiment.content.referenceConversations = {
						...this.campaignReportS3Data.brandSentiment.content.referenceConversations
					};
					this.campaignReportS3Data.brandSentiment.content.referenceConversations.afterSentimentMap[data.brandName] =
						data.visibleToBrand;
				}

				return _.set(
					this.campaignReportS3Data,
					`referenceConversation.brandSentiments.${data.stage}.${data.brandName}`,
					data.postDetails
				);
			}
			case 'Engagement Insights': {
				if (data.stage === 'intent') {
					this.campaignReportS3Data.engagementInsight.content = {
						...this.campaignReportS3Data.engagementInsight.content
					};
					this.campaignReportS3Data.engagementInsight.content.intent =
						this.campaignReportS3Data.engagementInsight.content.intent.map(bucket =>
							bucket.name === data.brandName ? {...bucket, showReferenceConversation: data.visibleToBrand} : bucket
						);
				} else if (data.stage === 'benefits') {
					this.campaignReportS3Data.engagementInsight.content = {
						...this.campaignReportS3Data.engagementInsight.content
					};
					this.campaignReportS3Data.engagementInsight.content.benefits =
						this.campaignReportS3Data.engagementInsight.content.benefits.map(bucket =>
							bucket.name === data.brandName ? {...bucket, showReferenceConversation: data.visibleToBrand} : bucket
						);
				} else if (data.stage === 'emotions') {
					this.campaignReportS3Data.engagementInsight.content = {
						...this.campaignReportS3Data.engagementInsight.content
					};
					this.campaignReportS3Data.engagementInsight.content.emotions =
						this.campaignReportS3Data.engagementInsight.content.emotions.map(bucket =>
							bucket.name === data.brandName ? {...bucket, showReferenceConversation: data.visibleToBrand} : bucket
						);
				}
				return _.set(
					this.campaignReportS3Data,
					`referenceConversation.brandInsights.${data.stage}.${data.brandName}`,
					data.postDetails
				);
			}
			default:
				this.loggerService.critical(data, 'Invalid Data emitted by Reference Conversation component');
		}
	}

	async showReferenceConversation(category, type) {
		// NOTE: Integrate Reference Converastion view

		try {
			let referenceConversation;
			switch (type) {
				case 'SOV':
					{
						let visibleToBrand = true;
						if (category.type === 'During Campaign') {
							visibleToBrand =
								this.campaignReportS3Data.brandShareOfVoice.referenceConversation.duringSOV[category.brandName];
						} else if (category.type === 'Pre-Campaign') {
							visibleToBrand =
								this.campaignReportS3Data.brandShareOfVoice.referenceConversation.beforeSOV[category.brandName];
						} else if (category.type === 'Post-Campaign') {
							visibleToBrand =
								this.campaignReportS3Data.brandShareOfVoice.referenceConversation.afterSOV[category.brandName];
						} else if (category.type === 'Non-Hastag') {
							visibleToBrand =
								this.campaignReportS3Data.brandShareOfVoice.referenceConversation.nonHashTag[category.brandName];
						}
						if (this.isFromBrand && !visibleToBrand) {
							return;
						}
						this.showReferenceConversationDialog = true;
						const element = document.getElementById('openReferenceConversationButton') as HTMLButtonElement;
						element.click();
						const uploadDataSectionName = `Brand Share of Voice_${category.type}_${category.brandName}`;
						let posts = [];
						const manualScreenshot = await this.fetchManualScreenshot(
							`${this.campaign.campaignId}_${uploadDataSectionName}`
						);
						if (manualScreenshot.length) {
							posts = manualScreenshot.map(obj => ({...obj, isManuallyUploaded: true}));
						}
						referenceConversation = await this.fetchReferenceConversation(category.brandName, type);
						if (referenceConversation?.length) {
							posts = [...posts, ...referenceConversation];
						}
						if (this.isFromBrand) {
							const customReferenceData = _.get(
								this.campaignReportS3Data,
								`referenceConversation.brandShareOfVoice.${category.type}.${category.brandName}`
							);
							if (customReferenceData) {
								posts = posts
									.filter(post => customReferenceData[post.id] && customReferenceData[post.id].visibleToBrand)
									.sort((postA, postB) => postA - postB);
							}
						} else {
							this.addOrderAndVisiblityOnSOVConversations(posts, category.type, category.brandName);
						}

						this.referenceConversationData = {
							conversationList: posts,
							brandName: category.brandName,
							section: 'Brand Share of Voice',
							stage: category.type,
							isBrandLoggedIn: this.isFromBrand,
							percentage: category.percentage,
							uploadDataSectionName,
							visibleToBrand: visibleToBrand
						};
					}
					break;
				case 'sentiment':
					{
						let posts = [];
						let visibleToBrand = false;
						if (category.type === 'beforeSOV') {
							visibleToBrand =
								this.campaignReportS3Data.brandSentiment.content.referenceConversations.beforeSentimentMap[
									category.category.name
								];
						} else if (category.type === 'duringSOV') {
							visibleToBrand =
								this.campaignReportS3Data.brandSentiment.content.referenceConversations.duringSentimentMap[
									category.category.name
								];
						}
						if (category.type === 'afterSOV') {
							visibleToBrand =
								this.campaignReportS3Data.brandSentiment.content.referenceConversations.afterSentimentMap[
									category.category.name
								];
						}
						if (this.isFromBrand && !visibleToBrand) {
							return;
						}
						this.showReferenceConversationDialog = true;
						const element = document.getElementById('openReferenceConversationButton') as HTMLButtonElement;
						element.click();
						const uploadDataSectionName = `Brand Sentiment_${category.type}_${category.category.name}`;
						const manualScreenshot = await this.fetchManualScreenshot(
							`${this.campaign.campaignId}_${uploadDataSectionName}`
						);
						if (manualScreenshot.length) {
							posts = manualScreenshot.map(obj => ({...obj, isManuallyUploaded: true}));
						}
						referenceConversation = await this.fetchReferenceConversation(category.category.name, type);
						if (referenceConversation.length) {
							posts = [...posts, ...referenceConversation];
						}
						if (this.isFromBrand) {
							const customReferenceData = _.get(
								this.campaignReportS3Data,
								`referenceConversation.brandSentiments.${type}.${category.category.name}`
							);
							if (customReferenceData) {
								posts = posts
									.filter(post => customReferenceData[post.id] && customReferenceData[post.id].visibleToBrand)
									.sort((postA, postB) => postA - postB);
							}
						} else {
							this.addOrderAndVisiblityOnSentimentsConversations(posts, category.category.name, type);
						}

						this.referenceConversationData = {
							conversationList: posts,
							brandName: category.category.name,
							section: 'Brand Sentiment',
							stage: category.category.type,
							isBrandLoggedIn: this.isFromBrand,
							percentage: category.percentage,
							uploadDataSectionName,
							visibleToBrand
						};
					}
					break;
				case 'insights':
					{
						let posts = [];
						let visibleToBrand = false;
						if (category.type === 'intent') {
							const bucketFound = this.campaignReportS3Data.engagementInsight.content.intent.find(
								bucket => bucket.name === category.category.name
							);
							visibleToBrand = bucketFound?.showReferenceConversation;
						} else if (category.type === 'benefits') {
							const bucketFound = this.campaignReportS3Data.engagementInsight.content.benefits.find(
								bucket => bucket.name === category.category.name
							);
							visibleToBrand = bucketFound?.showReferenceConversation;
						} else if (category.type === 'emotions') {
							const bucketFound = this.campaignReportS3Data.engagementInsight.content.emotions.find(
								bucket => bucket.name === category.category.name
							);
							visibleToBrand = bucketFound?.showReferenceConversation;
						}

						if (this.isFromBrand && !visibleToBrand) {
							return;
						}
						this.showReferenceConversationDialog = true;
						const element = document.getElementById('openReferenceConversationButton') as HTMLButtonElement;
						element.click();

						const uploadDataSectionName = `Engagement Insights_${category.type}_${category.category.name}`;
						const manualScreenshot = await this.fetchManualScreenshot(
							`${this.campaign.campaignId}_${uploadDataSectionName}`
						);
						if (manualScreenshot.length) {
							posts = manualScreenshot.map(obj => ({...obj, isManuallyUploaded: true}));
						}
						referenceConversation = await this.fetchReferenceConversation(category.category.name, type);
						if (referenceConversation.length) {
							posts = [...posts, ...referenceConversation];
						}
						if (this.isFromBrand) {
							const customReferenceData = _.get(
								this.campaignReportS3Data,
								`referenceConversation.brandInsights.${category.type}.${category.category.name}`
							);
							if (customReferenceData) {
								posts = posts
									.filter(post => customReferenceData[post.id] && customReferenceData[post.id].visibleToBrand)
									.sort((postA, postB) => postA - postB);
							}
						} else {
							this.addOrderAndVisiblityOnInsightsConversations(posts, category.type, category.category.name);
						}

						referenceConversation = await this.fetchReferenceConversation(category.category.name, type, category.type);
						this.referenceConversationData = {
							conversationList: posts,
							brandName: category.category.name,
							section: 'Engagement Insights',
							stage: category.type,
							isBrandLoggedIn: this.isFromBrand,
							percentage: category.percentage,
							uploadDataSectionName,
							visibleToBrand
						};
					}
					break;
			}
			this.changeDetector.detectChanges();
		} catch (error) {
			this.loggerService.error(error, `Failed to get reference conversation for ${category.type} `);
		}
	}

	resetModalData() {
		this.referenceConversationData = null;
	}

	onUpdatingBrandObjective(newObjective: string, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}
		if (_.isEqual(this.campaignReportS3Data?.brandObjective, newObjective)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.brandObjective = newObjective;
		if (updateToDatabase) {
			if (_.isEqual(this.campaign.brandObjective, newObjective)) {
				return;
			}

			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingPhaseIdeaDetails(event: IUpdatedPhaseIdeaValues, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}
		if (_.isEqual(this.campaignReportS3Data?.phaseIdeaDetails, event)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (!event?.visibleToBrand) {
			this.templateForm.get('templateSelected').setValue(TemplateType.Custom);
			this.templateTypeSelected = TemplateType.Custom;
		}

		if (
			_.isEqual(this.campaignReportS3Data.phaseIdeaDetails?.content, event.content) &&
			_.isEqual(this.campaignReportS3Data.phaseIdeaDetails?.supportingText, event.supportingText)
		) {
			this.campaignReportS3Data.phaseIdeaDetails = event;
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.phaseIdeaDetails = event;
		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingKeyFindingsDetails(event: IUpdatedPhaseIdeaValues, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}
		if (_.isEqual(this.campaignReportS3Data?.keyFindings, event)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}
		if (!event?.visibleToBrand) {
			this.templateForm.get('templateSelected').setValue(TemplateType.Custom);
			this.templateTypeSelected = TemplateType.Custom;
		}

		if (
			_.isEqual(this.campaignReportS3Data.keyFindings?.content, event.content) &&
			_.isEqual(this.campaignReportS3Data.keyFindings?.supportingText, event.supportingText)
		) {
			this.campaignReportS3Data.keyFindings = event;
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.keyFindings = event;
		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	doesResultHasHiddenSubSection(data: IUpdatedResultSection) {
		if (!data.hasOwnProperty('visibleToBrand') || !data.hasOwnProperty('content')) {
			return false;
		}

		return !data.visibleToBrand || data.content
			? !data.content.brandMentionsVisibleToBrand ||
					!data.content.brandMentionsVisibleToBrand ||
					!data.content.brandShareofVoiceVisibleToBrand ||
					!data.content.categoryConversationVisibleToBrand ||
					!data.content.totalReactionAndCommentsVisibleToBrand ||
					!data.content.ugcVisibleToBrand
			: false;
	}

	onUpdatingResultsDetails(event: IUpdatedResultSection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}
		if (_.isEqual(this.campaignReportS3Data?.results, event)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (this.doesResultHasHiddenSubSection(event)) {
			this.templateForm.get('templateSelected').setValue(TemplateType.Custom);
			this.templateTypeSelected = TemplateType.Custom;
		}
		if (_.isEqual(this.campaignReportS3Data.results?.supportingText, event.supportingText)) {
			this.campaignReportS3Data.results = {...this.campaignReportS3Data.results, ...event};
			this.userHasUpdatedData = true;
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.results = event;
		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingKPIDetails(data: IUpdatedKPISection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}
		if (_.isEqual(this.campaignReportS3Data?.kpiDetails, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}
		if (_.isEqual(this.campaignReportS3Data.kpiDetails?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.kpiDetails = data;
			this.userHasUpdatedData = true;
			if (updateToDatabase) {
				this.checkForTemplateUpdate(this.campaignReportS3Data);
			}
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.kpiDetails = data;
		if (updateToDatabase) {
			this.checkForTemplateUpdate(this.campaignReportS3Data);
		}

		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingBrandShareOfVoiceDetails(data: BrandShareofVoiceDetails, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}

		if (_.isEqual(this.campaignReportS3Data?.brandShareOfVoice, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (_.isEqual(this.campaignReportS3Data.brandShareOfVoice?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.brandShareOfVoice = data;
			this.userHasUpdatedData = true;
			if (updateToDatabase) {
				this.checkForTemplateUpdate(this.campaignReportS3Data);
			}
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.brandShareOfVoice = data;
		if (updateToDatabase) {
			this.checkForTemplateUpdate(this.campaignReportS3Data);
		}

		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingBrandSentiment(data: BrandSentitmentSection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}
		if (_.isEqual(this.campaignReportS3Data?.brandShareOfVoice, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (_.isEqual(this.campaignReportS3Data.brandSentiment?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.brandSentiment = data;
			this.userHasUpdatedData = true;
			if (updateToDatabase) {
				this.checkForTemplateUpdate(this.campaignReportS3Data);
			}

			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.brandSentiment = data;
		if (updateToDatabase) {
			this.checkForTemplateUpdate(this.campaignReportS3Data);
		}

		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingWordCloud(data: IWordCloudSection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}

		if (_.isEqual(this.campaignReportS3Data?.wordCloud, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (_.isEqual(this.campaignReportS3Data.wordCloud?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.wordCloud = data;
			this.userHasUpdatedData = true;

			if (updateToDatabase) {
				this.checkForTemplateUpdate(this.campaignReportS3Data);
			}
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.wordCloud = data;
		if (updateToDatabase) {
			this.checkForTemplateUpdate(this.campaignReportS3Data);
		}

		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingEngagementInsight(data: IEngagementInsightSection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}

		if (_.isEqual(this.campaignReportS3Data?.engagementInsight, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (_.isEqual(this.campaignReportS3Data.engagementInsight?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.engagementInsight = data;
			this.userHasUpdatedData = true;

			if (updateToDatabase) {
				this.checkForTemplateUpdate(this.campaignReportS3Data);
			}

			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.engagementInsight = data;
		if (updateToDatabase) {
			this.checkForTemplateUpdate(this.campaignReportS3Data);
		}

		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingTopPerformingPost(data: TopPerformingPostSection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}

		if (_.isEqual(this.campaignReportS3Data?.topPerformingPosts, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (_.isEqual(this.campaignReportS3Data.topPerformingPosts?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.topPerformingPosts = data;
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.topPerformingPosts = data;
		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	onUpdatingAllPosts(data: TopPerformingPostSection, updateToDatabase = false) {
		if (this.isFromBrand) {
			return;
		}

		if (_.isEqual(this.campaignReportS3Data?.allPosts, data)) {
			return;
		}
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (_.isEqual(this.campaignReportS3Data.allPosts?.supportingText, data.supportingText)) {
			this.campaignReportS3Data.allPosts = data;
			return;
		}
		this.userHasUpdatedData = updateToDatabase;

		this.campaignReportS3Data.allPosts = data;
		if (updateToDatabase) {
			this.updateCampaign(this.campaign.s3ReportUrl);
		}
	}

	setResultDetailsOnS3Data(reportMetrics?: CMCReportMetricsV2, s3ReportData?: CMCReportv3S3Data) {
		if (!this.campaignReportS3Data) {
			this.campaignReportS3Data = {} as CMCReportv3S3Data;
		}

		if (s3ReportData) {
			this.campaignReportS3Data.results = this.campaignReportS3Data.results
				? {...this.campaignReportS3Data.results, ...s3ReportData.results}
				: s3ReportData.results;
		}
		if (reportMetrics) {
			this.campaignReportS3Data.results = this.campaignReportS3Data.results
				? {
						...this.campaignReportS3Data.results,
						content: {
							...this.campaignReportS3Data.results.content,
							...this.extractResultsSectionFromReport(reportMetrics)
						}
				  }
				: {content: this.extractResultsSectionFromReport(reportMetrics)};
		}
	}

	calculateShareofVoice(resultMetrics: CMCReportMetricsV2) {
		const beforeSov: Object = JSON.parse(resultMetrics.beforeSOV);
		let totalBeforeSOV = 0;
		Object.keys(beforeSov).forEach(brandName => {
			totalBeforeSOV += +beforeSov[brandName];
		});

		const duringSov: Object = JSON.parse(resultMetrics.duringSOV);
		let totalDuringSOV = 0;
		Object.keys(duringSov).forEach(brandName => {
			totalDuringSOV += +duringSov[brandName];
		});

		const brandPercentageBeforeSov =
			Math.round(((beforeSov[this.campaign.keywordBrand] || 0) / totalBeforeSOV) * 10000) / 100;

		const brandPercentageDuringSov =
			Math.round(((duringSov[this.campaign.keywordBrand] || 0) / totalDuringSOV) * 10000) / 100;

		return {brandPercentageBeforeSov, brandPercentageDuringSov};
	}

	extractResultsSectionFromReport(reportMetrics: CMCReportMetricsV2): IUpdatedResultSection['content'] {
		const sovData = this.calculateShareofVoice(reportMetrics);
		return {
			numDuringCatConversations: reportMetrics.numDuringCatConversations,
			numDuringBrandMentions: reportMetrics.numDuringBrandMentions,
			numBeforeBrandMentions: reportMetrics.numBeforeBrandMentions,
			numBeforeCatConversations: reportMetrics.numBeforeCatConversations,
			numCommentAdminPost: reportMetrics.numCommentAdminPost,
			numCommentUGCPost: reportMetrics.numCommentUGCPost,
			numReactionAdminPost: reportMetrics.numReactionAdminPost,
			numReactionUGCPost: reportMetrics.numReactionUGCPost,
			numUGCComments: reportMetrics?.numCommentUGCPost,
			numUGCPosts: reportMetrics.numUGCPosts,
			...sovData
		};
	}

	scrollTo(
		scrollElem: HTMLElement,
		event: Event & {target: HTMLInputElement},
		verticalPosition?: ScrollIntoViewOptions['block']
	) {
		Array.prototype?.slice.call(document.querySelectorAll('.left-sidebar li')).map(elem => {
			elem.classList.remove('active');
		});
		event.target.classList.add('active');
		scrollElem.scrollIntoView({behavior: 'smooth', block: verticalPosition || 'center', inline: 'nearest'});
	}

	subscribeToScrollEventChanges() {
		const debouncedCampaignSections = this.updatedScrollEvent.pipe(debounceTime(1000));
		this.subscriptionsToDestroy.push(debouncedCampaignSections.subscribe(onEventChange => {}));
	}

	scrollCampaignSections() {
		if (this.timer !== null) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(() => {
			let mainNavLinks = document.querySelectorAll('#leftNav li');
			mainNavLinks.forEach(link => {
				link.classList.remove('active');
			});
			let selectedRowId = 0;
			for (let i = 1; i <= 11; i++) {
				const selectedRow = document.getElementById(`row${i}`)?.getBoundingClientRect();
				if (selectedRow?.top + selectedRow?.height - 200 > 0) {
					selectedRowId = i;
					document.querySelectorAll('#leftNav li')[i - 1].className = 'active';
					return;
				}
			}
		}, 500);
	}

	async getReportMetrics() {
		try {
			const reportMetrics = await this.createCampaignService.getCMCReportMetricsV2(this.campaign.campaignId);

			this.totalAudience = reportMetrics?.numAudience || 0;
			this.totalCommunities = reportMetrics?.numGroups || 0;
			if (!this.campaignReportS3Data) {
				this.campaignReportS3Data = {} as CMCReportv3S3Data;
			}
			this.campaignReportS3Data.totalAudience = this.totalAudience;
			this.campaignReportS3Data.totalCommunities = this.totalCommunities;
			this.reportMetrics = reportMetrics;
			this.setResultDetailsOnS3Data(reportMetrics, this.campaignReportS3Data);
			this.setShareOfVoice(reportMetrics);
			this.setBrandSentimentMaps(reportMetrics);
			this.setTopPerformingPost();

			if (reportMetrics) {
				this.setSectionDetails(this.campaign, reportMetrics);

				this.setEngagementInsights(reportMetrics);
				this.setAllPost();
			}
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while retrieving Cmc report metrics',
				{},
				'CommunityMarketingCampaignReportComponent',
				'getReportMetrics',
				LoggerCategory.AppLogs
			);
		}
		if (!this.campaignReportS3Data?.engagementInsight.content) {
			const tempData = {
				intent: {},
				emotions: {},
				benefits: {}
			};
			this.setEngagementInsights(
				this.reportMetrics || ({engagementInsights: JSON.stringify(tempData)} as CMCReportMetricsV2)
			);
		}

		this.applyTemplate(TemplateType.Advanced);
		this.changeDetector.detectChanges();
	}

	async fetchTopPerformingPostManualScreenshot() {
		try {
			const response = await this.createCampaignService.getManualUploadedScreenshot(
				`${this.campaign.campaignId}_topPerformingPost`,
				20,
				''
			);
			return response.items;
		} catch (error) {
			this.logger.error(error, 'Error during fetching top performingpost manual screenshot');
			return [];
		}
	}

	resetPagination() {
		this.from = 0;
		this.end = this.limit;
	}

	setShareOfVoice(reportMetrics: CMCReportMetricsV2) {
		try {
			const afterSovReport = JSON.parse(reportMetrics?.afterSOV || '{}');
			const beforeSovReport = JSON.parse(reportMetrics?.beforeSOV || '{}');
			const duringSovReport = JSON.parse(reportMetrics?.duringSOV || '{}');
			const nonHashTagReport = JSON.parse(reportMetrics?.duringSOVNonHashTag || '{}');

			const combined = {...afterSovReport, ...beforeSovReport, ...duringSovReport, ...nonHashTagReport};
			this.brandListForShareOfVoice = Object.keys(combined);

			//Calucate percentage for each section
			const afterSOVPercentage = convertAbsoluteToPercentage({
				...afterSovReport,
				[this.campaign.keywordBrand]: afterSovReport[this.campaign.keywordBrand] || 0
			});
			const beforeSOVPercentage = convertAbsoluteToPercentage({
				...beforeSovReport,
				[this.campaign.keywordBrand]: beforeSovReport[this.campaign.keywordBrand] || 0
			});
			const duringSOVPercentage = convertAbsoluteToPercentage({
				...duringSovReport,
				[this.campaign.keywordBrand]: duringSovReport[this.campaign.keywordBrand] || 0
			});
			const nonHashTagPercentage = Object.keys(nonHashTagReport)?.length
				? convertAbsoluteToPercentage({
						...nonHashTagReport,
						[this.campaign.keywordBrand]: nonHashTagReport[this.campaign.keywordBrand] || 0
				  })
				: {};

			// Get top 15 and sorted with additional fields: `Others`
			const duringList = this.getNewBrandAsSortedList(duringSOVPercentage);
			const beforeList = this.sortDataAsPerDuringSOV(beforeSOVPercentage, duringList);
			const afterList = this.sortDataAsPerDuringSOV(afterSOVPercentage, duringList);
			const nonHashTagList = this.sortDataAsPerDuringSOV(nonHashTagPercentage, duringList);

			// Convert data back to json
			const beforeSOV = this.convertToKeyValuePair(beforeList);
			const duringSOV = this.convertToKeyValuePair(duringList);
			const afterSOV = this.convertToKeyValuePair(afterList);
			const nonHashTag = this.convertToKeyValuePair(nonHashTagList);

			const referenceConvData = {
				beforeSOV: {},
				duringSOV: {},
				afterSOV: {},
				nonHashTag: {}
			};
			this.brandListForShareOfVoice.forEach(brandName => {
				referenceConvData.beforeSOV[brandName] = false;
				referenceConvData.duringSOV[brandName] = true;
				referenceConvData.afterSOV[brandName] = false;
				referenceConvData.nonHashTag[brandName] = false;
			});

			const testing = {
				content: reportMetrics
					? {
							afterSOV,
							duringSOV,
							beforeSOV,
							nonHashTag
					  }
					: null,
				visibleToBrand: true,
				supportingText: this.campaign?.brandShareOfVoiceSupportingText || '',
				beforeSOV: true,
				duringSOV: true,
				afterSOV: true,
				nonHashTag: true,
				referenceConversation: referenceConvData
			};
			this.onUpdatingBrandShareOfVoiceDetails(testing);
		} catch (error) {
			this.loggerService.error(error, 'Error during setting brand sov details');
		}
	}

	convertToKeyValuePair(data: {key: string; value: number}[]): {[key: string]: number} {
		const newJSON = {};
		data.forEach(obj => (newJSON[obj.key] = obj.value));
		return newJSON;
	}

	getNewBrandAsSortedList(data: {}): {key: string; value: number}[] {
		let list = [];
		for (const [key, value] of Object.entries(data)) {
			list.push({key, value: value as number});
		}
		list = list.sort((catA, catB) => {
			if (catA.key === this.campaign.keywordBrand) {
				return 1;
			}
			if (catB.key === this.campaign.keywordBrand) {
				return -1;
			}
			if (catA.value !== catB.value) {
				return catA.value - catB.value;
			}
			return catA.key.localeCompare(catB.key);
		});
		if (list.length > 16) {
			const sliced = list.slice(list.length - 15);
			let sumedValue = sliced.map(obj => obj.value).reduce((A, B) => A + B);
			sumedValue = Math.round(sumedValue * 100) / 100;
			const remaining = Math.round((100 - sumedValue) * 100) / 100;
			return [{key: 'Others', value: remaining}, ...sliced];
		} else {
			list = [{key: 'Others', value: 0}, ...list];
		}
		return list;
	}

	sortDataAsPerDuringSOV(data: any, during: {key: string; value: number}[]) {
		const list = during.map(obj => ({key: obj.key, value: data[obj.key] || 0}));
		const total = list.map(obj => obj.value).reduce((a, b) => a + b);
		if (total === 100) {
			return list;
		}
		list[0].value = Math.round((100 - total) * 100) / 100;
		return list;
	}

	setEmptyStatesOfSov() {
		this.beforeSOV.isEmpty =
			this.beforeSOV?.series?.graphSeries?.reduce((sum, key) => sum + (key.data ? +key.data[0] : 0), 0) === 0;
		this.afterSOV.isEmpty =
			this.afterSOV?.series?.graphSeries?.reduce((sum, key) => sum + (key.data ? +key.data[0] : 0), 0) === 0;
		this.duringSOV.isEmpty =
			this.duringSOV?.series?.graphSeries?.reduce((sum, key) => sum + (key.data ? +key.data[0] : 0), 0) === 0;
	}

	setSovSeries(sov) {
		let series = [];
		let total = 0;
		Object.keys(sov).forEach(key => {
			total += +sov[key];
		});
		Object.keys(sov).forEach(key => {
			series.push({
				name: key,
				value: sov[key],
				percentage: this.getRoundedValue(sov[key], total)
			});
		});
		series = _.orderBy(series, ['value'], ['desc']);
		const sovGraphMetrics = this.setSovGraphMetrics(series, total);
		return sovGraphMetrics;
	}

	setSovGraphMetrics(series, total) {
		let selectedSeries = [];
		const selectedValue = series.find(key => key.name === this.campaign.keywordBrand);
		if (!selectedValue) {
			selectedSeries.push({name: this.campaign.keywordBrand, value: 0});
		} else {
			selectedSeries.push(selectedValue);
			series = series.filter(key => key.name !== this.campaign.keywordBrand);
		}

		selectedSeries = selectedSeries.concat(series.filter((key, index) => index < 3));
		const others = series.filter((key, index) => index >= 3).reduce((sum, key) => sum + key.value, 0);

		selectedSeries.push({name: 'Others', value: others});
		const graphSeries = [];

		selectedSeries.forEach(key => {
			graphSeries.push({
				name: key.name,
				data: [this.getRoundedValue(key.value, total)]
			});
		});

		const selectedKeys = {};
		series.forEach(key => {
			selectedKeys[key.name] = key.value;
		});

		return {graphSeries: graphSeries, series: series, selectedKeys: selectedKeys};
	}

	setBrandSentimentMaps(reportMetrics: CMCReportMetricsV2) {
		let beforeSentimentMap = reportMetrics?.beforeSentimentMap ? JSON.parse(reportMetrics?.beforeSentimentMap) : null;
		beforeSentimentMap = beforeSentimentMap ? convertAbsoluteToPercentage(beforeSentimentMap) : {};
		const beforeSentimentMaps = {
			likePercentage: beforeSentimentMap?.like || 0,
			neutralPercentage: beforeSentimentMap?.neutral || 0,
			dislikePercentage: beforeSentimentMap?.dislike || 0
		};

		let duringSentimentMap = reportMetrics?.duringSentimentMap ? JSON.parse(reportMetrics?.duringSentimentMap) : null;
		duringSentimentMap = duringSentimentMap ? convertAbsoluteToPercentage(duringSentimentMap) : {};
		const duringSentimentMaps = {
			likePercentage: duringSentimentMap?.like || 0,
			neutralPercentage: duringSentimentMap?.neutral || 0,
			dislikePercentage: duringSentimentMap?.dislike || 0
		};

		let afterSentimentMap = reportMetrics?.afterSentimentMap ? JSON.parse(reportMetrics?.afterSentimentMap) : null;
		afterSentimentMap = afterSentimentMap ? convertAbsoluteToPercentage(afterSentimentMap) : {};
		const afterSentimentMaps = {
			likePercentage: afterSentimentMap?.like || 0,
			neutralPercentage: afterSentimentMap?.neutral || 0,
			dislikePercentage: afterSentimentMap?.dislike || 0
		};

		const data: BrandSentitmentSection = {
			visibleToBrand: true,
			supportingText: this.campaign.brandSentimentSupportingText || '',
			content: {
				afterSentimentMapVisibleToBrand: true,
				beforeSentimentMapVisibleToBrand: true,
				duringSentimentMapVisibleToBrand: true,
				beforeSentimentMap: beforeSentimentMaps,
				duringSentimentMap: duringSentimentMaps,
				afterSentimentMap: afterSentimentMaps,
				referenceConversations: {
					beforeSentimentMap: {
						Positive: false,
						Negative: false,
						Neutral: false
					},
					duringSentimentMap: {
						Positive: true,
						Negative: true,
						Neutral: true
					},
					afterSentimentMap: {
						Positive: false,
						Negative: false,
						Neutral: false
					}
				}
			}
		};
		this.onUpdatingBrandSentiment(data);
	}

	setEngagementInsights(reportMetrics: CMCReportMetricsV2) {
		try {
			const insights = JSON.parse(
				reportMetrics?.engagementInsights ||
					'{"Benefits":{"Natural ingredient":0},"emotions":{"Like":0},"intent":{"Recommendations":0}}'
			) as IEngagementInshightLevel1;
			const intent =
				insights?.intent && Object.keys(insights?.intent)?.length
					? convertAbsoluteToPercentage(insights.intent)
					: insights.intent;
			const emotions =
				insights?.emotions && Object.keys(insights?.emotions)?.length
					? convertAbsoluteToPercentage(insights.emotions)
					: insights.emotions;
			const benefits =
				insights?.Benefits && Object.keys(insights?.Benefits)?.length
					? convertAbsoluteToPercentage(insights.Benefits)
					: {};

			const intentSection = this.getIntentList(intent, this.campaign);

			const emotionSection = this.getEmotionsList(emotions, this.campaign);

			const benefitsSection = benefits ? this.getBenefitsList(benefits, this.campaign) : [];

			const referenceConversations = {
				intent: {},
				emotions: {},
				benefits: {}
			};
			intentSection?.forEach(data => {
				referenceConversations.intent[data.name] = true;
			});
			emotionSection?.forEach(data => {
				referenceConversations.intent[data.name] = true;
			});
			benefitsSection?.forEach(data => {
				referenceConversations.intent[data.name] = true;
			});
			const obj: IEngagementInsightSection = {
				supportingText: this.campaign?.engagementInsightSupportingText || '',
				benefitsVisibleToBrand: true,
				emotionsVisibleToBrand: true,
				intentVisibleToBrand: true,
				content: {
					intent: intentSection,
					emotions: emotionSection,
					benefits: benefitsSection
				},
				referenceConversations
			};
			this.onUpdatingEngagementInsight(obj);
		} catch (error) {
			this.loggerService.error(error, 'Error during setting engagement insight');
		}
	}

	private getIntentList(data: IEngagementInshightLevel2, campaign: CampaignModelv3) {
		let tempList = campaign.engagementInsights || [
			'intent|Purchase Intent:_get_,_Buy_,Bought,Price,Cost,_pp_,discount,sale,amazon,_shop_,purchase,khareed,kharid,will%try,want%try,will%use,want%use',
			'intent|Recommendations:_try_,Reco,Recco,suggest,go for it,must%buy,should%buy',
			'intent|Usage:using,used,tried,_got_,apply,applied,istemal,_laga_,_lagaa_',
			'emotions|Positive Emotion:_Great_,awesome,love,fantastic,excellent,excelent,good,_gud_,_super_,superb,accha,amazing,badhiya,badiya,favorite,favourite,favorit,favourit,favrit,_best_'
		];
		return Object.keys(data).map(key => {
			const keywordFound = tempList.find(string => string.includes(`intent|${key}`));
			const newObj = {
				name: key,
				y: data[key],
				color: this.getRandomRgb(),
				visibleToBrand: true,
				keywords: keywordFound ? keywordFound.split(`intent|${key}:`)[1] : '',
				showReferenceConversation: true
			};

			return newObj;
		});
	}

	private getEmotionsList(data: IEngagementInshightLevel2, campaign: CampaignModelv3) {
		let tempList = campaign.engagementInsights || [
			'intent|Purchase Intent:_get_,_Buy_,Bought,Price,Cost,_pp_,discount,sale,amazon,_shop_,purchase,khareed,kharid,will%try,want%try,will%use,want%use',
			'intent|Recommendations:_try_,Reco,Recco,suggest,go for it,must%buy,should%buy',
			'intent|Usage:using,used,tried,_got_,apply,applied,istemal,_laga_,_lagaa_',
			'emotions|Positive Emotion:_Great_,awesome,love,fantastic,excellent,excelent,good,_gud_,_super_,superb,accha,amazing,badhiya,badiya,favorite,favourite,favorit,favourit,favrit,_best_'
		];

		return Object.keys(data).map(key => {
			const keywordFound = tempList.find(string => string.includes(`emotions|${key}`));
			const newObj = {
				name: key,
				y: data[key],
				color: this.getRandomRgb(),
				visibleToBrand: true,
				keywords: keywordFound ? keywordFound.split(`emotions|${key}:`)[1] : '',
				showReferenceConversation: true
			};

			return newObj;
		});
	}

	private getBenefitsList(data: IEngagementInshightLevel2, campaign: CampaignModelv3) {
		let tempList = campaign.engagementInsights || [
			'intent|Purchase Intent:_get_,_Buy_,Bought,Price,Cost,_pp_,discount,sale,amazon,_shop_,purchase,khareed,kharid,will%try,want%try,will%use,want%use',
			'intent|Recommendations:_try_,Reco,Recco,suggest,go for it,must%buy,should%buy',
			'intent|Usage:using,used,tried,_got_,apply,applied,istemal,_laga_,_lagaa_',
			'emotions|Positive Emotion:_Great_,awesome,love,fantastic,excellent,excelent,good,_gud_,_super_,superb,accha,amazing,badhiya,badiya,favorite,favourite,favorit,favourit,favrit,_best_'
		];

		return Object.keys(data).map(key => {
			const keywordFound = tempList.find(string => string.includes(`benefits|${key}`));

			const newObj = {
				name: key,
				y: data[key],
				color: this.getRandomRgb(),
				visibleToBrand: true,
				keywords: keywordFound ? keywordFound.split(`benefits|${key}:`)[1] : '',
				showReferenceConversation: true
			};

			return newObj;
		});
	}

	getRandomRgb() {
		var num = Math.round(0xffffff * Math.random());
		var r = num >> 16;
		var g = (num >> 8) & 255;
		var b = num & 255;
		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	}

	async setWordCloud(campaignId: string) {
		try {
			let reportWc = await this.createCampaignService.getCmcReportWc(campaignId);
			if (!reportWc) {
				reportWc = {beforeWC: '{}', duringWC: '{}', campaignId, createdAtUTC: null, updatedAtUTC: null} as CmcReportWc;
			}
			const {duringCampaign, preCampaign} = this.createWordCloudDataModel(reportWc);
			const obj: IWordCloudSection = {
				supportingText: this.campaign.wordCloudSupportingText,
				visibleToBrand: true,
				content: {preCampaign: preCampaign, duringCampaign: duringCampaign},
				preCamapingVisibleToBrand: true,
				duringCamapingVisibleToBrand: true
			};
			this.onUpdatingWordCloud(obj);
		} catch (error) {
			console.error('getCmcReportWc Error ', error);
		}
	}

	createWordCloudDataModel(reportWc: CmcReportWc) {
		let preCampaign = {};
		let duringCampaign = {};
		if (reportWc.beforeWC) {
			preCampaign = JSON.parse(reportWc.beforeWC);
			preCampaign = this.sortJSONKeysByValue(preCampaign);
		}
		if (reportWc.duringWC) {
			duringCampaign = JSON.parse(reportWc.duringWC);
			duringCampaign = this.sortJSONKeysByValue(duringCampaign);
		}
		return {duringCampaign, preCampaign};
	}

	async setTopPerformingPost() {
		let posts: any[] = [];
		const manualUpload = await this.fetchTopPerformingPostManualScreenshot();
		if (manualUpload?.length) {
			posts = posts.concat(manualUpload.map(obj => ({...obj, visibleToBrand: true})));
		}
		const campaignPosts = await this.createCampaignService.getCampaignPosts(
			this.campaign.campaignId,
			50,
			this.nextToken
		);
		(campaignPosts?.items).forEach((post, i) => {
			posts.push({...post, visibleToBrand: true, order: i + 1} as TopPerformingPost);
		});

		const obj: TopPerformingPostSection = {
			supportingText: this.campaign?.topPerformingPostSupportingText || '',
			visibleToBrand: true,
			posts
		};

		this.onUpdatingTopPerformingPost(obj);
	}

	async fetchAllPostManualScreenshot() {
		try {
			const response = await this.createCampaignService.getManualUploadedScreenshot(
				`${this.campaign.campaignId}_allPosts`,
				20,
				''
			);
			return response.items;
		} catch (error) {
			this.logger.error(error, 'Error during fetching all post manual screenshot');
			return [];
		}
	}

	async setAllPost() {
		let posts: any[] = [];
		const manualUpload = await this.fetchAllPostManualScreenshot();
		if (manualUpload?.length) {
			posts = posts.concat(manualUpload.map(obj => ({...obj, visibleToBrand: true})));
		}
		const campaignPosts = await this.createCampaignService.getCampaignPosts(
			this.campaign.campaignId,
			1000,
			this.nextToken
		);

		this.nextToken = campaignPosts?.nextToken || this.nextToken;
		if (campaignPosts?.items?.length) {
			posts = [...posts, ...campaignPosts.items];
		}

		let hasMorePosts = campaignPosts?.items?.length >= 1000 || false;
		let count = 1;
		while (hasMorePosts && count <= 5) {
			count++;
			const campaignPosts2 = await this.createCampaignService.getCampaignPosts(
				this.campaign.campaignId,
				1000,
				this.nextToken
			);

			this.nextToken = campaignPosts2?.nextToken;
			if (campaignPosts2?.items?.length) {
				posts = [...posts, ...campaignPosts.items];
			}

			hasMorePosts = campaignPosts2?.items?.length >= 1000 || false;
		}

		posts?.forEach((post, i) => {
			post.visibleToBrand = true;
			post.order = post.order || i + 1;
		});

		const obj: TopPerformingPostSection = {
			supportingText: this.campaign?.topPerformingPostSupportingText || '',
			visibleToBrand: true,
			posts
		};

		this.onUpdatingAllPosts(obj);
	}

	onLongPress(post, isTopPosts) {
		post['isSelected'] = true;
	}

	async fileUpload(event: Event) {
		this.logo = (<HTMLInputElement>event.target).files[0];
		const reader = new FileReader();
		reader.readAsDataURL(this.logo);
		reader.onload = _event => {
			this.previewImage = reader.result;
			this.isLogoRemoved = false;
		};
	}

	async setReportData(s3ReportUrl: string) {
		let campaignReportData = await this.fileService.getDataFromS3(s3ReportUrl);
		if (campaignReportData) {
			this.loggerService.debug(
				'Retrieved report data from s3 bucket',
				{campaignReportData: campaignReportData, key: s3ReportUrl},
				'CommunityMarketingCampaignReportComponent',
				'setReportData'
			);
			try {
				campaignReportData = new TextDecoder('utf-8').decode(campaignReportData);
				this.getCampaignReportDataOnLoad(campaignReportData, s3ReportUrl);
			} catch (e) {
				const reader = new FileReader();

				reader.addEventListener('loadend', e => {
					this.getCampaignReportDataOnLoad(reader.result, s3ReportUrl);
				});

				campaignReportData = reader.readAsText(campaignReportData);
			}
		}
	}

	getCampaignReportDataOnLoad(campaignReport, key) {
		let campaignReportData = {};

		try {
			campaignReportData = JSON.parse(decodeURIComponent(campaignReport));
		} catch (e) {
			try {
				campaignReportData = JSON.parse(decodeURIComponent(JSON.parse(campaignReport))) as CMCReportv3S3Data;
			} catch (error) {
				this.loggerService.debug(
					'Converting campaign report data to json',
					{campaignReportData: campaignReport, key: key},
					'CommunityMarketingCampaignReportComponent',
					'setReportData'
				);
			}
		}
		if (!_.isEmpty(campaignReportData)) {
			console.log('campaign report data', campaignReportData);
			this.campaignReportS3Data = _.cloneDeep(campaignReportData) as CMCReportv3S3Data;

			this.setResultDetailsOnS3Data(this.reportMetrics, this.campaignReportS3Data);
			this.afterSOV = campaignReportData['afterSOV'];
			this.beforeSOV = campaignReportData['beforeSOV'];
			this.duringSOV = campaignReportData['duringSOV'];
			this.campaignPosts = campaignReportData['campaignPosts'];
			this.participantGroupsDetails = campaignReportData['participantGroupsDetails'];
			this.visibleCampaignReport = campaignReportData['visibleCampaignReport'];
			this.participantGroupsDetails = this.participantGroupsDetails?.filter(group => group.groupName);
			this.participantGroupsDetails = this.participantGroupsDetails?.splice(0, 15);

			this.campaignPosts = this.campaignPosts.filter(post => !post.isHidden);

			this.end = this.campaignPosts.length > this.limit ? this.limit : this.campaignPosts.length;
			this.isConversationsLoaded = true;
		}
	}

	async uploadToS3() {
		this.isPublishing = true;
		this.isPublished = false;
		let campaignDetails = {...this.campaignReportS3Data};
		campaignDetails['beforeSOV'] = this.beforeSOV;

		campaignDetails['duringSOV'] = this.duringSOV;

		campaignDetails['campaignPosts'] = this.campaignPosts;
		campaignDetails['participantGroupsDetails'] = this.participantGroupsDetails;
		campaignDetails['visibleCampaignReport'] = this.visibleCampaignReport;
		campaignDetails['phaseIdeaDetails'] = this.campaignReportS3Data.phaseIdeaDetails;
		campaignDetails['brandObjective'] = this.campaignReportS3Data.brandObjective;
		campaignDetails['keyFindings'] = this.campaignReportS3Data.keyFindings;
		campaignDetails['results'] = this.campaignReportS3Data.results;
		campaignDetails['kpiDetails'] = this.campaignReportS3Data.kpiDetails;
		campaignDetails['brandShareOfVoice'] = this.campaignReportS3Data.brandShareOfVoice;
		campaignDetails['brandSentiment'] = this.campaignReportS3Data.brandSentiment;
		campaignDetails['wordCloud'] = this.campaignReportS3Data.wordCloud;
		campaignDetails['engagementInsight'] = this.campaignReportS3Data.engagementInsight;

		campaignDetails = encodeURIComponent(JSON.stringify(campaignDetails)) as any;
		let key;
		let success;
		if (this.campaign['s3ReportUrl']) {
			key = await this.fileService.uploadCampaignReportToS3(campaignDetails, 'campaign', this.randomUuid(), null);

			success = await this.updateCampaign(key);
			document.getElementById('published').click();
			this.isPublishing = false;
		} else {
			key = await this.fileService.uploadCampaignReportToS3(campaignDetails, 'campaign', this.randomUuid(), null);
			success = await this.updateCampaign(key);
			this.isPublishing = false;
		}
		if (success) {
			this.alert.success('Brand can now see the changes you have made', 'Report updated successfully', 5000, true);
			document.getElementById('published').click();
			this.isPublished = true;
			return;
		}
		return this.alert.error(
			'Campaign updation unsuccessful',
			'We are unable to create campaign at this moment. Please try again later.'
		);
	}

	async updateCampaign(s3ReportUrl: string) {
		if (this.isFromBrand || this.isFromBrand != false) {
			return;
		}
		let campaignUpdateInput = {} as UpdateCampaignInput;
		campaignUpdateInput['brandId'] = this.campaign['brandId'];
		campaignUpdateInput['brandName'] = this.campaign['brandName'];
		campaignUpdateInput['campaignId'] = this.campaign['campaignId'];
		campaignUpdateInput['campaignName'] = this.campaign['campaignName'];
		campaignUpdateInput['details'] = this.campaign['details'];
		campaignUpdateInput['startDateAtUTC'] = this.campaign['startDateAtUTC'];
		campaignUpdateInput['endDateAtUTC'] = this.campaign['endDateAtUTC'];
		campaignUpdateInput['objective'] = this.campaign['objective'];
		campaignUpdateInput['keywordCategory'] = this.campaign['keywordCategory'];
		campaignUpdateInput['keywordBrand'] = this.campaign['keywordBrand'];
		campaignUpdateInput['keywords'] = this.campaign['keywords'];
		campaignUpdateInput['campaignSummary'] = this.campaign['campaignSummary'];
		campaignUpdateInput['proposalEmails'] = this.campaign['proposalEmails'];
		campaignUpdateInput['cmcReportName'] = this.campaign['cmcReportName'];
		campaignUpdateInput['taskTitle'] = this.campaign['taskTitle'];
		campaignUpdateInput['campaignPeriod'] = this.campaign['campaignPeriod'];
		campaignUpdateInput['status'] = this.campaign.status;
		campaignUpdateInput['campaignBriefForCommunityAdmin'] = this.campaign.campaignBriefForCommunityAdmin;
		campaignUpdateInput['KPIs'] = this.campaign['KPIs'];
		campaignUpdateInput['cmcType'] = this.campaign['cmcType'];
		campaignUpdateInput['keywordSubCategories'] = this.campaign['keywordSubCategories'];
		campaignUpdateInput['primaryObjective'] = this.campaign['primaryObjective'];
		campaignUpdateInput['secondaryObjective'] = this.campaign['secondaryObjective'];
		campaignUpdateInput['defaultTaskDate'] = this.campaign['defaultTaskDate'];
		campaignUpdateInput['timezoneName'] = this.campaign['timezoneName'];
		campaignUpdateInput['s3ReportUrl'] = s3ReportUrl;
		campaignUpdateInput.phaseIdea = this.campaignReportS3Data.phaseIdeaDetails.content;
		campaignUpdateInput.totalPhase = this.campaign.totalPhase;
		campaignUpdateInput.currentPhase = this.campaign.currentPhase;
		campaignUpdateInput.currency = this.campaign.currency;
		campaignUpdateInput.communicationChannel = this.campaign.communicationChannel;
		campaignUpdateInput.phaseIdeaSupportingText = this.campaignReportS3Data.phaseIdeaDetails.supportingText;
		campaignUpdateInput.keyFindings = this.campaignReportS3Data.keyFindings.content;
		campaignUpdateInput.keyFindingsSupportingText = this.campaignReportS3Data.keyFindings.supportingText;
		campaignUpdateInput.brandObjective = this.campaignReportS3Data?.brandObjective;
		campaignUpdateInput.resultsSupportingText = this.campaignReportS3Data.results?.supportingText;
		campaignUpdateInput.kpiSupportingText = this.campaignReportS3Data.kpiDetails?.supportingText;
		campaignUpdateInput.brandShareOfVoiceSupportingText = this.campaignReportS3Data?.brandShareOfVoice?.supportingText;
		campaignUpdateInput.brandSentimentSupportingText = this.campaignReportS3Data?.brandSentiment?.supportingText;
		campaignUpdateInput.wordCloudSupportingText = this.campaignReportS3Data.wordCloud?.supportingText;
		campaignUpdateInput.engagementInsightSupportingText = this.campaignReportS3Data?.engagementInsight?.supportingText;
		campaignUpdateInput.topPerformingPostSupportingText = this.campaignReportS3Data?.topPerformingPosts?.supportingText;

		const processedFileURLs = this.logo ? await Promise.all([this.processFilesForUrls(this.logo)]) : null;
		if (this.isLogoRemoved) {
			campaignUpdateInput['s3CoverImageUrl'] = null;
		} else {
			campaignUpdateInput['s3CoverImageUrl'] = processedFileURLs
				? processedFileURLs[0][0] || ''
				: this.campaign.s3CoverImageUrl;
		}

		try {
			const response = await this.createCampaignService.updateCampaignDetails(
				campaignUpdateInput as UpdateCampaignInput
			);
			this.isPublishing = false;
			return true;
		} catch (e) {
			this.loggerService.error(
				e,
				'Failed to Update Campaign Details',
				campaignUpdateInput,
				'cmcreport-v3',
				'updateCampaign'
			);
			this.isPublishing = false;
			return false;
		}
	}

	private applyAdvancedTemplate() {
		this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand = true;
		this.campaignReportS3Data.keyFindings.visibleToBrand = true;
		_.set(this.campaignReportS3Data, 'results.brandMentionsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'results.visibleToBrand', true);
		_.set(this.campaignReportS3Data, 'results.content.brandMentionsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'results.content.brandShareofVoiceVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'results.content.categoryConversationVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'results.content.totalReactionAndCommentsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'results.content.ugcVisibleToBrand', true);

		_.set(this.campaignReportS3Data, 'kpiDetails.visibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.brandMentionsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.brandShareofVoiceVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.categoryConversationVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.estimateImpressionVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.numAdminPostsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.numReactionAndCommentAdminPostVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.numReactionAndCommentUGCPostVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.numUGCCommentsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.numUGCPostsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.totalEngagementVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.totalReactionAndCommentVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'kpiDetails.content.totalUGCVisibleToBrand', true);

		_.set(this.campaignReportS3Data, 'brandShareOfVoice.visibleToBrand', true);
		_.set(this.campaignReportS3Data, 'brandShareOfVoice.afterSOV', true);
		_.set(this.campaignReportS3Data, 'brandShareOfVoice.beforeSOV', true);
		_.set(this.campaignReportS3Data, 'brandShareOfVoice.duringSOV', true);
		_.set(this.campaignReportS3Data, 'brandShareOfVoice.nonHashTag', true);

		_.set(this.campaignReportS3Data, 'brandSentiment.visibleToBrand', true);
		_.set(this.campaignReportS3Data, 'brandSentiment.content.afterSentimentMapVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'brandSentiment.content.beforeSentimentMapVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'brandSentiment.content.duringSentimentMapVisibleToBrand', true);

		_.set(this.campaignReportS3Data, 'engagementInsight.benefitsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'engagementInsight.emotionsVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'engagementInsight.intentVisibleToBrand', true);

		_.set(this.campaignReportS3Data, 'wordCloud.visibleToBrand', true);
		_.set(this.campaignReportS3Data, 'wordCloud.duringCamapingVisibleToBrand', true);
		_.set(this.campaignReportS3Data, 'wordCloud.preCamapingVisibleToBrand', true);

		if (this.campaignReportS3Data.engagementInsight?.content?.benefits?.length) {
			this.campaignReportS3Data.engagementInsight.content.benefits =
				this.campaignReportS3Data.engagementInsight.content?.benefits?.map(obj => ({...obj, visibleToBrand: true}));
		}

		if (this.campaignReportS3Data.engagementInsight?.content?.emotions?.length) {
			this.campaignReportS3Data.engagementInsight.content.emotions =
				this.campaignReportS3Data.engagementInsight.content?.emotions?.map(obj => ({...obj, visibleToBrand: true}));
		}

		if (this.campaignReportS3Data.engagementInsight?.content?.intent?.length) {
			this.campaignReportS3Data.engagementInsight.content.intent =
				this.campaignReportS3Data.engagementInsight.content?.intent?.map(obj => ({
					...obj,
					visibleToBrand: true
				}));
		}
		_.set(this.campaignReportS3Data, 'allPosts.visibleToBrand', true);
	}

	private applyBasicTemplate() {
		this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand = true;
		this.campaignReportS3Data.keyFindings.visibleToBrand = true;
		this.campaignReportS3Data.results.visibleToBrand = true;
		this.campaignReportS3Data.results.content.brandMentionsVisibleToBrand = true;
		this.campaignReportS3Data.results.content.brandShareofVoiceVisibleToBrand = true;
		this.campaignReportS3Data.results.content.categoryConversationVisibleToBrand = true;
		this.campaignReportS3Data.results.content.totalReactionAndCommentsVisibleToBrand = true;
		this.campaignReportS3Data.results.content.ugcVisibleToBrand = true;

		this.campaignReportS3Data.kpiDetails.visibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.brandMentionsVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.brandShareofVoiceVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.categoryConversationVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.estimateImpressionVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.numAdminPostsVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentAdminPostVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentUGCPostVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.numUGCCommentsVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.numUGCPostsVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.totalEngagementVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.totalReactionAndCommentVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.totalUGCVisibleToBrand = true;

		this.campaignReportS3Data.brandShareOfVoice.visibleToBrand = true;
		this.campaignReportS3Data.brandShareOfVoice.afterSOV = false;
		this.campaignReportS3Data.brandShareOfVoice.beforeSOV = true;
		this.campaignReportS3Data.brandShareOfVoice.duringSOV = true;
		this.campaignReportS3Data.brandShareOfVoice.nonHashTag = false;

		this.campaignReportS3Data.brandSentiment.visibleToBrand = true;
		this.campaignReportS3Data.brandSentiment.content.afterSentimentMapVisibleToBrand = true;
		this.campaignReportS3Data.brandSentiment.content.beforeSentimentMapVisibleToBrand = true;
		this.campaignReportS3Data.brandSentiment.content.duringSentimentMapVisibleToBrand = true;

		this.campaignReportS3Data.engagementInsight.benefitsVisibleToBrand = false;
		this.campaignReportS3Data.engagementInsight.emotionsVisibleToBrand = false;
		this.campaignReportS3Data.engagementInsight.intentVisibleToBrand = false;

		this.campaignReportS3Data.wordCloud.visibleToBrand = true;
		this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand = true;
		this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand = true;

		this.campaignReportS3Data.engagementInsight.content.benefits =
			this.campaignReportS3Data.engagementInsight.content?.benefits?.map(obj => ({...obj, visibleToBrand: true}));

		this.campaignReportS3Data.engagementInsight.content.emotions =
			this.campaignReportS3Data.engagementInsight.content?.emotions?.map(obj => ({...obj, visibleToBrand: true}));

		this.campaignReportS3Data.engagementInsight.content.intent =
			this.campaignReportS3Data.engagementInsight.content?.intent?.map(obj => ({
				...obj,
				visibleToBrand: true
			}));
		_.set(this.campaignReportS3Data, 'allPosts.visibleToBrand', false);
	}

	private applyUnbraidedTemplate() {
		this.campaignReportS3Data.phaseIdeaDetails.visibleToBrand = true;
		this.campaignReportS3Data.keyFindings.visibleToBrand = true;
		this.campaignReportS3Data.results.visibleToBrand = true;
		this.campaignReportS3Data.results.content.brandMentionsVisibleToBrand = true;
		this.campaignReportS3Data.results.content.brandShareofVoiceVisibleToBrand = true;
		this.campaignReportS3Data.results.content.categoryConversationVisibleToBrand = true;
		this.campaignReportS3Data.results.content.totalReactionAndCommentsVisibleToBrand = true;
		this.campaignReportS3Data.results.content.ugcVisibleToBrand = true;

		this.campaignReportS3Data.kpiDetails.visibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.brandMentionsVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.brandShareofVoiceVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.categoryConversationVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.estimateImpressionVisibleToBrand = false;
		this.campaignReportS3Data.kpiDetails.content.numAdminPostsVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentAdminPostVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.numReactionAndCommentUGCPostVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.numUGCCommentsVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.numUGCPostsVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.totalEngagementVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.totalReactionAndCommentVisibleToBrand = true;
		this.campaignReportS3Data.kpiDetails.content.totalUGCVisibleToBrand = true;

		this.campaignReportS3Data.brandShareOfVoice.visibleToBrand = false;
		this.campaignReportS3Data.brandShareOfVoice.afterSOV = false;
		this.campaignReportS3Data.brandShareOfVoice.beforeSOV = false;
		this.campaignReportS3Data.brandShareOfVoice.duringSOV = false;
		this.campaignReportS3Data.brandShareOfVoice.nonHashTag = false;

		this.campaignReportS3Data.brandSentiment.visibleToBrand = false;
		this.campaignReportS3Data.brandSentiment.content.afterSentimentMapVisibleToBrand = false;
		this.campaignReportS3Data.brandSentiment.content.beforeSentimentMapVisibleToBrand = false;
		this.campaignReportS3Data.brandSentiment.content.duringSentimentMapVisibleToBrand = false;

		this.campaignReportS3Data.engagementInsight.benefitsVisibleToBrand = false;
		this.campaignReportS3Data.engagementInsight.emotionsVisibleToBrand = false;
		this.campaignReportS3Data.engagementInsight.intentVisibleToBrand = true;

		this.campaignReportS3Data.wordCloud.visibleToBrand = true;
		this.campaignReportS3Data.wordCloud.duringCamapingVisibleToBrand = true;
		this.campaignReportS3Data.wordCloud.preCamapingVisibleToBrand = true;

		this.campaignReportS3Data.engagementInsight.content.benefits =
			this.campaignReportS3Data.engagementInsight.content?.benefits?.map(obj => ({...obj, visibleToBrand: true}));

		this.campaignReportS3Data.engagementInsight.content.emotions =
			this.campaignReportS3Data.engagementInsight.content?.emotions?.map(obj => ({...obj, visibleToBrand: true}));

		this.campaignReportS3Data.engagementInsight.content.intent =
			this.campaignReportS3Data.engagementInsight.content?.intent?.map(obj => ({
				...obj,
				visibleToBrand: true
			}));
		_.set(this.campaignReportS3Data, 'allPosts.visibleToBrand', true);
	}

	private getKeywordTRansformations(obj: Keyword) {
		return obj.transformations.replace(/_/g, ' ').split(',');
	}

	private addOrderAndVisiblityOnSOVConversations(posts: any[], subSection: string, brandName: string) {
		posts?.forEach((obj, i) => {
			obj.order = i + 1;
			obj.visibleToBrand = true;
			_.set(this.campaignReportS3Data, `referenceConversation.brandShareOfVoice.${subSection}.${brandName}.${obj.id}`, {
				order: i + 1,
				visibleToBrand: true
			});
		});
	}

	private addOrderAndVisiblityOnSentimentsConversations(posts: any[], brandName: string, duration: string) {
		posts?.forEach((obj, i) => {
			obj.order = i + 1;
			obj.visibleToBrand = true;
			_.set(this.campaignReportS3Data, `referenceConversation.brandSentiments.${duration}.${brandName}.${obj.id}`, {
				order: i + 1,
				visibleToBrand: true
			});
		});
	}

	private addOrderAndVisiblityOnInsightsConversations(posts: any[], subSection: string, bucket: string) {
		posts?.forEach((obj, i) => {
			obj.order = i + 1;
			obj.visibleToBrand = true;
			_.set(this.campaignReportS3Data, `referenceConversation.brandInsights.${subSection}.${bucket}.${obj.id}`, {
				order: i + 1,
				visibleToBrand: true
			});
		});
	}

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}

	private sortJSONKeysByValue(object) {
		if (!object) {
			return null;
		}

		const sortable = [];
		const sortedObject = {};

		Object.keys(object).forEach(key => sortable.push([key, object[key]]));
		sortable
			.sort((a, b) => b[1] - a[1])
			?.slice(0, 50)
			.forEach(ele => (sortedObject[ele[0]] = ele[1]));

		return sortedObject;
	}

	private _onReceivedEvent(event: any): void {
		// remember to unsubscribe the event when lightbox is closed
		if (event.id === LIGHTBOX_EVENT.CLOSE) {
			// event CLOSED is fired
			this._subscription.unsubscribe();
			this.enableScrolling();
			this.lightbox.close();
		}
	}

	private getRoundedValue(value, total) {
		return total > 0 ? Math.round((+value * 100) / +total) : 0;
	}
}
