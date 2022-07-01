import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import * as _ from 'lodash';
import {combineLatest, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

export interface IUpdatedResultSection {
	content: Content;
	supportingText?: string;
	visibleToBrand?: boolean;
}

interface Content {
	numDuringCatConversations: number;
	numBeforeCatConversations: number;
	categoryConversationVisibleToBrand?: boolean;
	numDuringBrandMentions: number;
	numBeforeBrandMentions: number;
	brandMentionsVisibleToBrand?: boolean;
	brandShareofVoiceVisibleToBrand?: boolean;
	numCommentAdminPost: number;
	numCommentUGCPost: number;
	numReactionAdminPost: number;
	numReactionUGCPost: number;
	totalReactionAndCommentsVisibleToBrand?: boolean;
	numUGCPosts: number;
	numUGCComments: number;
	ugcVisibleToBrand?: boolean;
	brandPercentageBeforeSov: number;
	brandPercentageDuringSov: number;
}

@Component({
	selector: 'app-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends BaseComponent implements OnInit, OnChanges {
	@Input()
	content: Content;
	@Input()
	supportingText: string;

	@Input()
	isBrandLoggedIn = true;
	@Input()
	visibleToBrand = false;

	@Output()
	updatedValue = new EventEmitter<IUpdatedResultSection>();

	editingSupportingText = false;
	isUserEditingPopupContent = false;

	form: FormGroup;
	isFormFirstTimeSubmitted = false;

	Subscriptions: Subscription[] = [];
	changeInCategoryConversation: number;
	changeInBrandMentions: number;
	changeInBrandSov: number;
	currentBrandSOVInPercentage: number;
	previousBrandSOVInPercentage: number;

	constructor(injector: Injector, private formBuilder: FormBuilder) {
		super(injector);
	}

	// eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
	ngOnInit(): void {}

	ngOnChanges(change: SimpleChanges) {
		if (change.content && !_.isEqual(change.content.currentValue, change.content.previousValue)) {
			this.updateForm(change.content.currentValue, this.supportingText, this.visibleToBrand);
			this.calculateMetricDifferences(change.content.currentValue, 'ngChange');
		}

		if (change.supportingText && !_.isEqual(change.supportingText.currentValue, change.supportingText.previousValue)) {
			this.updateForm(this.content, change.supportingText.currentValue, this.visibleToBrand);
		}

		if (change.visibleToBrand && !_.isEqual(change.visibleToBrand.currentValue, change.visibleToBrand.previousValue)) {
			this.updateForm(this.content, this.supportingText, change.visibleToBrand.currentValue);
		}
	}

	calculateMetricDifferences(content: Content, by) {
		if (!content) {
			return;
		}

		this.changeInCategoryConversation = content.numDuringCatConversations - content.numBeforeCatConversations;
		if (isNaN(this.changeInCategoryConversation)) {
			this.changeInCategoryConversation = 0;
		}

		this.changeInBrandMentions = content.numDuringBrandMentions - content.numBeforeBrandMentions;
		if (isNaN(this.changeInBrandMentions)) {
			this.changeInBrandMentions = 0;
		}

		this.changeInBrandSov = content.brandPercentageDuringSov - content.brandPercentageBeforeSov;
		this.changeInBrandSov = Math.round(this.changeInBrandSov * 100) / 100;
		if (isNaN(this.changeInBrandSov)) {
			this.changeInBrandSov = 0;
		}
	}

	createCategoryConversationForm(data: Content) {
		return this.formBuilder.group({
			numDuringCatConversations: [data?.numDuringCatConversations || 0, [Validators.min(0)]],
			categoryConversationVisibleToBrand: [false],
			numBeforeCatConversations: [data?.numBeforeCatConversations || 0, [Validators.min(0)]],
			numDuringBrandMentions: [data?.numDuringBrandMentions || 0, [Validators.min(0)]],
			numBeforeBrandMentions: [data?.numBeforeBrandMentions || 0, [Validators.min(0)]],
			brandMentionsVisibleToBrand: [false],
			numCommentAdminPost: [data?.numCommentAdminPost || 0, [Validators.min(0)]],
			numCommentUGCPost: [data?.numCommentUGCPost || 0, [Validators.min(0)]],
			numReactionAdminPost: [data?.numReactionAdminPost || 0, [Validators.min(0)]],
			numReactionUGCPost: [data?.numReactionUGCPost || 0, [Validators.min(0)]],
			totalReactionAndCommentsVisibleToBrand: [false],
			brandShareofVoiceVisibleToBrand: [false],
			numUGCPosts: [data?.numUGCPosts || 0, [Validators.min(0)]],
			numUGCComments: [data?.numUGCComments || 0, [Validators.min(0)]],
			ugcVisibleToBrand: [false],
			brandPercentageBeforeSov: [
				data?.brandPercentageBeforeSov || 0,
				[Validators.min(0), Validators.max(100), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]
			],
			brandPercentageDuringSov: [
				data?.brandPercentageDuringSov || 0,
				[Validators.min(0), Validators.max(100), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]
			]
		});
	}

	createForm(content: Content, supportingText: string, visibleToBrand: boolean) {
		this.form = this.formBuilder.group({
			content: this.createCategoryConversationForm(content),
			supportingText: [supportingText || ''],
			visibleToBrand: [visibleToBrand]
		});
		this.form.controls['visibleToBrand'].valueChanges.subscribe(newValue => {
			if (newValue) {
				this.enableAllMetricsControls();
			} else {
				this.disableAllMetricsControls();
			}
			setTimeout(() => this.emitUpdatedDataToParent());
		});

		this.listenToContentFields();
	}

	listenToContentFields() {
		const subs = combineLatest([
			(this.form.controls.content as FormGroup).controls.ugcVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.brandShareofVoiceVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.totalReactionAndCommentsVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.brandMentionsVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.categoryConversationVisibleToBrand.valueChanges
		])
			.pipe(debounceTime(100))
			.subscribe(values => {
				if (!this.form.touched || this.isUserEditingPopupContent) {
					return;
				}
				setTimeout(() => this.emitUpdatedDataToParent());
			});
		this.Subscriptions.push(subs);
	}

	disableAllMetricsControls() {
		(this.form.controls.content as FormGroup).controls.ugcVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.brandShareofVoiceVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.totalReactionAndCommentsVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.brandMentionsVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.categoryConversationVisibleToBrand.disable();
	}

	enableAllMetricsControls() {
		(this.form.controls.content as FormGroup).controls.ugcVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.brandShareofVoiceVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.totalReactionAndCommentsVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.brandMentionsVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.categoryConversationVisibleToBrand.enable();
	}

	updateForm(newData: Content, supportingText: string, visibleToBrand: boolean) {
		if (!this.form) {
			return this.createForm(newData, supportingText, visibleToBrand);
		}
		if (!_.isEqual((this.form.controls.content as FormGroup).getRawValue(), newData)) {
			this.form.controls['content'].setValue({
				...(this.form.controls.content as FormGroup).getRawValue(),
				...newData
			});
		}
		this.form.controls['supportingText'].setValue(supportingText);
		if (visibleToBrand != this.form.controls.visibleToBrand.value) {
			this.form.controls['visibleToBrand'].setValue(visibleToBrand);
		}
	}

	onSubmittingSuportingText() {
		this.editingSupportingText = false;
		this.supportingText = this.form.value.supportingText;
		this.emitUpdatedDataToParent();
	}

	saveUpdatedDetails() {
		this.isUserEditingPopupContent = false;
		this.emitUpdatedDataToParent();
	}

	emitUpdatedDataToParent() {
		this.updatedValue.emit(this.form.getRawValue());
	}

	cancelContentEdit() {
		this.isUserEditingPopupContent = false;
		this.form.controls.content.reset(this.content);
	}

	resetForm() {
		this.form.patchValue({content: this.content, supportingText: this.supportingText || ''});
		this.editingSupportingText = false;
	}
}
