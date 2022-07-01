import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-switch-fb-account-overlay',
	templateUrl: './switch-fb-account-overlay.component.html',
	styleUrls: ['./switch-fb-account-overlay.component.scss']
})
export class SwitchFbAccountOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() userNameFromQueryString;
	@Input() userNameFromDB;
	@Output() closeSwitchFBOverlay = new EventEmitter<boolean>();

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	closeOverlay(element) {
		this.recordButtonClick(element);
		this.closeSwitchFBOverlay.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
