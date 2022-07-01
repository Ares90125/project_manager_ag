import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BrandService} from 'src/app/brand/services/brand.service';
import {CampaignService} from 'src/app/brand/services/campaign.service';
import {BrandModel} from '@sharedModule/models/brand.model';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {Router} from '@angular/router';
import {environment} from 'src/environments/environment';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {CampaignStatusEnum} from 'src/app/shared/models/graph-ql.model';
import * as _ from 'lodash';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-manage-campaigns',
	templateUrl: './manage-campaigns.component.html',
	styleUrls: ['./manage-campaigns.component.scss']
})
export class ManageCampaignsComponent extends BaseComponent implements OnInit, OnDestroy {
	brand: BrandModel;
	campaigns: CampaignModel[];
	showMarketingInsightModel = false;
	pdfLink;
	isCampaignsLoading = false;
	campaignsSortedByDate;
	campaignKeys;
	currentStateOfCampaigns = 'all';
	numberCampaignList = {
		all: null,
		active: null,
		inactive: null,
		pendingApproval: null,
		scheduled: null,
		completed: null
	};
	showCampaignReportView = false;
	selectedCampaign = null;

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private campaignService: CampaignService,
		private readonly router: Router,
		private keywordTrackerService: KeywordTrackerService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.brandService.init();
		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(brand => this.processBrandSelection(brand))
		);
	}

	async processBrandSelection(brand) {
		if (!brand) {
			return;
		}

		this.brand = brand;
		this.brand.loadReports(this.keywordTrackerService);
		this.brand.reports.subscribe(reports => {
			if (!reports) {
				return;
			}

			const showBrandTack = reports.length !== 0;
			this.headerService.showBrandTrackLinkInHeader.next(showBrandTack);
		});
		super.setPageTitle('Manage Campaigns', 'Manage Campaigns', {brandId: brand.id, brandName: brand.name});
		if (environment.brandIdForMarketingInsights.includes(this.brand.id)) {
			this.showMarketingInsightModel = true;
			this.pdfLink = `assets/pdfForMarketInsights/${this.brand.id}.pdf`;
		}
		this.getCampaignsList();
	}

	async getCampaignsList() {
		this.campaigns = await this.brand.getCampaigns();
		if (this.campaigns) {
			this.setCampaignDetailsBasedonStatus();
			this.campaigns = _.orderBy(this.campaigns, [campaign => campaign.startDateAtUTC], ['desc']);
			this.getCampaignsBasedOnStatus(this.currentStateOfCampaigns);
		} else {
			this.campaignKeys = [];
		}
		this.isCampaignsLoading = false;
	}

	setCampaignDetailsBasedonStatus() {
		this.numberCampaignList.all =
			this.campaigns.length + (this.brand.id === 'a60b5777-1557-45f1-97da-4be46880fb46' ? 1 : 0);
		this.numberCampaignList.active = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.Active
		).length;
		this.numberCampaignList.pendingApproval = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.PendingApproval
		).length;
		this.numberCampaignList.completed =
			this.campaigns.filter(campaign => campaign.status === CampaignStatusEnum.Completed).length +
			(this.brand.id === 'a60b5777-1557-45f1-97da-4be46880fb46' ? 1 : 0);
		this.numberCampaignList.scheduled = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.Scheduled
		).length;
	}

	async viewInsights(campaign: CampaignModel) {
		campaign.initiateLoadingMetrics();

		if (!campaign.powerBIDashboardUrl) {
			this.router.navigate(['/brand/brands/' + this.brand.id + '/campaign/' + campaign.campaignId]);
			return;
		}

		this.router.navigate(['/brand/brands/' + this.brand.id + '/campaign/' + campaign.campaignId + '/power-bi']);
	}

	async switchBrand(brand: BrandModel) {
		this.brandService.selectedBrand.next(brand);
	}

	navigateToReviewProposals(statusType) {
		this.getCampaignsBasedOnStatus(statusType);
		const pendingCampaigns = this.campaigns.filter(campaign => campaign.status === statusType);
		if (pendingCampaigns.length === 1) {
			this.showCampaignProposalDetails(pendingCampaigns[0]);
		}
	}

	getCampaignsBasedOnStatus(statusType) {
		this.currentStateOfCampaigns = statusType;
		if (this.campaigns) {
			const campaigns =
				statusType === 'all' ? this.campaigns : this.campaigns.filter(campaign => campaign.status === statusType);
			this.campaignsSortedByDate = _.groupBy(campaigns, campaign => {
				return new DateTime(campaign.startDateAtUTC).format('MMMM, YYYY');
			});
			this.campaignKeys = Object.keys(this.campaignsSortedByDate);
		}
	}

	showCampaignProposalDetails(campaign: CampaignModel) {
		if (campaign.type !== 'CommunityMarketing') {
			return;
		}

		if (campaign.status === 'Suspended') {
			return;
		}

		if (campaign.status !== 'PendingApproval') {
			this.router.navigate(['/brand/brands/' + this.brand.id + '/campaign/' + campaign.campaignId + '/details']);
		} else {
			this.router.navigate(['/brand/brands/' + this.brand.id + '/campaign-proposal/' + campaign.campaignId]);
		}
	}

	closeCampaignProposalView(event) {
		this.showCampaignReportView = event;
		this.selectedCampaign = null;
	}

	async acceptedCampaignProposal(event) {
		this.closeCampaignProposalView(event);
		this.brand.resetDetails();
		await this.getCampaignsList();
		this.getCampaignsBasedOnStatus('PendingApproval');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
