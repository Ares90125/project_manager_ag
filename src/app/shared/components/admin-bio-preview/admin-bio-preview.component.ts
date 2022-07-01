import {Component, EventEmitter, Inject, Injector, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {BackendService} from '@sharedModule/services/backend.service';
import {environment} from 'src/environments/environment';
import Auth from '@aws-amplify/auth';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import $ from 'jquery';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {DOCUMENT} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CountryISO, SearchCountryField} from 'ngx-intl-tel-input';

declare var window: any;

@Component({
	selector: 'app-admin-bio-preview',
	templateUrl: './admin-bio-preview.component.html',
	styleUrls: ['./admin-bio-preview.component.scss']
})
export class AdminBioPreviewComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBioFromSetting;
	@Input() draftAdminBio;
	@Output() closePreview = new EventEmitter<boolean>();
	@Input() user: UserModel;
	CountryISO = CountryISO;
	SearchCountryField = SearchCountryField;
	separateDialCode = true;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	isLoading = false;
	adminBio: any;
	kudosData;
	adminId;
	showAdminContactInfoPopup = false;
	clearBitScript;
	totalGroupMember = 0;
	optInForm: FormGroup;

	constructor(
		injector: Injector,
		private readonly route: ActivatedRoute,
		private readonly backendService: BackendService,
		private readonly adminBioService: AdminBioService,
		private readonly userService: UserService,
		private readonly router: Router,
		private readonly securedStorageService: SecuredStorageProviderService,
		private readonly renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		private readonly formBuilder: FormBuilder
	) {
		super(injector);
	}

	closePreviewOverlay() {
		this.closePreview.next(false);
	}

	loadClearbitScript() {
		this.clearBitScript = this.renderer2.createElement('script');
		this.clearBitScript.type = 'text/javascript';
		this.clearBitScript.innerHTML = `(function (d, u, h, s) {
    		h = d.getElementsByTagName('head')[0];
    		s = d.createElement('script');
    		s.async = 1;
    		s.src = u + new Date().getTime();
    		h.appendChild(s);
  			})(document, 'https://grow.clearbitjs.com/api/pixel.js?v=');`;
		this.renderer2.appendChild(this._document.body, this.clearBitScript);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.loadClearbitScript();
		this.addLeadfeederScriptsToHead();
		this.loadOptInForm();
		this.securedStorageService.removeSessionStorage('login_through_OAuthState');
		this.checkToShowKudosPopupOrErrorToast();
		if (this.adminBioService.showAdminBioContactPopup) {
			this.adminBioService.showAdminBioContactPopup = false;
			setTimeout(() => {
				this.disableScrolling();
				this.recordDialogBoxShow('OptIn Popup');
				this.showAdminContactInfoPopup = true;
			}, 800);
		}
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(async param => {
				this.isLoading = true;
				try {
					this.adminId = param.id;
					this.user = await this.userService.getUser();
					this.adminBio =
						this.draftAdminBio ??
						(await this.backendService.httpGet(
							`${environment.apiUrl}/admin-profile?userId=${param.id}&srcUserId=${this.user?.id}`
						));
					this.setPageTitleInfo(this.adminBio);
					this.calculateTotalGroupAdminMember(this.adminBio);
					this.kudosData = {
						url: window.location.href,
						adminId: param.id,
						login_from: 'AdminBioKudos',
						adminName: this.draftAdminBio
							? `${this.adminBioFromSetting.firstName} ${this.adminBioFromSetting.lastName}`
							: `${this.adminBio.firstName} ${this.adminBio.lastName}`,
						firstName: this.draftAdminBio ? this.adminBioFromSetting.firstName : this.adminBio.firstName
					};
					this.isLoading = false;
				} catch (e) {
					this.logger.error(
						e,
						'Error while updating admin bio',
						{admin_user_id: param.id},
						'AdminBioPreviewComponent',
						'ngOnInit',
						LoggerCategory.AppLogs
					);
				}
			})
		);
	}

	addLeadfeederScriptsToHead() {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');

		script.innerHTML = `(function (ss, ex) {
			window.ldfdr =
				window.ldfdr ||
				function () {
					(ldfdr._q = ldfdr._q || []).push([].slice.call(arguments));
				};
			(function (d, s) {
				fs = d.getElementsByTagName(s)[0];
				function ce(src) {
					var cs = d.createElement(s);
					cs.src = src;
					cs.async = 1;
					fs.parentNode.insertBefore(cs, fs);
				}
				ce('https://sc.lfeeder.com/lftracker_v1_' + ss + (ex ? '_' + ex : '') + '.js');
			})(document, 'script');
		})('kn9Eq4ROE2KaRlvP');`;

		head.insertBefore(script, head.firstChild);
	}

	loadOptInForm() {
		this.optInForm = this.formBuilder.group({
			sendAdminBioNotificationCampaign: [true],
			adminBioContactPhoneNumber: [''],
			adminBioContactEmail: ['', [Validators.email]]
		});
	}

	calculateTotalGroupAdminMember(adminBio) {
		if (adminBio.selectedAdministratedGroups && adminBio.selectedAdministratedGroups.length > 0) {
			this.totalGroupMember = adminBio.selectedAdministratedGroups.reduce((a, b) => (a += b.memberCount), 0);
		}
	}

	async checkToShowKudosPopupOrErrorToast() {
		try {
			if (this.adminBioService.errorToastAdminKudosItself) {
				this.alert.error(`Only others can heart your profile`, '');
				this.adminBioService.errorToastAdminKudosItself = false;
				return;
			}
		} catch (e) {}
	}

	redirectToLandingPage() {
		if (!!window) {
			window.location.href = environment.landingPageUrl;
		}
	}

	scrollToSection(event) {
		event.preventDefault();
		var dataHref = event.currentTarget.attributes.datahref.nodeValue;
		$('.preview-profile-left li a').removeClass('active');
		event.currentTarget.classList.add('active');
		$('html, body').animate(
			{
				scrollTop: $('#' + dataHref).offset().top - 50
			},
			500
		);
	}

	setPageTitleInfo(adminBio) {
		super.setPageTitle(
			`GA - ${adminBio.firstName ?? this.adminBioFromSetting?.firstName} ${
				adminBio.lastName ?? this.adminBioFromSetting?.lastName
			} - Admin Bio Preview`,
			'GA - Admin Name - Admin Bio Preview',
			{
				is_public_url: !this.adminBioFromSetting,
				admin_user_id: adminBio.userId,
				admin_name: `${adminBio.firstName ?? this.adminBioFromSetting?.firstName} ${
					adminBio.lastName ?? this.adminBioFromSetting?.lastName
				}`,
				url: !!window ? window?.location?.href : ''
			}
		);
	}

	async signIn(element) {
		this.recordButtonClick(element);
		const user = await this.userService.getUser();
		if (user) {
			if (user.adminBioContactEmail || user.adminBioContactPhoneNumber) {
				this.router.navigateByUrl('group-admin/settings/admin-bio?ref=open_admin_bio_popup');
				return;
			}
			this.disableScrolling();
			this.showAdminContactInfoPopup = true;
			return;
		}

		const customStateData = {
			url: window.location.href,
			adminId: this.adminBio.userId ?? this.adminId,
			profileUrlSlug: this.adminBio.profileUrlSlug,
			login_from: 'CreateABio',
			adminName: `${this.adminBio.firstName} ${this.adminBio.lastName}`
		};
		this.securedStorageService.setSessionStorage('login_through_OAuthState', JSON.stringify(customStateData));
		// @ts-ignore
		await Auth.federatedSignIn({provider: 'Facebook'});
	}

	removedClearbitScript() {
		this.renderer2.removeChild(this._document.body, this.clearBitScript);
	}

	async saveOptInForm(form) {
		this.enableScrolling();
		const data = form.getRawValue();
		if (!data.sendAdminBioNotificationCampaign) {
			this.userService.updateAdminBioContactInfo({
				cognitoId: this.user.cognitoId,
				sendAdminBioNotificationCampaign: data.sendAdminBioNotificationCampaign
			});
			this.router.navigateByUrl('/group-admin/settings/admin-bio?ref=open_admin_bio_popup');
		} else {
			this.user = await this.userService.getUser();
			this.userService.updateAdminBioContactInfo({
				cognitoId: this.user.cognitoId,
				sendAdminBioNotificationCampaign: data.sendAdminBioNotificationCampaign,
				adminBioContactPhoneNumber: data.adminBioContactPhoneNumber ? data.adminBioContactPhoneNumber.e164Number : null,
				adminBioContactEmail: data.adminBioContactEmail ?? null
			});
			this.router.navigateByUrl('/group-admin/settings/admin-bio?ref=open_admin_bio_popup');
		}
	}

	ngOnDestroy() {
		this.removedClearbitScript();
		super._ngOnDestroy();
	}
}
