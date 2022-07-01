import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-onboarding-step-nav',
	templateUrl: './onboarding-step-nav.component.html',
	styleUrls: ['./onboarding-step-nav.component.scss']
})
export class OnboardingStepNavComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() currentStep: number = 0;
	@Input() fetching: boolean = false;
	@Input() extraRecordEventData = {};
	@Input() isPitch: boolean = false;
	@Input() profileId: string = '';
	groupId: string = '';
	@Output() nextStep = new EventEmitter();
	@Output() prevStep = new EventEmitter();

	constructor(
		private groupProfilePageService: GroupProfilePagesService,
		private route: ActivatedRoute,
		private readonly router: Router,
		injector: Injector
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.route.params.subscribe(params => {
			this.profileId = params['profileId'];
		});
		this.route.params.subscribe(params => {
			this.groupId = params['groupId'];
		});
	}

	async nextStepHandle(element) {
		if (this.currentStep === 3) {
			this.fetching = true;
			this.recordButtonClick(element, null, null, {
				current_step: this.currentStep + 1,
				onboarding_type: this.isPitch ? 'pitch' : 'profile',
				immediate_publish: false,
				...this.extraRecordEventData
			});
			this.extraRecordEventData = {};
			await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.profileId,
				groupId: this.groupId,
				stage: OnboardingStageEnum.COMPLETED
			});
			this.fetching = false;
			this.router.navigateByUrl(
				'/group-admin/campaigns/' + this.groupId + '/profile-pages/' + this.profileId + '/edit'
			);
			return;
		}

		this.recordButtonClick(element, null, null, {
			current_step: this.currentStep + 1,
			onboarding_type: this.isPitch ? 'pitch' : 'profile',
			...this.extraRecordEventData
		});

		this.extraRecordEventData = {};
		this.nextStep.next(true);
	}

	prevStepHandle(element) {
		this.recordButtonClick(element, null, null, {
			current_step: this.currentStep + 1,
			onboarding_type: this.isPitch ? 'pitch' : 'profile',
			...this.extraRecordEventData
		});
		this.extraRecordEventData = {};
		this.prevStep.next(true);
	}
}
