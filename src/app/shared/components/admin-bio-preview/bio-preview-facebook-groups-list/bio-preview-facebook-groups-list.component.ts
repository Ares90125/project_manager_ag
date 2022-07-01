import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BackendService} from '@sharedModule/services/backend.service';
import {environment} from 'src/environments/environment';
declare var window: any;

@Component({
	selector: 'app-bio-preview-facebook-groups-list',
	templateUrl: './bio-preview-facebook-groups-list.component.html',
	styleUrls: ['./bio-preview-facebook-groups-list.component.scss']
})
export class BioPreviewFacebookGroupsListComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groups;
	@Input() groupType;
	openGroupsOverlay = false;
	constructor(private readonly backendService: BackendService, injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	async openModalORGroupPage(group) {
		if (this.groups.length > 5) {
			this.openGroupsOverlay = true;
			this.disableScrolling();
		} else {
			try {
				const responseUrl = await this.backendService.httpGet(
					`${environment.apiUrl}/get-default-group-profile-url?groupId=${group.id}`
				);
				window.open(responseUrl, '_blank');
			} catch (error) {
				window.open(`https://www.facebook.com/groups/${group.fbGroupId}`, '_blank');
			}
		}
	}

	openGroupsOverlayPopup() {
		this.disableScrolling();
		this.openGroupsOverlay = true;
	}

	closeGroupOverlay() {
		this.enableScrolling();
		this.openGroupsOverlay = false;
	}

	async openGroupLink(group) {
		try {
			const responseUrl = await this.backendService.httpGet(
				`${environment.apiUrl}/get-default-group-profile-url?groupId=${group.id}`
			);
			window.open(responseUrl, '_blank');
		} catch (error) {
			window.open(`https://www.facebook.com/groups/${group.fbGroupId}`, '_blank');
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
