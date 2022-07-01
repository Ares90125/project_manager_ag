import {Injectable} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';
import {environment} from 'src/environments/environment';
import * as _ from 'lodash';
import {FacebookUserModel} from '@sharedModule/models/facebook-user.model';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {LoggerService} from './logger.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';

@Injectable({providedIn: 'root'})
export class FacebookService {
	private facebookApiBaseUrl = 'https://facebook.com/v6.0';
	private _currentSessionDetailsSubject: Subject<FacebookUserModel> = new ReplaySubject<FacebookUserModel>();
	private _currentSessionDetails: FacebookUserModel = null;

	private isLoggedIn = new Subject<Boolean>();
	public isLoggedIn$ = this.isLoggedIn.asObservable();
	public previousGroupPermissionValue = {};

	constructor(private readonly appSync: AmplifyAppSyncService, private readonly logger: LoggerService) {}

	set sessionDetails(sessionDetails: FacebookUserModel) {
		this._currentSessionDetailsSubject.next(sessionDetails);
		this._currentSessionDetailsSubject.complete();
	}

	public async getFacebookUser(): Promise<FacebookUserModel> {
		if (this._currentSessionDetails) {
			return this._currentSessionDetails;
		}

		this._currentSessionDetails = await this._currentSessionDetailsSubject.toPromise();
		return this._currentSessionDetails;
	}

	public async getProfilePicture(fbUserId) {
		try {
			const res = JSON.parse(
				await this.executeFacebookApi(`${fbUserId}/picture?redirect=0&height=500&width=500`, 'GET', null, false)
			);
			return res.data ? res.data.url : '';
		} catch (e) {
			const error = new Error('Unable to fetch profile image for user');
			this.logger.error(
				error,
				'Unable to fetch profile image for user',
				{fbUserId: fbUserId},
				'FacebookService',
				'getProfilePicture',
				LoggerCategory.ClickStream
			);
		}
	}

	public async getProfile() {
		try {
			const res = JSON.parse(await this.executeFacebookApi('me?fields=id,name,email,picture'));
			return {
				profilePictureUrl: res.picture ? (res.picture.data ? res.picture.data.url : '') : '',
				email: res.email,
				name: res.name
			};
		} catch (e) {}
	}

	public async getMetaInfo(url: string) {
		try {
			const res = JSON.parse(await this.executeFacebookApi(`?scrape=true&id=${url}`, 'POST', null, false));
			return res;
		} catch (e) {
			return e;
		}
	}

	public async checkIfAccessTokenIsValid(): Promise<boolean> {
		try {
			const response = JSON.parse(await this.executeFacebookApi('/me?fields=id'));
			if (response && response.error) {
				return false;
			} else {
				return true;
			}
		} catch (e) {
			return false;
		}
	}

	public async checkIfGroupLevelPostPermissionIsValid(fbGroupId): Promise<boolean> {
		try {
			if (this.previousGroupPermissionValue[fbGroupId] === undefined) {
				this.previousGroupPermissionValue[fbGroupId] = await this.appSync.CheckPublishPermissionForGroup(fbGroupId);
			}
			return this.previousGroupPermissionValue[fbGroupId];
		} catch (e) {
			return false;
		}
	}

	public async getUpdatedThumbnail(accessToken, postId): Promise<boolean> {
		try {
			const path = `/${postId}/?fields=full_picture`;
			return JSON.parse(await this.executeFacebookApi(path, 'GET', null, false)).full_picture;
		} catch (e) {
			return;
		}
	}

	public async getUpdatedGroupCover(fbGroupId: string): Promise<any> {
		try {
			const path = `${fbGroupId}/picture?redirect=0&type=large`;
			return JSON.parse(await this.executeFacebookApi(path, 'GET', null, false));
		} catch (e) {
			return;
		}
	}

	private async reAskPermission(permissionName: FacebookPermissionEnum, state: any): Promise<any> {
		window.location.href = `${this.facebookApiBaseUrl}/dialog/oauth?client_id=${environment.fbClientId}&redirect_uri=${environment.fbreAskPermissionRedirectUrl}&state=${state}&auth_type=rerequest&scope=${permissionName}`;
	}

	public async revokeAccessPermission(permission: FacebookPermissionEnum) {
		await this.revokePermission(permission);
	}

	public async reAskAccessPermission(permission: FacebookPermissionEnum, state) {
		await this.reAskPermission(permission, state);
	}

	public async checkIfPermissionIsGranted(permission: FacebookPermissionEnum) {
		return await this.checkIfPermissionExistsOnAccessToken(permission);
	}

	private async revokePermission(permissionName: FacebookPermissionEnum): Promise<any> {
		const loggedInData: FacebookUserModel = await this.getFacebookUser();
		try {
			const path = `/${loggedInData['fbUserId']}/permissions/${permissionName}`;
			await this.executeFacebookApi(path, 'DELETE');
		} catch (e) {
			const error = new Error('Facebook graph api call failed');
			this.logger.warn(
				error,
				'Facebook graph api call failed',
				{},
				'FacebookService',
				'revokePermission',
				LoggerCategory.AppLogs
			);
			return;
		}
	}

	private async checkIfPermissionExistsOnAccessToken(permissionName: string) {
		const loggedInData: FacebookUserModel = await this.getFacebookUser();
		try {
			const path = `/${loggedInData['fbUserId']}/permissions/${permissionName}`;
			const response = JSON.parse(await this.executeFacebookApi(path));
			return !(_.isEmpty(response.data) || response.data[0].status === 'declined');
		} catch (e) {
			return false;
		}
	}

	private async executeFacebookApi(
		path: string,
		httpRequestMethod = 'GET',
		nextToken: string = null,
		logoutUser: boolean = true
	) {
		try {
			path = path.startsWith('/') ? path : '/' + path;
			path = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
			this.logger.debug(
				'Graph api called',
				{facebookPath: path},
				'FacebookService',
				'executeFacebookApi',
				LoggerCategory.AppLogs
			);
			const response = (await this.appSync.executeFacebookGraphApi(httpRequestMethod, path, nextToken)).response;
			const isErrorPresentInResponse = JSON.parse(response).error ? true : false;
			if (isErrorPresentInResponse && logoutUser) {
				this.logger.debug('Logout user due to invalid fbAccessToken', {}, 'FacebookService', 'executeFacebookApi');
				this.isLoggedIn.next(false);
			}
			return response;
		} catch (e) {
			const error = new Error('API call to graph.facebook.com has failed');
			this.logger.warn(
				error,
				'Graph api call failed',
				{},
				'FacebookService',
				'executeFacebookApi',
				LoggerCategory.AppLogs
			);
			throw new Error('Unauthorized');
		}
	}
}
