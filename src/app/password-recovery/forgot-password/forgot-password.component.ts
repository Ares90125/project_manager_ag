import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NavigationExtras, Router} from '@angular/router';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {AlertService} from '@sharedModule/services/alert.service';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
	isFormSubmitted = false; // Track submit click
	isSubmitSuccess = false;
	hide = true;
	oldEmail;
	usernameErrorMsg = '';
	forgotPasswordForm: FormGroup;

	constructor(
		public accountService: AccountServiceService,
		public alertService: AlertService,
		private readonly router: Router
	) {}

	ngOnInit() {
		this.forgotPasswordForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email])
		});
	}

	/**
	 * Returns if form control has error or not
	 * @param controlName Name of form Control
	 * @param errorName Error name ie. required, email, etc
	 */
	public hasError(controlName: string, errorName: string) {
		return this.forgotPasswordForm.controls[controlName].hasError(errorName);
	}

	async forgetPasswordSubmit() {
		if (this.forgotPasswordForm.valid) {
			this.isFormSubmitted = true; // show loader
			try {
				await this.accountService.initiateForgotPassword(this.forgotPasswordForm.value.email);
				this.isSubmitSuccess = true;
				this.alertService.success(
					'Code Emailed',
					'Reset Code has been emailed to you. Please check you email',
					5000,
					true
				);
				const navigationExtras: NavigationExtras = {
					queryParams: {email: this.forgotPasswordForm.value.email}
				};
				this.router.navigate(['password-recovery/reset-password'], navigationExtras);
			} catch (err) {
				this.usernameErrorMsg = err.message;
				this.oldEmail = this.forgotPasswordForm.value.email;
			} finally {
				this.isFormSubmitted = false; // hide loader
			}
		}
	}
}
