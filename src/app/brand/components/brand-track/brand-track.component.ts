import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BrandService} from 'src/app/brand/services/brand.service';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {BrandModel} from '@sharedModule/models/brand.model';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-brand-track',
	templateUrl: './brand-track.component.html',
	styleUrls: ['./brand-track.component.scss']
})
export class BrandTrackComponent extends BaseComponent implements OnInit, OnDestroy {
	brand: BrandModel;
	user: UserModel;
	constructor(injector: Injector, private brandService: BrandService, private userService: UserService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(brand => this.processBrandSelection(brand))
		);
	}

	async processBrandSelection(brand: any) {
		if (!brand) {
			return;
		}
		this.brand = brand;
		this.user = await this.userService.getUser();
		super.setPageTitle('Brand Track', 'Brand Track', {brandId: brand.id, brandName: brand.name});
	}

	showDivsOnNavigation(event) {}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
