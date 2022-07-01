import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProfilePageDetailsComponent} from '@groupAdminModule/campaigns/profile-pages/details/profile-page-details.component';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-pitch-onboarding-intro',
	templateUrl: './pitch-onboarding-intro.component.html',
	styleUrls: ['./pitch-onboarding-intro.component.scss']
})
export class PitchOnboardingIntroComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	projectId: string = '';
	groupId: string = '';

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Group Pitch Onboarding Intro', 'GA - Group Pitch Onboarding Intro');
		this.route.params.subscribe(params => {
			this.projectId = params['profileId'];
		});
		this.route.params.subscribe(params => {
			this.groupId = params['groupId'];
		});
	}
}
