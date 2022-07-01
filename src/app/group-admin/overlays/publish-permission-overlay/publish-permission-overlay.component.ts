import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Component({
	selector: 'app-publish-permission-overlay',
	templateUrl: './publish-permission-overlay.component.html',
	styleUrls: ['./publish-permission-overlay.component.scss']
})
export class PublishPermissionOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeDialog = new EventEmitter<boolean>();
	loading = false;
	constructor(
		injector: Injector,
		private readonly facebookService: FacebookService,
		private readonly securedStorage: SecuredStorageProviderService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	cancelPublishPermission(element) {
		this.recordButtonClick(element);
		this.closeDialog.next(false);
	}

	async requestFBForPermission(element) {
		this.loading = true;
		this.recordButtonClick(element);
		await this.facebookService.revokeAccessPermission(FacebookPermissionEnum.PublishPermission);
		await this.securedStorage.setSessionStorage('redirectUrlFBPermission', this.appService.currentPageUrl.getValue());
		setTimeout(() => {
			this.facebookService.reAskAccessPermission(
				FacebookPermissionEnum.PublishPermission,
				`${JSON.stringify({permissionAskFor: FacebookPermissionEnum.PublishPermission})}`
			);
		}, 500);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
