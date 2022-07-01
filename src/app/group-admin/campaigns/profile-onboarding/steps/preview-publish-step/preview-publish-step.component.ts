import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-preview-publish-step',
	templateUrl: './preview-publish-step.component.html',
	styleUrls: ['./preview-publish-step.component.scss']
})
export class PreviewPublishStepComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() nextStep = new EventEmitter();
	@Output() prevStep = new EventEmitter();
	@Output() publishEmit = new EventEmitter();
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isPitch: boolean = false;
	@Input() isSaveInProgress: boolean = false;
	stageFetching: boolean = false;
	isSectionSkipped = false;
	extraRecordEventData = {};

	constructor(private groupProfilePageService: GroupProfilePagesService, injector: Injector) {
		super(injector);
	}

	checkSkippedSection() {
		const popularTopic = this.groupProfilePage.popularTopics
			? this.groupProfilePage.popularTopics.filter(topic => topic.showTopic).length
			: 0;

		const conversation = this.groupProfilePage.featureConversations?.length;
		if (!popularTopic || !conversation) {
			this.isSectionSkipped = true;
		}
	}

	async emitPublishProfileClick(event) {
		this.recordButtonClick(
			event,
			null,
			null,
			{
				current_step: 4,
				onboarding_type: this.isPitch ? 'pitch' : 'profile',
				immediate_publish: true
			},
			this.groupProfilePage
		);
		this.stageFetching = true;
		const {stage} = await this.groupProfilePageService.updateGroupProfileDraft({
			id: this.groupProfilePage.id,
			groupId: this.groupProfilePage.groupId,
			stage: OnboardingStageEnum.COMPLETED
		});
		this.groupProfilePage.stage = stage;
		this.stageFetching = false;
		this.publishEmit.emit(true);
	}

	nextStepHandler() {
		this.nextStep.next(true);
	}

	prevStepHandler() {
		this.prevStep.next(true);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	closeVideo(type) {
		let vid = <HTMLVideoElement>document.getElementById(type);
		vid.pause();
	}

	async ngOnInit() {
		super._ngOnInit();
		const {stage} = await this.groupProfilePageService.updateGroupProfileDraft({
			id: this.groupProfilePage.id,
			groupId: this.groupProfilePage.groupId,
			stage: OnboardingStageEnum.PREVIEW_AND_PUBLISH
		});
		this.groupProfilePage.stage = stage;
		this.checkSkippedSection();
	}
}
