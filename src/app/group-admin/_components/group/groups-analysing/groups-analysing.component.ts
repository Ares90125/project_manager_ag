import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {PushNotificationService} from '@sharedModule/services/push-notification.service';
import {GroupModel} from '@sharedModule/models/group.model';

@Component({
	selector: 'app-groups-analysing',
	templateUrl: './groups-analysing.component.html',
	styleUrls: ['./groups-analysing.component.scss']
})
export class GroupsAnalysingComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Input() type: string;
	title: string;

	showNotifyButton = false;

	constructor(injector: Injector, private readonly pushNotificationService: PushNotificationService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.pageLogAndUpdateTitle(this.type);
		this.showNotifyButton = this.pushNotificationService.checkIfToShowCustomNotificationDialog();
	}

	pageLogAndUpdateTitle(type) {
		switch (type) {
			case 'Statistics':
				this.title = 'Group analysis has started and Dashboard would be ready soon.';
				break;
			case 'ConversationTrends':
				this.title = "Group analysis has started and Conversations Trend's would be ready soon.";
				break;
			case 'PostTrends':
				this.title = "Group analysis has started and Post Trend's would be ready soon.";
				break;
			case 'UrgentAlerts':
				this.title = 'Group analysis has started and Urgent Alerts would be ready soon.';
				break;
		}
	}

	showNotificationPrompt(element) {
		this.recordButtonClick(element, this.group);
		this.pushNotificationService.showBrowserNotificationPrompt();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
