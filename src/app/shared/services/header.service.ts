import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GroupsService} from './groups.service';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {HeaderSubscriptionModel} from '@sharedModule/models/header-subscription.models';

@Injectable({
	providedIn: 'root'
})
export class HeaderService {
	public showBrandTrackLinkInHeader = new BehaviorSubject<boolean>(null);
	private _changeInHeader = new BehaviorSubject<HeaderSubscriptionModel>(null);
	public changeInHeader$ = this._changeInHeader.asObservable();
	installedGroupCount = 0;
	private _isInitialized = false;
	private _hasGroupsAdded = new BehaviorSubject<boolean>(null);
	public hasGroupsAdded$ = this._hasGroupsAdded.asObservable();
	private _hasGroupsInstalled = new BehaviorSubject<boolean>(null);
	public hasGroupsInstalled$ = this._hasGroupsInstalled.asObservable();
	public highestMemberInGroup = 0;

	constructor(private readonly groupService: GroupsService) {}

	async init() {
		if (this._isInitialized) {
			return;
		}
		this._isInitialized = true;
		this.groupService.init();
		this.groupService.groups.subscribe(groups => {
			if (groups === null) {
				return;
			}

			this._hasGroupsAdded.next(groups.length !== 0);
			this.highestMemberInGroup = groups.reduce((accumulator, currentValue) => {
				return accumulator > currentValue.memberCount ? accumulator : currentValue.memberCount;
			}, 0);
			this.installedGroupCount = groups.filter(group => group.state === GroupStateEnum.Installed).length;

			this._hasGroupsInstalled.next(this.installedGroupCount !== 0);
			if (groups.length === 0) {
				this.hideAllNavgationLinksFromHeader();
			} else {
				this.showHeaderLink();
			}
			this.checkToShowAllLink();
		});
	}

	async checkToShowAllLink() {
		if (this.installedGroupCount >= 2) {
			this._changeInHeader.next({
				showScheduleLinkInHeader: true,
				showNotificationBellInHeader: true,
				showCampaignLinkInHeader: true,
				showGroupLinkInHeader: true
			});
		}
	}

	showHeaderLink() {
		this._changeInHeader.next({
			showNotificationBellInHeader: true,
			showCampaignLinkInHeader: true,
			showGroupLinkInHeader: true
		});
	}

	hideAllNavgationLinksFromHeader() {
		this._changeInHeader.next({
			showGroupLinkInHeader: false,
			showCampaignLinkInHeader: false,
			showNotificationBellInHeader: false
		});
	}

	hideNotificationIconFromHeader() {
		this._changeInHeader.next({
			showNotificationBellInHeader: false
		});
	}
}
