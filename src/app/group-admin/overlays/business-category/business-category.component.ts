import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GeographyService} from '@groupAdminModule/_services/geography.service';

@Component({
	selector: 'app-business-category',
	templateUrl: './business-category.component.html',
	styleUrls: ['./business-category.component.scss']
})
export class BusinessCategoryComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() selectedGroup: GroupModel;
	@Input() convoTrendPage: boolean;
	@Output() closeBusinessCategory = new EventEmitter<boolean>();
	isStepOneHidden = false;
	isStepTwoHidden = true;
	countryPlaceholder = 'Select country';
	countryList;
	selectedCategory = 'Entertainment';
	isSubmitClicked = false;

	constructor(
		private groupsService: GroupsService,
		private injector: Injector,
		private geographyService: GeographyService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		// Get CountryList
		this.countryList = this.geographyService.getCountryListWithCodes();
		this.initializeCountryAndCategoryInUI(this.selectedGroup);
		if (this.selectedGroup.businessCategory) {
			this.selectedCategory = this.selectedGroup.businessCategory;
			this.isStepOneHidden = true;
			this.isStepTwoHidden = false;
		}
	}

	initializeCountryAndCategoryInUI(group: GroupModel) {
		if (group.country) {
			this.countryPlaceholder = this.geographyService.getCountryNameFromCountryCode(group['country']);
		}
	}

	selectBusinessCategory(element) {
		this.recordButtonClick(element, this.selectedGroup);
		this.selectedCategory = element.currentTarget.dataset.csLabel;
		this.isStepOneHidden = true;
		this.isStepTwoHidden = false;
	}

	showBusinessCategories() {
		this.isStepOneHidden = false;
		this.isStepTwoHidden = true;
	}

	changeGroupCountry(country: string) {
		this.selectedGroup['country'] = country.substr(-3, 2);
		this.countryPlaceholder = country;
	}

	async updateBusinessCategoryAndCountry(element) {
		try {
			this.selectedGroup['businessCategory'] = this.selectedCategory;
			this.recordButtonClick(element, this.selectedGroup);
			this.isSubmitClicked = true;
			await this.groupsService.updateBusinessCategoryAndCountryDetails(
				this.selectedGroup.id,
				this.selectedGroup.businessCategory,
				this.selectedGroup.country
			);
			this.alert.success('', 'Group details updated successfully', 5000, true);
			await this.closeBusinessCategory.emit(false);
		} catch (e) {
			this.isSubmitClicked = false;
			this.alert.error('Group details not updated successfully', 'Please try again after some time', 5000, true);
			await this.closeBusinessCategory.emit(false);
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
