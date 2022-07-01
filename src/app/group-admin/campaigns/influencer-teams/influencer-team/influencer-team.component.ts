import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-influencer-team',
	templateUrl: './influencer-team.component.html',
	styleUrls: ['./influencer-team.component.scss']
})
export class InfluencerTeamComponent extends BaseComponent implements OnInit, OnDestroy {
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
