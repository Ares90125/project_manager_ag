import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {BaseComponent} from '@sharedModule/components/base.component';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-onboarding-step-desc',
	templateUrl: './onboarding-step-desc.component.html',
	styleUrls: ['./onboarding-step-desc.component.scss']
})
export class OnboardingStepDescriptionComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() title: string = '';
	@Input() subtitle: string = '';
	@Input() videoSrc: string = '';

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	closeVideo(type) {
		let vid = <HTMLVideoElement>document.getElementById(type);
		vid.pause();
	}

	ngOnInit(): void {
		super._ngOnInit();
	}
}
