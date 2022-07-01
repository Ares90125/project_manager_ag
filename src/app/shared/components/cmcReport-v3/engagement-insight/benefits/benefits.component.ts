import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import * as _ from 'lodash';

import {BaseEngagementInsight} from '../baseEngagementInsight';
import {IEngagementInsightSection} from '../engagement-insight.component';
import {IBucket, IntentEmittedValues} from '../intent/intent.component';

@Component({
	selector: 'app-benefits',
	templateUrl: './benefits.component.html',
	styleUrls: ['./benefits.component.scss']
})
export class BenefitsComponent extends BaseEngagementInsight implements OnInit, OnChanges {
	@Input()
	data: IBucket[];

	@Input()
	isBrandLoggedIn = false;
	@Input()
	visibleToBrand = false;

	@Input()
	referenceConversation: IEngagementInsightSection['referenceConversations']['benefits'];

	@Output()
	valueUpdated = new EventEmitter<IntentEmittedValues>(null);

	@Output()
	showReferenceConversation = new EventEmitter<any>();

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

	ngOnInit(): void {
		this.createForm(this.data);
		this.updateChartList(this.data);
	}

	emitValueToParent(obj: IntentEmittedValues) {
		this.valueUpdated.emit(obj);
	}

	onChartClick(event, type) {
		if (!this.isBrandLoggedIn) {
			return this.showReferenceConversation.emit({category: event, type: type});
		}
	}

	protected updateChartList(list: IBucket[]) {
		this.chartList = list?.filter((data, i) => {
			data.color = this.ChartColors[i];

			if (!this.isBrandLoggedIn) {
				return true;
			}
			return data.visibleToBrand;
		});
	}
}
