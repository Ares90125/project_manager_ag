import {
	AfterViewInit,
	Component,
	EventEmitter,
	Injector,
	Input,
	OnInit,
	Output,
	QueryList,
	ViewChildren
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {UserService} from '@sharedModule/services/user.service';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import * as _ from 'lodash';
import {GeographyService} from '@groupAdminModule/_services/geography.service';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
	selector: 'app-group-profile-overview',
	templateUrl: './group-profile-overview.component.html',
	styleUrls: ['./group-profile-overview.component.scss']
})
export class GroupProfileOverviewComponent extends BaseComponent implements OnInit, AfterViewInit {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Output() saveOverviewSection = new EventEmitter();
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	quillConfig = {
		toolbar: [['bold', 'italic', 'link', {list: 'ordered'}, {list: 'bullet'}]]
	};
	profileDescription: string = null;
	meQuillRef: any;
	countryList = [];
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
	selectedCountry;
	showFullDescription: boolean = false;
	isQuillInvalid: boolean = false;
	isSaveInProgress = false;
	welcomeTitle: string = 'Edit sections of the page to stand out';
	welcomeContent: string =
		'You are able to configure each section of this page using this button. Groups who configure their page earn more.';
	viewToolTip: boolean = false;
	hideSeeMoreBtn: boolean = false;
	initialProfileDescription: string = null;
	initialSelectedCountry: string = null;
	initialSelectedCategory: string = null;
	isExpanded: boolean = false;
	openEditOverviewModal: boolean = false;
	showNoFilledBorder: boolean = false;
	showOverviewVideo: boolean = false;

	constructor(
		injector: Injector,
		private userService: UserService,
		public readonly groupProfilePageService: GroupProfilePagesService,
		private geographyService: GeographyService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
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

	reset() {
		this.isQuillInvalid = false;
		this.openEditOverviewModal = false;
		this.groupProfilePage.description = this.groupProfilePage.description
			? this.groupProfilePage.description.replaceAll('\n', '<br>')
			: '';
		this.profileDescription = _.cloneDeep(this.groupProfilePage.description);
		this.selectedCountry = _.cloneDeep(this.groupProfilePage.country);
		this.currentCategory = _.cloneDeep(this.groupProfilePage.category);
		this.initialProfileDescription = this.profileDescription;
		this.initialSelectedCountry = this.selectedCountry;
		this.initialSelectedCategory = this.currentCategory;
	}

	getCountryName(code) {
		let countryName = this.geographyService.getCountryNameFromCountryCode(code);
		return countryName.split('(')[0];
	}

	async getCountryList() {
		this.countryList = await this.userService.getCountries();
	}

	selectedLocation(country) {
		this.selectedCountry = country.isoCode;
		this.updateOverview();
	}

	scrollToTop() {
		if (!this.showFullDescription) {
			window.scrollTo({top: 200, behavior: 'smooth'});
		}
	}

	isSaveEnabled() {
		const isSameAsInitialValue =
			this.initialProfileDescription === this.groupProfilePage.description &&
			this.initialSelectedCountry === this.groupProfilePage.country &&
			this.initialSelectedCategory === this.groupProfilePage.category;
		return !(isSameAsInitialValue || !this.profileDescription || !this.selectedCountry || !this.currentCategory);
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
		this.hideSeeMoreBtn = document.querySelector('#descriptionSection').scrollHeight <= 116;
	}

	openOverviewHelpVideo(){
		this.showOverviewVideo = true;
	}

	closeVideoPlayer(){
		this.showOverviewVideo = false;
	}

	changeBusinessCategory(category) {
		this.currentCategory = category;
		this.updateOverview();
	}

	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			if(!this.groupProfilePage.description && !this.groupProfilePage.country && !this.groupProfilePage.category || this.groupProfilePageService.checkIfAllSectionNeedToBeExpanded(this.groupProfilePage)) {
				this.isExpanded = true;
				x.hideToggle = true;
				x.expanded = true;
			}
			x.expandedChange.subscribe(data => {
				if(data){
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			})
		});
		this.checkDescriptionHeight();
	}
}
