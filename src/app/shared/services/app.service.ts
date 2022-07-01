import {Injectable} from '@angular/core';
import {BehaviorSubject, interval} from 'rxjs';
import {DeviceFormFactor} from '@sharedModule/enums/device-form-factor.enum';
import {UtilityService} from './utility.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {environment} from 'src/environments/environment';
import {BackendService} from './backend.service';

declare var navigator: any;
declare var window: any;
@Injectable({
	providedIn: 'root'
})
export class AppService {
	private _personaAlreadyShown = false;
	public currentPageUrl = new BehaviorSubject<string>(null);
	public currentPageName = new BehaviorSubject<string>(null);
	public currentGroupPageUrl;
	public currentPageFragment;
	private webEngageInterval;
	public hideGroupsAddedToastMessage;
	public adminShareUrl;
	constructor(
		private readonly utilityService: UtilityService,
		private readonly router: Router,
		private readonly location: Location,
		private readonly backendService: BackendService
	) {}

	get personaAlreadyShown(): boolean {
		return this._personaAlreadyShown;
	}

	set personaAlreadyShown(value) {
		this._personaAlreadyShown = value;
	}

	setGroupPageUrl(pageUrl) {
		this.currentGroupPageUrl = pageUrl;
	}

	setPageFragment(pageFragment) {
		this.currentPageFragment = pageFragment;
	}

	setAdminShareUrl(url) {
		this.adminShareUrl = url;
	}

	getAdminShareUrl(){
		return this.adminShareUrl;
	}

	getCurrentFormFactor() {
		const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (navigator.userAgent) {
			if (isMobileDevice) {
				return DeviceFormFactor.Mobile;
			} else {
				return DeviceFormFactor.Desktop;
			}
		}
	}

	copyToClipboard(text) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
		}
	}

	public async getUserIpInfo(): Promise<any> {
		const ipInfoApiUrl = environment.apiUrl + '/getClientInformation';
		return (await this.backendService.httpGet(ipInfoApiUrl)).body;
	}

	public goBack(url: string) {
		if (this.location && this.location.getState()) {
			const locationState: any = this.location.getState();
			locationState.navigationId === 1 ? this.router.navigateByUrl(url) : this.location.back();
		}
	}

	setFreshchatFAQ(faqTaq) {
		if (!!window.fcWidget) {
			if (window.fcWidget.isLoaded()) {
				window.fcWidget.setFaqTags({tags: ['default', faqTaq], filterType: 'category'});
			} else {
				setTimeout(() => {
					this.setFreshchatFAQ(faqTaq);
				}, 1000);
			}
		} else {
			setTimeout(() => {
				this.setFreshchatFAQ(faqTaq);
			}, 1000);
		}
	}

	hideFreshchat() {
		if (!!window.fcWidget) {
			if (window.fcWidget.isLoaded()) {
				window.fcWidget.hide();
			} else {
				setTimeout(() => {
					this.hideFreshchat();
				}, 1000);
			}
		} else {
			setTimeout(() => {
				this.hideFreshchat();
			}, 1000);
		}
	}

	getMaskedNumber(number: string) {
		return number.replace(/\s/g, '').replace(/\d(?=\d{4})/g, 'X');
	}

	async ifPlatformAndroidHideWebEngagePrompt() {
		const isPlatformRunningInAndroid = await this.utilityService.isLoggedOnMobileApplication();
		if (!isPlatformRunningInAndroid) {
			return;
		}
		this.webEngageInterval = interval(500).subscribe(v => {
			if (!!window.webengage) {
				window.webengage.options('webpush.disablePrompt', true);
				this.webEngageInterval.unsubscribe();
			}
		});
	}
}
