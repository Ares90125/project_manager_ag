import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {CampaignStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {BrandModel} from '@sharedModule/models/brand.model';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignTypeEnum, UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {AlertService} from '@sharedModule/services/alert.service';
import * as _ from 'lodash';

import {environment} from '../../../../../../environments/environment';
import {CampaignGroupsModel} from '@sharedModule/models/campaign-groups.model';

@Component({
	selector: 'app-community-marketing-campaign-details',
	templateUrl: './community-marketing-campaign-details.component.html',
	styleUrls: ['./community-marketing-campaign-details.component.scss']
})
export class CommunityMarketingCampaignDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
	brands: BrandModel[] = [];
	brand: BrandModel;
	campaigns: CampaignModel[] = [];
	campaign: CampaignModel;
	campaignDetailsForm: FormGroup;
	minDate = new DateTime().toDate();
	campaignTasks: CampaignTaskModel[];
	campaignTaskViewDetails;
	campaignTaskDetails = {name: '', numberOfGroups: 0, numberOfAdmins: 0, numberOfTasks: 0, numberOfMissings: 0};
	keywordForEditor;
	isKeywordListEdited = false;
	lineNumbersForEditor;
	campaignType: CampaignTypeEnum;
	isCsAdmin = true;
	brandId: string;
	campaignId: string;
	submittingCampaignDetails = false;
	isFromBrand = false;
	isReportEdit = false;
	selectedSection;
	isCampaignLoaded = false;
	quillConfig = {
		toolbar: [['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]]
	};
	isLoading = false;
	selectedCommunities;
	showDiscoverCommunitiesDialog;
	campaignName;
	isSubmitting = false;
	isDraftSubmitting = false;
	isDateValid = true;
	timeOptions = [];
	publishTime = '12:30 AM';
	invalidTaskPublishDate = false;
	campaignDetails;
	groupsSelectedForCampaignCreation;
	memberSizeOfGroupsSelectedForCampaignCreation = 0;
	showCommunityListPopup = false;
	isAddCampaignEnabled = false;
	isCampaignCreated;
	openProposalModal;
	proposalUrl: string;
	brandEmailAddresses = {};
	numberOfEmailAddresses = 0;
	campaignEmailAddresses: any;
	isEmailsAreValid = false;
	selectedCommunitiesId = [];
	selectedCommunitiesFromApi: CampaignGroupsModel[] = [];
	memberCountOfTotalCommunitiesSelected = 0;
	isTaskCreated;
	loadCommunities = false;
	isNotificationsDialogOpen = false;
	sendingProposalInProgress = false;
	isGroupSelectedForNotifications = false;
	sort = new FormGroup({
		sortValue: new FormControl()
	});
	sortOptions = ['Member count', 'Campaign Engagement', 'Post Engagement'];
	sortBy = 'Member count';
	sortByValue;
	openDeleteCommunityPopup = false;
	finalTaskDetailsForProposal;
	showCampaignDetails = true;
	timeOut;
	communityManagers;
	metadata = [
		'categoryDensity',
		'country',
		'region',
		'isMonetized',
		'isMonetizable',
		'topTenCities',
		'isAnyCampaignTaskToBePerformedThisMonth',
		'averageActiveMember',
		'averageTopPostsReach'
	];

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private readonly campaignService: CampaignService,
		private readonly createCampaignService: CreateCampaignService,
		private readonly alertService: AlertService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.isLoading = true;
		super.setPageTitle('Community Marketing Campaign Details', 'Community Marketing Campaign Details');
		this.isCampaignCreated = this.route.snapshot.params['campaignId'] ? true : false;
		this.isFromBrand = window.location.href.indexOf('/details') > -1;
		if (this.isFromBrand) {
			this.selectedSection = 'report';
		} else {
			this.selectedSection = this.route.snapshot.fragment;
		}

		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				this.isCampaignLoaded = true;
				this.brandId = params['brandId'];
				this.campaignId = params['campaignId'];
				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(async brands => {
						if (!brands) {
							return;
						}

						this.brands = brands;
						this.brand = brands.find(brnd => brnd.id === this.brandId);
						this.brandService.selectedBrand.next(this.brand);
						this.campaigns = this.brand ? await this.brand.getCampaigns() : [];
						this.campaign = this.campaigns.find(campaign => campaign.campaignId === this.campaignId);

						if (this.isFromBrand) {
							this.selectedSection = 'report';
						} else {
							this.selectedSection = this.route.snapshot.fragment;
						}

						if (this.campaign) {
							this.campaign.brandIconUrl = this.brand?.iconUrl;
							await this.campaign.initiateLoadingMetrics();
							this.createCampaignService.campaignType.next(this.campaign.type);
							this.isCampaignLoaded = false;
							await this.getCommunitiesFromAPI();
							this.sortCommunities('Member count');
							this.loadCommunities = true;
							this.isLoading = false;
							if (!this.isFromBrand) {
								await this.createCampaignService.getCommunityManagers();
							}
							this.communityManagers = this.createCampaignService.communityManagers;
						}
						this.isLoading = false;
						this.loadCommunities = true;
						this.isCampaignLoaded = false;
					})
				);
			})
		);
		this.subscriptionsToDestroy.push(
			this.createCampaignService.campaignType.subscribe(async type => {
				if (!type) {
					return;
				}

				this.campaignType = type;
			})
		);

		this.brandService.init();
		this.proposalUrl = environment.baseUrl + 'brand/manage-campaigns';
		let _this = this;
		window.onbeforeunload = function (e) {
			if (!_this.campaignId) {
				if (e) {
					e.returnValue = 'Sure?';
				}
				return 'Sure?';
			}
		};
	}

	updateSelectedCommunitiesTime(event) {
		const community = this.selectedCommunitiesFromApi.find(community => community.groupId === event.group);
		const i = this.selectedCommunitiesFromApi.indexOf(community);
		this.selectedCommunitiesFromApi[i]['toBePerformedByUTC'] = event.dateTime;
	}

	async getCommunitiesFromAPI() {
		this.selectedCommunitiesFromApi = [];
		this.isLoading = true;
		if (this.campaign) {
			try {
				const campaignGroupsAndTasksDetailsResponse = await this.campaignService.listCampaignGroupsAndTasksDetails(
					this.campaign.campaignId,
					this.brand.id,
					null
				);
				this.selectedCommunitiesFromApi = campaignGroupsAndTasksDetailsResponse['items'];
				if (this.selectedCommunitiesFromApi) {
					this.selectedCommunitiesFromApi.forEach(community => {
						community['isAlreadySelectedCommunity'] = true;
						this.memberCountOfTotalCommunitiesSelected += community.memberCount;
					});
					this.selectedCommunitiesFromApi.forEach(community => {
						community['name'] = community['groupName'] ? community['groupName'] : community['name'];
					});
				}
			} catch (e) {
				this.selectedCommunitiesFromApi = [];
			}
		}
		this.isLoading = false;
	}

	closeAddNewTaskPopup() {
		this.campaign.resetCampaignTasksData();
		this.brand.resetDetails();
	}

	updateSelectedCommunitiesStatus(communityToBeUpdated) {
		const community = this.selectedCommunitiesFromApi.find(
			community => community.groupId === communityToBeUpdated.groupId
		);
		const i = this.selectedCommunitiesFromApi.indexOf(community);
		this.selectedCommunitiesFromApi[i]['groupTaskStatus'] = communityToBeUpdated.groupTaskStatus;
	}

	closeCampaignDetail(event) {
		this.campaign = event;
	}

	async createCMCampaignGroups(campaignId) {
		const createCMCampaignGroupInput = [];
		const groupsSelectedForCampaignCreation = _.uniqBy(this.selectedCommunitiesFromApi, 'groupId');

		groupsSelectedForCampaignCreation?.forEach(community => {
			const communityInfo = {};
			communityInfo['campaignId'] = campaignId;
			communityInfo['groupId'] = community['groupId'];
			communityInfo['fbGroupId'] = community['fbGroupId'];
			communityInfo['memberCount'] = community['memberCount'];
			communityInfo['campaignPostEngagementRateLastNinetyDays'] = community['campaignPostEngagementRateLastNinetyDays'];
			communityInfo['postsEngagementRateLastNinetyDays'] = community['postsEngagementRateLastNinetyDays'];
			communityInfo['groupName'] = community['name'];
			communityInfo['state'] = community['state'];
			communityInfo['groupInstallationStartedAtUTC'] = community['groupInstallationStartedAtUTC'];
			communityInfo['businessCategory'] = community['businessCategory'];
			createCMCampaignGroupInput.push(communityInfo);
			this.selectedCommunitiesId.push(community['groupId']);
		});

		if (createCMCampaignGroupInput) {
			try {
				await this.campaignService.createCMCampaignGroups(createCMCampaignGroupInput);
			} catch (e) {}
		}
	}

	async navigateToBrands() {
		this.router.navigate(['/cs-admin/manage-brands']);
	}

	async navigateToCampaigns() {
		this.router.navigate(['/cs-admin/brands/' + this.brandId + '/manage-brand-campaigns']);
	}

	communitiesDialog(state) {
		this.showDiscoverCommunitiesDialog = state;
	}

	getGroupsSelectedForCampaignCreation(event) {
		this.memberSizeOfGroupsSelectedForCampaignCreation = 0;
		this.groupsSelectedForCampaignCreation = event;
		this.groupsSelectedForCampaignCreation.forEach(group => {
			this.memberSizeOfGroupsSelectedForCampaignCreation =
				this.memberSizeOfGroupsSelectedForCampaignCreation + group.memberCount;
		});
		this.selectedCommunities = this.groupsSelectedForCampaignCreation?.filter(
			group => group['isAlreadySelectedCommunity'] === true
		);
		this.isAddCampaignEnabled =
			this.groupsSelectedForCampaignCreation?.filter(group => !group['isAlreadySelectedCommunity'])?.length > 0;
	}

	hideCommunityListPopup(event) {
		this.showCommunityListPopup = event;
	}

	async closeCommunitySelectionOverlay() {
		setTimeout(async () => {
			this.showDiscoverCommunitiesDialog = false;
			await this.getCommunitiesFromAPI();
			this.sortCommunities('Member count');
		}, 1000);
	}

	updateCampaign(campaign) {
		this.campaign = campaign;
	}

	copyProposalUrl() {
		const copyText = <HTMLInputElement>document.getElementById('copyProposalUrl');
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand('copy');
	}

	saveEmailAddresses() {
		this.campaignEmailAddresses = JSON.parse(JSON.stringify(this.brandEmailAddresses));
	}

	getEmailAddressKeys() {
		return Object.keys(this.brandEmailAddresses);
	}

	addEmailAddresses() {
		this.numberOfEmailAddresses += 1;
		this.brandEmailAddresses['email' + this.numberOfEmailAddresses] = null;
	}

	removeEmailAddress(key) {
		delete this.brandEmailAddresses[key];
	}

	validateEmailAddress(email) {
		this.isEmailsAreValid = true;
		for (const key of Object.keys(this.brandEmailAddresses)) {
			const keyValue = this.brandEmailAddresses[key];
			if (!keyValue || !(keyValue && keyValue.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))) {
				this.isEmailsAreValid = false;
			}
		}
		if ((email && email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) || email === null) {
			return true;
		} else {
			return false;
		}
	}

	async sendProposal() {
		this.sendingProposalInProgress = true;
		const proposalEmails = [];
		_.each(this.campaignEmailAddresses, email => {
			proposalEmails.push(email);
		});
		const campaignCreateInput = {};
		campaignCreateInput['brandId'] = this.brand.id;
		campaignCreateInput['campaignName'] = this.campaign['campaignName'];
		campaignCreateInput['campaignId'] = this.campaign['campaignId'];
		campaignCreateInput['proposalEmails'] = proposalEmails;
		campaignCreateInput['status'] = CampaignStatusEnum.PendingApproval;
		let campaignDetails;
		try {
			campaignDetails = await this.createCampaignService.updateCampaignDetails(
				campaignCreateInput as UpdateCampaignInput
			);
			await this.campaignService.markCampaignStatus(
				campaignDetails.brandId,
				campaignDetails.campaignId,
				CampaignStatusEnum.PendingApproval
			);
			this.alert.success('Campaign creation Successful', 'Proposal Sent');
			this.openProposalModal = false;
			this.brand.resetDetails();
			this.router.navigateByUrl('/cs-admin/brands/' + campaignDetails.brandId + '/manage-brand-campaigns');
			this.sendingProposalInProgress = false;
		} catch (e) {
			this.alert.error(
				'Campaign creation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
			this.sendingProposalInProgress = false;
		}
	}

	async saveCommunities(communities) {
		let finalCommunitiesToShow = [];
		if (this.selectedCommunitiesFromApi.length > 0) {
			this.selectedCommunitiesFromApi.forEach(community => {
				finalCommunitiesToShow = communities.filter(group => group.groupId !== community.groupId);
			});
		} else {
			finalCommunitiesToShow = communities;
		}
		this.selectedCommunitiesFromApi = this.selectedCommunitiesFromApi.concat(finalCommunitiesToShow);
		this.selectedCommunitiesFromApi = _.uniqBy(this.selectedCommunitiesFromApi, 'groupId');
		this.memberCountOfTotalCommunitiesSelected = 0;
		this.selectedCommunitiesFromApi.forEach((community, index) => {
			this.memberCountOfTotalCommunitiesSelected += community.memberCount;
			this.selectedCommunitiesFromApi[index]['isAlreadySelectedCommunity'] = true;
		});
	}

	async downloadCommunities() {
		const result = await this.campaignService.downloadCommunitiesExcel(this.campaign.campaignId);
		var link = document.createElement('a');
		document.body.appendChild(link);
		link.setAttribute('type', 'hidden');
		link.href = 'data:text/plain;base64,' + result.body;
		link.download = this.campaign.campaignName + '_' + new DateTime().format('YYYY-MM-DD') + '.xlsx';
		link.click();
		document.body.removeChild(link);
	}

	updateDeletedCommunities(community) {
		this.selectedCommunitiesFromApi = this.selectedCommunitiesFromApi.filter(
			group => group.groupId !== community.groupId
		);
		this.memberCountOfTotalCommunitiesSelected -= community.memberCount;
		this.isLoading = false;
	}

	sortCommunities(event) {
		switch (event) {
			case 'Member count':
				this.sortByValue = 'memberCount';
				break;
			case 'Campaign Engagement':
				this.sortByValue = 'campaignPostEngagementRateLastNinetyDays';
				break;
			case 'Post Engagement':
				this.sortByValue = 'postsEngagementRateLastNinetyDays';
				break;
		}
		this.sortBy = event;
		this.selectedCommunitiesFromApi?.sort((a, b) => {
			return b[this.sortByValue] - a[this.sortByValue];
		});
	}

	setFinalTaskDetailsForProposal(event) {
		this.finalTaskDetailsForProposal = event;
	}

	discardChanges(event) {
		this.showCampaignDetails = false;
		this.timeOut = setTimeout(() => {
			this.showCampaignDetails = true;
		}, 1);
	}

	changeUrlFragment(fragment) {
		window.location.hash = fragment;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
