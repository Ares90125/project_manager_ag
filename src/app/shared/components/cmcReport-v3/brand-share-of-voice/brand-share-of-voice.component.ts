import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import * as _ from 'lodash';

import {
	CategoriesSelectionChange,
	CategoryKeys,
	ReferenceConversations,
	StackedBarGraphConent
} from './stacked-bar-chart/stacked-bar-chart.component';

export interface BrandShareofVoiceDetails extends CategoriesSelectionChange {
	content: StackedBarGraphConent;
	supportingText?: string;
	visibleToBrand?: boolean;
	referenceConversation: ReferenceConversations;
}

export type Categories = Partial<Record<CategoryKeys, number>>;

interface TemporarySOVBrandData extends Categories {
	brand: string;
}

@Component({
	selector: 'app-brand-share-of-voice',
	templateUrl: './brand-share-of-voice.component.html',
	styleUrls: ['./brand-share-of-voice.component.scss']
})
export class BrandShareOfVoiceComponent extends BaseComponent implements OnInit, OnChanges {
	@Input()
	content: StackedBarGraphConent;
	@Input()
	supportingText: string;
	@Input()
	visibleToBrand = false;
	@Input()
	isBrandLoggedIn = false;
	@Input()
	showpreCampaign = false;
	@Input()
	showduringCampaign = false;
	@Input()
	showAfterCampaign = false;
	@Input()
	showNonHastag = false;

	@Input()
	brandName: string;
	@Input()
	allSOVDetails: StackedBarGraphConent;
	@Input()
	referenceConversations: ReferenceConversations;

	@Output()
	updatedValue = new EventEmitter<BrandShareofVoiceDetails>(null);
	@Output()
	showReferenceConversation = new EventEmitter<keyof StackedBarGraphConent>(null);

	categorySelection: CategoriesSelectionChange = {};

	editingSupportingText = false;
	editingContent = false;

	form: FormGroup;
	duringCampaignBrandNames: string[] = [];
	totalPercentageBeforeSOV = 0;
	totalPercentageDuringSOV = 0;
	totalPercentageAfterSOV = 0;
	totalPercentagenonHashTag = 0;

	newTemporaryBrandDetail: TemporarySOVBrandData[];
	newlyAddedBrandPool: StackedBarGraphConent = {
		beforeSOV: {},
		duringSOV: {},
		afterSOV: {},
		nonHashTag: {}
	} as StackedBarGraphConent;

	ChartColors = [
		'#2CA02C',
		'#1F77B4',
		'#B23333',
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

	@Input()
	keywords = ['Johnsons', 'Allegra', 'Allerlife', 'Cipla', 'Citrizine', 'Claritine'];

	constructor(injector: Injector, private formBuilder: FormBuilder) {
		super(injector);
	}

	ngOnInit(): void {
		this.createForm(this.content);
	}

	getOthersValueforCategory(category: CategoryKeys) {
		return this.form?.getRawValue()?.content[category]?.Others || 0;
	}

	onSelectingNewBrand(oldBrand: string, brand: string) {
		if (oldBrand === brand) {
			return;
		}
		this.replaceExistingBrand(oldBrand, brand);
	}

	isBrandSelected(brandNameToCheck: string) {
		if (!this.form?.controls?.content) {
			return false;
		}
		return !!(
			(this.form.controls.content as FormGroup).getRawValue().duringSOV.hasOwnProperty(brandNameToCheck) ||
			this.newlyAddedBrandPool?.duringSOV?.hasOwnProperty(brandNameToCheck)
		);
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.content && !_.isEqual(change.content.currentValue, change.content.previousValue) && this.form) {
			this.createForm(change.content.currentValue);
		}

		if (change.supportingText && !_.isEqual(change.supportingText.currentValue, change.supportingText.previousValue)) {
		}

		if (change.visibleToBrand && !_.isEqual(change.visibleToBrand.currentValue, change.visibleToBrand.previousValue)) {
		}
	}

	removeTemporaryBrandAtIndex(index: number) {
		this.newTemporaryBrandDetail = this.newTemporaryBrandDetail
			.slice(0, index)
			.concat(this.newTemporaryBrandDetail.slice(index + 1));
	}

	addNewTemporaryBrandRow() {
		if (!this.newTemporaryBrandDetail) {
			this.newTemporaryBrandDetail = [];
		}
		this.newTemporaryBrandDetail.push({
			brand: '',
			beforeSOV: 0,
			duringSOV: 0,
			afterSOV: 0,
			nonHashTag: 0
		});
	}

