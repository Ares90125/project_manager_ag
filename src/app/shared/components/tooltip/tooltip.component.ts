import {ChangeDetectorRef, Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-tooltip',
	templateUrl: './tooltip.component.html',
	styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() setTooltipText;
	@Input() isErrorMessage = false;

	constructor(private readonly cdRef: ChangeDetectorRef, injector: Injector) {
		super(injector);
		this.cdRef.markForCheck();
	}

	ngOnInit() {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
