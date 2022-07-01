import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignStatusEnum} from '@sharedModule/models/graph-ql.model';
import * as _ from 'lodash';
import {utils, writeFile} from 'xlsx';

@Component({
	selector: 'app-create-brand-community-marketing-campaign',
	templateUrl: './create-brand-community-marketing-campaign.component.html',
	styleUrls: ['./create-brand-community-marketing-campaign.component.scss']
})
export class CreateBrandCommunityMarketingCampaignComponent extends BaseComponent implements OnInit, OnDestroy {
	selectedTab: string = 'communities';
	groupsLoaded = false;
	groupsSelectedForCampaignCreation;
	memberSizeOfGroupsSelectedForCampaignCreation;
	campaignDetails;
	CampaignCreationInput = {};
	selectedBrand;
	showCampaignSuccessPopup = false;
	campaignDetailFormValidStatus = false;
	showProceedToNextStep = true;
	showCommunityListPopup = false;
	isCsAdmin = true;
	campaignTasks = [];
	addNewTask = false;
	campaignCreationInProgress = false;
	communityName = '';
	selectedCampaignId;
	selectedCommunitiesId;

	constructor(
		injector: Injector,
		private brandService: BrandService,
		private router: Router,
		private route: ActivatedRoute,
		private campaignService: CampaignService,
		private createCampaignService: CreateCampaignService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.brandService.init();
		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(brand => {
				if (!brand) {
					return;
				}
				this.selectedBrand = brand;
			})
		);
		this.createCampaignService.name.subscribe(name => {
			if (name) {
				this.communityName = name;
			}
		});
	}

	formSubmitValue(formValue) {
		this.campaignDetails = formValue;
	}

	updateFormValidStatus(event) {
		this.campaignDetailFormValidStatus = event;
	}

	goToSelectCommunitiesTab() {
		this.selectedTab = 'communities';
		window.scrollTo(0, 0);
	}

	goToCampaignDetailsTab() {
		this.selectedTab = 'campaignDetails';
	}

	getGroupsSelectedForCampaignCreation(event) {
		this.memberSizeOfGroupsSelectedForCampaignCreation = 0;
		this.groupsSelectedForCampaignCreation = event;
		this.groupsSelectedForCampaignCreation.forEach(group => {
			this.memberSizeOfGroupsSelectedForCampaignCreation =
				this.memberSizeOfGroupsSelectedForCampaignCreation + group.memberCount;
		});
	}

	proceedToCampaignCreation() {
		this.goToCampaignDetailsTab();
	}

	async goToBrandManageCampaign() {
		await this.selectedBrand.resetDetails();
		this.router.navigate([
			'/cs-admin/brands/' + this.selectedBrand.id + '/edit-campaign/' + this.selectedCampaignId + '/old'
		]);
	}

	navigateToManageCampaign() {
		this.router.navigate(['/cs-admin/brands/' + this.selectedBrand.id + '/manage-brand-campaigns']);
	}

	areGroupsLoaded(event) {
		this.groupsLoaded = event;
	}

	hideCommunityListPopup(event) {
		this.showCommunityListPopup = event;
	}

	showNewTaskTab() {
		this.addNewTask = !this.addNewTask;
		if (this.campaignTasks && this.campaignTasks.length === 0) {
			this.campaignTasks = null;
		} else if (!this.campaignTasks) {
			this.campaignTasks = [];
		}
	}

	closeTaskDetailsView(event) {
		if (this.campaignTasks.length === 0) {
			this.campaignTasks = null;
		}
	}

	downloadCommunities() {
		const communityDetails = [];
		this.groupsSelectedForCampaignCreation.forEach(task => {
			const taskDet = {};
			taskDet['fbGroupId'] = task['fbGroupId'];
			taskDet['Group Id'] = task['groupId'];
			taskDet['Group Name'] = task['groupName'];
			taskDet['Category_Sub Category'] = task['category_subCategory'];
			taskDet['Coverage Image Url'] = task['coverImageUrl'];
			taskDet['Icon Url'] = task['iconUrl'];
			taskDet['Country'] = task['country'];
			taskDet['Activity Rate'] = task['last30DaysActivityRate'];
			taskDet['Engagement Rate'] = task['last30DaysEngagementRate'];
			taskDet['Member Count'] = task['memberCount'];
			taskDet['Conversation Count'] = task['conversationCount'];
			taskDet['Privacy'] = task['privacy'];

			communityDetails.push(taskDet);
		});
		const worksheet = utils.json_to_sheet(communityDetails);
		const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
		writeFile(workbook, `${this.communityName}_communities.xlsx`);
	}

	async createBrandCampaign() {
		this.campaignCreationInProgress = true;
		this.CampaignCreationInput['brandId'] = this.selectedBrand.id;
		this.CampaignCreationInput['brandName'] = this.selectedBrand.name;
		this.CampaignCreationInput['brandLogoURL'] = this.selectedBrand.iconUrl;
		this.CampaignCreationInput['status'] = CampaignStatusEnum.Draft;
		this.CampaignCreationInput['campaignName'] = this.campaignDetails.cmcReportName;
		this.CampaignCreationInput['details'] = this.campaignDetails.details;
		this.CampaignCreationInput['campaignBriefForCommunityAdmin'] = this.campaignDetails.details;
		this.CampaignCreationInput['KPIs'] = this.campaignDetails.KPIs;
		this.CampaignCreationInput['cmcType'] = this.campaignDetails.cmcType;
		this.CampaignCreationInput['endDateAtUTC'] = this.campaignDetails.endDate;
		this.CampaignCreationInput['startDateAtUTC'] = this.campaignDetails.startDate;
		this.CampaignCreationInput['keywordBrand'] = this.campaignDetails.keywordBrand;
		this.CampaignCreationInput['keywordCategory'] = this.campaignDetails.keywordCategory;
		this.CampaignCreationInput['keywords'] = this.campaignDetails.keywords;
		this.CampaignCreationInput['primaryObjective'] = this.campaignDetails.primaryObjective;
		this.CampaignCreationInput['secondaryObjective'] = this.campaignDetails.secondaryObjective;
		this.CampaignCreationInput['cmcReportName'] = this.campaignDetails.cmcReportName;
		this.CampaignCreationInput['keywordSubCategories'] = this.campaignDetails.keywordSubCategories;
		this.CampaignCreationInput['taskTitle'] = this.campaignDetails.taskTitle;
		this.CampaignCreationInput['campaignPeriod'] = this.campaignDetails.campaignPeriod;
		this.CampaignCreationInput['cmcReportVersion'] = 2;
		if (this.campaignDetails['defaultTaskDate']) {
			this.CampaignCreationInput['defaultTaskDate'] = new DateTime(
				new DateTime(this.campaignDetails['defaultTaskDate']).format('MM/DD/YYYY') +
					', ' +
					this.campaignDetails.publishTime,
				'MM/DD/YYYY, hh:mm A'
			)
				.utc()
				.add(this.campaignDetails['timezoneOffMins'], 'minutes')
				.utc()
				.toISOString();
			this.CampaignCreationInput['timezoneName'] = this.campaignDetails['timezoneName'];
		}

		// Preparation for create brand campaign payload
		if (this.CampaignCreationInput) {
			try {
				this.campaignDetails = await this.campaignService.createBrandCampaign(this.CampaignCreationInput);
				this.selectedCampaignId = this.campaignDetails?.campaignId;
				this.createCMCampaignGroups(this.campaignDetails?.campaignId);
				this.campaignCreationInProgress = false;
			} catch (e) {
				this.alert.error(
					'Campaign creation unsuccessful',
					'We are unable to create campaign at this moment. Please try again later.'
				);
				this.campaignCreationInProgress = false;
			}
		}
	}

	async createCMCampaignGroups(campaignId) {
		const createCMCampaignGroupInput = [];
		const groupsSelectedForCampaignCreation = _.uniqBy(this.groupsSelectedForCampaignCreation, 'groupId');
		this.selectedCommunitiesId = [];
		groupsSelectedForCampaignCreation?.forEach(community => {
			const communityInfo = {};
			communityInfo['campaignId'] = campaignId;
			communityInfo['groupId'] = community['groupId'];
			communityInfo['fbGroupId'] = community['fbGroupId'];
			communityInfo['memberCount'] = community['memberCount'];
			communityInfo['engagementRate'] = community['last30DaysEngagementRate'];
			communityInfo['activityRate'] = community['last30DaysActivityRate'];
			communityInfo['categoryConversationCount'] = community['conversationCount'];
			communityInfo['groupName'] = community['groupName'];
			createCMCampaignGroupInput.push(communityInfo);
			this.selectedCommunitiesId.push(community['groupId']);
		});
		if (createCMCampaignGroupInput) {
			try {
				await this.campaignService.createCMCampaignGroups(createCMCampaignGroupInput);
				this.showCampaignSuccessPopup = true;
			} catch (e) {
				this.alert.error(
					'Campaign creation unsuccessful',
					'We are unable to create campaign at this moment. Please try again later.'
				);
			}
		}
	}

	disableActionOnConversationTrends(event) {
		this.showProceedToNextStep = !event;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
