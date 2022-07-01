import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {LeadSourceEnum} from '@sharedModule/enums/lead-source.enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {UserService} from '@sharedModule/services/user.service';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-bio-contact-me',
	templateUrl: './bio-contact-me.component.html',
	styleUrls: ['./bio-contact-me.component.scss']
})
export class BioContactMeComponent extends BaseComponent implements OnInit, OnDestroy {
	contactMeForm: FormGroup;
	@Input() kudosData;
	@Input() isFromAudienceInsights = false;
	@Output() closeContactForm = new EventEmitter<boolean>();
	secondStep = false;
	contactObj: any;
	keyAchievements = [
		'Driving Category Awareness',
		'Create a Community of Brand Users',
		'Increasing Brand Consideration',
		'Understand what Customers say about Brand',
		'Influencing Purchase Intent',
		'Drive Brand Advocacy',
		'All of the above',
		'Other'
	];
	keyAchievementList = [];
	isOtherInputFieldEnabled = false;
	isOtherKeyEnabled = true;
	otherFieldValue = '';
	connectionWithAdminsInterest = false;
	isEmailDetailsFetching = false;
	isAlreadyContacted = false;

	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly adminBioService: AdminBioService,
		private readonly userService: UserService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.buildForm();
	}

	buildForm() {
		const emailValidationFeilds = this.isFromAudienceInsights
			? [Validators.email]
			: [Validators.required, Validators.email];
		this.contactMeForm = this.formBuilder.group({
			fullName: ['', [Validators.required]],
			companyName: ['', this.isFromAudienceInsights ? [Validators.required] : []],
			emailAddress: ['', emailValidationFeilds],
			phoneNumber: ['', this.isFromAudienceInsights ? [Validators.required] : []],
			message: [''],
			otherFieldValue: [''],
			connectionWithAdminsInterest: [false]
		});
		this.contactMeForm?.controls['emailAddress']?.valueChanges
			.pipe(takeUntil(this.destroy$), debounceTime(1000))
			.subscribe(data => {
				if (!this.contactMeForm?.controls['emailAddress'].errors) {
					this.onFetchingEmailDetails();
				}
			});
	}

	closeContactPopup() {
		this.closeContactForm.next(false);
	}

	submitForm(form) {
		if (form.invalid) {
			return;
		}
		this.contactObj = form.getRawValue();
		if (!this.isFromAudienceInsights) {
			this.secondStep = true;
		}
	}

	onOtherFieldUpdate() {
		if (!this.contactMeForm.get('otherFieldValue').value) {
			this.isOtherInputFieldEnabled = false;
			this.processKeyAchievements('Other');
			return;
		}
		this.isOtherInputFieldEnabled = false;
	}

	async onFetchingEmailDetails() {
		this.isEmailDetailsFetching = true;
		this.isAlreadyContacted = false;
		const user = await this.userService.getUser();
		try {
			const response = await this.adminBioService.checkEmailAlreadyExistedOnProfile(
				user?.id ? user.id : this.isFromAudienceInsights ? this.kudosData.createdByUserId : this.kudosData?.adminId,
				this.contactMeForm.get('emailAddress').value
			);
			this.isAlreadyContacted = !response?.availability;
			this.isEmailDetailsFetching = false;
		} catch (e) {
			this.isEmailDetailsFetching = false;
		}
	}

	processKeyAchievements(type) {
		if (type === 'Other' && this.isOtherInputFieldEnabled) {
			return;
		}
		if (this.keyAchievementList.includes(type)) {
			if (type === 'All of the above') {
				this.keyAchievementList = this.keyAchievementList.includes('Other') ? ['Other'] : [];
				return;
			} else if (this.keyAchievementList.includes('All of the above') && type !== 'Other') {
				this.keyAchievementList.splice(this.keyAchievementList.indexOf('All of the above'), 1);
			}
			if (type === 'Other') {
				this.isOtherInputFieldEnabled = false;
				this.isOtherKeyEnabled = true;
			}
			this.keyAchievementList.splice(this.keyAchievementList.indexOf(type), 1);
			return;
		}
		if (type === 'All of the above') {
			const others = this.keyAchievementList.includes('Other');
			this.keyAchievementList = JSON.parse(JSON.stringify(this.keyAchievements));
			if (!others) {
				this.keyAchievementList.splice(this.keyAchievementList.indexOf('Other'), 1);
			}
		} else {
			if (type === 'Other') {
				this.isOtherInputFieldEnabled = true;
				this.isOtherKeyEnabled = false;
				setTimeout(() => {
					document.getElementById('other-input')?.focus();
				}, 200);
			}
			this.keyAchievementList.push(type);
		}
	}

	async onSubmissionOfContactInfo() {
		const user = await this.userService.getUser();
		const contactInfo = this.contactMeForm.getRawValue();
		contactInfo['userId'] = this.isFromAudienceInsights
			? this.kudosData.createdByUserId
			: this.kudosData?.adminId
			? this.kudosData.adminId
			: user?.id;
		contactInfo['connectionWithAdminsInterest'] = this.contactMeForm.get('connectionWithAdminsInterest').value;
		const targets = JSON.parse(JSON.stringify(this.keyAchievementList));
		if (this.keyAchievementList.includes('All of the above')) {
			targets.splice(targets.indexOf('All of the above'), 1);
		}
		if (this.keyAchievementList.includes('Other')) {
			targets.splice(targets.indexOf('Other'), 1);
			targets.push(this.contactMeForm.get('otherFieldValue').value);
		}
		if (contactInfo['phoneNumber']) {
			contactInfo['phoneNumber'] = contactInfo['phoneNumber'].toString();
		}
		contactInfo['targets'] = targets;
		if (this.isFromAudienceInsights) {
			contactInfo['leadSource'] = LeadSourceEnum.GroupProfileAudicienceInsight;
		} else {
			contactInfo['leadSource'] = LeadSourceEnum.AdminBioGeneral;
		}
		try {
			if (this.isFromAudienceInsights) {
				await this.adminBioService.updateProfileBioContactMe(contactInfo);
			} else {
				await this.adminBioService.updateProfileBioContactMe(contactInfo);
			}
			this.closeContactForm.next(true);
		} catch (e) {
			this.alert.error('Contact update unsuccessful', 'Contact info save changes unsuccess', 5000, true);
		}
		this.disableScrolling();
	}

	recordContactEvent(event) {
		const contactData = this.contactMeForm.getRawValue();
		let eventValue = {};
		for (let keys in contactData) {
			if (contactData[keys]) {
				eventValue[`contact_field_${keys}`] = true;
			} else {
				eventValue[`contact_field_${keys}`] = false;
			}
		}
		if (this.keyAchievementList.length !== 0) {
			eventValue['contact_field_otherFieldValue'] = true;
		}
		this.recordButtonClick(event, null, null, {contact_form_field_status: eventValue});
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
