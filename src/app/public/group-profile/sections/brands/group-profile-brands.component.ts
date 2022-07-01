import {
	AfterViewInit,
	Component,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	ViewChildren
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {takeUntil} from 'rxjs/operators';
import * as _ from 'lodash';
import {MatExpansionPanel} from '@angular/material/expansion';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {ThrowStmt} from '@angular/compiler';

@Component({
	selector: 'app-group-profile-brands',
	templateUrl: './group-profile-brands.component.html',
	styleUrls: ['./group-profile-brands.component.scss']
})
export class GroupProfileBrandsComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Input() currentUserId: string;
	@Output() saveMostTalkedAboutBrandsSection = new EventEmitter();
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;
	@Input() isSaveInProgress: boolean = false;

	initialValue;
	initialVisibilityValue;
	previousNoOfVisibleBrands: number;
	openEditBrandsModal = false;
	showEditModal = false;
	isExpanded: boolean = false;
	showNoFilledBorder: boolean = false;
	showMostTalkBrandsVideo: boolean = false;
	constructor(injector: Injector, private groupProfilePageService: GroupProfilePagesService) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.initialValue = _.cloneDeep(this.groupProfilePage.mostTalkedAboutBrands);
		this.initialVisibilityValue = _.cloneDeep(this.groupProfilePage.showMostTalkedAboutBrands);
		this.previousNoOfVisibleBrands = this.noOfBrandsEnabled();

		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.isSaveInProgress = false;
			// this.previousNoOfVisibleBrands = this.noOfBrandsEnabled();
			// this.initialVisibilityValue = _.cloneDeep(this.groupProfilePage.showMostTalkedAboutBrands);
			// this.initialValue = _.cloneDeep(this.groupProfilePage.mostTalkedAboutBrands);
		});
	}

	reset() {
		this.initialVisibilityValue = _.cloneDeep(this.groupProfilePage.showMostTalkedAboutBrands);
		this.openEditBrandsModal = false;
		this.initialValue = _.cloneDeep(this.groupProfilePage.mostTalkedAboutBrands);
		this.previousNoOfVisibleBrands = this.noOfBrandsEnabled();
		this.enableScrolling();
	}

	trimBrandName(name) {
		const trimmedName = name.substring(0, 40);
		return trimmedName.length < 40 ? trimmedName : trimmedName + '...';
	}

	noOfBrandsEnabled(): number {
		return this.groupProfilePage?.mostTalkedAboutBrands?.filter(brand => brand.isSelected).length;
	}

	noOfTalkedBrands() {
		return this.groupProfilePage?.mostTalkedAboutBrands ? this.groupProfilePage?.mostTalkedAboutBrands.length : 0;
	}

	toggleBrandSelection(brandObj) {
		brandObj.isSelected = !brandObj.isSelected;
		if (this.previousNoOfVisibleBrands === 0) {
			this.groupProfilePage.showMostTalkedAboutBrands = true;
		}
		this.previousNoOfVisibleBrands = this.noOfBrandsEnabled();
		this.updateBrands();
	}

	isSaveEnabled() {
		return (
			this.groupProfilePage.showMostTalkedAboutBrands !== this.initialVisibilityValue ||
			JSON.stringify(this.initialValue) !== JSON.stringify(this.groupProfilePage.mostTalkedAboutBrands)
		);
	}

	updateBrands() {
		this.isSaveInProgress = true;
		this.groupProfilePage.mostTalkedAboutBrands = this.groupProfilePage.mostTalkedAboutBrands
			? this.groupProfilePage.mostTalkedAboutBrands
			: [];
		if (this.noOfBrandsEnabled() === 0) {
			this.groupProfilePage.showMostTalkedAboutBrands = false;
		}
		this.groupProfilePage.isMostTalkedAboutBrandsSectionChanged = true;
		this.saveMostTalkedAboutBrandsSection.emit();
	}

	openBrandsHelpVideo() {
		this.showMostTalkBrandsVideo = true;
	}

	closeVideoPlayer() {
		this.showMostTalkBrandsVideo = false;
	}

	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			if (!this.groupProfilePage.mostTalkedAboutBrands || this.groupProfilePage.mostTalkedAboutBrands?.length === 0) {
				this.showNoFilledBorder = true;
			}
			if (
				!this.groupProfilePage.mostTalkedAboutBrands ||
				this.groupProfilePage.mostTalkedAboutBrands?.length === 0 ||
				this.groupProfilePageService.checkIfAllSectionNeedToBeExpanded(this.groupProfilePage)
			) {
				this.isExpanded = true;
				x.hideToggle = true;
				x.expanded = true;
			}
			x.expandedChange.subscribe(data => {
				if (data) {
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			});
		});
	}
}
