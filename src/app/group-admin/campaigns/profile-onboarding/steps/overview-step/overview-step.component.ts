import {AfterViewInit, Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {GeographyService} from '@groupAdminModule/_services/geography.service';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {UserService} from '@sharedModule/services/user.service';
import _ from 'lodash';
import {takeUntil} from 'rxjs/operators';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-overview-step',
	templateUrl: './overview-step.component.html',
	styleUrls: ['./overview-step.component.scss']
})
export class OverviewStepComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
	group: GroupModel;
	currentCategory: string | null = null;
	businessCategory = [
		'Entertainment',
		'Cooking & Recipes',
		'Fitness & Health',
		'Food & Drink',
		'Hobbies & Interests',
		'Jobs & Careers',
		'Learning & Education',
		'Lifestyle, Beauty & Makeup',
		'Medical & Mental Health',
		'Neighbourhood & Local groups',
		'Parenting',
		'Travel',
		'Politics',
		'Sports & Gaming',
		'Buy & Sell',
		'Faith & Spirituality',
		'Business-Brand',
		'Arts',
		'Animals',
		'Relationships & Identity',
		'Vehicles & Commutes',
		'Humour',
		'Others'
	];
	@Input() resetHook: EventEmitter<boolean>;
	@Input() isPitch: boolean = false;
	@Input() isSaveInProgress: boolean = false;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Output() saveOverviewSection = new EventEmitter();

	@Output() nextStep = new EventEmitter();
	@Output() prevStep = new EventEmitter();

	quillConfig = {
		toolbar: [['bold', 'italic', 'link', {list: 'ordered'}, {list: 'bullet'}]]
	};
	profileDescription: string = null;
	meQuillRef: any;
	stageFetching: boolean = true;
	countryList = [];
	selectedCountry;
	extraRecordEventData = {};
	isLocationInvalid: boolean = false;
	isCategoryInvalid: boolean = false;
	isQuillInvalid: boolean = false;
	showFullDescription: boolean = false;
	welcomeTitle: string = 'Edit sections of the page to stand out';
	welcomeContent: string =
		'You are able to configure each section of this page using this button. Groups who configure their page earn more.';
	viewToolTip: boolean = false;
	hideSeeMoreBtn: boolean = false;
	initialProfileDescription: string = null;
	initialSelectedCountry: string = null;

	constructor(
		injector: Injector,
		private userService: UserService,
		public readonly groupProfilePageService: GroupProfilePagesService,
		private geographyService: GeographyService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();

		const {stage} = await this.groupProfilePageService.updateGroupProfileDraft({
			id: this.groupProfilePage.id,
			groupId: this.groupProfilePage.groupId,
			stage: OnboardingStageEnum.OVERVIEW
		});
		this.groupProfilePage.stage = stage;
		this.stageFetching = false;

		this.getCountryList();
		this.reset();
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.checkDescriptionHeight();
			this.isSaveInProgress = false;
		});
		this.groupProfilePageService.profilePageOnboardingTracker
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => (this.viewToolTip = value === 1));
	}

	nextStepHandler() {
		this.checkValidations();
		this.isLocationInvalid = !this.selectedCountry;
		this.isCategoryInvalid = !this.currentCategory || !this.groupProfilePage?.category;
		if (this.isQuillInvalid || this.isCategoryInvalid || this.isLocationInvalid) {
			return;
		}
		this.nextStep.next(true);
	}

	prevStepHandler() {
		this.prevStep.next(true);
	}

	reset() {
		this.isQuillInvalid = false;
		this.groupProfilePage.description = this.groupProfilePage.description
			? this.groupProfilePage.description.replaceAll('\n', '<br>')
			: '';
		this.profileDescription = _.cloneDeep(this.groupProfilePage.description);
		this.selectedCountry = _.cloneDeep(this.groupProfilePage.country);
		this.currentCategory = this.groupProfilePage.category;
		this.initialProfileDescription = this.profileDescription;
		this.initialSelectedCountry = this.selectedCountry;
	}

	getCountryName(code) {
		let countryName = this.geographyService.getCountryNameFromCountryCode(code);
		return countryName.split('(')[0];
	}

	async getCountryList() {
		this.countryList = await this.userService.getCountries();
	}

	selectedLocation(country, element) {
		this.isLocationInvalid = false;
		this.selectedCountry = this.selectedCountry === country.isoCode ? '' : country.isoCode;
		this.updateOverview();
		this.recordButtonClick(element, null, null, {
			current_step: 1,
			onboarding_type: this.isPitch ? 'pitch' : 'profile',
			country_name: country.name
		});
	}

	changeBusinessCategory(category, element) {
		this.isCategoryInvalid = false;
		this.currentCategory = this.currentCategory === category ? '' : category;
		this.updateOverview();
		this.recordButtonClick(element, null, null, {
			current_step: 1,
			onboarding_type: this.isPitch ? 'pitch' : 'profile',
			category_name: category
		});
	}

	scrollToTop() {
		if (!this.showFullDescription) {
			window.scrollTo({top: 200, behavior: 'smooth'});
		}
	}

	isSaveEnabled() {
		const isSameAsInitialValue =
			this.initialProfileDescription === this.groupProfilePage.description &&
			this.initialSelectedCountry === this.groupProfilePage.country;
		return !(isSameAsInitialValue || !this.profileDescription || !this.selectedCountry);
	}

	updateOverview() {
		this.isSaveInProgress = true;
		this.groupProfilePage.description = this.profileDescription;
		this.groupProfilePage.country = this.selectedCountry;
		this.groupProfilePage.category = this.currentCategory;
		this.groupProfilePage.isOverviewSectionChanged = true;
		this.saveOverviewSection.emit();
	}

	getMeEditorInstance(editorInstance: any) {
		this.meQuillRef = editorInstance;
	}

	checkValidations() {
		this.isQuillInvalid = this.meQuillRef.root.innerText.trim() === '';
		this.updateOverview();
	}

	checkDescriptionHeight() {
		this.hideSeeMoreBtn = document.querySelector('#descriptionSection')?.scrollHeight <= 116;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngAfterViewInit() {
		this.checkDescriptionHeight();
	}
}
