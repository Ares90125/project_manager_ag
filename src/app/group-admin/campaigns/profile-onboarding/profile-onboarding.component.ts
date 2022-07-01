import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {OnboardProgressStatusEnum} from '@campaigns/_enums/onboarding-progress-status.enum';
import {GroupModel} from '@sharedModule/models/group.model';
import {Router} from '@angular/router';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {ProfilePageDetailsComponent} from '../profile-pages/details/profile-page-details.component';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '../_services/group-profile-pages.service';
import {FileService} from '@sharedModule/services/file.service';
import {OnboardingStageEnum} from '@sharedModule/models/graph-ql.model';

@Component({
	selector: 'app-profile-onboarding',
	templateUrl: './profile-onboarding.component.html',
	styleUrls: ['./profile-onboarding.component.scss']
})
export class ProfileOnboardingComponent extends ProfilePageDetailsComponent implements OnInit, OnDestroy {
	@Input() isPitch = false;
	profileOnboardingStep: number = 0;
	isSaveInProgress = false;
	isEmptyStepData = false;
	showSkipModal = false;
	showTopProfileModal = false;
	resetEditChanges = new EventEmitter();

	profileProgressOptions = [
		{
			status: OnboardProgressStatusEnum.Current,
			title: 'Group Overview'
		},
		{
			status: OnboardProgressStatusEnum.Unbegun,
			title: 'Popular Topics'
		},
		{
			status: OnboardProgressStatusEnum.Unbegun,
			title: 'Top Group Conversations'
		},
		{
			status: OnboardProgressStatusEnum.Unbegun,
			title: 'Preview and Publish'
		}
	];

	pitchOnboardingOptions = [
		{
			status: OnboardProgressStatusEnum.Current,
			title: 'Customize Overview'
		},
		{
			status: OnboardProgressStatusEnum.Unbegun,
			title: 'Customize Topics'
		},
		{
			status: OnboardProgressStatusEnum.Unbegun,
			title: 'Customize Conversations'
		},
		{
			status: OnboardProgressStatusEnum.Unbegun,
			title: 'Preview and Publish'
		}
	];

	constructor(
		readonly groupProfilePagesService: GroupProfilePagesService,
		readonly fileService: FileService,
		injector: Injector
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async ngOnInit() {
		super._ngOnInit();
		this.groupProfilePagesService.isProfilePageData$.pipe(takeUntil(this.destroy$)).subscribe(profilePage => {
			if (profilePage) {
				this.profilePage = profilePage;
				super.setPageTitle('GA - Campaign Profile Onboarding', 'GA - Campaign Profile Onboarding', {
					isPitch: this.isPitch,
					profile_id: this.profilePage.id,
					group_name: this.profilePage.groupName,
					profile_group_id: this.profilePage.groupId,
					profile_group_name: this.profilePage.name
				});
				this.redirectStepHandle(profilePage.stage);
			}
		});
	}

	async saveProfilePage($event?) {
		const event = $event;
		this.isSaveInProgress = true;

		setTimeout(async () => {
			await this.group.saveProfilePage(this.profilePage, this.groupProfilePagesService, this.fileService);

			this.resetEditChanges.emit(true);
			this.isSaveInProgress = false;
			if (event?.toPrevStep) {
				this.profileOnboardingStep = this.profileOnboardingStep - 1;
			}
		}, 100);
	}

	async publishProfilePage() {
		this.isSaveInProgress = true;
		const response = await this.group.publishProfilePage(this.profilePage, this.groupProfilePagesService);
		if (!response) {
			this.alert.error('Something went wrong, please try again !', '');
		} else {
			const successPublishUrl = this.isPitch ? 'pitch' : 'profile';
			const url =
				'/group-admin/campaigns/' +
				this.profilePage?.groupId +
				'/profile-pages/' +
				this.profilePage?.id +
				'/success-publish/' +
				successPublishUrl;
			this.router.navigateByUrl(url);
		}
		this.isSaveInProgress = false;
	}

	redirectStepHandle(step: string) {
		switch (step) {
			case OnboardingStageEnum.OVERVIEW:
				this.profileOnboardingStep = 0;
				break;
			case OnboardingStageEnum.POPULAR_TOPPICS:
				this.profileOnboardingStep = 1;
				break;
			case OnboardingStageEnum.CONVERSATIONS:
				this.profileOnboardingStep = 2;
				break;
			case OnboardingStageEnum.PREVIEW_AND_PUBLISH:
				this.profileOnboardingStep = 3;
				break;
		}
	}

	letOpenSkipModal() {
		this.isEmptyStepData = true;
	}

	closeTopProfileModal() {
		this.showTopProfileModal = false;
	}

	openTopProfileModal(element) {
		this.recordButtonClick(element, null, null, null);
		this.showTopProfileModal = true;
	}

	backStepHandler(): void {
		this.profileOnboardingStep = this.profileOnboardingStep - 1;
	}

	forceNextStep(element) {
		this.recordButtonClick(element, null, null, null);
		this.showSkipModal = false;
		this.profileOnboardingStep = this.profileOnboardingStep + 1;
	}

	nextStepHandler(): void {
		this.profileOnboardingStep = this.profileOnboardingStep + 1;
	}
}
