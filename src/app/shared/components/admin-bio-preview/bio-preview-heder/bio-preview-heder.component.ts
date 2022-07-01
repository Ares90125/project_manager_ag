import {Component, HostListener, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import Auth from '@aws-amplify/auth';
import {BaseComponent} from '@sharedModule/components/base.component';
import {LeadSourceEnum} from '@sharedModule/enums/lead-source.enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {BackendService} from '@sharedModule/services/backend.service';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {UserService} from '@sharedModule/services/user.service';
import {AnimationOptions} from 'ngx-lottie';
import {environment} from '../../../../../environments/environment';

@Component({
	selector: 'app-bio-preview-heder',
	templateUrl: './bio-preview-heder.component.html',
	styleUrls: ['./bio-preview-heder.component.scss']
})
export class BioPreviewHederComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio;
	@Input() kudosData;
	@Input() isFromSettingPage;
	@Input() draftAdminBio;
	countryCode;
	countryFullName;
	openShareModal = false;
	showKudosPopup = false;
	showContactMeForm = false;
	contactMeSuccess = false;
	successAnimationOption: AnimationOptions = {
		path: './assets/json/success-animation.json'
	};
	environment = environment;

	@ViewChild('tooltip') tooltip;

	@HostListener('document:click', ['$event'])
	clickout(event) {
		if (this.tooltip) {
			this.tooltip.hide();
		}
	}
	@HostListener('document:scroll', ['$event'])
	scrollOut(event) {
		if (this.tooltip) {
			this.tooltip.hide();
		}
	}

	constructor(
		injector: Injector,
		private readonly backendService: BackendService,
		private readonly userService: UserService,
		private readonly adminBioService: AdminBioService,
		private readonly securedStorageService: SecuredStorageProviderService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		setTimeout(() => {
			if (!this.isFromSettingPage && !this.adminBio?.isKudosGivenBySource) {
				this.tooltip.show();
			}
		}, 2500);

		if (this.draftAdminBio?.country) {
			this.countryCode = this.draftAdminBio.country;
			this.countryFullName = this.draftAdminBio.countryFullName;
		} else if (this.adminBio?.country) {
			this.countryCode = this.adminBio.country;
			this.countryFullName = this.adminBio.countryFullName;
		}

		if (this.adminBioService.showThankYouPopup) {
			this.adminBioService.showThankYouPopup = false;
			setTimeout(() => {
				this.showKudosPopup = true;
			}, 2000);
			return;
		}
	}

	shareWidgetClicked() {
		this.disableScrolling();
		this.openShareModal = true;
	}

	async toggleKudos(element) {
		this.recordButtonClick(element, null, null, {
			kudos_count: this.adminBio.kudos.kudos
		});
		const user = await this.userService.getUser();
		if (!user) {
			this.securedStorageService.setSessionStorage('login_through_OAuthState', JSON.stringify(this.kudosData));
			// @ts-ignore
			await Auth.federatedSignIn({provider: 'Facebook'});
			return;
		}
		if (user.id === this.kudosData.adminId) {
			this.logger.info(
				'hearts_given_themself',
				{kudos_count: this.adminBio.kudos.kudos},
				'BioPreviewHederComponent',
				'ngOnInit'
			);
			this.alert.error(`Only others can heart your profile`, '');
			return;
		}
		const kudos = await this.adminBioService.updateKudos(this.kudosData.adminId);
		this.adminBio.kudos = kudos.kudos;
		if (kudos.added) {
			this.logger.info(
				'hearts_given',
				{
					kudos_count: kudos.kudos,
					post_login: false,
					admin_id: this.kudosData.adminId,
					admin_name: `${this.adminBio.firstName} ${this.adminBio.lastName}`
				},
				'BioPreviewHederComponent',
				'ngOnInit'
			);
			this.adminBio.isKudosGivenBySource = true;
			setTimeout(() => {
				this.showKudosPopup = true;
			}, 2000);
			return;
		} else {
			this.logger.info(
				'hearts_removed',
				{
					kudos_count: kudos.kudos,
					post_login: false,
					admin_id: this.kudosData.adminId,
					admin_name: `${this.adminBio.firstName} ${this.adminBio.lastName}`
				},
				'BioPreviewHederComponent',
				'ngOnInit'
			);
		}
		this.adminBio.isKudosGivenBySource = false;
	}

	thankYouAnimationOption: AnimationOptions = {
		path: './assets/json/thank-you-animation.json',
		loop: false
	};

	heartAnimationOption: AnimationOptions = {
		path: './assets/json/heart-animation.json',
		loop: false
	};
	showDefaultUserImage(event) {
		event.target.src = 'assets/images/default_user.png';
	}

	closePopup(event) {
		this.enableScrolling();
		this.openShareModal = false;
	}

	showContactMeFormPopup(element) {
		this.recordButtonClick(element, null, null, {contact_form_opened_from: LeadSourceEnum.AdminBioGeneral});
		this.disableScrolling();
		this.showContactMeForm = true;
	}

	closeContactForm(event) {
		this.enableScrolling();
		this.showContactMeForm = false;
		this.contactMeSuccess = event;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
