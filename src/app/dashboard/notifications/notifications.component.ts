import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NotificationService} from '@sharedModule/services/notification.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {DateTime} from '@sharedModule/models/date-time';
import {NotificationModel} from '@sharedModule/models/notification.model';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() notification$: BehaviorSubject<NotificationModel[]>;
	@Output() closeNotificationList = new EventEmitter<boolean>();

	public scrollHandler = new Subject<string>();
	public isNotificationLoading = false;

	constructor(injector: Injector, private readonly notificationService: NotificationService) {
		super(injector);
	}

	ngOnInit() {
		this.getNotifications();
		this.subscriptionsToDestroy.push(
			this.scrollHandler
				.pipe(
					tap(term => {
						const element = document.getElementById('notification-list');
						const percentageScrolled = (element.scrollTop / element.scrollHeight) * 100;
						if (percentageScrolled > 95 && !this.isNotificationLoading) {
							this.getNotifications();
						}
					})
				)
				.subscribe()
		);
	}
	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	async getNotifications() {
		this.isNotificationLoading = true;
		await this.notificationService.getUserNotifications(100);
		this.notification$ = this.notificationService.notifications;
		this.isNotificationLoading = false;
	}

	timeFromX(date: string) {
		return new DateTime(date).from(new DateTime().dayJsObj);
	}

	closeNotification() {
		this.closeNotificationList.emit(true);
	}
}
