import {UserAcceptanceEnum} from '@groupAdminModule/_enums/user-acceptance.enum';
import {CampaignTask} from '@sharedModule/models/graph-ql.model';

export class UserCampaignConnection {
	_typename: 'UserCampaignConnection';
	items: Array<UserCampaign | null> | null;
	nextToken: string | null;
}

export class UserCampaign {
	__typename: 'UserCampaign';
	campaignName: string;
	brandName: string | null;
	brandLogoURL: string | null;
	campaignId: string;
	startDateAtUTC: string | null;
	endDateAtUTC: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	status: UserAcceptanceEnum | null;
	acceptanceStatusByCommunityAdmin: UserAcceptanceEnum | null;
	details: string | null;
	campaignBriefForCommunityAdmin: string | null;
	objective: string | null;
	primaryObjective: string | null;
	campaignTasks: CampaignTask[];
	isDeleted: boolean;

	// for frontend purpose
	isExpired: boolean;
	numberOfPendingTasks;
}
