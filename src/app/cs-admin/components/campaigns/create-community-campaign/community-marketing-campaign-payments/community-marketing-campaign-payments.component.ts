import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-community-marketing-campaign-payments',
	templateUrl: './community-marketing-campaign-payments.component.html',
	styleUrls: ['./community-marketing-campaign-payments.component.scss']
})
export class CommunityMarketingCampaignPaymentsComponent extends BaseComponent implements OnInit, OnDestroy {
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
