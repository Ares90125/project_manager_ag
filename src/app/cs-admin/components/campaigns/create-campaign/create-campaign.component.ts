import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandService} from 'src/app/brand/services/brand.service';
import {CreateCampaignService} from 'src/app/cs-admin/services/create-campaign.service';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {CampaignTypeEnum} from 'src/app/shared/enums/campaign-type.enum';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {UserModel} from 'src/app/shared/models/user.model';

@Component({
	selector: 'app-create-campaign',
	templateUrl: './create-campaign.component.html',
	styleUrls: ['./create-campaign.component.scss']
})
export class CreateCampaignComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	brands: BrandModel[];
	brand: BrandModel;
	step = 'Step1';
	selectedType = '';
	name = '';
	loadCreateCampaignInfo = false;
	loadCreateListeningCampaign = false;
	version;

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private readonly route: ActivatedRoute,
		private readonly createCampaignService: CreateCampaignService,
		private readonly router: Router
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.version = this.route.snapshot.queryParams['v'];
		const id = this.route.snapshot.params.brandId;
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

		this.brandService.init();

		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(async brand => {
				if (!brand) {
					return;
				}

				this.brand = brand;
			})
		);
	}

	async goBack() {
		if (this.step === 'Step1') {
			this.router.navigate(['/cs-admin/brands/' + this.brand.id + '/manage-brand-campaigns']);
		} else {
			this.step = 'Step1';
		}
	}

	async moveToNext() {
		if (this.step === 'Step1') {
			this.createCampaignService.name.next(this.name);
			this.step = 'Step2';
		} else {
			this.createCampaignService.campaignType.next(this.selectedType as CampaignTypeEnum);
			if (this.selectedType === CampaignTypeEnum.CommunityMarketing) {
				if (this.version !== 'old') {
					this.router.navigateByUrl(
						'/cs-admin/brands/' + this.brand.id + '/campaign/new?name=' + encodeURIComponent(this.name) + '#communities'
					);
				} else {
					this.loadCreateCampaignInfo = true;
				}
			} else if (this.selectedType === CampaignTypeEnum.Listening) {
				this.loadCreateListeningCampaign = true;
			}
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
