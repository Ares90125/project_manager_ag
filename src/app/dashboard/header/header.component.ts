import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {Router, RoutesRecognized} from '@angular/router';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserTypeEnum} from '@sharedModule/enums/user-type.enum';
import {DateTime} from '@sharedModule/models/date-time';
import {filter, pairwise} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseComponent implements OnInit, OnDestroy {
	private now = new DateTime();

	@Input() user: UserModel;
	isCampaign = false;
	isCommunity = false;
	isBrandTrack = false;
	isBrand = false;
	isContentManager = false;
	isNotifications = false;
	isWhatsAppCampaigns = false;
	showBrandTack = false;
	isTrainings = false;
	isBrandCommunity = false;
	subscription: Subscription;

	constructor(injector: Injector, private readonly userService: UserService, private readonly router: Router) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.activeRoute(null);
		if (this.user.userType === UserTypeEnum.BrandMember) {
			this.subscriptionsToDestroy.push(
				this.headerService.showBrandTrackLinkInHeader.subscribe(boolValue => {
					this.showBrandTack = boolValue;
				})
			);
			return;
		}

		this.subscription = this.router.events
			.pipe(
				filter((evt: any) => evt instanceof RoutesRecognized),
				pairwise()
			)
			.subscribe((events: RoutesRecognized[]) => {
				this.checkUrlAndNavigate(events[0].urlAfterRedirects, events[1].urlAfterRedirects);
			});
	}

	ngOnDestroy() {
		super._ngOnDestroy();
		this.subscription && this.subscription.unsubscribe();
	}

	checkUrlAndNavigate(previousUrl: string, currentUrl: string) {
		if (
			previousUrl.includes('brands') &&
			previousUrl.includes('edit-campaign') &&
			currentUrl.includes('content-manager')
		) {
			const splittedUrl = previousUrl.split('/');
			const campaignId = splittedUrl[5].includes('#') ? splittedUrl[5].split('#')[0] : splittedUrl[5];
			this.router.navigate([`/cs-admin/content-manager/brand/${splittedUrl[3]}/campaign/${campaignId}`]);
		}
	}

	navigateToContentManager() {
		this.router.navigate(['/cs-admin/content-manager']);
	}

	activeRoute(element) {
		if (element) {
			this.recordButtonClick(element);
		}
		const url = this.appService.currentPageUrl.getValue().split('/');
		if (url[2] === 'manage-campaigns' || (url[1] === 'brand' && url[2] === undefined)) {
			this.isCommunity = false;
			this.isBrandTrack = false;
			this.isContentManager = false;
			this.isBrandCommunity = false;
			this.isWhatsAppCampaigns = false;
			this.isTrainings = false;
		} else if (url[2] === 'manage-communities' || url[2] === 'community') {
			this.isCommunity = true;
			this.isCampaign = false;
			this.isBrandTrack = false;
			this.isContentManager = false;
			this.isBrandCommunity = false;
			this.isWhatsAppCampaigns = false;
			this.isTrainings = false;
		} else if (url[2] === 'brand-track') {
			this.isBrandTrack = true;
			this.isCommunity = false;
			this.isCampaign = false;
			this.isContentManager = false;
			this.isBrandCommunity = false;
			this.isWhatsAppCampaigns = false;
			this.isTrainings = false;
		} else if (url[2] === 'manage-brands') {
			this.isBrand = true;
			this.isContentManager = false;
			this.isWhatsAppCampaigns = false;
			this.isBrandCommunity = false;
			this.isTrainings = false;
		} else if (url[2] === 'content-manager') {
			this.isContentManager = true;
			this.isBrand = false;
			this.isWhatsAppCampaigns = false;
			this.isBrandCommunity = false;
			this.isTrainings = false;
		} else if (url[2] === 'whatsApp-campaigns') {
			this.isBrandTrack = false;
			this.isCommunity = false;
			this.isCampaign = false;
			this.isContentManager = false;
			this.isWhatsAppCampaigns = true;
			this.isBrandCommunity = false;
			this.isTrainings = false;
		} else if (url[2] == 'trainings') {
			this.isBrandTrack = false;
			this.isCommunity = false;
			this.isCampaign = false;
			this.isContentManager = false;
			this.isWhatsAppCampaigns = false;
			this.isBrandCommunity = false;
			this.isTrainings = true;
		}
		if (this.router.url.includes('brand/brand-track')) {
			this.isBrandTrack = true;
			this.isCommunity = false;
			this.isCampaign = false;
			this.isContentManager = false;
			this.isBrandCommunity = false;
		}
		if (this.router.url.includes('brand-communities')) {
			this.isBrandCommunity = true;
			this.isBrandTrack = false;
			this.isCommunity = false;
			this.isCampaign = false;
			this.isContentManager = false;
		}
	}

	async navigateToBrandCommunitiesForBrand() {
		await this.router.navigate(['/brand/brand-communities']);
	}

	navigateHome() {
		if (this.user.userType === 'BrandMember') {
			this.router.navigate(['/brand/manage-campaigns']);
		}
	}
	async signOut(element) {
		this.recordButtonClick(element);
		await this.userService.logOut();
	}
}

