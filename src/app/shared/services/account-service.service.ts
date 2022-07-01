import {Injectable} from '@angular/core';
import Auth from '@aws-amplify/auth';
import {Router} from '@angular/router';
import {UserService} from './user.service';
import {SecuredStorageProviderService} from './secured-storage-provider.service';

@Injectable({
	providedIn: 'root'
})
export class AccountServiceService {
	constructor(
		private readonly userService: UserService,
		private readonly router: Router,
		private securedStorageProviderService: SecuredStorageProviderService
	) {}

	public async login(username, password) {
		const user = await Auth.signIn(username, password);
		if (user?.signInUserSession?.idToken?.jwtToken) {
			this.securedStorageProviderService.setCookie('CognitoIdToken', user.signInUserSession.idToken.jwtToken, 3650);
		}
		if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
			this.router.navigate(['/password-recovery/reset-password']);
		}
	}

	public async refreshToken() {
		const user = await Auth.currentSession();
		if (user?.['idToken']?.['jwtToken']) {
			this.securedStorageProviderService.setCookie('CognitoIdToken', user?.['idToken']?.['jwtToken'], 3650);
		}
	}

	public async initiateForgotPassword(username: string) {
		await Auth.forgotPassword(username);
	}

	public async completeForgotPassword(username: string, authCode: string, newPassword: string) {
		await Auth.forgotPasswordSubmit(username, authCode, newPassword);
	}

	public async resetPassword(username: string, oldPassword: string, newPassword: string) {
		try {
			const user = await Auth.signIn(username, oldPassword);
			await Auth.completeNewPassword(user, newPassword, {});
			await this.userService.refreshUser();
			return true;
		} catch (e) {
			return e;
		}
	}
}
