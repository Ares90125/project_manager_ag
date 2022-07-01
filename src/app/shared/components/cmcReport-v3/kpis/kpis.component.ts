import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import * as _ from 'lodash';
import {combineLatest, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {KPIChartContent} from './kpi-chart/kpi-chart.component';

export interface IUpdatedKPISection {
	content: Content;
	supportingText?: string;
	visibleToBrand?: boolean;
}

interface Content {
	// Admin Post
	numAdminPostsBefore: number;
	numAdminPosts: number;
	numAdminPostsTarget: number;
	numAdminPostsVisibleToBrand: boolean;

	// Category Conversation
	numDuringCatConversations: number;
	numBeforeCatConversations: number;
	numTargetCatConversations: number;
	categoryConversationVisibleToBrand?: boolean;

	// Brand Mention
	numDuringBrandMentions: number;
	numBeforeBrandMentions: number;
	numTargetBrandMentions: number;
	brandMentionsVisibleToBrand?: boolean;

	// SOV
	brandPercentageBeforeSov: number;
	brandPercentageDuringSov: number;
	brandPercentageTargetSov: number;
	brandShareofVoiceVisibleToBrand?: boolean;

	// Total UGC
	totalUGCVisibleToBrand: boolean;
	totalUGCTarget: number;

	// UGC Posts: Comment
	numUGCCommentsBefore: number;
	numUGCCommentsTarget: number;
	numUGCComments: number;
	numUGCCommentsVisibleToBrand: boolean;

	// UGC Posts: Reactions
	numUGCPostsBefore: number;
	numUGCPostsTarget: number;
	numUGCPosts: number;
	numUGCPostsVisibleToBrand: boolean;

	// Total Reaction and Comments
	totalReactionAndCommentVisibleToBrand: boolean;
	totalReactAnCommentTarget: number;

	//Reaction and comments: Admin Post
	numReactionAndCommentAdminPostBefore: number;
	numReactionAndCommentAdminPostTarget: number;
	numReactionAndCommentAdminPost: number;
	numReactionAndCommentAdminPostVisibleToBrand: boolean;

	// Reaction an Comments: Net New Post
	numReactionAndCommentUGCPostBefore: number;
	numReactionAndCommentUGCPostTarget: number;
	numReactionAndCommentUGCPost: number;
	numReactionAndCommentUGCPostVisibleToBrand: boolean;

	// Estimated Impression
	estimateImpressionBeforeCampaign: number;
	estimateImpressionDuringCampaign: number;
	estimateImpressionTargetCampaign: number;
	estimateImpressionVisibleToBrand: boolean;

	// Total Engagement
	totalEngagementBeforeCampaign: number;
	totalEngagementDuringCampaign: number;
	totalEngagementTargetCampaign: number;
	totalEngagementVisibleToBrand: boolean;
}

@Component({
	selector: 'app-kpis',
	templateUrl: './kpis.component.html',
	styleUrls: ['./kpis.component.scss']
})
export class KpisComponent extends BaseComponent implements OnInit, OnChanges {
	@Input()
	content: Content;

	@Input()
	supportingText: string;

	@Input()
	isBrandLoggedIn = true;
	@Input()
	visibleToBrand = false;

	@Output()
	updatedValue = new EventEmitter<IUpdatedKPISection>();

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
	adminGraphData: KPIChartContent;
	categoryConversationGraphData: KPIChartContent;
	brandMentionGraphData: KPIChartContent;
	sovGraphData: KPIChartContent;
	totalUGCGraphData: KPIChartContent;
	ugcCommentGraphData: KPIChartContent;
	ugcNewPostsGraphData: KPIChartContent;
	totalReactionAndCommentGraphData: KPIChartContent;
	adminPostGraphData: KPIChartContent;
	ugcPostPostsGraphData: KPIChartContent;
	estimatedImpressionGraphData: KPIChartContent;
	totalEngagementGraphData: KPIChartContent;
	showTooltip: {[key: number]: boolean};

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
		this.changeInCategoryConversation =
			Math.round((content.numDuringCatConversations / content.numBeforeCatConversations) * 100) / 100;
		if (isNaN(this.changeInCategoryConversation)) {
			this.changeInCategoryConversation = 0;
		}

		this.changeInBrandMentions =
			Math.round((content.numDuringBrandMentions / content.numBeforeBrandMentions) * 100) / 100;
		if (isNaN(this.changeInBrandMentions)) {
			this.changeInBrandMentions = 0;
		}

		this.changeInBrandSov =
			Math.round((content.brandPercentageDuringSov / content.brandPercentageBeforeSov) * 100) / 100;
		if (isNaN(this.changeInBrandSov)) {
			this.changeInBrandSov = 0;
		}
	}

	createFormControls(data?: Content) {
		return this.formBuilder.group({
			numAdminPosts: [data?.numAdminPosts || 0, [Validators.min(0)]],
			numAdminPostsBefore: [data?.numAdminPostsBefore || 0, [Validators.min(0)]],
			numAdminPostsTarget: [data?.numAdminPostsTarget || 0, [Validators.min(0)]],
			numAdminPostsVisibleToBrand: [data?.numAdminPostsVisibleToBrand || false],

			// Category Conversation
			numDuringCatConversations: [data?.numDuringCatConversations || 0, [Validators.min(0)]],
			numTargetCatConversations: [data?.numDuringCatConversations || 0, [Validators.min(0)]],
			categoryConversationVisibleToBrand: [false],
			numBeforeCatConversations: [data?.numBeforeCatConversations || 0, [Validators.min(0)]],

			// Brand Mention
			numDuringBrandMentions: [data?.numDuringBrandMentions || 0, [Validators.min(0)]],
			numBeforeBrandMentions: [data?.numBeforeBrandMentions || 0, [Validators.min(0)]],
			numTargetBrandMentions: [data?.numBeforeBrandMentions || 0, [Validators.min(0)]],
			brandMentionsVisibleToBrand: [false],

			// Brand SOV
			brandPercentageBeforeSov: [
				data?.brandPercentageBeforeSov || 0,
				[Validators.max(100), Validators.min(0), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]
			],
			brandPercentageDuringSov: [
				data?.brandPercentageDuringSov || 0,
				[Validators.max(100), Validators.min(0), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]
			],
			brandPercentageTargetSov: [
				data?.brandPercentageDuringSov || 0,
				[Validators.max(100), Validators.min(0), Validators.pattern(/^[0-9]*(\.[0-9]{0,2})?$/)]
			],
			brandShareofVoiceVisibleToBrand: [data?.brandShareofVoiceVisibleToBrand],

			// Total UGC
			totalUGCVisibleToBrand: [data?.totalUGCVisibleToBrand || 0, [Validators.min(0)]],
			totalUGCTarget: [data?.totalUGCTarget || 0, [Validators.min(0)]],

			// UGC - Comment
			numUGCComments: [data?.numUGCComments || 0, [Validators.min(0)]],
			numUGCCommentsBefore: [data?.numUGCComments || 0, [Validators.min(0)]],
			numUGCCommentsTarget: [data?.numUGCCommentsTarget || 0, [Validators.min(0)]],
			numUGCCommentsVisibleToBrand: [data?.numUGCCommentsVisibleToBrand],

			// UGC - Post
			numUGCPosts: [data?.numUGCPosts || 0, [Validators.min(0)]],
			numUGCPostsBefore: [data?.numUGCPostsBefore || 0, [Validators.min(0)]],
			numUGCPostsTarget: [data?.numUGCPostsTarget || 0, [Validators.min(0)]],
			numUGCPostsVisibleToBrand: [data?.numUGCPostsVisibleToBrand || 0, [Validators.min(0)]],

			// Total Reaction and Comments
			totalReactionAndCommentVisibleToBrand: [data?.totalReactionAndCommentVisibleToBrand],
			totalReactAnCommentTarget: [data?.totalReactAnCommentTarget || 0, [Validators.min(0)]],

			// Reaction and Comments: Admin Post
			numReactionAndCommentAdminPost: [data?.numReactionAndCommentAdminPost || 0, [Validators.min(0)]],
			numReactionAndCommentAdminPostBefore: [data?.numReactionAndCommentAdminPostBefore || 0, [Validators.min(0)]],
			numReactionAndCommentAdminPostTarget: [data?.numReactionAndCommentAdminPostTarget || 0, [Validators.min(0)]],
			numReactionAndCommentAdminPostVisibleToBrand: [data?.numReactionAndCommentAdminPostVisibleToBrand],

			// Reaction and Comments: UGC Post
			numReactionAndCommentUGCPost: [data?.numReactionAndCommentUGCPost || 0, [Validators.min(0)]],
			numReactionAndCommentUGCPostBefore: [data?.numReactionAndCommentUGCPostBefore || 0, [Validators.min(0)]],
			numReactionAndCommentUGCPostTarget: [data?.numReactionAndCommentUGCPostTarget || 0, [Validators.min(0)]],
			numReactionAndCommentUGCPostVisibleToBrand: [data?.numReactionAndCommentUGCPostVisibleToBrand],

			estimateImpressionDuringCampaign: [data?.estimateImpressionDuringCampaign || 0, [Validators.min(0)]],
			estimateImpressionBeforeCampaign: [data?.estimateImpressionBeforeCampaign || 0, [Validators.min(0)]],
			estimateImpressionTargetCampaign: [data?.estimateImpressionTargetCampaign || 0, [Validators.min(0)]],
			estimateImpressionVisibleToBrand: [data?.estimateImpressionVisibleToBrand],

			totalEngagementBeforeCampaign: [data?.totalEngagementBeforeCampaign || 0, [Validators.min(0)]],
			totalEngagementDuringCampaign: [data?.totalEngagementDuringCampaign || 0, [Validators.min(0)]],
			totalEngagementTargetCampaign: [data?.totalEngagementTargetCampaign || 0, [Validators.min(0)]],
			totalEngagementVisibleToBrand: [data?.totalEngagementVisibleToBrand || 0, [Validators.min(0)]]
		});
	}

	createForm(content?: Content, supportingText?: string, visibleToBrand?: boolean) {
		this.form = this.formBuilder.group({
			content: this.createFormControls(content),
			supportingText: [supportingText || ''],
			visibleToBrand: [visibleToBrand]
		});
		if (!visibleToBrand) {
			this.disableSubSectionSwitches();
		}
		this.form.controls['visibleToBrand'].valueChanges.subscribe(newValue => {
			if (newValue) {
				this.enableAllMetricsControls();
			} else {
				this.disableSubSectionSwitches();
			}
			setTimeout(() => this.emitUpdatedDataToParent());
		});

		this.listenToContentFields();
	}

	listenToContentFields() {
		const subs = combineLatest([
			(this.form.controls.content as FormGroup).controls.numAdminPostsVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.categoryConversationVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.brandMentionsVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.brandShareofVoiceVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.totalUGCVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.numUGCCommentsVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.numUGCPostsVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.totalReactionAndCommentVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.numReactionAndCommentAdminPostVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.numReactionAndCommentUGCPostVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.estimateImpressionVisibleToBrand.valueChanges,
			(this.form.controls.content as FormGroup).controls.totalEngagementVisibleToBrand.valueChanges
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

	disableSubSectionSwitches() {
		(this.form.controls.content as FormGroup).controls.numAdminPostsVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.categoryConversationVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.brandMentionsVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.brandShareofVoiceVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.totalUGCVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.numUGCCommentsVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.numUGCPostsVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.totalReactionAndCommentVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.numReactionAndCommentAdminPostVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.numReactionAndCommentUGCPostVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.estimateImpressionVisibleToBrand.disable();
		(this.form.controls.content as FormGroup).controls.totalEngagementVisibleToBrand.disable();
	}

	enableAllMetricsControls() {
		(this.form.controls.content as FormGroup).controls.numAdminPostsVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.categoryConversationVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.brandMentionsVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.brandShareofVoiceVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.totalUGCVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.numUGCCommentsVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.numUGCPostsVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.totalReactionAndCommentVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.numReactionAndCommentAdminPostVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.numReactionAndCommentUGCPostVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.estimateImpressionVisibleToBrand.enable();
		(this.form.controls.content as FormGroup).controls.totalEngagementVisibleToBrand.enable();
	}

	updateForm(newData: Content, supportingText: string, visibleToBrand: boolean) {
		if (!this.form) {
			this.calculateDataForSubSections(newData);
			return this.createForm(newData, supportingText, visibleToBrand);
		}
		if (!_.isEqual((this.form.controls.content as FormGroup).getRawValue(), newData)) {
			this.form.controls['content'].setValue({
				...(this.form.controls.content as FormGroup).getRawValue(),
				...newData
			});
			this.calculateDataForSubSections(newData);
		}

		this.form.controls['supportingText'].setValue(supportingText);
		if (visibleToBrand != this.form.controls.visibleToBrand.value) {
			this.form.controls['visibleToBrand'].setValue(visibleToBrand);
		}
	}

	calculateDataForSubSections(data: Content) {
		this.adminGraphData = {
			preCampaign: data?.numAdminPostsBefore || 0,
			target: data?.numAdminPostsTarget || 0,
			achieved: data?.numAdminPosts || 0
		};
		this.categoryConversationGraphData = {
			preCampaign: data?.numBeforeCatConversations || 0,
			target: data?.numTargetCatConversations || 0,
			achieved: data?.numDuringCatConversations || 0
		};
		this.brandMentionGraphData = {
			preCampaign: data?.numBeforeBrandMentions || 0,
			target: data?.numTargetBrandMentions || 0,
			achieved: data?.numDuringBrandMentions || 0
		};
		this.sovGraphData = {
			preCampaign: data?.brandPercentageBeforeSov || 0,
			target: data?.brandPercentageTargetSov || 0,
			achieved: data?.brandPercentageDuringSov || 0
		};

		this.ugcCommentGraphData = {
			preCampaign: data?.numUGCCommentsBefore || 0,
			target: data?.numUGCCommentsTarget || 0,
			achieved: data?.numUGCComments || 0
		};

		this.ugcNewPostsGraphData = {
			preCampaign: data?.numUGCPostsBefore || 0,
			target: data?.numUGCPostsTarget || 0,
			achieved: data?.numUGCPosts || 0
		};
		this.totalUGCGraphData = {
			preCampaign: this.ugcNewPostsGraphData.preCampaign + this.ugcCommentGraphData.preCampaign,
			target: data?.totalUGCTarget || 0,
			achieved: this.ugcNewPostsGraphData.achieved + this.ugcCommentGraphData.achieved
		};

		this.adminPostGraphData = {
			preCampaign: data?.numReactionAndCommentAdminPostBefore || 0,
			target: data?.numReactionAndCommentAdminPostTarget || 0,
			achieved: data?.numReactionAndCommentAdminPost || 0
		};
		this.ugcPostPostsGraphData = {
			preCampaign: data?.numReactionAndCommentUGCPostBefore || 0,
			target: data?.numReactionAndCommentUGCPostTarget || 0,
			achieved: data?.numReactionAndCommentUGCPost || 0
		};
		this.totalReactionAndCommentGraphData = {
			preCampaign: this.adminPostGraphData.preCampaign + this.ugcPostPostsGraphData.preCampaign,
			target: data?.totalReactAnCommentTarget || 0,
			achieved: this.adminPostGraphData.achieved + this.ugcPostPostsGraphData.achieved
		};
		this.estimatedImpressionGraphData = {
			preCampaign: data?.estimateImpressionBeforeCampaign || 0,
			target: data?.estimateImpressionTargetCampaign || 0,
			achieved: data?.estimateImpressionDuringCampaign || 0
		};

		this.totalEngagementGraphData = {
			preCampaign: data?.totalEngagementBeforeCampaign || 0,
			target: data?.totalEngagementTargetCampaign || 0,
			achieved: data?.totalEngagementDuringCampaign || 0
		};
	}

	onSubmittingSuportingText() {
		this.editingSupportingText = false;
		this.supportingText = this.form.value.supportingText;
		this.emitUpdatedDataToParent();
	}

	saveUpdatedDetails() {
		this.isUserEditingPopupContent = false;
		this.calculateDataForSubSections(this.form.getRawValue().content);

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

	onMouseEnter(id: number) {
		if (!this.showTooltip) {
			this.showTooltip = {};
		}
		this.showTooltip[id] = true;
	}

	onMouseLeave(id: number) {
		if (!this.showTooltip) {
			this.showTooltip = {};
		}
		this.showTooltip[id] = false;
	}
}
