import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import * as _ from 'lodash';

import {BaseEngagementInsight} from '../baseEngagementInsight';
import {IPieChartData} from '../engagement-insight-chart/engagement-insight-chart.component';
import {IEngagementInsightSection} from '../engagement-insight.component';

export interface IBucket extends IPieChartData {
	keywords?: string;
	visibleToBrand: boolean;
}

export interface IntentEmittedValues {
	content: IBucket[];
	visibleToBrand?: boolean;
}

@Component({
	selector: 'app-intent',
	templateUrl: './intent.component.html',
	styleUrls: ['./intent.component.scss']
})
export class IntentComponent extends BaseEngagementInsight implements OnInit, OnChanges {
	@Input()
	data: IBucket[];

	@Input()
	isBrandLoggedIn = false;

	@Input()
	visibleToBrand = false;

	@Input()
	referenceConversation: IEngagementInsightSection['referenceConversations']['intent'];

	@Output()
	showReferenceConversation = new EventEmitter<any>();

	@Output()
	valueUpdated = new EventEmitter<IntentEmittedValues>(null);

	constructor(injector: Injector, public formBuilder: FormBuilder) {
		super(injector, formBuilder);
	}

	ngOnChanges(change: SimpleChanges) {
		if (this.form && change.data && !_.isEqual(change.data.currentValue, change.data?.previousValue)) {
			this.createForm(change.data.currentValue);
			this.updateChartList(change.data.currentValue);
		}

		if (
			change.visibleToBrand &&
			change.visibleToBrand.currentValue != change.visibleToBrand.previousValue &&
			this.form
		) {
			this.form.get('visibleToBrand').setValue(change.visibleToBrand.currentValue);
		}
	}

	onChangingToggle() {
		setTimeout(() => this.saveUpdatedDetails());
	}

	ngOnInit(): void {
		this.createForm(this.data);

		this.updateChartList(this.data);
	}

	emitValueToParent(obj: IntentEmittedValues) {
		this.valueUpdated.emit(obj);
	}

	saveUpdatedDetails() {
		this.emitValueToParent(this.form.getRawValue());
		this.editingpopupContent = false;
	}

	onChartClick(event, type) {
		if (!this.isBrandLoggedIn) {
			return this.showReferenceConversation.emit({category: event, type: type});
		}
	}

	protected updateChartList(list: IBucket[]) {
		this.chartList = list?.filter((data, i) => {
			data.color = this.ChartColors[i];
			// NOTE: Check with Kush how this will work?
			if (!this.isBrandLoggedIn) {
				return true;
			}
			return data.visibleToBrand;
		});
	}
}
