import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {CampaignTask} from '@sharedModule/models/graph-ql.model';
import {DateTime} from '@sharedModule/models/date-time';
import * as _ from 'lodash';
import {utils, writeFile} from 'xlsx';
import {CampaignCommunityStatusEnum, CampaignStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BrandService} from '@brandModule/services/brand.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';

@Component({
	selector: 'app-campaign-proposal',
	templateUrl: './campaign-proposal.component.html',
	styleUrls: ['./campaign-proposal.component.scss']
})
export class CampaignProposalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeCampaignProposalView = new EventEmitter<boolean>();
	@Output() acceptedCampaignProposal = new EventEmitter<boolean>();
	@Input() selectedCampaign: CampaignModel;

	public isRequestInProgress = false;
	public campaignTasks: CampaignTask[] = [];
	public campaignTaskViewDetails = [];
	public viewDetailsmarketingCampaign = false;
	public isCsAdmin = false;
	public campaignTaskDetails = {name: '', numberOfGroups: 0, numberOfAdmins: 0, numberOfTasks: 0, numberOfMissings: 0};
	public isCampaignTaskDetailsLoaded = false;
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
		private campaignService: CampaignService,
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

		this.subscriptionsToDestroy.concat([
			this.route.params.subscribe(params => {
				this.campaignId = params['campaignId'];
			}),
			this.brandService.selectedBrand.subscribe(async brand => {
				if (!brand) {
					return;
				}

				this.brand = brand;
				const campaignList = await this.brand.getCampaigns();
				const selectedCampaign = campaignList.find(campaign => campaign.campaignId === this.campaignId);
				if (selectedCampaign) {
					this.selectedCampaign = selectedCampaign;
					this.getCampaignGroups();
					if (this.selectedCampaign.communities) {
						this.selectedCampaign['selectedCommunities'] = JSON.parse(this.selectedCampaign.communities);
						this.selectedCampaign['totalMembers'] = _.reduce(
							this.selectedCampaign['selectedCommunities'],
							(sum, community) => sum + community.memberCount,
							0
						);
					}
					if (this.selectedCampaign.KPIs) {
						this.selectedCampaign['selectedKPIs'] = JSON.parse(this.selectedCampaign.KPIs);
					}
					if (this.selectedCampaign.cmcType) {
						this.selectedCampaign['selectedCmcType'] = JSON.parse(this.selectedCampaign.cmcType);
					}
					this.getCampaignTasks();
				}
			})
		]);
	}

	async getCampaignGroups() {
		this.selectedCampaign['selectedCommunities'] = await this.campaignService.getCampaignsList(
			this.selectedCampaign.campaignId,
			this.selectedCampaign.brandId
		);
		this.selectedCampaign['totalMembers'] = _.reduce(
			this.selectedCampaign['selectedCommunities'],
			(sum, community) => sum + community.memberCount,
			0
		);
	}

	async getCampaignTasks() {
		this.isCampaignTaskDetailsLoaded = false;
		this.campaignTasks = await this.selectedCampaign.getCampaignTasks();
		if (this.campaignTasks) {
			this.campaignTasks = this.campaignTasks.filter(task => task.status !== 'Failed');
			this.campaignTasks.forEach(task => {
				const taskInfo = CampaignTaskModel.setProperties(task, this.selectedCampaign.campaignId);
				this.campaignTaskViewDetails.push(taskInfo);
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
			this.isCampaignTaskDetailsLoaded = true;
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
		this.router.navigate(['brand/manage-campaigns']);
	}

	async acceptCampaignProposal() {
		this.isRequestInProgress = true;
		await this.selectedCampaign.markCampaignStatus(CampaignStatusEnum.Scheduled);
		const input = {
			id: this.brand.id,
			status: 'Active'
		};
		await this.campaignService.brandApproveCampaign(this.selectedCampaign.campaignId);
		await this.selectedCampaign.markBrandStatus(input);
		const calls = [];
		this.selectedCampaign['selectedCommunities'].forEach(community => {
			const isCommunityExists = this.campaignTasks.find(
				task => task.groupId === community.groupId && task.status !== 'Failed'
			);
			if (!isCommunityExists) {
				return;
			}
			const input = {
				campaignId: this.selectedCampaign.campaignId,
				groupId: community.groupId,
				groupTaskStatus: CampaignCommunityStatusEnum.TaskRequestSent
			};
			calls.push(this.campaignService.updateCMCampaignGroup(input));
		});
		await Promise.all(calls);
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
