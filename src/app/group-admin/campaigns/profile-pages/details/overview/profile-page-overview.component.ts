import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {ProfilePageDetailsComponent} from '@campaigns/profile-pages/details/profile-page-details.component';

@Component({
	selector: 'app-profile-page-overview',
	templateUrl: './profile-page-overview.component.html',
	styleUrls: ['./profile-page-overview.component.scss']
})
export class ProfilePageOverviewComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	profilePage: GroupProfilePageModel;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Profile Page Overview', 'GA - Campaign Profile Page Overview');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
