import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-influencer-teams-dashboard',
	templateUrl: './influencer-teams-dashboard.component.html',
	styleUrls: ['./influencer-teams-dashboard.component.scss']
})
export class InfluencerTeamsDashboardComponent extends BaseComponent implements OnInit, OnDestroy {
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Influencer Team', 'GA - Campaign Influencer Team');
	}
}
