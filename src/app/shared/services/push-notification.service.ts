import {Injectable} from '@angular/core';
import {LoggerService} from 'src/app/shared/services/logger.service';
import {SecuredStorageProviderService} from 'src/app/shared/services/secured-storage-provider.service';
import {UtilityService} from './utility.service';

declare var window: any;

export enum NotificationPermission {
	Granted = 'granted',
	Default = 'default',
	Denied = 'denied'
}

@Injectable({
	providedIn: 'root'
})
export class PushNotificationService {
	public cookieName = '';

	constructor(
		private readonly securedStorageProviderService: SecuredStorageProviderService,
		protected logger: LoggerService,
		private readonly utilityService: UtilityService
	) {}

	async showNotificationPrompt(cookieName: string) {
		const customNotificationCookie = this.securedStorageProviderService.getCookie(cookieName);
		if (!customNotificationCookie) {
			this.cookieName = cookieName;
			this.setNotificationCookie();
			this.showBrowserNotificationPrompt();
		}
	}

	setNotificationCookie() {
		this.securedStorageProviderService.setCookieForEachDay(this.cookieName);
	}

	checkIfToShowCustomNotificationDialog() {
		if (!('Notification' in window)) {
			return false;
		} else if (Notification.permission === NotificationPermission.Default) {
			return true;
		} else {
			return false;
		}
	}

	async showBrowserNotificationPrompt() {
		if (await this.utilityService.isLoggedOnMobileApplication()) {
			return;
		}
		const self = this;
		if (!('Notification' in window)) {
			return;
		} else if (
			Notification.permission !== NotificationPermission.Denied ||
			String(Notification.permission) === NotificationPermission.Default
		) {
			Notification.requestPermission(function (permission) {});
		}
	}
}
