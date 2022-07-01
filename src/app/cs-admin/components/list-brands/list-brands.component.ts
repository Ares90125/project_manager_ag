import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BrandService} from 'src/app/brand/services/brand.service';
import {Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
	selector: 'app-list-brands',
	templateUrl: './list-brands.component.html',
	styleUrls: ['./list-brands.component.scss']
})
export class ListBrandsComponent extends BaseComponent implements OnInit, OnDestroy {
	brands: BrandModel[];
	brandsInDraftState;
	campaignBrands;
	searchResults;
	searchText;
	updatedSearchValue: Subject<string> = new Subject();
	selectedBrandType = 'CampaignBrands';

	constructor(injector: Injector, private readonly brandService: BrandService, private readonly router: Router) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		super.setPageTitle('Manage Brands', 'Manage Brands');
		this.brandService.init();
		this.subscriptionsToDestroy.push(
			this.brandService.brands.subscribe(brands => {
				if (!brands) {
					return;
				}
				this.brands = brands;
				this.brands.map(brand => (brand.hide = false));
				this.campaignBrands = this.brands.filter(brand => brand.status !== 'Draft');
				this.brandsInDraftState = this.brands.filter(brand => brand.status === 'Draft');
			})
		);
		this.subscribeToSearchTextChanges();
	}

	async selectBrand(brand: BrandModel) {
		this.router.navigate(['/cs-admin/brands/' + brand.id + '/manage-brand-campaigns']);
	}

	async navigateToCreateBrand() {
		this.router.navigateByUrl(`cs-admin/manage-brands/create?brand=${this.searchText}`);
	}

	subscribeToSearchTextChanges() {
		const debouncedSearchText = this.updatedSearchValue.pipe(debounceTime(1000));
		this.subscriptionsToDestroy.push(
			debouncedSearchText.subscribe(searchValue => {
				this.searchText = searchValue;
				if (searchValue !== '') {
					searchValue = searchValue.toLowerCase();
				}
				this.brands.forEach(brand => {
					brand.hide = !(brand.name.toLowerCase().indexOf(searchValue) > -1 || searchValue === '');
				});
				this.searchResults = this.brands.filter(brand => !brand.hide);
			})
		);
	}

	onSearchChange(searchValue) {
		this.updatedSearchValue.next(searchValue.value);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
