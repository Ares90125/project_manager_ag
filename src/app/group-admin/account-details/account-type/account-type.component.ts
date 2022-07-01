import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-account-type',
	templateUrl: './account-type.component.html',
	styleUrls: ['./account-type.component.scss']
})
export class AccountTypeComponent extends BaseComponent implements OnInit, OnDestroy {
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
				super.setPageTitle('Account Type', 'Account Type', {userId: usr.id, userName: usr.fullname});
			})
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
