import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {UserModel} from '@sharedModule/models/user.model';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {LoggerService} from '@sharedModule/services/logger.service';
import {UserService} from '@sharedModule/services/user.service';
import {Router} from '@angular/router';

@Injectable()
export class InvitationsService {
	private isInitialized = false;

	constructor(
		private readonly appSync: AmplifyAppSyncService,
		private loggerService: LoggerService,
		private router: Router
	) {
		this.init();
	}

	init() {
		if (this.isInitialized) {
			return;
		}

		this.isInitialized = true;
	}

	public async getInvitations(groupId) {
		try {
			return (await this.appSync.getInvitations(groupId)).items;
		} catch (e) {
			return e;
		}
	}

	public async removeInvitation(groupId, createdAtUTCTicks): Promise<any> {
		try {
			return await this.appSync.removeInvitation(groupId, createdAtUTCTicks);
		} catch (e) {
			return e;
		}
	}

	public async resendInvitation(groupId, createdAtUTCTicks): Promise<any> {
		try {
			return await this.appSync.resendInvitation(groupId, createdAtUTCTicks);
		} catch (e) {
			return e;
		}
	}

	public async processInvitations(cognitoUser: UserModel) {
		if (!cognitoUser.email) {
			return;
		}
		this.loggerService.debug(
			'Processing user invitations',
			{user_id: cognitoUser.id},
			'UserService',
			'processInvitations',
			LoggerCategory.AppLogs
		);

		const removeInvitationsRequests = [];
		const processedInvitations = await this.appSync.processUserInvitations('email', cognitoUser.email, cognitoUser.id);

		if (!processedInvitations?.items) {
			return;
		}

		processedInvitations.items.forEach(invitation =>
			this.appSync.removeInvitation(invitation.groupId, invitation.createdAtUTCTicks)
		);
		Promise.all(removeInvitationsRequests).then(response => {
			this.loggerService.debug(
				'Invitations removed',
				{count: response.length},
				'UserService',
				'processInvitations',
				LoggerCategory.AppLogs
			);
		});
		if (processedInvitations?.items && this.router.url.indexOf('settings') > -1) {
			this.router.navigateByUrl('/group-admin/manage');
		}
	}
}
