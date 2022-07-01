import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-pitch-onboarding-preview',
	templateUrl: './pitch-onboarding-preview.component.html',
	styleUrls: ['./pitch-onboarding-preview.component.scss']
})
export class PreviewOnboardPitchPageComponent extends BaseComponent implements OnInit, OnDestroy {
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
