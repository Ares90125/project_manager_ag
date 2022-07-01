import {Injectable} from '@angular/core';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {LoggerService} from '../../shared/services/logger.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';

@Injectable()
export class WhatsAppCampaignsService {
	private _isInitialized = false;

	constructor(private loggerService: LoggerService, private readonly appSync: AmplifyAppSyncService) {
		this.init();
	}

	public init() {
		if (this._isInitialized) {
			return;
		}

		this._isInitialized = true;
	}

	async createCampaigns(campaigns: string) {
		try {
			return await this.appSync.CreateCampaigns(campaigns);
		} catch (e) {
			this.loggerService.error(e, 'Error while creating brand', {}, 'createCampaigns', LoggerCategory.AppLogs);
			return e;
		}
	}
}
