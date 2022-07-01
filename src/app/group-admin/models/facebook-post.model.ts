import {Role} from '../../shared/enums/role.enum';
import {RecommendationSourceEnum} from './post-recommendation.model';
import {scheduleTypeEnum} from '@sharedModule/models/graph-ql.model';

export class FacebookPostModel {
	id: string;
	groupId: string;
	recomId?: string;
	recomSrc?: RecommendationSourceEnum;
	toBePostedAtUTCTicks: number;
	scheduleOption: string | null;

	contentType: PostContentTypeEnum;
	text: string;
	imageUrls?: string[];
	videoUrls?: string[];

	status: PostStatusEnum;
	fbPermlink?: string;
	toBePostedFbPermlink: string;
	fbPostId?: string;
	campaignTaskId?: string;
	scheduleType?: scheduleTypeEnum;

	createdById: string;
	createdByImgUrl: string;
	createdByName: string;
	createdByRole: Role;

	isTimeSuggestionMet: boolean | null;
	totalSuggestionMet: null | number;
	totalSuggestions: null | number;

	createdAtUTC: string;
	updatedAtUTC: string;

	isDeleted: boolean;
	// The below properties for the UI and not for backend
	toBePostedAtInLocalDate: string;
	toBePostedAtInLocalTime: string;
	deleting: boolean;
	recomObject: string;
	campaignTaskDetails;
	campaignId: string | null;
	originalPostText: string;
	public makeItReadyForSendingToBackend(type = 'create') {
		delete this.createdAtUTC;
		delete this.updatedAtUTC;
		delete this.toBePostedAtInLocalDate;
		delete this.toBePostedAtInLocalTime;
		delete this.deleting;
		if (type !== 'edit') {
			this.toBePostedAtUTCTicks = this.toBePostedAtUTCTicks + Math.floor(Math.random() * 90);
		}
		if (type === 'edit') {
			delete this.createdByRole;
		}
	}
}

export enum PostContentTypeEnum {
	Text = 'Text',
	Photo = 'Photo',
	Video = 'Video',
	Album = 'Album',
	Link = 'Link',
	LiveVideo = 'LiveVideo',
	MultiVideo = 'MultiVideo',
	VideoImage = 'VideoImage'
}

export enum PostStatusEnum {
	Queued = 'Queued',
	Published = 'Published',
	Warning = 'Warning',
	Error = 'Error',
	InProgress = 'InProgress'
}
