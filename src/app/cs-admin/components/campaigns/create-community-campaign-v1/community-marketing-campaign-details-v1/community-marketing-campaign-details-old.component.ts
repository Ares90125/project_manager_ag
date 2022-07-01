import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BrandService} from '@brandModule/services/brand.service';
import {AlertService} from '@sharedModule/services/alert.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BrandModel} from '@sharedModule/models/brand.model';
import {FormGroup} from '@angular/forms';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import * as _ from 'lodash';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {CampaignTypeEnum} from '@sharedModule/models/graph-ql.model';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';

@Component({
	selector: 'app-community-marketing-campaign-details-old',
	templateUrl: './community-marketing-campaign-details-old.component.html',
	styleUrls: ['./community-marketing-campaign-details-old.component.scss']
})
export class CommunityMarketingCampaignDetailsOldComponent extends BaseComponent implements OnInit, OnDestroy {
	brands: BrandModel[] = [];
	brand: BrandModel;
	campaigns: CampaignModel[] = [];
	campaign: CampaignModel;
	campaignDetailsForm: FormGroup;
	minDate = new DateTime().toDate();
	campaignTasks: CampaignTaskModel[];
	campaignTaskViewDetails;
	campaignTaskDetails = {name: '', numberOfGroups: 0, numberOfAdmins: 0, numberOfTasks: 0, numberOfMissings: 0};
	keywordForEditor;
	isKeywordListEdited = false;
	lineNumbersForEditor;
	campaignType: CampaignTypeEnum;
	isCsAdmin = true;
	brandId: string;
	campaignId: string;
	submittingCampaignDetails = false;
	isFromBrand = false;
	isReportEdit = false;
	selectedSection = 'details';
	isCampaignLoaded = false;
	isCampaignTasksLoaded = false;
	quillConfig = {
		toolbar: [['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]]
	};

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private readonly createCampaignService: CreateCampaignService,
		private readonly alertService: AlertService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		super.setPageTitle('Community Marketing Campaign Details', 'Community Marketing Campaign Details');
		this.isFromBrand = window.location.href.indexOf('/details') > -1;

		if (this.isFromBrand) {
			this.selectedSection = 'report';
		} else {
			this.selectedSection = 'details';
		}
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				this.brandId = params['brandId'];
				this.campaignId = params['campaignId'];
				this.isCampaignLoaded = true;
				this.subscriptionsToDestroy.concat([
					this.brandService.brands.subscribe(async brands => {
						if (!brands) {
							return;
						}
						this.brands = brands;
						this.brand = brands.find(brnd => brnd.id === this.brandId);
						this.brandService.selectedBrand.next(this.brand);
						this.campaigns = await this.brand.getCampaigns();
						this.campaign = this.campaigns.find(campaign => campaign.campaignId === this.campaignId);
						if (this.isFromBrand) {
							this.selectedSection = 'report';
						} else if (!this.isFromBrand && this.campaign && this.campaign.status === 'Completed') {
							this.selectedSection = 'tasks';
						} else {
							this.selectedSection = 'details';
						}
						if (this.campaign) {
							await this.campaign.initiateLoadingMetrics();
							this.getCampaignTasks();
							this.createCampaignService.campaignType.next(this.campaign.type);
							this.isCampaignLoaded = false;
							setInterval(() => {
								if (this.isCampaignTasksLoaded) {
									this.campaign.resetCampaignTasksData();
									this.getCampaignTasks();
								}
							}, 10000);
						}
						this.isCampaignLoaded = false;
					}),
					this.createCampaignService.campaignType.subscribe(async type => {
						if (!type) {
							return;
						}

						this.campaignType = type;
					})
				]);
			})
		);

		this.brandService.init();
	}

	async getCampaignTasks() {
		this.isCampaignTasksLoaded = false;
		this.campaignTasks = await this.campaign.getCampaignTasks();
		if (!this.campaignTasks) {
			return;
		}

		this.campaignTaskViewDetails = [];
		this.campaignTasks.forEach(task => {
			this.campaignTaskViewDetails.push(CampaignTaskModel.setProperties(task, this.campaign.campaignId));
		});
		this.campaignTaskViewDetails.forEach(
			task =>
				(task['taskDateTime'] = new DateTime(
					new DateTime(task['DATE']).format('MM/DD/YYYY') + ', ' + task['TIME'],
					'MM/DD/YYYY, hh:mm A'
				))
		);
		this.campaignTaskViewDetails.sort((taskA, taskB) =>
			taskA.taskDateTime > taskB.taskDateTime ? -1 : taskA.taskDateTime < taskB.taskDateTime ? 1 : 0
		);
		this.campaignTaskDetails.numberOfTasks = this.campaignTaskViewDetails.length;
		this.campaignTaskDetails.numberOfAdmins = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ADMIN/MODERATOR').length;
		this.campaignTaskDetails.numberOfGroups = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ID').length;
		this.isCampaignTasksLoaded = true;
	}

	closeAddNewTaskPopup() {
		this.campaign.resetCampaignTasksData();
		this.getCampaignTasks();
		this.brand.resetDetails();
	}

	closeCampaignDetail(event) {
		if (event) {
			for (let key of Object.keys(event)) {
				this.campaign[key] = event[key];
			}
		}
	}

	async navigateToBrands() {
		this.router.navigate(['/cs-admin/manage-brands']);
	}

	async navigateToCampaigns() {
		this.router.navigateByUrl('/cs-admin/brands/' + this.brandId + '/manage-brand-campaigns');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
