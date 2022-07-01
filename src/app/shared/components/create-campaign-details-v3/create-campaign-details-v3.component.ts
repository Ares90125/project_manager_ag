import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {CampaignModel, ICampaignModelProperty} from '@sharedModule/models/campaign.model';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignStatusEnum} from '@sharedModule/models/graph-ql.model';
import {FileService} from '@sharedModule/services/file.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import * as _ from 'lodash';
import {Subject} from 'rxjs';

import {BaseComponent} from '../base.component';

interface CampaignModelv3 extends CampaignModel {
	typeformId?: any;
	defaultTaskDate?: any;
}

@Component({
	selector: 'app-create-campaign-details-v3',
	templateUrl: './create-campaign-details-v3.component.html',
	styleUrls: ['./create-campaign-details-v3.component.scss']
})
export class CreateCampaignDetailsV3Component extends BaseComponent implements OnInit, OnDestroy {
	@ViewChild('quillFile') quillFileRef: ElementRef;
	@ViewChild('phaseIdeaFile') phaseIdeaQuillFileRef: ElementRef;
	quillFile: any;
	campaignBriefQuillRef: any;
	phaseIdeaQuillRef: any;
	openDateTimePicker = false;
	@Input() brandName;
	@Output() formValue = new EventEmitter<ICampaignModelProperty>();
	@Input() invalidTaskPublishDate = false;
	@Input() campaignCreatedOn = 'csadmin';
	@Input() resetForm: Subject<boolean> = new Subject<boolean>();
	@Input() groupsSelectedForCampaignCreation;
	@Input() resetCampaignDetails: Subject<boolean> = new Subject<boolean>();
	defaultTaskDate;
	@Output() isFormValid = new EventEmitter<boolean>();
	@Output() isListKeywordsLoaded = new EventEmitter<boolean>();
	showTimeZoneDropdown = true;
	isFormFirstTimeSubmitted = false;
	// postTypes = ['Text', 'Text + Image / Video', 'Image / Video', 'Live video', 'Multi Video', 'Video + Images'];
	postTypes = ['Basic', 'Live video', 'Multi Video', 'Video + Images'];
	currencyTypes: Array<ICampaignModelProperty['currency']> = ['INR', 'USD', 'SGD'];
	communicationChannels: Array<ICampaignModelProperty['communicationChannel']> = ['WhatsApp', 'Email'];
	campaignTaskDate = null;

	campaignDetailsForm: FormGroup;
	campaign: CampaignModelv3;
	campaignName;

