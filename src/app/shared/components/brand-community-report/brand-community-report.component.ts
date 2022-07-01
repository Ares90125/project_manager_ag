import {Component, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTime} from '@sharedModule/models/date-time';
import {FileService} from '@sharedModule/services/file.service';
import {
	BrandCommunity,
	FacebookInsightsFileStatus,
	CustomConversationBucketInput
} from '@sharedModule/models/graph-ql.model';
import {SelectedTimePeriod} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {BrandModel} from '@sharedModule/models/brand.model';
import {BrandService} from '@brandModule/services/brand.service';
import {UtilityService} from '@sharedModule/services/utility.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import dayjs from 'dayjs';
import {HTMLInputElement} from 'happy-dom';
import axios from 'axios';

@Component({
	selector: 'app-brand-community-report',
	templateUrl: './brand-community-report.component.html',
	styleUrls: ['./brand-community-report.component.scss']
})
export class BrandCommunityReportComponent extends BaseComponent implements OnInit, OnDestroy {
	@ViewChild('kpiComponent', {static: false}) kpiComponent;
	@ViewChild('demographicsComponent', {static: false}) demographicsComponent;
	@ViewChild('conversationsComponent', {static: false}) conversationsComponent;
	@ViewChild('wordCloudComponent', {static: false}) wordCloudComponent;
	@ViewChild('screenshotsComponent', {static: false}) screenshotsComponent;
	@ViewChild('customConversationsComponent', {static: false}) customConversationsComponent;
	groupId: string;
	selectedTimePeriod = 'fourWeeks';
	private dateTimeHelper: DateTimeHelper;
	groupTimezoneName: string | null;
	overview: any;
	showPreview = false;
	brandCommunity: BrandCommunity;
	private fileExist: boolean;
	private fileUploading: boolean;
	private fileStatus: string;
	private fileName: string;
	private insightFile: any;
	private sheetUid: string;
	private fileKey: string;
	insightsExcelsFolderRoot = 'insightsExcels/';
	private fileProcessing: boolean;
	private processedFileDetails: any;
	private groupProfilePage: any;
	private facebookInsightsDetails: any;
	private timePeriodForReportGeneration;
	brandId: any;
	brand: BrandModel;
	showEditDialog = false;
	editType;
	weekLabels;
	monthLabels;
	editMAUInput = {};
	editFormType;
	updating = false;
	showKpiComponent = true;
	wordCloudData;
	wordCloudDataEdited = {};
	showKPIChartsAfterReload = false;
	targetKeys;
	targets;
	submitted = false; // SUBMITTING FALSE
	showAddCustomDialog = false;
	customDialogType = 'add';
	editCustomConversationIndex = 0;
	customConversations = [];
	customConversation = {
		title: '',
		description: '',
		buckets: [],
		toggle: true
	};
	customConversationBucket = {
		name: '',
		mentions: '',
		keywords: '',
		visibility: true
	};
	isAverageDailyViews = true;
	isAverageMonthlyViewsVisible = true;
	isTotalViewsVisible = true;
	isTotalEngagementVisible = true;
	isTotalMembersVisible = true;
	isEngagementPercentageVisible = true;
	isMemberToAdminPostRatioVisible = true;
	isDAUMAURatioVisible = true;
	overviewJSON = {};
	CBRData = {};
	isPublishing;
	showUploadFilePane = false;

	pdfExporting = false;
	pdfGenerator;
	showAllKPICharts = false;
	screenshotPngs = [];
	daysOfWeekLabels = {};
	membersEditInput = [];
	memberDetails;

	overviewStyleClass = 'col-md-4';
	overviewSecondCol = 2;
	overviewThirdCol = 3;
	overviewMaxHeight = 256;
	secondColHeight = 72;
	thirdColHeight = 72;
	supportingText = {};
	editingSupportingText = false;

	constructor(
		injector: Injector,
		private router: Router,
		private route: ActivatedRoute,
		private groupService: GroupsService,
		private brandCommunityReportService: BrandCommunityReportService,
		private fileService: FileService,
		private brandService: BrandService,
		private utilityService: UtilityService
	) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.groupId = this.route.snapshot.params['groupId'];
		this.brandId = this.route.snapshot.params['brandId'];
		this.loadCustomConversations();
		this.loadOverviewStats(this.selectedTimePeriod);
		const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
		const brandCommunities = response['items'];
		this.brandCommunity = brandCommunities.find(community => community.groupId === this.groupId);
		const targets = this.brandCommunity.targets ? this.brandCommunity.targets : null;
		const MAUValues = this.brandCommunity.MAUValues ? this.brandCommunity.MAUValues : null;
		const DAUValues = this.brandCommunity.DAUValues ? this.brandCommunity.DAUValues : null;
		const impressions = this.brandCommunity.impressions ? this.brandCommunity.impressions : null;
		const supportingText = this.brandCommunity.supportingText ? this.brandCommunity.supportingText : {};
		this.targets = JSON.parse(targets);
		this.editMAUInput['targets'] = typeof this.targets === 'string' ? JSON.parse(this.targets) : this.targets;
		this.editMAUInput['MAUValues'] = typeof MAUValues === 'string' ? JSON.parse(MAUValues) : MAUValues;
		this.editMAUInput['DAUValues'] = typeof DAUValues === 'string' ? JSON.parse(DAUValues) : DAUValues;
		this.editMAUInput['impressions'] = typeof impressions === 'string' ? JSON.parse(impressions) : impressions;
		this.supportingText = typeof supportingText === 'string' ? JSON.parse(supportingText) : supportingText;
		this.weekLabels = this.brandCommunityReportService.getWeekLabelsForTimePeriod(
			this.brandCommunity.groupCreatedAtUTC,
			this.dateTimeHelper.yesterdayEnd.dayJsObj
		);
		const memberDetailsString = await this.brandCommunityReportService.getCBREditMembersData(this.groupId);
		if (memberDetailsString) {
			const memberDetails = JSON.parse(memberDetailsString);
			this.memberDetails = {};
			Object.keys(memberDetails)?.forEach(key => {
				this.memberDetails[memberDetails[key].dataDateUTC] = memberDetails[key].memberCount;
			});
		}

