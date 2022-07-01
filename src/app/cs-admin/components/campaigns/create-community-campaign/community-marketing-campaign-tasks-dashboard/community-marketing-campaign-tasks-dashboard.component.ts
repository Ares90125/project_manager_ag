import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {campaignAssetsStatus} from '@sharedModule/enums/campaign-asset-status.enum';
import {CampaignCommunityStatusEnum, CampaignStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {PaymentStatusEnum} from '@sharedModule/enums/payment-status.enum';
import {DateTime} from '@sharedModule/models/date-time';
import {UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import * as _ from 'lodash';
import {CountryISO} from 'ngx-intl-tel-input';
import {environment} from 'src/environments/environment';
import {UserService} from '@sharedModule/services/user.service';
import {ContentManagerService} from '../../../../services/content-manager.service';

@Component({
	selector: 'app-community-marketing-campaign-tasks-dashboard',
	templateUrl: './community-marketing-campaign-tasks-dashboard.component.html',
	styleUrls: ['./community-marketing-campaign-tasks-dashboard.component.scss']
})
export class CommunityMarketingCampaignTasksDashboardComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() selectedCommunitiesFromApi;
	@Input() campaign;
	@Input() selectedSection;
	@Output() updateDeletedCommunities = new EventEmitter();
	@Output() getCommunitiesFromAPI = new EventEmitter();
	@Output() updateCommunitiesPostingTime = new EventEmitter();
	detailTobeEdited;
	@ViewChild('selectAllGroups')
	selectAllGroups: MatCheckbox;
	communities;
	selectedGroups = [];
	isGroupSelected = [];
	@Input() communityManagers;
	communityManagersWithNames = [];
	openDateTimePicker;
	openPaymentDateTimePicker;
	selectedGroup;
	timeZoneList;
	sortBy = 'Community Name';
	pricingOptions = ['INR', 'USD', 'SGD'];
	pricing = '';
	selectedCurreny = '';
	isBulkEdit = false;
	selectedCommunityManager = '';
	selectedPrimaryChannel = '';
	selectedCohort = '';
	isUpdating = false;
	isPrimaryChannelEnabled = false;
	isCreateTaskEnabled = false;
	isCreateTaskClicked = false;
	primaryChannelFilters = [
		{name: 'WhatsApp', subName: 'Subscribed', compareData: ['Verified'], isSelected: false},
		{
			name: 'WhatsApp',
			subName: 'Not subscribed',
			compareData: ['NotVerified', 'VerificationSent', null],
			isSelected: false
		},
		{name: 'Email', subName: 'Subscribed', compareData: ['Verified'], isSelected: false},
		{
			name: 'Email',
			subName: 'Not subscribed',
			compareData: ['NotVerified', 'VerificationSent', null],
			isSelected: false
		}
	];
	statusFilters = [
		{displayName: 'Empty', name: null, isSelected: false},
		{displayName: 'Campaign Brief Sent', name: 'CampaignBriefSent', isSelected: false},
		{displayName: 'Campaign Accepted', name: 'CampaignAccepted', isSelected: false},
		{displayName: 'Campaign Declined', name: 'CampaignDeclined', isSelected: false},
		{displayName: 'Content Approved', name: 'ContentApproved', isSelected: false},
		{displayName: 'Task Created', name: 'TaskCreated', isSelected: false},
		{displayName: 'Task Request Sent', name: 'TaskRequestSent', isSelected: false},
		{displayName: 'Task Scheduled', name: 'TaskScheduled', isSelected: false},
		{displayName: 'Task Declined', name: 'TaskDeclined', isSelected: false},
		{displayName: 'Task Completed', name: 'TaskCompleted', isSelected: false},
		{displayName: 'Task Paused', name: 'TaskPaused', isSelected: false},
		{displayName: 'Task Failed', name: 'TaskFailed', isSelected: false},
		{displayName: 'Payment Sent', name: 'PaymentSent', isSelected: false}
	];
	paymentsStatusFilters = [
		{displayName: PaymentStatusEnum.ReadyForPayment, name: 'ReadyForPayment', isSelected: false},
		{displayName: PaymentStatusEnum.Done, name: 'Done', isSelected: false},
		{displayName: PaymentStatusEnum.OnHold, name: 'OnHold', isSelected: false},
		{displayName: PaymentStatusEnum.InProcess, name: 'InProcess', isSelected: false},
		{displayName: PaymentStatusEnum.NotPayable, name: 'NotPayable', isSelected: false},
		{displayName: 'Not Paid', name: 'Not Paid', isSelected: false}
	];
	assetsProgressFilters = [
		{name: 'campaignAssetsApprovedAll', displayName: 'All assets approved', isSelected: false},
		{name: 'campaignAssetsHasDeclined', displayName: 'Has declined assets', isSelected: false},
		{name: 'campaignAssetsHasPending', displayName: 'Has pending assets', isSelected: false},
		{name: 'campaignAssetsInitial', displayName: 'Assets not submitted', isSelected: false}
	];
	campaignAssetsStatusFilters = [
		{name: campaignAssetsStatus.CampaignStatusDone, displayName: 'Done', isSelected: false},
		{name: campaignAssetsStatus.CampaignStatusInitial, displayName: 'Initial', isSelected: false},
		{
			name: campaignAssetsStatus.CampaignStatusPendingCommunityAdminAccept,
			displayName: 'Pending community admin accept',
			isSelected: false
		},
		{
			name: campaignAssetsStatus.CampaignStatusPendingCopiesAssets,
			displayName: 'Pending copies assets',
			isSelected: false
		},
		{
			name: campaignAssetsStatus.CampaignStatusProductPurchase,
			displayName: 'Pending product purchase',
			isSelected: false
		},
		{name: campaignAssetsStatus.CampaignStatusProposalNotSent, displayName: 'Proposal not sent', isSelected: false},
		{name: campaignAssetsStatus.CampaignStatusPendingBrand, displayName: 'Pending brand', isSelected: false},
		{name: campaignAssetsStatus.CampaignStatusPendingAdmin, displayName: 'Pending admin', isSelected: false},
		{name: campaignAssetsStatus.CampaignStatusPendingFbLink, displayName: 'Pending fb link', isSelected: false},
		{name: campaignAssetsStatus.CampaignStatusPendingComplete, displayName: 'Pending complete', isSelected: false}
	];
	ownerFilters = [
		{displayName: 'BD', name: 'BD', isSelected: false},
		{displayName: 'Non-BD', name: 'Non-BD', isSelected: false}
	];
	postTypeFilters = [
		{displayName: 'Text', name: 'Text', isSelected: false},
		{displayName: 'Photo', name: 'Photo', isSelected: false},
		{displayName: 'Album', name: 'Album', isSelected: false},
		{displayName: 'Video', name: 'Video', isSelected: false}
	];
	selectedFilter = 'status';
	communitiesNeedToBeFiltered = [];
	numberOfSelectedFilters = 0;
	openProposalModal = false;
	proposalUrl: string;
	brandEmailAddresses = {};
	isEmailsAreValid = false;
	campaignEmailAddresses: any;
	numberOfEmailAddresses = 0;
	sendingProposalInProgress = false;
	brandId = '';
	brand;
	openDeleteCommunityPopup = false;
	selectedCommunitiesMemberCount = 0;
	selectedCurrency = 'INR';
	showContentManager = false;
	isNotificationsDialogOpen = false;
	isNotificationEnabled = false;
	isCampaignBriefReminderEnabled = false;
	isTaskReminderEnabled = false;
	communitiesToSendNotification = [];
	paymentStatusDropdownItems = [
		PaymentStatusEnum.ReadyForPayment,
		PaymentStatusEnum.OnHold,
		PaymentStatusEnum.Done,
		PaymentStatusEnum.InProcess,
		PaymentStatusEnum.NotPayable
	];
	paymentStatus;
	paymentRemarks;
	paymentAmountPaid;
	isCampaignreadyForSendProposal = false;
	timezoneName = DateTime.guess();
	timeZone = DateTime.guess();
	userTimezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	verificationDialogToBeOpened = null;
	CountryISO = CountryISO;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	campaignTasks = [];
	isContentManagerDisabled = true;
	modeOfCommunication: FormGroup;
	selectedRow;
	emailToBeVerified;
	isBulkEditActionsDisabled = false;
	openEditAdminConfirmation = false;
	selectedGroupAndAdmin;
	isCampaignBriefEnabled = false;
	isCampaignBriefAlreadySent = false;
	campaignGroupsSubscrption;
	campaignBrandSubscriptions;
	minPrice = 0;
	isNegativeValue = false;
	toasMessageTitle = {
		cohort: 'Cohort',
		primaryChannel: 'Primary Channel',
		POC: 'Community Manager',
		pricing: 'Pricing',
		defaultTaskDate: 'Posting Time',
		timezone: 'Timezone',
		paymentStatus: 'Payment Status',
		paymentRemarks: 'Payment Remarks',
		paymentDate: 'Payment Date',
		paymentAmountPaid: 'Payment Amount Paid'
	};
	cohortValues = ['Cohort 1', 'Cohort 2', 'Cohort 3', 'Cohort 4', 'Cohort 5', 'Cohort 6'];
	sendProposalModalConfirmation = false;
	showDiscoverCommunitiesDialog = false;
	memberSizeOfGroupsSelectedForCampaignCreation = 0;
	groupsSelectedForCampaignCreation;
	selectedCommunities;
	isAddCampaignEnabled = false;
	showCommunityListPopup = false;
	memberCountOfTotalCommunitiesSelected = 0;
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
	showRequireAssetModal: boolean = false;
	requireAssetMessage: string = '';
	user;

	constructor(
		injector: Injector,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService,
		private utilityService: UtilityService,
		private brandService: BrandService,
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private formBuilder: FormBuilder,
		private appSync: AmplifyAppSyncService,
		private groupsService: GroupsService,
		private readonly contentManagerService: ContentManagerService,
		private userService: UserService
	) {
		super(injector);
	}

	returnOne() {
		return this.totalPricing();
	}

	totalPricing() {
		if (this.selectedGroups == undefined || this.selectedGroups == null) {
			return 0;
		}
		const currencyMap: Map<string, number> = this.selectedGroups
			.filter(gr => gr.pricing != undefined && gr.pricing != null)
			.map<{pricing: number; currency: string}>(gr => {
				return {pricing: gr.pricing, currency: gr.currency};
			})
			.reduce((acc, next) => {
				if (acc.has(next.currency)) {
					acc.set(next.currency, acc.get(next.currency) + Number(next.pricing));
				} else {
					acc.set(next.currency, Number(next.pricing));
				}
				return acc;
			}, new Map<string, number>());

		let result = '';

		currencyMap.forEach((v, k) => {
			console.log(` Key = ${k} V = ${v}`);
			result += `${k} ${v}`;
		});

		// console.log(currencyMap);
		if (result.length > 0) {
			return `Total Pricing: ${result}`;
		}

		return result;
	}

	async ngOnInit() {
		super._ngOnInit();
		this.communities = this.selectedCommunitiesFromApi;
		this.communityManagersWithNames = this.communityManagers?.map(manager => manager.fullname);
		if (this.campaign) {
			this.appSync.websocketClosed.subscribe(() => {
				this.campaignService.subscribeToUpdateCampaignGroups(this.campaign.campaignId);
				this.campaignService.subscribeToUpdateBrandCampaign(this.campaign.campaignId);
			});
			this.campaignBrandSubscriptions = this.campaignService.subscribeToUpdateBrandCampaign(this.campaign.campaignId);
			this.campaignService.subscribeToUpdateCampaignGroups(this.campaign?.campaignId);
			this.communityManagersWithNames = this.communityManagers?.map(manager => manager.fullname);
		}
		this.communities.forEach((community, i) => {
			if (community.defaultCommunityManager) {
				this.communities[i]['communityManagerId'] = community.defaultCommunityManager;
			}
			community['communityManagerName'] = this.getPocNameFromId(community.communityManagerId);
			community.isPostingTimeValid = true;
			community.isPostingTimePast = false;
			if (
				community.modeOfCommunicationVerificationStatus === 'Verified' ||
				community.modeOfCommunicationVerificationStatus === 'VerificationSent' ||
				community.modeOfCommunicationVerificationStatus === 'NotVerified'
			) {
				if (community.modeOfCommunication === 'WhatsApp') {
					this.communities[i]['mobileNumber'] = '+' + community.communityAdminContact;
				} else if (community.modeOfCommunication === 'Email') {
					this.communities[i]['email'] = community.communityAdminContact;
				}
			}

			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskCreated ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskRequestSent ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.CampaignAccepted ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.ContentApproved
			) {
				community.isEditable = true;
			} else {
				community.isEditable = false;
			}

			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskCompleted ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskScheduled ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskDeclined ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskPaused ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskFailed ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.PaymentSent ||
				this.campaign?.status === CampaignStatusEnum.Completed
			) {
				community.isFieldsEditable = false;
			} else {
				community.isFieldsEditable = true;
			}

			if (this.selectedSection === 'payments') {
				if (
					community.groupTaskStatus !== CampaignCommunityStatusEnum.TaskCompleted ||
					community.groupTaskStatus !== CampaignCommunityStatusEnum.PaymentSent
				) {
					community.isPaymentsFieldsEditable = false;
				} else {
					community.isPaymentsFieldsEditable = true;
				}
			}

			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.CampaignBriefSent ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.CampaignDeclined ||
				!community.groupTaskStatus
			) {
				community.isCommunityAdminAccepted = false;
			} else {
				community.isCommunityAdminAccepted = true;
			}
		});

		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(async user => {
				if (user === null) {
					return;
				}
				this.user = user;
			})
		);

		this.checkForCampaignStatusSendProposal();
		this.campaignService.onUpdateCampaignGroups.subscribe(group => {
			if (!group) {
				return;
			}

			this.communities.forEach(community => {
				if (
					group.groupId === community.groupId &&
					group.groupTaskStatus &&
					group.campaignId === this.campaign.campaignId
				) {
					community.groupTaskStatus = group.groupTaskStatus;
				}
			});
			this.selectedCommunitiesFromApi.forEach(community => {
				if (
					group.groupId === community.groupId &&
					group.groupTaskStatus &&
					group.campaignId === this.campaign.campaignId
				) {
					community.groupTaskStatus = group.groupTaskStatus;
				}
			});
		});
		this.campaignService.onUpdateCampaign.subscribe(campaign => {
			if (!campaign) {
				return;
			}

			if (campaign.status && this.campaign) {
				this.campaign.status = campaign.status;
			}
		});
		this.sortCommunities('name');
		this.communitiesNeedToBeFiltered = this.communities;
		if (this.campaign?.timezoneName) {
			this.timezoneName = this.campaign.timezoneName;
		}
		this.pushTimezoneNames();
		this.proposalUrl = environment.baseUrl + 'brand/manage-campaigns';
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				this.brandId = params['brandId'];
				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(async brands => {
						if (!brands) {
							return;
						}

						this.brand = brands.find(brnd => brnd.id === this.brandId);
					})
				);
			})
		);
		this.modeOfCommunication = this.formBuilder.group({
			whatsapp: ['', Validators.required]
		});
	}

	async handleClickSendProposalToCommunityAdmin({selectedGroups}) {
		if (this.checkSelectedGroupsPricing(selectedGroups)) {
			this.alert.error(
				'Proposal request failed',
				'Pricing is mandatory field, please type in pricing in selected communities'
			);
			return;
		}

		const proposalSentGroups = selectedGroups.filter(group => {
			if (group.campaignAssetProposalSent) {
				return group;
			}
		});

		if (proposalSentGroups.length) {
			this.sendProposalModalConfirmation = true;
			return;
		}
		this.handleSendProposalToCommunityAdmin({sendToAll: true});
	}

	checkSelectedGroupsPricing(selectedGroups) {
		const tempGroup = selectedGroups.find(group => !group.pricing);
		return tempGroup ? true : false;
	}

	async handleSendProposalToCommunityAdmin({sendToAll}: {sendToAll: boolean}) {
		let sendProposalResponse;
		if (sendToAll) {
			sendProposalResponse = this.selectedGroups.map(selectedGroup => {
				return this.createCampaignService.sendProposalToCommunityAdmin({
					campaignId: selectedGroup.campaignId,
					communityAdminId: selectedGroup.communityAdminId,
					groupId: selectedGroup.groupId
				});
			});
		} else {
			const noProposalSentGroups = this.selectedGroups.filter(group => {
				if (!group.campaignAssetProposalSent) {
					return group;
				}
			});

			sendProposalResponse = noProposalSentGroups.map(selectedGroup => {
				return this.createCampaignService.sendProposalToCommunityAdmin({
					campaignId: selectedGroup.campaignId,
					communityAdminId: selectedGroup.communityAdminId,
					groupId: selectedGroup.groupId
				});
			});
		}

		const resolvedSendProposalResponse: any = await Promise.all(sendProposalResponse);
		resolvedSendProposalResponse.forEach((res, index) => {
			if (res && res.status === 'Ok') {
				this.alert.success(
					`Proposal request from community ${this.selectedGroups[index].groupName} was sent to ${this.selectedGroups[index].communityAdminName}`,
					'Proposal was successfully sent'
				);
				this.getCommunitiesFromAPI.emit();
			} else {
				const errorMessage = res.message.slice(res.message.indexOf('"') + 1, res.message.lastIndexOf('"'));
				this.alert.error('Proposal request was failed', errorMessage);
			}
		});
	}

	async requireAssetReminder({selectedGroups}) {
		const requireAssetsResponse = selectedGroups.map(selectedGroup => {
			return this.contentManagerService.requireAssetReminder({
				campaignId: selectedGroup.campaignId,
				groupId: selectedGroup.groupId,
				message: this.requireAssetMessage
			});
		});

		const resolvedRequireAssetsResponse: any = await Promise.all(requireAssetsResponse);

		resolvedRequireAssetsResponse.forEach((res, index) => {
			if (res && res.status === 'Ok') {
				this.alert.success(
					`Require asset reminder from community ${this.selectedGroups[index].groupName} was sent to ${this.selectedGroups[index].communityAdminName}`,
					'Require asset reminder was successfully sent'
				);
				// this.getCommunitiesFromAPI.emit();
			} else {
				const errorMessage = res.message.slice(res.message.indexOf('"') + 1, res.message.lastIndexOf('"'));
				this.alert.error('Require asset reminder was failed', errorMessage);
			}
		});
		this.handleRequireAssetModal();
	}

	async downloadCampaignGroupAssetsExcel() {
		const response = await this.contentManagerService.downloadCampaignGroupAssetsExcel({
			campaignId: this.campaign.campaignId
		});
		window.open(response.url);
	}

	async getCampaignTasks() {
		if (!this.campaign) {
			return;
		}

		this.campaign.resetCampaignTasksData();
		this.campaignTasks = await this.campaign.getCampaignTasks();
	}

	toggleAllGroupSelection() {
		this.isGroupSelected = [];
		this.selectedGroups = [];
		this.communitiesToSendNotification = [];
		if (!this.selectAllGroups.checked) {
			this.communities?.forEach(group => {
				this.selectedGroups.push(group);
				this.isGroupSelected.push(group.groupId);
				this.communitiesToSendNotification.push(group.groupId);
				this.selectedCommunitiesMemberCount += group.memberCount;
			});
		}
		this.setActionsOnEditButtons();
	}

	async pushTimezoneNames() {
		const momentScriptLoad = await this.utilityService.insertMomentTimeZoneScript();
		if (!momentScriptLoad) {
			return;
		}
		this.timeZoneList = this.utilityService.pushTimezoneNames();
		if (!this.campaign?.timezoneName) {
			this.campaign['timezone'] = this.timeZoneList.find(zone => zone.indexOf(this.timezoneName) > -1);
			this.optionSelected(this.campaign['timezone']);
		}
		this.setTimezoneAndDateOnCommunities();
	}

	setTimezoneAndDateOnCommunities() {
		this.communities.forEach((community, i) => {
			if (community['defaultTaskDate'] && !community['isDefaultDateAvailable']) {
				community['defaultTaskDate'] = community['defaultTaskDate'];
			} else if (this.campaign.defaultTaskDate) {
				community['defaultTaskDate'] = this.campaign.defaultTaskDate;
				community['isDefaultDateAvailable'] = true;
			}
			if (community.timezone && !community['isDefaultTimezoneAvailable']) {
				community['timezoneName'] = community.timezone;
			} else if (this.campaign.timezoneName) {
				community['timezoneName'] = this.campaign.timezoneName;
				community['isDefaultTimezoneAvailable'] = true;
			} else {
				community['timezoneName'] = this.timezoneName;
			}
			community['timezone'] = this.timeZoneList.find(zone => zone.indexOf(community['timezoneName']) > -1);
			if (community['timezone']) {
				this.setDefaultTimeForCommunity(community);
			}

			if (
				community['defaultTaskDate'] &&
				(community['isDefaultDateAvailable'] ||
					(!community['isDefaultDateAvailable'] && !community['isDateAlreadyLoaded']))
			) {
				const defaultTaskDate = this.utilityService.setDefaultDate(
					this.timezoneName,
					community['defaultTaskDate'],
					this.userTimezoneOffsetInMins
				);

				const publishTime = defaultTaskDate.publishTime ? defaultTaskDate.publishTime : '12:30 AM';
				community['defaultTaskDate'] = new DateTime(
					new DateTime(defaultTaskDate.date).format('MMMM D YYYY') + ', ' + publishTime
				);
			}
			community['isDateAlreadyLoaded'] = true;
		});
		this.validatePostingTime();
	}

	validatePostingTime() {
		const startDate = new DateTime(this.campaign?.startDateAtUTC);
		const endDate = new DateTime(this.campaign?.endDateAtUTC);
		this.communities?.forEach(community => {
			const dateTimeOfTask = new DateTime(community.defaultTaskDate);
			const todayDate = new DateTime();
			community['isPostingTimeValid'] =
				dateTimeOfTask.diff(startDate.dayJsObj, 'minutes') >= 0 &&
				dateTimeOfTask.diff(todayDate.dayJsObj, 'minutes') >= 0 &&
				endDate.diff(dateTimeOfTask.dayJsObj, 'minutes') >= 0;
			community['isPostingTimePast'] = !community['isPostingTimeValid']
				? dateTimeOfTask.diff(todayDate.dayJsObj, 'minutes') < 0
				: false;
			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskCompleted ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskScheduled ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskFailed ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskDeclined ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskPaused ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.PaymentSent ||
				this.campaign?.status === CampaignStatusEnum.Completed
			) {
				community['isPostingTimeValid'] = true;
			}
		});
	}

	async optionSelected(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		this.timezoneName = timezoneInfo.timezoneName;
		this.timezoneOffsetInMins = timezoneInfo.timezoneOffsetInMins;
	}

	async setDefaultTimeForCommunity(community) {
		const timezoneInfo = await this.utilityService.optionSelected(community.timezone);
		community['timezoneName'] = timezoneInfo.timezoneName;
		community['timezoneOffsetInMins'] = timezoneInfo.timezoneOffsetInMins;
	}

	onRangeChanged(range) {
		let selectedGroups = [];
		range.forEach(row => {
			if (row.cell.classList.value.includes('fbGroupLink') || row.cell.classList.value.includes('disable-selection')) {
				return;
			}
			const groupId = row.rowId;
			const selectedGroup = this.communities.find(group => group.groupId === groupId);
			if (range.length > 1) {
				selectedGroups = selectedGroups.concat(selectedGroup);
				this.communitiesToSendNotification.push(selectedGroup.groupId);
				if (!this.selectedGroups.includes(selectedGroup)) {
					this.selectedCommunitiesMemberCount += selectedGroup.memberCount;
				}
			} else if (range.length === 1) {
				if (this.selectedGroups.includes(selectedGroup)) {
					this.selectedGroups = this.selectedGroups.filter(group => group.groupId !== groupId);
					this.communitiesToSendNotification = this.communitiesToSendNotification.filter(
						groupId => groupId !== selectedGroup.groupId
					);
					this.selectedCommunitiesMemberCount -= selectedGroup.memberCount;
				} else {
					selectedGroups = selectedGroups.concat(selectedGroup);
					this.communitiesToSendNotification.push(selectedGroup.groupId);
					this.selectedCommunitiesMemberCount += selectedGroup.memberCount;
				}
			}
		});
		const event = [...this.selectedGroups];
		selectedGroups.forEach(group => {
			event.unshift(group);
		});
		this.selectedGroups = event;
		this.selectedGroups = _.uniqBy(this.selectedGroups, 'groupId');
		this.isGroupSelected = [];
		this.selectedGroups.forEach(group => {
			this.isGroupSelected.push(group.groupId);
		});
		this.setActionsOnEditButtons();
	}

	setActionsOnEditButtons() {
		this.isBulkEditActionsDisabled = false;
		if (this.selectedSection === 'payments') {
			this.selectedGroups.forEach(group => {
				if (
					// group.groupTaskStatus !== CampaignCommunityStatusEnum.TaskCompleted ||
					group.groupTaskStatus !== CampaignCommunityStatusEnum.PaymentSent
				) {
					this.isBulkEditActionsDisabled = true;
				}
			});
			return;
		}
		this.isPrimaryChannelEnabled = true;
		this.isCreateTaskEnabled = true;
		this.isNotificationEnabled = true;
		this.isCampaignBriefEnabled = true;
		this.isCampaignBriefReminderEnabled = true;
		this.isTaskReminderEnabled = true;
		this.isCampaignBriefAlreadySent = true;
		this.selectedGroups.forEach(group => {
			if (!group.communityAdminName) {
				this.isPrimaryChannelEnabled = false;
			}
			if (
				!group.communityAdminId ||
				!group.pricing ||
				!group.communityManagerId ||
				(!group.defaultTaskDate && !this.campaign?.defaultTaskDate) ||
				!group.modeOfCommunication ||
				(!group.timezoneName && !this.campaign?.timezoneName) ||
				group.groupTaskStatus !== CampaignCommunityStatusEnum.ContentApproved
			) {
				this.isCreateTaskEnabled = false;
			}
			if (!group.communityAdminId) {
				this.isNotificationEnabled = false;
			}
			if (
				(group.groupTaskStatus && group.groupTaskStatus !== CampaignCommunityStatusEnum.CampaignBriefSent) ||
				!group.communityAdminId ||
				!group.communityManagerId ||
				!group.modeOfCommunication ||
				!group.cohort ||
				(!group.timezoneName && !this.campaign?.timezoneName)
			) {
				this.isCampaignBriefEnabled = false;
			}
			if (!group.groupTaskStatus || group.groupTaskStatus === CampaignCommunityStatusEnum.CampaignBriefSent) {
				this.isCampaignBriefAlreadySent = false;
			}
			if (!group.groupTaskStatus) {
				this.isCampaignBriefReminderEnabled = false;
				this.isTaskReminderEnabled = false;
			} else if (group.groupTaskStatus != CampaignCommunityStatusEnum.TaskRequestSent) {
				this.isTaskReminderEnabled = false;
			}

			// if (!group.isFieldsEditable) {
			// 	this.isBulkEditActionsDisabled = true;
			// }
		});
	}

	async getCommunityAdmins(selectedGroupId, type) {
		const community = this.communities.find(community => community.groupId === selectedGroupId);
		const i = this.communities.indexOf(community);
		const spinner = document.getElementsByClassName(type + '-spinner-' + i)[0] as HTMLElement;
		document.getElementsByClassName(type + '-spinner-' + i)[0] as HTMLElement;
		spinner.style.display = 'inline-block';
		try {
			this.communities[i]['admins'] = await this.createCampaignService.getCommunityAdmins(selectedGroupId);
			const emptyCommunity = {email: null, fullname: '----', id: null, modeOfCommunication: null};
			this.communities[i]['admins'] = [emptyCommunity, ...this.communities[i]['admins']];
			setTimeout(() => {
				spinner.style.display = 'none';
				const element = document
					.getElementsByClassName(type + '-dropdown-' + i)[0]
					.getElementsByClassName('value-wrap')[0] as unknown as HTMLElement;
				element.click();
			}, 1);
		} catch (e) {
			this.alert.error('', 'Something went wrong while fetching community admin list. Please try again in sometime!');
		}
	}

	onNotificationDialogClosed() {
		this.isNotificationsDialogOpen = false;
		// this.isGroupSelected = [];
		// this.selectedGroups = [];
		// this.communitiesToSendNotification = [];
		// this.selectAllGroups.checked = false;
		this.setActionsOnEditButtons();
	}

	async applyFilters(filter) {
		filter['isSelected'] = !filter['isSelected'];
		const selectedPrimaryChannelFilter = this.primaryChannelFilters.filter(item => item.isSelected);
		const selectedStatusFilter = this.statusFilters.filter(item => item.isSelected);
		const selectedCommunityManagerFilter = this.communityManagers?.filter(item => item.isSelected);
		const selectedPaymentStatusFilter = this.paymentsStatusFilters.filter(item => item['isSelected']);
		const assetsProgressFilter = this.assetsProgressFilters.filter(item => item.isSelected);
		const selectedCampaignAssetsStatusFilter = this.campaignAssetsStatusFilters.filter(item => item.isSelected);
		const selectedOwnerFilters = this.ownerFilters.filter(item => item.isSelected);
		const selectedPostTypeFilters = this.postTypeFilters.filter(item => item.isSelected);

		this.numberOfSelectedFilters =
			selectedPrimaryChannelFilter.length + selectedStatusFilter.length + selectedCommunityManagerFilter.length;
		this.communities = this.communitiesNeedToBeFiltered;

		if (selectedPrimaryChannelFilter.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const element of selectedPrimaryChannelFilter) {
					if (
						community.modeOfCommunication === element.name &&
						element.compareData.indexOf(community.modeOfCommunicationVerificationStatus) > -1
					) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedStatusFilter.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const element of selectedStatusFilter) {
					if (community.groupTaskStatus === element.name) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedCommunityManagerFilter.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const element of selectedCommunityManagerFilter) {
					if (community.communityManagerName === element.fullname) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedPaymentStatusFilter.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const element of selectedPaymentStatusFilter) {
					if (element.name === 'Not Paid' && !community.paymentStatus) {
						return true;
					}
					if (community.paymentStatus === element.name) {
						return true;
					}
				}
				return false;
			});
		}

		if (assetsProgressFilter.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const element of assetsProgressFilter) {
					if (community.assetsKpis[filter.name] && element.isSelected) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedCampaignAssetsStatusFilter.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const element of selectedCampaignAssetsStatusFilter) {
					if (community.assetsKpis.campaignAssetsStatus === element.name) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedOwnerFilters.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const filter of selectedOwnerFilters) {
					if (community.owner === filter.name) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedPostTypeFilters.length > 0) {
			this.communities = this.communities.filter(community => {
				for (const filter of selectedPostTypeFilters) {
					if (community.postType === filter.name) {
						return true;
					}
				}
				return false;
			});
		}
	}

	switchToPrevious(selectedGroupId, previousValue) {
		const community = this.communities.find(community => community.groupId === selectedGroupId);
		const i = this.communities.indexOf(community);
		this.communities[i]['communityAdminName'] = previousValue;
		this.communities[i]['hideDropdown'] = true;
		setTimeout(() => {
			this.communities[i]['hideDropdown'] = false;
		}, 1);
	}

	async selectSoloEdit(selectedGroupId, selectedValue, type, previousValue) {
		const community = this.communities.find(community => community.groupId === selectedGroupId);

		if (!!community.paymentStatus && type === 'pricing') {
			return this.alert.error('', 'Update of pricing available only for communities with payment status Not Paid');
		}

		if (
			(type === 'paymentStatus' && this.user.userRole !== 'finance' && !!previousValue) ||
			(type === 'paymentStatus' && this.user.userRole !== 'finance' && selectedValue !== 'Ready for Payment')
		) {
			return this.alert.error('', 'For non finance team available update only from Not Paid to Ready For Payment');
		}

		if (type === 'paymentRemarks' && this.user.userRole !== 'finance') {
			return this.alert.error('', 'Update of payment remarks available only for finance team');
		}

		if (type === 'paymentAmountPaid' && this.user.userRole !== 'finance') {
			return this.alert.error('', 'Update of payment amount paid available only for finance team');
		}

		const index = this.communities.indexOf(community);
		if (
			type === 'admin' &&
			community.groupTaskStatus === 'TaskRequestSent' &&
			!this.openEditAdminConfirmation &&
			selectedValue.fullname !== previousValue
		) {
			this.openEditAdminConfirmation = true;
			this.selectedGroupAndAdmin = {
				selectedGroupId: selectedGroupId,
				selectedValue: selectedValue,
				type: type,
				previousValue: previousValue
			};
			return;
		}
		let input = this.createCommunityInput(selectedGroupId, selectedValue, index, type, true);
		let updateCMCampaignGroupsInput = [];
		updateCMCampaignGroupsInput.push(input);

		if (type === 'pricing' && selectedValue.target.value < 0) {
			return;
		}

		if (type !== 'POC') {
			await this.campaignService.updateCMCampaignGroups(updateCMCampaignGroupsInput);
		} else {
			await this.groupsService.updateGroups({id: selectedGroupId, defaultCommunityManager: selectedValue.id});
		}
		await this.updateTasks(community);
	}

	selectCommunityBulkEdit(selectedValue, type) {
		const selectedCommunityManager = this.communityManagers?.find(manager => manager.fullname === selectedValue);
		this.bulkEdit(selectedCommunityManager, type, this.campaignTasks);
		this.selectedCommunityManager = '';
	}

	selectPrimaryChannelBulkEdit(selectedValue, type) {
		this.bulkEdit(selectedValue.value, type, this.campaignTasks);
		this.selectedCommunityManager = '';
	}

	selectPaymentStatusBulkEdit(selectedValue, type) {
		this.bulkEdit(selectedValue, type, this.campaignTasks);
		this.paymentStatus = null;
	}

	selectPaymentRemarksBulkEdit(selectedValue, type) {
		this.bulkEdit(selectedValue, type, this.campaignTasks);
		this.paymentRemarks = null;
	}

	selectPaymentAmountPaidBulkEdit(selectedValue, type) {
		this.bulkEdit(selectedValue, type, this.campaignTasks);
		this.paymentAmountPaid = null;
	}

	onUpdateContentManager(event) {
		this.communities = event;
		this.checkForCampaignStatusSendProposal();
	}

	closeContentManager() {
		this.showContentManager = false;
		setTimeout(() => {
			this.getCampaignTasks();
		}, 1000);
	}

	async bulkEdit(selectedValue, type, campaignTasks = []) {
		this.isUpdating = true;
		let calls = [];
		const chunkSize = 25;
		const batchOfCampaignTasks = [];
		const campaignTasksInfo = [];
		const callSize = 10;
		this.selectedGroups.forEach(community => {
			if (!!community.paymentStatus && type === 'pricing') {
				this.alert.error('', 'Update of pricing available only for communities with payment status Not Paid');
				this.isBulkEdit = false;
				this.isUpdating = false;
				this.detailTobeEdited = null;
				throw new Error('');
			}

			if (type === 'paymentStatus' && this.user.userRole !== 'finance' && selectedValue !== 'Ready for Payment') {
				this.alert.error('', 'For non finance team available update only from Not Paid to Ready For Payment');
				this.isBulkEdit = false;
				this.isUpdating = false;
				this.detailTobeEdited = null;
				throw new Error('');
			}

			if (type === 'paymentRemarks' && this.user.userRole !== 'finance') {
				this.alert.error('', 'Update of payment remarks available only for finance team');
				this.isBulkEdit = false;
				this.isUpdating = false;
				this.detailTobeEdited = null;
				throw new Error('');
			}

			if (type === 'paymentAmountPaid' && this.user.userRole !== 'finance') {
				this.alert.error('', 'Update of payment amount paid available only for finance team');
				this.isBulkEdit = false;
				this.isUpdating = false;
				this.detailTobeEdited = null;
				throw new Error('');
			}

			const index = this.communities.indexOf(community);
			let selectedCommunityValue;
			if (type === 'primaryChannel') {
				selectedCommunityValue = {communityAdminId: community.communityAdminId, modeOfCommunication: selectedValue};
			} else if (type === 'status') {
				selectedCommunityValue =
					community.groupTaskStatus === CampaignCommunityStatusEnum.TaskCompleted
						? CampaignCommunityStatusEnum.TaskCompleted
						: this.campaign.status !== 'Draft' && this.campaign.status !== 'PendingApproval'
						? CampaignCommunityStatusEnum.TaskRequestSent
						: selectedValue;
			} else if (type === 'POC') {
				selectedCommunityValue = {id: community.groupId, defaultCommunityManager: selectedValue.id};
			} else {
				selectedCommunityValue = selectedValue;
			}
			let input = this.createCommunityInput(community.groupId, selectedCommunityValue, index, type);
			const campaigntask = campaignTasks.find(task => task.groupId === community.groupId);
			if (campaigntask && type !== 'primaryChannel') {
				input['campaignGroupTaskId'] = campaigntask.taskId;
			}
			if (type === 'POC') {
				input = selectedCommunityValue;
				this.communities[index]['communityManager'] = selectedValue.id;
			}
			campaignTasksInfo.push(input);
		});
		for (let index = 0; index < campaignTasksInfo.length; index += chunkSize) {
			const tasks = campaignTasksInfo.slice(index, index + chunkSize);
			batchOfCampaignTasks.push(tasks);
		}
		try {
			for (let index = 0; index < batchOfCampaignTasks.length; index += callSize) {
				calls = [];
				for (let callIndex = index; callIndex < index + callSize; callIndex++) {
					if (batchOfCampaignTasks[callIndex]?.length > 0) {
						if (type === 'primaryChannel') {
							const updatedModeOfCommunication = await this.campaignService.updateCMCampaignGroupsModeOfCommunication(
								batchOfCampaignTasks[callIndex]
							);
							updatedModeOfCommunication.forEach(group => {
								const community = this.communities.find(community => community.groupId === group.groupId);
								const index = this.communities.indexOf(community);
								this.communities[index]['modeOfCommunicationVerificationStatus'] =
									group.modeOfCommunicationVerificationStatus;
								if (selectedValue === 'Email') {
									this.communities[index]['email'] = group.communityAdminContact;
								} else {
									this.communities[index]['mobileNumber'] = '+' + group.communityAdminContact;
								}
							});
						} else if (type === 'POC') {
							calls.push(this.groupsService.updateGroups(batchOfCampaignTasks[callIndex]));
						} else {
							calls.push(this.campaignService.updateCMCampaignGroups(batchOfCampaignTasks[callIndex]));
						}
					}
				}
				await Promise.all(calls);
				this.checkForCampaignStatusSendProposal();
			}
			if (type !== 'paymentStatus' && type !== 'status') {
				this.alert.success(this.toasMessageTitle[type] + ' updated successfully', '');
			} else if (type !== 'status') {
				this.alert.success('Payment Status' + ' updated successfully', '');
			}
		} catch (e) {
			if (type !== 'status') {
				this.alert.error('', `Something went wrong while updating ${type}. Please try again in sometime!`);
			}
		}
		this.isBulkEdit = false;
		this.isUpdating = false;
		this.detailTobeEdited = null;
	}

	async createTasks() {
		this.isUpdating = true;
		let calls = [];
		const chunkSize = 25;
		const batchOfCampaignTasks = [];
		const campaignTasksInfo = [];
		const callSize = 10;
		this.selectedGroups.forEach(group => {
			const campaignTask = this.campaignTasks.find(task => task.groupId === group.groupId);
			if (campaignTask) {
				this.updateTasks(group, true);
			} else {
				const taskInfo = {};
				taskInfo['campaignId'] = this.campaign.campaignId;
				taskInfo['userId'] = group['communityAdminId'];
				taskInfo['userName'] = group['communityAdminName'];
				taskInfo['communityManagerId'] = group['communityManagerId'];
				taskInfo['communityManagerName'] = group['communityManagerName'];
				taskInfo['pricing'] = group['pricing'];
				taskInfo['groupId'] = group['groupId'];
				taskInfo['groupName'] = group['name'];
				taskInfo['title'] = this.campaign?.taskTitle ? this.campaign.taskTitle : '';
				taskInfo['type'] = 'Post';
				taskInfo['period'] = this.campaign?.campaignPeriod ? this.campaign.campaignPeriod : '';
				taskInfo['text'] = '';
				taskInfo['imageUrls'] = [];
				taskInfo['videoUrls'] = [];
				taskInfo['postType'] = this.campaign.defaultPostType
					? this.linkSelectedPostType(this.campaign.defaultPostType)
					: 'Photo';
				if (
					taskInfo['postType'] === 'LiveVideo' ||
					taskInfo['postType'] === 'MultiVideo' ||
					taskInfo['postType'] === 'VideoImage'
				) {
					taskInfo['isPlaceholder'] = true;
				} else {
					taskInfo['isPlaceholder'] = false;
				}
				const calculatedTimezoneOffsetInMins = this.userTimezoneOffsetInMins - group['timezoneOffsetInMins'];
				taskInfo['isDraft'] = false;
				if (group['defaultTaskDate']) {
					taskInfo['toBePerformedByUTC'] = new DateTime(group['defaultTaskDate'])
						.add(calculatedTimezoneOffsetInMins, 'minutes')
						.utc()
						.toISOString();
				} else {
					taskInfo['toBePerformedByUTC'] = null;
				}
				taskInfo['timezoneName'] = group['timezoneName'] ? group['timezoneName'] : this.campaign.timezoneName;
				campaignTasksInfo.push(taskInfo);
			}
		});
		for (let index = 0; index < campaignTasksInfo.length; index += chunkSize) {
			const tasks = campaignTasksInfo.slice(index, index + chunkSize);
			batchOfCampaignTasks.push(tasks);
		}
		let campaignTasks = this.campaignTasks;
		try {
			for (let index = 0; index < batchOfCampaignTasks.length; index += callSize) {
				calls = [];
				for (let callIndex = index; callIndex < index + callSize; callIndex++) {
					if (batchOfCampaignTasks[callIndex]?.length > 0) {
						calls.push(
							this.createCampaignService.createCampaignTask(batchOfCampaignTasks[callIndex], this.campaign?.brandId)
						);
					}
				}
				const taskResponse = await Promise.all(calls);
				campaignTasks = campaignTasks.concat(taskResponse);
			}
			await this.bulkEdit(CampaignCommunityStatusEnum.TaskCreated, 'status', campaignTasks);
			this.checkForCampaignStatusSendProposal();
			this.alert.success('Task created successfully!', '');
		} catch (e) {
			this.alert.error('', `Something went wrong while creating tasks. Please try again in sometime!`);
		}
		this.isBulkEdit = false;
		this.isUpdating = false;
		this.isCreateTaskEnabled = false;
		this.isCreateTaskClicked = false;
	}

	async updateTasks(group, isFromCreateTask = false) {
		if (!group.taskId) {
			return;
		}
		this.isUpdating = true;
		const campaignTasksInfo = [];
		const taskInfo = {};
		taskInfo['campaignId'] = this.campaign.campaignId;
		taskInfo['taskId'] = group.taskId;
		taskInfo['userId'] = group['communityAdminId'];
		taskInfo['userName'] = group['communityAdminName'];
		taskInfo['communityManagerId'] = group['communityManagerId'];
		taskInfo['communityManagerName'] = group['communityManagerName'];
		taskInfo['pricing'] = group['pricing'];
		taskInfo['groupId'] = group['groupId'];
		taskInfo['groupName'] = group['name'];
		taskInfo['title'] = this.campaign?.taskTitle ? this.campaign.taskTitle : group['title'];
		taskInfo['type'] = 'Post';
		taskInfo['period'] = this.campaign?.campaignPeriod ? this.campaign.campaignPeriod : group['period'];
		taskInfo['text'] = group.text;
		taskInfo['imageUrls'] = group.imageUrls;
		taskInfo['videoUrls'] = group.videoUrls;
		taskInfo['postType'] = group.postType
			? group.postType
			: this.campaign.defaultPostType
			? this.linkSelectedPostType(this.campaign.defaultPostType)
			: 'Photo';
		taskInfo['status'] = group.status;
		if (
			taskInfo['postType'] === 'LiveVideo' ||
			taskInfo['postType'] === 'MultiVideo' ||
			taskInfo['postType'] === 'VideoImage'
		) {
			taskInfo['isPlaceholder'] = true;
		} else {
			taskInfo['isPlaceholder'] = false;
		}
		this.setDefaultTimeForCommunity(group);
		const calculatedTimezoneOffsetInMins = this.userTimezoneOffsetInMins - group['timezoneOffsetInMins'];
		taskInfo['isDraft'] = isFromCreateTask ? false : group.isDraft;
		group.isDraft = taskInfo['isDraft'];
		if (group['defaultTaskDate']) {
			taskInfo['toBePerformedByUTC'] = new DateTime(
				new DateTime(group['defaultTaskDate']).format('MM/DD/YYYY, hh:mm A')
			)
				.add(calculatedTimezoneOffsetInMins, 'minutes')
				.utc()
				.toISOString();
			const community = this.communities.find(community => group.groupId === community.groupId);
			const i = this.communities.indexOf(community);
			this.communities[i]['toBePerformedByUTC'] = new DateTime(taskInfo['toBePerformedByUTC']).format(
				'DD MMM YYYY hh:mm a'
			);
		} else {
			taskInfo['toBePerformedByUTC'] = null;
		}
		taskInfo['timezoneName'] = group['timezoneName'] ? group['timezoneName'] : this.campaign.timezoneName;
		campaignTasksInfo.push(taskInfo);
		try {
			await this.createCampaignService.updateCampaignTaskDetails(taskInfo);
			const postTypeInput = {
				campaignId: this.campaign.campaignId,
				groupId: group.groupId,
				campaignGroupTaskId: group['taskId']
			};
			await this.campaignService.updateCMCampaignGroup(postTypeInput);
			this.updateCommunitiesPostingTime.emit({group: group.groupId, dateTime: taskInfo['toBePerformedByUTC']});
			if (isFromCreateTask) {
				this.checkForCampaignStatusSendProposal();
			}
		} catch (e) {}
		this.isUpdating = false;
	}

	checkForCampaignStatusSendProposal() {
		this.isCampaignreadyForSendProposal = false;
		this.communities.forEach(community => {
			if (
				community.groupTaskStatus &&
				community.groupTaskStatus !== CampaignCommunityStatusEnum.CampaignBriefSent &&
				community.groupTaskStatus !== CampaignCommunityStatusEnum.CampaignAccepted &&
				community.groupTaskStatus !== CampaignCommunityStatusEnum.CampaignDeclined &&
				community.groupTaskStatus !== CampaignCommunityStatusEnum.ContentApproved &&
				this.campaign.startDateAtUTC
			) {
				this.isCampaignreadyForSendProposal = true;
			}
		});
		this.isCampaignreadyForSendProposal = !this.isCampaignreadyForSendProposal
			? this.campaign.status !== CampaignStatusEnum.Draft
			: this.isCampaignreadyForSendProposal;
	}

	linkSelectedPostType(postType) {
		switch (postType) {
			case 'Text':
				return 'Text';
			case 'ImageOrVideo':
				return 'Photo';
			case 'TextImageOrVideo':
				return 'Photo';
			case 'LiveVideo':
				return 'LiveVideo';
			case 'MultiVideo':
				return 'MultiVideo';
			case 'VideoImage':
				return 'VideoImage';
			default:
				return postType;
		}
	}

	createCommunityInput(selectedGroupId, selectedValue, index, type, isSoloEdit = false) {
		let input = {
			campaignId: this.campaign.campaignId,
			groupId: selectedGroupId
		};
		switch (type) {
			case 'admin':
				this.communities[index]['communityAdminId'] = selectedValue.id;
				this.communities[index]['communityAdminName'] = selectedValue.id ? selectedValue.fullname : null;
				this.communities[index]['mobileNumber'] = '+' + selectedValue.mobileDialCode + ' ' + selectedValue.mobileNumber;
				this.communities[index]['dialCode'] = selectedValue.mobileDialCode;
				this.communities[index]['countryCode'] = selectedValue.mobileCountryCode;
				this.communities[index]['email'] = selectedValue.email;
				this.communities[index]['modeOfCommunication'] = selectedValue.modeOfCommunication;
				this.communities[index]['modeOfCommunicationVerificationStatus'] =
					selectedValue.modeOfCommunicationVerificationStatus;
				input['communityAdminId'] = selectedValue.id;
				break;
			case 'POC':
				this.communities[index]['communityManagerId'] = selectedValue.id;
				this.communities[index]['communityManagerName'] = selectedValue.fullname;
				if (isSoloEdit) {
					input['communityManagerId'] = selectedValue.id;
				}
				break;
			case 'pricing':
				this.communities[index]['pricing'] = isSoloEdit ? selectedValue.target.value : selectedValue;
				input['pricing'] = isSoloEdit ? selectedValue.target.value : selectedValue;

				console.log(`Pricing update`);

				input['currency'] = this.communities[index]['currency']
					? this.communities[index]['currency']
					: this.campaign?.currency
					? this.campaign.currency
					: this.selectedCurrency;

				if (isSoloEdit) {
					(document.getElementsByClassName('pricing-value-' + index)[0] as HTMLElement).style.display = 'inline-block';
					(document.getElementsByClassName('pricing-input-' + index)[0] as HTMLElement).style.display = 'none';
				} else {
					input['currency'] = this.selectedCurrency;
					this.communities[index]['currency'] = this.selectedCurrency;
				}
				break;
			case 'paymentRemarks':
				this.communities[index]['paymentRemarks'] = isSoloEdit ? selectedValue.target.value : selectedValue;
				input['paymentRemarks'] = isSoloEdit ? selectedValue.target.value : selectedValue;
				if (isSoloEdit) {
					(document.getElementsByClassName('remarks-value-' + index)[0] as HTMLElement).style.display = 'inline-block';
					(document.getElementsByClassName('remarks-input-' + index)[0] as HTMLElement).style.display = 'none';
				}
				break;
			case 'paymentAmountPaid':
				this.communities[index]['paymentAmountPaid'] = isSoloEdit ? selectedValue.target.value : selectedValue;
				input['paymentAmountPaid'] = isSoloEdit ? selectedValue.target.value : selectedValue;
				if (isSoloEdit) {
					(document.getElementsByClassName('paymentAmountPaid-value-' + index)[0] as HTMLElement).style.display =
						'inline-block';
					(document.getElementsByClassName('paymentAmountPaid-input-' + index)[0] as HTMLElement).style.display =
						'none';
				}
				break;
			case 'currency':
				console.log(`Currency update`);
				this.communities[index]['currency'] = selectedValue;
				if (this.communities[index]['pricing']) {
					input['currency'] = selectedValue;
					input['pricing'] = this.communities[index]['pricing'];
				}
				break;
			case 'paymentStatus':
				this.communities[index]['paymentStatus'] = Object.keys(PaymentStatusEnum).find(
					key => PaymentStatusEnum[key] === selectedValue
				);
				input['paymentStatus'] = Object.keys(PaymentStatusEnum).find(key => PaymentStatusEnum[key] === selectedValue);

				console.log(`Paymn status: ${input['paymentStatus']}`);
				if (input['paymentStatus'] == PaymentStatusEnum.Done) {
					input['paymentAmountPaid'] = this.communities[index].pricing;
					this.communities[index].paymentAmountPaid = this.communities[index].pricing;
				}

				break;
			case 'paymentDate':
				input['paymentDate'] = selectedValue;
				break;
			case 'defaultTaskDate':
				input['defaultTaskDate'] = selectedValue;
				this.communities[index]['isDefaultDateAvailable'] = false;
				if (this.communities[index]['taskId']) {
					input['campaignGroupTaskId'] = this.communities[index]['taskId'];
				}
				break;
			case 'timezone':
				this.communities[index]['timezone'] = this.timeZoneList.find(zone => zone.indexOf(selectedValue) > -1);
				input['timezone'] = selectedValue;
				this.communities[index]['isDefaultTimezoneAvailable'] = false;
				break;
			case 'primaryChannel':
				this.communities[index]['modeOfCommunication'] = selectedValue.modeOfCommunication;
				input['communityAdminId'] = selectedValue.communityAdminId;
				input['modeOfCommunication'] = selectedValue.modeOfCommunication;
				break;
			case 'status':
				this.communities[index]['groupTaskStatus'] = selectedValue;
				input['groupTaskStatus'] = selectedValue;
			case 'cohort':
				this.communities[index]['cohort'] = selectedValue;
				input['cohort'] = selectedValue;
		}
		return input;
	}

	onBlurPricingInput(i) {
		const pricingValue = document.getElementsByClassName('pricing-value-' + i);
		const pricingInput = document.getElementsByClassName('pricing-input-' + i);
		(pricingValue[0] as HTMLElement).style.display = 'inline-block';
		(pricingInput[0] as HTMLElement).style.display = 'none';
	}

	onBlurPaymentAmountPaidInput(i) {
		const pricingValue = document.getElementsByClassName('paymentAmountPaid-value-' + i);
		const pricingInput = document.getElementsByClassName('paymentAmountPaid-input-' + i);
		(pricingValue[0] as HTMLElement).style.display = 'inline-block';
		(pricingInput[0] as HTMLElement).style.display = 'none';
	}

	onBlurPaymentRemarkInput(i) {
		const paymentRemarkValue = document.getElementsByClassName('remarks-value-' + i);
		const paymentRemarkInput = document.getElementsByClassName('remarks-input-' + i);
		(paymentRemarkValue[0] as HTMLElement).style.display = 'inline-block';
		(paymentRemarkInput[0] as HTMLElement).style.display = 'none';
	}

	inputPricing(i) {
		for (let j = 0; j <= this.communities?.length; j++) {
			const pricingValue = document.getElementsByClassName('pricing-value-' + j);
			const pricingInput = document.getElementsByClassName('pricing-input-' + j);
			if (pricingValue.length > 0) {
				(pricingValue[0] as HTMLElement).style.display = 'inline-block';
			}
			if (pricingInput.length > 0) {
				(pricingInput[0] as HTMLElement).style.display = 'none';
			}
			if (i === j) {
				if (pricingValue.length > 0) {
					(pricingValue[0] as HTMLElement).style.display = 'none';
				}
				if (pricingInput.length > 0) {
					(pricingInput[0] as HTMLElement).style.display = 'inline-block';
					setTimeout(() => {
						// @ts-ignore
						pricingInput[0].firstElementChild.focus();
					}, 1);
				}
			}
		}
	}

	inputPaymentAmountPaid(i) {
		for (let j = 0; j <= this.communities?.length; j++) {
			const paymentAmountPaidValue = document.getElementsByClassName('paymentAmountPaid-value-' + j);
			const paymentAmountPaidInput = document.getElementsByClassName('paymentAmountPaid-input-' + j);
			if (paymentAmountPaidValue.length > 0) {
				(paymentAmountPaidValue[0] as HTMLElement).style.display = 'inline-block';
			}
			if (paymentAmountPaidInput.length > 0) {
				(paymentAmountPaidInput[0] as HTMLElement).style.display = 'none';
			}
			if (i === j) {
				if (paymentAmountPaidValue.length > 0) {
					(paymentAmountPaidValue[0] as HTMLElement).style.display = 'none';
				}
				if (paymentAmountPaidInput.length > 0) {
					(paymentAmountPaidInput[0] as HTMLElement).style.display = 'inline-block';
					setTimeout(() => {
						// @ts-ignore
						paymentAmountPaidInput[0].firstElementChild.focus();
					}, 1);
				}
			}
		}
	}

	inputRemarks(i) {
		for (let j = 0; j <= this.communities?.length; j++) {
			const remarksValue = document.getElementsByClassName('remarks-value-' + j);
			const remarksInput = document.getElementsByClassName('remarks-input-' + j);
			if (remarksValue.length > 0) {
				(remarksValue[0] as HTMLElement).style.display = 'inline-block';
			}
			if (remarksInput.length > 0) {
				(remarksInput[0] as HTMLElement).style.display = 'none';
			}
			if (i === j) {
				if (remarksValue.length > 0) {
					(remarksValue[0] as HTMLElement).style.display = 'none';
				}
				if (remarksInput.length > 0) {
					(remarksInput[0] as HTMLElement).style.display = 'inline-block';
				}
			}
		}
	}

	updateDateTime(selectedDateTime) {
		if (!this.isBulkEdit) {
			const community = this.communities.find(community => community.groupId === this.selectedGroup);
			const i = this.communities.indexOf(community);
			this.communities[i]['defaultTaskDate'] = selectedDateTime.format('DD MMM YYYY hh:mm a');
			this.validatePostingTime();
			this.selectSoloEdit(this.selectedGroup, selectedDateTime.utc().dayJsObj, 'defaultTaskDate', null);
			this.openDateTimePicker = false;
		} else {
			const selectedDateTimeForCommunity = selectedDateTime.format('DD MMM YYYY hh:mm a');
			this.selectedGroups.forEach(community => {
				const i = this.communities.indexOf(community);
				this.communities[i]['defaultTaskDate'] = selectedDateTimeForCommunity;
			});
			this.validatePostingTime();
			this.bulkEdit(selectedDateTime.utc().dayJsObj, 'defaultTaskDate', this.campaignTasks);
			this.openDateTimePicker = false;
		}
	}

	updatePaymentDate(selectedDateTime) {
		if (this.user.userRole !== 'finance') {
			return this.alert.error('', 'Update of payment date available only for finance team');
		}

		if (!this.isBulkEdit) {
			const community = this.communities.find(community => community.groupId === this.selectedGroup);
			const i = this.communities.indexOf(community);
			this.communities[i]['paymentDate'] = selectedDateTime.format('DD MMM YYYY hh:mm a');
			// this.validatePostingTime();
			this.selectSoloEdit(this.selectedGroup, selectedDateTime.utc().dayJsObj, 'paymentDate', null);
			this.openPaymentDateTimePicker = false;
		} else {
			const selectedDateTimeForCommunity = selectedDateTime.format('DD MMM YYYY hh:mm a');
			this.selectedGroups.forEach(community => {
				const i = this.communities.indexOf(community);
				this.communities[i]['paymentDate'] = selectedDateTimeForCommunity;
			});
			// this.validatePostingTime();
			this.bulkEdit(selectedDateTime.utc().dayJsObj, 'paymentDate', this.campaignTasks);
			this.openPaymentDateTimePicker = false;
		}
	}

	async updateTimeZone(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		if (!this.isBulkEdit) {
			const community = this.communities.find(community => community.groupId === this.selectedGroup);
			const i = this.communities.indexOf(community);
			this.communities[i]['timezoneName'] = timezoneInfo.timezoneName;
			this.communities[i]['timezoneOffsetInMins'] = timezoneInfo.timezoneOffsetInMins;
		} else {
			this.selectedGroups.forEach(community => {
				const i = this.communities.indexOf(community);
				this.communities[i]['timezoneName'] = timezoneInfo.timezoneName;
				this.communities[i]['timezoneOffsetInMins'] = timezoneInfo.timezoneOffsetInMins;
			});
		}
	}

	async updateTimeZoneInfo() {
		if (!this.isBulkEdit) {
			const community = this.communities.find(community => community.groupId === this.selectedGroup);
			const i = this.communities.indexOf(community);
			const timezone = this.communities[i]['timezoneName'];
			this.selectSoloEdit(this.selectedGroup, timezone, 'timezone', null);
			this.communities[i]['timezone'] = this.timeZoneList.find(zone => zone.indexOf(timezone) > -1);
		} else {
			let timezone = '';
			this.selectedGroups.forEach(community => {
				const i = this.communities.indexOf(community);
				timezone = this.communities[i]['timezoneName'];
				this.communities[i]['timezone'] = this.timeZoneList.find(zone => zone.indexOf(timezone) > -1);
			});
			await this.bulkEdit(timezone, 'timezone', this.campaignTasks);
		}
		this.detailTobeEdited = null;
	}

	sortCommunities(event) {
		this.communities = _.sortBy(this.communities, [
			function (o) {
				return o[event]?.toLowerCase();
			}
		]);
	}

	getPocNameFromId(id) {
		return this.communityManagers?.find(communityManager => communityManager.id === id)?.fullname;
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

	openSendProposal() {
		this.numberOfEmailAddresses = 0;
		this.isEmailsAreValid = false;
		this.openProposalModal = true;
		this.brandEmailAddresses = {};
		this.campaignEmailAddresses = [];
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
		campaignCreateInput['status'] = CampaignStatusEnum.Draft;
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
			this.campaign.status = CampaignStatusEnum.PendingApproval;
			this.brand.resetDetails();
			this.sendingProposalInProgress = false;
		} catch (e) {
			this.alert.error(
				'Campaign creation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
			this.sendingProposalInProgress = false;
		}
	}

	async downloadCommunities() {
		const result = await this.campaignService.downloadCMCExecutionExcel(this.campaign.campaignId);
		var link = document.createElement('a');
		document.body.appendChild(link);
		link.setAttribute('type', 'hidden');
		link.href = 'data:text/plain;base64,' + result.body;
		link.download = this.campaign.campaignName + '_' + new DateTime().format('YYYY-MM-DD') + '.xlsx';
		link.click();
		document.body.removeChild(link);
	}

	closeUpdateModel() {
		this.detailTobeEdited = null;
		this.isBulkEdit = false;
		this.isUpdating = false;
	}

	async deleteBulkCommunities() {
		let communitiesToBeDeleted = [];
		let communityTasksNeedToBeDeleted = [];
		this.selectedGroups.forEach(group => {
			communitiesToBeDeleted.push(group.groupId);
			const campaignTaskIds = this.campaignTasks
				.filter(task => task.groupId === group.groupId)
				.map(task => task.taskId);
			if (campaignTaskIds.length > 0) {
				communityTasksNeedToBeDeleted = communityTasksNeedToBeDeleted.concat(campaignTaskIds);
			}
			this.updateDeletedCommunities.emit(group);
			this.communities = this.communities.filter(community => community.groupId !== group.groupId);
		});
		try {
			if (communitiesToBeDeleted.length > 0) {
				const totalBatch = this.utilityService.getBatchesOfArray(communitiesToBeDeleted, 25);
				const totalCampaignTaskBatch = this.utilityService.getBatchesOfArray(communityTasksNeedToBeDeleted, 25);
				const calls = [];
				for (let i = 0; i < totalBatch.length; i++) {
					calls.push(
						this.campaignService.deleteCMCampaignGroups(
							this.campaign.campaignId,
							totalBatch[i],
							totalCampaignTaskBatch[i] ? totalCampaignTaskBatch[i] : []
						)
					);
				}
				await Promise.all(calls);
				this.getCampaignTasks();
			}
			this.alert.success('The communities have been successfully removed.', 'Deleted successfully');
			this.selectedGroups = [];
		} catch (e) {
			this.alert.error(
				'Some error occurred',
				'We are unable to delete this community at this moment. Please try again later.'
			);
		}
		this.campaign.resetCampaignTasksData();
	}

	currencyToShow(currency) {
		return this.utilityService.currencyToShow(currency);
	}

	paymentStatusToShow(status) {
		return PaymentStatusEnum[status];
	}

	async submitModeOfCommunication(form, type, triggerType = null) {
		this.isUpdating = true;
		try {
			let input;
			const i = this.communities.indexOf(this.selectedRow['community']);
			if (type === 'whatsapp') {
				if (triggerType === 'auto') {
					input = {
						channel: 'WhatsApp',
						mobileCountryCode: form.countryCode,
						mobileDialCode: form.dialCode,
						mobileNumber: form.mobileNumber.toString().split(' ')[1],
						communityAdminId: this.selectedRow['admin'],
						communityManagerName: this.selectedRow['communityManager']
					};
					this.communities[i]['mobileNumber'] = form.mobileNumber;
				} else {
					const mobileNumber = form.value.whatsapp.number.replace(/[ ]/g, '');
					const dialCode = form.value.whatsapp.dialCode.replace(/[+]/g, '');
					const countryCode = form.value.whatsapp.countryCode;
					// const maskedNumber = await this.appService.getMaskedNumber(mobileNumber);

					input = {
						channel: 'WhatsApp',
						mobileCountryCode: countryCode,
						mobileDialCode: dialCode,
						mobileNumber: mobileNumber,
						communityAdminId: this.selectedRow['admin'],
						communityManagerName: this.selectedRow['communityManager']
					};
					this.communities[i]['mobileNumber'] = '+' + dialCode + ' ' + mobileNumber;
				}
			}
			if (type === 'email') {
				if (triggerType === 'auto') {
					input = {
						channel: 'Email',
						email: form.email,
						communityAdminId: this.selectedRow['admin'],
						communityManagerName: this.selectedRow['communityManager']
					};
					this.communities[i]['email'] = form.email;
				} else {
					input = {
						channel: 'Email',
						email: this.emailToBeVerified,
						communityAdminId: this.selectedRow['admin'],
						communityManagerName: this.selectedRow['communityManager']
					};
					this.communities[i]['email'] = this.emailToBeVerified;
				}
			}
			const whatsAppResponse = await this.createCampaignService.triggerNotificationsForWAorEmailUpdate(input);
			this.isUpdating = false;
			this.verificationDialogToBeOpened = null;
			this.communities[i]['modeOfCommunicationVerificationStatus'] = 'VerificationSent';
		} catch (error) {
			this.isUpdating = false;
			this.verificationDialogToBeOpened = null;
			this.alert.error('Some error occurred', 'We are unable to add the contact details.');
		}
	}

	openWhatsappOrEmailChatWindow(value, type) {
		switch (type) {
			case 'email':
				window.open('https://mail.google.com/mail/u/0/#search/' + value);
				break;
			case 'whatsapp':
				window.open('https://wa.me/' + value);
				break;
		}
	}

	displayDateBasedOnTimezone(dateTimeString, timezone = this.timeZone) {
		const timezoneOffsetInMins = new DateTime().utc().getUtcOffset(timezone);
		return new DateTime(dateTimeString)
			.add(timezoneOffsetInMins - this.userTimezoneOffsetInMins, 'minutes')
			.toISOString();
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

	hideCommunityListPopup(event) {
		this.showCommunityListPopup = event;
	}

	async closeCommunitySelectionOverlay() {
		setTimeout(async () => {
			this.showDiscoverCommunitiesDialog = false;
			await this.getCommunitiesFromAPI.emit();
			this.sortCommunities('Member count');
		}, 1000);
	}

	parseCampaignAssetStatus(status: campaignAssetsStatus) {
		switch (status) {
			case campaignAssetsStatus.CampaignStatusDone:
				return 'Done';
			case campaignAssetsStatus.CampaignStatusInitial:
				return 'Initial';
			case campaignAssetsStatus.CampaignStatusPendingCommunityAdminAccept:
				return 'Pending community admin accept';
			case campaignAssetsStatus.CampaignStatusPendingCopiesAssets:
				return 'Pending copies assets';
			case campaignAssetsStatus.CampaignStatusProductPurchase:
				return 'Pending product purchase';
			case campaignAssetsStatus.CampaignStatusProposalNotSent:
				return 'Proposal not sent';
			case campaignAssetsStatus.CampaignStatusPendingBrand:
				return 'Pending brand';
			case campaignAssetsStatus.CampaignStatusPendingAdmin:
				return 'Pending admin';
			case campaignAssetsStatus.CampaignStatusPendingFbLink:
				return 'Pending fb link';
			case campaignAssetsStatus.CampaignStatusPendingComplete:
				return 'Pending complete';
			default:
				return 'Default';
		}
	}

	changeRequireAssetMessage(event) {
		this.requireAssetMessage = event.target.value;
	}

	handleRequireAssetModal() {
		if (this.showRequireAssetModal) {
			this.showRequireAssetModal = false;
			this.requireAssetMessage = '';
		} else {
			this.showRequireAssetModal = true;
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
