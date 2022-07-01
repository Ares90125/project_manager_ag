import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-circle-step-bar',
	templateUrl: './circle-step-bar.component.html',
	styleUrls: ['./circle-step-bar.component.scss']
})
export class CircleStepBarComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() currentStep: number = 0;
	@Input() numberOfSteps: number = 3;
	stepArray = new Array(this.numberOfSteps).fill(1);

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		console.log(this.stepArray);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
