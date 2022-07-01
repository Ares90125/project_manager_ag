import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {ButtonState} from '@sharedModule/enums/button-state.enum';
import {UserModel} from '@sharedModule/models/user.model';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {UserService} from '@sharedModule/services/user.service';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-add-app-dialog-component',
	templateUrl: './add-app-dialog-component.component.html',
	styleUrls: ['./add-app-dialog-component.component.scss']
})
export class AddAppDialogComponentComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
	@Input() groups: any[];
	@Output() closeAddAppToGroup = new EventEmitter<boolean>();
	showHowToAddGroupPopup = false;
	addedGroupCount = 0;
	user: UserModel;
	showMobileInstallationOverlay = false;
	hideAddAppOverlay = false;

	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly groupsService: GroupsService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.addedGroupCount = 0;
		this.groups = changes.groups.currentValue.map(group => {
			if (group.state === GroupStateEnum.Installed) {
				this.addedGroupCount += 1;
				group.buttonState = ButtonState.Added;
			} else {
				group.buttonState = ButtonState.AddApp;
			}
			return group;
		});
	}

	async closeAddAppToGroupPopup(element) {
		this.recordButtonClick(element);
		this.closeAddAppToGroup.emit(false);
	}

	closeAuthorizeConvoOverlay() {
		this.showHowToAddGroupPopup = false;
		this.hideAddAppOverlay = false;
	}

	showHowAddToApp(element) {
		this.recordButtonClick(element);
		this.recordDialogBoxShow('How to add app to group');
		this.showHowToAddGroupPopup = true;
		this.hideAddAppOverlay = true;
	}

	changeButtonStateToRefresh(group, index, element) {
		this.recordButtonClick(element, group);
		this.groups[index].buttonState = ButtonState.Refresh;
	}

	openMobileOverlay(group, element) {
		this.recordButtonClick(element, group);
		this.recordDialogBoxShow('Mobile installation overlay', group);
		this.hideAddAppOverlay = true;
		this.showMobileInstallationOverlay = true;
	}

	closeMobileInstallOverlay() {
		this.hideAddAppOverlay = false;
		this.showMobileInstallationOverlay = false;
	}

	async changeBtnStateToRefreshing(group, index, element) {
		this.recordButtonClick(element, group);
		this.groups[index].buttonState = ButtonState.Refreshing;
		this.user = await this.userService.getUser();
		await this.groupsService.triggerGroupStateCheck(group.id, this.user.id);
		setTimeout(async () => {
			const isGroupInstalled = await this.groupsService.checkForCSAppInstallationState(group.id, group.state);
			if (!isGroupInstalled) {
				this.groups[index].buttonState = ButtonState.AddApp;
			}
		}, 5000);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
