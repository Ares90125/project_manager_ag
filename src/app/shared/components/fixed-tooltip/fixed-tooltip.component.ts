import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-fixed-tooltip',
	templateUrl: './fixed-tooltip.component.html',
	styleUrls: ['./fixed-tooltip.component.scss']
})
export class FixedTooltipComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() title;
	@Input() content;
	@Input() exception: boolean = false;
	btnText: string = 'Next';

	constructor(injector: Injector, public readonly groupProfilePageService: GroupProfilePagesService) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.exception ? (this.btnText = 'Got it') : null;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	triggerOnboardCount() {
		const currentCount = this.groupProfilePageService.profilePageOnboardingTracker.getValue();
		this.groupProfilePageService.profilePageOnboardingTracker.next(currentCount + 1);
	}
}
