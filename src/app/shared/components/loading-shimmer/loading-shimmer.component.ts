import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-loading-shimmer',
	templateUrl: './loading-shimmer.component.html',
	styleUrls: ['./loading-shimmer.component.scss']
})
export class LoadingShimmerComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() type: number;
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
