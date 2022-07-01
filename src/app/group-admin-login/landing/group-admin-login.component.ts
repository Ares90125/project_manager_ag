import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import Auth from '@aws-amplify/auth';
import {BaseComponent} from '@sharedModule/components/base.component';
import {Router} from '@angular/router';
import {UtilityService} from '@sharedModule/services/utility.service';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-group-admin-login',
	templateUrl: './group-admin-login.component.html',
	styleUrls: ['./group-admin-login.component.scss']
})
export class GroupAdminLoginComponent extends BaseComponent implements OnInit, OnDestroy {
	isLoading = false;
	isLoggedIn = null;

	constructor(
		injector: Injector,
		private router: Router,
		private utility: UtilityService,
		private userService: UserService
	) {
		super(injector);

		this.checkIfLoggedInOnMobileApp();
		this.subscribeToLoginStatus();
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	subscribeToLoginStatus() {
		this.subscriptionsToDestroy.push(
			this.userService.isLoggedIn.subscribe(loginStatus => {
				if (loginStatus === null) {
					return;
				}

				this.isLoggedIn = loginStatus;
				if (loginStatus) {
					this.router.navigateByUrl('group-admin/manage');
				}
			})
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	checkIfLoggedInOnMobileApp() {
		if (this.utility.isLoggedOnMobileApplication()) {
			return;
		}

		this.router.navigateByUrl('404');
	}

	async signIn(element) {
		this.isLoading = true;
		this.recordButtonClick(element);
		this.logger.debug(
			'Initiating federated sign-in when user clicks on Reconnect',
			{},
			'GroupAdminLoginComponent',
			'signIn',
			LoggerCategory.AppLogs
		);
		// @ts-ignore
		await Auth.federatedSignIn({provider: 'Facebook'});
	}
}
