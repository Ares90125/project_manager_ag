import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-profile-introduction-modal',
	templateUrl: './profile-introduction-modal.component.html',
	styleUrls: ['./profile-introduction-modal.component.scss']
})
export class ProfileIntroductionModalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closePopup = new EventEmitter<boolean>();
	@Output() openSelectionModal = new EventEmitter<boolean>();
	@Output() emitNewDefaultProfile = new EventEmitter<boolean>();
	@Input() isSingleGroup: boolean = false;
	@Input() fetching: boolean = false;
	currentStep: number = 0;
	constructor(injector: Injector) {
		super(injector);
	}

	nextStepHandle(element) {
		this.recordButtonClick(element, null, null, {current_step: this.currentStep + 1});
		if (this.currentStep === 2 && this.isSingleGroup) {
			this.emitNewDefaultProfile.next(true);
			return;
		}
		if (this.currentStep === 2) {
			this.openSelectionModal.next(true);
			this.closePopup.next(true);
			return;
		}
		this.currentStep = this.currentStep + 1;
	}

	prevStepHandle(element) {
		this.recordButtonClick(element, null, null, {current_step: this.currentStep + 1});
		this.currentStep = this.currentStep - 1;
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	openPitchProfile(element, url) {
		this.recordButtonClick(element, null, null, {example_source: 'onboarding_modal'});
		window.open(url, '_blank');
	}

	closePopupHandle(event) {
		this.recordButtonClick(event, null, null, {current_step: this.currentStep + 1});
		this.closePopup.next(true);
	}
}
