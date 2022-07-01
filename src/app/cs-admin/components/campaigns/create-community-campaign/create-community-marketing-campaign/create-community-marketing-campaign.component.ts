import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';
import {DateTime} from '@sharedModule/models/date-time';
import {FileService} from '@sharedModule/services/file.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import * as _ from 'lodash';
import {BrandService} from 'src/app/brand/services/brand.service';
import {CreateCampaignService} from 'src/app/cs-admin/services/create-campaign.service';
import {PostContentTypeEnum} from 'src/app/group-admin/models/facebook-post.model';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {CampaignStatusEnum, UpdateCampaignInput} from 'src/app/shared/models/graph-ql.model';
import {UserModel} from 'src/app/shared/models/user.model';
import {AlertService} from 'src/app/shared/services/alert.service';
import {environment} from 'src/environments/environment';
import {utils, writeFile} from 'xlsx';

@Component({
	selector: 'app-create-community-marketing-campaign',
	templateUrl: './create-community-marketing-campaign.component.html',
	styleUrls: ['./create-community-marketing-campaign.component.scss']
})
export class CreateCommunityMarketingCampaignComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	brands: BrandModel[];
	brand: BrandModel;
	selectedBrand;
	campaignDetailsForm: FormGroup;
	campaignTaskViewDetails;
	campaignTaskDetails = {name: '', numberOfGroups: 0, numberOfAdmins: 0, numberOfTasks: 0, numberOfMissings: 0};
	stepsCompleted = 0;
	showFinishBtn = false;
	currentStep = 2;
	brandEmailAddresses = {};
	numberOfEmailAddresses = 0;
	finalCampaignTaskDetails = {
		selectedBrand: '',
		campaignInfo: {},
		campaignTasks: [],
		campaignEmailAddresses: {},
		fileName: ''
	};
	campaignName;
	campaignType;
	isEmailsAreValid = false;
	campaignTaskColumnNames = [
		'No.',
		'GROUP ID',
		'GROUP NAME',
		'GROUP ADMIN/MODERATOR',
		'POST TYPE',
		'PERIOD',
		'TITLE',
		'TEXT',
		'DATE',
		'TIME',
		'URL'
	];
	proposalUrl;
	isCsAdmin = true;
	isSubmitting = false;
	isDraftSubmitting = false;

	addNewTask = false;
	isDataUploading = false;
	filePercentage = 0;
	selectedItems = [];
	campaign;
	campaignTasks: CampaignTaskModel[];
	currentDate = new DateTime().toDate();
	isFinishEnabled = false;
	isDateValid = true;
	timeOptions = [];
	publishTime = '12:30 AM';
	invalidTaskPublishDate = false;
	invalidDefaultPublishDate = false;
	timezoneName = DateTime.guess();
	timeZonePlaceholder = 'TIME ZONE';
	timeZone = DateTime.guess();
	userTimezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timeZoneList;
	campaignDetailFormValidStatus = false;
	isCampaignDetailsLoaded = false;
	campaignDetails;
	selectedCommunities = [];
	isCommunityViewPage = false;
	groupsSelectedForCampaignCreation;
	memberSizeOfGroupsSelectedForCampaignCreation = 0;
	showCommunityListPopup = false;
	isAddCampaignEnabled = false;
	isSavingGroupCommunities = false;
	listKeywordsLoaded = false;

	quillConfig = {
		toolbar: [['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]]
	};

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private readonly alertService: AlertService,
		private readonly createCampaignService: CreateCampaignService,
		private readonly campaignService: CampaignService,
		private readonly fileService: FileService,
		private readonly utilityService: UtilityService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();

		this.brandService.init();

		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				const id = params['brandId'];
				const campaignId = params['campaignId'];
				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(async brands => {
						if (!brands) {
							return;
						}

						this.brands = brands;
						this.selectedBrand = brands.find(brnd => brnd.id === id);
						if (this.selectedBrand) {
							this.stepsCompleted = 1;
							this.finalCampaignTaskDetails.selectedBrand = this.selectedBrand;
						}
						this.brandService.selectedBrand.next(this.selectedBrand);
						if (campaignId) {
							const campaigns = await this.selectedBrand.getCampaigns();
							this.campaign = campaigns.find(campaign => campaign.campaignId === campaignId);
							this.campaignDetails = this.campaign;
							this.campaignName = this.campaign?.campaignName;
							if (this.campaign) {
								this.finalCampaignTaskDetails.campaignInfo = Object.assign({}, this.campaign);
								this.createCampaignService.campaignType.next(this.campaign.type);
								this.getCampaignGroups();
								this.setCampaignDetailsInfo();
								this.getCampaignTasks();
								this.isCampaignDetailsLoaded = true;
								this.currentStep = 3;
							} else {
								this.finalCampaignTaskDetails.campaignInfo = null;
								this.isCampaignDetailsLoaded = true;
							}
						} else {
							this.finalCampaignTaskDetails.campaignInfo = null;
							this.isCampaignDetailsLoaded = true;
						}
					})
				);
			})
		);

		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(async brand => {
				if (!brand) {
					return;
				}

				this.brand = brand;
			})
		);
		this.subscriptionsToDestroy.push(
			this.createCampaignService.name.subscribe(async name => {
				if (!name) {
					return;
				}

				this.campaignName = name;
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
		this.proposalUrl = environment.baseUrl + 'brand/manage-campaigns';
		this.timeOptions = this.createCampaignService.getTimesOnWhichPostCanBePublished();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async getCampaignTasks() {
		this.campaignTasks = await this.campaign.getCampaignTasks();
		if (this.campaignTasks && this.campaignTasks.length > 0) {
			this.campaignTaskViewDetails = [];
			this.campaignTasks.forEach((task, index) => {
				const taskInfo = CampaignTaskModel.setProperties(task, this.campaign.campaignId);
				taskInfo['No.'] = index + 1;
				this.campaignTaskViewDetails.push(taskInfo);
			});
			this.campaignTaskViewDetails = _.orderBy(
				this.campaignTaskViewDetails,
				[
					task =>
						new DateTime(new DateTime(task['DATE']).format('MM/DD/YYYY') + ', ' + task['TIME'], 'MM/DD/YYYY, hh:mm A')
				],
				['asc']
			);
			this.campaignTaskDetails.numberOfTasks = this.campaignTaskViewDetails.length;
			this.campaignTaskDetails.numberOfAdmins = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ADMIN/MODERATOR').length;
			this.campaignTaskDetails.numberOfGroups = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ID').length;
			this.finalCampaignTaskDetails.campaignTasks = this.campaignTaskViewDetails;
			if (this.finalCampaignTaskDetails) {
				this.isFinishEnabled = !this.isFinishEnabled ? this.isFinishEnabled : true;
			}
		}
	}

	async getCampaignGroups() {
		this.selectedCommunities = await this.campaignService.getCampaignsList(
			this.campaign.campaignId,
			this.campaign.brandId
		);
		this.selectedCommunities.forEach(community => (community['isAlreadySelectedCommunity'] = true));
	}

	setCampaignDetailsInfo() {
		if (this.campaign.proposalEmails) {
			this.campaign.proposalEmails.forEach(email => {
				this.numberOfEmailAddresses += 1;
				this.brandEmailAddresses['email' + this.numberOfEmailAddresses] = email;
			});
		}
		if (this.finalCampaignTaskDetails.campaignInfo) {
			if (this.campaign['startDateAtUTC'] >= this.currentDate && this.currentDate <= this.campaign['endDateAtUTC']) {
				this.isFinishEnabled = true;
			} else {
				this.isFinishEnabled = false;
			}
		}
		this.finalCampaignTaskDetails.campaignEmailAddresses = JSON.parse(JSON.stringify(this.brandEmailAddresses));
		if (this.finalCampaignTaskDetails.campaignEmailAddresses) {
			this.isFinishEnabled = !this.isFinishEnabled ? this.isFinishEnabled : true;
		} else {
			this.isFinishEnabled = false;
		}
		this.finalCampaignTaskDetails.campaignInfo['timezoneName'] = this.campaign['timezoneName'];
		this.timezoneName = this.campaign['timezoneName'] ? this.campaign['timezoneName'] : this.timezoneName;
		this.pushTimezoneNames(this.campaign);
	}

	validateCampaignDetails() {
		if (this.campaignTaskViewDetails) {
			this.campaignTaskDetails.numberOfMissings = this.createCampaignService.validatingMissingDetails(
				this.campaignTaskViewDetails
			);
			this.campaignTaskDetails.numberOfTasks = this.campaignTaskViewDetails.length;
			this.campaignTaskDetails.numberOfAdmins = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ADMIN/MODERATOR').length;
			this.campaignTaskDetails.numberOfGroups = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ID').length;
		}
	}

	closeTaskDetailsView(event) {
		this.validateCampaignDetails();
		if (this.campaignTaskViewDetails.length === 0) {
			this.campaignTaskViewDetails = null;
		}
	}

	formSubmitValue(formValue) {
		this.campaignDetailsForm = formValue;
	}

	updateFormValidStatus(event) {
		this.campaignDetailFormValidStatus = event;
		if (!this.campaignDetailFormValidStatus) {
			this.currentStep = 2;
		}
	}

	isListKeywordsLoaded(event) {
		this.listKeywordsLoaded = event;
	}

	showNewTaskTab() {
		this.addNewTask = !this.addNewTask;
		if (this.campaignTaskViewDetails && this.campaignTaskViewDetails.length === 0) {
			this.campaignTaskViewDetails = null;
		} else if (!this.campaignTaskViewDetails) {
			this.campaignTaskViewDetails = [];
		} else {
			this.validateCampaignDetails();
		}
	}

	showProposals() {
		if (this.currentStep !== 4) {
			if (_.isEmpty(this.finalCampaignTaskDetails.campaignEmailAddresses)) {
				this.brandEmailAddresses = {};
				this.isEmailsAreValid = false;
			} else {
				this.brandEmailAddresses = JSON.parse(JSON.stringify(this.finalCampaignTaskDetails.campaignEmailAddresses));
			}
		}
		this.currentStep = 4;
	}

	copyProposalUrl() {
		const copyText = <HTMLInputElement>document.getElementById('copyProposalUrl');
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand('copy');
	}

	downloadSheet() {
		const campaignDetails = [];
		this.campaignTaskViewDetails.forEach(task => {
			const taskDet = {};
			this.campaignTaskColumnNames.forEach(column => {
				taskDet[column] = task[column];
			});
			if (taskDet['URL']) {
				taskDet['URL'] = taskDet['URL'].join(';');
			}
			campaignDetails.push(taskDet);
		});
		const worksheet = utils.json_to_sheet(campaignDetails);
		const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
		writeFile(workbook, 'Updated Campaign Task.xlsx');
	}

	cancelCampaignDetails() {
		this.campaignDetails = this.finalCampaignTaskDetails.campaignInfo;
	}

	cancelUploadTaskDetails() {
		this.campaignTaskViewDetails =
			this.finalCampaignTaskDetails.campaignTasks.length > 0 ? this.finalCampaignTaskDetails.campaignTasks : null;
		this.campaignTaskDetails.name = this.finalCampaignTaskDetails.fileName
			? this.finalCampaignTaskDetails.fileName
			: '';
		this.validateCampaignDetails();
		(<HTMLInputElement>document.getElementById('taskFile')).value = '';
	}

	cancelCurrentStepDetails(step) {
		if (this.stepsCompleted >= step) {
			this.currentStep = step + 1;
		}
	}

	saveCampaignInfoDetails() {
		this.stepsCompleted = this.stepsCompleted > 2 ? this.stepsCompleted : 2;
		this.currentStep = 3;
		this.finalCampaignTaskDetails.campaignInfo = this.campaignDetailsForm;
		this.campaignDetails = this.finalCampaignTaskDetails.campaignInfo;
	}

	saveCampaignTaskDetails() {
		this.stepsCompleted = this.stepsCompleted > 3 ? this.stepsCompleted : 3;
		this.showProposals();
		this.currentStep = 4;
		this.finalCampaignTaskDetails.campaignTasks = this.campaignTaskViewDetails;
		this.finalCampaignTaskDetails.fileName = this.campaignTaskDetails.name;
	}

	saveEmailAddresses() {
		this.stepsCompleted = this.stepsCompleted > 4 ? this.stepsCompleted : 4;
		this.showFinishBtn = true;
		this.isFinishEnabled = true;
		this.currentStep = 5;
		this.finalCampaignTaskDetails.campaignEmailAddresses = JSON.parse(JSON.stringify(this.brandEmailAddresses));
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

	async pushTimezoneNames(campaignInfo) {
		const momentScriptLoad = await this.utilityService.insertMomentTimeZoneScript();
		if (!momentScriptLoad) {
			return;
		}

		this.timeZoneList = this.utilityService.pushTimezoneNames();
		const timeZone = this.timeZoneList.find(zone => zone.indexOf(this.timezoneName) > -1);
		this.timeZone = timeZone ? timeZone : this.timeZone;
		this.optionSelected(timeZone);
		if (campaignInfo?.['defaultTaskDate']) {
			this.setDefaultDate(campaignInfo);
		}
	}

	async optionSelected(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		this.timezoneName = timezoneInfo.timezoneName;
		this.timezoneOffsetInMins = timezoneInfo.timezoneOffsetInMins;
	}

	async setDefaultDate(campaignInfo) {
		const defaultTaskDate = this.utilityService.setDefaultDate(
			this.timezoneName,
			campaignInfo['defaultTaskDate'],
			this.userTimezoneOffsetInMins
		);
		this.publishTime = defaultTaskDate.publishTime ? defaultTaskDate.publishTime : this.publishTime;
		if (this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']) {
			this.finalCampaignTaskDetails.campaignInfo['timezoneName'] = this.timezoneName;
			this.finalCampaignTaskDetails.campaignInfo['publishTime'] = this.publishTime;
			this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate'] = defaultTaskDate.date;
			this.finalCampaignTaskDetails.campaignInfo['timezoneOffMins'] =
				this.userTimezoneOffsetInMins - new DateTime().utc().getUtcOffset(this.timezoneName);
		}
	}

	async addMoreCommunities() {
		this.isSavingGroupCommunities = true;
		this.selectedCommunities.push(this.groupsSelectedForCampaignCreation);
		const createCMCampaignGroupInput = [];
		const groupsSelectedForCampaignCreation = _.uniqBy(this.groupsSelectedForCampaignCreation, 'groupId');

		groupsSelectedForCampaignCreation?.forEach(community => {
			if (!community['isAlreadySelectedCommunity']) {
				const communityInfo = {};
				communityInfo['campaignId'] = this.campaign.campaignId;
				communityInfo['groupId'] = community['groupId'];
				communityInfo['fbGroupId'] = community['fbGroupId'];
				communityInfo['memberCount'] = community['memberCount'];
				communityInfo['engagementRate'] = community['last30DaysEngagementRate'];
				communityInfo['activityRate'] = community['last30DaysActivityRate'];
				communityInfo['categoryConversationCount'] = community['conversationCount'];
				communityInfo['groupName'] = community['groupName'];
				createCMCampaignGroupInput.push(communityInfo);
			}
		});

		if (createCMCampaignGroupInput) {
			try {
				await this.campaignService.createCMCampaignGroups(createCMCampaignGroupInput);
				this.getCampaignGroups();
				this.isCommunityViewPage = false;
				this.isSavingGroupCommunities = false;
			} catch (e) {
				this.isSavingGroupCommunities = false;
				this.alert.error(
					'Some error occurred',
					'We are unable to add communities at this moment. Please try again later.'
				);
			}
		}
	}

	async sendCampaignDetails(type) {
		type === 'draft' ? (this.isDraftSubmitting = true) : (this.isSubmitting = true);
		const proposalEmails = [];
		_.each(this.finalCampaignTaskDetails.campaignEmailAddresses, email => {
			proposalEmails.push(email);
		});
		const campaignCreateInput = {};
		campaignCreateInput['brandId'] = this.selectedBrand.id;
		campaignCreateInput['brandName'] = this.selectedBrand.name;
		if (this.campaign) {
			campaignCreateInput['campaignId'] = this.campaign['campaignId'];
			campaignCreateInput['campaignName'] = this.campaign['campaignName'];
			campaignCreateInput['status'] = this.campaign.status;
		} else {
			campaignCreateInput['brandLogoURL'] = this.selectedBrand.iconUrl;
			campaignCreateInput['campaignName'] = this.campaignName;
			campaignCreateInput['status'] = CampaignStatusEnum.Draft;
		}
		campaignCreateInput['details'] = this.finalCampaignTaskDetails.campaignInfo['details'];
		campaignCreateInput['campaignBriefForCommunityAdmin'] = this.finalCampaignTaskDetails.campaignInfo['details'];
		campaignCreateInput['startDateAtUTC'] = new DateTime(this.finalCampaignTaskDetails.campaignInfo['startDate'])
			.utc()
			.toISOString();
		campaignCreateInput['endDateAtUTC'] = new DateTime(this.finalCampaignTaskDetails.campaignInfo['endDate'])
			.endOf('day')
			.utc()
			.toISOString();
		campaignCreateInput['KPIs'] = this.finalCampaignTaskDetails.campaignInfo['KPIs'];
		campaignCreateInput['cmcType'] = this.finalCampaignTaskDetails.campaignInfo['cmcType'];
		campaignCreateInput['proposalEmails'] = proposalEmails;
		campaignCreateInput['objective'] = this.finalCampaignTaskDetails.campaignInfo['objective'];
		campaignCreateInput['keywordCategory'] = this.finalCampaignTaskDetails.campaignInfo['keywordCategory'];
		campaignCreateInput['keywordBrand'] = this.finalCampaignTaskDetails.campaignInfo['keywordBrand'];
		campaignCreateInput['keywords'] = this.finalCampaignTaskDetails.campaignInfo['keywords'];
		campaignCreateInput['cmcReportName'] = this.finalCampaignTaskDetails.campaignInfo['communityNameForReports'];
		campaignCreateInput['keywordSubCategories'] = this.finalCampaignTaskDetails.campaignInfo['keywordSubCategories'];
		campaignCreateInput['campaignSummary'] = this.finalCampaignTaskDetails.campaignInfo['campaignSummary'];
		campaignCreateInput['proposalEmails'] = proposalEmails;
		campaignCreateInput['cmcReportName'] = this.finalCampaignTaskDetails.campaignInfo['communityNameForReports'];
		campaignCreateInput['primaryObjective'] = this.finalCampaignTaskDetails.campaignInfo['primaryObjective'];
		campaignCreateInput['secondaryObjective'] = this.finalCampaignTaskDetails.campaignInfo['secondaryObjective'];
		campaignCreateInput['taskTitle'] = this.finalCampaignTaskDetails.campaignInfo['taskTitle'];
		campaignCreateInput['campaignPeriod'] = this.finalCampaignTaskDetails.campaignInfo['campaignPeriod'];
		campaignCreateInput['cmcReportVersion'] = 2;

		if (this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']) {
			campaignCreateInput['defaultTaskDate'] = new DateTime(
				new DateTime(this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']).format('MM/DD/YYYY') +
					', ' +
					this.finalCampaignTaskDetails.campaignInfo['publishTime'],
				'MM/DD/YYYY, hh:mm A'
			)
				.add(this.finalCampaignTaskDetails.campaignInfo['timezoneOffMins'], 'minutes')
				.utc()
				.toISOString();

			campaignCreateInput['timezoneName'] = this.finalCampaignTaskDetails.campaignInfo['timezoneName'];
		}

		let campaignDetails;
		try {
			if (this.campaign) {
				campaignDetails = await this.createCampaignService.updateCampaignDetails(
					campaignCreateInput as UpdateCampaignInput
				);
				this.actionOnCampaignTasks(this.campaign.campaignId, type, this.campaign);
			} else {
				campaignCreateInput['engagementInsights'] = [
					'intent|Purchase Intent:_get_,_Buy_,Bought,Price,Cost,_pp_,discount,sale,amazon,_shop_,purchase,khareed,kharid,will%try,want%try,will%use,want%use',
					'intent|Recommendations:_try_,Reco,Recco,suggest,go for it,must%buy,should%buy',
					'intent|Usage:using,used,tried,_got_,apply,applied,istemal,_laga_,_lagaa_',
					'emotions|Positive Emotion:_Great_,awesome,love,fantastic,excellent,excelent,good,_gud_,_super_,superb,accha,amazing,badhiya,badiya,favorite,favourite,favorit,favourit,favrit,_best_'
				];
				campaignDetails = await this.createCampaignService.createCampaign(campaignCreateInput);
				this.sendCampaignTaskDetails(
					this.finalCampaignTaskDetails.campaignTasks,
					campaignDetails.campaignId,
					type,
					campaignDetails
				);
			}
		} catch (e) {
			type === 'draft' ? (this.isDraftSubmitting = false) : (this.isSubmitting = false);
			this.alert.error(
				'Campaign creation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
		}
	}

	actionOnCampaignTasks(campaignId, type, campaign) {
		const editedTasks = this.finalCampaignTaskDetails.campaignTasks.filter(
			task => task.isTaskEdited === true && task.taskId
		);
		editedTasks.forEach(task => {
			this.updateCampaignTaskDetails(task, campaignId);
		});
		const stringOfCampaignTasks = JSON.stringify(this.finalCampaignTaskDetails.campaignTasks);
		const deletedTasks = this.campaignTasks.filter(task => stringOfCampaignTasks.indexOf(task.taskId) < 0);
		this.deleteCampaignTask(campaignId, deletedTasks);
		const tasks = this.finalCampaignTaskDetails.campaignTasks.filter(task => !task.taskId);
		this.sendCampaignTaskDetails(tasks, campaignId, type, campaign);
	}

	async sendCampaignTaskDetails(tasks, campaignId, type, campaign) {
		let calls = [];
		const chunkSize = 25;
		const batchOfCampaignTasks = [];
		const campaignTasksInfo = [];
		const callSize = 10;

		const imageFileCalls = [];
		const videoFileCalls = [];
		_.each(tasks, async task => {
			const taskInfo = {};
			taskInfo['campaignId'] = campaignId;
			taskInfo['userId'] = task['USER ID'];
			taskInfo['userName'] = task['GROUP ADMIN/MODERATOR'];
			taskInfo['groupId'] = task['GROUP ID'];
			taskInfo['groupName'] = task['GROUP NAME'];
			taskInfo['title'] = task['TITLE'];
			taskInfo['toBePerformedByUTC'] = task['defaultTaskDate'];
			taskInfo['type'] = 'Post';
			taskInfo['period'] = task['PERIOD'];
			if (
				task['POST TYPE'] === PostContentTypeEnum.LiveVideo ||
				task['POST TYPE'] === PostContentTypeEnum.MultiVideo ||
				task['POST TYPE'] === PostContentTypeEnum.VideoImage
			) {
				taskInfo['text'] = '';
				imageFileCalls.push(this.processFilesForUrls('image', task['imageUrls']));
				videoFileCalls.push(this.processFilesForUrls('video', task['videoUrls']));
				taskInfo['isPlaceholder'] = true;
			} else {
				taskInfo['text'] = task['TEXT'];
				imageFileCalls.push(this.processFilesForUrls('image', task['imageUrls']));
				videoFileCalls.push(this.processFilesForUrls('video', task['videoUrls']));
				taskInfo['isPlaceholder'] = false;
			}
			taskInfo['postType'] = this.getPostType(task, task['POST TYPE']);
			taskInfo['timezoneName'] = task['timezoneName'];
			campaignTasksInfo.push(taskInfo);
		});
		const imageUrls = await Promise.all(imageFileCalls);
		const videoUrls = await Promise.all(videoFileCalls);
		imageUrls.forEach((image, index) => {
			campaignTasksInfo[index]['imageUrls'] = image;
		});
		videoUrls.forEach((video, index) => {
			campaignTasksInfo[index]['videoUrls'] = video;
		});
		for (let index = 0; index < campaignTasksInfo.length; index += chunkSize) {
			const tasks = campaignTasksInfo.slice(index, index + chunkSize);
			batchOfCampaignTasks.push(tasks);
		}
		try {
			for (let index = 0; index < batchOfCampaignTasks.length; index += callSize) {
				calls = [];
				for (let callIndex = index; callIndex < index + callSize; callIndex++) {
					if (batchOfCampaignTasks[callIndex]) {
						calls.push(
							this.createCampaignService.createCampaignTask(batchOfCampaignTasks[callIndex], this.selectedBrand.id)
						);
					}
				}
				await Promise.all(calls);
			}

			if (type !== 'draft') {
				await this.campaignService.markCampaignStatus(campaign.brandId, campaignId, CampaignStatusEnum.PendingApproval);
			}
			type === 'draft' ? (this.isDraftSubmitting = false) : (this.isSubmitting = false);
			if (document.getElementById('cancelCampaign')) {
				document.getElementById('cancelCampaign').click();
			}
			this.alertService.success('Check campaign list for selected brand', 'Campaign created successfully', 5000, true);
			this.selectedBrand.resetDetails();
			this.router.navigateByUrl('/cs-admin/brands/' + this.selectedBrand.id + '/manage-brand-campaigns');
		} catch (e) {
			type === 'draft' ? (this.isDraftSubmitting = false) : (this.isSubmitting = false);
		}
	}

	async updateCampaignTaskDetails(task, campaignId) {
		const calls = [];
		const taskInfo = {};
		taskInfo['taskId'] = task['taskId'];
		taskInfo['campaignId'] = campaignId;
		taskInfo['userId'] = task['USER ID'];
		taskInfo['userName'] = task['GROUP ADMIN/MODERATOR'];
		taskInfo['groupId'] = task['GROUP ID'];
		taskInfo['groupName'] = task['GROUP NAME'];
		taskInfo['title'] = task['TITLE'];
		taskInfo['period'] = task['PERIOD'];
		taskInfo['toBePerformedByUTC'] = task['defaultTaskDate'];
		// taskInfo['status'] = isShellTask ? TaskStatusEnum.Completed : task['STATUS'];
		task['STATUS'] = taskInfo['status'];
		if (
			task['POST TYPE'] === PostContentTypeEnum.LiveVideo ||
			task['POST TYPE'] === PostContentTypeEnum.MultiVideo ||
			task['POST TYPE'] === PostContentTypeEnum.VideoImage
		) {
			taskInfo['text'] = '';
			taskInfo['imageUrls'] = [];
			taskInfo['videoUrls'] = [];
			taskInfo['isPlaceholder'] = true;
			task['TEXT'] = '';
			task['imageUrls'] = [];
			task['videoUrls'] = [];
			task['isPlaceholder'] = true;
		} else {
			taskInfo['text'] = task['TEXT'];
			const processedFileURLs = await Promise.all([
				this.processFilesForUrls('image', task['imageUrls']),
				this.processFilesForUrls('video', task['videoUrls'])
			]);
			taskInfo['imageUrls'] = processedFileURLs[0];
			taskInfo['videoUrls'] = processedFileURLs[1];
			taskInfo['isPlaceholder'] = false;
			task['isPlaceholder'] = false;
		}
		taskInfo['postType'] = this.getPostType(taskInfo, task['POST TYPE']);
		taskInfo['fbPermlink'] = task['fbPermlink'];
		taskInfo['timezoneName'] = task['timezoneName'];
		calls.push(this.createCampaignService.updateCampaignTaskDetails(taskInfo));
		try {
			await Promise.all(calls);
		} catch (e) {}
	}

	async deleteCampaignTask(campaignId, tasks) {
		let calls = [];
		const callSize = 10;

		try {
			for (let index = 0; index < tasks.length; index += callSize) {
				calls = [];
				for (let callIndex = index; callIndex < index + callSize; callIndex++) {
					if (tasks[index]) {
						calls.push(this.createCampaignService.deleteCampaignTask(campaignId, tasks[index]['taskId']));
					}
				}
				const deletedTasks = await Promise.all(calls);
			}
		} catch (e) {}
	}

	getPostType(task: any, postType: string) {
		if (postType === 'Image') {
			return task['imageUrls'].length > 1 ? PostContentTypeEnum.Album : PostContentTypeEnum.Photo;
		} else {
			return postType;
		}
	}

	private async processFilesForUrls(type: 'image' | 'video', files: any) {
		if (!files) {
			return [];
		}
		const requestsForProcessingFileURLs = [];

		for (let i = 0; i < files.length; i++) {
			const data = ({}[type + 'File'] = files[i]);

			if (typeof files[i] !== 'string') {
				this.logger.debug(
					'Uploading' + type + ' file data to s3',
					data,
					'CreateCommunityMarketingCampaignComponent',
					'processFilesForUrls'
				);
				requestsForProcessingFileURLs.push(this.fileService.uploadToS3(files[i], type, this.randomUuid()));
			} else {
				requestsForProcessingFileURLs.push(new Promise(resolve => resolve(files[i])));
			}
		}

		return await Promise.all(requestsForProcessingFileURLs);
	}

	async navigateToBrands() {
		this.router.navigate(['/cs-admin/manage-brands']);
	}

	async navigateToCampaigns() {
		this.router.navigate(['/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns']);
	}

	async gotoCampaignsPage() {
		this.router.navigate(['/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns']);
	}
}
