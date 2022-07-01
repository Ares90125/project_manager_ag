import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';

@Component({
	selector: 'app-privacy-policy',
	templateUrl: './privacy-policy.component.html',
	styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closePrivacyPolicy = new EventEmitter<boolean>();
	showSpinnerOnAddGroupBtn = false;
	showGotItButton: boolean = false;

	constructor(injector: Injector, private readonly fbService: FacebookService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.headerService.hasGroupsAdded$.subscribe(hasGrpAdded => {
				this.showGotItButton = hasGrpAdded;
			})
		);
	}

	async closePrivacyPage(element) {
		await this.recordButtonClick(element);
		this.closePrivacyPolicy.emit(false);
	}

	async addMoreGroup(element) {
		this.showSpinnerOnAddGroupBtn = true;
		await this.recordButtonClick(element);
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
