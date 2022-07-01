import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GeographyService} from '../../../_services/geography.service';
import {AlertService} from '@sharedModule/services/alert.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {Router} from '@angular/router';
import {BusinessCategoryEnum} from '@sharedModule/enums/business-category.enum';
import {OnPropertyChange} from '@sharedModule/decorator/property-changes.decorator';
import {PublishService} from 'src/app/group-admin/_services/publish.service';

@Component({
	selector: 'app-group-details',
	templateUrl: './group-details.component.html',
	styleUrls: ['./group-details.component.scss']
})
export class GroupDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closed = new EventEmitter();
	@Input()
	@OnPropertyChange('onGroupChange')
	group: GroupModel;
	pageType = 'group-details';
	eligibilityForInsightsUpload: boolean = false;
	countryPlaceholder = 'Select country';
	videoLink: string = 'https://www.youtube.com/embed/CD3lJ3l50gc';
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
		'Neighborhood/Local Groups',
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
		'Humor',
		'Others'
	];
	groupToUninstall: GroupModel = null;
	countryList;
	loadingGroupData = true;
	isFormSubmitted = false;

	constructor(
		private injector: Injector,
		private geographyService: GeographyService,
		private groupService: GroupsService,
		private alertService: AlertService,
		private router: Router,
		private publishService: PublishService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				this.group = group;
				if (this.groupService.checkGroupEligibilityForInsightsUpload(group)) {
					this.eligibilityForInsightsUpload = true;
				} else {
					this.eligibilityForInsightsUpload = false;
				}
			})
		);
		await this.loadCountryList();
		await this.initializeGroupData();
		this.loadingGroupData = false;
	}

	async onGroupChange(group: GroupModel) {
		await this.loadCountryList();
		await this.initializeGroupData();
	}

	async initializeGroupData() {
		if (this.router.url.includes('groupdetails')) {
			this.router.navigateByUrl(`group-admin/group/${this.group.id}/groupdetails`);
			this.logPageTitle(`GA - ${this.group.name} - Group Details`, 'GA - Group Details', {
				group_fb_id: this.group.fbGroupId,
				group_id: this.group.id,
				group_name: this.group.name
			});
			this.initializeCountryDataInUI();
		}
	}

	initializeCountryDataInUI() {
		if (this.group['country']) {
			this.countryPlaceholder = this.geographyService.getCountryNameFromCountryCode(this.group['country']);
		}
	}

	changeBusinessCategory(businessCategory: BusinessCategoryEnum) {
		this.group['businessCategory'] = businessCategory;
	}

	changeGroupCountry(country: string) {
		this.group['country'] = country.substr(-3, 2);
	}

	loadCountryList() {
		this.countryList = this.geographyService.getCountryListWithCodes();
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	async updateGroupInformation(element) {
		this.recordButtonClick(element, this.group);
		this.isFormSubmitted = true;
		try {
			await this.groupService.updateBusinessCategoryAndCountryDetails(
				this.group.id,
				this.group.businessCategory,
				this.group.country
			);
			await this.groupService.refresh();
			this.isFormSubmitted = false;
			this.alertService.success(
				'You can change these details anytime',
				'Group details updated successfully',
				5000,
				true
			);
		} catch (err) {
			this.isFormSubmitted = false;
		}
	}

	confirmUninstallation(element, group: GroupModel) {
		this.recordButtonClick(element, group);
		this.groupToUninstall = group;
	}

	close(element) {
		this.recordButtonClick(element, this.group);
		this.router.navigateByUrl(`group-admin/group/${this.group.id}/overview`);
		this.closed.emit(false);
		window.scrollTo(0, 0);
	}

	closeGroupUninstallOverlay(element) {
		this.recordButtonClick(element, this.group);
		this.groupToUninstall = null;
	}

	closeModal() {
		this.videoLink = '';
	}

	playVideo() {
		this.videoLink = 'https://www.youtube.com/embed/CD3lJ3l50gc';
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
