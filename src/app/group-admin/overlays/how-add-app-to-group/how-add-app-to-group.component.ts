import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';

@Component({
	selector: 'app-how-add-app-to-group',
	templateUrl: './how-add-app-to-group.component.html',
	styleUrls: ['./how-add-app-to-group.component.scss']
})
export class HowAddAppToGroupComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeHowAddToApp = new EventEmitter<boolean>();
	showSpinnerOnAddGroupBtn = false;

	constructor(injector: Injector, private readonly fbService: FacebookService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	async closeHowAddToAppPopup(element) {
		this.recordButtonClick(element);
		this.closeHowAddToApp.emit(false);
	}

	async addMoreGroup(element) {
		this.showSpinnerOnAddGroupBtn = true;
		this.recordButtonClick(element);
		await this.fbService.revokeAccessPermission(FacebookPermissionEnum.GroupPermission);
		await this.fbService.reAskAccessPermission(
			FacebookPermissionEnum.GroupPermission,
			`${JSON.stringify({permissionAskFor: FacebookPermissionEnum.GroupPermission})}`
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
