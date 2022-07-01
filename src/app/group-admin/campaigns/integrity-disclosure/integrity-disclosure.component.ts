import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-integrity-disclosure',
	templateUrl: './integrity-disclosure.component.html',
	styleUrls: ['./integrity-disclosure.component.scss']
})
export class IntegrityDisclosureComponent extends BaseComponent implements OnInit, OnDestroy {
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Integrity Disclosure', 'GA - Campaign Integrity Disclosure');
	}
}
