import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable({
	providedIn: 'root'
})
export class SecuredStorageProviderService {
	constructor() {}

	public setCookie(name: string, value: string, days: number = 3650, domain: string = environment.cookieDomain): void {
		const date = new DateTime().add(days * 24 * 60 * 60, 'second');
		const expires = '; expires=' + date.toDate().toUTCString();

		document.cookie = name + '=' + (value || '') + expires + '; path=/' + '; domain=' + domain;
	}

	public setCookieForEachDay(name, value = true, domain = environment.cookieDomain) {
		let expires = '';
		const nextDayStart = new DateTime().add(1, 'd').startOf('d');
		expires = '; expires=' + nextDayStart.toDate().toUTCString();
		document.cookie = name + '=' + (value || '') + expires + '; path=/' + '; domain=' + domain;
	}

	public getCookie(name: string): string {
		const nameEQ = name + '=';
		const ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1, c.length);
			}
			if (c.indexOf(nameEQ) === 0) {
				return c.substring(nameEQ.length, c.length);
			}
		}
		return null;
	}

	removeCookie(name) {
		this.setCookie(name, '');
	}

	public expireCookie(name) {
		this.setCookie(name, '', -1);
	}

	public expireAllCookies() {
		const cookies = document.cookie.split(';').map(v => v.trim());
		const skipCookies = [
			'promptCard',
			'postPublisherModalShown',
			'convosightLoginStatus',
			'userType',
			'AdminBioJourneyInManagePage',
			'login_through_OAuthState',
			'GroupJourneyInManagePage'
		];
		for (let i = 0; i < cookies.length; i++) {
			const cookieName = cookies[i].split('=')[0];
			if (skipCookies.indexOf(cookieName) > -1) {
				continue;
			}
			this.expireCookie(cookies[i].split('=')[0]);
		}
	}

	setSessionStorage(name, value) {
		if (name === 'queryString' && sessionStorage.getItem(name)) {
			const oldValue = JSON.parse(sessionStorage.getItem(name));
			const newValue = JSON.parse(value);
			value = JSON.stringify(Object.assign(newValue, oldValue));
		}
		sessionStorage.setItem(name, value);
	}

	getSessionStorage(name) {
		return sessionStorage.getItem(name);
	}

	removeSessionStorage(name) {
		sessionStorage.removeItem(name);
	}

	setLocalStorage(name, value, expiry: number = 9999999999) {
		const item = JSON.stringify({value: value, expiry});
		localStorage.setItem(name, item);
	}

	getLocalStorage(name) {
		const item = localStorage.getItem(name);
		if (!item) {
			return;
		}

		const itemParse = JSON.parse(item);
		return itemParse.value;
	}

	removeLocalStorage(name) {
		localStorage.removeItem(name);
	}

	clearLocalStorage() {
		localStorage.clear();
	}

	clearSessionStorage() {
		Object.entries(sessionStorage).map(session => {
			if (session[0] !== 'redirectUriPostLogin') {
				this.removeSessionStorage(session[0]);
			}
		});
	}
}
