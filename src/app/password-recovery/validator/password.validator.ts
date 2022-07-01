import {AbstractControl} from '@angular/forms';

export class PasswordValidation {
	static MatchPassword(AC: AbstractControl) {
		const password = AC.get('password').value;
		const confirmPassword = AC.get('passwordConfirm').value;
		if (password !== confirmPassword) {
			AC.get('passwordConfirm').setErrors({MatchPassword: true});
		} else {
			return null;
		}
	}
}
