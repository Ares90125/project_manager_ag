import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-mobile-installation',
	templateUrl: './mobile-installation.component.html',
	styleUrls: ['./mobile-installation.component.scss']
})
export class MobileInstallationComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeMobileInstallOverlay = new EventEmitter<boolean>();

	constructor(injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	async closeOverlay(element) {
		this.recordButtonClick(element);
		this.closeMobileInstallOverlay.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
