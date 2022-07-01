import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import * as _ from 'lodash';
import {utils, writeFile} from 'xlsx';
import {CampaignStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BrandService} from '@brandModule/services/brand.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';

@Component({
	selector: 'app-campaign-proposal-old',
	templateUrl: './campaign-proposal-old.component.html',
	styleUrls: ['./campaign-proposal-old.component.scss']
})
export class CampaignProposalOldComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeCampaignProposalView = new EventEmitter<boolean>();
	@Output() acceptedCampaignProposal = new EventEmitter<boolean>();
	@Input() selectedCampaign: CampaignModel;

	public isRequestInProgress = false;
	public campaignTasks: CampaignTaskModel[] = [];
	public campaignTaskViewDetails = [];
	public viewDetailsmarketingCampaign = false;
	public isCsAdmin = false;
	public campaignTaskDetails = {name: '', numberOfGroups: 0, numberOfAdmins: 0, numberOfTasks: 0, numberOfMissings: 0};
	public campaignTaskColumnNames = [
		'No.',
		'GROUP ID',
		'GROUP NAME',
		'GROUP ADMIN/MODERATOR',
		'POST TYPE',
		'TITLE',
		'TEXT',
		'DATE',
		'TIME',
		'URL'
	];
	brand;
	campaignId;

	constructor(
		injector: Injector,
		private brandService: BrandService,
		private readonly route: ActivatedRoute,
		private router: Router
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async ngOnInit() {
		super._ngOnInit();
		this.brandService.init();
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				this.campaignId = params['campaignId'];
				this.subscriptionsToDestroy.push(
					this.brandService.selectedBrand.subscribe(async brand => {
						if (!brand) {
							return;
						}

						this.brand = brand;
						const campaignList = await this.brand.getCampaigns();
						const selectedCampaign = campaignList.filter(campaign => campaign.campaignId === this.campaignId);
						if (selectedCampaign) {
							this.selectedCampaign = selectedCampaign[0];
							this.getCampaignTasks();
						}
					})
				);
			})
		);
	}

	async getCampaignTasks() {
		this.campaignTasks = await this.selectedCampaign.getCampaignTasks();
		if (this.campaignTasks) {
			this.campaignTasks.forEach(task => {
				this.campaignTaskViewDetails.push(CampaignTaskModel.setProperties(task, this.selectedCampaign.campaignId));
			});
			this.campaignTaskViewDetails = _.orderBy(
				this.campaignTaskViewDetails,
				[
					task =>
						new DateTime(new DateTime(task['DATE']).format('MM/DD/YYYY') + ', ' + task['TIME'], 'MM/DD/YYYY, hh:mm A')
				],
				['asc']
			);
			this.campaignTaskDetails.numberOfTasks = this.campaignTaskViewDetails.length;
			this.campaignTaskDetails.numberOfAdmins = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ADMIN/MODERATOR').length;
			this.campaignTaskDetails.numberOfGroups = _.uniqBy(this.campaignTaskViewDetails, 'GROUP ID').length;
		}
	}

	downloadSheet() {
		const campaignDetails = [];
		this.campaignTaskViewDetails.forEach(task => {
			const taskDet = {};
			this.campaignTaskColumnNames.forEach(column => {
				taskDet[column] = task[column];
			});
			campaignDetails.push(taskDet);
		});
		const worksheet = utils.json_to_sheet(campaignDetails);
		const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
		writeFile(workbook, 'Updated Campaign Task.xlsx');
	}

	closeCampaignProposal() {
		document.getElementById('cancelProposal').click();
		this.closeCampaignProposalView.emit(false);
	}

	async acceptCampaignProposal() {
		this.isRequestInProgress = true;
		await this.selectedCampaign.markCampaignStatus(CampaignStatusEnum.Scheduled);
		document.getElementById('acceptProposal').click();
		this.isRequestInProgress = false;
	}

	closeCampaignProposalAfterAcceptance() {
		this.brand.resetDetails();
		document.getElementById('cancelProposal').click();
		this.router.navigate(['brand/manage-campaigns']);
		this.acceptedCampaignProposal.emit(false);
	}

	showCampaignDetails() {
		if (this.campaignTaskViewDetails.length > 0) {
			this.viewDetailsmarketingCampaign = !this.viewDetailsmarketingCampaign;
		}
	}

	closeTaskDetailsView(event) {
		this.viewDetailsmarketingCampaign = event;
	}
}
