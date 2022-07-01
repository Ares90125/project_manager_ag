import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandCommunity} from '@sharedModule/models/graph-ql.model';
import {BrandModel} from '@sharedModule/models/brand.model';
import {BrandService} from '@brandModule/services/brand.service';
import * as _ from 'lodash';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {Role} from '@sharedModule/enums/role.enum';
import {FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms';
import {FileService} from '@sharedModule/services/file.service';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-brand-communities',
	templateUrl: './brand-communities.component.html',
	styleUrls: ['./brand-communities.component.scss']
})
export class BrandCommunitiesComponent extends BaseComponent implements OnInit, OnDestroy {
	brandId: string;
	user: UserModel;
	brandCommunities: [BrandCommunity];
	showAddNewReportDialog = false;
	brands: BrandModel[];
	selectedBrand: BrandModel;
	categories = [];
	selectedcategories;
	selectedItems = [];
	groupName;
	categoriesSelected;
	brandSelected;
	fileName: File;
	previewImage;
	communityReportForm: FormGroup;
	isUploading = false;
	private groupDetails;
	private selectedGroup;
	private groupModerators;
	isFromBrand;
	brand;

	constructor(
		injector: Injector,
		private brandCommunityReportService: BrandCommunityReportService,
		private route: ActivatedRoute,
		private router: Router,
		private brandService: BrandService,
		private readonly fileService: FileService,
		private createCampaignService: CreateCampaignService,
		private userService: UserService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.isFromBrand = window.location.href.indexOf('/brand/') > -1;
		this.brandService.init();
		this.brandId = this.route.snapshot.params['brandId'];
		this.subscriptionsToDestroy.push(
			this.brandService.brands.subscribe(brands => {
				if (!brands) {
					return;
				}
				this.brands = brands;
				this.brand = this.brands?.find(brand => brand.id === this.brandId);
			})
		);
		if (!this.brandId) {
			this.subscriptionsToDestroy.push(
				this.brandService.selectedBrand.subscribe(brand => this.processBrandSelection(brand))
			);
		} else {
			const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
			this.brandCommunities = response['items'];
		}

		const listCommunityKeywords = await this.createCampaignService.listCommunityKeywords();
		const categories = _.uniq(listCommunityKeywords.map(keyword => keyword.category));
		this.selectedItems = [];
		categories.forEach(category => {
			this.categories.push({name: category, isSelected: false});
		});
		this.selectedItems = this.categories.filter(category => category['isSelected'] === true);
		this.communityReportForm = new FormGroup({
			groupName: new FormControl('', Validators.required),
			categoriesSelected: new FormControl('', Validators.required),
			brandSelected: new FormControl('', Validators.required)
		});
	}

	async processBrandSelection(brand: any) {
		if (!brand) {
			return;
		}
		this.brandId = brand.id;
		const response = await this.brandCommunityReportService.listBrandCommunities(this.brandId);
		this.brandCommunities = response['items'];
	}

	navigateToBrandCommunity(brandId, groupId) {
		if (this.isFromBrand) {
			this.router.navigateByUrl('/brand/' + brandId + '/brand-community/' + groupId);
		} else {
			this.router.navigateByUrl('/cs-admin/brands/' + brandId + '/brand-community/' + groupId);
		}
	}

	selectBrand(brand) {
		this.selectedBrand = brand;
		this.communityReportForm.get('brandSelected').setValue(this.selectedBrand);
	}

	selectCategory(event) {
		this.selectedcategories = event;
		this.selectedItems = this.categories.filter(category => category['isSelected'] === true);
		this.communityReportForm.get('categoriesSelected').setValue(this.selectedcategories);
	}

	async getGroupsDetailsByName(event) {
		this.groupName = event.target.value;
		this.groupDetails = null;
		this.selectedGroup = null;
		const name = event.target.value.replace(/\\/g, '');
		this.groupDetails = await this.createCampaignService.getGroupsDetailsByName(name);
		this.groupDetails = this.groupDetails.filter(
			group => group.groupType && group.groupType.toLowerCase() === 'facebook'
		);
		this.groupModerators = [];
	}

	async selectGroup(selectedGroup) {
		this.selectedGroup = selectedGroup;
		this.communityReportForm.get('groupName').setValue(this.selectedGroup.name);
	}

	async fileChange(event: Event) {
		this.fileName = (<HTMLInputElement>event.target).files[0];
		const ext = await this.getextension(this.fileName);
		if( ext !== 'png' && ext !== 'jpg' && ext !=='jpeg' && ext !=='gif' )
		{
			this.alert.error('Invalid File Format','Upload banner image in image file format only.');
			return;
		}
		const reader = new FileReader();
		reader.readAsDataURL(this.fileName);
		reader.onload = _event => {
			this.previewImage = reader.result;
		};
	}
    
	private async getextension(file: File) {
           let extension='';
		   const exten = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);
		   extension=exten.length > 1 ? exten : 'png';
		   return extension;
	}
	reset() {
		this.communityReportForm.reset();
		this.isUploading = false;
	}

	async saveCreate() {
		if (!this.brandId) {
			return console.warn('brand id not found');
		}

		this.isUploading = true;
		const key = this.randomUuid();
		const url = await this.processFilesForUrls(this.fileName, this.selectedGroup.name);

		let databaseObj = {
			brandId: this.brandId,
			groupId: this.selectedGroup.id,
			groupName: this.selectedGroup.name,
			coverImageUrl: url as string,
			brandCommunityReports3Key: `${this.selectedGroup.id}_${this.selectedGroup.name}`,
			totalMembers: this.selectedGroup.memberCount,
			lastUpdatedOn: this.selectedGroup.updatedAtUTC,
			groupCreatedAtUTC: this.selectedGroup.groupCreatedAtUTC,
			targets: this.selectedGroup.targets,
			createdAtUTC: this.selectedGroup.createdATUTC,
			updatedAtUTC: this.selectedGroup.updatedATUTC,
			DAUValues: this.selectedGroup.DAUValues,
			MAUValues: this.selectedGroup.MAUValues,
			impressions: this.selectedGroup.Impressions,
			privacy: this.selectedGroup.privacy
		};
		try {
			const response = await this.brandCommunityReportService.createBrandCommunityReport(databaseObj);
			databaseObj = {...databaseObj, ...response};
		} catch (error) {
			this.logger.error(error, `Faield to create brand report  for group ${this.groupName}`);

			return;
		}

		this.alert.success('New Report Created Successfully', '', 3000, true);
		setTimeout(() => window.location.reload(), 3001);

		document.getElementById('close-report')?.click();

		this.reset();
	}

	private async processFilesForUrls(file: File, groupName: string) {
		return this.fileService.uploadCoverImageToS3(file, 'image', groupName);
	}

	navigateToCampaigns() {
		this.router.navigate(['/cs-admin/brands/' + this.brandId + '/manage-brand-campaigns']);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
