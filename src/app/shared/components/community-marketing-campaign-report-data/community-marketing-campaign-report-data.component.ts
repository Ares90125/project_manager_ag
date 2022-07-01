import {Component, HostListener, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {CircularModel} from '@sharedModule/models/group-reports/chart.model';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {FileService} from '@sharedModule/services/file.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import * as _ from 'lodash';
import {Lightbox, LIGHTBOX_EVENT, LightboxEvent} from 'ngx-lightbox';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {WordCloudService} from 'src/app/shared/services/word-cloud.service';
import {environment} from 'src/environments/environment';

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

@Component({
	selector: 'app-community-marketing-campaign-report-data',
	templateUrl: './community-marketing-campaign-report-data.component.html',
	styleUrls: ['./community-marketing-campaign-report-data.component.scss']
})
export class CommunityMarketingCampaignReportDataComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() isFromBrand = false;
	isReportEdit = true;
	campaignDetails;
	isPublishing = false;
	isCampaignHasS3Url = false;
	previousEntryValue = 0;
	private _subscription: Subscription;

	overallSnapshot = [
		{name: 'Total Groups', statistics: {value: 0}},
		{name: 'Total Audience', statistics: {value: 0}},
		{name: 'Brand Mentions', statistics: {value: 0}},
		{name: 'Leads Generated', statistics: {value: 0}},
		{name: 'Category Conversations', statistics: {value: 0}},
		{name: 'Share of Voice', statistics: {value: 0}},
		{name: 'Brand Conversations', statistics: {value: 0}}
	];
	keywordMetricsArrayLength = [];
	engagementDistribution = {adminPosts: 0, ugcPosts: 0, totalPosts: 0, adminPercentage: 0, ugcPercentage: 0};
	postDistribution = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: []};
	afterSOV = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: null};
	beforeSOV = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: null};
	duringSOV = {reportData: {chartOptions: new CircularModel().chartOptions}, isEmpty: true, series: null};
	campaignStatsInfo = [];
	whatsAppStatsInfo = [];
	afterSentimentMaps;
	beforeSentimentMaps;
	duringSentimentMaps;
	campaignStatistics = [
		{
			name: 'Facebook',
			statistics: {
				completedCount: 0,
				totalPosts: 0,
				reactions: 0,
				comments: 0,
				percentage: 0
			}
		},
		{
			name: 'WhatsApp',
			statistics: {
				completedCount: 0,
				totalPosts: 0,
				reactions: 0,
				comments: 0,
				percentage: 0
			}
		}
	];
	keywordMentionVolumeInfo = [];
	brandConversationsAndMentionsInfo = [
		{
			name: 'Brand Conversations',
			statistics: {
				beforeCampaignPercentage: 0,
				beforeCampaign: 0,
				duringCampaignPercentage: 0,
				duringCampaign: 0,
				afterCampaignPercentage: 0,
				afterCampaign: 0,
				isDuringCampaignIncreased: true,
				impact: 0,
				isVisible: true
			}
		},
		{
			name: 'Brand Mentions',
			statistics: {
				beforeCampaignPercentage: 0,
				beforeCampaign: 0,
				duringCampaignPercentage: 0,
				duringCampaign: 0,
				afterCampaignPercentage: 0,
				afterCampaign: 0,
				isDuringCampaignIncreased: true,
				impact: 0,
				isVisible: true
			}
		}
	];
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
	groupFrom = 0;
	groupEnd = 20;
	participantGroups;
	participatingGroupsSummary;
	cmcType = [];
	logo = null;
	previewImage = null;
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
	hideMetrics = {brandMentions: true, sov: true, sentimentMap: true};
	textBlocks = {
		keyMetrics: null,
		campaignStats: null,
		sov: null,
		sentimentMap: null,
		brandConversationsAndMentions: null,
		participantByGroups: null,
		wordCloud: null
	};
	showNewTextBlock = false;
	textBlockValue = null;

	reportCampaignHighlights = [];
	wordCloudWithOutCampaign = [];
	wordCloudWithCampaign = [];
	campaignReportForm: FormGroup;
	campaignReport2Form: FormGroup;
	selectedKeys;
	selectedReportModel = '';
	withCampaign;
	withOutCampaign;
	campaignSummary = '';
	transformedKeywords = [];
	chunckSize = 20;
	selectedPostIndex = 0;
	isAllPostsLoading = false;
	isAuthTokenExpired = false;
	isLongPressingEnabled = false;
	isRefreshingAllPosts = false;
	numberOfSelectedPosts = 0;
	selectedFilter: CampaignPostsSortMetrics['name'] = 'Comments';
	selectedValueFilter = 'All Posts';
	wordCloudEmptyState = {withOutCampaign: false, withCampaign: false};
	postDistributionSeriesColors = ['#3654FF', '#27AE60'];
	shareOfVoiceColors = ['#3654FF', '#B7B7DC', '#A0A0C2', '#76768D', '#646475'];
	timer = null;
	showTopPosts = false;
	selectedIndex = 0;

	private updatedScrollEvent: Subject<string> = new Subject();
	@HostListener('scroll', ['$event'])
	scrollAllPostHandler(event) {
		if (
			event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 50 &&
			!this.isAllPostsLoading
		) {
			this.getScreenshotsFromPostIds();
		}
	}
	@HostListener('window:scroll', ['$event']) // for window scroll events
	scrollOnSections(event) {
		this.updatedScrollEvent.next(event);
	}

	constructor(
		injector: Injector,
		private readonly fileService: FileService,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService,
		private wordCloudService: WordCloudService,
		private loggerService: LoggerService,
		private accountService: AccountServiceService,
		private readonly lightbox: Lightbox,
		private _lightboxEvent: LightboxEvent
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.storageUrl = environment.storageUrl;
		this.subscribeToScrollEventChanges();
		const keywords = this.campaign['keywords'] ? this.campaign['keywords'] : [];
		this.transformedKeywords = [];
		this.campaign['selectedKPIs'] = JSON.parse(this.campaign['KPIs']);
		this.campaign['selectedCmcType'] = JSON.parse(this.campaign['cmcType']);
		keywords.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.transformedKeywords.push(selectedKeyword[0].trim());
		});
		this.transformedKeywords = this.transformedKeywords.filter(el => !!el);

		if (this.campaign.s3ReportUrl && this.isFromBrand) {
			this.isCampaignHasS3Url = true;
			this.setReportData(this.campaign.s3ReportUrl);
		} else if (!this.campaign.s3ReportUrl && this.isFromBrand) {
			this.isCampaignHasS3Url = false;
		} else {
			this.getReportMetrics();
		}
		if (this.campaign.s3CoverImageUrl) {
			this.previewImage = await this.fileService.getImage(this.campaign.s3CoverImageUrl);
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	scrollTo(scrollElem, event) {
		Array.prototype?.slice.call(document.querySelectorAll('.left-sidebar li')).map(elem => {
			elem.classList.remove('active');
		});
		event.target.classList.add('active');
		scrollElem.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
	}

	subscribeToScrollEventChanges() {
		const debouncedCampaignSections = this.updatedScrollEvent.pipe(debounceTime(1000));
		this.subscriptionsToDestroy.push(
			debouncedCampaignSections.subscribe(onEventChange => {
				this.scrollCampaignSections();
			})
		);
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
			if (reportMetrics) {
				this.overallSnapshot = [
					{name: 'Total Groups', statistics: {value: reportMetrics.numGroups}},
					{name: 'Total Audience', statistics: {value: reportMetrics.numAudience}},
					{name: 'Brand Mentions', statistics: {value: reportMetrics.numDuringBrandMentions}},
					{name: 'Leads Generated', statistics: {value: 0}},
					{name: 'Category Conversations', statistics: {value: reportMetrics.numDuringCatConversations}},
					{name: 'Brand Conversations', statistics: {value: reportMetrics.numDuringBrandConversations}},
					{name: 'Share of Voice', statistics: {value: 0}}
				];
				this.keywordMetricsArrayLength = Array.from({length: this.overallSnapshot.length / 4 + 1}, (v, i) => i);
				this.engagementDistribution = {
					adminPosts: reportMetrics.numReactionAdminPost + reportMetrics.numCommentAdminPost,
					ugcPosts: reportMetrics.numReactionUGCPost + reportMetrics.numCommentUGCPost,
					totalPosts: 0,
					adminPercentage: 0,
					ugcPercentage: 0
				};
				this.setEngagementMetrics();

				this.setPostDistributionReportData(reportMetrics);

				this.setShareOfVoice(reportMetrics);

				this.setSentimentMaps(reportMetrics);
				this.setBrandConversationsAndMentions(reportMetrics);

				if (reportMetrics.phaseMetrics) {
					this.setCampaignStatsMetrics(reportMetrics);
				}

				if (reportMetrics['campaignHighlights']) {
					this.setAllPosts(reportMetrics);
				}
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
		try {
			let participantGroupsDetails = await this.campaignService.getCampaignsList(
				this.campaign.campaignId,
				this.campaign.brandId
			);

			if (participantGroupsDetails?.length) {
				this.participantGroupsDetails = participantGroupsDetails;
				this.participantGroups = participantGroupsDetails;
				this.getParticipatingGroups();
			}
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while retrieving participating groups',
				{},
				'CommunityMarketingCampaignReportComponent',
				'getReportMetrics',
				LoggerCategory.AppLogs
			);
		}
		try {
			const reportWc = await this.createCampaignService.getCmcReportWc(this.campaign.campaignId);
			if (reportWc) {
				this.createWordCloudDataModel(reportWc);
			}
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while retrieving Cmc report word cloud data',
				{},
				'CommunityMarketingCampaignReportComponent',
				'getReportMetrics',
				LoggerCategory.AppLogs
			);
		}

		this.getCampaignPosts();
	}

	getParticipatingGroups() {
		this.participantGroupsDetails?.forEach(group => {
			group['total'] = group.totalKeywordMentions + group.totalHashtagMentions + group.totalBrandMentions;
		});
		this.participantGroupsDetails = _.orderBy(this.participantGroupsDetails, ['total'], ['desc']);
		const highestValue = this.participantGroupsDetails[0].total;
		const participatingGroupsSummary = {totalKeywords: 0, totalHashtags: 0, totalBrandMentions: 0};
		this.participantGroupsDetails.forEach(group => {
			group['totalKeywordMentionsPercentage'] = this.getRoundedValue(group['totalKeywordMentions'], highestValue);
			group['totalHashtagMentionsPercentage'] = this.getRoundedValue(group['totalHashtagMentions'], highestValue);
			group['totalBrandMentionsPercentage'] = this.getRoundedValue(group['totalBrandMentions'], highestValue);
			participatingGroupsSummary.totalKeywords += group['totalKeywordMentions'];
			participatingGroupsSummary.totalHashtags += group['totalHashtagMentions'];
			participatingGroupsSummary.totalBrandMentions += group['totalBrandMentions'];
		});
		this.participatingGroupsSummary = participatingGroupsSummary;
	}

	async getCampaignPosts() {
		console.warn('getCampaignPosts');

		this.isLoading = true;
		const campaignPosts = await this.createCampaignService.getCampaignPosts(
			this.campaign.campaignId,
			1000,
			this.nextToken
		);

		this.nextToken = campaignPosts.nextToken;

		let conversations = campaignPosts.items;
		if (conversations.length === 1000) {
			const nextCampaignPosts = await this.createCampaignService.getCampaignPosts(
				this.campaign.campaignId,
				1000,
				this.nextToken
			);
			conversations = conversations.concat(nextCampaignPosts.items);
		}

		if (conversations.length < this.limit) {
			if (conversations.length === 0) {
				this.from -= this.limit;
			} else {
				this.end += this.limit;
			}
		} else {
			this.end += this.limit;
		}

		if (this.nextToken === null) {
			this.isConversationsLoaded = true;
		}

		this.campaignPosts = this.campaignPosts.concat(conversations);
		this.filteredCampaignPosts = _.clone(this.campaignPosts);
		this.campaignPosts.forEach(post => {
			const total = post.reactionCount + post.commentCount;
			post['reactionPercentage'] = this.getRoundedValue(post.reactionCount, total);
			post['commentPercentage'] = this.getRoundedValue(post.commentCount, total);
		});
		this.sortByMetrics(CampaignPostSortKeys.CommentPercentage, 'Comments', this.filteredCampaignPosts);
		this.isLoading = false;
	}

	getNextConversations() {
		if (this.from + this.limit + 1 > this.campaignPosts?.length && !this.isConversationsLoaded) {
			this.from += this.limit;
		} else if (this.from + this.limit + 1 <= this.campaignPosts?.length) {
			this.from += this.limit;
			this.end += this.limit;
		}
	}

	resetPagination() {
		this.from = 0;
		this.end = this.limit;
	}

	getPreviousConversations() {
		this.from -= this.limit;
		this.end -= this.limit;
	}

	setTopPostsModel(index) {
		if (this.isLongPressingEnabled) {
			return;
		}
		this.selectedIndex = index;
		this.showTopPosts = true;
	}

	loadPreviousPost() {
		const selectedIndex = this.selectedIndex === 0 ? this.reportCampaignHighlights.length - 1 : this.selectedIndex - 1;
		if (this.reportCampaignHighlights[selectedIndex]['statistics']['data']) {
			this.selectedIndex = selectedIndex;
		}
	}

	loadNextPost() {
		const selectedIndex = this.reportCampaignHighlights.length > this.selectedIndex + 1 ? this.selectedIndex + 1 : 0;
		if (this.reportCampaignHighlights[selectedIndex]['statistics']['data']) {
			this.selectedIndex = selectedIndex;
		}
	}

	getNextParticipatingGroups() {
		if (this.participantGroupFrom + this.limit + 1 > this.participantGroupsDetails?.length) {
			this.participantGroupFrom += this.limit;
		} else if (this.participantGroupFrom + this.limit + 1 <= this.participantGroupsDetails?.length) {
			this.participantGroupFrom += this.limit;
			this.participantGroupEnd += this.limit;
		}
	}

	getPreviousParticipatingGroups() {
		this.participantGroupFrom -= this.limit;
		this.participantGroupEnd -= this.limit;
	}

	getNextGroups() {
		if (this.groupFrom + this.limit + 1 > this.participantGroups?.length) {
			this.groupFrom += this.limit;
		} else if (this.groupFrom + this.limit + 1 <= this.participantGroups?.length) {
			this.groupFrom += this.limit;
			this.groupEnd += this.limit;
		}
	}

	getPreviousGroups() {
		this.groupFrom -= this.limit;
		this.groupEnd -= this.limit;
	}

	toggleMoreInfo(postId) {
		const post = document.getElementById(postId);
		if (post.classList.contains('show')) {
			post.classList.remove('show');
		} else {
			post.classList.add('show');
		}
	}

	toggleInfo(postId) {
		const post = document.getElementById(postId);
		post.classList.remove('show');
	}

	setEngagementMetrics() {
		this.engagementDistribution['totalPosts'] =
			this.engagementDistribution.adminPosts + this.engagementDistribution.ugcPosts;
		if (this.engagementDistribution['totalPosts'] > 0) {
			this.engagementDistribution['adminPercentage'] = Math.round(
				(this.engagementDistribution.adminPosts / this.engagementDistribution.totalPosts) * 100
			);
			this.engagementDistribution['ugcPercentage'] = Math.round(
				(this.engagementDistribution.ugcPosts / this.engagementDistribution.totalPosts) * 100
			);
		}
	}

	setPostDistributionReportData(reportMetrics) {
		const postDistributionData = {adminPosts: reportMetrics.numAdminPosts, ugcPosts: reportMetrics.numUGCPosts};
		const series = [
			{
				name: 'Admin Posts',
				data: [postDistributionData.adminPosts]
			},
			{
				name: 'UGC Posts',
				data: [postDistributionData.ugcPosts]
			}
		];
		this.postDistribution.series = series;
		this.createCircularModel(this.postDistribution, series, this.postDistributionSeriesColors);

		this.postDistribution.isEmpty =
			this.postDistribution?.series.reduce((sum, key) => sum + (key.data ? +key.data[0] : 0), 0) === 0;
	}

	setShareOfVoice(reportMetrics) {
		const afterSov = JSON.parse(reportMetrics?.afterSOV);
		const beforeSov = JSON.parse(reportMetrics?.beforeSOV);
		const duringSov = JSON.parse(reportMetrics?.duringSOV);

		this.afterSOV['actualSeries'] = afterSov;
		let series = this.setSovSeries(afterSov);
		this.afterSOV.series = series;
		this.createCircularModel(this.afterSOV, series.graphSeries, this.shareOfVoiceColors);

		this.beforeSOV['actualSeries'] = beforeSov;
		series = this.setSovSeries(beforeSov);
		this.beforeSOV.series = series;
		this.createCircularModel(this.beforeSOV, series.graphSeries, this.shareOfVoiceColors);

		this.duringSOV['actualSeries'] = duringSov;
		series = this.setSovSeries(duringSov);
		this.duringSOV.series = series;
		const sovKeyMetricIndex = this.overallSnapshot.findIndex(keyMetric => keyMetric.name === 'Share of Voice');
		this.overallSnapshot[sovKeyMetricIndex].statistics.value = series?.graphSeries[0]?.data;
		this.createCircularModel(this.duringSOV, series.graphSeries, this.shareOfVoiceColors);
		this.setEmptyStatesOfSov();
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

	setSentimentMaps(reportMetrics) {
		const afterSentimentMap = reportMetrics?.afterSentimentMap ? JSON.parse(reportMetrics?.afterSentimentMap) : null;
		let stats = {dislikePercentage: 0, likePercentage: 0, neutralPercentage: 0};
		let total = afterSentimentMap
			? +afterSentimentMap['dislike'] + +afterSentimentMap['like'] + +afterSentimentMap['neutral']
			: 0;
		if (total > 0) {
			stats.dislikePercentage = Math.round((+afterSentimentMap['dislike'] * 100) / total);
			stats.likePercentage = Math.round((+afterSentimentMap['like'] * 100) / total);
			stats.neutralPercentage = Math.round((+afterSentimentMap['neutral'] * 100) / total);
		}
		this.afterSentimentMaps = stats;

		const beforeSentimentMap = reportMetrics?.beforeSentimentMap ? JSON.parse(reportMetrics?.beforeSentimentMap) : null;
		stats = {dislikePercentage: 0, likePercentage: 0, neutralPercentage: 0};
		total = beforeSentimentMap
			? +beforeSentimentMap['dislike'] + +beforeSentimentMap['like'] + +beforeSentimentMap['neutral']
			: 0;
		if (total > 0) {
			stats.dislikePercentage = Math.round((+beforeSentimentMap['dislike'] * 100) / total);
			stats.likePercentage = Math.round((+beforeSentimentMap['like'] * 100) / total);
			stats.neutralPercentage = Math.round((+beforeSentimentMap['neutral'] * 100) / total);
		}
		this.beforeSentimentMaps = stats;

		const duringSentimentMap = reportMetrics?.duringSentimentMap ? JSON.parse(reportMetrics?.duringSentimentMap) : null;
		stats = {dislikePercentage: 0, likePercentage: 0, neutralPercentage: 0};
		total = duringSentimentMap
			? +duringSentimentMap['dislike'] + +duringSentimentMap['like'] + +duringSentimentMap['neutral']
			: 0;
		if (total > 0) {
			stats.dislikePercentage = Math.round((+duringSentimentMap['dislike'] * 100) / total);
			stats.likePercentage = Math.round((+duringSentimentMap['like'] * 100) / total);
			stats.neutralPercentage = Math.round((+duringSentimentMap['neutral'] * 100) / total);
		}
		this.duringSentimentMaps = stats;
	}

	setBrandConversationsAndMentions(reportMetrics) {
		const totalConversations =
			reportMetrics['numBeforeBrandConversations'] +
			reportMetrics['numDuringBrandConversations'] +
			reportMetrics['numAfterBrandConversations'];
		const totalMentions =
			reportMetrics['numBeforeBrandMentions'] +
			reportMetrics['numDuringBrandMentions'] +
			reportMetrics['numAfterBrandMentions'];
		if (totalConversations > 0) {
			this.brandConversationsAndMentionsInfo[0].statistics = {
				beforeCampaignPercentage: Math.round((reportMetrics['numBeforeBrandConversations'] * 100) / totalConversations),
				beforeCampaign: reportMetrics['numBeforeBrandConversations'],
				duringCampaignPercentage: Math.round((reportMetrics['numDuringBrandConversations'] * 100) / totalConversations),
				duringCampaign: reportMetrics['numDuringBrandConversations'],
				afterCampaignPercentage: Math.round((reportMetrics['numAfterBrandConversations'] * 100) / totalConversations),
				afterCampaign: reportMetrics['numAfterBrandConversations'],
				isDuringCampaignIncreased:
					Number(reportMetrics['numDuringBrandConversations']) - Number(reportMetrics['numBeforeBrandConversations']) >
					-1,
				impact: 0,
				isVisible: true
			};
		}
		if (totalMentions > 0) {
			this.brandConversationsAndMentionsInfo[1].statistics = {
				beforeCampaignPercentage: Math.round((reportMetrics['numBeforeBrandMentions'] * 100) / totalConversations),
				beforeCampaign: reportMetrics['numBeforeBrandMentions'],
				duringCampaignPercentage: Math.round((reportMetrics['numDuringBrandMentions'] * 100) / totalConversations),
				duringCampaign: reportMetrics['numDuringBrandMentions'],
				afterCampaignPercentage: Math.round((reportMetrics['numAfterBrandMentions'] * 100) / totalConversations),
				afterCampaign: reportMetrics['numAfterBrandMentions'],
				isDuringCampaignIncreased:
					Number(reportMetrics['numDuringBrandMentions']) - Number(reportMetrics['numBeforeBrandMentions']) > -1,
				impact: 0,
				isVisible: true
			};
		}
		this.setImpactOnBrandMentions();
	}

	setImpactOnBrandMentions() {
		this.brandConversationsAndMentionsInfo.forEach(info => {
			const beforeCampaign = Number(info.statistics.beforeCampaign);
			const duringCampaign = Number(info.statistics.duringCampaign);
			const afterCampaign = Number(info.statistics.afterCampaign);
			if (beforeCampaign > 0) {
				info.statistics.impact = this.getRoundedValue(duringCampaign - beforeCampaign, beforeCampaign);
				info.statistics['afterImpact'] = this.getRoundedValue(afterCampaign - beforeCampaign, beforeCampaign);
			} else {
				info.statistics.impact = null;
				info.statistics['afterImpact'] = null;
			}
		});
	}

	setAllPosts(reportMetrics) {
		console.warn('seeAll Posts ', reportMetrics);
		this.reportCampaignHighlights = [];
		const allPosts = reportMetrics['campaignHighlights'];

		for (let value of allPosts) {
			if (value) {
				const topCommunity = {name: '', statistics: {screenshot: value, caption: ''}};
				this.reportCampaignHighlights.push(topCommunity);
			}
		}

		if (this.reportCampaignHighlights) {
			this.getScreenshotsFromPostIds();
		}
	}

	onLongPress(post, isTopPosts) {
		post['isSelected'] = true;
		this.isLongPressingEnabled = true;
	}

	async getScreenshotsFromPostIds() {
		this.isAllPostsLoading = true;
		this.isAuthTokenExpired = false;
		const calls = [];
		const posts = this.reportCampaignHighlights?.slice(
			this.selectedPostIndex,
			this.selectedPostIndex + this.chunckSize
		);

		posts?.forEach(topPost => {
			calls.push(
				this.createCampaignService.getScreenshotsFromPostIds({
					sourceId: topPost.statistics.screenshot,
					commentEnable: false,
					skipScreenshot: true
				})
			);
		});
		const responses = await Promise.all(calls);
		if (responses && posts?.length > 0) {
			responses.forEach((response, index) => {
				if (response?.status !== 401) {
					this.reportCampaignHighlights[this.selectedPostIndex + index].statistics['data'] = response?.data;
				} else {
					this.isAuthTokenExpired = true;
				}
			});
			this.selectedPostIndex += this.chunckSize;
		}
		if (this.isAuthTokenExpired) {
			await this.accountService.refreshToken();
			this.selectedPostIndex = 0;
			return this.getScreenshotsFromPostIds();
		}
		this.isAllPostsLoading = false;
	}

	changeSelectedPostsStatus(status) {
		this.reportCampaignHighlights.forEach(post => {
			post['isSelected'] = status;
		});
		this.isLongPressingEnabled = status;
	}

	setNumberSelectedPosts() {
		this.numberOfSelectedPosts = this.reportCampaignHighlights.filter(post => post['isSelected'] === true).length;
	}

	async refreshPostScreenshotUrl(postsToBeSelected) {
		this.isRefreshingAllPosts = true;
		this.isAuthTokenExpired = false;

		const calls = [];
		const posts = postsToBeSelected.filter(post => post['isSelected'] === true);

		posts.forEach(topPost => {
			topPost['isLoading'] = true;
			calls.push(
				this.createCampaignService.getScreenshotsFromPostIds({
					sourceId: topPost.statistics.screenshot,
					commentEnable: false,
					forceRefresh: true,
					skipScreenshot: true
				})
			);
		});

		const response = await Promise.all(calls);

		if (response && posts?.length > 0) {
			response.forEach((url, index) => {
				if (url?.status !== 401) {
					posts[index].statistics['data'] = url?.data;
				} else {
					this.accountService.refreshToken();
					this.isAuthTokenExpired = true;
				}

				if (this.isAuthTokenExpired) {
					this.refreshPostScreenshotUrl(postsToBeSelected);
				} else {
					posts[index]['isLoading'] = false;
					posts[index]['isSelected'] = false;
				}
			});
		}

		this.isRefreshingAllPosts = false;
		this.isLongPressingEnabled = false;
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

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}

	setCampaignStatsMetrics(reportMetrics) {
		const phaseMetrics = JSON.parse(reportMetrics.phaseMetrics);
		this.campaignStatsInfo = [];
		for (let key of Object.keys(phaseMetrics)) {
			const statsInfo = {
				name: '',
				statistics: {
					reactions: 0,
					comments: 0,
					engagement: 0,
					entries: 0,
					completedCount: 0,
					totalPost: 0,
					percentage: 0
				}
			};
			statsInfo['name'] = key;
			statsInfo['statistics'].reactions = phaseMetrics[key].reactionCount ? phaseMetrics[key].reactionCount : 0;
			statsInfo['statistics'].comments = phaseMetrics[key].commentCount ? phaseMetrics[key].commentCount : 0;
			statsInfo['statistics'].engagement = statsInfo['statistics'].reactions + statsInfo['statistics'].comments;
			statsInfo['statistics'].completedCount = phaseMetrics[key].completedCount;
			statsInfo['statistics'].totalPost = phaseMetrics[key].totalPost;
			statsInfo['statistics'].percentage =
				phaseMetrics[key].totalPost > 0
					? Math.round((statsInfo['statistics'].completedCount * 100) / statsInfo['statistics'].totalPost)
					: 0;
			this.campaignStatsInfo.push(statsInfo);
		}

		this.setCampaignStatistics(reportMetrics?.numPosts, this.campaignStatistics[0].statistics, this.campaignStatsInfo);
	}

	setCampaignStatistics(numPosts, statistics, campaignStatsInfo) {
		const comments = campaignStatsInfo.reduce((sum, stat) => sum + stat.statistics.comments, 0);
		const reactions = campaignStatsInfo.reduce((sum, stat) => sum + stat.statistics.reactions, 0);
		const totalEngagement = comments + reactions;
		statistics.reactions = totalEngagement > 0 ? Math.round((reactions * 100) / totalEngagement) : 0;
		statistics.comments = totalEngagement > 0 ? Math.round((comments * 100) / totalEngagement) : 0;
		statistics.completedCount = campaignStatsInfo.reduce((sum, stat) => sum + stat.statistics.completedCount, 0);
		statistics.totalPosts = campaignStatsInfo.reduce((sum, stat) => sum + stat.statistics.totalPost, 0);
		statistics.percentage =
			statistics.totalPosts > 0 ? Math.round((statistics.completedCount * 100) / statistics.totalPosts) : 0;
	}

	sortByMetrics(
		value: CampaignPostsSortMetrics['value'],
		name: CampaignPostsSortMetrics['name'],
		list: CampaignPostsSortMetrics['list']
	) {
		this.selectedFilter = name;
		this.filteredCampaignPosts = _.orderBy(list, [value], ['desc']);
	}

	filterByPostType(isAdminPost: boolean = null, name: string) {
		this.selectedValueFilter = name;
		let filteredData: any[];
		if (isAdminPost === null || isAdminPost === undefined) {
			filteredData = _.clone(this.campaignPosts);
		} else {
			filteredData = _.filter(this.campaignPosts, function (post) {
				if (isAdminPost) return post.isAdminPost === 'true' || post.isAdminPost === true;
				return post.isAdminPost === 'false' || !post.isAdminPost;
			});
		}

		let sortKey =
			this.selectedFilter === 'Comments'
				? CampaignPostSortKeys.CommentPercentage
				: CampaignPostSortKeys.ReactionPercentage;
		this.resetPagination();
		this.sortByMetrics(sortKey, this.selectedFilter, filteredData);
	}

	async setReportData(key) {
		let campaignReportData = await this.fileService.getDataFromS3(key);
		if (campaignReportData) {
			this.loggerService.debug(
				'Retrieved report data from s3 bucket',
				{campaignReportData: campaignReportData, key: key},
				'CommunityMarketingCampaignReportComponent',
				'setReportData'
			);
			try {
				campaignReportData = new TextDecoder('utf-8').decode(campaignReportData);
				this.getCampaignReportDataOnLoad(campaignReportData, key);
			} catch (e) {
				const reader = new FileReader();

				reader.addEventListener('loadend', e => {
					campaignReportData = reader.result;
					this.getCampaignReportDataOnLoad(campaignReportData, key);
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
				campaignReportData = JSON.parse(decodeURIComponent(JSON.parse(campaignReport)));
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
			this.overallSnapshot = campaignReportData['overallSnapshot'];
			this.campaignStatsInfo = campaignReportData['campaignStatsInfo'];
			this.campaignStatistics = campaignReportData['campaignStatistics'];
			this.campaignStatsInfo = this.campaignStatsInfo.filter(stats => stats.name);
			this.afterSOV = campaignReportData['afterSOV'];
			this.beforeSOV = campaignReportData['beforeSOV'];
			this.duringSOV = campaignReportData['duringSOV'];
			this.afterSentimentMaps = campaignReportData['afterSentimentMaps'];
			this.beforeSentimentMaps = campaignReportData['beforeSentimentMaps'];
			this.duringSentimentMaps = campaignReportData['duringSentimentMaps'];
			this.engagementDistribution = campaignReportData['engagementDistribution'];
			this.brandConversationsAndMentionsInfo = campaignReportData['brandConversationsAndMentionsInfo'];
			this.postDistribution = campaignReportData['postDistribution'];
			this.campaignPosts = campaignReportData['campaignPosts'];
			this.wordCloudWithOutCampaign = campaignReportData['wordCloudWithOutCampaign'];
			this.wordCloudWithCampaign = campaignReportData['wordCloudWithCampaign'];
			this.participantGroupsDetails = campaignReportData['participantGroupsDetails'];
			this.participantGroups = campaignReportData['participantGroups'];
			this.participatingGroupsSummary = campaignReportData['participatingGroupsSummary'];
			this.reportCampaignHighlights = campaignReportData['reportCampaignHighlights'];
			this.visibleCampaignReport = campaignReportData['visibleCampaignReport'];
			this.whatsAppStatsInfo = campaignReportData['whatsAppStatsInfo'];
			this.textBlocks = campaignReportData['textBlocks'] ? campaignReportData['textBlocks'] : this.textBlocks;
			this.keywordMetricsArrayLength = Array.from({length: this.overallSnapshot.length / 4 + 1}, (v, i) => i);
			this.participantGroupsDetails = this.participantGroupsDetails.filter(group => group.groupName);
			this.participantGroupsDetails = this.participantGroupsDetails.splice(0, 15);

			this.campaignPosts = this.campaignPosts.filter(post => !post.isHidden);
			this.reportCampaignHighlights = this.reportCampaignHighlights.filter(screenshot => !screenshot.isHidden);

			this.getScreenshotsFromPostIds();
			this.wordCloudEmptyState.withCampaign = !(
				this.wordCloudWithCampaign.reduce((sum, campaign) => sum + +campaign.statistics.value, 0) > 0
			);
			this.wordCloudEmptyState.withOutCampaign = !(
				this.wordCloudWithOutCampaign.reduce((sum, campaign) => sum + +campaign.statistics.value, 0) > 0
			);
			this.setWordCloudData();
			this.setCampaignStatistics(0, this.campaignStatistics[0].statistics, this.campaignStatsInfo);
			this.end = this.campaignPosts.length > this.limit ? this.limit : this.campaignPosts.length;
			this.isConversationsLoaded = true;
			this.sortByMetrics(CampaignPostSortKeys.CommentPercentage, 'Comments', this.filteredCampaignPosts);
		}
	}

	setWordCloudData() {
		const beforeWC = {};
		const duringWC = {};
		this.wordCloudWithOutCampaign.forEach(data => {
			beforeWC[data.name] = data.statistics.value;
		});
		this.wordCloudWithCampaign.forEach(data => {
			duringWC[data.name] = data.statistics.value;
		});
		this.wordCloudEmptyState.withCampaign = !(
			this.wordCloudWithCampaign.reduce((sum, campaign) => sum + +campaign.statistics.value, 0) > 0
		);
		this.wordCloudEmptyState.withOutCampaign = !(
			this.wordCloudWithOutCampaign.reduce((sum, campaign) => sum + +campaign.statistics.value, 0) > 0
		);
		this.createWordCloudDataModel({beforeWC: JSON.stringify(beforeWC), duringWC: JSON.stringify(duringWC)});
	}

	async uploadToS3() {
		this.isPublishing = true;
		let campaignDetails = {};
		campaignDetails['overallSnapshot'] = this.overallSnapshot;
		campaignDetails['campaignStatsInfo'] = this.campaignStatsInfo;
		campaignDetails['whatsAppStatsInfo'] = this.whatsAppStatsInfo;
		campaignDetails['campaignStatistics'] = this.campaignStatistics;
		campaignDetails['beforeSOV'] = this.beforeSOV;
		if (this.hideMetrics.sov) {
			campaignDetails['afterSOV'] = this.afterSOV;
		}
		campaignDetails['duringSOV'] = this.duringSOV;
		if (this.hideMetrics.sentimentMap) {
			campaignDetails['afterSentimentMaps'] = this.afterSentimentMaps;
		}
		campaignDetails['beforeSentimentMaps'] = this.beforeSentimentMaps;
		campaignDetails['duringSentimentMaps'] = this.duringSentimentMaps;
		campaignDetails['engagementDistribution'] = this.engagementDistribution;
		this.brandConversationsAndMentionsInfo.forEach(brand => {
			brand.statistics['isVisible'] = this.hideMetrics.brandMentions;
		});
		campaignDetails['brandConversationsAndMentionsInfo'] = this.brandConversationsAndMentionsInfo;
		campaignDetails['postDistribution'] = this.postDistribution;
		campaignDetails['campaignPosts'] = this.campaignPosts;
		campaignDetails['wordCloudWithOutCampaign'] = this.wordCloudWithOutCampaign;
		campaignDetails['wordCloudWithCampaign'] = this.wordCloudWithCampaign;
		campaignDetails['participantGroupsDetails'] = this.participantGroupsDetails;
		campaignDetails['participatingGroupsSummary'] = this.participatingGroupsSummary;
		campaignDetails['participantGroups'] = this.participantGroups;
		campaignDetails['visibleCampaignReport'] = this.visibleCampaignReport;
		campaignDetails['textBlocks'] = this.textBlocks;
		campaignDetails['reportCampaignHighlights'] = this.reportCampaignHighlights;

		campaignDetails = encodeURIComponent(JSON.stringify(campaignDetails));
		let key;
		if (this.campaign['s3ReportUrl']) {
			key = await this.fileService.uploadCampaignReportToS3(
				campaignDetails,
				'campaign',
				null,
				this.campaign['s3ReportUrl']
			);

			this.updateCampaign(key);
			document.getElementById('published').click();
			this.isPublishing = false;
		} else {
			key = await this.fileService.uploadCampaignReportToS3(campaignDetails, 'campaign', this.randomUuid(), null);
			this.updateCampaign(key);
		}
	}

	setCampaignSummary() {
		this.selectedReportModel = 'campaignSummary';
		this.campaignSummary = this.campaign['campaignSummary'];
	}

	saveCampaignSummary() {
		this.campaign['campaignSummary'] = this.campaignSummary;
	}

	async updateCampaign(key) {
		let campaignCreateInput = {};
		campaignCreateInput['brandId'] = this.campaign['brandId'];
		campaignCreateInput['brandName'] = this.campaign['brandName'];
		campaignCreateInput['campaignId'] = this.campaign['campaignId'];
		campaignCreateInput['campaignName'] = this.campaign['campaignName'];
		campaignCreateInput['details'] = this.campaign['details'];
		campaignCreateInput['startDateAtUTC'] = this.campaign['startDateAtUTC'];
		campaignCreateInput['endDateAtUTC'] = this.campaign['endDateAtUTC'];
		campaignCreateInput['objective'] = this.campaign['objective'];
		campaignCreateInput['keywordCategory'] = this.campaign['keywordCategory'];
		campaignCreateInput['keywordBrand'] = this.campaign['keywordBrand'];
		campaignCreateInput['keywords'] = this.campaign['keywords'];
		campaignCreateInput['campaignSummary'] = this.campaign['campaignSummary'];
		campaignCreateInput['proposalEmails'] = this.campaign['proposalEmails'];
		campaignCreateInput['cmcReportName'] = this.campaign['cmcReportName'];
		campaignCreateInput['taskTitle'] = this.campaign['taskTitle'];
		campaignCreateInput['campaignPeriod'] = this.campaign['campaignPeriod'];
		campaignCreateInput['status'] = this.campaign.status;
		campaignCreateInput['campaignBriefForCommunityAdmin'] = this.campaign.campaignBriefForCommunityAdmin;
		campaignCreateInput['KPIs'] = this.campaign['KPIs'];
		campaignCreateInput['cmcType'] = this.campaign['cmcType'];
		campaignCreateInput['keywordSubCategories'] = this.campaign['keywordSubCategories'];
		campaignCreateInput['campaignSummary'] = this.campaign['campaignSummary'];
		campaignCreateInput['primaryObjective'] = this.campaign['primaryObjective'];
		campaignCreateInput['secondaryObjective'] = this.campaign['secondaryObjective'];
		campaignCreateInput['campaignPeriod'] = this.campaign['campaignPeriod'];
		campaignCreateInput['defaultTaskDate'] = this.campaign['defaultTaskDate'];
		campaignCreateInput['timezoneName'] = this.campaign['timezoneName'];
		campaignCreateInput['s3ReportUrl'] = key;

		const processedFileURLs = this.logo ? await Promise.all([this.processFilesForUrls(this.logo)]) : null;
		if (this.isLogoRemoved) {
			campaignCreateInput['s3CoverImageUrl'] = null;
		} else {
			campaignCreateInput['s3CoverImageUrl'] = processedFileURLs
				? processedFileURLs[0][0]
				: this.campaign.s3CoverImageUrl;
		}

		let campaignDetails;
		try {
			campaignDetails = await this.createCampaignService.updateCampaignDetails(
				campaignCreateInput as UpdateCampaignInput
			);
			this.campaign = campaignDetails;
			this.isPublishing = false;
			this.alert.success('Brand can now see the changes you have made', 'Report updated successfully', 5000, true);
			document.getElementById('published').click();
		} catch (e) {
			this.isPublishing = false;
			this.alert.error(
				'Campaign updation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
		}
	}

	async createWordCloudDataModel(reportWc) {
		let withOutCampaign = {};
		let withCampaign = {};
		if (reportWc.beforeWC) {
			withOutCampaign = JSON.parse(reportWc.beforeWC);
			withOutCampaign = this.sortJSONKeysByValue(withOutCampaign);
			this.wordCloudWithOutCampaign = [];
			let model;
			for (let key of Object.keys(withOutCampaign)) {
				model = {name: key, statistics: {value: withOutCampaign[key]}};
				this.wordCloudWithOutCampaign.push(model);
			}
			this.wordCloudWithOutCampaign = _.orderBy(this.wordCloudWithOutCampaign, ['statistics.value'], ['desc']);
		}
		if (reportWc.duringWC) {
			withCampaign = JSON.parse(reportWc.duringWC);
			withCampaign = this.sortJSONKeysByValue(withCampaign);
			this.wordCloudWithCampaign = [];
			let model;
			for (let key of Object.keys(withCampaign)) {
				model = {name: key, statistics: {value: withCampaign[key]}};
				this.wordCloudWithCampaign.push(model);
			}
			this.wordCloudWithCampaign = _.orderBy(this.wordCloudWithCampaign, ['statistics.value'], ['desc']);
		}
		if (!_.isEmpty(withOutCampaign)) {
			this.withOutCampaign = await this.wordCloudService.getWordCloudData(withOutCampaign);
		}

		if (!_.isEmpty(withCampaign)) {
			this.withCampaign = await this.wordCloudService.getWordCloudData(withCampaign);
		}
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

	createCircularModel(dataModel, series, colors) {
		dataModel.reportData.chartOptions = new CircularModel().chartOptions;
		dataModel.reportData.chartOptions.colors = colors;
		dataModel.reportData.chartOptions.series = series;
		dataModel.isEmpty = false;
	}

	addNewCampaignStats() {
		if (this.campaignStatsInfo.length > 0) {
			this.createCampaignStatsForm(this.campaignStatsInfo, 'campaignStats');
		} else {
			const communityModel = [
				{
					name: '',
					statistics: {
						reactions: 0,
						comments: 0,
						engagement: 0,
						entries: 0,
						completedCount: 0,
						totalPost: 0,
						percentage: 0
					}
				}
			];
			this.createCampaignStatsForm(communityModel, 'campaignStats');
		}
		this.textBlockValue = this.textBlocks.campaignStats;
		this.showNewTextBlock = true;
	}

	addNewKeywordMentions() {
		if (this.keywordMentionVolumeInfo.length > 0) {
			this.createCampaignStatsForm(this.keywordMentionVolumeInfo, 'keywordMentionVolume');
		} else {
			const communityModel = [
				{
					name: '',
					statistics: {
						beforeCampaign: '',
						duringCampaign: '',
						duringCampaignRate: '',
						isDuringCampaignIncreased: true,
						postCampaign: '',
						postCampaignRate: '',
						isPostCampaignIncreased: true
					}
				}
			];
			this.createCampaignStatsForm(communityModel, 'keywordMentionVolume');
		}
	}

	addNewWordCloud() {
		if (this.wordCloudWithOutCampaign.length > 0) {
			this.createCampaignStatsForm(this.wordCloudWithOutCampaign, 'wordCloud');
		} else {
			let communityModel = [
				{
					name: '',
					statistics: {value: 0}
				}
			];
			this.createCampaignStatsForm(communityModel, 'wordCloud');
		}
		if (this.wordCloudWithCampaign.length > 0) {
			this.createWordCloudForm(this.wordCloudWithCampaign, 'wordCloud');
		} else {
			let communityModel = [
				{
					name: '',
					statistics: {value: 0}
				}
			];
			this.createWordCloudForm(communityModel, 'wordCloud');
		}
		this.textBlockValue = this.textBlocks.wordCloud;
		this.showNewTextBlock = true;
	}

	setTotalEngagement() {
		let campaignArray = this.campaignReportForm.controls.report as FormArray;
		const totalEngagement = campaignArray.controls[4].get('value').value;
		const totalEntries = campaignArray.controls[7].get('value').value;
		const value = Number(totalEngagement) - this.previousEntryValue + Number(totalEntries);
		this.previousEntryValue = Number(totalEntries);
		campaignArray.controls[4].get('value').setValue(value);
	}

	createKeyMerticsForm(campaignReport, postDistribution, engagementDistribution, reportModel) {
		let options = {};
		const formArray = [];
		this.selectedKeys = Object.keys(campaignReport[0].statistics);
		this.selectedReportModel = reportModel;

		campaignReport.forEach(stats => {
			options = {};
			options['name'] = [stats.name];
			this.selectedKeys.forEach(key => {
				options[key] = [stats.statistics[key]];
			});
			const formGroup = this.formBuilder.group(options);
			formArray.push(formGroup);
		});
		let formGroup = null;
		formGroup = this.formBuilder.group({name: 'ADMIN POSTS', value: postDistribution.series[0]?.data[0]});
		formArray.push(formGroup);

		formGroup = this.formBuilder.group({name: 'UGC POSTS', value: postDistribution.series[1]?.data[0]});
		formArray.push(formGroup);

		formGroup = this.formBuilder.group({name: 'ADMIN POST ENGAGEMENT', value: engagementDistribution.adminPosts});
		formArray.push(formGroup);

		formGroup = this.formBuilder.group({name: 'UGC POST ENGAGEMENT', value: engagementDistribution.ugcPosts});
		formArray.push(formGroup);

		const campaignStatsLength = Math.ceil(formArray.length / 3);
		this.editCampaignStatsNumber = Array.from({length: campaignStatsLength}, (v, i) => i);
		this.campaignReportForm = this.formBuilder.group({report: this.formBuilder.array(formArray)});
		this.textBlockValue = this.textBlocks.keyMetrics;
		this.showNewTextBlock = true;
	}

	createShareOfVoiceForm(beforeSOV, afterSOV, duringSOV, reportModel) {
		this.campaignReportFormHeaderValues = ['', 'Before', 'During', 'After'];
		const sovValues = [];
		const sovKeys = [];
		beforeSOV?.series?.graphSeries.forEach((ser, index) => {
			if (index === beforeSOV.series.graphSeries.length - 1) {
				return;
			}
			sovKeys.push(ser.name);
		});

		sovKeys.forEach(key => {
			if (key === this.campaign.keywordBrand) {
				sovValues.push({
					name: '',
					statistics: {
						statsName: key,
						name: key,
						Before: beforeSOV?.actualSeries[key] ? beforeSOV?.actualSeries[key] : 0,
						During: duringSOV?.actualSeries[key] ? duringSOV.actualSeries[key] : 0,
						After: afterSOV?.actualSeries[key] ? afterSOV.actualSeries[key] : 0
					}
				});
				return;
			}
			let sov = {
				name: '',
				statistics: {
					statsName: key,
					name: key,
					Before: beforeSOV?.series?.selectedKeys[key] ? beforeSOV.series.selectedKeys[key] : 0,
					During: duringSOV?.series?.selectedKeys[key] ? duringSOV.series.selectedKeys[key] : 0,
					After: afterSOV?.series?.selectedKeys[key] ? afterSOV.series.selectedKeys[key] : 0
				}
			};
			sovValues.push(sov);
		});
		this.shareOfVoiceKeys = [];

		if (beforeSOV?.series?.selectedKeys) {
			Object.keys(beforeSOV?.series?.selectedKeys).forEach(key => {
				if (key === this.campaign.keywordBrand) {
					return;
				}

				this.shareOfVoiceKeys.push({
					statsName: key,
					name: key,
					Before: beforeSOV.series.selectedKeys[key],
					During: duringSOV.series.selectedKeys[key],
					After: afterSOV.series.selectedKeys[key]
				});
			});

			this.selectedShareOfVoiceKeys = this.shareOfVoiceKeys.filter((sov, index) => index > 2);
			this.createCampaignStatsForm(sovValues, reportModel);
			this.textBlockValue = this.textBlocks.sov;
			this.showNewTextBlock = true;
		}
	}

	createSentimentMapForm(beforeSentimentMap, afterSentimentMap, duringSentimentMap, reportModel) {
		this.campaignReportFormHeaderValues = ['', 'Like', 'Neutral', 'Dislike'];
		let sovValues = [];
		let sov = {
			name: '',
			statistics: {
				statsName: 'Before Campaign',
				Like: beforeSentimentMap?.likePercentage,
				Neutral: beforeSentimentMap?.neutralPercentage,
				Dislike: beforeSentimentMap?.dislikePercentage
			}
		};
		sovValues.push(sov);
		sov = {
			name: '',
			statistics: {
				statsName: 'After Campaign',
				Like: afterSentimentMap?.likePercentage,
				Neutral: afterSentimentMap?.neutralPercentage,
				Dislike: afterSentimentMap?.dislikePercentage
			}
		};
		sovValues.push(sov);
		sov = {
			name: '',
			statistics: {
				statsName: 'During Campaign',
				Like: duringSentimentMap?.likePercentage,
				Neutral: duringSentimentMap?.neutralPercentage,
				Dislike: duringSentimentMap?.dislikePercentage
			}
		};
		sovValues.push(sov);
		this.createCampaignStatsForm(sovValues, reportModel);
		this.textBlockValue = this.textBlocks.sentimentMap;
		this.showNewTextBlock = true;
	}

	createBrandConversationsForm(brandConversationsAndMentionsInfo, reportModel) {
		this.campaignReportFormHeaderValues = ['', 'Before', 'During', 'After'];
		let brandConvAndMentInfo = brandConversationsAndMentionsInfo[0];
		let sovValues = [];
		let sov = {
			name: '',
			statistics: {
				statsName: brandConvAndMentInfo?.name,
				Before: brandConvAndMentInfo?.statistics?.beforeCampaign,
				During: brandConvAndMentInfo?.statistics?.duringCampaign,
				After: brandConvAndMentInfo?.statistics?.afterCampaign
			}
		};
		sovValues.push(sov);

		brandConvAndMentInfo = brandConversationsAndMentionsInfo[1];
		sov = {
			name: '',
			statistics: {
				statsName: brandConvAndMentInfo?.name,
				Before: brandConvAndMentInfo?.statistics?.beforeCampaign,
				During: brandConvAndMentInfo?.statistics?.duringCampaign,
				After: brandConvAndMentInfo?.statistics?.afterCampaign
			}
		};
		sovValues.push(sov);
		this.createCampaignStatsForm(sovValues, reportModel);
		this.textBlockValue = this.textBlocks.brandConversationsAndMentions;
		this.showNewTextBlock = true;
	}

	createParticipantGroupsDetails(participantGroupsDetails, reportModel) {
		this.campaignReportFormHeaderValues = [
			'statsName',
			'totalKeywordMentions',
			'totalHashtagMentions',
			'totalBrandMentions'
		];
		let groupValues = [];
		let groupDetails;

		participantGroupsDetails.forEach(group => {
			groupDetails = {
				name: '',
				statistics: {
					statsName: group.groupName,
					totalKeywordMentions: group.totalKeywordMentions,
					totalHashtagMentions: group.totalHashtagMentions,
					totalBrandMentions: group.totalBrandMentions
				}
			};
			groupValues.push(groupDetails);
		});
		this.createCampaignStatsForm(groupValues, reportModel);
		this.textBlockValue = this.textBlocks.participantByGroups;
		this.showNewTextBlock = true;
	}

	createCampaignStatsForm(campaignReport, reportModel) {
		let options = {};
		const formArray = [];
		this.selectedKeys = Object.keys(campaignReport[0]?.statistics);
		this.selectedReportModel = reportModel;

		campaignReport.forEach(stats => {
			options = {};
			options['name'] = [stats.name];
			this.selectedKeys.forEach(key => {
				options[key] = [stats?.statistics[key]];
			});
			const formGroup = this.formBuilder.group(options);
			formArray.push(formGroup);
		});

		this.campaignReportForm = this.formBuilder.group({report: this.formBuilder.array(formArray)});
	}

	createWhatsAppForm(campaignReport, reportModel) {
		let options = {};
		const formArray = [];
		const statsInfo = [
			{
				name: '',
				statistics: {
					reactions: 0,
					comments: 0,
					engagement: 0,
					entries: 0,
					completedCount: 0,
					totalPost: 0,
					percentage: 0
				}
			}
		];
		this.selectedKeys = campaignReport[0]?.statistics
			? Object.keys(campaignReport[0].statistics)
			: Object.keys(statsInfo[0].statistics);
		this.selectedReportModel = reportModel;

		const report = campaignReport[0]?.statistics ? campaignReport : statsInfo;

		report.forEach(stats => {
			options = {};
			options['name'] = [stats.name];
			this.selectedKeys.forEach(key => {
				options[key] = [stats.statistics[key]];
			});
			const formGroup = this.formBuilder.group(options);
			formArray.push(formGroup);
		});

		this.campaignReport2Form = this.formBuilder.group({report: this.formBuilder.array(formArray)});
	}

	createWordCloudForm(campaignReport, reportModel) {
		let options = {};
		const formArray = [];
		this.selectedKeys = Object.keys(campaignReport[0].statistics);
		this.selectedReportModel = reportModel;

		campaignReport.forEach(stats => {
			options = {};
			options['name'] = [stats.name];
			this.selectedKeys.forEach(key => {
				options[key] = [stats.statistics[key]];
			});
			const formGroup = this.formBuilder.group(options);
			formArray.push(formGroup);
		});
		this.campaignReport2Form = this.formBuilder.group({report: this.formBuilder.array(formArray)});
	}

	removeFormControlField(campaignForm, index) {
		let campaignArray = campaignForm.controls.report as FormArray;
		campaignArray.removeAt(index);
	}

	addFormControl(campaignReportForm) {
		let campaignArray = campaignReportForm.controls.report as FormArray;
		let lenOfReportArray = campaignArray.length;
		const options = {};
		options['name'] = [''];
		this.selectedKeys.forEach(key => {
			options[key] = [''];
		});

		let newCampaignReportGroup: FormGroup = this.formBuilder.group(options);

		campaignArray.insert(lenOfReportArray, newCampaignReportGroup);
	}

	setFormControlFieldValue(fieldName, value, index) {
		let campaignArray = this.campaignReportForm.controls.report as FormArray;
		campaignArray.controls[index].get(fieldName).setValue(value);
	}

	optionSelected(event, campaignGroupForm) {
		const selectedSov = this.shareOfVoiceKeys.find(sov => sov.name === campaignGroupForm.get('statsName').value);
		this.selectedShareOfVoiceKeys.push(selectedSov);
		campaignGroupForm.get('statsName').setValue(event.statsName);
		campaignGroupForm.get('Before').setValue(event?.Before);
		campaignGroupForm.get('During').setValue(event?.During);
		campaignGroupForm.get('After').setValue(event?.After);
		this.selectedShareOfVoiceKeys = this.selectedShareOfVoiceKeys.filter(sov => sov.statsName !== event.statsName);
		this.selectedShareOfVoiceKeys = _.orderBy(this.selectedShareOfVoiceKeys, ['value'], ['desc']);
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

	openAllPostsGallery(previewImage) {
		if (this.isLongPressingEnabled) {
			return;
		}
		const images = [];
		let selectedIndex = 0;
		this.reportCampaignHighlights.forEach(post => {
			if (post.statistics?.url) {
				images.push({src: post.statistics?.url, type: 'image'});
			}
		});
		images.forEach((image, index) => {
			if (image.src === previewImage) {
				selectedIndex = index;
			}
		});
		this.openImageGallery(selectedIndex, images);
	}

	openImageGallery(index: number, previewImage): void {
		this.disableScrolling();
		document.body.classList.add('special-class');

		this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(event => this._onReceivedEvent(event));

		this.lightbox.open(previewImage, index, {
			centerVertically: false,
			enableTransition: false,
			resizeDuration: '0',
			disableScrolling: false,
			fitImageInViewPort: false
		});
	}

	async saveCampaignReportModel(selectedReportModel) {
		switch (selectedReportModel) {
			case 'campaignStats':
				{
					this.campaignStatsInfo = this.getReportModelValues(this.campaignReportForm);
					this.campaignStatsInfo = this.campaignStatsInfo.filter(stats => stats.name);
					this.campaignStatsInfo.forEach(stats => {
						stats['statistics'].percentage =
							+stats['statistics'].totalPost > 0
								? this.getRoundedValue(+stats['statistics'].completedCount, +stats['statistics'].totalPost)
								: 0;
					});
					this.setCampaignStatistics(
						this.campaignStatistics[0].statistics.totalPosts,
						this.campaignStatistics[0].statistics,
						this.campaignStatsInfo
					);
					let whatsAppStatsInfo = this.getReportModelValues(this.campaignReport2Form);
					whatsAppStatsInfo = whatsAppStatsInfo.filter(stats => stats.name);
					if (whatsAppStatsInfo?.length > 0) {
						this.whatsAppStatsInfo = whatsAppStatsInfo;
						this.whatsAppStatsInfo.forEach(stats => {
							stats['statistics'].percentage =
								+stats['statistics'].totalPost > 0
									? this.getRoundedValue(+stats['statistics'].completedCount, +stats['statistics'].totalPost)
									: 0;
						});
						this.setCampaignStatistics(
							this.campaignStatistics[1].statistics.totalPosts,
							this.campaignStatistics[1].statistics,
							this.whatsAppStatsInfo
						);
					}
					this.textBlocks.campaignStats = this.textBlockValue;
				}
				break;
			case 'brandConvAndMent':
				{
					const brandConvAndMen = this.getReportModelValues(this.campaignReportForm);

					brandConvAndMen.forEach((conv, index) => {
						this.brandConversationsAndMentionsInfo[index].statistics.afterCampaign = +conv.statistics.After;
						this.brandConversationsAndMentionsInfo[index].statistics.duringCampaign = +conv.statistics.During;
						this.brandConversationsAndMentionsInfo[index].statistics.beforeCampaign = +conv.statistics.Before;
						const totalConversations = +conv.statistics.After + +conv.statistics.During + +conv.statistics.Before;
						(this.brandConversationsAndMentionsInfo[index].statistics.isDuringCampaignIncreased =
							+conv.statistics.During - +conv.statistics.Before > -1),
							(this.brandConversationsAndMentionsInfo[index].statistics.afterCampaignPercentage = this.getRoundedValue(
								+conv.statistics.After,
								totalConversations
							));
						this.brandConversationsAndMentionsInfo[index].statistics.beforeCampaignPercentage = this.getRoundedValue(
							+conv.statistics.Before,
							totalConversations
						);
						this.brandConversationsAndMentionsInfo[index].statistics.duringCampaignPercentage = this.getRoundedValue(
							+conv.statistics.During,
							totalConversations
						);
					});

					this.setImpactOnBrandMentions();
					this.textBlocks.brandConversationsAndMentions = this.textBlockValue;
				}
				break;
			case 'wordCloud':
				{
					this.wordCloudWithOutCampaign = this.getReportModelValues(this.campaignReportForm);
					this.wordCloudWithOutCampaign = this.wordCloudWithOutCampaign.filter(keyword => keyword.name);
					this.wordCloudWithCampaign = this.getReportModelValues(this.campaignReport2Form);
					this.wordCloudWithCampaign = this.wordCloudWithCampaign.filter(keyword => keyword.name);
					this.setWordCloudData();

					this.textBlocks.wordCloud = this.textBlockValue;
				}
				break;
			case 'overallSnapshot':
				{
					const overallSnapshot = this.getReportModelValues(this.campaignReportForm);
					this.overallSnapshot = overallSnapshot.slice(0, 7);
					const postDistribution = overallSnapshot.slice(7, 9);
					const engagementMetrics = overallSnapshot.splice(9, 11);

					this.engagementDistribution.adminPosts = +engagementMetrics[0]?.statistics?.value;
					this.engagementDistribution.ugcPosts = +engagementMetrics[1]?.statistics?.value;

					this.engagementDistribution['totalPosts'] =
						this.engagementDistribution.adminPosts + this.engagementDistribution.ugcPosts;

					if (this.engagementDistribution['totalPosts'] > 0) {
						this.engagementDistribution['adminPercentage'] = Math.round(
							(this.engagementDistribution.adminPosts / this.engagementDistribution.totalPosts) * 100
						);
						this.engagementDistribution['ugcPercentage'] = Math.round(
							(this.engagementDistribution.ugcPosts / this.engagementDistribution.totalPosts) * 100
						);
					}

					let series = this.postDistribution.series;
					if (series.length === 0) {
						series = [
							{
								name: 'Admin Posts',
								data: [0]
							},
							{
								name: 'UGC Posts',
								data: [0]
							}
						];
					}
					if (series?.length > 0) {
						series[0].data = [+postDistribution[0]?.statistics?.value];
						series[1].data = [+postDistribution[1]?.statistics?.value];

						this.postDistribution.series = series;
						this.createCircularModel(this.postDistribution, series, this.postDistributionSeriesColors);
						this.postDistribution.isEmpty =
							this.postDistribution?.series.reduce((sum, key) => sum + (key.data ? +key.data[0] : 0), 0) === 0;
					}
					this.keywordMetricsArrayLength = Array.from({length: this.overallSnapshot.length / 4 + 1}, (v, i) => i);

					this.textBlocks.keyMetrics = this.textBlockValue;
				}
				break;
			case 'sentimentMap':
				{
					const sentimentMapValues = this.getReportModelValues(this.campaignReportForm);
					if (!this.beforeSentimentMaps) {
						this.beforeSentimentMaps = {dislikePercentage: 0, likePercentage: 0, neutralPercentage: 0};
					}

					if (!this.afterSentimentMaps) {
						this.afterSentimentMaps = {dislikePercentage: 0, likePercentage: 0, neutralPercentage: 0};
					}

					if (!this.duringSentimentMaps) {
						this.duringSentimentMaps = {dislikePercentage: 0, likePercentage: 0, neutralPercentage: 0};
					}

					this.beforeSentimentMaps.likePercentage = +sentimentMapValues[0].statistics.Like;
					this.beforeSentimentMaps.dislikePercentage = +sentimentMapValues[0].statistics.Dislike;
					this.beforeSentimentMaps.neutralPercentage = +sentimentMapValues[0].statistics.Neutral;

					this.afterSentimentMaps.likePercentage = +sentimentMapValues[1].statistics.Like;
					this.afterSentimentMaps.dislikePercentage = +sentimentMapValues[1].statistics.Dislike;
					this.afterSentimentMaps.neutralPercentage = +sentimentMapValues[1].statistics.Neutral;

					this.duringSentimentMaps.likePercentage = +sentimentMapValues[2].statistics.Like;
					this.duringSentimentMaps.dislikePercentage = +sentimentMapValues[2].statistics.Dislike;
					this.duringSentimentMaps.neutralPercentage = +sentimentMapValues[2].statistics.Neutral;

					this.textBlocks.sentimentMap = this.textBlockValue;
				}
				break;
			case 'shareOfVoice':
				{
					const editedSOVValues = this.getReportModelValues(this.campaignReportForm);
					this.setEditedValuesOfSOV(editedSOVValues);
					this.beforeSOV['actualSeries'][this.campaign.keywordBrand] = editedSOVValues[0].statistics.Before;
					this.afterSOV['actualSeries'][this.campaign.keywordBrand] = editedSOVValues[0].statistics.After;
					this.duringSOV['actualSeries'][this.campaign.keywordBrand] = editedSOVValues[0].statistics.During;
					this.setEmptyStatesOfSov();
					this.textBlocks.sov = this.textBlockValue;
				}
				break;
			case 'participantGroups':
				{
					const participantGroups = this.getReportModelValues(this.campaignReportForm);
					participantGroups.forEach((group, index) => {
						const groupDetails = this.participantGroupsDetails[index];
						if (groupDetails) {
							groupDetails.totalKeywordMentions = +group.statistics.totalKeywordMentions;
							groupDetails.totalHashtagMentions = +group.statistics.totalHashtagMentions;
							groupDetails.totalBrandMentions = +group.statistics.totalBrandMentions;
						} else {
							const details = {};
							details['groupName'] = group.statistics.statsName;
							details['totalKeywordMentions'] = +group.statistics.totalKeywordMentions;
							details['totalHashtagMentions'] = +group.statistics.totalHashtagMentions;
							details['totalBrandMentions'] = +group.statistics.totalBrandMentions;
							this.participantGroupsDetails.push(details);
						}
					});
					this.getParticipatingGroups();

					this.textBlocks.participantByGroups = this.textBlockValue;
				}
				break;
		}

		document.getElementById('cancel').click();
	}

	setEditedValuesOfSOV(editedSOVValues) {
		const beforeSeries = [];
		const afterSeries = [];
		const duringSeries = [];
		editedSOVValues.forEach(sov => {
			beforeSeries.push({name: sov.statistics.statsName, value: +sov.statistics.Before});
			afterSeries.push({name: sov.statistics.statsName, value: +sov.statistics.After});
			duringSeries.push({name: sov.statistics.statsName, value: +sov.statistics.During});
		});
		this.selectedShareOfVoiceKeys.forEach(sov => {
			beforeSeries.push({name: sov.statsName, value: +sov.Before});
			afterSeries.push({name: sov.statsName, value: +sov.After});
			duringSeries.push({name: sov.statsName, value: +sov.During});
		});

		let total = beforeSeries.reduce((sum, sov) => sum + +sov.value, 0);
		let series = this.setSovGraphMetrics(beforeSeries, total);
		this.beforeSOV.series = series;
		this.createCircularModel(this.beforeSOV, series.graphSeries, this.shareOfVoiceColors);

		total = afterSeries.reduce((sum, sov) => sum + +sov.value, 0);
		series = this.setSovGraphMetrics(afterSeries, total);
		this.afterSOV.series = series;
		this.createCircularModel(this.afterSOV, series.graphSeries, this.shareOfVoiceColors);

		total = duringSeries.reduce((sum, sov) => sum + +sov.value, 0);
		series = this.setSovGraphMetrics(duringSeries, total);
		this.duringSOV.series = series;
		const sovKeyMetricIndex = this.overallSnapshot.findIndex(keyMetric => keyMetric.name === 'Share of Voice');
		this.overallSnapshot[sovKeyMetricIndex].statistics.value = series?.graphSeries[0]?.data;
		this.createCircularModel(this.duringSOV, series.graphSeries, this.shareOfVoiceColors);
	}

	setImpactValue(campaignGroupForm) {
		if (campaignGroupForm.get('beforeCampaign').value && campaignGroupForm.get('duringCampaign').value) {
			const beforeCampaign = Number(campaignGroupForm.get('beforeCampaign').value);
			const duringCampaign = Number(campaignGroupForm.get('duringCampaign').value);
			campaignGroupForm.get('isDuringCampaignIncreased').setValue(duringCampaign - beforeCampaign > -1);
			if (beforeCampaign > 0) {
				campaignGroupForm.get('impact').setValue(Math.round(duringCampaign / beforeCampaign));
			} else {
				campaignGroupForm.get('impact').setValue(duringCampaign);
			}
		}
	}

	getReportModelValues(campaignReportForm) {
		let campaignReportArray = campaignReportForm.controls.report as FormArray;
		let lenOfReportArray = campaignReportArray.length;
		const keywordMentionVolumeInfo = [];
		for (let i = 0; i < lenOfReportArray; i++) {
			const campaignStat = campaignReportArray.at(i);
			let stats = {};
			stats['name'] = campaignStat.get('name').value;
			stats['statistics'] = {};
			this.selectedKeys.forEach(key => {
				stats['statistics'][key] = campaignStat.get(key).value;
			});
			keywordMentionVolumeInfo.push(stats);
		}
		return keywordMentionVolumeInfo;
	}

	closeCampaignDetail() {
		this.campaign = this.campaignDetails;
	}

	private getRoundedValue(value, total) {
		return total > 0 ? Math.round((+value * 100) / +total) : 0;
	}
}
