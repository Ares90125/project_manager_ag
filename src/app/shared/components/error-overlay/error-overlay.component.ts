import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-error-overlay',
	templateUrl: './error-overlay.component.html',
	styleUrls: ['./error-overlay.component.scss']
})
export class ErrorOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() errorTitle: string;
	@Input() errorBody: string;
	@Output() closeErrorOverlay = new EventEmitter<boolean>();
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	closeOverlay() {
		this.closeErrorOverlay.next(true);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
