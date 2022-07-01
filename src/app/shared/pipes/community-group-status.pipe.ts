import {Pipe, PipeTransform} from '@angular/core';
import {CampaignCommunityStatusEnum} from '@sharedModule/enums/campaign-type.enum';

@Pipe({name: 'campaignGroupStatus'})
export class CampaignGroupStatusPipe implements PipeTransform {
	transform(value: string): string {
		if (value === CampaignCommunityStatusEnum.CampaignBriefSent) {
			return 'Campaign brief sent';
		} else if (value === CampaignCommunityStatusEnum.CampaignAccepted) {
			return 'Campaign accepted';
		} else if (value === CampaignCommunityStatusEnum.CampaignDeclined) {
			return 'Campaign declined';
		} else if (value === CampaignCommunityStatusEnum.ContentApproved) {
			return 'Content approved';
		} else if (value === CampaignCommunityStatusEnum.PaymentSent) {
			return 'Payment sent';
		} else if (value === CampaignCommunityStatusEnum.TaskCompleted) {
			return 'Task completed';
		} else if (value === CampaignCommunityStatusEnum.TaskCreated) {
			return 'Task created';
		} else if (value === CampaignCommunityStatusEnum.TaskDeclined) {
			return 'Task declined';
		} else if (value === CampaignCommunityStatusEnum.TaskFailed) {
			return 'Task failed';
		} else if (value === CampaignCommunityStatusEnum.TaskPaused) {
			return 'Task paused';
		} else if (value === CampaignCommunityStatusEnum.TaskRequestSent) {
			return 'Task request sent';
		} else if (value === CampaignCommunityStatusEnum.TaskScheduled) {
			return 'Task scheduled';
		} else {
			return 'empty';
		}
	}
}
