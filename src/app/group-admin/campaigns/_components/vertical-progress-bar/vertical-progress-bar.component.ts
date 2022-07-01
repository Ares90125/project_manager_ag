import {Component, Injector, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {BaseComponent} from '@sharedModule/components/base.component';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-vertical-progress-bar',
	templateUrl: './vertical-progress-bar.component.html',
	styleUrls: ['./vertical-progress-bar.component.scss']
})
export class VerticalProgressBarComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Input() progressOptions: ProgressOption[];
	@Input() currentStep: number;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	ngOnChanges() {
		this.progressOptions = this.progressOptions.map((item, index) => {
			return {
				...item,
				status: this.getCircleStatus(index)
			};
		});
	}

	getCircleStatus(index: number) {
		if (index === this.currentStep) {
			return OnboardProgressStatusEnum.Current;
		}
		if (index > this.currentStep) {
			return OnboardProgressStatusEnum.Unbegun;
		}
		if (index < this.currentStep) {
			return OnboardProgressStatusEnum.Completed;
		}
	}
}
