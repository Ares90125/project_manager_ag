import {Injectable} from '@angular/core';
import {AdminBioButtonStatusEnum} from '@sharedModule/enums/admin-bio-button-status-enum';
import {BehaviorSubject} from 'rxjs';
import {AmplifyAppSyncService} from './amplify-app-sync.service';
import {AppService} from './app.service';
import {BackendService} from './backend.service';

@Injectable({
	providedIn: 'root'
})
export class AdminBioService {
	public isInitialized = false;

	private _mainAdminBioData = new BehaviorSubject<any>(null);
	public mainAdminBioData$ = this._mainAdminBioData.asObservable();

	private _currentDraftAdminBioData = new BehaviorSubject<any>(null);
	public currentDraftAdminBioData$ = this._currentDraftAdminBioData.asObservable();

	private _showPublishBioButton = new BehaviorSubject<boolean | null>(null);
	public showPublishBioButton$ = this._showPublishBioButton.asObservable();

	private _isAdminBioLoaded = new BehaviorSubject<boolean | null>(null);
	public isAdminBioLoaded$ = this._isAdminBioLoaded.asObservable();

	private _draftButtonStatus = new BehaviorSubject<string | null>(null);
	public draftButtonStatus$ = this._draftButtonStatus.asObservable();

	private _isAdminBioPublished = new BehaviorSubject<boolean | null>(null);
	public isAdminBioPublished$ = this._isAdminBioPublished.asObservable();

	public showThankYouPopup = false;
	public errorToastAdminKudosItself = false;
	public showAdminBioContactPopup = false;

	private _openSlugPopup = new BehaviorSubject<boolean | null>(null);
	public openSlugPopup$ = this._openSlugPopup.asObservable();

	constructor(
		private readonly appSync: AmplifyAppSyncService,
		private readonly backendService: BackendService,
		private readonly appService: AppService
	) {}

	public async init() {
		if (this.isInitialized) {
			return;
		}

		this.isInitialized = true;
		const adminBio = await this.appSync.getAdminBio();
		if (adminBio.draftBio.publishedStatus === AdminBioButtonStatusEnum.DRAFT) {
			this._showPublishBioButton.next(true);
		}
		this.appService.adminShareUrl = adminBio.mainBio.profileUrl;
		this._currentDraftAdminBioData.next(adminBio.draftBio);
		this._mainAdminBioData.next(adminBio.mainBio);
		this._isAdminBioLoaded.next(true);
	}

	async getAdminBio() {
		return await this.appSync.getAdminBio();
	}

	async getAdminBioAnalytics() {
		return await this.appSync.getAdminBioAnalytics();
	}

	async setSlugPopupStatus(value) {
		this._openSlugPopup.next(value);
	}

	async getAdminBioMessageLead(nextToken?: string) {
		return this.appSync.listProfileBioContactMe(nextToken);
	}

	async setandUpdateDraftAdminBio(type, value, input = null) {
		try {
			this._draftButtonStatus.next('SavingDraft');
			const adminBioDraftValue = await this._currentDraftAdminBioData.getValue();
			if (!input) {
				adminBioDraftValue[type] = value;
			} else {
				for (let key of Object.keys(input)) {
					adminBioDraftValue[key] = input[key];
				}
			}
			this._currentDraftAdminBioData.next(adminBioDraftValue);
			adminBioDraftValue['publishedStatus'] = AdminBioButtonStatusEnum.DRAFT;
			delete adminBioDraftValue.isBioCompleted;
			delete adminBioDraftValue.userId;
			delete adminBioDraftValue.profileUrl;
			delete adminBioDraftValue.kudos;
			this._currentDraftAdminBioData.next(await this.appSync.updateProfileBioDraft(adminBioDraftValue));
			this._draftButtonStatus.next('DraftSaved');
		} catch (e) {
			// catch the draft api error
		}
	}

	async updatePublishButtonStatus(updateValue) {
		this._showPublishBioButton.next(updateValue);
	}

	async updateAdminBio() {
		const adminBioDraftValue = await this._currentDraftAdminBioData.getValue();
		adminBioDraftValue['publishedStatus'] = AdminBioButtonStatusEnum.LIVE;
		delete adminBioDraftValue.isBioCompleted;
		delete adminBioDraftValue.userId;
		delete adminBioDraftValue.profileUrl;
		delete adminBioDraftValue.kudos;
		this._currentDraftAdminBioData.next(await this.appSync.updateProfileBioDraft(adminBioDraftValue));
		delete adminBioDraftValue['publishedStatus'];
		this._mainAdminBioData.next(await this.appSync.updateAdminBio(adminBioDraftValue));
		this._isAdminBioPublished.next(true);
	}

	async updateKudos(tarUserId) {
		return await this.appSync.toggleAdminBioKudos(tarUserId, true);
	}

	async updateProfileBioContactMe(contactInfo) {
		return await this.backendService.post('/profilebiocontactme', contactInfo);
	}

	async updateProfileAudienceInsightsContactMe(contactInfo) {
		return await this.backendService.post('/groupprofileadmininsightscontactme', contactInfo);
	}

	async checkEmailAlreadyExistedOnProfile(userId, emailId) {
		return await this.backendService.get(`/profilebiocontactme?userId=${userId}&email=${emailId}`);
	}
}
