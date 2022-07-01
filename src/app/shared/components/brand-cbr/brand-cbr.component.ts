import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTime} from '@sharedModule/models/date-time';
import {FileService} from '@sharedModule/services/file.service';
import {BrandCommunity, FacebookInsightsFileStatus} from '@sharedModule/models/graph-ql.model';
import {SelectedTimePeriod} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {BrandModel} from '@sharedModule/models/brand.model';
import {BrandService} from '@brandModule/services/brand.service';
import {CMCReportv3S3Data} from '@sharedModule/components/cmcReport-v3/models/s3Data.interface';
import * as _ from 'lodash';

@Component({
	selector: 'app-brand-CBR',
	templateUrl: './brand-cbr.component.html',
	styleUrls: ['./brand-cbr.component.scss']
})
export class BrandCbrComponent extends BaseComponent implements OnInit, OnDestroy {
	groupId: string;
	selectedTimePeriod = 'fourWeeks';
	private dateTimeHelper: DateTimeHelper;
	groupTimezoneName: string | null;
	group: GroupModel;
	overview: any;
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
	private brandId: any;
	brand: BrandModel;
	showEditDialog = false;
	editType;
	weekLabels;
	monthLabels;
	editMAUInput = {};
	editFormType;
	updating = false;
	showKpiComponent = true;
	targetKeys = [
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
	targets;
	@Input() _targets;
	submitted = false; // SUBMITTING FALSE
	showAddCustomDialog = false;
	customDialogType = 'add';
	editCustomConversationIndex = 0;
	customConversations = [];
	customConversation = {
		title: '',
		description: '',
		buckets: []
	};
	customConversationBucket = {
		name: '',
		mentions: '',
		keywords: '',
		visibility: true
	};
	jsonDataStringForCBR;
	@Input() isFromCSAdmin;
	@Input() showAllPDF = false;
	showAllCharts = false;
	overviewStyleClass = 'col-md-4';
	overviewSecondCol = 2;
	overviewThirdCol = 3;
	overviewMaxHeight = 256;
	secondColHeight = 72;
	thirdColHeight = 72;
	@Input() supportingTextInput;
	supportingText;

	constructor(
		injector: Injector,
		private router: Router,
		private route: ActivatedRoute,
		private groupService: GroupsService,
		private brandCommunityReportService: BrandCommunityReportService,
		private fileService: FileService,
		private brandService: BrandService
	) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.groupId = this.route.snapshot.params['groupId'];
		this.brandId = this.route.snapshot.params['brandId'];
		if (this.isFromCSAdmin) {
			this.jsonDataStringForCBR = JSON.parse(this.brandService.jsonDataStringForCBR);
			this.targets = typeof this._targets === 'string' ? JSON.parse(this._targets) : this._targets;
			this.supportingText = this.supportingTextInput;
		} else {
			const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
			const brandCommunities = response['items'];
			this.brandCommunity = brandCommunities.find(community => community.groupId === this.groupId);
			await this.setReportData(this.brandCommunity.brandCommunityReports3Key);
			const targets = this.brandCommunity.targets;
			this.targets = JSON.parse(targets);
			const supportingText = this.brandCommunity.supportingText;
			this.supportingText = JSON.parse(supportingText);
		}
		this.group = await this.groupService.getGroup(this.groupId);

		this.editMAUInput['targets'] = typeof this.targets === 'string' ? JSON.parse(this.targets) : this.targets;
		this.loadOverviewStats(this.selectedTimePeriod);
		this.subscriptionsToDestroy.push(
			this.brandService.brands.subscribe(async brands => {
				if (!brands) {
					return;
				}
				this.brand = brands.find(_brand => _brand.id === this.brandId);
				const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
				const brandCommunities = response['items'];
				this.brandCommunity = brandCommunities.find(community => community.groupId === this.groupId);
				this.maxOverviewHeight();
			})
		);
		this.maxOverviewHeight();
	}

	ngOnChanges(changes): void {
		if (changes.showAllPDF && changes.showAllPDF.currentValue) {
			this.showAllCharts = true;
		} else {
			this.showAllCharts = false;
		}
	}

