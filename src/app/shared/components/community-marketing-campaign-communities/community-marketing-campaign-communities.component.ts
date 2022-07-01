import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {CampaignService} from '@brandModule/services/campaign.service';
import {MatCheckbox} from '@angular/material/checkbox';
import * as _ from 'lodash';
import {UtilityService} from '@sharedModule/services/utility.service';

@Component({
	selector: 'app-community-marketing-campaign-communities',
	templateUrl: './community-marketing-campaign-communities.component.html',
	styleUrls: ['./community-marketing-campaign-communities.component.scss']
})
export class CommunityMarketingCampaignCommunitiesComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() brand;
	@Input() selectedCommunitiesFromApi;
	@Input() openDeleteCommunityPopup;
	@Output() saveCommunitiesForCampaign = new EventEmitter();
	@Output() closeDialog = new EventEmitter();
	@Output() updateDeletedCommunities = new EventEmitter();
	@Output() isGroupSelectedForNotifications = new EventEmitter();
	@Output() closeDeleteCommunityPopup = new EventEmitter();
	@ViewChild('selectAllGroups')
	selectAllGroups: MatCheckbox;
	@Input() isNotificationsDialogOpen;
	@Input() metadata;
	selectedCommunities;
	discoverMoreCommunities = false;
	communitiesToSendNotification: Array<String> = [];
	selectedGroups = [];
	campaignTasks = [];
	private memberSizeOfGroupsSelectedForCampaignCreation;
	groupsSelectedForCampaignCreation;
	private memberSizeOfSelectedCommunities = 0;
	isDialogOpen = false;
	selectedCommunitiesMemberCount = 0;
	isGroupSelected = [];
	isDeletionInProgress = false;
	communitiesMetadataKeys = [];

	constructor(injector: Injector, private campaignService: CampaignService, private utilityService: UtilityService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.getCampaignGroups();
	}

	async getCampaignGroups() {
		this.selectedCommunities = this.selectedCommunitiesFromApi;
		this.selectedCommunities.forEach(group => {
			this.memberSizeOfSelectedCommunities = this.memberSizeOfSelectedCommunities + group.memberCount;
			group['communityStatus'] =
				group.acceptanceStatusByCommunityAdmin === 'PendingApproval'
					? 'Pending Approval'
					: group.acceptanceStatusByCommunityAdmin;
		});
	}

	async getCampaignTasks() {
		if (!this.campaign) {
			return;
		}

		this.campaign.resetCampaignTasksData();
		this.campaignTasks = await this.campaign.getCampaignTasks();
	}

	getGroupsSelectedForCampaignCreation(event) {
		this.memberSizeOfGroupsSelectedForCampaignCreation = 0;
		this.groupsSelectedForCampaignCreation = event;
		this.groupsSelectedForCampaignCreation.forEach(group => {
			this.memberSizeOfGroupsSelectedForCampaignCreation =
				this.memberSizeOfGroupsSelectedForCampaignCreation + group.memberCount;
		});
	}

	async deleteBulkCommunities() {
		this.isDeletionInProgress = true;
		let communitiesToBeDeleted = [];
		let communityTasksNeedToBeDeleted = [];
		this.selectedGroups.forEach(group => {
			if (!group['isAlreadySelectedCommunity']) {
				return;
			}
			const campaignTaskIds = this.campaignTasks
				.filter(task => task.groupId === group.groupId)
				.map(task => task.taskId);
			if (campaignTaskIds.length > 0) {
				communityTasksNeedToBeDeleted = communityTasksNeedToBeDeleted.concat(campaignTaskIds);
			}
			communitiesToBeDeleted.push(group.groupId);
		});
		try {
			if (communitiesToBeDeleted.length > 0) {
				const totalBatch = this.utilityService.getBatchesOfArray(communitiesToBeDeleted, 25);
				const totalCampaignTaskBatch = this.utilityService.getBatchesOfArray(communityTasksNeedToBeDeleted, 25);
				const calls = [];
				for (let i = 0; i < totalBatch.length; i++) {
					calls.push(
						this.campaignService.deleteCMCampaignGroups(
							this.campaign.campaignId,
							totalBatch[i],
							totalCampaignTaskBatch[i] ? totalCampaignTaskBatch[i] : []
						)
					);
				}
				await Promise.all(calls);
				this.isDeletionInProgress = false;
				this.closeDeleteCommunityPopup.emit(false);
				this.isGroupSelectedForNotifications.emit(false);
				this.selectedGroups.forEach(group => {
					this.updateDeletedCommunities.emit(group);
				});
				this.getCampaignTasks();
			}
			this.getCampaignGroups();
			this.alert.success('The communities have been successfully removed.', 'Deleted successfully');
			this.selectedGroups = [];
			this.isDeletionInProgress = false;
			this.closeDeleteCommunityPopup.emit(false);
			this.isGroupSelectedForNotifications.emit(false);
			this.communitiesToSendNotification = [];
			this.selectedCommunitiesMemberCount = 0;
		} catch (e) {
			this.isDeletionInProgress = false;
			this.alert.error(
				'Some error occurred',
				'We are unable to delete this community at this moment. Please try again later.'
			);
		}
		this.campaign.resetCampaignTasksData();
	}

	closeCommunitySelectionOverlay() {
		this.discoverMoreCommunities = false;
	}

	saveCommunities(communities) {
		this.saveCommunitiesForCampaign.emit(communities);
	}

	toggleAllGroupSelection() {
		this.selectedCommunitiesMemberCount = 0;
		this.communitiesToSendNotification = [];
		this.isGroupSelected = [];
		this.selectedGroups = [];
		if (!this.selectAllGroups.checked) {
			this.selectedCommunities?.forEach(group => {
				this.selectedGroups.push(group);
				this.isGroupSelected.push(group.groupId);
				this.communitiesToSendNotification.push(group.groupId);
				this.selectedCommunitiesMemberCount += group.memberCount;
			});
		}
		this.isGroupSelectedForNotifications.emit(this.communitiesToSendNotification.length > 0 ? true : false);
	}

	toggleGroupSelection(group) {
		if (this.selectedGroups[group.groupId]) {
			delete this.selectedGroups[group.groupId];
			this.selectedCommunitiesMemberCount -= group.memberCount;
			this.communitiesToSendNotification = this.communitiesToSendNotification.filter(id => id !== group.groupId);
		} else {
			this.selectedGroups[group.groupId] = group;
			this.selectedCommunitiesMemberCount += group.memberCount;
			this.communitiesToSendNotification.push(group.groupId);
		}
		this.isGroupSelectedForNotifications.emit(this.communitiesToSendNotification.length > 0 ? true : false);
	}

	selectCommunity(community) {
		this.communitiesToSendNotification = [];
		this.communitiesToSendNotification.push(community.groupId);
	}

	sizeOf(obj) {
		return Object.keys(obj).length;
	}

	onRangeChanged(range) {
		let selectedGroups = [];
		range.forEach(row => {
			const groupId = row.rowId;
			const selectedGroup = this.selectedCommunitiesFromApi.find(group => group.groupId === groupId);
			if (range.length > 1) {
				selectedGroups = selectedGroups.concat(selectedGroup);
				this.communitiesToSendNotification.push(selectedGroup.groupId);
				if (!this.selectedGroups.includes(selectedGroup)) {
					this.selectedCommunitiesMemberCount += selectedGroup.memberCount;
				}
			} else if (range.length === 1) {
				if (this.selectedGroups.includes(selectedGroup)) {
					this.selectedGroups = this.selectedGroups.filter(group => group.groupId !== groupId);
					this.communitiesToSendNotification = this.communitiesToSendNotification.filter(
						groupId => groupId !== selectedGroup.groupId
					);
					this.selectedCommunitiesMemberCount -= selectedGroup.memberCount;
				} else {
					selectedGroups = selectedGroups.concat(selectedGroup);
					this.communitiesToSendNotification.push(selectedGroup.groupId);
					this.selectedCommunitiesMemberCount += selectedGroup.memberCount;
				}
			}
		});
		this.isGroupSelectedForNotifications.emit(this.communitiesToSendNotification.length > 0 ? true : false);
		const event = [...this.selectedGroups];
		selectedGroups.forEach(group => {
			event.unshift(group);
		});
		this.selectedGroups = event;
		this.selectedGroups = _.uniqBy(this.selectedGroups, 'groupId');
		this.isGroupSelected = [];
		this.selectedGroups.forEach(group => {
			this.isGroupSelected.push(group.groupId);
		});
	}

	capitalise(value) {
		return (value[0].toUpperCase() + value.slice(1)).replace(/([A-Z])/g, ' $1').trim();
	}

	getCommunitiesMetadata(metadata) {
		if (metadata) {
			return JSON.parse(metadata);
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
