import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {Router} from '@angular/router';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {AnimationOptions} from 'ngx-lottie';
import {environment} from '../../../../../environments/environment';

@Component({
	selector: 'app-bio-introduction',
	templateUrl: './bio-introduction.component.html',
	styleUrls: ['./bio-introduction.component.scss']
})
export class BioIntroductionComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio;
	@Input() draftAdminBio;
	openShareModal = false;
	openAdminPreviewOverlay = false;
	adminBioAnalytics;
	loadingAnalytics = true;
	showMessageLeadPopup = false;
	environment = environment;

	constructor(injector: Injector, private readonly router: Router, private readonly adminBioService: AdminBioService) {
		super(injector);
	}

	noHeartAnimationOption: AnimationOptions = {
		path: './assets/json/no-heart-animation.json'
	};
	messageBoxAnimation: AnimationOptions = {
		path: './assets/json/message-box-animation.json'
	};

	async ngOnInit() {
		super._ngOnInit();
		this.adminBio.isBioCompleted ? this.getAdminBioAnalytics() : (this.loadingAnalytics = false);
		this.subscriptionsToDestroy.push(
			this.adminBioService.isAdminBioPublished$.subscribe(async data => {
				if (data) {
					this.adminBioAnalytics = await this.adminBioService.getAdminBioAnalytics();
					this.loadingAnalytics = false;
				}
			})
		);
		// this.adminBioService.getAdminBioMessageLead();
	}

	openPreviewOverlay() {
		this.openAdminPreviewOverlay = true;
		this.disableScrolling();
	}

	openShareModalFromLead(event) {
		this.disableScrolling();
		this.showMessageLeadPopup = false;
		this.openShareModal = true;
	}

	openMessageLeadPopup(element) {
		this.recordButtonClick(element);
		this.disableScrolling();
		this.showMessageLeadPopup = true;
	}

	closeMessageLeadPopup() {
		this.showMessageLeadPopup = false;
		this.enableScrolling();
	}

	closePreview(event) {
		this.openAdminPreviewOverlay = false;
		this.enableScrolling();
	}

	shareWidgetClicked() {
		this.disableScrolling();
		this.openShareModal = true;
	}

	async getAdminBioAnalytics() {
		this.adminBioAnalytics = await this.adminBioService.getAdminBioAnalytics();
		this.loadingAnalytics = false;
	}

	closePopup(event) {
		this.enableScrolling();
		this.openShareModal = false;
	}

	showDefaultUserImage(event) {
		event.target.src = 'assets/images/default_user.png';
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
