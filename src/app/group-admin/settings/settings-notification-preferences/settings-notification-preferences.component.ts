import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {Subscription} from 'rxjs';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {AccountSettingsService} from '@groupAdminModule/_services/account-settings.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';

@Component({
	selector: 'app-settings-notification-preferences',
	templateUrl: './settings-notification-preferences.component.html',
	styleUrls: ['./settings-notification-preferences.component.scss']
})
export class SettingsNotificationPreferencesComponent extends BaseComponent implements OnInit, OnDestroy {
	groups: GroupModel[];
	isEmailPrefOn;
	isWhatsAppPrefOn;
	filterValue;
	user: UserModel;
	searchResults;
	searchText;
	protected subscriptionsToDestroy: Subscription[] = [];
	mobileSearch = false;
	showConfirmation = false;
	showDidNotRecievedPopup = false;
	isLoadingWhatsAppSubscriptionRequest = false;
	isLoadingEmailSubscriptionRequest = false;

	constructor(
		injector: Injector,
		public router: Router,
		private readonly groupService: GroupsService,
		private readonly userService: UserService,
		private readonly accountSettingsService: AccountSettingsService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.filterValue = 'all';
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(async user => {
				if (user === null) {
					return;
				}
				this.user = user;
				this.isEmailPrefOn = this.user.receiveEmailNotifications;
				this.isWhatsAppPrefOn = this.user.receiveWANotifications;
			})
		);
		this.groupService.init();
		this.groupService.groups.subscribe(groups => {
			if (groups === null) {
				return;
			}
			this.groups = groups.filter(group => group.state === GroupStateEnum.Installed);
		});
		this.onFilterChange('all');
	}

	async onSearchChange(searchValue) {
		if (searchValue !== '') {
			searchValue = searchValue.value.toLowerCase();
		}
		this.groups.forEach(group => {
			group.hide = !(group.name.toLowerCase().indexOf(searchValue) > -1 || searchValue === '');
		});
		this.searchResults = this.groups.filter(group => !group.hide);
		this.searchText = searchValue;
	}

	onFilterChange(value) {
		if (value === 'whatsApp') {
			this.filterValue = 'whatsApp';
			this.groups.forEach(group => {
				group.hide = !group.receiveWANotifications;
			});
		} else if (value === 'email') {
			this.filterValue = 'email';
			this.groups.forEach(group => {
				group.hide = !group.receiveEmailNotifications;
			});
		} else if (value === 'muted') {
			this.filterValue = 'muted';
			this.groups.forEach(group => {
				if (!this.user.receiveWANotifications || this.user.whatsappSubscriptionStatus !== 'Confirmed') {
					group.hide = group.receiveEmailNotifications;
				} else if (!this.user.receiveEmailNotifications) {
					group.hide = group.receiveWANotifications;
				} else {
					group.hide = group.receiveWANotifications || group.receiveEmailNotifications;
				}
			});
		} else if (value === 'all') {
			this.filterValue = 'all';
			this.groups.forEach(group => {
				group.hide = false;
			});
		}
	}

	ShowMobileSearch() {
		this.mobileSearch = true;
	}

	hideMobileSearch() {
		this.mobileSearch = false;
	}

	toggleCheckboxWrapper(event) {
		const elem = event.currentTarget;
		elem.classList.toggle('active');
		const targetElement = event.currentTarget.nextSibling;
		targetElement.style.display = targetElement.style.display === 'none' ? 'flex' : 'none';
	}

	async togglePreference(prefType, event, group) {
		document.getElementById('checkbox_' + prefType + '_' + group.id).style.display = 'none';
		document.getElementById('spinner_' + prefType + '_' + group.id).style.display = 'block';
		let isEmailPreferenceOnForGroup;
		let isWhatsAppPreferenceOnForGroup;
		let input = [];
		if (prefType === 'email') {
			isEmailPreferenceOnForGroup = !group.receiveEmailNotifications;
			isWhatsAppPreferenceOnForGroup = group.receiveWANotifications;
		}
		if (prefType === 'whatsApp') {
			isEmailPreferenceOnForGroup = group.receiveEmailNotifications;
			isWhatsAppPreferenceOnForGroup = !group.receiveWANotifications;
		}
		input.push({
			groupId: group.id,
			receiveWANotifications: isWhatsAppPreferenceOnForGroup,
			receiveEmailNotifications: isEmailPreferenceOnForGroup
		});
		try {
			await this.accountSettingsService.updateNotificationPreference(input);
			document.getElementById('checkbox_' + prefType + '_' + group.id).style.display = 'block';
			document.getElementById('spinner_' + prefType + '_' + group.id).style.display = 'none';
			if (prefType === 'email') {
				this.groups.find(x => group === x).receiveEmailNotifications = isEmailPreferenceOnForGroup;
			} else if (prefType === 'whatsApp') {
				this.groups.find(x => group === x).receiveWANotifications = isWhatsAppPreferenceOnForGroup;
			}
		} catch (e) {
			document.getElementById('checkbox_' + prefType + '_' + group.id).style.display = 'block';
			document.getElementById('spinner_' + prefType + '_' + group.id).style.display = 'none';
		}
	}

	async togglePreferenceForUser(prefType) {
		if (prefType === 'email') {
			this.isLoadingEmailSubscriptionRequest = true;
			await this.userService.updateNotificationPreferences({
				cognitoId: this.user.cognitoId,
				receiveEmailNotifications: !this.user.receiveEmailNotifications
			});
			this.logger.setUserProperty(this.user.id, {
				email_opt_in: !this.user.receiveEmailNotifications
			});
			this.isLoadingEmailSubscriptionRequest = false;
		} else if (prefType === 'whatsApp') {
			this.isLoadingWhatsAppSubscriptionRequest = true;
			await this.userService.updateNotificationPreferences({
				cognitoId: this.user.cognitoId,
				receiveWANotifications: !this.user.receiveWANotifications
			});
			this.isLoadingWhatsAppSubscriptionRequest = false;
		}
	}

	setGlobalPreference() {
		if (
			!this.user.receiveEmailNotifications &&
			(!this.user.receiveWANotifications || this.user.whatsappSubscriptionStatus !== 'Confirmed')
		) {
			this.userService.updateNotificationPreferences({
				cognitoId: this.user.cognitoId,
				receiveNotifications: false
			});
		}
	}

	hideWAConfirmOptInCard() {
		this.showConfirmation = false;
		($('#convosight-whatsapp-opt') as any).modal('hide');
	}

	hideWhatsAppOverlay() {
		this.showConfirmation = false;
		($('#convosight-whatsapp-opt') as any).modal('hide');
	}

	didNotReceiveCardStatus(event) {
		this.showDidNotRecievedPopup = event;
	}

	openSubscribeNowOverlay(element) {
		this.recordButtonClick(element);
		// To open the modal
		($('#convosight-whatsapp-opt') as any).modal('show');
	}
}
