import {DateTime} from '@sharedModule/models/date-time';

export class FacebookUserModel {
	accessToken?: string | null;
	fbUserId?: string | null;
	expiresAt?: string | null;

	constructor(fbUserId, accessToken, expiresAt) {
		this.fbUserId = fbUserId;
		this.accessToken = accessToken;
		this.expiresAt = new DateTime().utc().add(expiresAt, 'seconds').toISOString();
	}
}
