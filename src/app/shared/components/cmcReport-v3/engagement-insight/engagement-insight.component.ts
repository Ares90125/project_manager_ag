import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import * as _ from 'lodash';

import {IBucket, IntentEmittedValues} from './intent/intent.component';

export interface IEngagementInshightLevel1 {
	intent: IEngagementInshightLevel2;
	emotions: IEngagementInshightLevel2;
	Benefits: IEngagementInshightLevel2;
}

export interface IEngagementInshightLevel2 {
	[key: string]: number;
}

export interface IEngagementInsightSection {
	content: {
		intent: IBucket[];
		emotions: IBucket[];
		benefits: IBucket[];
	};
	supportingText?: string;
	intentVisibleToBrand?: boolean;
	emotionsVisibleToBrand?: boolean;
	benefitsVisibleToBrand?: boolean;
	referenceConversations: {intent: {}; benefits: {}; emotions: {}};
}

@Component({
	selector: 'app-engagement-insight',
	templateUrl: './engagement-insight.component.html',
	styleUrls: ['./engagement-insight.component.scss']
})
export class EngagementInsightComponent implements OnInit, OnChanges {
	@Input()
	sectionData: IEngagementInsightSection;

	@Input()
	isBrandLoggedIn = true;

	@Output()
	updatedValue = new EventEmitter<IEngagementInsightSection>(null);

	@Output()
	showReferenceConversation = new EventEmitter<any>(null);

	form: FormGroup;

	editingSupportingText = false;

	constructor(private formBuilder: FormBuilder) {}

	ngOnInit(): void {
		this.createForm(this.sectionData);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.sectionData?.currentValue?.supportingText && this.form) {
			this.form.get('supportingText').setValue(changes.sectionData.currentValue.supportingText);
		}
	}

	onSubmittingSuportingText() {
		const obj = _.cloneDeep(this.sectionData);
		obj.supportingText = this.form.get('supportingText').value;
		this.updatedValue.emit(obj);
		this.editingSupportingText = false;
	}

	cancelEditingSupportingText() {
		this.editingSupportingText = false;
		this.form.get('supportingText').setValue(this.sectionData.supportingText);
	}

	onUpdaatingIntent(newData: IntentEmittedValues) {
		const obj = _.cloneDeep(this.sectionData);
		obj.intentVisibleToBrand = newData.visibleToBrand;
		_.set(obj, 'content.intent', newData.content);
		this.updatedValue.emit(obj);
	}

	onUpdaatingEmotion(newData: IntentEmittedValues) {
		const obj = _.cloneDeep(this.sectionData);
		obj.emotionsVisibleToBrand = newData.visibleToBrand;
		_.set(obj, 'content.emotions', newData.content);

		this.updatedValue.emit(obj);
	}

	onUpdaatingBenefits(newData: IntentEmittedValues) {
		const obj = _.cloneDeep(this.sectionData);
		obj.benefitsVisibleToBrand = newData.visibleToBrand;
		_.set(obj, 'content.benefits', newData.content);

		this.updatedValue.emit(obj);
	}

	private createForm(data: IEngagementInsightSection) {
		this.form = this.formBuilder.group({
			supportingText: [data.supportingText || '']
		});
	}
}
