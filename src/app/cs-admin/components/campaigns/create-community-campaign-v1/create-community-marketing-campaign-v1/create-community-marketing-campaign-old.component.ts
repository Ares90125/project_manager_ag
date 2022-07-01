import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {PostContentTypeEnum} from '@groupAdminModule/models/facebook-post.model';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BrandModel} from '@sharedModule/models/brand.model';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignStatusEnum, UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {UserModel} from '@sharedModule/models/user.model';
import {AlertService} from '@sharedModule/services/alert.service';
import {FileService} from '@sharedModule/services/file.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import * as _ from 'lodash';
import {environment} from 'src/environments/environment';
import {utils, writeFile} from 'xlsx';

@Component({
	selector: 'app-create-community-marketing-campaign-old',
	templateUrl: './create-community-marketing-campaign-old.component.html',
	styleUrls: ['./create-community-marketing-campaign-old.component.scss']
})
export class CreateCommunityMarketingCampaignOldComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	brands: BrandModel[];
	brand: BrandModel;
	selectedBrand;
	campaignDetailsForm: FormGroup;
	campaignTaskViewDetails;
	campaignTaskDetails = {name: '', numberOfGroups: 0, numberOfAdmins: 0, numberOfTasks: 0, numberOfMissings: 0};
	keywordForEditor;
	keywordList = [];
	isKeywordListEdited = false;
	lineNumbersForEditor;
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
	minDate = new DateTime().toDate();
	minStartDate = new DateTime().toDate();
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

	listKeywords = [];
	categories = [];
	subCategories = [];
	subCategoryBrands = [];
	addNewTask = false;
	isDataUploading = false;
	filePercentage = 0;
	selectedItems = [];
	selectedSubCategories = [];
	campaign;
	campaignTasks: CampaignTaskModel[];
	currentDate = new DateTime().toDate();
	isFinishEnabled = false;
	transformedKeywords = [];
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
							this.campaignName = this.campaign.campaignName;
							if (this.campaign) {
								this.createCampaignService.campaignType.next(this.campaign.type);
								this.setCampaignDetailsInfo();
								this.getCampaignTasks();
								this.createCampaignDetails();
								this.listKeywords = await this.createCampaignService.listKeywords();
								this.categories = _.uniq(this.listKeywords.map(keyword => keyword.category));
								this.setCategoryDetails();
							}
						} else {
							this.createCampaignDetails();
							this.listKeywords = await this.createCampaignService.listKeywords();
							this.categories = _.uniq(this.listKeywords.map(keyword => keyword.category));
						}
					})
				);
			})
		);

		this.brandService.init();

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

	setCampaignDetailsInfo() {
		const subCategories = [];
		if (this.campaign['keywordSubCategories']) {
			this.campaign['keywordSubCategories'].forEach(subCategory => {
				subCategories.push({name: subCategory, isSelected: true});
			});
		} else if (this.campaign['keywordSubCategory']) {
			subCategories.push({name: this.campaign['keywordSubCategory'], isSelected: true});
		}
		const subCategoryBrands = [this.campaign['keywordBrand']];
		const campaignInfo = {
			communityNameForReports: this.campaign['communityNameForReports'],
			brief: this.campaign['details'],
			objective: this.campaign['objective'],
			startDate: this.campaign['startDateAtUTC'],
			endDate: this.campaign['endDateAtUTC'],
			category: this.campaign['keywordCategory'],
			subCategory: this.campaign['keywordSubCategory'],
			brand: this.campaign['keywordBrand'],
			keywords: this.campaign['keywords'],
			subCategoryBrands: subCategoryBrands,
			subCategories: subCategories,
			taskTitle: this.campaign['taskTitle'],
			campaignPeriod: this.campaign['campaignPeriod'],
			defaultTaskDate: this.campaign['defaultTaskDate']
		};

		this.finalCampaignTaskDetails.campaignInfo = campaignInfo;
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
	}

	setCategoryDetails() {
		const subCategories = [];
		if (this.campaign['keywordSubCategories']) {
			this.campaign['keywordSubCategories'].forEach(subCategory => {
				subCategories.push({name: subCategory, isSelected: true});
			});
		} else if (this.campaign['keywordSubCategory']) {
			subCategories.push({name: this.campaign['keywordSubCategory'], isSelected: true});
		}
		this.getSubCategories(this.campaign['keywordCategory']);
		this.subCategories.forEach(subCategory => {
			subCategories.forEach(category => {
				if (subCategory.name === category.name) {
					subCategory.isSelected = true;
				}
			});
		});
		this.selectedSubCategories = this.subCategories
			.filter(category => category.isSelected === true)
			.map(category => category.name);
		this.selectedItems = subCategories;
		this.getBrands(subCategories, this.campaign['keywordCategory']);
		this.campaignDetailsForm.get('brand').setValue(this.campaign['keywordBrand']);
	}

	createCampaignDetails() {
		this.currentStep = 2;
		const campaignInfo = this.finalCampaignTaskDetails.campaignInfo;
		const date = campaignInfo['defaultTaskDate'] ? new DateTime(campaignInfo['defaultTaskDate']).toDate() : null;
		this.campaignDetailsForm = new FormGroup({
			communityNameForReports: new FormControl(campaignInfo['communityNameForReports']),
			brief: new FormControl(campaignInfo['brief'], [Validators.required]),
			objective: new FormControl(campaignInfo['objective'], [Validators.required]),
			startDate: new FormControl(campaignInfo['startDate'], [Validators.required]),
			endDate: new FormControl(campaignInfo['endDate'], [Validators.required]),
			category: new FormControl(campaignInfo['category'], [Validators.required]),
			brand: new FormControl(campaignInfo['brand']),
			taskTitle: new FormControl(campaignInfo['taskTitle']),
			campaignPeriod: new FormControl(campaignInfo['campaignPeriod']),
			defaultTaskDate: new FormControl(date)
		});
		this.subCategories = campaignInfo['subCategories'];
		this.subCategoryBrands = campaignInfo['subCategoryBrands'];
		const keywords = this.finalCampaignTaskDetails.campaignInfo['keywords'];
		this.selectedItems = this.subCategories ? this.subCategories.filter(category => category.isSelected === true) : [];
		if (this.subCategories) {
			this.selectedSubCategories = this.subCategories
				.filter(category => category.isSelected === true)
				.map(category => category.name);
			this.selectedItems = this.subCategories.filter(category => category.isSelected === true);
		} else {
			this.selectedSubCategories = [];
			this.selectedItems = [];
		}

		if (campaignInfo?.['timezoneName']) {
			this.timezoneName = campaignInfo['timezoneName'];
		}

		this.pushTimezoneNames(campaignInfo);

		this.keywordList = keywords ? keywords : [];
		this.transformedKeywords = [];
		this.keywordList.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.transformedKeywords.push(selectedKeyword[0].trim());
		});
		this.transformedKeywords = this.transformedKeywords.filter(el => !!el);
		this.subscriptionsToDestroy.push(
			this.campaignDetailsForm.get('startDate').valueChanges.subscribe(data => {
				this.setMinEndDate();
				this.validatePublishDatesOnTasks();
			})
		);

		this.subscriptionsToDestroy.push(
			this.campaignDetailsForm.get('endDate').valueChanges.subscribe(data => {
				this.validatePublishDatesOnTasks();
			})
		);
	}

	async showKeywordEditor() {
		this.keywordForEditor = this.keywordList.join('\n');
		const keywordLength = this.keywordList.length;
		this.lineNumbersForEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = false;
	}

	async keywordListEdited() {
		const keywordLength = this.keywordForEditor.split('\n').length + 1;
		this.lineNumbersForEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = true;
	}

	async saveKeywords() {
		this.keywordList = this.keywordForEditor.split('\n');
		this.keywordList = this.keywordList.filter(el => !!el);
		this.keywordList = this.keywordList.map(el => el.trim());
		this.transformedKeywords = [];
		this.keywordList.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.transformedKeywords.push(selectedKeyword[0].trim());
		});
		this.transformedKeywords = this.transformedKeywords.filter(el => !!el);
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

	setMinEndDate() {
		const startDate = this.campaignDetailsForm.get('startDate').value;
		const endDate = this.campaignDetailsForm.get('endDate').value;
		if (new DateTime(startDate).diff(new DateTime().dayJsObj, 'days') < 0) {
			this.minDate = new DateTime().toDate();
		} else {
			this.minDate = new DateTime(this.campaignDetailsForm.get('startDate').value).toDate();
			if (endDate && !(new DateTime(startDate).diff(new DateTime(endDate).dayJsObj, 'days') === 0)) {
				this.campaignDetailsForm.get('endDate').setValue('');
			}
		}
	}

	validatePublishTime(time) {
		const date = this.campaignDetailsForm.get('defaultTaskDate').value;
		const startDate = new DateTime(this.campaignDetailsForm.get('startDate').value);
		const endDate = new DateTime(this.campaignDetailsForm.get('endDate').value);
		this.isDateValid = true;
		if (date && time) {
			const dateTimeOfTask = new DateTime(new DateTime(date).format('MM/DD/YYYY') + ', ' + time, 'MM/DD/YYYY, hh:mm A');
			this.isDateValid =
				dateTimeOfTask.diff(startDate.dayJsObj, 'days') >= 0 &&
				endDate.diff(dateTimeOfTask.dayJsObj, 'days') >= 0 &&
				new DateTime() <= dateTimeOfTask;
		} else if (date) {
			const dateTimeOfTask = new DateTime(date);
			this.isDateValid =
				dateTimeOfTask.diff(startDate.dayJsObj, 'days') >= 0 && endDate.diff(dateTimeOfTask.dayJsObj, 'days') >= 0;
		}
	}

	validatePublishDatesOnTasks() {
		const startDate = new DateTime(this.campaignDetailsForm.get('startDate').value);
		const endDate = new DateTime(this.campaignDetailsForm.get('endDate').value);
		const defaultTaskDate = new DateTime(this.campaignDetailsForm.get('defaultTaskDate').value);
		const tasks = this.finalCampaignTaskDetails.campaignTasks ? this.finalCampaignTaskDetails.campaignTasks : [];

		tasks.forEach(task => {
			if (
				startDate &&
				new DateTime(task['DATE']).dayJsObj < new DateTime(startDate.dayJsObj).dayJsObj &&
				task['STATUS'] !== 'Completed' &&
				task['STATUS'] !== 'Failed' &&
				task['STATUS'] !== 'Missed'
			) {
				this.invalidTaskPublishDate = true;
			} else if (
				endDate &&
				new DateTime(task['DATE']).dayJsObj > new DateTime(endDate.dayJsObj).dayJsObj &&
				task['STATUS'] !== 'Completed' &&
				task['STATUS'] !== 'Failed' &&
				task['STATUS'] !== 'Missed'
			) {
				this.invalidTaskPublishDate = true;
			} else {
				this.invalidTaskPublishDate = false;
			}
		});
		if (startDate && defaultTaskDate.dayJsObj < new DateTime(startDate.dayJsObj).dayJsObj) {
			this.invalidDefaultPublishDate = true;
		} else if (endDate && new DateTime(defaultTaskDate.dayJsObj).dayJsObj > new DateTime(endDate.dayJsObj).dayJsObj) {
			this.invalidDefaultPublishDate = true;
		} else {
			this.invalidDefaultPublishDate = false;
		}
	}

	getSubCategories(category) {
		this.selectedItems = [];
		const subCategories = _.uniq(
			this.listKeywords.filter(keyword => keyword.category === category).map(keyword => keyword.subCategory)
		);

		this.subCategories = [];
		subCategories.forEach(subCategory => {
			this.subCategories.push({name: subCategory, isSelected: false});
		});
		this.selectedSubCategories = this.subCategories
			.filter(category => category.isSelected === true)
			.map(category => category.name);
		this.subCategoryBrands = [];
		this.campaignDetailsForm.get('brand').setValue('');
	}

	getBrands(subCategory, category) {
		if (subCategory.length === 0) {
			this.subCategoryBrands = [];
		} else {
			const categories = this.listKeywords.filter(keyword => keyword.category === category);
			let subCategories = [];
			subCategory.forEach(category => {
				if (subCategories.length > 0) {
					const brandSubCategories = categories
						.filter(keyword => keyword.subCategory === category.name)
						.map(keyword => keyword.uiFriendlyName);
					subCategories = subCategories.filter(subCat => brandSubCategories.indexOf(subCat.uiFriendlyName) > -1);
				} else {
					subCategories = categories.filter(keyword => keyword.subCategory === category.name);
				}
			});
			this.subCategoryBrands = _.uniq(subCategories.map(keyword => keyword.uiFriendlyName));
		}
		this.selectedSubCategories = this.subCategories
			.filter(category => category.isSelected === true)
			.map(category => category.name);
		this.campaignDetailsForm.get('brand').setValue('');
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

	async setDefaultDate(campaignInfo) {
		const defaultTaskDate = this.utilityService.setDefaultDate(
			this.timezoneName,
			campaignInfo['defaultTaskDate'],
			this.userTimezoneOffsetInMins
		);
		this.publishTime = defaultTaskDate.publishTime ? defaultTaskDate.publishTime : this.publishTime;
		this.campaignDetailsForm.get('defaultTaskDate').setValue(defaultTaskDate.date);
		if (this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']) {
			this.finalCampaignTaskDetails.campaignInfo['timezoneName'] = this.timezoneName;
		}
		this.validatePublishDatesOnTasks();
		this.validatePublishTime(this.publishTime);
	}

	async optionSelected(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		this.timezoneName = timezoneInfo.timezoneName;
		this.timezoneOffsetInMins = timezoneInfo.timezoneOffsetInMins;
	}

	closeTaskDetailsView(event) {
		this.validateCampaignDetails();
		if (this.campaignTaskViewDetails.length === 0) {
			this.campaignTaskViewDetails = null;
		}
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
		this.finalCampaignTaskDetails.campaignInfo = this.campaignDetailsForm.getRawValue();
		if (this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']) {
			this.finalCampaignTaskDetails.campaignInfo['timezoneName'] = this.timezoneName;
		}
		this.finalCampaignTaskDetails.campaignInfo['categories'] = this.categories;
		this.finalCampaignTaskDetails.campaignInfo['subCategories'] = this.subCategories;
		this.finalCampaignTaskDetails.campaignInfo['subCategoryBrands'] = this.subCategoryBrands;
		this.finalCampaignTaskDetails.campaignInfo['keywords'] = this.keywordList;
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
		campaignCreateInput['details'] = this.finalCampaignTaskDetails.campaignInfo['brief'];
		campaignCreateInput['startDateAtUTC'] = new DateTime(this.finalCampaignTaskDetails.campaignInfo['startDate'])
			.utc()
			.toISOString();
		campaignCreateInput['endDateAtUTC'] = new DateTime(this.finalCampaignTaskDetails.campaignInfo['endDate'])
			.utc()
			.toISOString();
		campaignCreateInput['proposalEmails'] = proposalEmails;
		campaignCreateInput['objective'] = this.finalCampaignTaskDetails.campaignInfo['objective'];
		campaignCreateInput['keywordCategory'] = this.finalCampaignTaskDetails.campaignInfo['category'];
		campaignCreateInput['keywordBrand'] = this.finalCampaignTaskDetails.campaignInfo['brand'];
		campaignCreateInput['keywords'] = this.finalCampaignTaskDetails.campaignInfo['keywords'];
		campaignCreateInput['cmcReportName'] = this.finalCampaignTaskDetails.campaignInfo['communityNameForReports'];
		campaignCreateInput['keywordSubCategories'] = this.finalCampaignTaskDetails.campaignInfo['subCategories']
			.filter(category => category.isSelected === true)
			.map(category => category.name);
		campaignCreateInput['taskTitle'] = this.finalCampaignTaskDetails.campaignInfo['taskTitle'];
		campaignCreateInput['campaignPeriod'] = this.finalCampaignTaskDetails.campaignInfo['campaignPeriod'];
		if (this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']) {
			const timezoneOffsetInMins = this.userTimezoneOffsetInMins - this.timezoneOffsetInMins;
			campaignCreateInput['defaultTaskDate'] = new DateTime(
				new DateTime(this.finalCampaignTaskDetails.campaignInfo['defaultTaskDate']).format('MM/DD/YYYY') +
					', ' +
					this.publishTime,
				'MM/DD/YYYY, hh:mm A'
			)
				.add(timezoneOffsetInMins, 'minutes')
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
			if (this.campaign) {
				this.router.navigateByUrl('/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns');
			} else {
				this.router.navigateByUrl('/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns');
			}
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
		this.router.navigateByUrl('/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns');
	}

	async gotoCampaignsPage() {
		this.router.navigateByUrl('/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns');
	}
}