	async setReportData(s3ReportUrl: string) {
		let data = await this.fileService.getDataFromS3(s3ReportUrl);
		if (data) {
			try {
				data = new TextDecoder('utf-8').decode(data);
				this.getCampaignReportDataOnLoad(data, s3ReportUrl);
			} catch (e) {
				const reader = new FileReader();

				reader.addEventListener('loadend', e => {
					this.getCampaignReportDataOnLoad(reader.result, s3ReportUrl);
				});

				data = reader.readAsText(data);
			}
		}
	}

	getCampaignReportDataOnLoad(data, key) {
		let data1 = {};

		try {
			data1 = JSON.parse(decodeURIComponent(data));
		} catch (e) {
			try {
				data1 = JSON.parse(decodeURIComponent(JSON.parse(data)));
			} catch (error) {}
		}
		if (!_.isEmpty(data1)) {
			this.jsonDataStringForCBR = _.cloneDeep(data1);
		}
	}

	changeTimePeriod() {
		this.loadOverviewStats(this.selectedTimePeriod);
	}

	async loadOverviewStats(selectedTimePeriod) {
		if (!this.groupId) {
			return;
		}
		switch (selectedTimePeriod) {
			case SelectedTimePeriod.fourWeeks:
				this.timePeriodForReportGeneration = {
					startDate: new DateTime().startOf('week').subtract(3, 'weeks').dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.threeMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(2, 'months').dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.sixMonths:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.currentMonthStart.subtract(5, 'months').dayJsObj,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.oneYear:
				this.timePeriodForReportGeneration = {
					startDate: this.dateTimeHelper.lastYearStart.dayJsObj,
					endDate: this.dateTimeHelper.lastYearEnd.dayJsObj
				};
				break;
			case SelectedTimePeriod.lifetime:
				this.timePeriodForReportGeneration = {
					startDate: this.group.groupCreatedAtUTC,
					endDate: this.dateTimeHelper.yesterdayEnd.dayJsObj
				};
				break;
		}
		if (this.jsonDataStringForCBR) {
			this.overview = this.jsonDataStringForCBR['overview'][selectedTimePeriod];
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

	updateEditValues(type, event, toggleKey = null) {
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

	async updateKPIs() {
		this.updating = true;
		await this.brandCommunityReportService.updateBrandCommunityReport({
			brandId: this.brandId,
			groupId: this.groupId,
			MAUValues: JSON.stringify(this.editMAUInput['MAUValues']),
			DAUValues: JSON.stringify(this.editMAUInput['DAUValues']),
			MAUValuesPercentage: JSON.stringify(this.editMAUInput['MAUValuesPercentage']),
			DAUValuesPercentage: JSON.stringify(this.editMAUInput['DAUValuesPercentage']),
			impressions: JSON.stringify(this.editMAUInput['impressions']),
			targets: JSON.stringify(this.editMAUInput['targets'])
		});
		this.closeEditDialog();
		this.updating = false;
		this.resetChildComponent();
	}

	closeEditDialog() {
		this.showEditDialog = false;
		this.editMAUInput['DAUValues'] = {};
		this.editMAUInput['impressions'] = {};
		this.editMAUInput['MAUValues'] = {};
		this.editMAUInput['MAUValuesPercentage'] = {};
		this.editMAUInput['DAUValuesPercentage'] = {};
		this.editMAUInput['targets'] = typeof this.targets === 'string' ? JSON.parse(this.targets) : this.targets;
		this.showEditDialog = false;
	}

	getKeysOfObject(object) {
		return Object.keys(object);
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

	onAddCustomConversation() {
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
			if (this.customDialogType == 'add') {
				this.customConversations.push({...this.customConversation});
				this.customConversations = [...this.customConversations];
			} else if (this.customDialogType == 'edit') {
				this.customConversations.splice(this.editCustomConversationIndex, 1, this.customConversation);
				this.customConversations = [...this.customConversations];
			}
			this.customConversation = {
				title: '',
				description: '',
				buckets: []
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

	async resetChildComponent() {
		const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
		const brandCommunities = response['items'];
		this.brandCommunity = brandCommunities.find(community => community.brandId === this.brandId);
		const targets = this.brandCommunity.targets;
		this.targets = JSON.parse(targets);
	}

	maxOverviewHeight() {
		let width = 0;
		let thirdCol = 0;
		let secondCol = 0;
		if (this.brandCommunity?.privacy === 'OPEN') {
			if (this.jsonDataStringForCBR['overview']?.isTotalMembersVisible) {
				width++;
			}
			if (this.jsonDataStringForCBR['overview']?.isTotalEngagementVisible) {
				secondCol++;
			}
			if (this.jsonDataStringForCBR['overview']?.isMemberToAdminPostRatioVisible) {
				secondCol++;
			}
			if (
				this.jsonDataStringForCBR['overview']?.isTotalEngagementVisible ||
				this.jsonDataStringForCBR['overview']?.isMemberToAdminPostRatioVisible
			) {
				width++;
			}
			if (this.jsonDataStringForCBR['overview']?.isTotalViewsVisible) {
				thirdCol++;
			}
			if (this.jsonDataStringForCBR['overview']?.isAverageMonthlyViewsVisible) {
				thirdCol++;
			}
			if (this.jsonDataStringForCBR['overview']?.isAverageDailyViews) {
				thirdCol++;
			}
			if (
				this.jsonDataStringForCBR['overview']?.isTotalViewsVisible ||
				this.jsonDataStringForCBR['overview']?.isAverageMonthlyViewsVisible ||
				this.jsonDataStringForCBR['overview']?.isAverageDailyViews
			) {
				width++;
			}
		} else {
			if (this.jsonDataStringForCBR['overview']?.isEngagementPercentageVisible) {
				secondCol++;
			}
			if (this.jsonDataStringForCBR['overview']?.isDAUMAURatioVisible) {
				secondCol++;
			}
			if (this.jsonDataStringForCBR['overview']?.isMemberToAdminPostRatioVisible) {
				secondCol++;
			}
			if (this.jsonDataStringForCBR['overview']?.isTotalMembersVisible) {
				width++;
			}
			if (
				this.jsonDataStringForCBR['overview']?.isEngagementPercentageVisible ||
				this.jsonDataStringForCBR['overview']?.isDAUMAURatioVisible ||
				this.jsonDataStringForCBR['overview']?.isMemberToAdminPostRatioVisible
			) {
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

	isKPISectionHidden() {
		return (
			this.jsonDataStringForCBR?.kpi?.isAverageEngagementPerPosChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isAverageEngagementPercentageChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isCommentsChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isConversationsChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isDAUMAUChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isDailyActiveUsersChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isDailyActiveUsersPercentageChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isImpressionsChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isMemberAdminRatioChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isMemberTrapezoidChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isMembershipRequestsChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isMonthlyActiveUsersChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isMonthlyActiveUsersPercentageChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isPostsChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isReactionsChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isSurveysChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isTotalEngagementChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isTotalMembersOnboardedChartVisible ||
			this.jsonDataStringForCBR?.kpi?.isUserEngagementTrapezoidChartVisible
		);
	}

	isDemographicsSectionHidden() {
		return (
			this.jsonDataStringForCBR?.demographics?.isAgeWiseDistributionChartVisible ||
			this.jsonDataStringForCBR?.demographics?.isCityWiseUsersChartVisible ||
			this.jsonDataStringForCBR?.demographics?.isCountryWiseUsersChartVisible ||
			this.jsonDataStringForCBR?.demographics?.isGenderDistributionChartVisible
		);
	}

	isConversationsSectionHidden() {
		return (
			this.jsonDataStringForCBR?.conversations?.isBrandChartVisible ||
			this.jsonDataStringForCBR?.conversations?.isKeywordChartVisible ||
			this.jsonDataStringForCBR?.conversations?.isProductChartVisible ||
			this.jsonDataStringForCBR?.conversations?.isSentimentChartVisible ||
			this.jsonDataStringForCBR?.conversations?.isTopicChartVisible
		);
	}

	isCustomConversationsVisible() {
		return (
			this.jsonDataStringForCBR?.customConversations.filter(conversation => conversation.isConversationVisible)
				?.length > 0
		);
	}

	isScreenshotsSectionHidden() {
		return this.jsonDataStringForCBR?.screenshots?.isScreenshotsVisible;
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
