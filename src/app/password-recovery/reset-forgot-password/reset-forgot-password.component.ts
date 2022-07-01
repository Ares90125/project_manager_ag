import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '@sharedModule/services/alert.service';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-reset-forgot-password',
	templateUrl: './reset-forgot-password.component.html',
	styleUrls: ['./reset-forgot-password.component.scss']
})
export class ResetForgotPasswordComponent extends BaseComponent implements OnInit, OnDestroy {
	isPasswordHidden = true;
	resetForm: FormGroup;
	isFormSubmitted = false; // Track reset submit click
	codeErrorMsg = '';
	username = '';

	constructor(
		injector: Injector,
		public accountService: AccountServiceService,
		private route: ActivatedRoute,
		public alertService: AlertService,
		private readonly router: Router
	) {
		super(injector);
		this.subscriptionsToDestroy.push(
			this.route.queryParams.subscribe(params => {
				this.username = params['email'];
			})
		);
	}

	ngOnInit() {
		this.resetForm = new FormGroup({
			otpcode: new FormControl('', [Validators.required]),
			password: new FormControl('', [Validators.required, Validators.minLength(8)])
		});
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	async resetSubmit() {
		this.isFormSubmitted = true; // shows loader
		if (this.resetForm.valid) {
			try {
				await this.accountService.completeForgotPassword(
					this.username,
					this.resetForm.value.otpcode,
					this.resetForm.value.password
				);
				this.alertService.success('Password changed', 'Password changed. Please relogin', 5000, true);
				this.router.navigate(['/brand-login']);
			} catch (err) {
				this.codeErrorMsg = err.message;
			} finally {
				this.isFormSubmitted = false; // hide loader
			}
		}
	}
}
