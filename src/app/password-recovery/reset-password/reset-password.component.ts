import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {PasswordValidation} from '../validator/password.validator';

@Component({
	selector: 'app-reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
	passwordResetForm: FormGroup;
	isPasswordHidden = true;
	passwordErrorMessage = false;

	constructor(private formBuilder: FormBuilder, private accountService: AccountServiceService) {}

	ngOnInit() {
		this.passwordResetForm = this.formBuilder.group(
			{
				username: ['', Validators.compose([Validators.required])],
				oldPassword: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
				passwordConfirm: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
				password: ['', Validators.compose([Validators.required, this.passwordPolicyCheck])]
			},
			{
				validator: PasswordValidation.MatchPassword
			}
		);
	}

	private passwordPolicyCheck(control: FormControl) {
		const passPhrase = control.value;
		const regMixtureAlphaNumeric = new RegExp('([0-9]+.*[a-zA-Z]+|[a-zA-Z]+.*[0-9]+)[0-9a-zA-Z]*');
		const regMixtureUpperLower = new RegExp('([A-Z]+.*[a-z]+)|([a-z]+.*[A-Z]+)');
		const regSplChar = new RegExp('[^A-za-z0-9]+');

		if (
			control.value !== null &&
			(passPhrase.length < 8 ||
				!regMixtureAlphaNumeric.test(passPhrase) ||
				!regMixtureUpperLower.test(passPhrase) ||
				!regSplChar.test(passPhrase))
		) {
			return {
				minLength: passPhrase.length < 8,
				mixtureAlphaNumeric: !regMixtureAlphaNumeric.test(passPhrase),
				mixtureUpperLower: !regMixtureUpperLower.test(passPhrase),
				mixtureSplChar: !regSplChar.test(passPhrase)
			};
		} else {
			return null;
		}
	}

	async resetPasswordSubmit() {
		this.passwordErrorMessage = false;
		if (this.passwordResetForm.valid) {
			const passwordResetFromValues = this.passwordResetForm.getRawValue();
			const passwordChangedMessage = await this.accountService.resetPassword(
				passwordResetFromValues.username,
				passwordResetFromValues.oldPassword,
				passwordResetFromValues.password
			);
			if (passwordChangedMessage?.message) {
				this.passwordErrorMessage = passwordChangedMessage?.message;
			}
		}
	}
}
