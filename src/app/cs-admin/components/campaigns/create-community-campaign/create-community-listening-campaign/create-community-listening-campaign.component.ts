import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BrandModel} from '@sharedModule/models/brand.model';
import * as _ from 'lodash';
import {BrandService} from '@brandModule/services/brand.service';
import {ActivatedRoute, Router} from '@angular/router';
import {read, utils, writeFile} from 'xlsx';
import {CampaignStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-create-community-listening-campaign',
	templateUrl: './create-community-listening-campaign.component.html',
	styleUrls: ['./create-community-listening-campaign.component.scss']
})
export class CreateCommunityListeningCampaignComponent extends BaseComponent implements OnInit, OnDestroy {
	campaignDetailsForm: FormGroup;
	brands: BrandModel[];
	brand: BrandModel;
	selectedBrand;
	keywordForEditor;
	keywordList = [];
	isKeywordListEdited = false;
	lineNumbersForEditor;
	minDate = new DateTime().toDate();
	submittingCampaignDetails = false;
	keywordCategories = [];
	keywordBrand = [];
	keywordSubCategories = [];
	transformedKeywords = [];
	isFromBrand = false;
	listKeywords = [];
	selectedItems = [];
	groupIds = [];
	campaignName;
	campaign = {};

	quillConfig = {
		toolbar: [['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]]
	};

	constructor(
		injector: Injector,
		private readonly createCampaignService: CreateCampaignService,
		private brandService: BrandService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				const id = params['brandId'];
				const campaignId = params['campaignId'];
				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(async brands => {
						if (!brands) {
							return;
						}

						this.brands = brands;
						this.selectedBrand = brands.find(brnd => brnd.id === id);
						this.brandService.selectedBrand.next(this.selectedBrand);
						if (campaignId) {
							const campaigns = await this.selectedBrand.getCampaigns();
							this.campaign = campaigns.find(campaign => campaign.campaignId === campaignId);
							this.campaignName = this.campaign['campaignName'];
							this.createCampaignService.name.next(this.campaignName);
							if (this.campaign) {
								this.createCampaignService.campaignType.next(this.campaign['type']);
								this.createCampaignDetails();
								this.listKeywords = await this.createCampaignService.listKeywords();
								this.keywordCategories = _.uniq(this.listKeywords.map(keyword => keyword.category));
								this.setCategoryDetails();
							}
						} else {
							this.createCampaignDetails();
							this.listKeywords = await this.createCampaignService.listKeywords();
							this.keywordCategories = _.uniq(this.listKeywords.map(keyword => keyword.category));
						}
					})
				);
			})
		);
		this.subscriptionsToDestroy.push(
			this.createCampaignService.name.subscribe(async name => {
				if (!name) {
					return;
				}

				this.campaignName = name;
				if (this.campaignDetailsForm) {
					this.campaignDetailsForm.get('campaignName').setValue(this.campaignName);
				}
			})
		);
	}

	setCategoryDetails() {
		const subCategories = [];
		if (this.campaign['keywordSubCategories']) {
			this.campaign['keywordSubCategories'].forEach(subCategory => {
				subCategories.push({name: subCategory, isSelected: true});
			});
		} else if (this.campaign['keywordSubCategory']) {
			subCategories.push({name: this.campaign['keywordSubCategory'], isSelected: true});
		}
		this.getSubCategories(this.campaign['keywordCategory']);
		this.keywordSubCategories.forEach(subCategory => {
			subCategories.forEach(category => {
				if (subCategory.name === category.name) {
					subCategory.isSelected = true;
				}
			});
		});
		this.selectedItems = subCategories;
		this.getBrands(subCategories, this.campaign['keywordCategory']);
		this.campaignDetailsForm.get('brand').setValue(this.campaign['keywordBrand']);
	}

	createCampaignDetails() {
		this.campaignDetailsForm = new FormGroup({
			campaignName: new FormControl(this.campaignName),
			brief: new FormControl(this.campaign['details']),
			objective: new FormControl(this.campaign['objective']),
			startDate: new FormControl(this.campaign['startDateAtUTC'], [Validators.required]),
			endDate: new FormControl(this.campaign['endDateAtUTC'], [Validators.required]),
			category: new FormControl(this.campaign['keywordCategory'], [Validators.required]),
			brand: new FormControl(this.campaign['keywordBrand'], [Validators.required]),
			powerBIDashboardUrl: new FormControl(this.campaign['powerBIDashboardUrl'])
		});
		this.groupIds = this.campaign['groupIds'] ? this.campaign['groupIds'] : [];
		this.subscriptionsToDestroy.push(
			this.campaignDetailsForm.get('startDate').valueChanges.subscribe(data => {
				this.setMinEndDate();
			})
		);
		const taskFile = <HTMLInputElement>document.getElementById('taskFile');
		if (taskFile) {
			taskFile.value = '';
		}
		if (this.campaign) {
			this.setCategoryDetails();
		}
	}

	setMinEndDate() {
		const startDate = this.campaignDetailsForm.get('startDate').value;
		const endDate = this.campaignDetailsForm.get('endDate').value;
		if (new DateTime(startDate).diff(new DateTime().dayJsObj, 'days') < 0) {
			this.minDate = new DateTime().toDate();
		} else {
			this.minDate = new DateTime(this.campaignDetailsForm.get('startDate').value).toDate();
			if (endDate && !(new DateTime(startDate).diff(new DateTime(endDate).dayJsObj, 'days') === 0)) {
				this.campaignDetailsForm.get('endDate').setValue('');
			}
		}
	}

	uploadGroupData(event) {
		const file = event.target.files[0];
		if (file && (file.name.indexOf('.xls') > 0 || file.name.indexOf('.csv') > 0)) {
			let arrayBuffer: any;
			const fileReader = new FileReader();
			fileReader.onload = e => {
				arrayBuffer = fileReader.result;
				const data = new Uint8Array(arrayBuffer);
				const arr = [];
				for (let i = 0; i !== data.length; ++i) {
					arr[i] = String.fromCharCode(data[i]);
				}
				const bstr = arr.join('');
				const workbook = read(bstr, {type: 'binary', cellDates: true});
				const first_sheet_name = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[first_sheet_name];
				let groupIds = [];
				groupIds = utils.sheet_to_json(worksheet, {raw: true});
				this.groupIds = [];
				groupIds.forEach(groupId => {
					if (groupId['Group Ids']) {
						this.groupIds.push(groupId['Group Ids']);
					}
				});
				if (this.groupIds.length === 0) {
					document.getElementById('showFileDataMessage').click();
				}
			};
			fileReader.readAsArrayBuffer(file);
		} else if (file && file.name.indexOf('.xls') < 0 && file.name.indexOf('.csv') < 0) {
			this.groupIds = [];
			document.getElementById('showFileTypeMessage').click();
		}
	}

	getSubCategories(category) {
		this.selectedItems = [];
		const subCategories = _.uniq(
			this.listKeywords.filter(keyword => keyword.category === category).map(keyword => keyword.subCategory)
		);

		this.keywordSubCategories = [];
		subCategories.forEach(subCategory => {
			this.keywordSubCategories.push({name: subCategory, isSelected: false});
		});
		this.keywordBrand = [];
		this.campaignDetailsForm.get('brand').setValue('');
	}

	getBrands(subCategory, category) {
		if (subCategory.length === 0) {
			this.keywordBrand = [];
		} else {
			const categories = this.listKeywords.filter(keyword => keyword.category === category);
			let subCategories = [];
			subCategory.forEach(category => {
				if (subCategories.length > 0) {
					const brandSubCategories = categories.filter(keyword => keyword.subCategory === category.name);
					subCategories = subCategories.concat(brandSubCategories);
					subCategories = _.uniqBy(subCategories, subCat => subCat.uiFriendlyName);
				} else {
					subCategories = categories.filter(keyword => keyword.subCategory === category.name);
				}
			});
			this.keywordBrand = _.uniq(subCategories.map(keyword => keyword.uiFriendlyName));
		}
		this.campaignDetailsForm.get('brand').setValue('');
	}

	async sendCampaignDetails() {
		this.submittingCampaignDetails = true;
		const campaignCreateInput = {};
		campaignCreateInput['brandId'] = this.selectedBrand.id;
		if (this.campaign['campaignId']) {
			campaignCreateInput['campaignId'] = this.campaign['campaignId'];
		}
		campaignCreateInput['campaignName'] = this.campaignDetailsForm.get('campaignName').value;
		campaignCreateInput['brandName'] = this.selectedBrand.name;
		campaignCreateInput['startDateAtUTC'] = new DateTime(this.campaignDetailsForm.get('startDate').value)
			.utc()
			.toISOString();
		campaignCreateInput['endDateAtUTC'] = new DateTime(this.campaignDetailsForm.get('endDate').value)
			.endOf('day')
			.utc()
			.toISOString();
		campaignCreateInput['details'] = this.campaignDetailsForm.get('brief').value;
		campaignCreateInput['objective'] = this.campaignDetailsForm.get('objective').value;
		campaignCreateInput['keywordCategory'] = this.campaignDetailsForm.get('category').value;
		campaignCreateInput['keywordSubCategories'] = this.keywordSubCategories
			.filter(category => category.isSelected)
			.map(category => category.name);
		campaignCreateInput['groupIds'] = this.groupIds;
		campaignCreateInput['keywordBrand'] = this.campaignDetailsForm.get('brand').value;
		campaignCreateInput['status'] = CampaignStatusEnum.Active;
		campaignCreateInput['powerBIDashboardUrl'] = this.campaignDetailsForm.get('powerBIDashboardUrl').value;
		let campaignDetails;

		try {
			if (this.campaign['campaignId']) {
				campaignDetails = await this.createCampaignService.updateListeningCampaignDetails(campaignCreateInput);
				this.saveCreateInsightView(campaignDetails, campaignCreateInput, true);
			} else {
				campaignDetails = await this.createCampaignService.createListeningCampaign(campaignCreateInput);
				this.saveCreateInsightView(campaignDetails, campaignCreateInput, false);
			}
		} catch (e) {
			this.alert.error(
				'Campaign updation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
			this.submittingCampaignDetails = false;
		}
	}

	async saveCreateInsightView(campaign, campaignCreateInput, isUpdateViewDetails) {
		try {
			const insightViewInput = {};
			insightViewInput['campaignId'] = campaign.campaignId;
			insightViewInput['brand'] = campaignCreateInput['keywordBrand'];
			insightViewInput['category'] = campaignCreateInput['keywordCategory'];
			insightViewInput['subCategory'] = JSON.stringify(campaignCreateInput['keywordSubCategories']);
			insightViewInput['keywords'] = null;
			insightViewInput['adhocKeywords'] = null;
			insightViewInput['keywordBrand'] = campaignCreateInput['keywordBrand'];
			if (isUpdateViewDetails) {
				await this.createCampaignService.updateInsightViews(insightViewInput);
			} else {
				await this.createCampaignService.createInsightViews(insightViewInput);
			}

			this.selectedBrand.resetDetails();
			if (this.campaign['campaignId']) {
				this.router.navigate(['../../manage-brand-campaigns'], {relativeTo: this.route});
			} else {
				this.router.navigate(['../manage-brand-campaigns'], {relativeTo: this.route});
			}
			this.alert.success('Check campaign list for selected brand', 'Campaign details updated successfully', 5000, true);
			this.submittingCampaignDetails = false;
		} catch (e) {
			this.submittingCampaignDetails = false;
		}
	}

	downloadSheet(isSample = false) {
		const groupIdsSheet = [];
		const sheetName = isSample ? 'Sample Group Ids Sheet' : 'GroupIds';
		if (isSample) {
			groupIdsSheet.push({'Group Ids': ''});
		} else {
			this.groupIds.forEach(groupId => {
				groupIdsSheet.push({'Group Ids': groupId});
			});
		}
		const worksheet = utils.json_to_sheet(groupIdsSheet);
		const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
		writeFile(workbook, `${sheetName}.xlsx`);
	}

	async navigateToBrands() {
		this.router.navigate(['/cs-admin/manage-brands']);
	}

	async navigateToCampaigns() {
		this.router.navigate(['/cs-admin/brands/' + this.selectedBrand.id + '/manage-brand-campaigns']);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
