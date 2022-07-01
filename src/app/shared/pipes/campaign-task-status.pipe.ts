import {Pipe, PipeTransform} from '@angular/core';
import {CampaignStatusEnum} from '@sharedModule/models/graph-ql.model';

@Pipe({name: 'campaignTaskStatus'})
export class CampaignTaskStatusPipe implements PipeTransform {
	transform(value: string): string {
		if (value === CampaignStatusEnum.Draft) {
			return 'DRAFT';
		} else if (value === CampaignStatusEnum.PendingApproval) {
			return 'Pending Approval';
		} else if (value === CampaignStatusEnum.Suspended) {
			return 'Suspended';
		} else if (value === CampaignStatusEnum.Approved) {
			return 'Approved';
		} else if (value === CampaignStatusEnum.Scheduled) {
			return 'Scheduled';
		} else if (value === CampaignStatusEnum.Active) {
			return 'Active';
		} else if (value === CampaignStatusEnum.Reactivating) {
			return 'Reactivating';
		} else {
			return 'Completed';
		}
	}
}
