import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-account-settings',
	templateUrl: './account-settings.component.html',
	styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;

	constructor(injector: Injector, private userService: UserService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(usr => {
				if (!usr) {
					return;
				}

				this.user = usr;
				super.setPageTitle('Account Settings', 'Account Settings', {userId: usr.id, userName: usr.fullname});
			})
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
