import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-pitch-onboarding',
	templateUrl: './pitch-onboarding.component.html',
	styleUrls: ['./pitch-onboarding.component.scss']
})
export class PitchOnboardingComponent extends BaseComponent implements OnInit, OnDestroy {
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit() {
		super._ngOnInit();
	}
}
