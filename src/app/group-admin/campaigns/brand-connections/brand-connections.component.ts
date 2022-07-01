import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-brand-connections',
	templateUrl: './brand-connections.component.html',
	styleUrls: ['./brand-connections.component.scss']
})
export class BrandConnectionsComponent extends BaseComponent implements OnInit, OnDestroy {
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Brand Connections', 'GA - Campaign Brand Connections');
	}
}
