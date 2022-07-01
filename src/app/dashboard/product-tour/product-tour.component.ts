import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {OwlOptions, SlidesOutputData} from 'ngx-owl-carousel-o';

@Component({
	selector: 'app-product-tour',
	templateUrl: './product-tour.component.html',
	styleUrls: ['./product-tour.component.scss']
})
export class ProductTourComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeProductTour = new EventEmitter<boolean>();
	showFinalFooter = false;
	showSpinnerOnAddGroupBtn = false;
	showGotItButton: boolean = false;

	productTourSliderOptions: OwlOptions = {
		items: 1,
		navSpeed: 700,
		navText: ['', '']
	};

	constructor(injector: Injector, private readonly fbService: FacebookService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.headerService.hasGroupsAdded$.subscribe(hasGrpAdded => {
				this.showGotItButton = hasGrpAdded;
			})
		);
	}

	getData(data: SlidesOutputData) {
		if (data.startPosition === 4) {
			this.showFinalFooter = true;
		} else {
			this.showFinalFooter = false;
		}
	}

	async closeProductPage(element) {
		this.recordButtonClick(element);
		this.closeProductTour.emit(false);
	}

	async addMoreGroup(element) {
		this.recordButtonClick(element);
		this.showSpinnerOnAddGroupBtn = true;
		await this.fbService.revokeAccessPermission(FacebookPermissionEnum.GroupPermission);
		await this.fbService.reAskAccessPermission(
			FacebookPermissionEnum.GroupPermission,
			`${JSON.stringify({permissionAskFor: FacebookPermissionEnum.GroupPermission})}`
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
