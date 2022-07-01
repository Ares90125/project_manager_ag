import {Component, Injector, NgZone, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {SecuredStorageProviderService} from 'src/app/shared/services/secured-storage-provider.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {UserModel} from '@sharedModule/models/user.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {PushNotificationService} from '@sharedModule/services/push-notification.service';
import {UserService} from '@sharedModule/services/user.service';
import {PublishService} from '../../../_services/publish.service';
import {GroupCampaignService} from '../../../_services/group-campaign.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';

@Component({
	selector: 'app-publish',
	templateUrl: './publish.component.html',
	styleUrls: ['./publish.component.scss']
})
export class PublishComponent extends BaseComponent implements OnInit, OnDestroy {
	noGroupsAvailable = false;

	currentUser: UserModel;
	installedGroups: GroupModel[];
	mobViewInstalledGroups: GroupModel[];
	selectedGroup: GroupModel;
	tabSelected = 'scheduledposts';
	filterApplied = false;
	firstTimeUser = false;

	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly publishService: PublishService,
		private readonly groupService: GroupsService,
		private readonly zone: NgZone,
		private pushNotificationService: PushNotificationService,
		private readonly securedStorage: SecuredStorageProviderService,
		private readonly groupCampaignService: GroupCampaignService,
		private router: Router,
		private route: ActivatedRoute
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.appService.setFreshchatFAQ('');
		this.pushNotificationService.showNotificationPrompt('DailyPushNotificationForScheduledPosts');
		this.publishService.selectedGroup.subscribe(group => {
			this.selectedGroup = group;
		});

		await this.fetchUser();
		this.publishService.resetData();
		this.loadGroups();
		this.groupCampaignService.getUserCampaigns();
	}

	async fetchUser() {
		this.currentUser = await this.userService.getUser();
	}

	toggleGroupSelection(element, group) {
		this.recordButtonClick(element, group);
		this.groupService.selectedGroupid = group.id;
		if (this.appService.currentPageUrl.getValue().includes('postanalytics')) {
			setTimeout(() => {
				this.selectedGroup = group;
				this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/postanalytics`);
			}, 100);
		} else {
			setTimeout(() => {
				this.selectedGroup = group;
				this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/scheduledposts`);
			}, 100);
		}
	}

	loadGroups() {
		this.groupService.init();
		this.subscriptionsToDestroy.push(
			this.groupService.groups.subscribe(groups => {
				const selectedGroupId = this.route.snapshot.params.groupId;

				if (groups === null) {
					return;
				}

				this.installedGroups = groups.filter(group => group.state === GroupStateEnum.Installed);

				if (this.installedGroups.length === 0) {
					this.noGroupsAvailable = true;
					return;
				}

				if (!this.selectedGroup) {
					this.selectedGroup = selectedGroupId
						? this.installedGroups.filter(group => group.id === selectedGroupId)[0]
						: this.installedGroups[0];
				}

				if (!this.selectedGroup) {
					this.router.navigate(['/group-admin/manage']);
					return;
				}

				this.mobViewInstalledGroups = [
					this.selectedGroup,
					...this.installedGroups.filter(item => item.id !== this.selectedGroup.id)
				];
				if (this.securedStorage.getCookie('newUser') === 'true') {
					this.firstTimeUser = true;
					this.securedStorage.setCookie('newUser', 'false', 365);
				}
				if (this.appService.currentPageUrl.getValue().includes('postanalytics')) {
					this.navigateAsPerUrl('postanalytics', this.selectedGroup.id);
				} else {
					this.navigateAsPerUrl('scheduledposts', this.selectedGroup.id);
				}
			})
		);
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

	sortInstalledGroup() {
		if (this.selectedGroup) {
			this.mobViewInstalledGroups = [
				this.selectedGroup,
				...this.installedGroups.filter(item => item.id !== this.selectedGroup.id)
			];
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