		this.getDaysBetweenStartAndEndOfWeek();
		this.subscriptionsToDestroy.push(
			this.brandService.brands.subscribe(async brands => {
				if (!brands) {
					return;
				}
				this.brand = brands.find(_brand => _brand.id === this.brandId);
				const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
				const brandCommunities = response['items'];
				this.brandCommunity = brandCommunities.find(community => community.groupId === this.groupId);
				this.monthLabels = this.brandCommunityReportService.getMonthLabelsForTimePeriod(
					this.brandCommunity.groupCreatedAtUTC,
					this.dateTimeHelper.yesterdayEnd.dayJsObj
				);
				if (this.brandCommunity?.privacy === 'OPEN') {
					this.targetKeys = [
						{
							Total_Members_Onboarded: 'totalMembersOnboarded'
						},
						{
							Total_Views: 'totalViews'
						},
						{
							Monthly_Views: 'monthlyViews'
						},
						{
							Daily_Views: 'dailyViews'
						},
						{
							Posts: 'posts'
						},
						{
							Comments: 'comments'
						},
						{
							Conversations: 'conversations'
						},
						{
							Reactions: 'reactions'
						},
						{
							Total_Engagement: 'totalEngagement'
						},
						{
							Average_Engagement_Percentage: 'averageEngagementPercentage'
						},
						{
							Average_Engagement_Per_post: 'averageEngagementPerPost'
						},
						{
							Member_Admin_Post_Ratio: 'memberAdminPostRatio'
						},
						{
							Surveys: 'surveys'
						},
						{
							Impressions: 'impressions'
						},
						{
							Membership_Requests: 'membershipRequestsChart'
						}
					];
				} else {
					this.targetKeys = [
						{
							Total_Members_Onboarded: 'totalMembersOnboarded'
						},
						{
							'DAU/MAU_Ratio': 'DAUMAURatio'
						},
						{
							Monthly_Active_Users: 'monthlyActiveUsers'
						},
						{
							Daily_Active_Users: 'dailyActiveUsers'
						},
						{
							Monthly_Active_Users_Perc: 'monthlyActiveUsersPercentage'
						},
						{
							Daily_Active_Users_Perc: 'dailyActiveUsersPercentage'
						},
						{
							Posts: 'posts'
						},
						{
							Comments: 'comments'
						},
						{
							Conversations: 'conversations'
						},
						{
							Reactions: 'reactions'
						},
						{
							Total_Engagement: 'totalEngagement'
						},
						{
							Average_Engagement_Percentage: 'averageEngagementPercentage'
						},
						{
							Average_Engagement_Per_post: 'averageEngagementPerPost'
						},
						{
							Member_Admin_Post_Ratio: 'memberAdminPostRatio'
						},
						{
							Surveys: 'surveys'
						},
						{
							Impressions: 'impressions'
						},
						{
							Membership_Requests: 'membershipRequestsChart'
						}
					];
				}
			})
		);
		await this.updateCoverImage();
	}

	async updateCoverImage(): Promise<void> {
		const coverImageContent = await axios.get(this.brandCommunity?.coverImageUrl, {
			responseType: 'blob',
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'no-cache'
			}
		});
		var reader = new window.FileReader();
		reader.readAsDataURL(coverImageContent.data);
		reader.onload = function () {
			let imageDataUrl = reader.result;
			let coverImage = document.querySelector('#home-landing img');
			/// @ts-ignore
			coverImage.setAttribute('src', imageDataUrl);
			let overviewImage = document.querySelector('#overview-landing-full img');
			/// @ts-ignore
			overviewImage.setAttribute('src', imageDataUrl);
		};
	}

	changeTimePeriod() {
		this.loadOverviewStats(this.selectedTimePeriod);
	}

	async loadOverviewStats(selectedTimePeriod, type = null) {
		if (!this.groupId) {
			return;
		}
		switch (selectedTimePeriod) {
			case SelectedTimePeriod.fourWeeks:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime().startOf('week').subtract(3, 'weeks').dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.threeMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(2, 'months').dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.sixMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(5, 'months').dayJsObj.format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.oneYear:
				this.timePeriodForReportGeneration = {
					startDate: this.utilityService.getLastOneYearInQuartersStartDate().format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
			case SelectedTimePeriod.lifetime:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime(this.brandCommunity.groupCreatedAtUTC).format('YYYY-MM-DD'),
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj.format('YYYY-MM-DD')
				};
				break;
		}
		if (type === 'publish') {
			return await this.brandCommunityReportService.getGroupOverviewStats(
				this.groupId,
				this.timePeriodForReportGeneration.startDate,
				this.timePeriodForReportGeneration.endDate
			);
			return {};
		} else {
			this.overview = await this.brandCommunityReportService.getGroupOverviewStats(
				this.groupId,
				this.timePeriodForReportGeneration.startDate,
				this.timePeriodForReportGeneration.endDate
			);
		}
	}

	async fileChange(event: any, isDragged = null) {
		let file;
		if (isDragged) {
			file = event;
		} else {
			file = event.target.files;
		}
		if (file.length < 1) {
			return;
		}
		if (file[0].name.substring(file[0].name.lastIndexOf('.') + 1) !== 'xlsx') {
			this.alert.error('Invalid File Format', 'Upload insights data in a .xlsx file format.');
			return;
		}

		this.fileExist = true;
		this.fileUploading = true;
		this.fileStatus = '';
		this.insightFile = file[0];
		this.fileName = this.insightFile.name;
	}

	async saveFile() {
		const processedFileURLs = this.insightFile ? await this.uploadInsightsFileAndFetchURL(this.insightFile) : null;

		if (!processedFileURLs) {
			return;
		}
		this.alert.success('File upload successful', '');
		this.sheetUid = processedFileURLs.substring(processedFileURLs.lastIndexOf('/') + 1);
		this.fileKey = this.insightsExcelsFolderRoot + this.sheetUid;
		this.fileUploading = false;
		this.fileProcessing = true;
		const result = await this.triggerInsightsParsing();
		if (result) {
			this.fileProcessing = false;
			this.fileStatus = 'Valid';
		} else {
			this.fileProcessing = false;
			this.fileStatus = 'Invalid';
		}
		this.processedFileDetails['fileName'] = this.fileName;
		this.processedFileDetails['fileStatus'] = this.fileStatus;
		this.showUploadFilePane = false;
		this.frameInsightsDetails();
	}

	private async uploadInsightsFileAndFetchURL(file: any) {
		return await this.fileService.uploadToS3(file, 'excel', this.randomUuid());
	}

	public async triggerInsightsParsing(): Promise<boolean> {
		try {
			const sheetNameWithoutExtension = this.sheetUid.substring(0, this.sheetUid.lastIndexOf('.'));
			await this.brandCommunityReportService.triggerInsightsParsing(this.groupId, sheetNameWithoutExtension);
			return true;
		} catch (error) {
			return false;
		}
	}

	frameInsightsDetails() {
		this.facebookInsightsDetails.fileName = this.fileName;
		this.facebookInsightsDetails.sheetUID = this.sheetUid;
		if (this.fileStatus === 'Valid') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Valid;
		} else if (this.fileStatus === 'Invalid') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Invalid;
		} else if (this.fileStatus === 'Expired') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Expired;
		}
		this.facebookInsightsDetails.fileUploadedAtUTC = new Date().toISOString();
	}

	openEditDialog(type) {
		this.showEditDialog = true;
		this.editFormType = type;
	}

	updateEditValues(type, event, toggleKey = null, index = null) {
		let key;
		let input = {};
		switch (type) {
			case 'MAU':
				key = event.target.getAttribute('startDate');
				if (event.target.value) {
					if (!this.editMAUInput['MAUValues']) {
						input[key] = parseInt(event.target.value);
						this.editMAUInput['MAUValues'] = input;
					} else {
						this.editMAUInput['MAUValues'][key] = parseInt(event.target.value);
					}
				} else {
					if (this.editMAUInput['MAUValues']) {
						delete this.editMAUInput['MAUValues'][key];
					}
				}
				break;
			case 'Members':
				key = event.target.getAttribute('startDate');
				if (event.target.value) {
					if (!this.editMAUInput['Members']) {
						input[key] = parseInt(event.target.value);
						this.editMAUInput['Members'] = input;
					} else {
						this.editMAUInput['Members'][key] = parseInt(event.target.value);
					}
				} else {
					if (this.editMAUInput['Members']) {
						delete this.editMAUInput['Members'][key];
					}
				}
				break;
			case 'DAU':
				key = event.target.getAttribute('startDate');
				if (event.target.value) {
					if (!this.editMAUInput['DAUValues']) {
						input[key] = parseInt(event.target.value);
						this.editMAUInput['DAUValues'] = input;
					} else {
						this.editMAUInput['DAUValues'][key] = parseInt(event.target.value);
					}
				} else {
					if (this.editMAUInput['DAUValues']) {
						delete this.editMAUInput['DAUValues'][key];
					}
				}
				break;
			case 'impressions':
				key = event.target.getAttribute('startDate');
				if (event.target.value) {
					if (!this.editMAUInput['impressions']) {
						input[key] = event.target.value;
						this.editMAUInput['impressions'] = input;
					} else {
						this.editMAUInput['impressions'][key] = event.target.value;
					}
				} else {
					if (this.editMAUInput['impressions']) {
						delete this.editMAUInput['impressions'][key];
					}
				}
				break;
			case 'WordCloud':
				if (toggleKey === 'name') {
					this.wordCloudData[index]['name'] = event.target.value;
				}
				if (toggleKey === 'weight') {
					this.wordCloudData[index]['weight'] = event.target.value;
				}
				break;
			case 'targets':
				const startDate = event.target.getAttribute('startDate');
				const targetKey = event.target.getAttribute('targetKey');
				if (event.target.value) {
					if (!this.editMAUInput['targets']) {
						this.editMAUInput['targets'] = {};
						this.editMAUInput['targets'][targetKey] = {};
						this.editMAUInput['targets'][targetKey][startDate] = event.target.value;
					} else {
						if (!this.editMAUInput['targets'][targetKey]) {
							this.editMAUInput['targets'][targetKey] = {};
							this.editMAUInput['targets'][targetKey][startDate] = event.target.value;
						} else {
							this.editMAUInput['targets'][targetKey][startDate] = event.target.value;
						}
					}
				} else {
					if (
						this.editMAUInput['targets'] &&
						this.editMAUInput['targets'][targetKey] &&
						this.editMAUInput['targets'][targetKey][startDate]
					) {
						delete this.editMAUInput['targets'][targetKey][startDate];
					}
					if (Object.keys(this.editMAUInput['targets'][targetKey]).length === 0) {
						delete this.editMAUInput['targets'][targetKey];
					}
				}
				break;
			case 'visibility':
				if (!this.editMAUInput['targets']) {
					this.editMAUInput['targets'] = {};
					this.editMAUInput['targets'][toggleKey] = {};
					this.editMAUInput['targets'][toggleKey]['visibility'] = event.checked;
				} else {
					if (!this.editMAUInput['targets'][toggleKey]) {
						this.editMAUInput['targets'][toggleKey] = {};
						this.editMAUInput['targets'][toggleKey]['visibility'] = event.checked;
					} else {
						this.editMAUInput['targets'][toggleKey]['visibility'] = event.checked;
					}
				}
				break;
		}
	}

	async updateKPIs(type = null) {
		if (type === 'wordCloud') {
			this.wordCloudDataEdited[this.selectedTimePeriod] = {};
			const wordCloudObj = Object.assign({}, ...this.wordCloudData.map(item => ({[item.name]: item.weight})));
			this.wordCloudDataEdited[this.selectedTimePeriod]['wordCloudData'] = JSON.stringify(wordCloudObj);
		}
		this.updating = true;
		if (type !== 'Members') {
			await this.brandCommunityReportService.updateBrandCommunityReport({
				brandId: this.brandId,
				groupId: this.groupId,
				MAUValues: this.editMAUInput['MAUValues']
					? typeof this.editMAUInput['MAUValues'] === 'string'
						? this.editMAUInput['MAUValues']
						: JSON.stringify(this.editMAUInput['MAUValues'])
					: undefined,
				DAUValues: this.editMAUInput['DAUValues']
					? typeof this.editMAUInput['DAUValues'] === 'string'
						? this.editMAUInput['DAUValues']
						: JSON.stringify(this.editMAUInput['DAUValues'])
					: undefined,
				MAUValuesPercentage: this.editMAUInput['MAUValuesPercentage']
					? JSON.stringify(this.editMAUInput['MAUValuesPercentage'])
					: undefined,
				DAUValuesPercentage: this.editMAUInput['DAUValuesPercentage']
					? JSON.stringify(this.editMAUInput['DAUValuesPercentage'])
					: undefined,
				impressions: this.editMAUInput['impressions']
					? typeof this.editMAUInput['impressions'] === 'string'
						? this.editMAUInput['impressions']
						: JSON.stringify(this.editMAUInput['impressions'])
					: undefined,
				targets: this.editMAUInput['targets']
					? typeof this.editMAUInput['targets'] === 'string'
						? this.editMAUInput['targets']
						: JSON.stringify(this.editMAUInput['targets'])
					: undefined
			});
			await this.resetChildComponent(type);
		} else {
			this.membersEditInput = [];
			if (this.editMAUInput['Members']) {
				Object.keys(this.editMAUInput['Members'])?.forEach(key => {
					this.membersEditInput.push({
						groupId: this.groupId,
						dataDateUTC: key,
						metricForDayUTCStartTick: new DateTime(key, 'YYYY-MM-DD')
							.add(new DateTime().utc().getUtcOffset(DateTime.guess()), 'minutes')
							.unix(),
						memberCount: this.editMAUInput['Members'][key]
					});
				});
				await this.brandCommunityReportService.editGroupTotalMembers(this.membersEditInput);
			}
		}
		this.updating = false;
		this.closeEditDialog();
	}

	closeEditDialog() {
		this.showEditDialog = false;
		delete this.editMAUInput['DAUValues'];
		delete this.editMAUInput['impressions'];
		delete this.editMAUInput['MAUValues'];
		delete this.editMAUInput['Members'];
		delete this.editMAUInput['MAUValuesPercentage'];
		delete this.editMAUInput['DAUValuesPercentage'];
		this.editMAUInput['targets'] = typeof this.targets === 'string' ? JSON.parse(this.targets) : this.targets;
		this.showEditDialog = false;
	}

	getKeysOfObject(object) {
		return Object.keys(object);
	}

	async loadCustomConversations() {
		const data = await this.brandCommunityReportService.getCBRCustomConversationByGroupId(this.groupId);
		if (data && data.items) {
			for (const item of data.items) {
				const customConversation = {
					title: item.sectionTitle,
					description: item.sectionSubtitle,
					buckets: item.buckets,
					toggle: true
				};
				this.customConversations.push(customConversation);
			}
		}
	}

	async reloadCustomConversations() {
		this.customConversations = [];
		const data = await this.brandCommunityReportService.getCBRCustomConversationByGroupId(this.groupId);
		if (data && data.items) {
			for (const item of data.items) {
				const customConversation = {
					title: item.sectionTitle,
					description: item.sectionSubtitle,
					buckets: item.buckets,
					toggle: true
				};
				this.customConversations.push(customConversation);
			}
		}
	}

	openAddCustomDialog() {
		this.submitted = false;
		this.showAddCustomDialog = true;
		this.customDialogType = 'add';
	}

	addBucket() {
		if (this.customConversation.buckets.length < 5) {
			this.customConversation.buckets.push({...this.customConversationBucket});
		}
	}

	async onAddCustomConversation() {
		this.submitted = true;
		let isValid = true;
		if (this.customConversation.title == null || this.customConversation.title == '') {
			isValid = false;
		}
		if (this.customConversation.buckets.length == 0) {
			isValid = false;
		}
		for (let i = 0; i < this.customConversation.buckets.length; i++) {
			if (this.customConversation.buckets[i].name == null || this.customConversation.buckets[i].name == '') {
				isValid = false;
				break;
			}
			if (this.customConversation.buckets[i].mentions == null || this.customConversation.buckets[i].mentions == '') {
				isValid = false;
				break;
			}
		}

		if (isValid) {
			const buckets = [];
			for (const bucket of this.customConversation.buckets) {
				const bucketItem = new CustomConversationBucketInput();
				bucketItem.name = bucket.name;
				bucketItem.mentions = bucket.mentions;
				bucketItem.keywords = bucket.keywords;
				bucketItem.visibility = bucket.visibility;
				buckets.push(bucketItem);
			}

			if (this.customDialogType == 'add') {
				await this.brandCommunityReportService.createCBRCustomConversation(
					this.groupId,
					this.customConversation.title,
					this.customConversation.description,
					buckets
				);

				this.customConversations.push({...this.customConversation});
				this.customConversations = [...this.customConversations];
			} else if (this.customDialogType == 'edit') {
				await this.brandCommunityReportService.updateCBRCustomConversation(
					this.groupId,
					this.customConversation.title,
					this.customConversation.description,
					buckets
				);
				this.customConversations.splice(this.editCustomConversationIndex, 1, this.customConversation);
				this.customConversations = [...this.customConversations];
			}
			this.customConversation = {
				title: '',
				description: '',
				buckets: [],
				toggle: true
			};
			this.showAddCustomDialog = false;
		}
	}

	onRemoveCustomConversation(index) {
		if (this.customConversation.buckets[index]) {
			this.customConversation.buckets.splice(index, 1);
		}
	}

	openEditCustomDialog(index) {
		this.editCustomConversationIndex = index;
		this.customConversation = {...this.customConversations[index]};
		this.showAddCustomDialog = true;
		this.customDialogType = 'edit';
	}

	checkAddable() {
		if (this.customConversation.title != '') {
			if (this.customConversation.buckets.length > 0) {
				for (const bucket of this.customConversation.buckets) {
					if (!(bucket.name != '' && bucket.mentions != '')) {
						return false;
					}
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
		return true;
	}

	onChangeCustomConversationVisible($event) {
		if ($event) {
			const id = $event.id;
			const toggle = $event.toggle;
			this.customConversations[id].toggle = toggle;
		}
	}

	addKPIData(event) {
		this.CBRData['kpi'] = event;
	}

	addDemographicsData(event) {
		this.CBRData['demographics'] = event;
	}

	addConversationsData(event) {
		this.CBRData['conversations'] = event;
	}

	addWordCloudData(event) {
		this.CBRData['wordCloud'] = {};
		this.CBRData['wordCloud']['isWordCloudVisible'] = event['isWordCloudVisible'];
		if (this.wordCloudDataEdited['fourWeeks']) {
			this.CBRData['wordCloud']['fourWeeks'] = this.wordCloudDataEdited['fourWeeks'];
		} else {
			this.CBRData['wordCloud']['fourWeeks'] = event['fourWeeks'];
		}
		if (this.wordCloudDataEdited['threeMonths']) {
			this.CBRData['wordCloud']['threeMonths'] = this.wordCloudDataEdited['threeMonths'];
		} else {
			this.CBRData['wordCloud']['threeMonths'] = event['threeMonths'];
		}
		if (this.wordCloudDataEdited['sixMonths']) {
			this.CBRData['wordCloud']['sixMonths'] = this.wordCloudDataEdited['sixMonths'];
		} else {
			this.CBRData['wordCloud']['sixMonths'] = event['sixMonths'];
		}
		if (this.wordCloudDataEdited['oneYear']) {
			this.CBRData['wordCloud']['oneYear'] = this.wordCloudDataEdited['oneYear'];
		} else {
			this.CBRData['wordCloud']['oneYear'] = event['oneYear'];
		}
		if (this.wordCloudDataEdited['lifetime']) {
			this.CBRData['wordCloud']['lifetime'] = this.wordCloudDataEdited['lifetime'];
		} else {
			this.CBRData['wordCloud']['lifetime'] = event['lifetime'];
		}
	}

	addScreenshotsData(event) {
		this.CBRData['screenshots'] = event;
	}

	addCustomConversationsData(event) {
		this.CBRData['customConversations'] = event;
	}

	async getOverviewJSON() {
		this.isPublishing = true;
		if (this.customConversations?.length > 0) {
			await this.customConversationsComponent.getCustomConversationsJSON();
		}
		await this.kpiComponent.getKpiJSON();
		await this.demographicsComponent.getDemographicsJSON();
		await this.conversationsComponent.getConversationsJSON();
		await this.wordCloudComponent.getWordCloudJSON();
		await this.screenshotsComponent.getScreenshotsDataJSON();
		this.overviewJSON['fourWeeks'] = await this.loadOverviewStats('fourWeeks', 'publish');
		this.overviewJSON['threeMonths'] = await this.loadOverviewStats('threeMonths', 'publish');
		this.overviewJSON['sixMonths'] = await this.loadOverviewStats('sixMonths', 'publish');
		this.overviewJSON['oneYear'] = await this.loadOverviewStats('oneYear', 'publish');
		this.overviewJSON['lifetime'] = await this.loadOverviewStats('lifetime', 'publish');
		this.overviewJSON['isTotalMembersVisible'] = this.isTotalMembersVisible;
		this.overviewJSON['isEngagementPercentageVisible'] = this.isEngagementPercentageVisible;
		this.overviewJSON['isMemberToAdminPostRatioVisible'] = this.isMemberToAdminPostRatioVisible;
		this.overviewJSON['isDAUMAURatioVisible'] = this.isDAUMAURatioVisible;
		this.overviewJSON['isTotalEngagementVisible'] = this.isTotalEngagementVisible;
		this.overviewJSON['isTotalViewsVisible'] = this.isTotalViewsVisible;
		this.overviewJSON['isAverageMonthlyViewsVisible'] = this.isAverageMonthlyViewsVisible;
		this.overviewJSON['isAverageDailyViews'] = this.isAverageDailyViews;
		this.CBRData['overview'] = this.overviewJSON;
		this.brandService.jsonDataStringForCBR = JSON.stringify(this.CBRData);
		this.isPublishing = false;
		this.showPreview = true;

		(document.getElementsByClassName('wrapper')[0] as HTMLElement).style.display = 'none';
	}

	closePreviewDialog() {
		(document.getElementsByClassName('wrapper')[0] as HTMLElement).style.display = 'block';
		this.showPreview = false;
	}

	openSupportingTextArea(event) {
		event.currentTarget.nextElementSibling.classList.add('show');
		event.currentTarget.classList.remove('show');
	}

	editSupportingText(event) {
		event.currentTarget.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.classList.remove('show');
	}

	hideSupportingTextArea(event) {
		event.currentTarget.parentElement.parentElement.classList.remove('show');
		event.currentTarget.parentElement.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.parentElement.nextElementSibling.classList.add('show');
	}

	async saveSupportingText(event, type) {
		this.editingSupportingText = true;
		const text = (event.currentTarget.parentElement.previousSibling as HTMLInputElement).value;
		if (text.trim().length === 0) {
			if (this.supportingText[type]) {
				delete this.supportingText[type];
			}
		} else {
			this.supportingText[type] = text;
		}
		await this.brandCommunityReportService.updateBrandCommunityReport({
			brandId: this.brandId,
			groupId: this.groupId,
			supportingText: JSON.stringify(this.supportingText)
		});
		this.editingSupportingText = false;
		event.target.parentElement.parentElement.classList.remove('show');
		event.target.parentElement.parentElement.previousElementSibling.classList.add('show');
		event.target.parentElement.parentElement.nextElementSibling.classList.add('show');
	}

	async publishPreview() {
		await this.uploadToS3();
		this.alert.success(null, 'Report published successfully!');
		this.closePreviewDialog();
	}

	async updateReport(key) {
		await this.brandCommunityReportService.updateBrandCommunityReport({
			brandId: this.brandId,
			groupId: this.groupId,
			brandCommunityReports3Key: key
		});
	}

	async uploadToS3() {
		this.isPublishing = true;
		let data;

		data = encodeURIComponent(JSON.stringify(this.CBRData)) as any;
		let key;
		let success;
		key = await this.fileService.uploadCBRToS3(data, 'CommunityBuildingReport', this.randomUuid(), null);
		this.updateReport(key);
		this.isPublishing = false;
	}

	wordCloudDataToParent(event, selectedTimePeriodForEdit = null) {
		this.wordCloudData = event;
	}

	async resetChildComponent(type = null) {
		const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
		const brandCommunities = response['items'];
		this.brandCommunity = brandCommunities.find(community => community.groupId === this.groupId);
		const targets = this.brandCommunity.targets;
		this.targets = JSON.parse(targets);
		if (type === 'targets') {
			this.showKPIChartsAfterReload = true;
		}
	}

	deleteWordCloudRow(name) {
		this.wordCloudData = this.wordCloudData.filter(data => data.name !== name);
	}

	addWordCloudRow() {
		this.wordCloudData.push({name: '', weight: ''});
	}

	getLastUpdatedOn() {
		if (this.brandCommunity?.lastUpdatedOn) {
			return dayjs(this.brandCommunity?.lastUpdatedOn).format('D MMM, YYYY');
		}
		return dayjs().format('D MMM, YYYY');
	}

	getUploadedOn() {
		if (this.brandCommunity?.lastUpdatedOn) {
			return dayjs(this.brandCommunity?.lastUpdatedOn).format('D MMM, YYYY hh:mm');
		}
		return dayjs().format('D MMM, YYYY hh:mm');
	}

	async generatePDFHeader(sectionName) {
		let docWidth = this.pdfGenerator.internal.pageSize.getWidth();
		let sectionNameDom = document.getElementById('section-name');
		sectionNameDom.innerHTML = sectionName;
		let headerDom = document.getElementById('pdf-header');
		const headerImage = await domtoimage.toPng(headerDom);
		this.pdfGenerator.addImage(headerImage, 'PNG', 0, 15, docWidth, 50, '', 'FAST');
	}

	async generatePDFFooter(currentPage, totalPages) {
		let docWidth = this.pdfGenerator.internal.pageSize.getWidth();
		let pageNumberDom = document.getElementById('page-number');
		if (currentPage !== 1) {
			pageNumberDom.innerHTML = `${currentPage} / ${totalPages}`;
		}
		let footerDom = document.getElementById('pdf-footer');
		const footerImage = await domtoimage.toPng(footerDom);
		this.pdfGenerator.addImage(footerImage, 'PNG', 0, 1030, docWidth, 50, '', 'FAST');
	}

	async generatePDFContent(domId, kpiHead = false, kpiLeft = false, kpiRight = false) {
		let docWidth = 1880;
		let docHeight = 940;
		const content = document.getElementById(domId);
		const canvas = await html2canvas(content);
		const canvasDataURL = canvas.toDataURL('image/png');
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;
		const canvasRatio = canvasWidth / canvasHeight;

		// fit width
		let contentWidth = docWidth;
		let contentHeight = canvasHeight + (docWidth - canvasWidth) / canvasRatio;

		// fit height
		if (contentHeight > docHeight) {
			contentHeight = docHeight;
			contentWidth = contentWidth - (contentHeight - docHeight) / canvasRatio;
		}

		let offsetX = 20;
		let offsetY = 60 + (docHeight - contentHeight) / 2;

		if (domId.indexOf('landing') > 0) {
			if (domId.indexOf('full') > 0) {
				await this.pdfGenerator.addImage(canvasDataURL, 'PNG', 0, 0, 1920, 1080, '', 'FAST');
			} else {
				await this.pdfGenerator.addImage(canvasDataURL, 'PNG', 0, 0, 1920, 1030, '', 'FAST');
			}
		} else if (domId.indexOf('kpi') >= 0 && domId !== 'kpi-charts-show-section') {
			if (kpiHead) {
				await this.pdfGenerator.addImage(canvasDataURL, 'PNG', 0, 0, 1920, 200, '', 'FAST');
			} else {
				if (kpiLeft) {
					await this.pdfGenerator.addImage(canvasDataURL, 'PNG', 40, 200, 900, 780, '', 'FAST');
				} else if (kpiRight) {
					await this.pdfGenerator.addImage(canvasDataURL, 'PNG', 940, 200, 900, 780, '', 'FAST');
				} else {
					await this.pdfGenerator.addImage(canvasDataURL, 'PNG', 20, 200, 1880, 780, '', 'FAST');
				}
			}
		} else {
			if (domId.indexOf('screenshots') >= 0) {
				const screenshotContent = document.getElementById(domId);
				const screenshotPng = await domtoimage.toPng(screenshotContent);
				await this.pdfGenerator.addImage(screenshotPng, 'PNG', 20, 60, docWidth, docHeight, '', 'FAST');
			} else {
				await this.pdfGenerator.addImage(
					canvasDataURL,
					'PNG',
					offsetX,
					offsetY,
					contentWidth,
					contentHeight,
					'',
					'FAST'
				);
			}
		}
	}

	hideChart(toggleId, chartId) {
		const toggle = document.getElementById(toggleId);
		const chart = document.getElementById(chartId);
		if (toggle && toggle.getAttribute('aria-checked') != 'true' && chart) {
			chart.classList.add('hide-for-pdf');
		}
	}

	showChart(toggleId, chartId) {
		const toggle = document.getElementById(toggleId);
		const chart = document.getElementById(chartId);
		if (toggle.getAttribute('aria-checked') != 'true' && chart) {
			chart.classList.remove('hide-for-pdf');
		}
	}

	isToggle(toggleId) {
		const toggle = document.getElementById(toggleId);
		if (toggle && toggle.getAttribute('aria-checked') == 'true') {
			return true;
		}
		return false;
	}

	getKpiMemberPages() {
		let kpiMembers = 0;
		if (this.brandCommunity?.privacy === 'OPEN') {
			if (this.isToggle('kpi-total-members-toggle-input')) {
				kpiMembers += 0.5;
			}
			if (this.isToggle('kpi-total-views-toggle-input')) {
				kpiMembers += 0.5;
			}
			if (this.isToggle('kpi-avg-month-toggle-input')) {
				kpiMembers += 0.5;
			}
			if (this.isToggle('kpi-avg-day-toggle-input')) {
				kpiMembers += 0.5;
			}
		}
		if (this.isToggle('kpi-dau-ratio-toggle-input')) {
			kpiMembers += 0.5;
		}
		if (this.isToggle('kpi-monthly-users-toggle-input')) {
			kpiMembers += 0.5;
		}
		if (this.isToggle('kpi-monthly-percent-toggle-input')) {
			kpiMembers += 0.5;
		}
		if (this.isToggle('kpi-daily-users-toggle-input')) {
			kpiMembers += 0.5;
		}
		if (this.isToggle('kpi-daily-percent-toggle-input')) {
			kpiMembers += 0.5;
		}
		if (kpiMembers !== Math.floor(kpiMembers)) {
			kpiMembers += 0.5;
		}

		return kpiMembers;
	}

	getKpiActivityPages() {
		let kpiActivity = 0;

		if (this.isToggle('kpi-posts-toggle-input')) {
			kpiActivity += 0.5;
		}
		if (this.isToggle('kpi-comments-toggle-input')) {
			kpiActivity += 0.5;
		}
		if (this.isToggle('kpi-conversations-toggle-input')) {
			kpiActivity += 0.5;
		}
		if (this.isToggle('kpi-reactions-toggle-input')) {
			kpiActivity += 0.5;
		}
		if (kpiActivity !== Math.floor(kpiActivity)) {
			kpiActivity += 0.5;
		}
		if (this.isToggle('kpi-total-engagement-toggle-input')) {
			kpiActivity += 1;
		}
		if (this.isToggle('kpi-average-percent-toggle-input')) {
			kpiActivity += 0.5;
		}
		if (this.isToggle('kpi-average-engagement-toggle-input')) {
			kpiActivity += 0.5;
		}
		if (kpiActivity !== Math.floor(kpiActivity)) {
			kpiActivity += 0.5;
		}

		return kpiActivity;
	}

	getKpiInsightPages() {
		let kpiInsight = 0;
		if (this.isToggle('kpi-average-post-toggle-input')) {
			kpiInsight += 0.5;
		}
		if (this.isToggle('kpi-surveys-toggle-input')) {
			kpiInsight += 0.5;
		}
		if (this.isToggle('kpi-impressions-toggle-input')) {
			kpiInsight += 0.5;
		}
		if (this.isToggle('kpi-membership-toggle-input') && this.brandCommunity?.privacy !== 'OPEN') {
			kpiInsight += 0.5;
		}
		if (kpiInsight !== Math.floor(kpiInsight)) {
			kpiInsight += 0.5;
		}

		return kpiInsight;
	}

	getTotalPages() {
		let totalPages = 4;

		const sublistPrefixes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		const kpiList = ['KPI Funnels', 'KPI Charts'];
		const kpiFunnelSubList = ['Members', 'User Engagement'];
		const kpiChartList = ['Members', 'Activity', 'Insights'];
		let kpiMainIndex = 0;
		let kpiFunnalIndex = 0;
		let kpiChartIndex = 0;
		//kpi section
		const pdfKpiListElement = document.getElementById('pdf-kpi-list');
		if (this.isToggle('kpi-main-members-toggle-input') || this.isToggle('kpi-main-engagement-toggle-input')) {
			totalPages++;

			const kpiFunnelDiv = document.createElement('div');
			kpiFunnelDiv.innerHTML = '1. KPI Funnels';
			kpiFunnelDiv.setAttribute('class', 'overview-list-title');
			kpiFunnelDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			kpiMainIndex++;
			pdfKpiListElement.appendChild(kpiFunnelDiv);

			if (this.isToggle('kpi-main-members-toggle-input')) {
				const kpiFunnelSubDiv = document.createElement('div');
				kpiFunnelSubDiv.innerHTML = `${sublistPrefixes[kpiFunnalIndex]}. Members`;
				kpiFunnalIndex++;
				kpiFunnelSubDiv.setAttribute('class', 'overview-list-value');
				kpiFunnelSubDiv.setAttribute(
					'style',
					'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;'
				);
				pdfKpiListElement.appendChild(kpiFunnelSubDiv);
			}
			if (this.isToggle('kpi-main-engagement-toggle-input')) {
				const kpiFunnelSubDiv = document.createElement('div');
				kpiFunnelSubDiv.innerHTML = `${sublistPrefixes[kpiFunnalIndex]}. User Engagement`;
				kpiFunnelSubDiv.setAttribute('class', 'overview-list-value');
				kpiFunnelSubDiv.setAttribute(
					'style',
					'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;'
				);
				pdfKpiListElement.appendChild(kpiFunnelSubDiv);
			}
		}

		let kpiMembers = this.getKpiMemberPages();
		totalPages += kpiMembers;

		let kpiMembersTextElement = document.getElementById('kpi_members_text');
		if (kpiMembersTextElement && kpiMembersTextElement.innerHTML.length > 200) {
			totalPages++;
		}

		let kpiActivity = this.getKpiActivityPages();
		totalPages += kpiActivity;

		let kpiEngagementTextElement = document.getElementById('kpi_engagement_text');
		if (kpiEngagementTextElement && kpiEngagementTextElement.innerHTML.length > 200) {
			totalPages++;
		}

		let kpiInsight = this.getKpiInsightPages();
		totalPages += kpiInsight;

		let kpiInsightTextElement = document.getElementById('kpi_insights_text');
		if (kpiInsightTextElement && kpiInsightTextElement.innerHTML.length > 200) {
			totalPages++;
		}

		if (kpiMembers + kpiActivity + kpiInsight > 0) {
			const kpiChartDiv = document.createElement('div');
			kpiChartDiv.innerHTML = `${kpiMainIndex + 1}. KPI Charts`;
			kpiChartDiv.setAttribute('class', 'overview-list-title');
			kpiChartDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			pdfKpiListElement.appendChild(kpiChartDiv);

			if (kpiMembers > 0) {
				const kpiChartSubDiv = document.createElement('div');
				kpiChartSubDiv.innerHTML = `${sublistPrefixes[kpiChartIndex]}. Members`;
				kpiChartIndex++;
				kpiChartSubDiv.setAttribute('class', 'overview-list-value');
				kpiChartSubDiv.setAttribute('style', 'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;');
				pdfKpiListElement.appendChild(kpiChartSubDiv);
			}
			if (kpiActivity > 0) {
				const kpiChartSubDiv = document.createElement('div');
				kpiChartSubDiv.innerHTML = `${sublistPrefixes[kpiChartIndex]}. Activity`;
				kpiChartIndex++;
				kpiChartSubDiv.setAttribute('class', 'overview-list-value');
				kpiChartSubDiv.setAttribute('style', 'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;');
				pdfKpiListElement.appendChild(kpiChartSubDiv);
			}
			if (kpiInsight > 0) {
				const kpiChartSubDiv = document.createElement('div');
				kpiChartSubDiv.innerHTML = `${sublistPrefixes[kpiChartIndex]}. Insights`;
				kpiChartSubDiv.setAttribute('class', 'overview-list-value');
				kpiChartSubDiv.setAttribute('style', 'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;');
				pdfKpiListElement.appendChild(kpiChartSubDiv);
			}
		}

		//community section
		totalPages++;

		const communityList = [
			'Gender Distribution',
			'Age-wise Gender Distribution',
			'Country-wise Users',
			'City-wise Users'
		];
		let kpiCommunityIndex = 0;
		const pdfCommunityElement = document.getElementById('pdf-community-list');
		if (this.isToggle('community-gender-toggle-input')) {
			const kpiCommunityDiv = document.createElement('div');
			kpiCommunityDiv.innerHTML = `${kpiCommunityIndex + 1}. Gender Distribution`;
			kpiCommunityDiv.setAttribute('class', 'overview-list-title');
			kpiCommunityDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			kpiCommunityIndex++;
			pdfCommunityElement.appendChild(kpiCommunityDiv);
		}
		if (this.isToggle('community-age-toggle-input')) {
			const kpiCommunityDiv = document.createElement('div');
			kpiCommunityDiv.innerHTML = `${kpiCommunityIndex + 1}. Age-wise Gender Distribution`;
			kpiCommunityIndex++;
			kpiCommunityDiv.setAttribute('class', 'overview-list-title');
			kpiCommunityDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			pdfCommunityElement.appendChild(kpiCommunityDiv);
		}
		if (this.isToggle('community-country-toggle-input')) {
			const kpiCommunityDiv = document.createElement('div');
			kpiCommunityDiv.innerHTML = `${kpiCommunityIndex + 1}. Country-wise Users`;
			kpiCommunityDiv.setAttribute('class', 'overview-list-title');
			kpiCommunityDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			kpiCommunityIndex++;
			pdfCommunityElement.appendChild(kpiCommunityDiv);
		}
		if (this.isToggle('community-city-toggle-input')) {
			const kpiCommunityDiv = document.createElement('div');
			kpiCommunityDiv.innerHTML = `${kpiCommunityIndex + 1}. City-wise Users`;
			kpiCommunityDiv.setAttribute('class', 'overview-list-title');
			kpiCommunityDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			pdfCommunityElement.appendChild(kpiCommunityDiv);
		}
		if (this.isToggle('community-gender-toggle-input') || this.isToggle('community-age-toggle-input')) {
			totalPages++;
		}
		if (this.isToggle('community-country-toggle-input') || this.isToggle('community-city-toggle-input')) {
			totalPages++;
		}

		//conversation section

		const conversationList = ['Brand Share of Voice', 'Brand Sentiment', 'Categories', 'Word Cloud'];
		const conversationCategorySubList = ['Topics', 'Keywords', 'Products'];
		let conversationMainIndex = 0;
		let conversationCategoryIndex = 0;
		totalPages++;

		const pdfConversationElement = document.getElementById('pdf-conversation-list');
		if (this.isToggle('conversation-voice-toggle-input')) {
			totalPages++;
			const conversationItemDiv = document.createElement('div');
			conversationItemDiv.innerHTML = `${conversationMainIndex + 1}. Brand Share of Voice`;
			conversationItemDiv.setAttribute('class', 'overview-list-title');
			conversationItemDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			conversationMainIndex++;
			pdfConversationElement.appendChild(conversationItemDiv);
		}
		if (this.isToggle('conversation-sentiment-toggle-input')) {
			totalPages++;
			const conversationItemDiv = document.createElement('div');
			conversationItemDiv.innerHTML = `${conversationMainIndex + 1}. Brand Sentiment`;
			conversationItemDiv.setAttribute('class', 'overview-list-title');
			conversationItemDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			conversationMainIndex++;
			pdfConversationElement.appendChild(conversationItemDiv);
		}
		if (
			this.isToggle('conversation-topic-toggle-input') ||
			this.isToggle('conversation-keywords-toggle-input') ||
			this.isToggle('conversation-products-toggle-input')
		) {
			totalPages++;
			const conversationItemDiv = document.createElement('div');
			conversationItemDiv.innerHTML = `${conversationMainIndex + 1}. Categories`;
			conversationItemDiv.setAttribute('class', 'overview-list-title');
			conversationItemDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			conversationMainIndex++;

			pdfConversationElement.appendChild(conversationItemDiv);
			if (this.isToggle('conversation-topic-toggle-input')) {
				const conversationCategorySubItem = document.createElement('div');
				conversationCategorySubItem.innerHTML = `${sublistPrefixes[conversationCategoryIndex]}. Topic`;
				conversationCategorySubItem.setAttribute('class', 'overview-list-value');
				conversationCategorySubItem.setAttribute(
					'style',
					'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;'
				);
				conversationCategoryIndex++;
				pdfConversationElement.appendChild(conversationCategorySubItem);
			}
			if (this.isToggle('conversation-keywords-toggle-input')) {
				const conversationCategorySubItem = document.createElement('div');
				conversationCategorySubItem.innerHTML = `${sublistPrefixes[conversationCategoryIndex]}. Keywords`;
				conversationCategorySubItem.setAttribute('class', 'overview-list-value');
				conversationCategorySubItem.setAttribute(
					'style',
					'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;'
				);
				conversationCategoryIndex++;
				pdfConversationElement.appendChild(conversationCategorySubItem);
			}
			if (this.isToggle('conversation-products-toggle-input')) {
				const conversationCategorySubItem = document.createElement('div');
				conversationCategorySubItem.innerHTML = `${sublistPrefixes[conversationCategoryIndex]}. Products`;
				conversationCategorySubItem.setAttribute('class', 'overview-list-value');
				conversationCategorySubItem.setAttribute(
					'style',
					'font-size: 30px;margin-left: 30px;margin-top: 10px;margin-bottom: 10px;'
				);
				pdfConversationElement.appendChild(conversationCategorySubItem);
			}
		}
		if (this.isToggle('conversation-word-toggle-input')) {
			totalPages++;
			const conversationItemDiv = document.createElement('div');
			conversationItemDiv.innerHTML = `${conversationMainIndex + 1}. Word Cloud`;
			conversationItemDiv.setAttribute('class', 'overview-list-title');
			conversationItemDiv.setAttribute(
				'style',
				'font-size: 30px;font-weight: 500;margin-left: 10px;margin-top: 15px;margin-bottom: 15px;'
			);
			pdfConversationElement.appendChild(conversationItemDiv);
		}

		//custom conversation
		if (this.isToggle('custom-conversation-toggle-0-input')) {
			totalPages++;
		}
		if (this.isToggle('custom-conversation-toggle-1-input')) {
			totalPages++;
		}
		if (this.isToggle('custom-conversation-toggle-2-input')) {
			totalPages++;
		}

		//screenshot
		totalPages++;
		if (this.isToggle('screenshots-top-toggle-input')) {
			totalPages += 2;
		}

		let screenshotsTextElement = document.getElementById('screenshot_supporting_text');
		if (screenshotsTextElement && screenshotsTextElement.innerHTML.length > 200) {
			totalPages++;
		}

		let overviewSupportTextElement = document.getElementById('overview_support_text');
		if (overviewSupportTextElement) {
			totalPages++;
		}

		// end page
		totalPages++;

		return totalPages;
	}

	async printKpiSectionHeader(idPrefix, title, totalPages, currentPage, pageNum, localTotalPages) {
		if (pageNum === Math.floor(pageNum) && pageNum !== 1) {
			await this.generatePDFPage(
				`${idPrefix}-title-${pageNum}`,
				title,
				currentPage,
				totalPages,
				true,
				true,
				true,
				true
			);
		}
	}

	isLeftOnKpi(pageNum) {
		if (pageNum !== Math.floor(pageNum)) {
			return true;
		}
		return false;
	}

	async addSupportingText(id, sectionName, currentPage, totalPages) {
		let textElement = document.getElementById(id) as HTMLElement;
		if (textElement) {
			let height = textElement.clientHeight;
			let textImage = await domtoimage.toPng(textElement);
			if (textElement.innerHTML.length <= 200) {
				this.pdfGenerator.addImage(textImage, 'PNG', 200, 1020 - height, 1500, height, '', 'FAST');

				return false;
			} else {
				await this.pdfGenerator.addPage();
				await this.generatePDFHeader(sectionName);
				await this.generatePDFFooter(currentPage, totalPages);
				this.pdfGenerator.addImage(textImage, 'PNG', 200, 400, 1500, height, '', 'FAST');
				return true;
			}
		}
		return false;
	}

	async generatePDFPage(
		domId,
		sectionName,
		currentPage,
		totalPages,
		showHeader = true,
		showFooter = true,
		addPage = false,
		kpiHead = false,
		kpiLeft = false,
		kpiRight = false
	) {
		const content = document.getElementById(domId);
		if (content && (content.offsetHeight >= 0 || domId.indexOf('screenshots') >= 0)) {
			if (addPage) {
				await this.pdfGenerator.addPage();
			}
			if (showHeader) {
				await this.generatePDFHeader(sectionName);
			}
			await this.generatePDFContent(domId, kpiHead, kpiLeft, kpiRight);
			if (showFooter) {
				await this.generatePDFFooter(currentPage, totalPages);
			}
		}
	}

	maxOverviewHeight() {
		let width = 0;
		let thirdCol = 0;
		let secondCol = 0;
		if (this.brandCommunity?.privacy === 'OPEN') {
			if (this.isTotalMembersVisible) {
				width++;
			}
			if (this.isTotalEngagementVisible) {
				secondCol++;
			}
			if (this.isMemberToAdminPostRatioVisible) {
				secondCol++;
			}
			if (this.isTotalEngagementVisible || this.isMemberToAdminPostRatioVisible) {
				width++;
			}
			if (this.isTotalViewsVisible) {
				thirdCol++;
			}
			if (this.isAverageMonthlyViewsVisible) {
				thirdCol++;
			}
			if (this.isAverageDailyViews) {
				thirdCol++;
			}
			if (this.isTotalViewsVisible || this.isAverageMonthlyViewsVisible || this.isAverageDailyViews) {
				width++;
			}
		} else {
			if (this.isEngagementPercentageVisible) {
				secondCol++;
			}
			if (this.isDAUMAURatioVisible) {
				secondCol++;
			}
			if (this.isMemberToAdminPostRatioVisible) {
				secondCol++;
			}
			if (this.isTotalMembersVisible) {
				width++;
			}
			if (this.isEngagementPercentageVisible || this.isDAUMAURatioVisible || this.isMemberToAdminPostRatioVisible) {
				width++;
			}
		}

		this.overviewSecondCol = secondCol;
		this.overviewThirdCol = thirdCol;
		if (secondCol === 1 && thirdCol === 1) {
			this.overviewMaxHeight = 164;
			this.secondColHeight = 164;
			this.thirdColHeight = 164;
		} else if ((secondCol === 2 && thirdCol <= 2) || (thirdCol === 2 && secondCol <= 2)) {
			this.overviewMaxHeight = 164;
			if (secondCol === 1) {
				this.secondColHeight = 164;
			} else if (secondCol === 2) {
				this.secondColHeight = 72;
			}
			if (thirdCol === 1) {
				this.thirdColHeight = 164;
			} else if (thirdCol === 2) {
				this.thirdColHeight = 72;
			}
		} else {
			this.overviewMaxHeight = 256;
			if (secondCol === 1) {
				this.secondColHeight = 256;
			} else if (secondCol === 2) {
				this.secondColHeight = 118;
			} else {
				this.secondColHeight = 72;
			}
			if (thirdCol === 1) {
				this.thirdColHeight = 256;
			} else if (thirdCol === 2) {
				this.thirdColHeight = 118;
			} else {
				this.thirdColHeight = 72;
			}
		}
		if (width === 3) {
			this.overviewStyleClass = 'col-md-4';
		} else if (width === 2) {
			this.overviewStyleClass = 'col-md-6';
		} else {
			this.overviewStyleClass = 'col-md-12';
		}
	}

	async exportPdf() {
		this.maxOverviewHeight();
		const toggles = [
			'kpi-main-members-toggle-input',
			'kpi-total-views-toggle-input',
			'kpi-avg-month-toggle-input',
			'kpi-avg-day-toggle-input',
			'kpi-main-engagement-toggle-input',
			'kpi-total-members-toggle-input',
			'kpi-dau-ratio-toggle-input',
			'kpi-monthly-users-toggle-input',
			'kpi-monthly-percent-toggle-input',
			'kpi-daily-users-toggle-input',
			'kpi-daily-percent-toggle-input',
			'kpi-posts-toggle-input',
			'kpi-comments-toggle-input',
			'kpi-conversations-toggle-input',
			'kpi-reactions-toggle-input',
			'kpi-total-engagement-toggle-input',
			'kpi-average-percent-toggle-input',
			'kpi-average-engagement-toggle-input',
			'kpi-average-post-toggle-input',
			'kpi-surveys-toggle-input',
			'kpi-impressions-toggle-input',
			'kpi-membership-toggle-input',
			'community-gender-toggle-input',
			'community-age-toggle-input',
			'community-country-toggle-input',
			'community-city-toggle-input',
			'conversation-voice-toggle-input',
			'conversation-sentiment-toggle-input',
			'conversation-topic-toggle-input',
			'conversation-keywords-toggle-input',
			'conversation-products-toggle-input',
			'conversation-word-toggle-input',
			'custom-conversation-toggle-0-input',
			'custom-conversation-toggle-1-input',
			'custom-conversation-toggle-2-input',
			'screenshots-top-toggle-input'
		];
		const charts = [
			'kpi-main-members-chart',
			'kpi-main-engagement-chart',
			'membersOnboardedChartCBR',
			'DauMauChartCBR',
			'MonthlyActiveUsersChartCBR',
			'monthlyActiveUsersPercentageChartCBR',
			'dailyActiveUsersChartCBR',
			'dailyActiveUsersPercentageChartCBR',
			'postsChartCBR',
			'commentsChartCBR',
			'conversationsChartCBR',
			'reactionsChartCBR',
			'engagementChartCBR',
			'percentageEngagementChartCBR',
			'engagementPerPostChartCBR',
			'memberAdminPostRatioCBR',
			'surveysCBR',
			'impressionsCBR',
			'membershipRequestsChartCBR',
			'community-gender-chart',
			'community-age-chart',
			'community-country-chart',
			'community-city-chart',
			'conversation-voice-chart',
			'conversation-sentiment-chart',
			'conversation-topic-chart',
			'conversation-keywords-chart',
			'conversation-products-chart',
			'conversation-word-chart',
			'custom-conversation-chat-0',
			'custom-conversation-chat-1',
			'custom-conversation-chat-2',
			'screenshots-top-chart'
		];

		// document.getElementById('dashboard-wrapper').classList.add('exporting');

		// for (let i = 0; i < toggles.length; i++) {
		// 	this.hideChart(toggles[i], charts[i]);
		// }

		if (!this.pdfExporting) {
			this.pdfExporting = true;
			this.pdfGenerator = new jsPDF('l', 'px', [1920, 1080]);
			let docWidth = 1920;
			let docHeight = 1080;

			this.showAllKPICharts = true;
			let kpiChartTitles = document.querySelectorAll('.for-pdf-title');
			for (let i = 0; i < kpiChartTitles.length; i++) {
				kpiChartTitles[i].classList.add('show');
			}

			let totalPages = this.getTotalPages();
			let currentPage = 1;

			const overviewTotalMembers = document.getElementById('overview-total-members');
			const pdfOverviewTotalMembers = document.getElementById('pdf-overview-total-value');
			if (overviewTotalMembers) {
				pdfOverviewTotalMembers.innerHTML = overviewTotalMembers.getAttribute('data-value');
			}

			if (this.brandCommunity?.privacy !== 'OPEN') {
				const overviewEngagement = document.getElementById('overview-engagement-value');
				const pdfOverviewEngagement = document.getElementById('pdf-overview-engagement-value');
				if (overviewEngagement) {
					pdfOverviewEngagement.innerHTML = overviewEngagement.getAttribute('data-value');
				}

				const overviewDau = document.getElementById('overview-dau-value');
				const pdfOverviewDau = document.getElementById('pdf-overview-dau-value');
				if (overviewDau) {
					pdfOverviewDau.innerHTML = overviewDau.getAttribute('data-value');
				}

				const overviewAverage = document.getElementById('overview-average-value');
				const pdfOverviewAverage = document.getElementById('pdf-overview-average-value');
				if (overviewAverage) {
					pdfOverviewAverage.innerHTML = overviewAverage.getAttribute('data-value');
				}
			} else {
				const overviewEngagement = document.getElementById('overview-total-engage');
				const pdfOverviewEngagement = document.getElementById('pdf-overview-engagement-value');
				if (overviewEngagement) {
					pdfOverviewEngagement.innerHTML = overviewEngagement.getAttribute('data-value');
				}

				const overviewAvgMembers = document.getElementById('overview-avg-members');
				const pdfOverviewMembers = document.getElementById('pdf-avg-member-value');
				if (overviewAvgMembers) {
					pdfOverviewMembers.innerHTML = overviewAvgMembers.getAttribute('data-value');
				}

				const overviewTotalViews = document.getElementById('overview-total-views');
				const pdfOverviewViews = document.getElementById('pdf-overview-views-value');
				if (overviewTotalViews) {
					pdfOverviewViews.innerHTML = overviewTotalViews.getAttribute('data-value');
				}

				const overviewAvgMonthly = document.getElementById('overview-average-monthly');
				const pdfAvgMonthly = document.getElementById('pdf-avg-monthly-value');
				if (overviewAvgMonthly) {
					pdfAvgMonthly.innerHTML = overviewAvgMonthly.getAttribute('data-value');
				}

				const overviewAvgDaily = document.getElementById('overview-average-daily');
				const pdfAvgDaily = document.getElementById('pdf-avg-daily-value');
				if (overviewAvgDaily) {
					pdfAvgDaily.innerHTML = overviewAvgDaily.getAttribute('data-value');
				}
			}

			const reportDate = dayjs().format('D MMM, YYYY');
			let reportFor = 'Last 4 weeks';
			/// @ts-ignore
			const timePeriod = document.getElementById('selectedTimePeriodCBR') as HTMLInputElement;

			if (timePeriod.value == 'fourWeeks') {
				reportFor = 'Last 4 weeks';
			} else if (timePeriod.value == 'threeMonths') {
				reportFor = 'Last 3 months';
			} else if (timePeriod.value == 'sixMonths') {
				reportFor = 'Last 6 months';
			} else if (timePeriod.value == 'oneYear') {
				reportFor = 'Last 1 year';
			} else if (timePeriod.value == 'lifetime') {
				reportFor = 'Lifetime';
			}

			let generatedOnDom = document.getElementById('generated-on');
			generatedOnDom.innerHTML = reportDate;
			let generatedForDom = document.getElementById('generated-for');
			generatedForDom.innerHTML = reportFor;

			await this.generatePDFPage('home-landing', '', currentPage, totalPages, false, true, false);
			currentPage++;

			await this.generatePDFPage('overview-index', 'Overview', currentPage, totalPages, false, true, true);
			currentPage++;

			await this.generatePDFPage('overview-landing-full', '', currentPage, totalPages, false, false, true);
			currentPage++;

			let overviewSupportTextElement = document.getElementById('overview_support_text');
			if (overviewSupportTextElement) {
				await this.addSupportingText('overview_support_text', '', currentPage, totalPages);
				currentPage++;
			}

			await this.generatePDFPage('kpi-index', 'KPI', currentPage, totalPages, false, true, true);
			currentPage++;

			if (this.isToggle('kpi-main-members-toggle-input') || this.isToggle('kpi-main-engagement-toggle-input')) {
				await this.generatePDFPage(
					'kpi-charts-show-section',
					'KPIs > KPI Funnels',
					currentPage,
					totalPages,
					true,
					true,
					true
				);
				currentPage++;
			}
			let kpiMembersPage = this.getKpiMemberPages();
			if (kpiMembersPage > 0) {
				let pageNum = 1;
				for (let i = 0; i < 3; i++) {
					let title = document.querySelector(`#kpi-chart-members-title-${i + 1} h3`);
					if (title) {
						title.innerHTML = `Members (${i + 1}/${kpiMembersPage})`;
					}
				}
				await this.generatePDFPage(
					`kpi-chart-members-title-${pageNum}`,
					'KPIs > KPI Charts',
					currentPage,
					totalPages,
					true,
					true,
					true,
					true
				);
				if (this.isToggle('kpi-total-members-toggle-input')) {
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-total-members-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.brandCommunity?.privacy === 'OPEN') {
					if (this.isToggle('kpi-total-views-toggle-input')) {
						pageNum += 0.5;
						currentPage += 0.5;
						let isLeft = this.isLeftOnKpi(pageNum);
						await this.generatePDFPage(
							'kpi-total-views-chart',
							'KPIs > KPI Charts',
							currentPage,
							totalPages,
							false,
							false,
							false,
							false,
							isLeft,
							!isLeft
						);
					}
					if (this.isToggle('kpi-avg-month-toggle-input')) {
						await this.printKpiSectionHeader(
							'kpi-chart-members',
							'KPIs > KPI Charts',
							totalPages,
							currentPage,
							pageNum,
							kpiMembersPage
						);
						pageNum += 0.5;
						currentPage += 0.5;
						let isLeft = this.isLeftOnKpi(pageNum);
						await this.generatePDFPage(
							'kpi-avg-month-chart',
							'KPIs > KPI Charts',
							currentPage,
							totalPages,
							false,
							false,
							false,
							false,
							isLeft,
							!isLeft
						);
					}
					if (this.isToggle('kpi-avg-day-toggle-input')) {
						await this.printKpiSectionHeader(
							'kpi-chart-members',
							'KPIs > KPI Charts',
							totalPages,
							currentPage,
							pageNum,
							kpiMembersPage
						);
						pageNum += 0.5;
						currentPage += 0.5;
						let isLeft = this.isLeftOnKpi(pageNum);
						await this.generatePDFPage(
							'kpi-avg-day-chart',
							'KPIs > KPI Charts',
							currentPage,
							totalPages,
							false,
							false,
							false,
							false,
							isLeft,
							!isLeft
						);
					}
				}
				if (this.isToggle('kpi-dau-ratio-toggle-input')) {
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-dau-ratio-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-monthly-users-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-members',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiMembersPage
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-monthly-users-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-monthly-percent-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-members',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiMembersPage
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-monthly-percent-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-daily-percent-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-members',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiMembersPage
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-daily-percent-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-daily-users-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-members',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiMembersPage
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-daily-users-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
			}
			if (currentPage !== Math.floor(currentPage)) {
				currentPage += 0.5;
			}
			let members_text_result = await this.addSupportingText(
				'kpi_members_text',
				'KPIs > KPI Charts',
				currentPage,
				totalPages
			);
			if (members_text_result) {
				currentPage++;
			}
			let kpiActivity = this.getKpiActivityPages();
			if (kpiActivity > 0) {
				let pageNum = 1;
				for (let i = 0; i < 4; i++) {
					let title = document.querySelector(`#kpi-chart-activity-title-${i + 1} h3`);
					if (title) {
						title.innerHTML = `Activity (${i + 1}/${kpiActivity})`;
					}
				}
				await this.generatePDFPage(
					`kpi-chart-activity-title-${pageNum}`,
					'KPIs > KPI Charts',
					currentPage,
					totalPages,
					true,
					true,
					true,
					true
				);
				if (this.isToggle('kpi-posts-toggle-input')) {
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-posts-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-comments-toggle-input')) {
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-comments-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-conversations-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-activity',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiActivity
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-conversations-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-reactions-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-activity',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiActivity
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-reactions-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (currentPage !== Math.floor(currentPage)) {
					currentPage += 0.5;
					pageNum += 0.5;
				}
				if (this.isToggle('kpi-total-engagement-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-activity',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiActivity
					);
					pageNum++;
					currentPage++;
					await this.generatePDFPage(
						'kpi-total-engagement-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						false
					);
				}
				if (this.isToggle('kpi-average-percent-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-activity',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiActivity
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-average-percent-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-average-engagement-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-activity',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiActivity
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-average-engagement-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
			}
			if (currentPage !== Math.floor(currentPage)) {
				currentPage += 0.5;
			}
			let engagement_text_result = await this.addSupportingText(
				'kpi_engagement_text',
				'KPIs > KPI Charts',
				currentPage,
				totalPages
			);
			if (engagement_text_result) {
				currentPage++;
			}

			let kpiInsight = this.getKpiInsightPages();
			if (kpiInsight > 0) {
				let pageNum = 1;
				for (let i = 0; i < 2; i++) {
					let title = document.querySelector(`#kpi-chart-insight-title-${i + 1} h3`);
					if (title) {
						title.innerHTML = `Insights (${i + 1}/${kpiInsight})`;
					}
				}
				await this.generatePDFPage(
					`kpi-chart-insight-title-${pageNum}`,
					'KPIs > KPI Charts',
					currentPage,
					totalPages,
					true,
					true,
					true,
					true
				);
				if (this.isToggle('kpi-average-post-toggle-input')) {
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-average-post-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-surveys-toggle-input')) {
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-surveys-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-impressions-toggle-input')) {
					await this.printKpiSectionHeader(
						'kpi-chart-insight',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiInsight
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-impressions-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
				if (this.isToggle('kpi-membership-toggle-input') && this.brandCommunity?.privacy !== 'OPEN') {
					await this.printKpiSectionHeader(
						'kpi-chart-insight',
						'KPIs > KPI Charts',
						totalPages,
						currentPage,
						pageNum,
						kpiInsight
					);
					pageNum += 0.5;
					currentPage += 0.5;
					let isLeft = this.isLeftOnKpi(pageNum);
					await this.generatePDFPage(
						'kpi-membership-chart',
						'KPIs > KPI Charts',
						currentPage,
						totalPages,
						false,
						false,
						false,
						false,
						isLeft,
						!isLeft
					);
				}
			}
			if (currentPage !== Math.floor(currentPage)) {
				currentPage += 0.5;
			}
			let insight_text_result = await this.addSupportingText(
				'kpi_insight_text',
				'KPIs > KPI Charts',
				currentPage,
				totalPages
			);
			if (insight_text_result) {
				currentPage++;
			}

			await this.generatePDFPage(
				'community-index',
				'Community Demographics',
				currentPage,
				totalPages,
				false,
				true,
				true
			);
			currentPage++;

			if (this.isToggle('community-gender-toggle-input') || this.isToggle('community-age-toggle-input')) {
				await this.generatePDFPage(
					'gender-distribution-chart',
					'Community Demographics',
					currentPage,
					totalPages,
					true,
					true,
					true
				);
				currentPage++;
			}
			if (this.isToggle('community-country-toggle-input') || this.isToggle('community-city-toggle-input')) {
				await this.generatePDFPage(
					'country-wise-chart',
					'Community Demographics',
					currentPage,
					totalPages,
					true,
					true,
					true
				);
				currentPage++;
			}
			await this.generatePDFPage('conversation-index', 'Conversation', currentPage, totalPages, false, true, true);
			currentPage++;

			if (this.isToggle('conversation-voice-toggle-input')) {
				await this.generatePDFPage(
					'brand-share-voice-chart',
					'Conversation',
					currentPage,
					totalPages,
					true,
					true,
					true
				);
				currentPage++;
			}
			if (this.isToggle('conversation-sentiment-toggle-input')) {
				await this.generatePDFPage('brand-sentiment-chart', 'Conversation', currentPage, totalPages, true, true, true);
				currentPage++;
			}
			if (
				this.isToggle('conversation-topic-toggle-input') ||
				this.isToggle('conversation-keywords-toggle-input') ||
				this.isToggle('conversation-products-toggle-input')
			) {
				await this.generatePDFPage('topics-chart', 'Conversation', currentPage, totalPages, true, true, true);
				currentPage++;
			}
			if (this.isToggle('conversation-word-toggle-input')) {
				await this.generatePDFPage('word-cloud-chart', 'Conversation', currentPage, totalPages, true, true, true);
				currentPage++;
			}

			for (let i = 0; i < this.customConversations.length; i++) {
				if (this.customConversations[i].toggle && this.isToggle('custom-conversation-toggle-' + i + '-input')) {
					await this.generatePDFPage(
						'custom-conversation-chart-' + i,
						'Custom Conversation',
						currentPage,
						totalPages,
						true,
						true,
						true
					);
					currentPage++;
				}
			}

			await this.generatePDFPage('screenshot-index', 'Screenshots', currentPage, totalPages, false, true, true);
			currentPage++;

			if (this.isToggle('screenshots-top-toggle-input')) {
				await this.generatePDFPage('screenshots-top-chart-1', 'Screenshots', currentPage, totalPages, true, true, true);
				currentPage++;
				await this.generatePDFPage('screenshots-top-chart-2', 'Screenshots', currentPage, totalPages, true, true, true);
				currentPage++;
			}

			await this.addSupportingText('screenshot_supporting_text', 'Screenshots', currentPage, totalPages);

			// add end page
			const centerX = docWidth / 2;
			const centerY = docHeight / 2;
			this.pdfGenerator.addPage();
			this.pdfGenerator.setFontSize(100);
			this.pdfGenerator.setTextColor(51, 51, 79);
			this.pdfGenerator.text(centerX - 180, centerY - 40, 'End of Report');
			this.pdfGenerator.setFontSize(36);
			this.pdfGenerator.setTextColor(112, 112, 132);
			this.pdfGenerator.text(centerX - 210, centerY + 20, 'Please ');
			this.pdfGenerator.setTextColor(0, 0, 255);
			this.pdfGenerator.textWithLink('click here', centerX - 115, centerY + 20, {
				url: 'https://www.convosight.com/app/brand-login'
			});
			this.pdfGenerator.setTextColor(112, 112, 132);
			this.pdfGenerator.text(centerX + 10, centerY + 20, 'to view more information');
			this.pdfGenerator.text(centerX - 110, centerY + 55, 'associated with this report');
			await this.generatePDFFooter(currentPage, totalPages);
			for (let i = 0; i < kpiChartTitles.length; i++) {
				kpiChartTitles[i].classList.remove('show');
			}

			this.pdfGenerator.save('brand_community_report.pdf');

			this.showAllKPICharts = false;
			this.pdfExporting = false;
		}

		document.getElementById('dashboard-wrapper').classList.remove('exporting');
		(document.getElementsByClassName('wrapper')[0] as HTMLElement).style.display = 'none';

		for (let i = 0; i < toggles.length; i++) {
			this.showChart(toggles[i], charts[i]);
		}
	}

	getDaysBetweenStartAndEndOfWeek() {
		this.weekLabels.forEach(label => {
			this.daysOfWeekLabels[label.startOfWeek] = [];
			for (let i = 0; i < 7; i++) {
				const toBeDisabled = new DateTime(label.startOfWeek).add(i, 'days').diff(new DateTime().dayJsObj, 'days') > -1;
				this.daysOfWeekLabels[label.startOfWeek].push({
					date: new DateTime(label.startOfWeek).add(i, 'days').format('YYYY-MM-DD'),
					toBeDisabled: toBeDisabled
				});
			}
		});
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
