import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	ViewChild,
	ViewChildren
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import * as _ from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
	selector: 'app-group-profile-topics',
	templateUrl: './group-profile-topics.component.html',
	styleUrls: ['./group-profile-topics.component.scss']
})
export class GroupProfileTopicsComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Output() savePopularTopicsSection = new EventEmitter();
	@ViewChild('topicsInput', {static: false}) topicsInput: ElementRef;
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	separatorKeysCodes: number[] = [ENTER, COMMA];
	isSaveInProgress = false;
	initialValue: any = [];
	initialVisibilityValue;
	welcomeTitle: string = 'Edit popular topics in your group';
	welcomeContent: string = 'Your group’s topics gets matched to relevant brand campaigns!';
	viewToolTip: boolean = false;
	isExpanded: boolean = false;
	openTopicsModal: boolean = false;
	showTopicsVideo: boolean = false;
	constructor(injector: Injector, public readonly groupProfilePageService: GroupProfilePagesService) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.groupProfilePage.popularTopics = this.groupProfilePage.popularTopics
			? this.groupProfilePage.popularTopics
			: [];

		this.initialVisibilityValue = this.groupProfilePage.showPopularTopics;
		this.initialValue = _.cloneDeep(this.groupProfilePage.popularTopics);
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.isSaveInProgress = false;
			this.topicsInput.nativeElement.value = '';
		});
		this.groupProfilePageService.profilePageOnboardingTracker
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => (this.viewToolTip = value === 3));
	}

	noOfPopularTopics(): number {
		return this.groupProfilePage.popularTopics
			? this.groupProfilePage.popularTopics.filter(topic => topic.showTopic).length
			: 0;
	}

	reset() {
		this.topicsInput.nativeElement.value = '';
		this.openTopicsModal = false;
		this.initialVisibilityValue = this.groupProfilePage.showPopularTopics;
		this.initialValue = _.cloneDeep(this.groupProfilePage.popularTopics);
	}

	updateTopics(closeButtonForEditTopics?) {
		const inputValue = this.topicsInput.nativeElement.value;
		if (closeButtonForEditTopics && inputValue === '') {
			closeButtonForEditTopics.click();
			return;
		}

		this.isSaveInProgress = true;
		if (inputValue !== '') {
			this.pushToKeywordsArray(this.topicsInput.nativeElement.value, this.groupProfilePage.popularTopics);
			this.topicsInput.nativeElement.value = '';
		}
		this.groupProfilePage.isPopularTopicsSectionChanged = true;
		this.savePopularTopicsSection.emit({closeButtonForPopup: closeButtonForEditTopics});
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
		this.updateTopics();
	}

	pushToKeywordsArray(word, keywords) {
		word = word.trim();
		if (word) {
			word = word.indexOf('#') === 0 ? word.substring(1, word.length) : word;
			keywords = keywords ? keywords : [];
			keywords.push({keyword: word, showTopic: true});
		}
	}

	isSaveEnabled() {
		return (
			this.initialVisibilityValue !== this.groupProfilePage.showPopularTopics ||
			JSON.stringify(this.initialValue) !== JSON.stringify(this.groupProfilePage.popularTopics) ||
			this.topicsInput?.nativeElement?.value.trim() !== ''
		);
	}

	openTopicsHelpVideo() {
		this.showTopicsVideo = true;
	}

	closeVideoPlayer() {
		this.showTopicsVideo = false;
	}

	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			if (
				this.noOfPopularTopics() === 0 ||
				this.groupProfilePageService.checkIfAllSectionNeedToBeExpanded(this.groupProfilePage)
			) {
				this.isExpanded = true;
				x.hideToggle = true;
				x.expanded = true;
			}

			x.expandedChange.subscribe(data => {
				if (data) {
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			});
		});
	}
}
