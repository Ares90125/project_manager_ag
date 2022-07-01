import {NotificationPriority} from 'src/app/shared/enums/notification-priority.enum';
import {NotificationType} from '@sharedModule/enums/notification-type.enum';
import {Notifications} from '@sharedModule/models/graph-ql.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {DateTime} from '@sharedModule/models/date-time';
import {Router} from '@angular/router';
import {UserService} from '@sharedModule/services/user.service';
import {WhatsappOptInStatusEnum} from '@sharedModule/enums/whatsapp-type.enum';

export class NotificationModel {
	id: string;
	inAppTitle: string;
	forUserId: string;
	status: NotificationPriority;
	createdAtUTC: string;
	private createdAt: DateTime;
	private notificationLoadedAt: DateTime;
	createdAtUTCTick: string;
	viewedAtUTC: string;
	type: NotificationType;
	channelsToSkip: [string];
	showLink: boolean;
	link: string;
	payload: any;
	timeFromX: string;
	whatsappStatus;

	constructor(
		private _data: Notifications,
		private groupsService: GroupsService,
		private loggerService: LoggerService,
		private userService: UserService,
		private router: Router
	) {
		Object.assign(this, _data);
		this.processMetaData();
		this.initiateTimeFromXCal();
	}

	private initiateTimeFromXCal() {
		this.notificationLoadedAt = new DateTime();
		this.createdAt = new DateTime(this.createdAtUTC);
		setInterval(() => (this.timeFromX = this.createdAt.from(this.notificationLoadedAt.dayJsObj)), 1000);
	}

	public navigateToNotificationLink() {
		this.type !== NotificationType.PostWentLive
			? this.router.navigateByUrl(this.link)
			: window.open(
					this.link,
					'popUpWindow',
					'height=660,width=680,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes'
			  );
		return;
	}

	async processMetaData() {
		try {
			if (typeof this.payload === 'string') {
				this.payload = JSON.parse(this.payload);
			}
		} catch (e) {
			const error = new Error('Error in parsing metadata of the notification');
			this.loggerService.error(error, error.message, {metadata: this.payload}, 'NotificationModel', 'processMetaData');
			this.showLink = false;
			return;
		}

		const managePageLink = `/group-admin/manage`;
		const groupDetailsPageLink = '/group-admin/group/';

		try {
			switch (this.type) {
				case NotificationType.ConvosightNotInstalledOnAllGroups:
				case NotificationType.CsAppAdded:
				case NotificationType.UninstallationOfAppCompleted:
					this.showLink = true;
					this.link = managePageLink;
					break;
				case NotificationType.InstallationOfAppCompleted:
				case NotificationType.InstallationOfAppCompletedV2:
					this.showLink = true;
					this.link = groupDetailsPageLink + this.payload.group_id + '/overview';
					break;
				case NotificationType.UrgentAlerts:
					const groupId = this.payload.group_id ? this.payload.group_id : this.payload.groupId;
					const groupName = this.payload.group_name
						? this.payload.group_name
						: (await this.groupsService.getGroupDetails(groupId)).name;
					this['message'] = `New Keyword alerts for <b>${groupName}</b>`;
					this.showLink = true;
					this.link = groupDetailsPageLink + groupId + '/urgentAlerts';
					break;
				case NotificationType.UserCampaignTasksCreated:
					this.showLink = true;
					if (this.payload.groupId) {
						this.link = '/group-admin/campaigns/' + this.payload.groupId + '/' + this.payload.campaign_id;
					} else {
						this.link = '/group-admin/campaigns/' + this.payload.campaign_id;
					}
					break;
				case NotificationType.UserCampaignTasksReminder:
					this.showLink = true;
					if (this.payload.groupId) {
						this.link = '/group-admin/campaigns/' + this.payload.groupId + '/' + this.payload.campaign_id;
					} else {
						this.link = '/group-admin/campaigns/' + this.payload.campaign_id;
					}
					break;
				case NotificationType.PostWentLive:
					this.showLink = true;
					this.link = this.payload.fb_permalink_url;
					break;
				case NotificationType.CampaignInvitation:
					this.showLink = true;
					if (this.payload.groupId) {
						this.link = '/group-admin/campaigns/' + this.payload.groupId + '/' + this.payload.campaignId;
					} else {
						this.link = '/group-admin/campaigns/' + this.payload.campaignId;
					}
					break;
				case NotificationType.WelcomeDeviceNotification:
					this.whatsappStatus = (await this.userService.getUser()).whatsappSubscriptionStatus;
					this.showLink = true;
					this.link =
						this.whatsappStatus === WhatsappOptInStatusEnum.Confirmed ||
						this.whatsappStatus === WhatsappOptInStatusEnum.PendingConfirmation
							? groupDetailsPageLink
							: '/group-admin/settings?open_wa_popup=true';
					break;
				case NotificationType.ConvosightV2Announcement:
				case NotificationType.AdminBioInComplete:
					this.showLink = true;
					this.link = '/group-admin/settings/admin-bio?ref=open_admin_bio_popup';
					break;
				default:
					this.showLink = false;
					break;
			}
		} catch (e) {
			const error = new Error('Error fetching metadata for this');
			this.loggerService.error(
				error,
				'Error fetching metadata for notification',
				{notificationType: this.type},
				'NotificationService',
				'getLinkForNotification'
			);
		}
	}
}
