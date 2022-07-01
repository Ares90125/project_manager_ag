import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BrandModel} from '@sharedModule/models/brand.model';
import {CampaignInsightViewModel} from '@sharedModule/models/campaign-insight-view.model';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-listening-power-bi',
	templateUrl: './listening-power-bi.component.html',
	styleUrls: ['./listening-power-bi.component.scss']
})
export class ListeningPowerBiComponent extends BaseComponent implements OnInit, OnDestroy {
	user = null;
	brandId = null;
	campaignId = null;
	selectedBrand = null;
	campaign: CampaignModel = null;
	showCommunityList = false;
	insightViews: CampaignInsightViewModel[] = null;
	loadingData = true;

	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly brandService: BrandService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.brandService.init();
		this.user = await this.userService.getUser();
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				this.brandId = params['brandId'];
				this.campaignId = params['campaignId'];

				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(brands => {
						if (!brands) {
							return;
						}

						const selectedBrand = brands.find(brnd => brnd.id === this.brandId);
						this.brandService.selectedBrand.next(selectedBrand);
					})
				);
			})
		);

		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(brand => this.processBrandSelection(brand))
		);
	}

	async processBrandSelection(brand: any) {
		if (!brand) {
			return;
		}

		super.setPageTitle('Campaign Details', 'Campaign Details', {
			brandId: brand.id,
			brandName: brand.name,
			campaignId: this.campaignId
		});
		await this.loadCampaign(brand);
	}

	async loadCampaign(brand: BrandModel) {
		const campaign = await brand.getCampaignById(this.campaignId);

		if (!campaign) {
			this.router.navigate(['/brand/manage-campaigns']);
			return;
		}
		this.campaign = campaign;
		this.campaign.brandId = brand.id;
		this.insightViews = await this.campaign.getInsightViews();
		this.loadingData = false;
	}

	showCommunitiesList() {
		this.showCommunityList = true;
		this.disableScrolling();
	}

	closeCommunityList(event) {
		this.showCommunityList = event;
		this.enableScrolling();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
