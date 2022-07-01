import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-bank-details',
	templateUrl: './bank-details.component.html',
	styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
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
				super.setPageTitle('Bank Details', 'Bank Details', {userId: usr.id, userName: usr.fullname});
			})
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
