import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-success-published-pitch',
	templateUrl: './success-published-pitch.component.html',
	styleUrls: ['./success-published-pitch.component.scss']
})
export class SuccessPublishedPitchComponent extends BaseComponent implements OnInit, OnDestroy {
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
