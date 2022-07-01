import {Injector} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';

import {IPieChartData} from './engagement-insight-chart/engagement-insight-chart.component';
import {IBucket} from './intent/intent.component';

export class BaseEngagementInsight extends BaseComponent {
	chartList: IPieChartData[];

	form: FormGroup;
	editingpopupContent = false;

	ChartColors = [
		'#9467BD',
		'#17BECF',
		'#BCBD22',
		'#8C564B',
		'#FF7F0E',
		'#C5B0D5',
		'#E377C2',
		'#98DF8A',
		'#FFBB78',
		'#F7B6D2',
		'#DBDB8D',
		'#9EDAE5',
		'#7F7F7F'
	] as const;
	totalPercentage: number;

	constructor(injector: Injector, public formBuilder: FormBuilder) {
		super(injector);
	}

	get formControls() {
		return this.form?.get('content') as FormArray;
	}

	createForm(data: IBucket[]) {
		const controls = this.createFormArray(data);
		this.form = this.formBuilder.group({
			content: controls,
			visibleToBrand: true
		});
		this.form.get('visibleToBrand').valueChanges.subscribe(newValue => {
			if (newValue) {
				this.enableToggles();
			} else {
				this.disableBucketToggles();
			}
		});
		this.form.valueChanges.subscribe(newValue => {
			this.calculateTotalPercentage();
		});
	}

	enableToggles() {
		const controlArray = this.form.get('content') as FormArray;
		controlArray.controls.forEach((formGroup: FormGroup) => {
			formGroup.get('visibleToBrand').enable();
		});
	}

	disableBucketToggles() {
		const controlArray = this.form.get('content') as FormArray;
		controlArray.controls.forEach((formGroup: FormGroup) => {
			formGroup.get('visibleToBrand').disable();
		});
	}

	onChangingShareVaue() {
		return;
		setTimeout(() => this.calculateTotalPercentage());
	}

	calculateTotalPercentage() {
		const data = this.form.value.content as IBucket[];
		this.totalPercentage = data?.length ? data.map(obj => obj.y).reduce((a, b) => (a || 0) + (b || 0)) : 100;
		if (this.totalPercentage == 100) {
			return this.form.setErrors(null);
		}
		if (this.totalPercentage < 100) {
			return this.form.setErrors({lessThan100: true});
		}
		this.form.setErrors({moreThan100: true});
	}

	saveUpdatedDetails() {
		this.emitValueToParent(this.form.getRawValue());
		this.editingpopupContent = false;
	}

	cancelContentEdit(data) {
		const contentControl = this.form.get('content') as FormArray;
		contentControl.clear();
		const contentControls = this.createFormArray(data);
		contentControls.controls.forEach((control, i) => contentControl.setControl(i, control));
	}

	addNewRow() {
		const control = this.form.get('content') as FormArray;
		control.controls;

		control.push(
			this.createFormGroupForBucket({
				color: this.getAvaialableColors() || this.getRandomRgb(),
				keywords: '',
				name: '',
				visibleToBrand: true,
				y: 0
			})
		);
	}

	removeControlAtIndex(index: number) {
		(this.form.get('content') as FormArray).removeAt(index);
	}

	emitValueToParent(obj: any) {
		// NOTE: Implement this in the main class
		// this.valueUpdated.emit(obj);
	}

	sharePercentageValidator = (control: AbstractControl) => {
		if (!this.form) {
			return null;
		}
		this.calculateTotalPercentage();
	};

	protected updateChartList(list: IBucket[]) {
		// NOTE: Implement in main class
		// this.chartList = list.filter(data => {
		// 	if (!this.isBrandLoggedIn) return true;
		// 	return data.visibleToBrand;
		// });
	}

	protected getRandomRgb() {
		var num = Math.round(0xffffff * Math.random());
		var r = num >> 16;
		var g = (num >> 8) & 255;
		var b = num & 255;
		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	}

	protected createFormGroupForBucket(data: IBucket) {
		const formGroup = this.formBuilder.group({
			name: [data.name, {validators: this.BucketNameValidator}],
			y: [data.y, [Validators.min(0), Validators.max(100), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]],
			color: data.color,
			keywords: data.keywords,
			visibleToBrand: data.visibleToBrand,
			showReferenceConversation: data.showReferenceConversation || false
		});
		if (this.form && !this.form.get('visibleToBrand').value) {
			formGroup.get('visibleToBrand').disable();
		}
		return formGroup;
	}

	protected BucketNameValidator = (control: AbstractControl) => {
		if (!this.form || !this.form.touched || !control.value?.trim() || control.pristine) {
			return;
		}
		const list = this.form.get('content').value as IBucket[];
		if (control.value?.length > 100) {
			return {moreThan100: true};
		}
		const hasSameName = list.filter(obj => obj.name === control.value);
		if (hasSameName?.length) {
			return {duplicateName: true};
		}

		return null;
	};

	protected createFormArray(list: IBucket[]) {
		const formArray = this.formBuilder.array([]);
		list?.forEach((data, i) => {
			const bucketControl = this.createFormGroupForBucket({...data, color: this.ChartColors[i]});
			formArray.push(bucketControl);
		});
		return formArray;
	}

	private getAvaialableColors() {
		const usedColor = this.form.get('content').value as IBucket[];
		const unusedColor = this.ChartColors.find(chartColor => !usedColor.find(obj => obj.color === chartColor));
		return unusedColor;
	}
}
