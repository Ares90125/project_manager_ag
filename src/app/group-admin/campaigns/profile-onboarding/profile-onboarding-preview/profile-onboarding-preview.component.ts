import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-profile-onboarding-preview',
	templateUrl: './profile-onboarding-preview.component.html',
	styleUrls: ['./profile-onboarding-preview.component.scss']
})
export class PreviewOnboardProfilePageComponent extends BaseComponent implements OnInit, OnDestroy {
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
	}
}
