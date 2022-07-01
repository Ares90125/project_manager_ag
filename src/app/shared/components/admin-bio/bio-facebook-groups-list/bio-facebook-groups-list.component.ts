import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Component({
	selector: 'app-bio-facebook-groups-list',
	templateUrl: './bio-facebook-groups-list.component.html',
	styleUrls: ['./bio-facebook-groups-list.component.scss']
})
export class BioFacebookGroupsListComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;
	groups: any;
	selectedAdminGroups;
	selectedSupportedGroups;
	showLoader = false;
	groupType;
	gettingGroupsFromFacebook = false;
	allSelected: boolean = false;
	searchText: string = '';

	constructor(
		injector: Injector,
		private groupsService: GroupsService,
		private facebookService: FacebookService,
		private securedStorageService: SecuredStorageProviderService,
		private adminBioService: AdminBioService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.getGroupData();
		if (this.adminBio?.selectedAdministratedGroups || this.adminBio?.selectedSupportedGroups) {
			this.selectedAdminGroups = this.adminBio?.selectedAdministratedGroups;
			this.selectedSupportedGroups = this.adminBio?.selectedSupportedGroups;
		}
	}

	toggleCheck(isChecked) {
		this.allSelected = isChecked;
		this.allSelected ? this.setUnsetAll(true) : this.setUnsetAll(false);
	}

	setUnsetAll(isAllSelected: boolean) {
		if (!this.groups) {
			return;
		}
		this.groups.forEach(t => (t.isSelected = isAllSelected));
	}

	selectionChange(groupId, event) {
		const index = this.groups.findIndex(group => group.id === groupId);
		this.groups[index].isSelected = event.checked;
		this.checkIfAllSelected();
	}

	checkIfAllSelected() {
		this.allSelected = this.groups.filter(grp => !grp.isSelected).length === 0 ? true : false;
	}

	closeGroupsOverlay() {
		this.groups = [];
		this.searchText = '';
		this.allSelected = false;
		this.showLoader = false;
	}

	async saveGroups(groupType) {
		if (groupType === 'admin') {
			this.selectedAdminGroups = this.groups.filter(grp => grp.isSelected);
			this.adminBioService.setandUpdateDraftAdminBio(
				AdminDraftFieldTypeEnum.selectedAdministratedGroups,
				await this.formatGroups(this.selectedAdminGroups)
			);
		} else {
			this.selectedSupportedGroups = this.groups.filter(grp => grp.isSelected);
			this.adminBioService.setandUpdateDraftAdminBio(
				AdminDraftFieldTypeEnum.selectedSupportedGroups,
				await this.formatGroups(this.selectedSupportedGroups)
			);
		}
		this.adminBioService.updatePublishButtonStatus(true);
		this.searchText = '';
	}

	async getGroupData() {
		this.groupsService.init();
	}

	async getAdminsGroups() {
		this.groupType = 'admin';
		this.showLoader = true;
		const groups = await this.groupsService.fetchAdminGroups();
		// checked if already groups selected or not and add isSelected field acc.
		this.groups = await this.formatGroups(groups);
		this.groups.map(grp => {
			if (this.selectedAdminGroups && this.selectedAdminGroups.some(selectedGrp => grp.id === selectedGrp.id)) {
				grp['isSelected'] = true;
			} else {
				grp['isSelected'] = false;
			}
			return grp;
		});
		this.checkIfAllSelected();
		this.showLoader = false;
	}

	formatGroups(groups) {
		return groups.map(grp => {
			return {
				id: grp.id,
				name: grp.name,
				memberCount: grp.memberCount,
				fbGroupId: grp.fbGroupId,
				profilePictureUrl: grp.coverImageUrl ?? grp.profilePictureUrl
			};
		});
	}

	async getMemberGroups() {
		this.groupType = 'support';
		this.showLoader = true;
		const groups = await this.groupsService.fetchMemberGroups();
		// checked if already groups selected or not and add isSelected field acc.
		this.groups = await this.formatGroups(groups);
		this.groups.map(grp => {
			if (this.selectedSupportedGroups && this.selectedSupportedGroups.some(selectedGrp => grp.id === selectedGrp.id)) {
				grp['isSelected'] = true;
			} else {
				grp['isSelected'] = false;
			}
			return grp;
		});
		this.checkIfAllSelected();
		this.showLoader = false;
	}

	async getMoreGroupsFromFacebook(element) {
		this.recordButtonClick(element);
		this.gettingGroupsFromFacebook = true;
		let url = this.appService.currentPageUrl.getValue();
		if (url.includes('?')) {
			url = url.split('?')[0];
		}
		await this.facebookService.revokeAccessPermission(FacebookPermissionEnum.GroupPermission);
		await this.securedStorageService.setSessionStorage(
			'redirectUrlFBPermission',
			`${url}?state=${JSON.stringify({
				permissionAskFor: FacebookPermissionEnum.GroupPermission
			})}`
		);
		await this.facebookService.reAskAccessPermission(
			FacebookPermissionEnum.GroupPermission,
			`${JSON.stringify({permissionAskFor: FacebookPermissionEnum.GroupPermission})}`
		);
	}

	processSearchTermInput(event: Event) {
		this.searchText = (event.target as HTMLInputElement).value;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
