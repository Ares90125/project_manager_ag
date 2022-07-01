import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {DateTime} from '@sharedModule/models/date-time';
import {UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {UtilityService} from '@sharedModule/services/utility.service';

@Component({
	selector: 'app-community-marketing-campaign-info-old',
	templateUrl: './community-marketing-campaign-info-old.component.html',
	styleUrls: ['./community-marketing-campaign-info-old.component.scss']
})
export class CommunityMarketingCampaignInfoOldComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() isReportEdit = false;

	@Input() set campaignTasks(value) {
		this.tasks = value ? value : [];
	}

	@Output() closeCampaignDetail = new EventEmitter();

	campaignDetailsForm: FormGroup;
	keywordForEditor;
	keywordList = [];
	isKeywordListEdited = false;
	lineNumbersForEditor;
	minDate = new DateTime().toDate();
	submittingCampaignDetails = false;
	keywordCategories = [];
	keywordBrand = [];
	keywordSubCategories = [];
	transformedKeywords = [];
	isDateValid = true;
	timeOptions = [];
	publishTime = '12:30 AM';
	tasks = [];
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
		private readonly createCampaignService: CreateCampaignService,
		private readonly utilityService: UtilityService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.createCampaignDetails(this.campaign);
		this.timeOptions = this.createCampaignService.getTimesOnWhichPostCanBePublished();
	}

	createCampaignDetails(campaignInfo) {
		this.keywordCategories = [];
		this.keywordSubCategories = [];
		this.keywordBrand = [];
		const date = campaignInfo['defaultTaskDate']
			? new DateTime(new DateTime(this.campaign['defaultTaskDate']).format('MMMM D YYYY')).toDate()
			: null;
		this.campaignDetailsForm = new FormGroup({
			communityNameForReports: new FormControl(campaignInfo['cmcReportName']),
			brief: new FormControl(campaignInfo['details'], [Validators.required]),
			objective: new FormControl(campaignInfo['objective']),
			startDate: new FormControl(campaignInfo['startDateAtUTC'], [Validators.required]),
			endDate: new FormControl(campaignInfo['endDateAtUTC'], [Validators.required]),
			keywordCategory: new FormControl(campaignInfo['keywordCategory']),
			keywordSubCategory: new FormControl(campaignInfo['keywordSubCategory']),
			keywordBrand: new FormControl(campaignInfo['keywordBrand']),
			taskTitle: new FormControl(campaignInfo['taskTitle']),
			campaignPeriod: new FormControl(campaignInfo['campaignPeriod']),
			defaultTaskDate: new FormControl(date)
		});
		this.keywordCategories.push(campaignInfo['keywordCategory']);
		if (campaignInfo['keywordSubCategories']) {
			campaignInfo['keywordSubCategories'].forEach(subCategory => {
				this.keywordSubCategories.push({name: subCategory, isSelected: true});
			});
		} else if (campaignInfo['keywordSubCategory']) {
			this.keywordSubCategories.push({name: campaignInfo['keywordSubCategory'], isSelected: true});
		}

		if (campaignInfo['timezoneName']) {
			this.timezoneName = campaignInfo['timezoneName'];
		}

		this.pushTimezoneNames(campaignInfo);

		this.keywordBrand.push(campaignInfo['keywordBrand']);
		const keywords = campaignInfo['keywords'];
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
		if (!date) {
			return;
		}
		const dateTimeOfTask =
			date && time
				? new DateTime(new DateTime(date).format('MM/DD/YYYY') + ', ' + time, 'MM/DD/YYYY, hh:mm A')
				: new DateTime(date);
		this.isDateValid =
			dateTimeOfTask.diff(startDate.dayJsObj, 'days') >= 0 && endDate.diff(dateTimeOfTask.dayJsObj, 'days') >= 0;
	}

	validatePublishDatesOnTasks() {
		const startDate = new DateTime(this.campaignDetailsForm.get('startDate').value);
		const endDate = new DateTime(this.campaignDetailsForm.get('endDate').value);
		const defaultTaskDate = new DateTime(this.campaignDetailsForm.get('defaultTaskDate').value);

		this.tasks.forEach(task => {
			if (
				startDate &&
				new DateTime(task.toBePerformedByUTC) < new DateTime(startDate.dayJsObj) &&
				task['status'] !== 'Completed' &&
				task['status'] !== 'Failed' &&
				task['status'] !== 'Missed'
			) {
				this.invalidTaskPublishDate = true;
			} else if (
				endDate &&
				new DateTime(task.toBePerformedByUTC) > new DateTime(endDate.dayJsObj) &&
				task['status'] !== 'Completed' &&
				task['status'] !== 'Failed' &&
				task['status'] !== 'Missed'
			) {
				this.invalidTaskPublishDate = true;
			} else {
				this.invalidTaskPublishDate = false;
			}
		});
		if (startDate && defaultTaskDate < new DateTime(startDate.dayJsObj)) {
			this.invalidDefaultPublishDate = true;
		} else if (endDate && new DateTime(defaultTaskDate.dayJsObj) > new DateTime(endDate.dayJsObj)) {
			this.invalidDefaultPublishDate = true;
		} else {
			this.invalidDefaultPublishDate = false;
		}
	}

	differenceInDates(date1, date2) {
		return new DateTime(date1).diff(date2, 'days');
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
		this.setDefaultDate(campaignInfo);
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
		this.campaignDetailsForm.get('defaultTaskDate').setValue(defaultTaskDate.date);
		this.validatePublishDatesOnTasks();
		this.validatePublishTime(this.publishTime);
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

	async sendCampaignDetails() {
		this.submittingCampaignDetails = true;
		const campaignCreateInput = {};
		campaignCreateInput['brandId'] = this.campaign['brandId'];
		campaignCreateInput['brandName'] = this.campaign['brandName'];
		campaignCreateInput['campaignId'] = this.campaign['campaignId'];
		campaignCreateInput['campaignName'] = this.campaign['campaignName'];
		campaignCreateInput['details'] = this.campaignDetailsForm.get('brief').value;
		campaignCreateInput['startDateAtUTC'] = new DateTime(this.campaignDetailsForm.get('startDate').value)
			.utc()
			.toISOString();
		campaignCreateInput['endDateAtUTC'] = new DateTime(this.campaignDetailsForm.get('endDate').value)
			.endOf('day')
			.utc()
			.toISOString();
		campaignCreateInput['objective'] = this.campaignDetailsForm.get('objective').value;
		campaignCreateInput['keywordCategory'] = this.campaignDetailsForm.get('keywordCategory').value;
		campaignCreateInput['keywordBrand'] = this.campaignDetailsForm.get('keywordBrand').value;
		campaignCreateInput['keywords'] = this.keywordList;
		campaignCreateInput['campaignSummary'] = this.campaign['campaignSummary'];
		campaignCreateInput['proposalEmails'] = this.campaign['proposalEmails'];
		campaignCreateInput['cmcReportName'] = this.campaignDetailsForm.get('communityNameForReports').value;
		campaignCreateInput['taskTitle'] = this.campaignDetailsForm.get('taskTitle').value;
		campaignCreateInput['campaignPeriod'] = this.campaignDetailsForm.get('campaignPeriod').value;
		if (this.campaignDetailsForm.get('defaultTaskDate').value) {
			const timezoneOffsetInMins = this.userTimezoneOffsetInMins - this.timezoneOffsetInMins;
			campaignCreateInput['defaultTaskDate'] = new DateTime(
				new DateTime(this.campaignDetailsForm.get('defaultTaskDate').value).format('MM/DD/YYYY') +
					', ' +
					this.publishTime,
				'MM/DD/YYYY, hh:mm A'
			)
				.add(timezoneOffsetInMins, 'minutes')
				.utc()
				.toISOString();
			campaignCreateInput['timezoneName'] = this.timezoneName;
		}
		let campaignDetails;
		try {
			campaignDetails = await this.createCampaignService.updateCampaignDetails(
				campaignCreateInput as UpdateCampaignInput
			);
			this.campaign = campaignDetails;
			this.alert.success('Check campaign list for selected brand', 'Campaign details updated successfully', 5000, true);
			this.submittingCampaignDetails = false;
			this.closeCampaignDetail.emit(campaignDetails);
			if (this.isReportEdit) {
				document.getElementById('cancel').click();
			}
		} catch (e) {
			this.alert.error(
				'Campaign updation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
			this.submittingCampaignDetails = false;
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
