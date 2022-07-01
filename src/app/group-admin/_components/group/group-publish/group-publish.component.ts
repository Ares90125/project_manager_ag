import {Component, Injector, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {GroupModel} from '@sharedModule/models/group.model';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {UserModel} from 'src/app/shared/models/user.model';
import {UserService} from 'src/app/shared/services/user.service';
import {GroupsService} from 'src/app/shared/services/groups.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
	selector: 'app-group-publish',
	templateUrl: './group-publish.component.html',
	styleUrls: ['./group-publish.component.scss']
})
export class GroupPublishComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;

	currentUser: UserModel;
	groupId;
	selectedGroup: GroupModel;
	tabSelected = 'scheduledposts';
	filterApplied = false;
	installedGroups: GroupModel[];

	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly groupService: GroupsService,
		private readonly zone: NgZone,
		private router: Router,
		private route: ActivatedRoute
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(param => {
				if (param.id) {
					this.groupId = param.id;
				}
			})
		);
		await this.fetchUser();
		await this.loadGroups();
	}

	async fetchUser() {
		this.currentUser = await this.userService.getUser();
	}

	loadGroups() {
		this.groupService.init();
		return new Promise(async resolve => {
			this.subscriptionsToDestroy.push(
				this.groupService.groups.subscribe(groups => {
					if (groups === null) {
						return;
					}
					if (!this.installedGroups) {
						this.installedGroups = groups.filter(group => group.isInstalled);
					}
					if (this.groupId) {
						this.selectedGroup = groups.find(group => group.id === this.groupId);
					} else {
						this.selectedGroup = groups[0];
					}
					if (this.appService.currentPageUrl.getValue().includes('publish')) {
						this.navigateAsPerUrl(this.appService.currentGroupPageUrl, this.selectedGroup.id);
					}
					resolve(undefined);
				})
			);
		});
	}

	navigateAsPerUrl(hash, id) {
		if (hash === 'postanalytics') {
			this.router.navigateByUrl(`/group-admin/publish/${id}/postanalytics`);
			this.tabSelected = 'postanalytics';
		} else {
			this.router.navigateByUrl(`/group-admin/publish/${id}/scheduledposts`);
			this.tabSelected = 'scheduledposts';
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
