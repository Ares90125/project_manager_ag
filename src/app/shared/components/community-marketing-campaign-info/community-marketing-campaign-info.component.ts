import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {ICampaignModelProperty} from '@sharedModule/models/campaign.model';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignStatusEnum, UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import dayjs from 'dayjs';
import {Subject} from 'rxjs';

@Component({
	selector: 'app-community-marketing-campaign-info',
	templateUrl: './community-marketing-campaign-info.component.html',
	styleUrls: ['./community-marketing-campaign-info.component.scss']
})
export class CommunityMarketingCampaignInfoComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() brand;
	@Input() isReportEdit = false;

	@Input() set campaignTasks(value) {
		this.tasks = value ? value : [];
	}

	@Output() closeCampaignDetail = new EventEmitter();
	@Output() campaignDetailsToCreateCampaign = new EventEmitter();

	minDate = new DateTime().toDate();
	submittingCampaignDetails = false;
	tasks = [];
	invalidTaskPublishDate = false;
	invalidDefaultPublishDate = false;
	campaignDetails: ICampaignModelProperty;
	campaignDetailFormValidStatus = false;
	groupsSelectedForCampaignCreation = [];
	sendCreatedCampaignToParent = new EventEmitter();
	isFirstTimeSubmitted = false;
	resetCampaignDetails: Subject<boolean> = new Subject<boolean>();

	quillConfig = {
		toolbar: [['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]]
	};

	constructor(
		injector: Injector,
		private readonly createCampaignService: CreateCampaignService,
		private router: Router
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	async sendCampaignDetails() {
		this.isFirstTimeSubmitted = true;
		if (!this.campaignDetailFormValidStatus) {
			return;
		}
		this.submittingCampaignDetails = true;
		const proposalEmails = [];
		const campaignData = {
			brandId: this.brand.id,
			brandName: this.brand.name,
			phaseIdea: this.campaignDetails.phaseIdea,
			currentPhase: this.campaignDetails.currentPhase,
			totalPhase: this.campaignDetails.totalPhase,
			currency: this.campaignDetails.currency,
			communicationChannel: this.campaignDetails.communicationChannel || null
		};
		campaignData['brandId'] = this.brand.id;
		campaignData['brandName'] = this.brand.name;
		if (this.campaign) {
			campaignData['campaignId'] = this.campaign['campaignId'];
			campaignData['campaignName'] = this.campaignDetails['cmcReportName'];
			campaignData['status'] = this.campaign.status;
		} else {
			campaignData['brandLogoURL'] = this.brand.iconUrl;
			campaignData['campaignName'] = this.campaignDetails['cmcReportName'];
			campaignData['status'] = CampaignStatusEnum.Draft;
		}
		campaignData['campaignBriefForCommunityAdmin'] = this.campaignDetails['brief'];
		campaignData['details'] = this.campaignDetails['details'];
		campaignData['startDateAtUTC'] = dayjs(this.campaignDetails['startDate']).startOf('day').utc().toISOString();
		campaignData['endDateAtUTC'] = dayjs(this.campaignDetails['endDate']).endOf('day').utc().toISOString();
		campaignData['KPIs'] = this.campaignDetails['KPIs'];
		campaignData['cmcType'] = this.campaignDetails['cmcType'];
		campaignData['objective'] = this.campaignDetails['objective'];
		campaignData['keywordCategory'] = this.campaignDetails['keywordCategory'];
		campaignData['keywordBrand'] = this.campaignDetails['keywordBrand'];
		campaignData['keywords'] = this.campaignDetails['keywords'];
		campaignData['keywordSubCategories'] = this.campaignDetails['keywordSubCategories'];
		campaignData['campaignSummary'] = this.campaignDetails['campaignSummary'];
		campaignData['proposalEmails'] = proposalEmails;
		campaignData['cmcReportName'] = this.campaignDetails['campaignName'];
		campaignData['primaryObjective'] = this.campaignDetails['primaryObjective'];
		campaignData['secondaryObjective'] = this.campaignDetails['secondaryObjective'];
		campaignData['taskTitle'] = this.campaignDetails['taskTitle'];
		campaignData['typeformId'] = this.campaignDetails['typeformId'];
		campaignData['campaignPeriod'] = this.campaignDetails['campaignPeriod'];
		campaignData['defaultPostContentType'] = this.campaignDetails['defaultPostContentType'];
		campaignData['cmcReportVersion'] = this.campaign ? this.campaign['cmcReportVersion'] : 2;
		campaignData['timezoneName'] = this.campaignDetails['timezoneName'];
		campaignData['productPurchaseRequired'] = this.campaignDetails['productPurchaseRequired'];
		campaignData['productPurchaseInfo'] = this.campaignDetails['productPurchaseInfo'];
		campaignData['trainingLinkMessage'] = this.campaignDetails['trainingLinkMessage'];
		campaignData['assetsTextRequired'] = this.campaignDetails['assetsTextRequired'];
		campaignData['assetsImagesRequired'] = this.campaignDetails['assetsImagesRequired'];
		campaignData['assetsVideoRequired'] = this.campaignDetails['assetsVideoRequired'];
		if (this.campaignDetails['defaultTaskDate']) {
			campaignData['defaultTaskDate'] = this.campaignDetails['defaultTaskDate']
				.add(this.campaignDetails['timezoneOffMins'], 'minutes')
				.utc()
				.toISOString();
		}

		let campaignDetails;
		try {
			if (this.campaign) {
				campaignDetails = await this.createCampaignService.updateCampaignDetails(
					campaignData as unknown as UpdateCampaignInput
				);
				this.brand.resetDetails();
				this.alert.success(
					'Check campaign list for selected brand',
					'Campaign details updated successfully',
					5000,
					true
				);
			} else {
				campaignData['engagementInsights'] = [
					'intent|Purchase Intent:_get_,_Buy_,Bought,Price,Cost,_pp_,discount,sale,amazon,_shop_,purchase,khareed,kharid,will%try,want%try,will%use,want%use',
					'intent|Recommendations:_try_,Reco,Recco,suggest,go for it,must%buy,should%buy',
					'intent|Usage:using,used,tried,_got_,apply,applied,istemal,_laga_,_lagaa_',
					'emotions|Positive Emotion:_Great_,awesome,love,fantastic,excellent,excelent,good,_gud_,_super_,superb,accha,amazing,badhiya,badiya,favorite,favourite,favorit,favourit,favrit,_best_'
				];
				campaignDetails = await this.createCampaignService.createCampaign(campaignData);
				this.brand.resetDetails();
				this.alert.success('Check campaign list for selected brand', 'Campaign created successfully', 5000, true);
				this.router.navigateByUrl(
					'/cs-admin/brands/' + this.brand.id + '/edit-campaign/' + campaignDetails.campaignId + '#details'
				);
			}
			this.closeCampaignDetail.emit(campaignDetails);
			this.submittingCampaignDetails = false;
			if (this.isReportEdit) {
				document.getElementById('cancel').click();
			}
			this.submittingCampaignDetails = false;
		} catch (e) {
			console.log(e);
			this.alert.error(
				'Campaign creation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
			this.submittingCampaignDetails = false;
		}
	}

	formSubmitValue(formValue: ICampaignModelProperty) {
		this.campaignDetails = formValue;
	}

	updateFormValidStatus(event) {
		this.campaignDetailFormValidStatus = event;
	}

	discardChanges() {
		this.resetCampaignDetails.next(true);
	}

	redirectToKPIReport() {
		window.open(`https://kpi.convosight.com/?campaignId=${this.campaign['campaignId']}`, '_blank');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
