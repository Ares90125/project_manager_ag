import {Injectable} from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NotificationModel} from '../models/notification.model';
import {AmplifyAppSyncService} from './amplify-app-sync.service';
import {LoggerService} from './logger.service';
import {UserService} from './user.service';
import {GroupsService} from './groups.service';
import {DateTime} from '@sharedModule/models/date-time';
import {Notifications} from '@sharedModule/models/graph-ql.model';
import {Router} from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	public notifications = new BehaviorSubject<NotificationModel[]>(null);
	private userId: string = null;
	private _isInitialized = false;
	private _nextToken: string = null;
	private _notificationsSubscription: Subscription = null;

	constructor(
		private readonly appSync: AmplifyAppSyncService,
		private readonly loggerService: LoggerService,
		private readonly userService: UserService,
		private groupsService: GroupsService,
		private router: Router
	) {}

	public init() {
		if (this._isInitialized) {
			return;
		}

		this._isInitialized = true;

		this.userService.isLoggedIn.subscribe(async loggedInStatus => {
			if (loggedInStatus === null) {
				return;
			}

			this.loggerService.debug('Change in login status', {loggedInStatus}, 'NotificationService', 'init');

			if (loggedInStatus) {
				this.userId = (await this.userService.getUser()).id;
				this.subscribeToUserNotifications();
				this.getUserNotifications();
			}
		});

		// re-connect on web socket close
		this.appSync.websocketClosed.subscribe(() => this.subscribeToUserNotifications());
	}

	async getUserNotifications(limit = 25) {
		let totalNotificationsFetched = this.notifications.getValue();
		let notifications = await this.appSync.GetNotifications(this.userId, limit, this._nextToken);
		this._nextToken = notifications.nextToken;

		if (notifications.items.length < 1 && this._nextToken === null) {
			if (totalNotificationsFetched === null) {
				this.notifications.next([]);
			}
			return;
		}

		const notificationsObject = notifications.items.map(
			notification =>
				new NotificationModel(notification, this.groupsService, this.loggerService, this.userService, this.router)
		);
		totalNotificationsFetched = totalNotificationsFetched
			? totalNotificationsFetched.concat(notificationsObject)
			: notificationsObject;
		this.notifications.next(totalNotificationsFetched);
		if (this._nextToken !== null && totalNotificationsFetched.length < 10) {
			this.getUserNotifications(100);
		}
	}

	addNotification(notification: Notifications) {
		if (notification.channelsToSkip?.includes('InApp')) {
			return;
		}
		this.notifications.next(
			[
				new NotificationModel(notification, this.groupsService, this.loggerService, this.userService, this.router)
			].concat(this.notifications.getValue())
		);
	}

	public async markAllNotificationsAsRead() {
		const timeNow = new DateTime().toISOString();
		const updateNotificationRequests = [];
		const notificationsAlreadyRead: NotificationModel[] = this.notifications
			.getValue()
			.filter(notification => notification.viewedAtUTC);
		const notificationsToBeUpdated: NotificationModel[] = this.notifications
			.getValue()
			.filter(notification => !notification.viewedAtUTC);

		notificationsToBeUpdated
			.map(notification => {
				const _notification: any = {};
				_notification.viewedAtUTC = timeNow;
				_notification.createdAtUTCTick = notification.createdAtUTCTick;
				_notification.forUserId = notification.forUserId;
				return _notification;
			})
			.forEach(notification => {
				updateNotificationRequests.push(this.appSync.UpdateNotifications(notification));
			});
		const updatedNotifications = await Promise.all(updateNotificationRequests);

		const notificationsRecentlyRead = updatedNotifications.map(
			notification =>
				new NotificationModel(notification, this.groupsService, this.loggerService, this.userService, this.router)
		);
		const notificationsList = notificationsRecentlyRead.concat(notificationsAlreadyRead);
		notificationsList.sort((a, b) => new Date(b.createdAtUTC).getTime() - new Date(a.createdAtUTC).getTime());
		this.notifications.next(notificationsList);
	}

	private subscribeToUserNotifications(retryTimeout: number = 1000) {
		try {
			this._notificationsSubscription = this.appSync.OnCreateNotificationsListener(this.userId).subscribe({
				next: (data: any) => this.addNotification(data.value.data.onCreateNotifications),
				error: error => this.handleSubscriptionErrors(error, retryTimeout)
			}) as Subscription;
		} catch (e) {
			this.loggerService.error(
				e,
				'Error in subscribing to notifications',
				null,
				'NotificationService',
				'subscribeToUserNotifications'
			);
		}
	}

	private handleSubscriptionErrors(error: any, retryTimeout: number) {
		this._notificationsSubscription.unsubscribe();

		setTimeout(async () => {
			if (await this.userService.refreshAuthStatus()) {
				this.subscribeToUserNotifications(retryTimeout * 2);
			}
		}, retryTimeout);
	}
}
