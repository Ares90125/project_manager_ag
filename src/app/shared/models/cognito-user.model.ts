import {UserModel} from './user.model';
import {DateTime} from '@sharedModule/models/date-time';

export class CognitoUserModel {
	id: string;
	attributes: {
		'custom:facebookAccessToken': string;
		'custom:fbAccessTokenExpiry': string;
		given_name: string;
		family_name: string;
		middle_name: string;
		name: string;
		email: string;
	};
	username: string;
	userLoginType: 'Facebook' | 'Simple';

	constructor(data: any) {
		Object.assign(this, data);
		this.id = data.attributes.sub;
		this.username.includes('Facebook_') ? (this.userLoginType = 'Facebook') : (this.userLoginType = 'Simple');
		return this;
	}

	public getUserModel(): UserModel {
		const user = new UserModel();

		user.cognitoId = this.id;
		user.email = this.attributes.email;
		user.timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
		user.timezoneInfo = new DateTime().tz(user.timezoneName).format('z');
		user.timezoneOffsetInMins = new DateTime().tz(user.timezoneName).utcOffset();
		user.receiveNotifications = true;
		delete user.emailVerificationStatus;
		if (this.userLoginType === 'Facebook') {
			user.fbUserAccessToken = this.attributes['custom:facebookAccessToken'];
			user.expiresAt = this.getExpiresAt();
			user.givenname = this.attributes.given_name;
			user.familyname = this.attributes.family_name;
			user.middlename = this.attributes.middle_name;
			user.fullname = this.attributes.name;
			user.username = this.attributes.email;
			user.fbUserId = this.getFacebookUserId();
		}

		return user;
	}

	public getFacebookUserId(): string {
		return this.userLoginType === 'Facebook' ? (this.username as string).replace('Facebook_', '') : '';
	}

	private getExpiresAt(): string {
		if (!this.attributes['custom:fbAccessTokenExpiry']) {
			return null;
		}

		const expiresAtDateTime = new DateTime().add(Number(this.attributes['custom:fbAccessTokenExpiry']), 'second');
		return expiresAtDateTime.toISOString();
	}
}
