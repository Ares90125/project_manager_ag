import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

declare var window: any;

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {
	showHeader = false;
	user: UserModel;

	constructor(injector: Injector, private readonly userService: UserService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.userService.isLoggedIn.subscribe(async loggedInStatus => {
				if (loggedInStatus === null) {
					return;
				}

				if (loggedInStatus) {
					this.user = await this.userService.getUser();
				}
			})
		);
		this.subscriptionsToDestroy.push(
			this.appService.currentPageUrl.subscribe(pageUrl => {
				if (
					pageUrl.includes('/manage') ||
					pageUrl.includes('/campaigns') ||
					(pageUrl.includes('/settings') && !pageUrl.includes('settings/admin-bio')) ||
					pageUrl.includes('/no-groups') ||
					pageUrl.includes('/group-admin/publish') ||
					pageUrl.includes('/group-admin/notifications')
				) {
					this.showHeader = true;
				} else {
					this.showHeader = false;
				}
				// use regex - since we change details to groupId Abhishek
				const regex =
					/^\/group-admin\/campaigns\/profile-pages\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}\/preview/g;

				if (pageUrl.match(regex)) {
					this.showHeader = false;
				}
			})
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	public onActivate(e, outlet) {
		window.scrollTo(0, 0);
	}
}
