import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as _ from 'lodash';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';

@Component({
	selector: 'app-brand-community-list',
	templateUrl: './brand-community-list.component.html',
	styleUrls: ['./brand-community-list.component.scss']
})
export class BrandCommunityListComponent {
	@Output() closeCommunityList = new EventEmitter<boolean>();
	@Input() headerText = null;
	groupsList: GroupModel[] = [];

	sortByFilter = [
		{
			name: 'SortBy',
			displayName: 'Sort By',
			isMultipleSelection: false,
			list: [
				{name: 'MostMembers', displayName: 'Most Members', isSelected: false},
				{name: 'MostConversations', displayName: 'Most Conversations', isSelected: false}
			]
		}
	];

	constructor(private _groupMetricsService: GroupMetricsService) {}

	@Input()
	set campaign(campaign: CampaignModel) {
		if (!campaign) {
			return;
		}

		this.getCampaignGroupDetails(campaign);
	}

	async getCampaignGroupDetails(campaign: CampaignModel) {
		this.groupsList = await campaign.getCampaignGroupDetails();
		this.groupsList.forEach(group => group.loadSummaryMetrics(this._groupMetricsService));
	}

	closeList() {
		this.closeCommunityList.emit(false);
	}

	filterChanged(sortByFilter) {
		sortByFilter.forEach(filter => {
			filter.list.forEach(item => {
				if (item.isSelected) {
					if (item.name === 'MostMembers') {
						this.sortConversationListByType('memberCount');
					} else if (item.name === 'MostConversations') {
						this.sortConversationListByType('totalConversations');
					}
				}
			});
		});
	}

	sortConversationListByType(type: string) {
		if (type === 'memberCount') {
			this.groupsList = _.orderBy(this.groupsList, [item => item[type]], ['desc']);
		} else {
			this.groupsList = _.orderBy(
				this.groupsList,
				[item => item.summaryReportForLast30Days.getValue()[type]],
				['desc']
			);
		}
	}
}
