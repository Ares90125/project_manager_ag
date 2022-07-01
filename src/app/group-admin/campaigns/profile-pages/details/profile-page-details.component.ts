import {BaseComponent} from '@sharedModule/components/base.component';
import {Injector} from '@angular/core';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupsService} from '@sharedModule/services/groups.service';

export class ProfilePageDetailsComponent extends BaseComponent {
	group: GroupModel;
	profilePage: GroupProfilePageModel = null;
	readonly groupProfilePagesService: GroupProfilePagesService;
	readonly router: Router;
	readonly route: ActivatedRoute;
	readonly groupsService: GroupsService;
	constructor(injector: Injector) {
		super(injector);
		this.groupProfilePagesService = injector.get(GroupProfilePagesService);
		this.router = injector.get(Router);
		this.route = injector.get(ActivatedRoute);
		this.groupsService = injector.get(GroupsService);
	}

	_ngOnInit() {
		super._ngOnInit();
		this.groupProfilePagesService.selectedGroupForProfilePage$
			.pipe(takeUntil(this.destroy$))
			.subscribe(group => (this.group = group));

		this.groupProfilePagesService.selectedProfilePageOfSelectedGroup$
			.pipe(takeUntil(this.destroy$))
			.subscribe(profilePage => this.processSelectedProfilePage(profilePage));
	}

	_ngOnDestroy() {
		super._ngOnDestroy();
	}

	processSelectedProfilePage(profilePage: GroupProfilePageModel) {
		this.groupProfilePagesService.setIsProfilePageData(null);

		if (profilePage === null) {
			this.route.params.subscribe(async param => {
				try {
					const group = await this.groupsService.getGroup(param.groupId);
					this.profilePage = await this.groupProfilePagesService.getProfilePageByProfileId(param.profileId);
					this.groupProfilePagesService.setIsProfilePageData(this.profilePage);
					return;
				} catch (e) {
					const groupWithProfilePageAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
						(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
					);
					if (groupWithProfilePageAccess && groupWithProfilePageAccess.length > 0) {
						this.router.navigateByUrl(`/group-admin/campaigns/${groupWithProfilePageAccess[0].id}/profile-pages`);
					} else {
						this.router.navigateByUrl('/group-admin/manage');
					}
				}
			});
		}
		this.profilePage = profilePage;
		this.groupProfilePagesService.setIsProfilePageData(this.profilePage);
	}
}
