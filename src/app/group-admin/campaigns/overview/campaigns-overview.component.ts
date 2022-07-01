import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {UserService} from '@sharedModule/services/user.service';
import {takeUntil} from 'rxjs/operators';
import {UserModel} from '@sharedModule/models/user.model';
import {GroupCampaignService} from '@groupAdminModule/_services/group-campaign.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {CEPOnboardingStateEnum} from '@campaigns/_enums/CEP-onboarding-state.enum';
import {GroupModel} from '@sharedModule/models/group.model';
import {AlertService} from '@sharedModule/services/alert.service';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Component({
	selector: 'app-campaigns-overview',
	templateUrl: './campaigns-overview.component.html',
	styleUrls: ['./campaigns-overview.component.scss']
})
export class CampaignsOverviewComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel = null;
	isUserEligibleForCEPOnboarding: boolean = false;
	groupForCEPOnboarding: GroupModel;
	isCEPOnboardingInitiated = false;
	currentCEPOnboardingState: CEPOnboardingStateEnum = CEPOnboardingStateEnum.NotEligible;
	CEPOnboardingStateEnum = CEPOnboardingStateEnum;
	profileCreationProgress:
		| 'ProfileCreationInitiated'
		| 'ProfileCreationComplete'
		| 'ProfileRedirectionInitiated'
		| null = null;

	constructor(
		injector: Injector,
		readonly userService: UserService,
		readonly groupCampaignService: GroupCampaignService,
		readonly groupService: GroupsService,
		readonly alertService: AlertService,
		readonly groupProfilePageService: GroupProfilePagesService,
		readonly router: Router,
		readonly route: ActivatedRoute,
		private readonly securedStorage: SecuredStorageProviderService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Overview', 'GA - Campaign Overview');
		this.userService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => (this.user = user));
		this.initiatedCommunityEarningPlatformOnboarding();
	}

	isCEPOnboardingInProgress(): boolean {
		if (!this.isUserEligibleForCEPOnboarding) {
			return false;
		} else {
			this.disableScrolling();
		}

		return !(
			this.currentCEPOnboardingState === CEPOnboardingStateEnum.Rejected ||
			this.currentCEPOnboardingState === CEPOnboardingStateEnum.Onboarded
		);
	}

	async initiatedCommunityEarningPlatformOnboarding() {
		if (
			!this.securedStorage.getCookie('initiateCEPOnboarding') ||
			!JSON.parse(this.securedStorage.getCookie('initiateCEPOnboarding'))
		) {
			return;
		}

		this.securedStorage.removeCookie('initiateCEPOnboarding');

		await this.userService.getUser();
		// this.isUserEligibleForCEPOnboarding = this.user.isBetaUser;
		this.currentCEPOnboardingState = this.user.CEPOnboardingState ?? CEPOnboardingStateEnum.Eligible;
		// if (!this.isUserEligibleForCEPOnboarding) {
		// 	this.isCEPOnboardingInitiated = true;
		// 	return;
		// }
		this.groupForCEPOnboarding = await this.groupService.getGroupForCEPOnboarding();
		this.isCEPOnboardingInitiated = true;
		if (this.user.CEPOnboardingState === CEPOnboardingStateEnum.Accepted) {
			this.checkAndCreateProfilePage();
		}
	}

	async updateCEPOnboardingSate(state: CEPOnboardingStateEnum) {
		this.currentCEPOnboardingState = state;
		const res = await this.userService.updateCEPOnboardingState(this.user.cognitoId, state);
		if (!res) {
			this.alertService.error(
				'Something went wrong. Please try again later!',
				'Something went wrong. Please try again later!'
			);
		}

		if (state === CEPOnboardingStateEnum.Accepted) {
			this.checkAndCreateProfilePage();
		}
	}

	async checkAndCreateProfilePage() {
		this.profileCreationProgress = 'ProfileCreationInitiated';
		await this.groupForCEPOnboarding.listProfilePages(this.groupProfilePageService);

		this.groupForCEPOnboarding.groupProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(async profilePages => {
			if (profilePages === null) {
				return;
			}
			// if (profilePages.length === 0) {
			// 	const res = await this.groupForCEPOnboarding.createGroupProfilePage(
			// 		this.groupForCEPOnboarding.name,
			// 		true,
			// 		this.groupProfilePageService
			// 	);
			// 	if (!res) {
			// 		this.processProfilePageNavigation(null, true);
			// 	}
			// 	return;
			// }

			const defaultProfile = profilePages.find(profilePage => profilePage.isDefaultProfile);
			this.processProfilePageNavigation(defaultProfile, !(profilePages.length > 0));
		});
	}

	async processProfilePageNavigation(profilePage, isError) {
		if (isError) {
			this.alertService.error(
				'Something went wrong. Please try again later!',
				'Something went wrong. Please try again later!'
			);
			this.currentCEPOnboardingState = CEPOnboardingStateEnum.Failed;
			return;
		}

		this.profileCreationProgress = 'ProfileCreationComplete';
		this.groupProfilePageService.setSelectedGroupForProfilePage(this.groupForCEPOnboarding);
		this.groupProfilePageService.setSelectedProfilePageOfSelectedGroup(profilePage);

		this.groupProfilePageService.isProfilePageOnboardingPerformed = true;
		await this.userService.updateCEPOnboardingState(this.user.cognitoId, CEPOnboardingStateEnum.Onboarded);
		this.profileCreationProgress = 'ProfileRedirectionInitiated';
		setTimeout(() => {
			this.router.navigateByUrl(`group-admin/campaigns/${profilePage.groupId}/profile-pages/${profilePage.id}/edit`);
		}, 500);
	}
}
