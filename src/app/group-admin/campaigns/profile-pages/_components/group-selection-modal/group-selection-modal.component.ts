import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AlertTypeEnum} from '@sharedModule/enums/alert-type.enum';
import {GroupModel} from '@sharedModule/models/group.model';
import {AlertService} from '@sharedModule/services/alert.service';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-group-selection-modal',
	templateUrl: './group-selection-modal.component.html',
	styleUrls: ['./group-selection-modal.component.scss']
})
export class GroupSelectionModalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closePopup = new EventEmitter<boolean>();
	@Input() group: GroupModel;
	@Input() oneGroupMode: boolean = false;
	listOfGroupsWithProfilePageAccessObj: GroupModel[];
	searchText: string = '';
	selectedGroupId: string | null = null;
	selectedName: string | null = null;
	fetching: boolean = false;
	loaderCount = [1, 2, 3, 4, 5, 6];

	constructor(
		public readonly groupProfilePagesService: GroupProfilePagesService,
		private alertService: AlertService,
		private groupService: GroupsService,
		private readonly router: Router,
		injector: Injector
	) {
		super(injector);
	}

	createProfileHandle(element) {
		this.recordButtonClick(element);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.listGroupsWithProfilePagesAccess();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async listGroupsWithProfilePagesAccess() {
		if (this.oneGroupMode) {
			this.selectedGroupId = this.group.id;
			this.selectedName = this.group.name;
			return;
		}
		this.listOfGroupsWithProfilePageAccessObj = await this.groupProfilePagesService.listGroupsWithProfilePagesAccess();
	}

	async createNewProfilePage() {
		this.fetching = true;
		const newProfileId = await this.group.createGroupProfilePage(
			this.selectedName.trim(),
			true,
			this.groupProfilePagesService
		);

		if (!newProfileId) {
			this.alertService.error(AlertTypeEnum.Error, 'Something went wrong, please try again!');
			this.fetching = false;
			return;
		}
		this.router.navigateByUrl(
			`group-admin/campaigns/${this.selectedGroupId}/profile-pages/${newProfileId}/profile-onboarding`
		);
		this.fetching = false;
	}

	async selectGroupHandle(id: string, name: string) {
		this.selectedGroupId = this.selectedGroupId === id ? null : id;
		this.selectedName = this.selectedName === id ? null : name;
		this.group = await this.groupService.getGroup(id);
	}

	processSearchTermInput(event: Event) {
		this.searchText = (event.target as HTMLInputElement).value;
	}

	closePopupHandle(event) {
		this.recordButtonClick(event, this.group);
		this.closePopup.next(true);
	}
}
