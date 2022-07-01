import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {GroupCampaignService} from '@groupAdminModule/_services/group-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import * as _ from 'lodash';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignService} from '@brandModule/services/campaign.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {CampaignCommunityStatusEnum} from '@sharedModule/enums/campaign-type.enum';

@Component({
	selector: 'app-task-details',
	templateUrl: './task-details.component.html',
	styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	selectedCampaign;
	taskDetailsBasedOnStatus = {completed: 0, pendingApproval: 0, scheduled: 0};
	tasksBasedonType = {posts: 0, mentions: 0, liveVideo: 0, polls: 0};
	daysCountOfCampaign = 0;
	campainsTasksSortedByDate;
	selectedStatus = 'scheduled';
	showPermissionRequired = false;
	isGroupLevelPermissionGivenForAllCampaignGroup = true;
	selectedTab = 'details';
	campaignsGroupedByStatus = {
		Pending: null,
		Scheduled: null,
		Completed: null
	};
	isApprovalActionInProgress = false;
	campaignRejectionConfirmation = false;
	campaignTaskRejectionConfirmation = false;
	typeformUrl = '';

	constructor(
		injector: Injector,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute,
		private groupCampaignService: GroupCampaignService,
		private campaignService: CampaignService,
		private readonly userService: UserService,
		private readonly groupsService: GroupsService,
		private readonly facebookService: FacebookService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.reloadCampaignDetails();
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	reloadCampaignDetails() {
		this.subscriptionsToDestroy.concat([
			this.userService.currentUser$.subscribe(usr => (this.user = usr)),
			this.activatedRoute.params.subscribe(async param => {
				if (!param.campaignId) {
					this.closeDetails();
					return;
				}
				const campaigns = await this.groupCampaignService.getUserCampaigns();
				const currentUser = await this.userService.getUser();
				if (param.groupId) {
					this.selectedCampaign = campaigns.find(
						campaign => campaign.campaignId === param.campaignId && campaign.groupId === param.groupId
					);
					this.selectedCampaign[
						'typeformUrl'
					] = `https://convosight.typeform.com/to/${this.selectedCampaign?.typeformId}#campaignid=${this.selectedCampaign.campaignId}&groupid=${this.selectedCampaign.groupId}&adminid=${currentUser.id}&cohort=${this.selectedCampaign.cohort}`;
				} else {
					this.selectedCampaign = campaigns.find(campaign => campaign.campaignId === param.campaignId);
					this.selectedCampaign[
						'typeformUrl'
					] = `https://convosight.typeform.com/to/${this.selectedCampaign?.typeformId}#campaignid=${this.selectedCampaign.campaignId}&groupid=${this.selectedCampaign.groupId}&adminid=${currentUser.id}&cohort=${this.selectedCampaign.cohort}`;
				}
				if (!this.selectedCampaign) {
					this.closeDetails();
					return;
				}
				this.setCampaignTaskDetails();
			})
		]);
	}

	async setCampaignTaskDetails() {
		this.daysCountOfCampaign = new DateTime(this.selectedCampaign.endDateAtUTC).diff(
			new DateTime(this.selectedCampaign.startDateAtUTC).dayJsObj,
			'days'
		);

		if (this.selectedCampaign.campaignTasks) {
			if (this.selectedCampaign.groupId) {
				this.selectedCampaign.campaignTasks = this.selectedCampaign.campaignTasks.filter(
					task => task.userName === this.user?.fullname && task.groupId === this.selectedCampaign.groupId
				);
			} else {
				this.selectedCampaign.campaignTasks = this.selectedCampaign.campaignTasks.filter(
					task => task.userName === this.user?.fullname
				);
			}
		}
		this.selectedCampaign.campaignTasks = _.orderBy(
			this.selectedCampaign.campaignTasks,
			[task => task.toBePerformedByUTC],
			['asc']
		);
		if (this.selectedCampaign.status === 'PendingApproval') {
			this.selectedStatus = 'PendingApproval';
			this.checkForCampaignGroupHasPermission(this.selectedCampaign.campaignTasks);
		} else {
			this.selectedStatus = 'Scheduled';
		}
	}

	checkForCampaignGroupHasPermission(campaignTasks) {
		if (campaignTasks && campaignTasks.length === 0) return;
		campaignTasks.map(async campaign => {
			const fbGroupId = this.groupsService.getFbGroupIdFromGroupId(campaign.groupId);
			const groupHasPostPermission = await this.facebookService.checkIfGroupLevelPostPermissionIsValid(fbGroupId);
			if (!groupHasPostPermission) {
				this.isGroupLevelPermissionGivenForAllCampaignGroup = false;
			}
		});
	}

	getCampaignsBasedOnStatus(statusType) {
		this.selectedStatus = statusType;
		this.campainsTasksSortedByDate = _.groupBy(this.selectedCampaign.campaignTasks, task => {
			return task.status;
		});
		Object.keys(this.campainsTasksSortedByDate).forEach(key => {
			const campaignsGroupedByStatus = _.groupBy(this.campainsTasksSortedByDate[key], task => {
				return new DateTime(task.toBePerformedByUTC).format('DD MMMM, YYYY');
			});
			switch (key) {
				case 'PendingApproval':
					this.campaignsGroupedByStatus.Pending = campaignsGroupedByStatus;
					break;
				case 'Queued':
					this.campaignsGroupedByStatus.Scheduled = campaignsGroupedByStatus;
					break;
				case 'Completed':
					this.campaignsGroupedByStatus.Completed = campaignsGroupedByStatus;
					break;
			}
		});
	}

	async markCampaignStatus(status, btnType) {
		if (!this.isGroupLevelPermissionGivenForAllCampaignGroup) {
			this.recordDialogBoxShow('Publish permission');
			this.showPermissionRequired = true;
			return;
		}

		const markedCampaign = await this.groupCampaignService.markUserCampaignStatus(
			this.selectedCampaign.campaignId,
			status
		);
		this.selectedCampaign?.campaignTasks?.forEach(community => {
			const input = {
				campaignId: this.selectedCampaign.campaignId,
				groupId: community.groupId,
				acceptanceStatusByCommunityAdmin: 'Approved'
			};
			this.campaignService.updateCMCampaignGroup(input);
		});
		this.selectedCampaign.status = status;
		document.getElementById(btnType).click();
		if (status === 'Rejected') {
			this.closeDetails();
		}
		setTimeout(async () => {
			this.selectedCampaign.campaignTasks = await this.groupCampaignService.getUserCampaignTasks(
				this.selectedCampaign.campaignId
			);
		}, 1000);
		this.showPermissionRequired = false;
	}

	cancelPublishPermission(event) {
		this.showPermissionRequired = false;
	}

	getCurrentDateKeyValue(key) {
		if (
			new DateTime(new DateTime(key).format('MMMM D YYYY')).diff(new DateTime().format('MMMM D YYYY'), 'days') === 0
		) {
			return 'Today ' + new DateTime(key).format('MMMM, DD');
		} else if (
			new DateTime(new DateTime(key).format('MMMM D YYYY')).diff(new DateTime().format('MMMM D YYYY'), 'days') === 1
		) {
			return 'Tomorrow ' + new DateTime(key).format('MMMM, DD');
		} else {
			return key;
		}
	}

	closeDetails() {
		this.router.navigateByUrl('/group-admin/campaigns');
	}

	navigateToSchedulePosts(element) {
		this.recordButtonClick(element);
		document.getElementById('closeTask').click();
		if (this.selectedCampaign?.campaignTasks[0]?.groupId) {
			this.router.navigateByUrl(`/group-admin/group/${this.selectedCampaign.campaignTasks[0].groupId}/scheduledposts`);
		} else {
			this.router.navigateByUrl('/group-admin/campaigns');
		}
	}

	navigateToScheduledPostsPage(element, task) {
		this.recordButtonClick(element);
		this.router.navigateByUrl(`/group-admin/group/${task?.groupId}/scheduledposts`);
	}

	async markCampaignGroupStatus(status) {
		const input = {
			campaignId: this.selectedCampaign.campaignId,
			groupId: this.selectedCampaign.groupId,
			groupTaskStatus: status
		};
		if (status === CampaignCommunityStatusEnum.CampaignAccepted) {
			input['isAcceptedByCommunityAdmin'] = true;
		} else if (status === CampaignCommunityStatusEnum.TaskScheduled) {
			const groupHasPostPermission = await this.facebookService.checkIfGroupLevelPostPermissionIsValid(
				this.selectedCampaign.fbGroupId
			);
			if (!groupHasPostPermission) {
				this.showPermissionRequired = true;
				return;
			}
			input['isAcceptedByCommunityAdmin'] = this.selectedCampaign.isAcceptedByCommunityAdmin;
		} else {
			input['isAcceptedByCommunityAdmin'] = this.selectedCampaign.isAcceptedByCommunityAdmin;
		}
		try {
			this.isApprovalActionInProgress = true;
			await this.campaignService.updateCampaignGroupStatus(
				input.campaignId,
				input.groupId,
				input.groupTaskStatus,
				input['isAcceptedByCommunityAdmin']
			);
			this.selectedCampaign['status'] = null;
			this.groupCampaignService.resetUpcomingCampaigns();
			this.alert.success(
				'Successfully updated',
				status
					.toString()
					.replace(/([A-Z])/g, ' $1')
					.trim()
			);
			this.closeDetails();
		} catch (e) {
			this.alert.error('Could not update', 'Some error occured');
		}
		this.isApprovalActionInProgress = false;
	}

	sizeOf(obj) {
		return Object.keys(obj).length;
	}

	isCampaignUpcoming(status) {
		return (
			status === CampaignCommunityStatusEnum.CampaignBriefSent ||
			status === CampaignCommunityStatusEnum.ContentApproved ||
			status === CampaignCommunityStatusEnum.TaskCreated
		);
	}

	isCampaignUpcomingOrAcceptedOrRejected(status) {
		return (
			status === CampaignCommunityStatusEnum.CampaignAccepted ||
			status === CampaignCommunityStatusEnum.CampaignDeclined ||
			this.isCampaignUpcoming(status)
		);
	}

	statusToShow(status) {
		switch (status) {
			case CampaignCommunityStatusEnum.CampaignBriefSent:
				return {status: 'New', class: 'cs-text-orange'};
				break;
			case CampaignCommunityStatusEnum.ContentApproved:
				return {status: 'New', class: 'cs-text-orange'};
				break;
			case CampaignCommunityStatusEnum.TaskCreated:
				return {status: 'New', class: 'cs-text-orange'};
				break;
			case CampaignCommunityStatusEnum.CampaignAccepted:
				return {status: 'Active', class: 'cs-text-success'};
				break;
			case CampaignCommunityStatusEnum.CampaignDeclined:
				return {status: 'Declined', class: 'cs-text-error'};
				break;
			case CampaignCommunityStatusEnum.TaskRequestSent:
				return {status: 'Approval Pending', class: 'cs-text-orange'};
				break;
			case CampaignCommunityStatusEnum.TaskScheduled:
				return {status: 'Scheduled', class: 'cs-text-grey'};
				break;
			case CampaignCommunityStatusEnum.TaskDeclined:
				return {status: 'Declined', class: 'cs-text-error'};
				break;
			case CampaignCommunityStatusEnum.TaskCompleted:
				return {status: 'Post Live', class: 'cs-text-success'};
				break;
			case CampaignCommunityStatusEnum.TaskFailed:
				return {status: 'Error', class: 'cs-text-error'};
				break;
			case CampaignCommunityStatusEnum.TaskPaused:
				return {status: 'Error', class: 'cs-text-error'};
				break;
		}
	}

	currencySymbolFor(currency) {
		switch (currency) {
			case 'SGD':
				return 'S$';
				break;
			case 'USD':
				return '$';
				break;
			case 'INR':
				return '₹';
				break;
		}
	}

	defaultComparator(): any {
		return 0;
	}
}
