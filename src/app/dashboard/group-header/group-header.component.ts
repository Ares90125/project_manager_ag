import {Component, ElementRef, HostListener, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {skipWhile, tap} from 'rxjs/operators';
import {NotificationModel} from '@sharedModule/models/notification.model';
import {UserModel} from '@sharedModule/models/user.model';
import {NotificationService} from '@sharedModule/services/notification.service';
import {UserService} from '@sharedModule/services/user.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {DateTime} from '@sharedModule/models/date-time';
import {GroupsService} from '@sharedModule/services/groups.service';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';

declare var window: any;

@Component({
	selector: 'app-group-header',
	templateUrl: './group-header.component.html',
	styleUrls: ['./group-header.component.scss']
})
export class GroupHeaderComponent extends BaseComponent implements OnInit, OnDestroy {
	updateNotificationInProgress: boolean = false;

	@ViewChild('notificationWrapper') notificationWrapper: ElementRef;
	@Input() user: UserModel;
	notificationBadgeCount = null;
	notification$: Observable<NotificationModel[]>;
	unreadNotificationCount = null;
	private now = new DateTime();
	isCommunity = false;
	isPublish = false;
	isGroup = false;
	isAdminCampaign = false;
	showPrivacyPopup = false;
	showSchedulePostLink = false;
	showGroupHeaderLink = false;
	showCampaignLink = false;
	showNotificationBell = false;
	userProfilePic;
	installedGroups;
	adminBio;
	isNotification: boolean = false;
	triggerModal: boolean = false;
	previewImage;
	@ViewChild('tooltip') tooltip;
	@HostListener('document:scroll', ['$event'])
	scrollOut(event) {
		if (this.tooltip) {
			this.tooltip.hide();
		}
	}
	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly router: Router,
		private readonly notificationService: NotificationService,
		private readonly facebookService: FacebookService,
		public groupService: GroupsService,
		private readonly adminBioService: AdminBioService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.previewImage = 'assets/images/default_user.png';
		this.activeRoute(null);
		this.getUserProfilePic();
		if (!this.userService.userJustSignedUp.getValue()) {
			this.adminBioService.init();
		}
		this.subscriptionsToDestroy.concat(
			this.headerService.changeInHeader$.subscribe(data => {
				if (!data) {
					return;
				}
				this.showCampaignLink = data.showCampaignLinkInHeader ? data.showCampaignLinkInHeader : this.showCampaignLink;
				this.showSchedulePostLink = data.showScheduleLinkInHeader
					? data.showScheduleLinkInHeader
					: this.showSchedulePostLink;
				this.showGroupHeaderLink = data.showGroupLinkInHeader ? data.showGroupLinkInHeader : this.showGroupHeaderLink;
				this.showNotificationBell = data.showNotificationBellInHeader
					? data.showNotificationBellInHeader
					: this.showNotificationBell;
			}),
			this.adminBioService.currentDraftAdminBioData$.subscribe(data => {
				this.adminBio = data;
			})
		);

		this.notification$ = this.notificationService.notifications.pipe(
			skipWhile(notifications => !notifications),
			tap(notifications => {
				this.unreadNotificationCount = notifications.filter(notification => !notification.viewedAtUTC).length;
				if (this.unreadNotificationCount > 99) {
					this.notificationBadgeCount = 99;
				} else {
					this.notificationBadgeCount = this.unreadNotificationCount;
				}
			})
		);

		this.subscriptionsToDestroy.push(this.notification$.subscribe());
		setInterval(() => (this.now = new DateTime()), 1000);
	}

	goToPublishPage() {
		this.router.navigateByUrl(`/group-admin/publish/${this.groupService.selectedGroupid}/scheduledposts`);
	}

	async markAllNotificationsRead() {
		if (this.notificationBadgeCount === 0 || this.updateNotificationInProgress) {
			return;
		}
		this.updateNotificationInProgress = true;
		await this.notificationService.markAllNotificationsAsRead();
		this.updateNotificationInProgress = false;
	}

	async getUserProfilePic() {
		this.userProfilePic = await this.facebookService.getProfilePicture(this.user.fbUserId);
	}

	showDefaultUserImage(event) {
		this.getUserProfilePic();
	}

	redirectToEditAdmin() {
		this.router.navigateByUrl('group-admin/settings/admin-bio?ref=open_admin_bio_popup');
	}

	openFreshChat() {
		window.fcWidget.open();
		window.fcWidget.show();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	activeRoute(element) {
		if (element) {
			this.recordButtonClick(element);
		}
		// const url = this.appService.currentPageUrl.getValue().split('/');
		this.appService.currentPageUrl.subscribe(pageUrl => {
			const url = pageUrl.split('/');

			if (url[2] === 'settings') {
				this.isPublish = false;
				this.isGroup = false;
				this.isAdminCampaign = false;
				this.isNotification = false;
			} else if (url[2] === 'publish' || url[2] === 'postanalytics' || url[2] === 'post' || url[2] === 'admin') {
				this.isPublish = true;
				this.isGroup = false;
				this.isAdminCampaign = false;
				this.isNotification = false;
			} else if (url[2] === 'manage' || url[2] === 'group') {
				this.isPublish = false;
				this.isAdminCampaign = false;
				this.isGroup = true;
				this.isNotification = false;
			} else if (url[2] === 'manage') {
				this.isGroup = true;
				this.isAdminCampaign = false;
				this.isNotification = false;
			} else if (url[2] === 'campaigns') {
				this.isGroup = false;
				this.isPublish = false;
				this.isAdminCampaign = true;
				this.isNotification = false;
			} else if (this.appService.currentPageUrl.getValue().includes('/manage?')) {
				this.isGroup = true;
				this.isAdminCampaign = false;
				this.isNotification = false;
			} else if (url[2] === 'notifications') {
				this.isGroup = false;
				this.isPublish = false;
				this.isAdminCampaign = false;
				this.isNotification = true;
			}
		});
	}

	navigateHome() {
		this.router.navigate(['/group-admin/manage']);
	}

	showPrivacyPolicyPopup(element) {
		this.recordButtonClick(element);
		this.showPrivacyPopup = true;
	}

	closePrivacyPolicy(event) {
		this.showPrivacyPopup = false;
	}

	async signOut(element) {
		this.recordButtonClick(element);
		await this.userService.logOut();
	}

	toLandingPage(element) {
		this.recordButtonClick(element);
		this.router.navigateByUrl('/group-admin/manage');
		this.activeRoute(element);
	}
}
