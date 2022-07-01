import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-campaign-details',
	templateUrl: './campaign-details.component.html',
	styleUrls: ['./campaign-details.component.scss']
})
export class CampaignDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
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