	isMaunallyAddedBrand(brandNameToCheck: string) {
		return !!(
			this.newlyAddedBrandPool?.beforeSOV.hasOwnProperty(brandNameToCheck) ||
			this.newlyAddedBrandPool?.duringSOV.hasOwnProperty(brandNameToCheck) ||
			this.newlyAddedBrandPool?.afterSOV.hasOwnProperty(brandNameToCheck) ||
			this.newlyAddedBrandPool?.nonHashTag.hasOwnProperty(brandNameToCheck)
		);
	}

	replaceExistingBrand(originalBrand: string, newBrand: string) {
		const contentControl = this.form.controls.content as FormGroup;

		this.addBrandToForm(newBrand, this.allSOVDetails);
		this.removeBrandFromForm(originalBrand);

		this.reCalculateDuringCampaignList(contentControl.getRawValue().duringSOV);
		this.calculateOthersForCategory('beforeSOV');
		this.calculateOthersForCategory('duringSOV');
		this.calculateOthersForCategory('afterSOV');
		this.calculateOthersForCategory('nonHashTag');
	}

	addBrandToForm(brandName: string, poolToCheckForValue: StackedBarGraphConent) {
		const contentControl = this.form.controls.content as FormGroup;
		const beforeSOV = this.formBuilder.control(poolToCheckForValue?.beforeSOV[brandName] || 0);
		const duringSOV = this.formBuilder.control(poolToCheckForValue?.duringSOV[brandName] || 0);
		const afterSOV = this.formBuilder.control(poolToCheckForValue?.afterSOV[brandName] || 0);
		const nonHashTag = this.formBuilder.control(poolToCheckForValue?.nonHashTag[brandName] || 0);
		(contentControl.controls.beforeSOV as FormGroup).addControl(brandName, beforeSOV);
		(contentControl.controls.duringSOV as FormGroup).addControl(brandName, duringSOV);
		(contentControl.controls.afterSOV as FormGroup).addControl(brandName, afterSOV);
		(contentControl.controls.nonHashTag as FormGroup).addControl(brandName, nonHashTag);
	}

	removeBrandFromForm(brandName: string) {
		const contentControl = this.form.controls.content as FormGroup;
		(contentControl.controls.beforeSOV as FormGroup).removeControl(brandName);
		(contentControl.controls.duringSOV as FormGroup).removeControl(brandName);
		(contentControl.controls.afterSOV as FormGroup).removeControl(brandName);
		(contentControl.controls.nonHashTag as FormGroup).removeControl(brandName);
	}

	onClickingRemoveBrandIcon(brandName: string) {
		this.removeBrandFromForm(brandName);
		this.calculateOthersForCategory('beforeSOV');
		this.calculateOthersForCategory('duringSOV');
		this.calculateOthersForCategory('afterSOV');
		this.calculateOthersForCategory('nonHashTag');
		this.reCalculateDuringCampaignList(this.form.getRawValue().content.duringSOV);
	}

	calculateOthersForCategory(categoryName: CategoryKeys) {
		const beforeSOV = this.form.getRawValue().content[categoryName] as {[brand: string]: number};
		let total = Object.values(beforeSOV).reduce((a: number, b: number) => a + b) - (beforeSOV['Others'] || 0);
		if (this.newTemporaryBrandDetail?.length) {
			const newlyAddedBrandTotal = this.newTemporaryBrandDetail
				.map(obj => obj[categoryName] || 0)
				.reduce((a, b) => a + b);
			total += newlyAddedBrandTotal;
		}
		const remaining = Math.round((100 - total) * 100) / 100;
		const beforeSOVControl = (this.form.controls.content as FormGroup).controls[categoryName] as FormGroup;
		beforeSOVControl.controls.Others.setValue(remaining);
	}

	onSubmittingSuportingText() {
		this.editingSupportingText = false;
		this.supportingText = this.form.value.supportingText;
		this.emitValueToParent();
	}

	cancelEditingSupportingText() {
		this.form.controls?.supportingText.setValue(this.supportingText);
		this.editingSupportingText = false;
	}

