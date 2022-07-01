import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import * as _ from 'lodash';
import {combineLatest, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {WordCloudData} from './wordcloud-chart/wordcloud-chart.component';

export interface IWordCloudSection {
	content: {preCampaign: {[key: string]: number}; duringCampaign: {[key: string]: number}};
	visibleToBrand?: boolean;
	supportingText?: string;
	preCamapingVisibleToBrand: boolean;
	duringCamapingVisibleToBrand: boolean;
}

export enum DEFAULT_COLORS {
	PRE_CAMPAIGN = '#B6B6B6',
	DURING_CAMPAIGN = '#1F77B4'
}

@Component({
	selector: 'app-wordcloud',
	templateUrl: './wordcloud.component.html',
	styleUrls: ['./wordcloud.component.scss']
})
export class WordcloudComponent extends BaseComponent implements OnInit, OnChanges {
	@Input()
	content: IWordCloudSection['content'];
	@Input()
	supportingText: string;

	@Input()
	isBrandLoggedIn = true;
	@Input()
	preCamapingVisibleToBrand = false;

	@Input()
	duringCamapingVisibleToBrand = false;

	@Input()
	visibleToBrand = false;

	@Output()
	updatedValue = new EventEmitter<IWordCloudSection>();

	editingSupportingText = false;
	editingContent = false;

	form: FormGroup;

	preCampaignWordList: WordCloudData[];
	duringCampaignWordList: WordCloudData[];
	Subscriptions: Subscription[] = [];

	constructor(injector: Injector, private formBuilder: FormBuilder) {
		super(injector);
	}

	get preCampaignFormList() {
		return this.form.get('content.preCampaign') as FormArray;
	}

	get duringCampaignFormList() {
		return this.form.get('content.duringCampaign') as FormArray;
	}

	ngOnInit(): void {
		this.createForm(this.content, this.supportingText, this.visibleToBrand);
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.content && change.content.currentValue !== change.content.previousValue) {
			if (this.form) {
				this.setDuringCmapaingWordList(change.content.currentValue?.duringCampaign || {});
				this.setPreCampaignWordList(change.content.currentValue?.preCampaign || {});
				this.createForm(change.content.currentValue, this.supportingText, this.visibleToBrand);
			}
		}
	}

	cancelEditingSupportingText() {
		this.form.controls?.supportingText.setValue(this.supportingText);
		this.editingSupportingText = false;
	}

	updateForm(initialData: IWordCloudSection['content'], supportingText: string, visibleToBrand: boolean) {
		if (!this.form) {
			return this.createForm(initialData, supportingText, visibleToBrand);
		}
		this.form.controls['content'].setValue(initialData);
		this.form.controls['supportingText'].setValue(supportingText);
		this.form.controls['visibleToBrand'].setValue(visibleToBrand);
	}

	onSubmittingSuportingText() {
		this.editingSupportingText = false;
		this.supportingText = this.form.value.supportingText;
		this.emitUpdatedDataToParent();
	}

	saveUpdatedDetails() {
		setTimeout(() => this.emitUpdatedDataToParent());
	}

	cancelContentEdit() {
		this.resetForm();
	}

	addNewPreCampaignFormArray(element?: HTMLElement) {
		const newFormGroup = this.createWordCloudFormGroup(
			{color: DEFAULT_COLORS.PRE_CAMPAIGN, name: '', weight: 0},
			'pre-campaign'
		);
		(this.form.get('content.preCampaign') as FormArray).push(newFormGroup);
		setTimeout(() => {
			if (element) {
				element.scrollTop = element.scrollHeight;
			}
		}, 100);
	}

	addNewDuringCampaignFormArray(element?: HTMLElement) {
		const newFormGroup = this.createWordCloudFormGroup(
			{color: DEFAULT_COLORS.DURING_CAMPAIGN, name: '', weight: 0},
			'duringCampaign'
		);
		(this.form.get('content.duringCampaign') as FormArray).push(newFormGroup);
		setTimeout(() => {
			if (element) {
				element.scrollTop = element.scrollHeight;
			}
		}, 100);
	}

	resetForm() {
		if (!_.isEqual(this.form.value.content.preCampaign, this.preCampaignWordList)) {
			const preCampaignFormArray = this.createContentFormGroup(this.preCampaignWordList, 'pre-campaign');
			const preCampaingControl = this.form.get('content.preCampaign') as FormArray;
			preCampaingControl.clear();
			preCampaignFormArray.controls.forEach((control, i) => {
				preCampaingControl.setControl(i, control);
			});
		}

		if (!_.isEqual(this.form.value.content.duringCampaign, this.duringCampaignWordList)) {
			const duringCampaignFormArray = this.createContentFormGroup(this.duringCampaignWordList, 'duringCampaign');
			const duringCampaingControl = this.form.get('content.duringCampaign') as FormArray;
			duringCampaingControl.clear();
			duringCampaignFormArray.controls.forEach((control, i) => {
				duringCampaingControl.setControl(i, control);
			});
		}
		this.editingSupportingText = false;
	}

	private createWordCloudFormGroup(data: WordCloudData, type: 'pre-campaign' | 'duringCampaign') {
		return this.formBuilder.group({
			name: [
				data.name || '',
				{validators: [type === 'pre-campaign' ? this.PreCampaignListValidator : this.DuringCampaignListValidator]}
			],
			weight: [data.weight || 0, [Validators.min(0)]],
			color: [data.color]
		});
	}

	private PreCampaignListValidator = (control: AbstractControl) => {
		const itemName = (control.value as string)?.trim();
		if (!itemName || !this.form) {
			return null;
		}
		const preCampaingCotnrol = this.form.get('content.preCampaign') as FormArray;
		if (!preCampaingCotnrol.touched) {
			return null;
		}
		const list = preCampaingCotnrol.value as WordCloudData[];
		if (itemName?.length > 100) {
			return {moreThan100: true};
		}
		const filtered = list.filter(obj => obj.name?.trim() === itemName);

		if (filtered.length > 0) {
			return {alreadyExist: true};
		}
		return null;
	};

	private DuringCampaignListValidator = (control: AbstractControl) => {
		const itemName = (control.value as string)?.trim();
		if (!itemName || !this.form || !control.touched) {
			return null;
		}
		const duringCampaignControl = this.form.get('content.duringCampaign') as FormArray;
		if (!duringCampaignControl.touched) {
			return null;
		}

		const list = duringCampaignControl.value as WordCloudData[];
		if (itemName?.length > 100) {
			return {moreThan100: true};
		}

		const filtered = list.filter(obj => obj.name?.trim() === itemName);
		if (filtered.length > 0) {
			return {alreadyExist: true};
		}
		return null;
	};

	private createContentFormGroup(list: WordCloudData[], type: 'pre-campaign' | 'duringCampaign') {
		const arrayControl = this.formBuilder.array([]);
		list.forEach(obj => {
			arrayControl.push(this.createWordCloudFormGroup(obj, type));
		});
		return arrayControl;
	}

	private createForm(initialData: IWordCloudSection['content'], supportingText: string, visibleToBrand: boolean) {
		this.setDuringCmapaingWordList(initialData?.duringCampaign || {});
		this.setPreCampaignWordList(initialData?.preCampaign || {});
		const preCampaignFormArray = this.createContentFormGroup(this.preCampaignWordList, 'pre-campaign');
		const duringCampaignFormArray = this.createContentFormGroup(this.duringCampaignWordList, 'duringCampaign');
		this.form = this.formBuilder.group({
			visibleToBrand: [visibleToBrand || false],
			supportingText: [supportingText || ''],
			preCamapingVisibleToBrand: [this.preCamapingVisibleToBrand],
			duringCamapingVisibleToBrand: [this.duringCamapingVisibleToBrand],
			content: this.formBuilder.group({
				preCampaign: preCampaignFormArray,
				duringCampaign: duringCampaignFormArray
			})
		});

		this.addListenerToForm();
	}

	private addListenerToForm() {
		this.form.get('visibleToBrand').valueChanges.subscribe(newValue => {
			setTimeout(() => {
				if (newValue) {
					this.enableCategoryToggles();
				} else {
					this.disableCategoryToggles();
				}
				if (!this.editingContent) {
					this.emitUpdatedDataToParent();
				}
			});
		});

		const subs = combineLatest([
			this.form.get('preCamapingVisibleToBrand').valueChanges,
			this.form.get('duringCamapingVisibleToBrand').valueChanges
		])
			.pipe(debounceTime(100))
			.subscribe(values => {
				if (!this.form.touched || this.editingContent) {
					return;
				}
				setTimeout(() => this.emitUpdatedDataToParent());
			});
		this.Subscriptions.push(subs);
	}

	private enableCategoryToggles() {
		this.form.get('preCamapingVisibleToBrand').enable();
		this.form.get('duringCamapingVisibleToBrand').enable();
	}

	private disableCategoryToggles() {
		this.form.get('preCamapingVisibleToBrand').disable();
		this.form.get('duringCamapingVisibleToBrand').disable();
	}

	private setDuringCmapaingWordList(data: IWordCloudSection['content']['duringCampaign']) {
		let list: WordCloudData[] = [];
		for (const key in data) {
			list.push({name: key, weight: data[key], color: '#1F77B4'});
		}

		this.duringCampaignWordList = list;
	}

	private setPreCampaignWordList(data: IWordCloudSection['content']['preCampaign']) {
		let list: WordCloudData[] = [];
		for (const key in data) {
			list.push({name: key, weight: data[key], color: '#B6B6B6'});
		}
		this.preCampaignWordList = list;
	}

	private emitUpdatedDataToParent() {
		try {
			const obj = this.form.getRawValue();
			obj.content.preCampaign = this.convertWordCloudListToJSON(obj.content.preCampaign);
			obj.content.duringCampaign = this.convertWordCloudListToJSON(obj.content.duringCampaign);
			this.updatedValue.emit(obj);
		} catch (error) {
			this.logger.critical(error, 'Error during wordcloud emit value to parent');
		}
	}

	private convertWordCloudListToJSON(list: WordCloudData[]) {
		const obj = {};
		list.forEach(data => (obj[data.name] = data.weight));
		return obj;
	}
}
