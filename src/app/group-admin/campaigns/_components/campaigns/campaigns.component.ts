import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {GroupCampaignService} from '@groupAdminModule/_services/group-campaign.service';
import {UserService} from '@sharedModule/services/user.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import * as typeformEmbed from '@typeform/embed';
import {UserModel} from '@sharedModule/models/user.model';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'src/environments/environment';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignGroupsModel} from '@sharedModule/models/campaign-groups.model';
import {CampaignCommunityStatusEnum} from '@sharedModule/enums/campaign-type.enum';

export enum ManageCampaignScreen {
	'HasCampaign' = 'HasCampaign',
	'MoreThan2000Mem' = 'MoreThan2000Mem',
	'LessThan2000Mem' = 'LessThan2000Mem',
	'ThankYou' = 'ThankYou'
}

@Component({
	selector: 'app-campaigns',
	templateUrl: './campaigns.component.html',
	styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() isCEPOnboardingInProgress = true;
	showPersonaSurvey = false;
	user: UserModel;
	timerToDestroy = null;
	campaigns = {newCampaigns: 0, active: 0, completed: 0};
	showCampaignDetailsPopup = false;
	isCampaignsLoading = false;
	selectedScreen: ManageCampaignScreen;
	userName;
	campaignList: CampaignGroupsModel[];
	typeFormModal: any;
	talkToExpertClicked = false;
	showSwitchFBAccOverlay = false;
	userNameFromQueryString;
	loadingData = true;
	upcomingCampaigns;

	constructor(
		private injector: Injector,
		private router: Router,
		private groupCampaignService: GroupCampaignService,
		private userService: UserService,
		private securedStorage: SecuredStorageProviderService,
		private route: ActivatedRoute
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.appService.setFreshchatFAQ('');
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(async usr => {
				if (!usr) {
					return;
				}

				this.user = usr;
				this.userNameFromQueryString = this.route.snapshot.queryParams.username;
				if (this.userNameFromQueryString) {
					if (this.user.username === this.route.snapshot.queryParams.username) {
						return;
					}
					this.showSwitchFBAccountPopup();
				}
				this.userName = usr.fullname;
				super.setPageTitle('GA - Campaign', 'GA - Campaign', {userId: usr.id});
				this.getUserCampaigns();
			})
		);
		this.startTimeoutForPersonaSurvey();
	}

	showSwitchFBAccountPopup() {
		this.recordDialogBoxShow('Switch FB Account');
		this.showSwitchFBAccOverlay = true;
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
		clearTimeout(this.timerToDestroy);
	}

	startTimeoutForPersonaSurvey() {
		this.timerToDestroy = setTimeout(() => {
			if (this.isCEPOnboardingInProgress) {
				this.startTimeoutForPersonaSurvey();
				return;
			}

			if (
				!this.appService.personaAlreadyShown &&
				!this.userService.userJustSignedUp.getValue() &&
				!this.userService.isPersonaSurveyFilled &&
				//@ts-ignore
				!window.Cypress
			) {
				this.appService.personaAlreadyShown = true;
				this.showPersonaSurvey = true;
				this.recordDialogBoxShow('Persona survey');
			}
		}, 10000);
	}

	navigateToCampaignReports() {
		this.router.navigateByUrl(`group-admin/campaigns/campaign-report`);
	}

	async getUserCampaigns() {
		this.isCampaignsLoading = true;
		this.campaignList = await this.groupCampaignService.getUserCampaigns();
		if (this.campaignList?.length > 0) {
			const campaignWithStatusCampaignBriefSent = this.campaignList.filter(
				campaign => campaign.groupTaskStatus === CampaignCommunityStatusEnum.CampaignBriefSent
			);
			const campaignWithStatusTaskRequestSent = this.campaignList.filter(
				campaign => campaign.groupTaskStatus === CampaignCommunityStatusEnum.TaskRequestSent
			);
			const campaignWithStatusScheduled = this.campaignList.filter(
				campaign => campaign.groupTaskStatus === CampaignCommunityStatusEnum.TaskScheduled
			);
			const campaignsRemaining = this.campaignList.filter(
				campaign =>
					campaign.groupTaskStatus !== CampaignCommunityStatusEnum.CampaignBriefSent &&
					campaign.groupTaskStatus !== CampaignCommunityStatusEnum.TaskRequestSent &&
					campaign.groupTaskStatus !== CampaignCommunityStatusEnum.TaskScheduled
			);
			this.campaignList = campaignWithStatusCampaignBriefSent
				.concat(campaignWithStatusTaskRequestSent)
				.concat(campaignWithStatusScheduled)
				.concat(campaignsRemaining);
		}
		if (
			(!this.campaignList || this.campaignList.length < 1) &&
			(!this.upcomingCampaigns || this.upcomingCampaigns?.length === 0)
		) {
			const isTypeformSubmitted = await (this.securedStorage.getSessionStorage('typeform_submitted') ||
				this.user.typeformResponseId);
			if (isTypeformSubmitted) {
				this.selectedScreen = ManageCampaignScreen.ThankYou;
				this.isCampaignsLoading = false;
				this.loadingData = false;
				return;
			}

			if (this.headerService.highestMemberInGroup >= 2000) {
				this.showMoreThan2000MemScreen();
			} else {
				this.selectedScreen = ManageCampaignScreen.LessThan2000Mem;
			}
			this.isCampaignsLoading = false;
			this.loadingData = false;
			return;
		}
		this.selectedScreen = ManageCampaignScreen.HasCampaign;
		const dateTimeNow = new DateTime();
		this.isCampaignsLoading = false;
		this.loadingData = false;
	}

	async showMoreThan2000MemScreen() {
		this.typeFormModal = await typeformEmbed.makePopup(
			`https://convosight.typeform.com/to/${environment.typeformFormId}`,
			{
				mode: 'popup',
				autoClose: 2,
				onSubmit: async event => {
					try {
						await this.groupCampaignService.updateTypeform(environment.typeformFormId, event.response_id);
						this.securedStorage.setSessionStorage('typeform_submitted', 'true');
						this.selectedScreen = ManageCampaignScreen.ThankYou;
						this.logger.info(
							'typeform_submitted',
							{user_id: this.user.id, response_id: event.response_id},
							'CampaignsComponent',
							'showMoreThan2000MemScreen',
							LoggerCategory.ClickStream
						);
					} catch (e) {
						const error = new Error('Update Typeform Details API failed');
						this.logger.error(
							error,
							'Update Typeform Details API failed',
							{userId: this.user.id},
							'CampaignsComponent',
							'showMoreThan2000MemScreen'
						);
					}
				},
				onClose: () => {
					this.logger.debug(
						'typeform_closed',
						{userId: this.user.id},
						'CampaignsComponent',
						'showMoreThan2000MemScreen',
						LoggerCategory.ClickStream
					);
					this.talkToExpertClicked = false;
				}
			}
		);
		this.selectedScreen = ManageCampaignScreen.MoreThan2000Mem;
	}

	showCampaignDetails(campaign, element) {
		this.recordButtonClick(element);
		if (campaign.groupId) {
			this.router.navigateByUrl(`group-admin/campaigns/${campaign.groupId}/${campaign.campaignId}`);
		} else {
			this.router.navigateByUrl(`group-admin/campaigns/${campaign.campaignId}`);
		}
	}

	showTypeForm(element) {
		this.recordButtonClick(element);
		this.talkToExpertClicked = true;
		this.typeFormModal.open();
	}

	closeSwitchFBOverlay(event) {
		this.showSwitchFBAccOverlay = false;
	}

	isCampaignUpcoming(status) {
		return (
			status === CampaignCommunityStatusEnum.CampaignBriefSent ||
			status === CampaignCommunityStatusEnum.ContentApproved ||
			status === CampaignCommunityStatusEnum.TaskCreated
		);
	}

	isCampaignUpcomingOrAcceptedOrRejected(status) {
		return (
			status === CampaignCommunityStatusEnum.CampaignAccepted ||
			status === CampaignCommunityStatusEnum.CampaignDeclined ||
			this.isCampaignUpcoming(status)
		);
	}

	statusToShow(status) {
		switch (status) {
			case CampaignCommunityStatusEnum.CampaignBriefSent:
				return {status: 'New', class: 'cs-text-orange', icon: 'new_releases-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.ContentApproved:
				return {status: 'New', class: 'cs-text-orange', icon: 'new_releases-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskCreated:
				return {status: 'Active', class: 'cs-text-success', icon: 'bolt-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.CampaignAccepted:
				return {status: 'Active', class: 'cs-text-success', icon: 'bolt-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.CampaignDeclined:
				return {status: 'Declined', class: 'cs-text-error', icon: 'close-circle-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskRequestSent:
				return {status: 'Approval Pending', class: 'cs-text-orange', icon: 'timelapse-orange-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskScheduled:
				return {status: 'Scheduled', class: 'cs-text-success', icon: 'circle_check-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskDeclined:
				return {status: 'Declined', class: 'cs-text-error', icon: 'close-circle-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskCompleted:
				return {status: 'Post Live', class: 'cs-text-success', icon: 'circle_check-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskFailed:
				return {status: 'Error', class: 'cs-text-error', icon: 'error-icon.svg'};
				break;
			case CampaignCommunityStatusEnum.TaskPaused:
				return {status: 'Error', class: 'cs-text-error', icon: 'error-icon.svg'};
				break;
		}
	}
}
