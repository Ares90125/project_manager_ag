import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {skipWhile, tap} from 'rxjs/operators';
import {NotificationModel} from '@sharedModule/models/notification.model';
import {NotificationService} from '@sharedModule/services/notification.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-group-notifications',
	templateUrl: './group-notifications.component.html',
	styleUrls: ['./group-notifications.component.scss']
})
export class GroupNotificationsComponent extends BaseComponent implements OnInit, OnDestroy {
	notification$: Observable<NotificationModel[]>;
	unreadNotificationCount = null;
	showNotifications = false;
	showAllNotifications = false;

	constructor(
		injector: Injector,
		private readonly router: Router,
		private readonly notificationService: NotificationService,
		public groupService: GroupsService,
		private readonly userService: UserService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.notification$ = this.notificationService.notifications.pipe(
			skipWhile(notifications => !notifications),
			tap(notifications => {
				this.unreadNotificationCount = notifications.filter(notification => !notification.viewedAtUTC).length;
			})
		);

		this.subscriptionsToDestroy.push(this.notification$.subscribe());
	}

	goToNotificationRoute(notification, element) {
		let notificaton = new NotificationModel(
			notification,
			this.groupService,
			this.logger,
			this.userService,
			this.router
		);
		this.recordButtonClick(element, null, notification.type);
		notification.navigateToNotificationLink();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	closeNotificationList(event) {
		this.showAllNotifications = !this.showAllNotifications;
	}
}