	/**
	 *
	 * @description Updates the brand list in form to match the brand list in content.
	 */
	resetBrandsToOriginalList() {
		const brandsInFormDuringSOV = Object.keys(this.form.getRawValue().content?.duringSOV);
		const newBrandsAdded = brandsInFormDuringSOV.filter(brand => !this.content?.duringSOV.hasOwnProperty(brand));
		if (!newBrandsAdded?.length) {
			return;
		}

		const mandatoryBrandList = Object.keys(this.content?.duringSOV || {[this.brandName]: 0});

		const tt = this.form.getRawValue().content.duringSOV;

		const brandMissingInForm = mandatoryBrandList.filter(brand => !tt.hasOwnProperty(brand));
		if (!brandMissingInForm?.length) {
			return;
		}

		newBrandsAdded.forEach((newBrandbrand, i) => {
			this.replaceExistingBrand(newBrandbrand, brandMissingInForm[i]);
		});
	}

	onChangingGraphBarSelection(value: CategoriesSelectionChange) {
		this.categorySelection = {...this.categorySelection, ...value};
		this.form.setValue({...this.form.getRawValue(), ...this.categorySelection});
		this.emitValueToParent();
	}

	onClickingCategoryBar(category) {
		switch (category.type) {
			case 'Pre-Campaign':
				if (this.referenceConversations.beforeSOV || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
			case 'Post-Campaign':
				if (this.referenceConversations.afterSOV || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
			case 'During Campaign':
				if (this.referenceConversations.duringSOV || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
			case 'Non-Hashtag':
				if (this.referenceConversations.nonHashTag || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
		}
	}

	cancelContentEdit() {
		this.resetBrandsToOriginalList();
		this.newTemporaryBrandDetail = null;
	}

	checkForNewlyAddedBrands(): StackedBarGraphConent {
		if (!this.newTemporaryBrandDetail?.length) {
			return null;
		}

		const beforeSOV = {};
		const duringSOV = {};
		const afterSOV = {};
		const nonHashTag = {};
		this.newTemporaryBrandDetail.forEach(obj => {
			if (!obj.brand?.trim()) {
				return;
			}
			beforeSOV[obj.brand] = obj.beforeSOV;
			duringSOV[obj.brand] = obj.duringSOV;
			afterSOV[obj.brand] = obj.afterSOV;
			nonHashTag[obj.brand] = obj.nonHashTag;
		});
		if (!Object.keys(beforeSOV).length) {
			return null;
		}

		return {beforeSOV, duringSOV, afterSOV, nonHashTag};
	}

	saveUpdatedDetails() {
		if (this.newTemporaryBrandDetail?.length) {
			this.addNewlyAddedTemporaryBrandToForm();
			this.reCalculateDuringCampaignList(this.form.getRawValue().content.duringSOV);

			this.resetNewlyAddedBrands();
		}
		// Update brand list
		this.emitValueToParent();
	}

	FormValidator = (control: FormGroup) => {
		const beforeSOVOthers = control.getRawValue().content.beforeSOV.Others;
		if (beforeSOVOthers < 0) {
			return {beforeSOVMoreThan100: true};
		}
		const duringSOVOthers = control.getRawValue().content.duringSOV.Others;
		if (duringSOVOthers < 0) {
			return {duringSOVMoreThan100: true};
		}

		const afterSOVOthers = control.getRawValue().content.afterSOV.Others;
		if (afterSOVOthers < 0) {
			return {afterSOVMoreThan100: true};
		}

		const nonHashTagOthers = control.getRawValue().content.nonHashTag.Others;
		if (nonHashTagOthers < 0) {
			return {nonHashTagMoreThan100: true};
		}
		return null;
	};

	reCalculateDuringCampaignList(data: StackedBarGraphConent['duringSOV']) {
		this.duringCampaignBrandNames = this.getBrandNamesSortedByDuringCampaign(data);
	}

	private addNewlyAddedTemporaryBrandToForm() {
		if (!this.newTemporaryBrandDetail?.length) {
			return;
		}
		this.newTemporaryBrandDetail.forEach(obj => {
			if (!obj.brand.trim()) {
				return;
			}
			const beforeSOV = {...this.newlyAddedBrandPool.beforeSOV, [obj.brand]: obj.beforeSOV};
			const duringSOV = {...this.newlyAddedBrandPool.duringSOV, [obj.brand]: obj.duringSOV};
			const afterSOV = {...this.newlyAddedBrandPool.afterSOV, [obj.brand]: obj.afterSOV};
			const nonHashTag = {...this.newlyAddedBrandPool.nonHashTag, [obj.brand]: obj.nonHashTag};
			this.newlyAddedBrandPool = {beforeSOV, duringSOV, afterSOV, nonHashTag};
			this.addBrandToForm(obj.brand, this.newlyAddedBrandPool);
		});
	}

	private createForm(initialData: BrandShareofVoiceDetails['content']) {
		const contentControls = this.createContentControls(initialData);
		this.form = this.formBuilder.group(
			{
				content: contentControls,
				supportingText: [this.supportingText || ''],
				visibleToBrand: [true],
				beforeSOV: [true],
				duringSOV: [true],
				afterSOV: [true],
				nonHashTag: [true]
			},
			{
				validators: [this.FormValidator]
			}
		);

		this.addListenerToForms();
		this.reCalculateDuringCampaignList(initialData?.duringSOV || {[this.brandName]: 0, Others: 0});
	}

	private addListenerToForms() {
		this.form.controls.visibleToBrand.valueChanges.subscribe(newValue => {
			if (newValue) {
				this.enableCategoryToggles();
			} else {
				this.disableCategoryToggles();
			}
			setTimeout(() => {
				this.emitValueToParent();
			});
		});
	}

	private disableCategoryToggles() {
		this.form.controls.beforeSOV.disable();
		this.form.controls.duringSOV.disable();
		this.form.controls.afterSOV.disable();
		this.form.controls.nonHashTag.disable();
	}

	private enableCategoryToggles() {
		this.form.controls.beforeSOV.enable();
		this.form.controls.duringSOV.enable();
		this.form.controls.afterSOV.enable();
		this.form.controls.nonHashTag.enable();
	}

	private getBrandNamesSortedByDuringCampaign(data: StackedBarGraphConent['duringSOV']) {
		if (!data || !Object.keys(data).length) {
			return ['Others'];
		}
		return Object.keys(data).sort((a, b) => {
			if (a === this.brandName) {
				return -1;
			}
			if (b === this.brandName) {
				return 1;
			}
			if (a === 'Others') {
				return 1;
			}
			if (b === 'Others') {
				return -1;
			}
			return data[b] - data[a];
		});
	}

	private emitValueToParent() {
		const contents: StackedBarGraphConent = this.form.getRawValue().content;
		const object: BrandShareofVoiceDetails = {
			...this.form.getRawValue(),
			content: {...contents},
			visibleToBrand: this.form.value.visibleToBrand,
			supportingText: this.form.value.supportingText,
			referenceConversation: this.referenceConversations
		};

		this.updatedValue.emit(object);
	}

	private resetNewlyAddedBrands() {
		this.newTemporaryBrandDetail = null;
	}

	private createContentControls(data: StackedBarGraphConent) {
		const beforeSOVControl = this.createBrandsFormControls(
			data?.beforeSOV || {Others: 0, [this.brandName]: 0},
			data?.duringSOV || {Others: 0, [this.brandName]: 0}
		);
		const duringSOVControl = this.createBrandsFormControls(
			data?.duringSOV || {Others: 0, [this.brandName]: 0},
			data?.duringSOV || {Others: 0, [this.brandName]: 0}
		);
		const afterSOVControl = this.createBrandsFormControls(
			data?.afterSOV || {Others: 0, [this.brandName]: 0},
			data?.duringSOV || {Others: 0, [this.brandName]: 0}
		);
		const nonHashTagControl = this.createBrandsFormControls(
			data?.nonHashTag || {Others: 0, [this.brandName]: 0},
			data?.duringSOV || {Others: 0, [this.brandName]: 0}
		);
		const contentControls = this.formBuilder.group({});
		contentControls.addControl('beforeSOV', beforeSOVControl);
		contentControls.addControl('duringSOV', duringSOVControl);
		contentControls.addControl('afterSOV', afterSOVControl);
		contentControls.addControl('nonHashTag', nonHashTagControl);
		return contentControls;
	}

	private createBrandsFormControls(data: {}, duringSov: StackedBarGraphConent['duringSOV']) {
		const formGroup = this.formBuilder.group({});
		if (!duringSov) {
			return formGroup;
		}
		Object.keys(duringSov).forEach(brandName => {
			const control = this.formBuilder.control(data[brandName] || 0, [
				Validators.min(0),
				Validators.max(100),
				Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)
			]);
			if (brandName === 'Others') {
				control.disable();
			}
			formGroup.addControl(brandName, control);
		});
		return formGroup;
	}
}
