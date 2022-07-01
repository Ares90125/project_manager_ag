import {Component, HostListener, Injector, NgZone, OnDestroy, OnInit} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import {Hub} from '@aws-amplify/core';
import {ToastrService} from 'ngx-toastr';
import {AlertModel} from 'src/app/shared/models/alert.model';
import {AlertService} from 'src/app/shared/services/alert.service';
import {NotificationService} from 'src/app/shared/services/notification.service';
import {UserService} from 'src/app/shared/services/user.service';
import {BaseComponent} from './shared/components/base.component';
import {UserTypeEnum} from './shared/enums/user-type.enum';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {environment} from '../environments/environment';
import {DateTime} from '@sharedModule/models/date-time';
import {UtilityService} from '@sharedModule/services/utility.service';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {CEPOnboardingStateEnum} from '@groupAdminModule/campaigns/_enums/CEP-onboarding-state.enum';
import Auth from '@aws-amplify/auth';
import {GroupsService} from '@sharedModule/services/groups.service';

declare var window: any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent implements OnDestroy, OnInit {
	public showCustomNotificationDialog: boolean = false;
	public lazyLoadingModule: boolean = false;
	public isPublicURL = false;
	@HostListener('click', ['$event.target'])
	onClick(event) {
		this.setUserSession();
	}

	@HostListener('window:keyup', ['$event'])
	onkeyPress(event) {
		this.setUserSession();
	}

	constructor(
		injector: Injector,
		private readonly _ngZone: NgZone,
		private readonly router: Router,
		private readonly userService: UserService,
		private readonly notificationService: NotificationService,
		private readonly alertService: AlertService,
		private readonly securedStorage: SecuredStorageProviderService,
		private readonly utility: UtilityService,
		private toastr: ToastrService,
		private readonly adminBioService: AdminBioService,
		private readonly groupPagesService: GroupProfilePagesService,
		private readonly groupsService: GroupsService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.logger.init();
		this.notificationService.init();
		this.userService.init();
		this.setUserSession();
		this.appService.ifPlatformAndroidHideWebEngagePrompt();
		Hub.listen('auth', async event => {
			this.logger.debug('Hub Auth subscription fired', {event: event.payload.event}, 'AppComponent', 'ngOnInit');
			switch (event.payload.event) {
				case 'signIn':
					this._ngZone.run(() => this.userService.refreshUser());
					break;
			}
		});

		this.subscriptionsToDestroy.concat([
			this.router.events.subscribe((event: RouterEvent) => {
				this.isPublicURL = event?.url?.includes('public');
				if (event instanceof NavigationStart) {
					this.appService.currentPageUrl.next(event.url);
					const tree = this.router.getCurrentNavigation().extractedUrl;
					this.utility.copyQuerystringParametersIntoSessionStorage(tree.queryParams);

					if (tree.fragment) {
						this.appService.setPageFragment(tree.fragment);
						const data = this.router.url.split('/').pop();
						const fragment = data.split('#')[0];
						if (event.url.includes('/group/')) {
							this.appService.setGroupPageUrl(fragment);
						}
					}
					if (
						event.url != undefined &&
						event.url.includes('/group/') &&
						event.url &&
						(tree.fragment == null || tree.fragment == undefined)
					) {
						this.appService.setGroupPageUrl(this.router.url.split('/').pop());
					}
					this.checkIfRedirectUrlPresentInSession();
					this.lazyLoadingModule = true;
				}
				if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
					this.lazyLoadingModule = false;
				}
			}),
			this.userService.isLoggedIn.subscribe(loggedInStatus => this.processLoginStatus(loggedInStatus)),
			this.alertService.getAlert().subscribe(alert => this.notify(alert))
		]);
	}

	setUserSession() {
		if (this.securedStorage.getCookie('sessionStartedAtUTC')) {
			this.securedStorage.setCookie('sessionStartedAtUTC', 'true', 0.042);
		} else {
			this.logger.info(
				'user_session_started',
				{session_started_time: new DateTime().toISOString()},
				'AppComponent',
				'setUserSession'
			);
			this.securedStorage.setCookie('sessionStartedAtUTC', 'true', 0.042);
		}
	}

	checkIfRedirectUrlPresentInSession() {
		const redirectUrl = this.securedStorage.getSessionStorage('redirectUrlFBPermission');
		if (redirectUrl) {
			this.securedStorage.removeSessionStorage('redirectUrlFBPermission');
			this.router.navigateByUrl(redirectUrl);
		} else {
			return;
		}
	}

	async processLoginStatus(loggedInStatus: Boolean) {
		if (loggedInStatus === null) {
			return;
		}

		const url = window.location.href;
		if (!loggedInStatus) {
			if (url === environment.baseUrl) {
				window.location.href = environment.landingPageUrl;
			}
			if (url.indexOf('brand/') > -1) {
				this.router.navigate(['/brand-login/']);
			} else if (url.indexOf('group-admin/') > -1) {
				this.securedStorage.setSessionStorage('redirectUriPostLogin', this.appService.currentPageUrl.getValue());
				this.userService.signIn();
			} else if (url.indexOf('cs-admin/') > -1) {
				this.router.navigateByUrl('cs-admin-login');
			}
		} else {
			this.securedStorage.expireCookie('storageClearedForLoginRetry');
			const customOAuthStateFromCookies = JSON.parse(
				decodeURIComponent(this.securedStorage.getCookie('login_through_OAuthState'))
			);

			if (customOAuthStateFromCookies) {
				this.processRedirectToCS2PublicPage(customOAuthStateFromCookies);
				return;
			}

			const customOAuthState = JSON.parse(this.securedStorage.getSessionStorage('login_through_OAuthState'));
			if (url.indexOf('public/') > -1) {
				return;
			}

			const user = await this.userService.getUser();
			// if (user.isBetaUser) {
			// 	const widget = await markerSDK.loadWidget({destination: '618cb03d40d999035e51f8b7'});
			// 	widget.on('load', () => widget.show());
			// }

			if (customOAuthState) {
				this.processRedirectionToAdminPublicPage(customOAuthState);
				return;
			}

			const isRedirectUrlPresentInSession = this.securedStorage.getSessionStorage('redirectUriPostLogin');

			if (isRedirectUrlPresentInSession) {
				this.processRedirectToPageBeforeLogout(isRedirectUrlPresentInSession);
				return;
			}

			if (url.indexOf('brand/') === -1 && url.indexOf('group-admin/') === -1 && url.indexOf('cs-admin/') === -1) {
				if (user.userType === UserTypeEnum.GroupMember) {
					try {
						if (this.securedStorage.getSessionStorage('queryString')) {
							const queryString = JSON.parse(this.securedStorage.getSessionStorage('queryString'));
							if (Object.keys(queryString).length === 0) {
								this.router.navigate(['/group-admin/manage']);
							}
							if (queryString.qs_open_wa_popup) {
								this.router.navigateByUrl('/group-admin/settings?open_wa_popup=true');
							} else if (queryString.qs_admin_journey) {
								this.router.navigateByUrl('group-admin/settings/admin-bio?ref=open_admin_bio_popup');
							} else if (queryString.qs_group_journey) {
								const groupWithProfilePageAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
									(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
								);
								if (groupWithProfilePageAccess && groupWithProfilePageAccess.length > 0) {
									setTimeout(() => {
										this.router.navigateByUrl(
											`/group-admin/campaigns/${groupWithProfilePageAccess[0].id}/profile-pages#groupProfile`
										);
										return;
									});
								} else {
									this.router.navigate(['/group-admin/manage']);
								}
							}
						} else {
							this.router.navigate(['/group-admin/manage']);
						}
					} catch (e) {
						this.router.navigate(['/group-admin/manage']);
						// Swallow the error here
					}
				} else if (user.userType === UserTypeEnum.CSAdmin) {
					this.router.navigate(['/cs-admin/manage-brands']);
				} else {
					this.router.navigate(['/brand/']);
				}
			}
		}
	}

	async processRedirectToCS2PublicPage(data) {
		try {
			if (data.login_from === 'cs2.0-admin-bio' || data.login_from === 'cs2.0-group-profile') {
				this.securedStorage.setCookie('login_through_OAuthState', '', (1 / 1440) * 0.2, '.convosight.com');
				const fbJwtToken = await (await Auth.currentSession()).getIdToken().getJwtToken();

				this.securedStorage.setCookie('fbToken', fbJwtToken, 0.5, '.convosight.com');

				window.location.href = data.url;
			}
			if (data.login_from === 'cs2.0-group-profile-review-flow') {
				await this.userService.refreshUser();
				const fbJwtToken = await (await Auth.currentSession()).getIdToken().getJwtToken();

				this.securedStorage.setCookie('fbToken', fbJwtToken, 0.5, '.convosight.com');

				window.location.href = data.url;
			}
			if (data && data.login_from === 'GroupProfileCTA') {
				this.securedStorage.setCookie('login_through_OAuthState', '', (1 / 1440) * 0.1, '.convosight.com');

				const groupWithProfilePageAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
					(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
				);
				if (groupWithProfilePageAccess && groupWithProfilePageAccess.length > 0) {
					setTimeout(() => {
						this.router.navigateByUrl(
							`/group-admin/campaigns/${groupWithProfilePageAccess[0].id}/profile-pages#groupProfile`
						);
						return;
					});
				} else {
					setTimeout(() => {
						this.router.navigateByUrl('/group-admin/manage');
					});
					return;
				}
			}
		} catch (err) {
			// debugger message
			this.logger.error(
				err,
				'Error while process redirect to cs2.0',
				{},
				'AppComponent',
				'processRedirectToCS2PublicPage'
			);
		}
	}

	async processRedirectionToAdminPublicPage(data) {
		try {
			const user = await this.userService.getUser();
			if (data.adminId === user.id) {
				this.logger.info('hearts_given_themself', {}, 'AppComponent', 'ngOnInit');
			}
			if (data && data.login_from === 'AdminBioKudos') {
				const kudos = await this.adminBioService.updateKudos(data.adminId);
				if (kudos.added) {
					this.logger.info(
						'hearts_given',
						{
							kudos_count: kudos.kudos,
							post_login: true,
							admin_id: data.adminId,
							admin_name: data.adminName
						},
						'AppComponent',
						'ngOnInit'
					);
					this.adminBioService.showThankYouPopup = true;
				} else {
					this.logger.info(
						'hearts_removed',
						{
							kudos_count: kudos.kudos,
							post_login: true,
							admin_id: data.adminId,
							admin_name: data.adminName
						},
						'AppComponent',
						'ngOnInit'
					);
				}
				this.appService.hideGroupsAddedToastMessage = true;
				setTimeout(() => {
					this.router.navigateByUrl(`/public/admin/${data.adminId}`);
				});
			}
			if (data && data.login_from === 'CreateABio') {
				if (user && (user.adminBioContactPhoneNumber || user.adminBioContactEmail)) {
					setTimeout(() => {
						this.router.navigateByUrl('group-admin/settings/admin-bio?ref=open_admin_bio_popup');
					});
					return;
				}

				this.adminBioService.showAdminBioContactPopup = true;
				setTimeout(() => {
					this.router.navigateByUrl(`/public/admin/${data.adminId}`);
				});
			}
			if (data && data.login_from === 'GroupProfileCTA') {
				const groupWithProfilePageAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
					(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
				);
				if (groupWithProfilePageAccess && groupWithProfilePageAccess.length > 0) {
					setTimeout(() => {
						this.router.navigateByUrl(
							`/group-admin/campaigns/${groupWithProfilePageAccess[0].id}/profile-pages#groupProfile`
						);
						return;
					});
				} else {
					setTimeout(() => {
						this.router.navigateByUrl('/group-admin/manage');
					});
					return;
				}
			}
			if (data && data.login_from === 'public_group_profile') {
				console.log(data, '=======Review Data=======');
				// const groupProfileData = await this.groupPagesService.
				setTimeout(() => {
					this.router.navigateByUrl(`/public/group-profile/${data.profileId}?utm_source=ShareButtonGroupProfile`);
				});
			}
		} catch (e) {
			// debugger message
			this.logger.error(e, 'Error while giving hearts to user profile', {}, 'AppComponent', 'ngOnInit');
			if (e.errors[0].message === 'invalid target user id') {
				this.adminBioService.errorToastAdminKudosItself = true;
			}
			this.appService.hideGroupsAddedToastMessage = true;
			this.router.navigateByUrl(`/public/admin/${data.adminId}`);
		}
	}

	async processRedirectToPageBeforeLogout(redirectUrl) {
		setTimeout(() => {
			this.securedStorage.removeSessionStorage('redirectUriPostLogin');
			this.router.navigateByUrl(`${redirectUrl}`);
		});
	}

	async ngOnDestroy() {
		super._ngOnDestroy();
	}

	private notify(alert: AlertModel) {
		if (alert) {
			this.toastr[alert.type.toString()](alert.message, alert.title, {
				timeOut: alert.autoHide,
				disableTimeOut: alert.autoHide === 0,
				toastClass: 'ngx-toastr-custom'
			});
		}
	}
}
