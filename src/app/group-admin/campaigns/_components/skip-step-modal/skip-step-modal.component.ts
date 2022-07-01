import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {BaseComponent} from '@sharedModule/components/base.component';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-skip-step-modal',
	templateUrl: './skip-step-modal.component.html',
	styleUrls: ['./skip-step-modal.component.scss']
})
export class SkipStepModalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() isOpen: number;
	@Input() isConversationStep: boolean = true;
	@Output() closeModal = new EventEmitter();
	@Output() skipStep = new EventEmitter();

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
	ngOnInit() {
		super._ngOnInit();
	}

	skipStepHandle(element) {
		this.recordButtonClick(element, null, null, {
			example_source: 'onboarding_creation_skip_modal',
			is_conversation_step: this.isConversationStep,
			skip_step: true
		});
		this.skipStep.next(true);
	}

	closeModalHandle(element) {
		this.recordButtonClick(element, null, null, {
			example_source: 'onboarding_creation_skip_modal',
			is_conversation_step: this.isConversationStep,
			skip_step: false
		});
		this.closeModal.next(true);
	}

	openPitchProfile(element, url) {
		this.recordButtonClick(element, null, null, {
			example_source: 'onboarding_creation_skip_modal'
		});
		window.open(url, '_blank');
		super._ngOnInit();
	}
}
