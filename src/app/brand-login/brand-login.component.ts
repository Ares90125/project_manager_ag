import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-brand-login',
	templateUrl: './brand-login.component.html',
	styleUrls: ['./brand-login.component.scss']
})
export class BrandLoginComponent extends BaseComponent implements OnInit, OnDestroy {
	isPasswordHidden = true;
	loginForm: FormGroup;
	isFormSubmitted = false; // Track login submit click
	usernameErrorMsg = '';

	constructor(
		injector: Injector,
		public accountService: AccountServiceService,
		public userService: UserService,
		public router: Router
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.loginForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required, Validators.minLength(8)])
		});
	}

	/**
	 * Returns if form control has error or not
	 * @param controlName Name of form Control
	 * @param errorName Error name ie. required, email, etc
	 */
	public hasError(controlName: string, errorName: string) {
		return this.loginForm.controls[controlName].hasError(errorName);
	}

	async loginSubmit() {
		this.isFormSubmitted = true; // shows loader
		if (this.loginForm.valid) {
			try {
				await this.accountService.login(this.loginForm.value.email, this.loginForm.value.password);
			} catch (err) {
				this.usernameErrorMsg = err.message;
				this.isFormSubmitted = false; // hide loader
			}
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
