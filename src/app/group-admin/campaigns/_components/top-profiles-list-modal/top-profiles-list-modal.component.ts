import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {BaseComponent} from '@sharedModule/components/base.component';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-top-profiles-list-modal',
	templateUrl: './top-profiles-list-modal.component.html',
	styleUrls: ['./top-profiles-list-modal.component.scss']
})
export class TopProfilesListModalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() isPitch: boolean = false;
	@Input() isOpen: number;
	@Input() isConversationStep: boolean = true;
	@Output() closeModal = new EventEmitter();
	@Input() profileOnboardingStep;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	openPitchProfile(element, isPitch, type) {
		this.recordButtonClick(element, null, null, {
			example_source: 'mobile_onboarding_creation_modal',
			current_step: this.profileOnboardingStep + 1
		});
		if (type === 'type1') {
			isPitch
				? window.open(
						'https://cnvo.site/home-remedies-for-babies-and-moms-_nutrition-brand-home-remedies-for-babies-and-moms',
						'_blank'
				  )
				: window.open(
						'https://cnvo.site/kids-learning-and-milestones-3-10-year-kids-learning-and-milestones-3-10-year',
						'_blank'
				  );
		}
		if (type === 'type2') {
			isPitch
				? window.open(
						'https://cnvo.site/home-remedies-for-babies-and-moms-_parenting-brands-home-remedies-for-babies-and-moms',
						'_blank'
				  )
				: window.open(
						'https://cnvo.site/growth-and-monetisation-for-facebook-group-admins-growth-and-monetisation-for-facebook-group-admins-2',
						'_blank'
				  );
		}
		if (type === 'type3') {
			isPitch
				? window.open(
						'https://cnvo.site/home-remedies-for-babies-and-moms-_healthcare-brands-home-remedies-for-babies-and-moms',
						'_blank'
				  )
				: window.open('https://cnvo.site/test-anne-girl-gone-international-global-community', '_blank');
		}
	}

	openPitch(element, url) {
		this.recordButtonClick(element, null, null, {
			example_source: 'mobile_onboarding_creation_modal',
			current_step: this.profileOnboardingStep + 1
		});
		window.open(url, '_blank');
	}

	closeModalHandle(element) {
		this.recordButtonClick(element, null, null, {
			example_source: 'mobile_onboarding_creation_modal',
			current_step: this.profileOnboardingStep + 1
		});
		this.closeModal.next(true);
	}
}
