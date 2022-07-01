import {Component, HostListener, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {BarChartModel} from '@sharedModule/models/group-reports/chart.model';
import {FileService} from '@sharedModule/services/file.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import * as _ from 'lodash';
import {Lightbox, LIGHTBOX_EVENT, LightboxEvent} from 'ngx-lightbox';
import {Subscription} from 'rxjs';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {WordCloudService} from 'src/app/shared/services/word-cloud.service';

declare const TextDecoder;

@Component({
	selector: 'app-community-marketing-campaign-report',
	templateUrl: './community-marketing-campaign-report.component.html',
	styleUrls: ['./community-marketing-campaign-report.component.scss']
})
export class CommunityMarketingCampaignReportComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() isFromBrand = false;
	isReportEdit = true;
	campaignDetails;
	isPublishing = false;
	isCampaignHasS3Url = false;
	previousEntryValue = 0;
	private _subscription: Subscription;

	overallSnapshot = [
		{name: 'Total groups', statistics: {value: 0}},
		{name: 'Total posts', statistics: {value: 0}},
		{name: 'Total influencers', statistics: {value: 0}},
		{name: 'Total reach', statistics: {value: 0}},
		{name: 'Total engagement', statistics: {value: 0}},
		{name: 'Total sub-category conversations', statistics: {value: 0}},
		{name: 'Total brand conversations', statistics: {value: 0}},
		{name: 'Total entries', statistics: {value: 0}}
	];
	campaignStatsInfo = [];
	platFormSummaryInfo = [
		{
			name: 'Facebook',
			statistics: {
				postsPlanned: 0,
				postsDone: 0,
				reactions: 0,
				comments: 0,
				engagement: 0,
				conversations: 0,
				isHidden: false
			}
		},
		{
			name: 'WhatsApp',
			statistics: {
				postsPlanned: 0,
				postsDone: 0,
				reactions: 'NA',
				comments: 'NA',
				engagement: 'NA',
				conversations: 0,
				isHidden: false
			}
		}
	];
	keywordMentionVolumeInfo = [];
	brandConversationsAndMentionsInfo = [
		{
			name: 'Brand Conversations',
			statistics: {beforeCampaign: 0, duringCampaign: 0, isDuringCampaignIncreased: true, impact: 0}
		},
		{
			name: 'Brand Mentions',
			statistics: {beforeCampaign: 0, duringCampaign: 0, isDuringCampaignIncreased: true, impact: 0}
		}
	];
	topEngagingCommunities = [];
	topPostsScreenshotsInfo = [];
	allPosts = [];
	engagementScreenshotsInfo = [];
	wordCloudWithOutCampaign = [];
	wordCloudWithCampaign = [];
	subCatConvCounts = [];
	campaignReportForm: FormGroup;
	campaignReport2Form: FormGroup;
	selectedKeys;
	selectedReportModel = '';
	topKeywordsReportData = {reportData: {chartOptions: new BarChartModel().chartOptions}};
	totalCampaignStats = {reactions: 0, comments: 0, engagement: 0, entries: 0};
	totalPlatformSummary = {postsPlanned: 0, postsDone: 0, reactions: 0, comments: 0, engagement: 0, conversations: 0};
	withCampaign;
	withOutCampaign;
	isCampaignSummaryEditable = false;
	campaignSummary = '';
	showSubCatConvCount = false;
	subCatConvCountKeys = [];
	hidePlatformData = false;
	isTopPostsLoading = false;
	isAllPostsLoading = false;
	transformedKeywords = [];
	chunckSize = 20;
	selectedPostIndex = 0;
	selectedTopPostIndex = 0;
	isAuthTokenExpired = false;
	isLongPressingEnabled = false;
	isRefreshingAllPosts = false;
	numberOfSelectedPosts = 0;
	isTopPostsLongPressingEnabled = false;
	isRefreshingTopPosts = false;
	numberOfSelectedTopPosts = 0;
	@HostListener('scroll', ['$event'])
	scrollAllPostHandler(event) {
		if (
			event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 50 &&
			!this.isAllPostsLoading
		) {
			this.getScreenshotsFromPostIds();
		}
	}
	scrollTopPostHandler(event) {
		if (
			event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 50 &&
			!this.isTopPostsLoading
		) {
			this.getScreenshotsFromTopPostIds();
		}
	}

	constructor(
		injector: Injector,
		private readonly fileService: FileService,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private wordCloudService: WordCloudService,
		private loggerService: LoggerService,
		private readonly lightbox: Lightbox,
		private _lightboxEvent: LightboxEvent
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		const keywords = this.campaign['keywords'] ? this.campaign['keywords'] : [];
		this.transformedKeywords = [];
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
		this.createTopKeywordDataModel();
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	async getReportMetrics() {
		try {
			const reportMetrics = await this.createCampaignService.getCmcReportMetrics(this.campaign.campaignId);
			if (reportMetrics) {
				this.overallSnapshot = [
					{name: 'Total groups', statistics: {value: reportMetrics.totalGroups}},
					{name: 'Total posts', statistics: {value: reportMetrics.numOfCampaignPost}},
					{name: 'Total influencers', statistics: {value: reportMetrics.numOfInfluencer}},
					{name: 'Total reach', statistics: {value: reportMetrics.totalReach}},
					{
						name: 'Total engagement',
						statistics: {
							value:
								Number(reportMetrics.totalReactions) +
								Number(reportMetrics.totalComments) +
								Number(reportMetrics.totalBrandConv)
						}
					},
					{name: 'Total sub-category conversations', statistics: {value: reportMetrics.totalSubCatConv}},
					{name: 'Total brand conversations', statistics: {value: reportMetrics.totalBrandConv}},
					{name: 'Total entries', statistics: {value: 0}}
				];
				this.brandConversationsAndMentionsInfo = [
					{
						name: 'Brand Conversations',
						statistics: {
							beforeCampaign: reportMetrics['beforeBrandConv'],
							duringCampaign: reportMetrics['duringBrandConv'],
							isDuringCampaignIncreased:
								Number(reportMetrics['duringBrandConv']) - Number(reportMetrics['beforeBrandConv']) > -1,
							impact: 0
						}
					},
					{
						name: 'Brand Mentions',
						statistics: {
							beforeCampaign: reportMetrics['beforeBrandMntn'],
							duringCampaign: reportMetrics['duringBrandMntn'],
							isDuringCampaignIncreased:
								Number(reportMetrics['duringBrandMntn']) - Number(reportMetrics['beforeBrandMntn']) > -1,
							impact: 0
						}
					}
				];
				this.brandConversationsAndMentionsInfo.forEach(info => {
					const beforeCampaign = Number(info.statistics.beforeCampaign);
					const duringCampaign = Number(info.statistics.duringCampaign);
					if (beforeCampaign > 0) {
						info.statistics.impact = Math.round(duringCampaign / beforeCampaign);
					} else {
						info.statistics.impact = duringCampaign;
					}
				});
				this.setSubCatConvCounts(reportMetrics);
				this.setPlatformSummary(reportMetrics);
				this.setKeywordMetrics(reportMetrics);
				if (reportMetrics['groupEngagementScore']) {
					this.setTopEngagementCommunities(reportMetrics);
				}
				if (reportMetrics.phaseMetrics) {
					this.setCampaignStatsMetrics(reportMetrics);
				}

				if (reportMetrics['phaseScreenShots']) {
					this.setTopPosts(reportMetrics);
				}
				if (reportMetrics['postSourceIds']) {
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
	}

	setSubCatConvCounts(reportMetrics) {
		if (reportMetrics.subCatConvCounts) {
			this.subCatConvCounts = JSON.parse(reportMetrics['subCatConvCounts']);
			this.subCatConvCountKeys = Object.keys(this.subCatConvCounts);
			for (let key of this.subCatConvCountKeys) {
				if (_.isEmpty(this.subCatConvCounts[key])) {
					delete this.subCatConvCounts[key];
				}
			}
		}
	}

	setPlatformSummary(reportMetrics) {
		this.platFormSummaryInfo[0].statistics.postsPlanned = reportMetrics.numOfCampaignPost;
		this.platFormSummaryInfo[0].statistics.postsDone = reportMetrics.numDoneTask;
		this.platFormSummaryInfo[0].statistics.reactions = reportMetrics.totalReactions ? reportMetrics.totalReactions : 0;
		this.platFormSummaryInfo[0].statistics.comments = reportMetrics.totalComments ? reportMetrics.totalComments : 0;
		this.platFormSummaryInfo[0].statistics.engagement =
			Number(this.platFormSummaryInfo[0].statistics.reactions) +
			Number(this.platFormSummaryInfo[0].statistics.comments) +
			Number(reportMetrics.totalBrandConv);
		this.platFormSummaryInfo[0].statistics.conversations = reportMetrics.totalBrandConv;
		this.setPlatFormSummaryTotal();
	}

	setCampaignStatsMetrics(reportMetrics) {
		const phaseMetrics = JSON.parse(reportMetrics.phaseMetrics);
		this.campaignStatsInfo = [];
		for (let key of Object.keys(phaseMetrics)) {
			const statsInfo = {name: '', statistics: {reactions: 0, comments: 0, engagement: 0, entries: 0}};
			statsInfo['name'] = key;
			statsInfo['statistics'].reactions = phaseMetrics[key].reactions ? phaseMetrics[key].reactions : 0;
			statsInfo['statistics'].comments = phaseMetrics[key].commentCount ? phaseMetrics[key].commentCount : 0;
			statsInfo['statistics'].engagement = statsInfo['statistics'].reactions + statsInfo['statistics'].comments;
			this.campaignStatsInfo.push(statsInfo);
		}
		this.setCampaignStatsTotal();
	}

	setKeywordMetrics(reportMetrics) {
		const beforeCampaignKw = reportMetrics.beforeKwCount ? JSON.parse(reportMetrics.beforeKwCount) : {};
		const duringCampaignKw = reportMetrics.duringKwCount ? JSON.parse(reportMetrics.duringKwCount) : {};
		const postCampaignKw = reportMetrics.afterKwCount ? JSON.parse(reportMetrics.afterKwCount) : {};
		const keywordVolume = {};
		this.keywordMentionVolumeInfo = [];
		for (let key of Object.keys(beforeCampaignKw)) {
			const referredKey = key.toLowerCase();
			if (keywordVolume.hasOwnProperty(referredKey)) {
				keywordVolume[referredKey]['beforeCampaign'] += Number(beforeCampaignKw[key]);
			} else {
				keywordVolume[referredKey] = {};
				keywordVolume[referredKey]['beforeCampaign'] = Number(beforeCampaignKw[key]);
				keywordVolume[referredKey]['duringCampaign'] = 0;
				keywordVolume[referredKey]['postCampaign'] = 0;
			}
		}
		for (let key of Object.keys(duringCampaignKw)) {
			const referredKey = key.toLowerCase();
			if (keywordVolume.hasOwnProperty(referredKey)) {
				keywordVolume[referredKey]['duringCampaign'] += Number(duringCampaignKw[key]);
			} else {
				keywordVolume[referredKey] = {};
				keywordVolume[referredKey]['duringCampaign'] = Number(duringCampaignKw[key]);
				keywordVolume[referredKey]['beforeCampaign'] = 0;
				keywordVolume[referredKey]['postCampaign'] = 0;
			}
		}
		for (let key of Object.keys(postCampaignKw)) {
			const referredKey = key.toLowerCase();
			if (keywordVolume.hasOwnProperty(referredKey)) {
				keywordVolume[referredKey]['postCampaign'] += Number(postCampaignKw[key]);
			} else {
				keywordVolume[referredKey] = {};
				keywordVolume[referredKey]['postCampaign'] = Number(postCampaignKw[key]);
				keywordVolume[referredKey]['beforeCampaign'] = 0;
				keywordVolume[referredKey]['duringCampaign'] = 0;
			}
		}

		for (let key of Object.keys(keywordVolume)) {
			const communityModel = {
				name: key?.split('_')[0],
				statistics: {
					beforeCampaign: keywordVolume[key]['beforeCampaign'],
					duringCampaign: keywordVolume[key]['duringCampaign'],
					duringCampaignRate: '',
					isDuringCampaignIncreased:
						Number(keywordVolume[key]['duringCampaign']) - Number(keywordVolume[key]['beforeCampaign']) > -1,
					postCampaign: keywordVolume[key]['postCampaign'],
					postCampaignRate: '',
					isPostCampaignIncreased:
						Number(keywordVolume[key]['postCampaign']) - Number(keywordVolume[key]['duringCampaign']) > -1
				}
			};
			this.keywordMentionVolumeInfo.push(communityModel);
		}

		this.keywordMentionVolumeInfo.forEach(info => {
			const beforeCampaign = Number(info.statistics.beforeCampaign);
			const duringCampaign = Number(info.statistics.duringCampaign);
			const postCampaign = Number(info.statistics.postCampaign);
			if (beforeCampaign > 0) {
				const percentage = (duringCampaign / beforeCampaign) * 100;
				if (percentage.toString().indexOf('.') > -1) {
					info.statistics.duringCampaignRate = percentage.toFixed();
				} else {
					info.statistics.duringCampaignRate = percentage;
				}
			} else {
				info.statistics.duringCampaignRate = duringCampaign;
			}

			if (postCampaign > 0) {
				const percentage = (postCampaign / duringCampaign) * 100;
				if (percentage.toString().indexOf('.') > -1) {
					info.statistics.postCampaignRate = percentage.toFixed();
				} else {
					info.statistics.postCampaignRate = percentage;
				}
			} else {
				info.statistics.postCampaignRate = postCampaign;
			}
		});
	}

	setTopEngagementCommunities(reportMetrics) {
		this.topEngagingCommunities = [];
		const topEngagingCommunities = JSON.parse(reportMetrics['groupEngagementScore']);
		for (let key of Object.keys(topEngagingCommunities)) {
			const topCommunity = {name: key, statistics: {value: topEngagingCommunities[key]}};
			this.topEngagingCommunities.push(topCommunity);
		}
		this.topEngagingCommunities = _.orderBy(this.topEngagingCommunities, ['statistics.value'], ['desc']);
		this.createTopKeywordDataModel();
	}

	setTopPosts(reportMetrics) {
		this.topPostsScreenshotsInfo = [];
		const phaseScreenShots = JSON.parse(reportMetrics['phaseScreenShots']);

		for (let key of Object.keys(phaseScreenShots)) {
			const posts = phaseScreenShots[key];
			for (let value of posts) {
				const topCommunity = {name: '', statistics: {screenshot: value, caption: ''}};
				this.topPostsScreenshotsInfo.push(topCommunity);
			}
		}

		if (this.topPostsScreenshotsInfo) {
			this.getScreenshotsFromTopPostIds();
		}
	}

	setAllPosts(reportMetrics) {
		this.allPosts = [];
		const allPosts = JSON.parse(reportMetrics['postSourceIds']);

		for (let value of allPosts) {
			if (value.id) {
				const topCommunity = {name: '', statistics: {screenshot: value.id, caption: ''}};
				this.allPosts.push(topCommunity);
			}
		}
		if (this.allPosts) {
			this.getScreenshotsFromPostIds();
		}
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
			this.platFormSummaryInfo = campaignReportData['platFormSummaryInfo'];
			this.keywordMentionVolumeInfo = campaignReportData['keywordMentionVolumeInfo'];
			this.brandConversationsAndMentionsInfo = campaignReportData['brandConversationsAndMentionsInfo'];
			this.topEngagingCommunities = campaignReportData['topEngagingCommunities'];
			this.topPostsScreenshotsInfo = campaignReportData['topPostsScreenshotsInfo'];
			this.engagementScreenshotsInfo = campaignReportData['engagementScreenshotsInfo'];
			this.wordCloudWithOutCampaign = campaignReportData['wordCloudWithOutCampaign'];
			this.wordCloudWithCampaign = campaignReportData['wordCloudWithCampaign'];
			this.subCatConvCounts = campaignReportData['subCatConvCounts'];
			this.allPosts = campaignReportData['allPosts'];
			this.getScreenshotsFromPostIds();
			this.getScreenshotsFromTopPostIds();
			if (this.subCatConvCounts) {
				this.subCatConvCountKeys = Object.keys(this.subCatConvCounts);
			}
			this.createTopKeywordDataModel();
			this.setWordCloudData();
			this.setCampaignStatsTotal();
			this.setPlatFormSummaryTotal();
			this.keywordMentionVolumeInfo.forEach(keyword => {
				keyword.name = keyword?.name?.split('_')[0];
			});
			let sumOfStatistics = 0;

			this.platFormSummaryInfo.forEach(platformInfo => {
				let sum = 0;
				_.forEach(platformInfo.statistics, stats => {
					sum += stats !== 'NA' ? Number(stats) : 0;
				});
				platformInfo.statistics.isHidden = sum === 0;
				sumOfStatistics += sum;
			});

			this.hidePlatformData = sumOfStatistics === 0;
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
		this.createWordCloudDataModel({beforeWC: JSON.stringify(beforeWC), duringWC: JSON.stringify(duringWC)});
	}

	async uploadToS3() {
		this.isPublishing = true;
		let campaignDetails = {};
		campaignDetails['overallSnapshot'] = this.overallSnapshot;
		campaignDetails['campaignStatsInfo'] = this.campaignStatsInfo;
		campaignDetails['platFormSummaryInfo'] = this.platFormSummaryInfo;
		campaignDetails['keywordMentionVolumeInfo'] = this.keywordMentionVolumeInfo;
		campaignDetails['brandConversationsAndMentionsInfo'] = this.brandConversationsAndMentionsInfo;
		campaignDetails['topEngagingCommunities'] = this.topEngagingCommunities;
		campaignDetails['topPostsScreenshotsInfo'] = this.topPostsScreenshotsInfo;
		campaignDetails['engagementScreenshotsInfo'] = this.engagementScreenshotsInfo;
		campaignDetails['wordCloudWithOutCampaign'] = this.wordCloudWithOutCampaign;
		campaignDetails['wordCloudWithCampaign'] = this.wordCloudWithCampaign;
		campaignDetails['subCatConvCounts'] = this.subCatConvCounts;
		campaignDetails['allPosts'] = this.allPosts;
		campaignDetails = encodeURIComponent(JSON.stringify(campaignDetails));
		let key;
		if (this.campaign['s3ReportUrl']) {
			key = await this.fileService.uploadCampaignReportToS3(
				campaignDetails,
				'campaign',
				null,
				this.campaign['s3ReportUrl']
			);
			this.alert.success('Brand can now see the changes you have made', 'Report updated successfully', 5000, true);
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
		campaignCreateInput['campaignBriefForCommunityAdmin'] = this.campaign['details'];
		campaignCreateInput['startDateAtUTC'] = this.campaign['startDateAtUTC'];
		campaignCreateInput['endDateAtUTC'] = this.campaign['endDateAtUTC'];
		campaignCreateInput['objective'] = this.campaign['objective'];
		campaignCreateInput['keywordCategory'] = this.campaign['keywordCategory'];
		campaignCreateInput['keywordBrand'] = this.campaign['keywordBrand'];
		campaignCreateInput['keywords'] = this.campaign['keywords'];
		campaignCreateInput['campaignSummary'] = this.campaign['campaignSummary'];
		campaignCreateInput['proposalEmails'] = this.campaign['proposalEmails'];
		campaignCreateInput['cmcReportName'] = this.campaign['cmcReportName'];
		campaignCreateInput['titleTask'] = this.campaign['titleTask'];
		campaignCreateInput['campaignPeriod'] = this.campaign['campaignPeriod'];
		campaignCreateInput['s3ReportUrl'] = key;
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
			.slice(0, 50)
			.forEach(ele => (sortedObject[ele[0]] = ele[1]));

		return sortedObject;
	}

	createTopKeywordDataModel() {
		this.topKeywordsReportData.reportData.chartOptions = new BarChartModel().chartOptions;
		let topEngagingCommunities = this.topEngagingCommunities.filter(topCommunity => topCommunity?.statistics?.value);
		topEngagingCommunities = _.orderBy(topEngagingCommunities, ['statistics.value'], ['desc']);
		const categories = [];
		const series = [
			{
				name: 'Engagement Volume',
				color: '#2EAADF',
				stack: '',
				data: []
			}
		];

		const engagingCommunities = topEngagingCommunities.slice(0, 15);

		engagingCommunities.forEach(community => {
			categories.push(community.name);
			series[0].data.push(community.statistics.value);
		});

		this.topKeywordsReportData.reportData.chartOptions.xAxis.categories = categories;
		this.topKeywordsReportData.reportData.chartOptions.series = series;
		this.topKeywordsReportData.reportData.chartOptions.yAxis.title.text = 'Keyword Volume';
	}

	addNewCampaignStats() {
		if (this.campaignStatsInfo.length > 0) {
			this.createCampaignStatsForm(this.campaignStatsInfo, 'campaignStats');
		} else {
			const communityModel = [{name: '', statistics: {reactions: 0, comments: 0, engagement: 0, entries: 0}}];
			this.createCampaignStatsForm(communityModel, 'campaignStats');
		}
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

	addNewTopEngagingCommunity() {
		if (this.topEngagingCommunities.length > 0) {
			this.createCampaignStatsForm(this.topEngagingCommunities, 'topEngagingCommunities');
		} else {
			const communityModel = [{name: '', statistics: {value: 0}}];
			this.createCampaignStatsForm(communityModel, 'topEngagingCommunities');
		}
	}

	addNewTopPostScreenshot() {
		if (this.topPostsScreenshotsInfo.length > 0) {
			this.createCampaignStatsForm(this.topPostsScreenshotsInfo, 'topPostsScreenshots');
		} else {
			const communityModel = [{name: '', statistics: {screenshot: '', caption: ''}}];
			this.createCampaignStatsForm(communityModel, 'topPostsScreenshots');
		}
	}

	addNewEngagementScreenshot() {
		if (this.engagementScreenshotsInfo.length > 0) {
			this.createCampaignStatsForm(this.engagementScreenshotsInfo, 'engagementScreenshots');
		} else {
			const communityModel = [{name: '', statistics: {screenshot: '', caption: ''}}];
			this.createCampaignStatsForm(communityModel, 'engagementScreenshots');
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
	}

	setTotalEngagement() {
		let campaignArray = this.campaignReportForm.controls.report as FormArray;
		const totalEngagement = campaignArray.controls[4].get('value').value;
		const totalEntries = campaignArray.controls[7].get('value').value;
		const value = Number(totalEngagement) - this.previousEntryValue + Number(totalEntries);
		this.previousEntryValue = Number(totalEntries);
		campaignArray.controls[4].get('value').setValue(value);
	}

	createCampaignStatsForm(campaignReport, reportModel) {
		let options = {};
		const formArray = [];
		this.selectedKeys = Object.keys(campaignReport[0].statistics);
		this.selectedReportModel = reportModel;

		if (reportModel === 'overallSnapshot') {
			const totalEntryKey = campaignReport.filter(report => report.name === 'Total entries');
			this.previousEntryValue = totalEntryKey[0]?.statistics.value;
		}

		campaignReport.forEach(stats => {
			options = {};
			options['name'] = [stats.name];
			this.selectedKeys.forEach(key => {
				options[key] = [stats.statistics[key]];
			});
			const formGroup = this.formBuilder.group(options);
			formArray.push(formGroup);
		});
		this.campaignReportForm = this.formBuilder.group({report: this.formBuilder.array(formArray)});
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

	openTopPostsGallery(previewImage) {
		if (this.isTopPostsLongPressingEnabled) {
			return;
		}
		const images = [];
		let selectedIndex = 0;
		this.topPostsScreenshotsInfo.forEach(post => {
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

	openAllPostsGallery(previewImage) {
		if (this.isLongPressingEnabled) {
			return;
		}
		const images = [];
		let selectedIndex = 0;
		this.allPosts.forEach(post => {
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

	private _onReceivedEvent(event: any): void {
		// remember to unsubscribe the event when lightbox is closed
		if (event.id === LIGHTBOX_EVENT.CLOSE) {
			// event CLOSED is fired
			this._subscription.unsubscribe();
			this.enableScrolling();
			this.lightbox.close();
		}
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
					this.campaignStatsInfo = this.campaignStatsInfo.filter(statsInfo => statsInfo.name);
					this.setCampaignStatsTotal();
				}
				break;
			case 'platformSummary':
				{
					this.platFormSummaryInfo = this.getReportModelValues(this.campaignReportForm);
					this.setPlatFormSummaryTotal();
				}
				break;
			case 'keywordMentionVolume':
				{
					this.keywordMentionVolumeInfo = this.getReportModelValues(this.campaignReportForm);
					this.keywordMentionVolumeInfo = this.keywordMentionVolumeInfo.filter(keyword => keyword.name);
					this.keywordMentionVolumeInfo.forEach(keyword => {
						keyword.name = keyword?.name?.split('_')[0];
					});
				}
				break;
			case 'brandConversationsAndMentions':
				{
					this.brandConversationsAndMentionsInfo = this.getReportModelValues(this.campaignReportForm);
				}
				break;
			case 'topEngagingCommunities':
				{
					this.topEngagingCommunities = this.getReportModelValues(this.campaignReportForm);
					this.topEngagingCommunities = this.topEngagingCommunities.filter(engagement => engagement.name);
					this.topEngagingCommunities = _.orderBy(this.topEngagingCommunities, ['statistics.value'], ['desc']);
					this.createTopKeywordDataModel();
				}
				break;
			case 'topPostsScreenshots':
				{
					this.topPostsScreenshotsInfo = this.getReportModelValues(this.campaignReportForm);
					this.topPostsScreenshotsInfo = this.topPostsScreenshotsInfo.filter(post => post.statistics.screenshot);
				}
				break;
			case 'engagementScreenshots':
				{
					this.engagementScreenshotsInfo = this.getReportModelValues(this.campaignReportForm);
					this.engagementScreenshotsInfo = this.engagementScreenshotsInfo.filter(
						engagement => engagement.statistics.screenshot
					);
				}
				break;
			case 'wordCloud':
				{
					this.wordCloudWithOutCampaign = this.getReportModelValues(this.campaignReportForm);
					this.wordCloudWithOutCampaign = this.wordCloudWithOutCampaign.filter(keyword => keyword.name);
					this.wordCloudWithCampaign = this.getReportModelValues(this.campaignReport2Form);
					this.wordCloudWithCampaign = this.wordCloudWithCampaign.filter(keyword => keyword.name);
					this.setWordCloudData();
				}
				break;
			case 'overallSnapshot':
				{
					this.overallSnapshot = this.getReportModelValues(this.campaignReportForm);
				}
				break;
			case 'allPosts':
				{
					this.allPosts = this.getReportModelValues(this.campaignReportForm);
					this.allPosts = this.allPosts.filter(post => post.statistics.screenshot);
					this.getScreenshotsFromPostIds();
				}
				break;
		}

		document.getElementById('cancel').click();
	}

	async getScreenshotsFromTopPostIds() {
		this.isTopPostsLoading = true;
		const calls = [];
		const posts = this.topPostsScreenshotsInfo.slice(
			this.selectedTopPostIndex,
			this.selectedTopPostIndex + this.chunckSize
		);

		posts.forEach(topPost => {
			calls.push(
				this.createCampaignService.getScreenshotsFromPostIds({
					sourceId: topPost.statistics.screenshot,
					commentEnable: false
				})
			);
		});

		const response = await Promise.all(calls);

		if (response && posts?.length > 0) {
			response.forEach((url, index) => {
				if (url?.status !== 401) {
					this.topPostsScreenshotsInfo[this.selectedTopPostIndex + index].statistics['url'] = url?.location;
					this.topPostsScreenshotsInfo[this.selectedTopPostIndex + index].statistics['errorType'] = url?.errorType;
				} else {
					this.isAuthTokenExpired = true;
				}
			});
			this.selectedTopPostIndex += this.chunckSize;
		}

		this.isTopPostsLoading = false;
	}

	async getScreenshotsFromPostIds() {
		this.isAllPostsLoading = true;
		const calls = [];
		const posts = this.allPosts.slice(this.selectedPostIndex, this.selectedPostIndex + this.chunckSize);

		posts.forEach(topPost => {
			calls.push(
				this.createCampaignService.getScreenshotsFromPostIds({
					sourceId: topPost.statistics.screenshot,
					commentEnable: false
				})
			);
		});

		const response = await Promise.all(calls);

		if (response && posts?.length > 0) {
			response.forEach((url, index) => {
				if (url?.status !== 401) {
					this.allPosts[this.selectedPostIndex + index].statistics['url'] = url?.location;
					this.allPosts[this.selectedPostIndex + index].statistics['errorType'] = url?.errorType;
				} else {
					this.isAuthTokenExpired = true;
				}
			});
			this.selectedPostIndex += this.chunckSize;
		}

		this.isAllPostsLoading = false;
	}

	async refreshPostScreenshotUrl(postsToBeSelected, isTopPosts) {
		if (isTopPosts) {
			this.isRefreshingTopPosts = true;
		} else {
			this.isRefreshingAllPosts = true;
		}
		const calls = [];
		const posts = postsToBeSelected.filter(post => post['isSelected'] === true);

		posts.forEach(topPost => {
			topPost['isLoading'] = true;
			calls.push(
				this.createCampaignService.getScreenshotsFromPostIds({
					sourceId: topPost.statistics.screenshot,
					commentEnable: false,
					forceRefresh: true
				})
			);
		});

		const response = await Promise.all(calls);

		if (response && posts?.length > 0) {
			response.forEach((url, index) => {
				if (url?.status !== 401) {
					posts[index].statistics['url'] = url?.location;
					posts[index].statistics['errorType'] = url?.errorType;
				} else {
					this.isAuthTokenExpired = true;
				}
				posts[index]['isLoading'] = false;
				posts[index]['isSelected'] = false;
			});
		}
		if (isTopPosts) {
			this.isRefreshingTopPosts = false;
			this.isTopPostsLongPressingEnabled = false;
		} else {
			this.isRefreshingAllPosts = false;
			this.isLongPressingEnabled = false;
		}
	}

	onLongPress(post, isTopPosts) {
		post['isSelected'] = true;
		if (isTopPosts) {
			this.isTopPostsLongPressingEnabled = true;
		} else {
			this.isLongPressingEnabled = true;
		}
	}

	changeSelectedPostsStatus(status, isTopPosts) {
		this.allPosts.forEach(post => {
			post['isSelected'] = status;
		});
		if (isTopPosts) {
			this.isTopPostsLongPressingEnabled = status;
		} else {
			this.isLongPressingEnabled = status;
		}
	}

	setNumberSelectedPosts(isTopPosts) {
		if (isTopPosts) {
			this.numberOfSelectedTopPosts = this.topPostsScreenshotsInfo.filter(post => post['isSelected'] === true).length;
		} else {
			this.numberOfSelectedPosts = this.allPosts.filter(post => post['isSelected'] === true).length;
		}
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

	setPercentageForDuringKeywordMention(campaignGroupForm) {
		if (campaignGroupForm.get('beforeCampaign').value && campaignGroupForm.get('duringCampaign').value) {
			const beforeCampaign = Number(campaignGroupForm.get('beforeCampaign').value);
			const duringCampaign = Number(campaignGroupForm.get('duringCampaign').value);
			campaignGroupForm.get('isDuringCampaignIncreased').setValue(duringCampaign - beforeCampaign > -1);
			if (beforeCampaign > 0) {
				const percentage = (duringCampaign / beforeCampaign) * 100;
				if (percentage.toString().indexOf('.') > -1) {
					campaignGroupForm.get('duringCampaignRate').setValue(percentage.toFixed());
				} else {
					campaignGroupForm.get('duringCampaignRate').setValue(percentage);
				}
			} else {
				campaignGroupForm.get('duringCampaignRate').setValue(duringCampaign);
			}
		}
	}

	setPercentageForPostKeywordMention(campaignGroupForm) {
		if (campaignGroupForm.get('duringCampaign').value && campaignGroupForm.get('postCampaign').value) {
			const duringCampaign = Number(campaignGroupForm.get('duringCampaign').value);
			const postCampaign = Number(campaignGroupForm.get('postCampaign').value);
			campaignGroupForm.get('isPostCampaignIncreased').setValue(postCampaign - duringCampaign > -1);
			if (duringCampaign > 0) {
				const percentage = (postCampaign / duringCampaign) * 100;
				if (percentage.toString().indexOf('.') > -1) {
					campaignGroupForm.get('postCampaignRate').setValue(percentage.toFixed(2));
				} else {
					campaignGroupForm.get('postCampaignRate').setValue(percentage);
				}
			} else {
				campaignGroupForm.get('postCampaignRate').setValue(postCampaign);
			}
		}
	}

	setCampaignStatsTotal() {
		this.totalCampaignStats = {reactions: 0, comments: 0, engagement: 0, entries: 0};
		this.campaignStatsInfo.forEach(info => {
			this.totalCampaignStats.reactions +=
				info['statistics'].reactions.toString() !== 'NA' ? Number(info['statistics'].reactions) : 0;
			this.totalCampaignStats.comments +=
				info['statistics'].comments.toString() !== 'NA' ? Number(info['statistics'].comments) : 0;
			this.totalCampaignStats.engagement +=
				info['statistics'].engagement.toString() !== 'NA' ? Number(info['statistics'].engagement) : 0;
			this.totalCampaignStats.entries +=
				info['statistics'].entries.toString() !== 'NA' ? Number(info['statistics'].entries) : 0;
		});
	}

	setPlatFormSummaryTotal() {
		this.totalPlatformSummary = {
			postsPlanned: 0,
			postsDone: 0,
			reactions: 0,
			comments: 0,
			engagement: 0,
			conversations: 0
		};
		this.platFormSummaryInfo.forEach(info => {
			this.totalPlatformSummary.postsPlanned +=
				info['statistics'].postsPlanned.toString() !== 'NA' ? Number(info['statistics'].postsPlanned) : 0;
			this.totalPlatformSummary.postsDone +=
				info['statistics'].postsDone.toString() !== 'NA' ? Number(info['statistics'].postsDone) : 0;
			this.totalPlatformSummary.reactions +=
				info['statistics'].reactions.toString() !== 'NA' ? Number(info['statistics'].reactions) : 0;
			this.totalPlatformSummary.comments +=
				info['statistics'].comments.toString() !== 'NA' ? Number(info['statistics'].comments) : 0;
			this.totalPlatformSummary.engagement +=
				info['statistics'].engagement.toString() !== 'NA' ? Number(info['statistics'].engagement) : 0;
			this.totalPlatformSummary.conversations +=
				info['statistics'].conversations.toString() !== 'NA' ? Number(info['statistics'].conversations) : 0;
		});
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
}
