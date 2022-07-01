import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {BrandService} from 'src/app/brand/services/brand.service';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {CampaignModel} from 'src/app/shared/models/campaign.model';
import {CampaignStatusEnum} from 'src/app/shared/models/graph-ql.model';
import {UserModel} from 'src/app/shared/models/user.model';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-list-brand-campaigns',
	templateUrl: './list-brand-campaigns.component.html',
	styleUrls: ['./list-brand-campaigns.component.scss']
})
export class ListBrandCampaignsComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	brands: BrandModel[];
	brand: BrandModel;
	campaigns: CampaignModel[];
	currentStateOfCampaigns = 'all';
	numberCampaignList = {
		all: null,
		draft: null,
		pendingApproval: null,
		scheduled: null,
		active: null,
		completed: null,
		suspended: null
	};
	isCampaignsLoading = false;
	campainsSortedByDate;
	campaignKeys;

	selectedCampaign: CampaignModel;
	isSubmitting = false;

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		super.setPageTitle('Manage Brand Campaigns', 'Manage Brand Campaigns');
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				const id = params['brandId'];
				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(brands => {
						if (!brands) {
							return;
						}

						this.brands = brands;
						const selectedBrand = brands.find(brnd => brnd.id === id);
						this.brandService.selectedBrand.next(selectedBrand);
					})
				);
			})
		);

		this.brandService.init();

		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(async brand => {
				if (!brand) {
					return;
				}

				this.brand = brand;
				this.isCampaignsLoading = true;
				this.campaigns = await this.brand.getCampaigns();
				this.setNumberCampaignBasedOnStatus();
				this.isCampaignsLoading = false;
			})
		);
	}

	async selectBrand(brand: BrandModel) {
		this.brandService.selectedBrand.next(brand);
	}

	async openCampaign(brand: BrandModel, campaign: CampaignModel) {
		this.brandService.selectedBrand.next(brand);
		this.router.navigate([]).then(() => {
			window.open('/cs-admin/brands/' + brand.id + '/campaigns/' + campaign.campaignId, '_blank');
		});
	}

	async createCampaignType(brand: BrandModel) {
		this.router.navigateByUrl('/cs-admin/brands/' + brand.id + '/create-campaign');
	}

	async navigateToBrandCommunities() {
		this.router.navigateByUrl('/cs-admin/brands/' + this.brand.id + '/brand-communities');
	}

	navigateToCommunityEdit(brand: BrandModel, campaign: CampaignModel) {
		this.router.navigateByUrl(
			'/cs-admin/brands/' + brand.id + '/edit-campaign/' + campaign.campaignId + '#communities'
		);
	}

	async markCampaignStatus(status) {
		this.isSubmitting = true;
		try {
			const campaignResult = await this.selectedCampaign.markCampaignStatus(status);
			this.selectedCampaign.status = campaignResult.status;
		} catch (e) {}
		this.setNumberCampaignBasedOnStatus();
		this.isSubmitting = false;
		document.getElementById('cancelCampaign').click();
		document.getElementById('cancelSuspendCampaign').click();
	}

	setNumberCampaignBasedOnStatus() {
		this.numberCampaignList.all = this.campaigns.length;
		this.numberCampaignList.active = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.Active
		).length;
		this.numberCampaignList.pendingApproval = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.PendingApproval
		).length;
		this.numberCampaignList.draft = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.Draft
		).length;
		this.numberCampaignList.scheduled = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.Scheduled
		).length;
		this.numberCampaignList.completed = this.campaigns.filter(
			campaign => campaign.status === CampaignStatusEnum.Completed
		).length;
		this.numberCampaignList.suspended = this.campaigns.filter(
			campaign =>
				campaign.status === CampaignStatusEnum.Suspended || campaign.status === CampaignStatusEnum.Reactivating
		).length;
		this.campaigns = _.orderBy(this.campaigns, [campaign => campaign.startDateAtUTC], ['desc']);
		this.getCampaignsBasedOnStatus(this.currentStateOfCampaigns);
	}

	navigateToCommunityManage(brand: BrandModel, campaign: CampaignModel) {
		if (campaign.type === 'Listening') {
			this.router.navigate(['/cs-admin/brands/' + brand.id + '/listening-campaigns/' + campaign.campaignId]);
		} else {
			this.router.navigateByUrl(
				'/cs-admin/brands/' + brand.id + '/campaigns/' + campaign.campaignId + '/edit#communities'
			);
		}
	}

	getCampaignsBasedOnStatus(statusType) {
		this.currentStateOfCampaigns = statusType;
		if (this.campaigns) {
			let campaigns = [];
			if (statusType === 'Suspended') {
				campaigns = this.campaigns.filter(
					campaign => campaign.status === statusType || campaign.status === CampaignStatusEnum.Reactivating
				);
			} else {
				campaigns =
					statusType === 'all' ? this.campaigns : this.campaigns.filter(campaign => campaign.status === statusType);
			}
			this.campainsSortedByDate = _.groupBy(campaigns, campaign => {
				return new DateTime(campaign.startDateAtUTC).format('MMMM, YYYY');
			});
			this.campaignKeys = Object.keys(this.campainsSortedByDate);
		}
	}
	async viewInsights(campaign: CampaignModel) {
		campaign.initiateLoadingMetrics();
		if (!campaign.powerBIDashboardUrl) {
			this.router.navigate(['/cs-admin/brands/' + this.brand.id + '/campaign/' + campaign.campaignId]);
			return;
		}

		this.router.navigate(['/cs-admin/brands/' + this.brand.id + '/campaign/' + campaign.campaignId + '/power-bi']);
	}
	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
