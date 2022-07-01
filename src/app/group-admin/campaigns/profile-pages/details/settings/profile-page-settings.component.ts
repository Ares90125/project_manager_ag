import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ProfilePageDetailsComponent} from '@campaigns/profile-pages/details/profile-page-details.component';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {GeographyService} from '@groupAdminModule/_services/geography.service';
import {UserService} from '@sharedModule/services/user.service';
import {takeUntil} from 'rxjs/operators';
import {FileService} from '@sharedModule/services/file.service';

@Component({
	selector: 'app-profile-page-settings',
	templateUrl: './profile-page-settings.component.html',
	styleUrls: ['./profile-page-settings.component.scss']
})
export class ProfilePageSettingsComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	currentTab: 'General' | 'Admin Bio' = 'General';
	quillConfig = {
		toolbar: [['bold', 'italic', 'link', {list: 'ordered'}, {list: 'bullet'}]]
	};
	userCards = [0, 1, 2, 3];
	profilePage: GroupProfilePageModel;
	profileDescription: string = null;
	initialDescription: string = null;
	countryList;
	selectedCountry = 'Select country';
	initialCountry: string = null;
	meQuillRef: any;
	isCopied = false;
	isThereAnyUnSavedChanges = false;
	isSaveInProgress = false;
	isProfileLoaded = false;
	constructor(
		injector: Injector,
		public readonly groupProfilePages: GroupProfilePagesService,
		private userService: UserService,
		private geographyService: GeographyService,
		private fileService: FileService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.groupProfilePagesService.isProfilePageData$.pipe(takeUntil(this.destroy$)).subscribe(profilePage => {
			if (profilePage) {
				this.profilePage = profilePage;
				this.initPage(profilePage);
			}
		});
	}

	initPage(profilePage: GroupProfilePageModel) {
		super.setPageTitle('GA - Campaign Profile Page Setting', 'GA - Campaign Profile Page Setting');
		this.processInitalDataFromProfilePage(profilePage);
		this.groupProfilePagesService.isProfileGeneralSettingsUpdateSuccess
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => {
				if (value) {
					this.initialCountry = this.selectedCountry;
					this.initialDescription = this.profileDescription;
					this.profilePage.isOverviewSectionChanged = false;
				}
			});
		this.getCountriesList();
		this.isProfileLoaded = true;
	}

	async getCountriesList() {
		this.countryList = await this.userService.getCountries();
	}

	getCountryName(code) {
		let countryName = this.geographyService.getCountryNameFromCountryCode(code);
		return countryName.split(' ')[0];
	}

	processInitalDataFromProfilePage(profilePage: GroupProfilePageModel) {
		if (profilePage) {
			if (profilePage.description) {
				let description = profilePage.description;
				this.profileDescription = description;
				this.initialDescription = description;
			}
			if (profilePage.country) {
				this.selectedCountry = profilePage.country;
				this.initialCountry = profilePage.country;
			}
		}
	}

	getMeEditorInstance(editorInstance: any) {
		this.meQuillRef = editorInstance;
	}

	updateDetails() {
		this.profileDescription = this.meQuillRef.root.innerHTML;
		if (
			!(this.profileDescription === this.initialDescription && this.selectedCountry === this.initialCountry) &&
			this.profileDescription !== null &&
			this.selectedCountry !== 'Select country'
		) {
			this.profilePage.isOverviewSectionChanged = true;
			this.profilePage.description = this.profileDescription;
			this.profilePage.country = this.selectedCountry;
			this.saveProfilePage();
		}
	}

	async saveProfilePage() {
		this.isSaveInProgress = true;
		await this.group.saveProfilePage(this.profilePage, this.groupProfilePagesService, this.fileService);
		this.isSaveInProgress = false;
	}

	selectedLocation(country) {
		this.selectedCountry = country.isoCode;
		this.updateDetails();
	}

	async publishProfilePage() {
		this.isSaveInProgress = true;
		const response = await this.group.publishProfilePage(this.profilePage, this.groupProfilePagesService);
		if (!response) {
			this.alert.error('Something went wrong, please try again !', '');
		}
		this.isSaveInProgress = false;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	copyToClipboard(url: string) {
		this.isCopied = true;
		this.appService.copyToClipboard(url);
	}

	seeMoreRequests(event) {
		event.currentTarget.parentNode.parentNode.classList.toggle('show-all-cards');
	}
}
