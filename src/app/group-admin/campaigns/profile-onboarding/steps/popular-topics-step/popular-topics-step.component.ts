import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';
import _ from 'lodash';
import {takeUntil} from 'rxjs/operators';

export interface ProgressOption {
	status: OnboardProgressStatusEnum;
	title: string;
}

@Component({
	selector: 'app-popular-topics-step',
	templateUrl: './popular-topics-step.component.html',
	styleUrls: ['./popular-topics-step.component.scss']
})
export class PopularTopicsStepComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupProfilePage: any;
	@Input() isPitch: boolean = false;
	@Output() savePopularTopicsSection = new EventEmitter();
	@Input() resetHook: EventEmitter<boolean>;
	initialValue: any = [];
	stageFetching: boolean = true;

	inputFocused = false;
	isSkipModalOpen = false;
	@Output() nextStep = new EventEmitter();
	@Output() prevStep = new EventEmitter();

	@ViewChild('topicsInput', {static: false}) topicsInput: ElementRef;
	@HostListener('document:click', ['$event.target'])
	public onClick(targetElement) {
		const clickedInside = this.topicsInput.nativeElement.contains(targetElement);
		const inputValue = this.topicsInput.nativeElement.value;
		if (this.inputFocused && !clickedInside && !!inputValue) {
			this.updateTopics();
		}
		this.inputFocused = !!clickedInside;
	}

	showSampleTopic: boolean = false;
	isSaveInProgress;
	initialVisibilityValue;
	extraRecordEventData = {};
	separatorKeysCodes: number[] = [ENTER, COMMA];
	viewToolTip: boolean = false;

	constructor(injector: Injector, public readonly groupProfilePageService: GroupProfilePagesService) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	closeSkipModal() {
		this.isSkipModalOpen = false;
	}

	openSkipModal() {
		this.isSkipModalOpen = true;
	}

	nextStepHandler() {
		if (!this.isPitch && this.noOfPopularTopics() === 0) {
			this.openSkipModal();
			return;
		}
		this.updateTopics();
		this.nextStep.next(true);
	}

	prevStepHandler() {
		this.updateTopics(true);
	}

	toggleSampleTopics(element) {
		this.recordButtonClick(
			element,
			null,
			null,
			{
				current_step: 2,
				onboarding_type: this.isPitch ? 'pitch' : 'profile',
				popular_topics: this.groupProfilePage.showPopularTopics
			},
			this.groupProfilePage
		);
		this.showSampleTopic = !this.showSampleTopic;
	}

	noOfPopularTopics(): number {
		return this.groupProfilePage.popularTopics
			? this.groupProfilePage.popularTopics.filter(topic => topic.showTopic).length
			: 0;
	}

	async ngOnInit() {
		super._ngOnInit();
		this.groupProfilePage.popularTopics = this.groupProfilePage.popularTopics
			? this.groupProfilePage.popularTopics
			: [];

		const {stage} = await this.groupProfilePageService.updateGroupProfileDraft({
			id: this.groupProfilePage.id,
			groupId: this.groupProfilePage.groupId,
			stage: OnboardingStageEnum.POPULAR_TOPPICS
		});
		this.groupProfilePage.stage = stage;
		this.stageFetching = false;

		this.initialVisibilityValue = this.groupProfilePage.showPopularTopics;
		this.initialValue = _.cloneDeep(this.groupProfilePage.popularTopics);
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.isSaveInProgress = false;
			this.topicsInput.nativeElement.value = '';
		});
		this.groupProfilePageService.profilePageOnboardingTracker
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => (this.viewToolTip = value === 3));

		this.extraRecordEventData = this.groupProfilePage.popularTopics
			.filter(topic => topic.showTopic)
			.reduce((acc, topic, index) => ({...acc, [`popular_topic_${index + 1}`]: topic?.keyword}), {});
	}

	pushToKeywordsArray(word, keywords) {
		word = word.trim();
		if (word && keywords) {
			word = word.indexOf('#') === 0 ? word.substring(1, word.length) : word;
			keywords = keywords ? keywords : [];
			keywords.push({keyword: word, showTopic: true});
		}
		if (word && !keywords) {
			word = word.indexOf('#') === 0 ? word.substring(1, word.length) : word;
			this.groupProfilePage.popularTopics = [{keyword: word, showTopic: true}];
		}
	}

	updateTopics(toPrevStep: boolean = false) {
		const inputValue = this.topicsInput.nativeElement.value;

		this.isSaveInProgress = true;
		if (inputValue !== '') {
			this.pushToKeywordsArray(this.topicsInput.nativeElement.value, this.groupProfilePage.popularTopics);
			this.topicsInput.nativeElement.value = '';
		}
		const openedPopularTopics = this.groupProfilePage.popularTopics.filter(topic => topic.showTopic);

		this.groupProfilePage.showPopularTopics = !!openedPopularTopics.length;

		this.extraRecordEventData = openedPopularTopics.reduce(
			(acc, topic, index) => ({...acc, [`popular_topic_${index + 1}`]: topic?.keyword}),
			{}
		);

		this.groupProfilePage.isPopularTopicsSectionChanged = true;
		this.savePopularTopicsSection.emit({toPrevStep});
	}

	closeVideo(type) {
		let vid = <HTMLVideoElement>document.getElementById(type);
		vid.pause();
	}

	addKeywords(event: MatChipInputEvent, keywords): void {
		const input = event.input;
		const value = event.value;

		if ((value || '').trim()) {
			const words = value.trim().split(',');
			words.forEach(word => this.pushToKeywordsArray(word, keywords));
		}

		if (input) {
			input.value = '';
		}

		if (this.noOfPopularTopics() > 5) {
			return;
		}
	}
}
