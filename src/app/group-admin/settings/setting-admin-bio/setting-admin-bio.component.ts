import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';

@Component({
	selector: 'app-setting-admin-bio',
	templateUrl: './setting-admin-bio.component.html',
	styleUrls: ['./setting-admin-bio.component.scss']
})
export class SettingAdminBioComponent extends BaseComponent implements OnInit, OnDestroy {
	isThereAnyUnSavedChanges = false;
	constructor(injector: Injector, private readonly adminBioService: AdminBioService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		// this.subscriptionsToDestroy.push(
		// 	this.adminBioService.showSaveButton$.subscribe(bool => {
		// 		this.isThereAnyUnSavedChanges = bool;
		// 	})
		// );
	}

	goBack(url) {
		this.appService.goBack(url);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
