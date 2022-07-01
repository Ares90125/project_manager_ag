import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';

@Injectable()
export class AccountSettingsService {
	constructor(private readonly appSync: AmplifyAppSyncService) {}

	public async getUserById(userId, memberOfGroupId?: any) {
		try {
			return await this.appSync.getUserById(userId, memberOfGroupId);
		} catch (e) {
			return;
		}
	}

	async updateNotificationPreference(input) {
		try {
			await this.appSync.updateGroupNotificationPreferences(input);
		} catch (e) {
			throw e;
		}
	}

	async updateNotificationPreferenceForUser(input) {
		await this.appSync.updateUser(input);
	}
}