	baseQuillConfig = {
		toolbar: {
			container: ['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]
		}
	};
	quillConfig = {
		toolbar: {
			...this.baseQuillConfig.toolbar,
			handlers: {
				image: image => {
					this.campaignBriefImageUpload(image);
				}
			}
		}
	};

	phaseIdeaQuillConfig = {
		toolbar: {
			...this.baseQuillConfig.toolbar,
			handlers: {
				image: image => {
					this.PhaseIdeaImageUpload(image);
				}
			}
		}
	};
	keywordsToTrack = [];
	keywordsToExclude = [];
	keywordIncludedForEditor;
	keywordExcludedForEditor;
	keywordIncludedList = [];
	keywordExcludedList = [];
	isKeywordListEdited = false;
	lineNumbersForIncludedEditor;
	lineNumbersForExcludedEditor;
	initialCategory;
	objectiveList = [
		'Increase Awareness',
		'Increase Consideration',
		'Induce Trials/Sampling',
		'User Research',
		'Drive Advocacy'
	];
	listKeywords = [];
	categories = [];
	subCategories = [];
	subCategoryBrands = [];
	selectedItems = [];
	selectedSubCategories = [];
	cmcTypeList = [
		{value: 'User Generated Content (UGC)', isSelected: false},
		{value: 'Lead Generation', isSelected: false},
		{value: 'Survey', isSelected: false},
		{value: 'Sampling', isSelected: false}
	];
	kpiList = [
		{value: 'CRM Leads', isSelected: false},
		{value: 'User Generated Content', isSelected: false},
		{value: 'Brand Mentions', isSelected: false},
		{value: 'Increase brand share of voice', isSelected: false},
		{value: 'Increase positive sentiment', isSelected: false},
		{value: 'Decrease negative sentiment', isSelected: false},
		{value: 'Increase category conversations', isSelected: false},
		{value: 'Hashtag Mentions', isSelected: false}
	];
	cmcType = [];
	kpi = [];
	minDate = new Date();
	minStartDate = new Date();
	isFormLoaded = false;
	publishTime = '12:30 AM';
	timeOptions = [];
	isDateValid = true;
	timezoneName = DateTime.guess();
	timeZonePlaceholder = 'TIME ZONE';
	timeZone = DateTime.guess();
	userTimezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timeZoneList;
	campaignBrief;
	isDefaultSelection = false;
	isCampaignBriefImageLoading = false;
	isPhaseIdeaImageLoading = false;
	currentPhaseOptions = [];

	constructor(
		injector: Injector,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private brandService: BrandService,
		private route: ActivatedRoute,
		private utilityService: UtilityService,
		private fileService: FileService
	) {
		super(injector);
	}

	@Input() set isFirstTimeSubmitted(value) {
		this.isFormFirstTimeSubmitted = value;
	}

	@Input() set campaignDetails(value) {
		this.campaign = value;
		if (this.campaignDetailsForm) {
			this.patchFormValue(this.campaign);
			this.campaignDetailsForm.get('cmcReportName').setValue(this.campaign.campaignName);
		}
	}

	async ngOnInit() {
		super._ngOnInit();
		window.scrollTo(0, 0);
		this.buildForm();
		this.subscriptionsToDestroy.push(
			this.resetCampaignDetails.subscribe(response => {
				if (response) {
					this.resetCampaignDetailsForm();
				}
			})
		);

		if (!_.isEmpty(this.campaign)) {
			this.patchFormValue(this.campaign);
		}
		let campaignName;
		if (this.campaign) {
			campaignName = this.campaign.campaignName;
		} else {
			campaignName = this.route.snapshot.queryParams['name'];
		}
		this.campaignDetailsForm.get('cmcReportName').setValue(campaignName);
		this.timeOptions = this.createCampaignService.getTimesOnWhichPostCanBePublished();
		this.listKeywords = await this.createCampaignService.listKeywords();
		this.categories = _.uniq(this.listKeywords.map(keyword => keyword.category));
		if (!_.isEmpty(this.groupsSelectedForCampaignCreation)) {
			this.getSubCategories(this.initialCategory);
		} else if (this.campaign) {
			this.getSubCategories(this.campaign?.keywordCategory);
		}

		if (this.campaign?.keywordBrand) {
			this.categories =
				this.campaign.status !== CampaignStatusEnum.Draft && this.campaign.status ? [] : this.categories;

			this.categories.push(this.campaign.keywordCategory);
			this.subCategoryBrands.push(this.campaign.keywordBrand);
			this.isDefaultSelection =
				!!this.campaign.keywordCategory && this.campaign.status !== CampaignStatusEnum.Draft && !!this.campaign.status;
		}
	}

	async resetCampaignDetailsForm() {
		this.showTimeZoneDropdown = false;
		this.patchFormValue(this.campaign);
		this.campaignDetailsForm.get('cmcReportName').setValue(this.campaign.campaignName);
		this.timezoneName = this.campaign.timezoneName;
		await this.pushTimezoneNames();
		this.showTimeZoneDropdown = true;
	}

	onCampaignBriefEditorCreation(editorInstance: any) {
		this.campaignBriefQuillRef = editorInstance;
	}

	onPhaseIdeaEditorCreation(editorInstance: any) {
		this.phaseIdeaQuillRef = editorInstance;
	}

	campaignBriefImageUpload(image: any) {
		this.quillFileRef.nativeElement.click();
	}

	PhaseIdeaImageUpload(image: any) {
		this.phaseIdeaQuillFileRef.nativeElement.click();
	}

	async onSelectingImageInCampaignBrief(ev: any) {
		this.isCampaignBriefImageLoading = true;
		const img = await this.processQuillImage((<HTMLInputElement>ev.target).files[0]);
		const range = this.campaignBriefQuillRef.getSelection();
		this.campaignBriefQuillRef.clipboard.dangerouslyPasteHTML(range.index, img);
		this.campaignDetailsForm.get('details').setValue(this.campaignBriefQuillRef.root.innerHTML);
		this.isCampaignBriefImageLoading = false;
	}

	async processQuillImage(file: File) {
		const processedFileURLs = file ? await Promise.all([this.processFilesForUrls(file)]) : null;
		const s3ImageUrl = processedFileURLs ? processedFileURLs[0][0] : this.campaign.s3CoverImageUrl;
		const image = await this.fileService.getImage(s3ImageUrl);
		return '<img class="img-within" src="' + image + '"></img>';
	}

	async onSelectingImageInPhaseIdea(ev: any) {
		this.isPhaseIdeaImageLoading = true;
		const img = await this.processQuillImage((<HTMLInputElement>ev.target).files[0]);
		const range = this.phaseIdeaQuillRef.getSelection();
		this.phaseIdeaQuillRef.clipboard.dangerouslyPasteHTML(range.index, img);
		this.campaignDetailsForm.get('phaseIdea').setValue(this.phaseIdeaQuillRef.root.innerHTML);
		this.isPhaseIdeaImageLoading = false;
	}

	onOffFocusTotalPhase(totalPhase: number) {
		this.currentPhaseOptions = this.createNewPhaseList(totalPhase);
	}

	buildForm() {
		this.campaignDetailsForm = this.formBuilder.group({
			cmcReportName: ['', Validators.required],
			details: ['', Validators.required],
			typeformId: [''],
			startDate: ['', Validators.required],
			endDate: ['', Validators.required],
			primaryObjective: ['', Validators.required],
			secondaryObjective: [''],
			keywordCategory: ['', Validators.required],
			keywordBrand: ['', Validators.required],
			keywordSubCategories: [''],
			taskTitle: [''],
			campaignPeriod: [''],
			phaseIdea: ['', Validators.required],
			totalPhase: [
				null,
				{
					validators: [Validators.pattern(/^\d*[1-9]+\d*$/), Validators.max(100)]
				}
			],
			currentPhase: [{value: null, disabled: true}],
			defaultPostContentType: ['Basic'],
			communicationChannel: [''],
			currency: ['']
		});
		this.isFormLoaded = true;
		this.campaignDetailsForm.controls.totalPhase.valueChanges.subscribe(newValue => {
			if (!newValue?.trim()) {
				this.campaignDetailsForm.controls.currentPhase.disable();
				return this.campaignDetailsForm.controls.currentPhase.reset();
			}

			if (+newValue < +(this.campaignDetailsForm.controls.currentPhase?.value || 0)) {
				this.campaignDetailsForm.controls.currentPhase.reset();
			}
			if (this.campaignDetailsForm.controls.totalPhase.invalid) {
				return;
			}
			this.currentPhaseOptions = this.createNewPhaseList(+newValue);
			this.campaignDetailsForm.controls.currentPhase.enable();
		});
		this.createCampaignService.name.subscribe(name => {
			if (name) {
				this.campaignDetailsForm.get('cmcReportName').setValue(name);
			}
		});
		if (this.campaign?.['timezoneName']) {
			this.timezoneName = this.campaign['timezoneName'];
		}
		this.pushTimezoneNames();
		this.onFormValueChanges();
	}

	patchFormValue(campaign: CampaignModelv3) {
		this.campaignDetailsForm.patchValue({
			cmcReportName: campaign.cmcReportName,
			details: campaign.details,
			typeformId: campaign.typeformId,
			startDate: campaign.startDateAtUTC,
			endDate: campaign.endDateAtUTC,
			primaryObjective: campaign.primaryObjective,
			secondaryObjective: campaign.secondaryObjective,
			keywordCategory: campaign.keywordCategory,
			keywordBrand: campaign.keywordBrand,
			keywordSubCategories: campaign.keywordSubCategories,
			taskTitle: campaign['taskTitle'],
			campaignPeriod: campaign['campaignPeriod'],
			phaseIdea: campaign.phaseIdea,
			totalPhase: campaign.totalPhase,
			currentPhase: campaign.currentPhase,
			currency: campaign.currency,
			communicationChannel: campaign.communicationChannel,
			defaultPostContentType: this.linkSelectedPostType(
				campaign['defaultPostContentType'] ? campaign['defaultPostContentType'] : 'Basic'
			)
		});

		if (campaign['publishTime']) {
			this.publishTime = campaign['publishTime'];
		} else {
			this.publishTime = campaign['defaultTaskDate']
				? new DateTime(campaign['defaultTaskDate']).format('hh:mm a').toString().toUpperCase()
				: this.publishTime;
		}
		this.modifyCmcTypeList(campaign.cmcType);
		this.modifyKpiList(campaign.KPIs);
		this.setKeywordsIncludedData(campaign.keywords);
		this.setKeywordsExcludedData(campaign.keywordsExcluded);

		if (this.campaignDetailsForm?.valid && campaign.KPIs && campaign.cmcType) {
			this.isFormValid.emit(true);
		} else {
			this.isFormValid.emit(false);
		}

		this.setDefaultDate(campaign);
	}

	setKeywordsIncludedData(keywords) {
		this.keywordIncludedList = keywords ? keywords : [];
		this.keywordsToTrack = [];
		this.keywordIncludedList.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.keywordsToTrack.push(selectedKeyword[0].trim());
		});
		this.keywordsToTrack = this.keywordsToTrack.filter(el => !!el);
	}

	setKeywordsExcludedData(keywords) {
		this.keywordExcludedList = keywords ? keywords : [];
		this.keywordsToExclude = [];
		this.keywordExcludedList.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.keywordsToExclude.push(selectedKeyword[0].trim());
		});
		this.keywordsToExclude = this.keywordsToExclude.filter(el => !!el);
	}

	onFormValueChanges() {
		this.subscriptionsToDestroy.push(
			this.campaignDetailsForm.valueChanges.subscribe(val => {
				this.submitDataToParent();
			})
		);

		this.subscriptionsToDestroy.push(
			this.campaignDetailsForm.get('startDate').valueChanges.subscribe(data => {
				this.setMinEndDate();
			})
		);
	}

	submitDataToParent() {
		const subCategories = this.subCategories
			.filter(category => category['isSelected'] === true)
			.map(category => category.name);
		if (
			!this.campaignDetailsForm.valid ||
			this.kpi.length === 0 ||
			this.cmcType.length === 0 ||
			subCategories.length === 0
		) {
			this.isFormValid.emit(false);
			return;
		}

		const campaignDetails: ICampaignModelProperty = this.campaignDetailsForm.getRawValue();
		campaignDetails['KPIs'] = JSON.stringify(this.kpi);
		campaignDetails['cmcType'] = JSON.stringify(this.cmcType);
		campaignDetails['keywords'] = this.keywordIncludedList ? this.keywordIncludedList : [];
		campaignDetails['keywordsExcluded'] = this.keywordExcludedList ? this.keywordExcludedList : [];
		campaignDetails['keywordSubCategories'] = subCategories;
		campaignDetails['publishTime'] = this.publishTime;
		campaignDetails['endDateAtUTC'] = campaignDetails.endDate;
		campaignDetails['startDateAtUTC'] = campaignDetails.startDate;
		campaignDetails['campaignName'] = this.campaignName;
		campaignDetails['timezoneOffMins'] = this.userTimezoneOffsetInMins - this.timezoneOffsetInMins;
		campaignDetails['timezoneName'] = this.timezoneName;
		campaignDetails['defaultTaskDate'] = this.defaultTaskDate;
		campaignDetails['defaultPostContentType'] = this.linkPostType(campaignDetails.defaultPostContentType);
		this.formValue.emit(campaignDetails);
		this.isFormValid.emit(true);
	}

	linkPostType(postType) {
		switch (postType) {
			case 'Text':
				return 'Text';
			case 'Image / Video':
				return 'ImageOrVideo';
			case 'Text + Image / Video':
				return 'TextImageOrVideo';
			case 'Basic':
				return 'Basic';
			case 'Live video':
				return 'LiveVideo';
			case 'Multi Video':
				return 'MultiVideo';
			case 'Video + Images':
				return 'VideoImage';
		}
	}

	linkSelectedPostType(postType) {
		switch (postType) {
			case 'Text':
				return 'Text';
			case 'ImageOrVideo':
				return 'Image / Video';
			case 'Basic':
				return 'Basic';
			case 'LiveVideo':
				return 'Live video';
			case 'MultiVideo':
				return 'Multi Video';
			case 'VideoImage':
				return 'Video + Images';
		}
	}

	async showKeywordIncludedEditor() {
		this.keywordIncludedForEditor = this.keywordIncludedList.join('\n');
		const keywordLength = this.keywordIncludedList.length;
		this.lineNumbersForIncludedEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = false;
	}

	async showKeywordExcludedEditor() {
		this.keywordExcludedForEditor = this.keywordExcludedList.join('\n');
		const keywordLength = this.keywordExcludedList.length;
		this.lineNumbersForExcludedEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = false;
	}

	async keywordIncludedListEdited() {
		const keywordLength = this.keywordIncludedForEditor.split('\n').length + 1;
		this.lineNumbersForIncludedEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = true;
	}

	async keywordExcludedListEdited() {
		const keywordLength = this.keywordExcludedForEditor.split('\n').length + 1;
		this.lineNumbersForExcludedEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = true;
	}

	async saveKeywordsIncluded() {
		this.keywordIncludedList = this.keywordIncludedForEditor.split('\n');
		this.keywordIncludedList = this.keywordIncludedList.filter(el => !!el);
		this.keywordIncludedList = this.keywordIncludedList.map(el => el.trim());
		this.keywordsToTrack = [];
		this.keywordIncludedList.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.keywordsToTrack.push(selectedKeyword[0].trim());
		});
		this.keywordsToTrack = this.keywordsToTrack.filter(el => !!el);
		this.submitDataToParent();
	}

	async saveKeywordsExcluded() {
		this.keywordExcludedList = this.keywordExcludedForEditor.split('\n');
		this.keywordExcludedList = this.keywordExcludedList.filter(el => !!el);
		this.keywordExcludedList = this.keywordExcludedList.map(el => el.trim());
		this.keywordsToExclude = [];
		this.keywordExcludedList.forEach(keyword => {
			const selectedKeyword = keyword.split('_');
			this.keywordsToExclude.push(selectedKeyword[0].trim());
		});
		this.keywordsToExclude = this.keywordsToExclude.filter(el => !!el);
		this.submitDataToParent();
	}

	getSubCategories(category) {
		if (this.isDefaultSelection) {
			return;
		}
		this.selectedItems = [];
		const subCategories = _.uniq(
			this.listKeywords.filter(keyword => keyword.category === category).map(keyword => keyword.subCategory)
		);
		this.subCategories = [];
		subCategories.forEach(subCategory => {
			this.subCategories.push({name: subCategory, isSelected: false});
		});
		const keywordSubCategories = this.campaign?.keywordSubCategories;
		if (keywordSubCategories?.length > 0) {
			keywordSubCategories.forEach(subCategory => {
				const subCatIndex = this.subCategories.findIndex(cat => cat.name === subCategory);
				if (subCatIndex > -1) {
					this.subCategories[subCatIndex]['isSelected'] = true;
				}
			});
		}
		this.selectedItems = this.subCategories.filter(category => category['isSelected'] === true);
		this.subCategoryBrands = [];
		if (category) {
			this.submitDataToParent();
		}

		this.isListKeywordsLoaded.emit(true);
	}

	getBrands(subCategory, category, resetOtherSelection = false) {
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
		this.selectedItems = this.subCategories.filter(category => category['isSelected'] === true);
		this.campaignDetailsForm.get('keywordBrand').setValue('');
		this.submitDataToParent();
	}

	setCategoryDetails() {
		this.getSubCategories(this.campaign['keywordCategory']);
		if (this.campaign['keywordSubCategories']) {
			this.getBrands(this.campaign['keywordSubCategories'][0], this.campaign['keywordCategory']);
		}
	}

	selectCmcType(isChecked, index) {
		this.cmcType = [];
		this.cmcTypeList[index].isSelected = isChecked;
		this.cmcTypeList.map(cmcType => {
			if (cmcType.isSelected) {
				this.cmcType.push(cmcType.value);
			}
		});
		this.submitDataToParent();
	}

	selectKPI(isChecked, index) {
		this.kpi = [];
		this.kpiList[index].isSelected = isChecked;
		this.kpiList.map(kpi => {
			if (kpi.isSelected) {
				this.kpi.push(kpi.value);
			}
		});
		this.submitDataToParent();
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

	modifyCmcTypeList(cmcType) {
		try {
			this.cmcTypeList.map(kpi => {
				kpi.isSelected = false;
			});
			this.cmcType = [];
			const cmcTypeList = JSON.parse(cmcType);
			this.cmcTypeList.map(cmcType => {
				if (cmcTypeList.includes(cmcType.value)) {
					this.cmcType.push(cmcType.value);
					cmcType.isSelected = true;
				}
				return cmcType;
			});
		} catch (e) {}
	}

	modifyKpiList(kpi) {
		try {
			this.kpiList.map(kpi => {
				kpi.isSelected = false;
			});
			this.kpi = [];
			const kpiList = JSON.parse(kpi);
			this.kpiList.map(kpi => {
				if (kpiList.includes(kpi.value)) {
					this.kpi.push(kpi.value);
					kpi.isSelected = true;
				}
				return kpi;
			});
		} catch (e) {}
	}

	validatePublishTime(time) {
		const date = this.campaignDetailsForm.get('defaultTaskDate')?.value;
		const startDate = new DateTime(this.campaignDetailsForm.get('startDate').value);
		const endDate = new DateTime(this.campaignDetailsForm.get('endDate').value);
		this.isDateValid = true;
		const dateTimeOfTask =
			date && time
				? new DateTime(new DateTime(date).format('MM/DD/YYYY') + ', ' + time, 'MM/DD/YYYY, hh:mm A')
				: new DateTime(date);
		this.isDateValid =
			dateTimeOfTask.diff(startDate.dayJsObj, 'days') >= 0 && endDate.diff(dateTimeOfTask.dayJsObj, 'days') >= 0;
		this.submitDataToParent();
	}

	async pushTimezoneNames() {
		const momentScriptLoad = await this.utilityService.insertMomentTimeZoneScript();
		if (!momentScriptLoad) {
			return;
		}

		this.timeZoneList = this.utilityService.pushTimezoneNames();
		const timeZone = this.timeZoneList.find(zone => zone.indexOf(this.timezoneName) > -1);
		this.timeZone = timeZone ? timeZone : this.timeZone;
		this.optionSelected(timeZone);
	}

	async optionSelected(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		this.timezoneName = timezoneInfo.timezoneName;
		this.timezoneOffsetInMins = timezoneInfo.timezoneOffsetInMins;
		this.submitDataToParent();
	}

	async setDefaultDate(campaignInfo) {
		if (!this.campaign.defaultTaskDate) {
			return;
		}
		const defaultTaskDate = this.utilityService.setDefaultDate(
			this.timezoneName,
			campaignInfo['defaultTaskDate'],
			this.userTimezoneOffsetInMins
		);

		this.publishTime = defaultTaskDate.publishTime ? defaultTaskDate.publishTime : this.publishTime;
		this.campaignTaskDate = new DateTime(
			new DateTime(defaultTaskDate.date).format('MMMM D YYYY') + ', ' + this.publishTime
		);
		this.defaultTaskDate = this.campaignTaskDate;

		this.validatePublishTime(this.publishTime);
	}

	resetKpiList() {
		this.kpiList.map(kpi => {
			kpi.isSelected = false;
			return kpi;
		});
	}

	differenceInDates(date1, date2) {
		return new DateTime(date1).diff(date2, 'days');
	}

	updateDateTime(selectedDateTime) {
		this.defaultTaskDate = selectedDateTime;
		this.submitDataToParent();
		this.openDateTimePicker = false;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}

	private createNewPhaseList(totalPhase: number) {
		const list = [];
		for (let i = 1; i <= totalPhase; i++) {
			list.push(i);
		}
		return list;
	}
}
