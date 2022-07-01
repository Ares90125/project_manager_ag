import {ConversationActionEnum} from 'src/app/shared/enums/conversation-action.enum';
import {DateTime} from '@sharedModule/models/date-time';

export class ConversationModel {
	id: string;
	groupType: string;
	rawText: string;
	actionTaken: ConversationActionEnum;
	groupname: string;
	groupid: string;
	fbgroupid: string;
	createdatutc: string;
	contenType: string;
	hide: boolean;
	sourceId: string;
	parentSourceId: string;
	postedbyname: string;
	photourl: string;
	fbPermlink: string;

	constructor(data: any) {
		return Object.assign(this, data);
	}

	public get createdAtUTC(): string {
		return new DateTime(this.createdatutc, 'YYYY-MM-DD HH:mm:ss.SSS').toISOString();
	}

	public get permalink(): string {
		return ConversationModel.getPermaLink(this);
	}

	public static getPermaLink(conv: ConversationModel) {
		let permalink = 'https://www.facebook.com/groups/' + conv.fbgroupid;
		if (!conv.sourceId) {
			return permalink;
		}

		permalink = permalink + '/permalink/';

		if (conv.contenType === 'Post') {
			permalink = permalink + conv.sourceId.replace(conv.fbgroupid + '_', '') + '/';
		} else if (conv.contenType === 'Comment') {
			permalink =
				permalink +
				conv.parentSourceId.replace(conv.fbgroupid + '_', '') +
				'/?comment_id=' +
				conv.sourceId.replace(conv.fbgroupid + '_', '');
		}

		return permalink;
	}

	public static setProperties(conv: ConversationModel) {
		conv.createdatutc = conv['postCreatedAtUTC'];
		conv.postedbyname = conv['postCreatedByName'];
		conv.rawText = conv['postRawText'];
		conv.photourl = conv['postPhotoUrl'];
		conv.groupname = conv['groupName'];
	}
}
