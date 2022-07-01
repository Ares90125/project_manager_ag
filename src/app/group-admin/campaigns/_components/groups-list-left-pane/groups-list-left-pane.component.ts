import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-groups-list-left-pane',
	templateUrl: './groups-list-left-pane.component.html',
	styleUrls: ['./groups-list-left-pane.component.scss']
})
export class GroupsListLeftPaneComponent extends BaseComponent implements OnInit, OnDestroy {
	isLoading = true;
	loadingGroups = [0, 1, 2, 3, 4];
	searchText: string;
	openGroupSelectionModal = false;
	@Input() listOfGroupsWithProfilePageAccessObj: GroupModel[] | null = null;
	selectedGroup: GroupModel;
	currentGroup: GroupModel;
	@Output() selectedGroupChanged = new EventEmitter<GroupModel>();
	@Input() currentPageName: 'ProfilePage' | 'Others' = 'Others';
	isSelectionModelNeeded = false;

	constructor(
		injector: Injector,
		public readonly groupProfilePagesService: GroupProfilePagesService,
		private readonly router: Router
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.listGroupsWithProfilePagesAccess();
	}

	async listGroupsWithProfilePagesAccess() {
		if (!this.listOfGroupsWithProfilePageAccessObj) {
			this.listOfGroupsWithProfilePageAccessObj =
				await this.groupProfilePagesService.listGroupsWithProfilePagesAccess();
		}
		this.groupProfilePagesService.selectedGroupForProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(group => {
			this.isSelectionModelNeeded = false;
			this.selectedGroup = group;
			this.isLoading = false;
		});
	}

	async selectGroupProfile(group) {
		await group.listProfilePages(this.groupProfilePagesService);
		await this.groupProfilePagesService.setSelectedGroupForProfilePage(group);
		group.groupProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(async profilePages => {
			if (profilePages === null) {
				return;
			}
			// if (profilePages.length === 0) {
			// 	await this.group.createGroupProfilePage(this.group.name, true, this.groupProfilePages);
			// }

			const commonProfile = profilePages.filter(page => page.isDefaultProfile)[0];
			if (!commonProfile) {
				this.openGroupSelectionModal = true;
				return;
			}
			this.currentGroup = group;
			this.router.navigateByUrl(`/group-admin/campaigns/${group.id}/profile-pages`);
			this.groupProfilePagesService.setSelectedGroupForProfilePage(group);
		});
	}

	closeSelectionPopup() {
		this.enableScrolling();
		this.openGroupSelectionModal = false;
	}

	processSearchTermInput(event: Event) {
		this.searchText = (event.target as HTMLInputElement).value;
	}
}
