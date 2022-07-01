import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {CEPOnboardingStateEnum} from '@campaigns/_enums/CEP-onboarding-state.enum';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-campaigns-left-panel',
	templateUrl: './campaigns-left-panel.component.html',
	styleUrls: ['./campaigns-left-panel.component.scss']
})
export class CampaignsLeftPanelComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	CEPOnboardingStateEnum = CEPOnboardingStateEnum;
	noOfGroupsEligibleForProfilePages;
	isProfilePageActive: boolean = false;

	constructor(injector: Injector, readonly userService: UserService, readonly groupsService: GroupsService) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.checkIfProfilePageIsActive();
		this.getUserDetails();
		this.getGroupDetails();
	}

	checkIfProfilePageIsActive() {
		this.appService.currentPageUrl.subscribe(pageUrl => {
			const url = pageUrl.split('/');
			if (url.length === 5 && url[4] === 'profile-pages') {
				this.isProfilePageActive = true;
				return;
			}
			this.isProfilePageActive = false;
		});
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async getGroupDetails() {
		this.noOfGroupsEligibleForProfilePages = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
			(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
		);
	}

	async getUserDetails() {
		this.user = await this.userService.getUser();
	}
}
