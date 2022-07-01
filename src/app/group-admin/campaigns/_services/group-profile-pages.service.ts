import {Injectable} from '@angular/core';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {BehaviorSubject} from 'rxjs';
import {BackendService} from '@sharedModule/services/backend.service';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {
	getGroupProfileReviewsResponse,
	getGroupReviewsResponse,
	UpdateGroupProfilePageInput
} from '@sharedModule/models/graph-ql.model';
import {environment} from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class GroupProfilePagesService {
	public isProfileGeneralSettingsUpdateSuccess = new BehaviorSubject<boolean>(false);
	public isProfilePageOnboardingPerformed: boolean = false;
	public profilePageOnboardingTracker = new BehaviorSubject<number>(0);
	private _selectedGroupForProfilePage = new BehaviorSubject<GroupModel>(null);
	public selectedGroupForProfilePage$ = this._selectedGroupForProfilePage.asObservable();
	private _selectedProfilePageOfSelectedGroup = new BehaviorSubject<GroupProfilePageModel>(null);
	public selectedProfilePageOfSelectedGroup$ = this._selectedProfilePageOfSelectedGroup.asObservable();
	private _listOfGroupsWithProfilePagesAccess: GroupModel[];
	private _selectedGroupProfileId = new BehaviorSubject<String>(null);
	public selectedGroupProfileId$ = this._selectedProfilePageOfSelectedGroup.asObservable();
	private profilePageList = {};
	// create behaviourSubject for profilePage loading state Abhishek
	private _isProfilePageData = new BehaviorSubject<GroupProfilePageModel>(null);
	public isProfilePageData$ = this._isProfilePageData.asObservable();

	private _openAudienceInsightPopup = new BehaviorSubject<boolean>(null);
	public openAudienceInsightPopup$ = this._openAudienceInsightPopup.asObservable();
	constructor(
		private groupsService: GroupsService,
		private backendService: BackendService,
		private amplifyService: AmplifyAppSyncService
	) {
		this.listGroupsWithProfilePagesAccess();
	}

	setSelectedGroupForProfilePage(group: GroupModel) {
		this._selectedGroupForProfilePage.next(group);
	}

	openAudienceInsightsEditModal() {
		this._openAudienceInsightPopup.next(true);
	}

	setAudienceInsightsPopups(emitEvent) {
		this._openAudienceInsightPopup.next(emitEvent);
	}

	checkIfAllSectionNeedToBeExpanded(profilePage) {
		if (!profilePage.featureConversations || profilePage.featureConversations?.length === 0) {
			return false;
		}

		if (
			!profilePage.popularTopics ||
			(profilePage.popularTopics && profilePage.popularTopics.filter(topic => topic.showTopic).length === 0)
		) {
			return false;
		}

		if (!profilePage.filesDetails || profilePage.filesDetails?.length === 0) {
			return false;
		}

		if (!profilePage.mostTalkedAboutBrands || profilePage.mostTalkedAboutBrands?.length === 0) {
			return false;
		}

		if (
			!profilePage.ageMetrics ||
			profilePage.ageMetrics?.length === 0 ||
			!profilePage.topCities ||
			profilePage.topCities?.length === 0 ||
			!profilePage.topCountries ||
			profilePage.topCountries?.length === 0
		) {
			return false;
		}

		return true;
	}

	async setSelectedProfilePageOfSelectedGroup(profileId: string) {
		// const profilePage: any = this.profilePageList.filter(page => page.id === profileId);
		// consos
		// this._selectedProfilePageOfSelectedGroup.next(profilePage);

		this._selectedGroupForProfilePage.getValue().groupProfilePage$.subscribe(profilePages => {
			if (!profilePages) {
				return;
			}
			this._selectedProfilePageOfSelectedGroup.next(
				profilePages.find(
					updatedProfilePage => this._selectedProfilePageOfSelectedGroup.getValue().id === updatedProfilePage.id
				)
			);
		});
	}

	setSelectedProfilePageId(profileId) {
		this._selectedGroupProfileId.next(profileId);
	}

	setIsProfilePageData(profilePage: GroupProfilePageModel) {
		this._isProfilePageData.next(profilePage);
	}

	async listGroupsWithProfilePagesAccess() {
		if (this._listOfGroupsWithProfilePagesAccess) {
			return this._listOfGroupsWithProfilePagesAccess;
		}

		this._listOfGroupsWithProfilePagesAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
			(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
		);
		if (!this._selectedGroupForProfilePage.getValue()) {
			this._selectedGroupForProfilePage.next(this._listOfGroupsWithProfilePagesAccess[0]);
		}
		return this._listOfGroupsWithProfilePagesAccess;
	}

	async createGroupProfilePage(groupId: string, name: string, profilePageCount: number, isDefaultPage: boolean) {
		let res;
		try {
			res = await this.amplifyService.createDefaultGroupProfilePage(groupId, name, isDefaultPage);
		} catch (e) {
			throw e;
		}
		await this.groupsService.updateGroupProfilePageCount(groupId, ++profilePageCount);
		return res as unknown as GroupProfilePageModel;
	}

	async duplicateProfilePage(
		groupId: string,
		id: string,
		name: string,
		profilePageCount: number
	): Promise<GroupProfilePageModel> {
		let res;
		try {
			res = await this.amplifyService.duplicateGroupProfilePage(groupId, id, name);
		} catch (e) {
			throw e;
		}
		await this.groupsService.updateGroupProfilePageCount(groupId, ++profilePageCount);
		return res as unknown as GroupProfilePageModel;
	}

	async listGroupProfilePages(groupId: string, nextToken: string = null): Promise<GroupProfilePageModel[]> {
		try {
			const res = await this.amplifyService.listGroupProfilePages(groupId, nextToken);
			let items = res.items ? res.items : [];

			// if (res.nextToken) {
			// 	const itemsFromNextToken:any = await this.listGroupProfilePages(groupId, res.nextToken);
			// 	items = items.concat(itemsFromNextToken);
			// }
			return items as unknown as GroupProfilePageModel[];
		} catch {
			return [];
		}
	}

	async getGroupReviews(groupProfileId: string): Promise<getGroupReviewsResponse> {
		try {
			return await this.amplifyService.getGroupReviews(groupProfileId);
		} catch (err) {
			return err;
		}
	}

	async getProfilePageByProfileId(profileId: string): Promise<GroupProfilePageModel> {
		try {
			return await this.amplifyService.getGroupProfileByProfileId(profileId);
		} catch (e) {
			console.log(e);
		}
	}

	updateProfilePage(profilePage: GroupProfilePageModel) {
		if (profilePage) {
			this.profilePageList[profilePage.id] = profilePage;
		}
	}

	async getGroupProfileReviews(groupProfileId: string): Promise<getGroupProfileReviewsResponse> {
		try {
			return await this.amplifyService.getGroupProfileReviews(groupProfileId);
		} catch (err) {
			return err;
		}
	}

	async publishGroupProfile(groupId: string, profileId: string) {
		try {
			return await this.amplifyService.publishGroupProfilePage(groupId, profileId);
		} catch (e) {
			return null;
		}
	}

	async updateGroupProfileDraft(input: UpdateGroupProfilePageInput) {
		try {
			return await this.amplifyService.updateGroupProfileDraft(input);
		} catch (e) {
			return null;
		}
	}

	async getGroupInsights(groupId) {
		try {
			return await this.backendService.httpGet(`${environment.groupInsights}/get-groups-insights?groupId=${groupId}`);
		} catch (e) {
			return e;
		}
	}

	public async getScreenshotsFromPostIds(body, token) {
		const apiPath = environment.envName === 'production' ? 'generate-screenshot-production' : 'generate-screenshot';
		try {
			return await this.backendService.postScreenshotUrl('/' + apiPath, body, token);
		} catch (e) {
			return e;
		}
	}
}
