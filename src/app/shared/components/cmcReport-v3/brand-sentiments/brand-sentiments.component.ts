import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {FileService} from '@sharedModule/services/file.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {WordCloudService} from '@sharedModule/services/word-cloud.service';
import _ from 'lodash';
import {Lightbox, LightboxEvent} from 'ngx-lightbox';
import {combineLatest, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {
	CategoriesSelectionChange,
	ReferenceConversations,
	StackedBarGraphConent
} from '../brand-share-of-voice/stacked-bar-chart/stacked-bar-chart.component';
import {PieSeries} from './donut-chart/donut-chart.component';

export interface BrandSentitmentSection {
	content: BrandSentimentContent;
	visibleToBrand: boolean;
	supportingText?: string;
}

export interface BrandSentimentContent {
	beforeSentimentMap: {likePercentage?: number; dislikePercentage?: number; neutralPercentage?: number};
	beforeSentimentMapVisibleToBrand?: boolean;
	duringSentimentMap: {likePercentage?: number; dislikePercentage?: number; neutralPercentage?: number};
	duringSentimentMapVisibleToBrand?: boolean;

	afterSentimentMap: {likePercentage?: number; dislikePercentage?: number; neutralPercentage?: number};
	afterSentimentMapVisibleToBrand?: boolean;
	referenceConversations: {
		beforeSentimentMap: {
			Positive: boolean;
			Negative: boolean;
			Neutral: boolean;
		};
		duringSentimentMap: {
			Positive: boolean;
			Negative: boolean;
			Neutral: boolean;
		};
		afterSentimentMap: {
			Positive: boolean;
			Negative: boolean;
			Neutral: boolean;
		};
	};
}

@Component({
	selector: 'app-brand-sentiments',
	templateUrl: './brand-sentiments.component.html',
	styleUrls: ['./brand-sentiments.component.scss']
})
export class BrandSentimentsComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Input()
	content: BrandSentimentContent;
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
	brandName: string;
	@Input()
	allSOVDetails: StackedBarGraphConent;
	@Input()
	referenceConversations: ReferenceConversations;

	@Output()
	updatedValue = new EventEmitter<BrandSentitmentSection>(null);
	@Output()
	showReferenceConversation = new EventEmitter<any>(null);

	editingSupportingText = false;
	editingContent = false;

	form: FormGroup;
	COLORS = {
		POSITIVE: '#2CA02C',
		NEGATIVE: '#B23333',
		NEUTRAL: '#E5CF73'
	};

	duringCampaignChartData: PieSeries[];
	beforeCampaingChartData: PieSeries[];
	afterCampaingChartData: PieSeries[];

	Subscriptions: Subscription[] = [];

	constructor(
		injector: Injector,
		private readonly fileService: FileService,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService,
		private wordCloudService: WordCloudService,
		private loggerService: LoggerService,
		private accountService: AccountServiceService,
		private readonly lightbox: Lightbox,
		private _lightboxEvent: LightboxEvent
	) {
		super(injector);
	}

	ngOnInit(): void {
		this.createForm(this.content);
		this.setBeforeCampaignData(this.content);
		this.setDuringCampaignData(this.content);
		this.setAfterCampaignData(this.content);
	}

	onChangingCategoryVisiblity() {
		setTimeout(() => this.emitValueToParent());
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.content && this.form) {
			this.createForm(this.content);

			this.setBeforeCampaignData(change.content.currentValue);
			this.setDuringCampaignData(change.content.currentValue);
			this.setAfterCampaignData(change.content.currentValue);
		}

		if (change.supportingText && !_.isEqual(change.supportingText.currentValue, change.supportingText.previousValue)) {
		}

		if (change.visibleToBrand && !_.isEqual(change.visibleToBrand.currentValue, change.visibleToBrand.previousValue)) {
		}
	}

	onClickingBeforeCampaing(category) {
		if (!this.isBrandLoggedIn || this.content.beforeSentimentMapVisibleToBrand) {
			return this.showReferenceConversation.emit({category: category, type: 'beforeSOV'});
		}
	}

	onClickingDuringCampaing(category) {
		if (!this.isBrandLoggedIn || this.content.duringSentimentMapVisibleToBrand) {
			return this.showReferenceConversation.emit({category: category, type: 'duringSOV'});
		}
	}

	onClickingAfterCampaing(category) {
		if (!this.isBrandLoggedIn || this.content.afterSentimentMapVisibleToBrand) {
			return this.showReferenceConversation.emit({category: category, type: 'afterSOV'});
		}
	}

	setBeforeCampaignData(data: BrandSentimentContent) {
		const list = [];
		const Positive = {
			name: 'Positive',
			y: data?.beforeSentimentMap?.likePercentage || 0,
			color: this.COLORS.POSITIVE,
			showReferenceConversation: data.referenceConversations?.beforeSentimentMap.Positive
		};
		const positiveDot = {
			y: data?.beforeSentimentMap?.likePercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};
		const Neutral = {
			name: 'Neutral',
			y: data?.beforeSentimentMap?.neutralPercentage || 0,
			color: this.COLORS.NEUTRAL,
			showReferenceConversation: data.referenceConversations?.beforeSentimentMap.Neutral
		};
		const neutralDot = {
			y: data?.beforeSentimentMap?.neutralPercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};
		const Negative = {
			name: 'Negative',
			y: data?.beforeSentimentMap?.dislikePercentage || 0,
			color: this.COLORS.NEGATIVE,
			showReferenceConversation: data.referenceConversations?.beforeSentimentMap.Negative
		};
		const negativeDot = {
			y: data?.beforeSentimentMap?.dislikePercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};

		if (Positive.y) {
			list.push(Positive);
			list.push(positiveDot);
		}

		if (Neutral.y) {
			list.push(Neutral);
			list.push(neutralDot);
		}
		if (Negative.y) {
			list.push(Negative);
			list.push(negativeDot);
		}

		this.beforeCampaingChartData = [
			{
				data: list
			}
		];
	}

	setDuringCampaignData(data: BrandSentimentContent) {
		const list = [];
		const Positive = {
			name: 'Positive',
			y: data?.duringSentimentMap?.likePercentage || 0,
			color: this.COLORS.POSITIVE,
			showReferenceConversation: data.referenceConversations?.duringSentimentMap.Positive
		};
		const positiveDot = {
			y: data?.duringSentimentMap?.likePercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};
		const Neutral = {
			name: 'Neutral',
			y: data?.duringSentimentMap?.neutralPercentage || 0,
			color: this.COLORS.NEUTRAL,
			showReferenceConversation: data.referenceConversations?.duringSentimentMap.Neutral
		};
		const neutralDot = {
			y: data?.duringSentimentMap?.neutralPercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};
		const Negative = {
			name: 'Negative',
			y: data?.duringSentimentMap?.dislikePercentage || 0,
			color: this.COLORS.NEGATIVE,
			showReferenceConversation: data.referenceConversations?.duringSentimentMap.Negative
		};
		const negativeDot = {
			y: data?.duringSentimentMap?.dislikePercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};

		if (Positive.y) {
			list.push(Positive);
			list.push(positiveDot);
		}

		if (Neutral.y) {
			list.push(Neutral);
			list.push(neutralDot);
		}
		if (Negative.y) {
			list.push(Negative);
			list.push(negativeDot);
		}

		this.duringCampaignChartData = [
			{
				data: list
			}
		];
	}

	setAfterCampaignData(data: BrandSentimentContent) {
		const list = [];
		const Positive = {
			name: 'Positive',
			y: data?.afterSentimentMap?.likePercentage || 0,
			color: this.COLORS.POSITIVE,
			showReferenceConversation: data.referenceConversations?.duringSentimentMap.Positive
		};
		const positiveDot = {
			y: data?.afterSentimentMap?.likePercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};
		const Neutral = {
			name: 'Neutral',
			y: data?.afterSentimentMap?.neutralPercentage || 0,
			color: this.COLORS.NEUTRAL,
			showReferenceConversation: data.referenceConversations?.duringSentimentMap.Neutral
		};
		const neutralDot = {
			y: data?.afterSentimentMap?.neutralPercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};
		const Negative = {
			name: 'Negative',
			y: data?.afterSentimentMap?.dislikePercentage || 0,
			color: this.COLORS.NEGATIVE,
			showReferenceConversation: data.referenceConversations?.duringSentimentMap.Negative
		};
		const negativeDot = {
			y: data?.afterSentimentMap?.dislikePercentage ? 1 : 0,
			color: 'rgba(0,0,0,0)',
			disableTooltip: true
		};

		if (Positive.y) {
			list.push(Positive);
			list.push(positiveDot);
		}

		if (Neutral.y) {
			list.push(Neutral);
			list.push(neutralDot);
		}
		if (Negative.y) {
			list.push(Negative);
			list.push(negativeDot);
		}

		this.afterCampaingChartData = [
			{
				data: list
			}
		];
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

	onChangingGraphBarSelection(value: CategoriesSelectionChange) {}

	onClickingCategoryBar(category: keyof StackedBarGraphConent) {
		switch (category) {
			case 'beforeSOV':
				if (this.referenceConversations.beforeSOV || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
			case 'afterSOV':
				if (this.referenceConversations.afterSOV || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
			case 'duringSOV':
				if (this.referenceConversations.duringSOV || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
			case 'nonHashTag':
				if (this.referenceConversations.nonHashTag || !this.isBrandLoggedIn) {
					this.showReferenceConversation.emit(category);
				}
				break;
		}
	}

	cancelContentEdit() {
		this.editingContent = false;
		this.form.controls.content.reset({...this.content});
	}

	saveUpdatedDetails() {
		this.emitValueToParent();
	}

	BeforeSentimentValidtor = (control: FormGroup) => {
		if (control.pristine) {
			return null;
		}
		const values: BrandSentimentContent['beforeSentimentMap'] = control.value;
		const total = this.calculateTotalSumofValue(values);

		if (total > 100) {
			return {moreThan100: true};
		}
		if (total < 100) {
			return {lessThan100: true};
		}
		return null;
	};

	DuringSentimentValidtor = (control: FormGroup) => {
		if (control.pristine) {
			return null;
		}
		const values: BrandSentimentContent['duringSentimentMap'] = control.value;
		const total = this.calculateTotalSumofValue(values);
		if (total > 100) {
			return {moreThan100: true};
		}
		if (total < 100) {
			return {lessThan100: true};
		}

		return null;
	};

	AfterSentimentValidtor = (control: FormGroup) => {
		if (control.pristine) {
			return null;
		}
		const values: BrandSentimentContent['afterSentimentMap'] = control.value;
		const total = this.calculateTotalSumofValue(values);
		if (total > 100) {
			return {moreThan100: true};
		}
		if (total < 100) {
			return {lessThan100: true};
		}

		return null;
	};

	emitValueToParent() {
		const contents: StackedBarGraphConent = this.form.getRawValue().content;
		const object: BrandSentitmentSection = {
			...this.form.getRawValue(),
			content: {...contents},
			visibleToBrand: this.form.value.visibleToBrand,
			supportingText: this.form.value.supportingText
		};
		this.updatedValue.emit(object);
	}

	ngOnDestroy() {
		this.Subscriptions.forEach(sub => sub.unsubscribe());
	}

	private createContentControls(data: BrandSentimentContent) {
		const defaultValues = {
			likePercentage: 0,
			dislikePercentage: 0,
			neutralPercentage: 0
		};
		const beforeSentimentMap = this.createFormGroupForJSONProperty(data?.beforeSentimentMap || defaultValues);

		beforeSentimentMap.setValidators([this.BeforeSentimentValidtor]);
		const duringSentimentMap = this.createFormGroupForJSONProperty(data?.duringSentimentMap || defaultValues);
		duringSentimentMap.setValidators([this.DuringSentimentValidtor]);

		const afterSentimentMap = this.createFormGroupForJSONProperty(data?.afterSentimentMap || defaultValues);
		afterSentimentMap.setValidators([this.AfterSentimentValidtor]);

		return this.formBuilder.group({
			afterSentimentMap,
			beforeSentimentMap,
			duringSentimentMap,
			afterSentimentMapVisibleToBrand: [data?.afterSentimentMapVisibleToBrand || false],
			beforeSentimentMapVisibleToBrand: [data?.beforeSentimentMapVisibleToBrand || false],
			duringSentimentMapVisibleToBrand: [data?.duringSentimentMapVisibleToBrand || false]
		});
	}

	private calculateTotalSumofValue(data: BrandSentimentContent['beforeSentimentMap']) {
		let sum = 0;
		for (const key in data) {
			sum += data[key] || 0;
		}

		return sum;
	}

	private createFormGroupForJSONProperty(data: {}, defaultValue?: number | string) {
		const formGroup = this.formBuilder.group({});
		Object.keys(data).forEach(key => {
			const control = this.formBuilder.control(data[key] || 0, {
				validators: [Validators.min(0), Validators.max(100), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]
			});
			formGroup.addControl(key, control);
		});
		return formGroup;
	}

	private createForm(initialData: BrandSentimentContent) {
		const contentControls = this.createContentControls(initialData);
		this.form = this.formBuilder.group({
			content: contentControls,
			visibleToBrand: [this.visibleToBrand || false],
			supportingText: [this.supportingText || '']
		});
		this.addListenerToForms();
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
		const subs = combineLatest([
			(this.form.controls.content as FormGroup).controls.afterSentimentMapVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.beforeSentimentMapVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.duringSentimentMapVisibleToBrand.valueChanges
		])
			.pipe(debounceTime(100))
			.subscribe(values => {
				if (!this.form.touched || this.editingContent) {
					return;
				}
				setTimeout(() => this.emitValueToParent());
			});
		this.Subscriptions.push(subs);
	}

	private disableCategoryToggles() {
		(this.form.controls.content as FormGroup).controls.afterSentimentMapVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.beforeSentimentMapVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.duringSentimentMapVisibleToBrand.disable();
	}

	private enableCategoryToggles() {
		(this.form.controls.content as FormGroup).controls.afterSentimentMapVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.beforeSentimentMapVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.duringSentimentMapVisibleToBrand.enable();
	}
}
