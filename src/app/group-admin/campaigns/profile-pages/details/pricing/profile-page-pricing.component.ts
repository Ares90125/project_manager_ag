import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ProfilePageDetailsComponent} from '@campaigns/profile-pages/details/profile-page-details.component';

@Component({
	selector: 'app-profile-page-pricing',
	templateUrl: './profile-page-pricing.component.html',
	styleUrls: ['./profile-page-pricing.component.scss']
})
export class ProfilePagePricingComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
