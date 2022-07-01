import {
	AfterViewInit,
	Component,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	ViewChildren
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {UserDetailsForGroupProfile} from '@sharedModule/models/graph-ql.model';
import {takeUntil} from 'rxjs/operators';
import * as _ from 'lodash';
import {cloneDeep} from 'lodash';
import {GeographyService} from '@groupAdminModule/_services/geography.service';
import {environment} from '../../../../../environments/environment';
import {MatExpansionPanel} from '@angular/material/expansion';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {env} from 'process';

@Component({
	selector: 'app-group-profile-admins',
	templateUrl: './group-profile-admins.component.html',
	styleUrls: ['./group-profile-admins.component.scss']
})
export class GroupProfileAdminsComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Output() saveAdminSectionPreferences = new EventEmitter<any>();
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	initialValueOfShowCurrentAdmin;
	initialValueOfShowAdmins;
	noOfProfilesToBeShown = 4;
	_currentAdminProfile: UserDetailsForGroupProfile;
	isSaveInProgress: boolean = false;
	isChecked: boolean = false;
	openAdminModal: boolean = false;
	isExpanded: boolean = false;
	showNoFilledBorder: boolean = false;

	@Input() set currentAdminProfile(value: UserDetailsForGroupProfile) {
		this._currentAdminProfile = _.cloneDeep(value);
		this.initialValueOfShowCurrentAdmin = this.initialValueOfShowCurrentAdmin
			? this.initialValueOfShowCurrentAdmin
			: _.cloneDeep(this._currentAdminProfile);
	}

	constructor(
		injector: Injector,
		private geographyService: GeographyService,
		private groupProfilePageService: GroupProfilePagesService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.initialValueOfShowAdmins = _.cloneDeep(this.groupProfilePage.showAdmins);
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.isSaveInProgress = false;
			this.noOfProfilesToBeShown = 4;
		});
	}

	getCountryName(code) {
		let countryName = this.geographyService.getCountryNameFromCountryCode(code);
		return countryName.split(' ')[0];
	}

	getAdminCount(onlyVisibleCount = false) {
		return this.groupProfilePage?.admins
			? this.groupProfilePage.admins.filter(admin =>
					onlyVisibleCount ? admin.userDisplayName && admin.showUser : admin.userDisplayName
			  ).length
			: 0;
	}

	getAdminNumber() {
		return this.groupProfilePage?.admins ? this.groupProfilePage.admins.length : 0;
	}

	getUerBioLink(user) {
		return user.userId ? `${environment.profileConvosightUrl}/${user.userId}` : user.userProfileLink;
	}

	reset() {
		this.isSaveInProgress = false;
		this.openAdminModal = false;
		this.initialValueOfShowAdmins = _.cloneDeep(this.groupProfilePage.showAdmins);
		this.initialValueOfShowCurrentAdmin = _.cloneDeep(this._currentAdminProfile);
	}

	initiateSavingAdminSectionPreferences(closeButtonForEditAdmin?) {
		this.isSaveInProgress = true;
		this._currentAdminProfile.showUser = !this._currentAdminProfile.showUser;
		this.groupProfilePage.isAdminsSectionPreferenceChanged = true;
		this.saveAdminSectionPreferences.emit({
			currentUserProfileObj: cloneDeep(this._currentAdminProfile),
			closeButtonForPopup: closeButtonForEditAdmin
		});
	}

	updateNoOfProfileToBeShown() {
		if (this.noOfProfilesToBeShown === this.getAdminCount()) {
			this.noOfProfilesToBeShown = 4;
		} else {
			this.noOfProfilesToBeShown = this.getAdminCount();
		}
	}

	isSaveEnabled() {
		return (
			this.initialValueOfShowAdmins !== this.groupProfilePage.showAdmins ||
			JSON.stringify(this.initialValueOfShowCurrentAdmin) !== JSON.stringify(this._currentAdminProfile)
		);
	}

	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			this.isExpanded = true;
			x.hideToggle = true;
			x.expanded = true;

			if (!this.groupProfilePage.admins || this.groupProfilePage.admins?.length === 0) {
				this.showNoFilledBorder = true;
			}
			x.expandedChange.subscribe(data => {
				if (data) {
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			});
		});
	}
}
