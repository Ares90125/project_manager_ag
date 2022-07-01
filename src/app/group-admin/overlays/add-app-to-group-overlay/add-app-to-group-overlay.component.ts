import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-add-app-to-group-overlay',
	templateUrl: './add-app-to-group-overlay.component.html',
	styleUrls: ['./add-app-to-group-overlay.component.scss']
})
export class AddAppToGroupOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeAuthorizeConvoOverlay: EventEmitter<boolean> = new EventEmitter();

	constructor(injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	async closeOverlay(element) {
		this.recordButtonClick(element);
		this.closeAuthorizeConvoOverlay.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
