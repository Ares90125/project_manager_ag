import {Component, ElementRef, HostListener, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FacebookPermissionEnum} from '@sharedModule/enums/facebook-permission.enum';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {AdminBioModel} from '@sharedModule/models/admin-bio.model';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {FileService} from '@sharedModule/services/file.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UserService} from '@sharedModule/services/user.service';
import {AnimationOptions} from 'ngx-lottie';
import * as _ from 'lodash';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {environment} from '../../../../environments/environment';

declare var window: any;
@Component({
	selector: 'app-admin-bio',
	templateUrl: './admin-bio.component.html',
	styleUrls: ['./admin-bio.component.scss']
})
export class AdminBioComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() isIntroductionSectionNeeded? = true;
	showPublishButton = false;
	isAdminBioLoaded = false;
	draftAdminBio: AdminBioModel;
	mainAdminBio: AdminBioModel;
	profileUrl: any;
	pitchVideo: any;
	saveButtonLoading = false;
	supportingDocs;
	supportedGroups: any;
	adminGroups: any;
	keyAchievementFormStatus = true;
	supportingFormsStatus = true;
	showAdminPopupLoader = false;
	progressStatus = 0;
	openShareModal = false;
	isAdminBioUpdated = false;
	openAdminPreviewOverlay = false;
	cancelUploadAdminBio = false;
	openPopupToSaveForm = false;
	isBioFilled = false;
	showAdminPromptModal = false;
	draftButtonStatus;
	environment = environment;

	// @HostListener('window:beforeunload', ['$event'])
	// beforeUnloading(event) {
	// 	// Abhishek fixed the condition here - Auto Save
	// 	if (this.showPublishButton) {
	// 		event.preventDefault();
	// 		event.returnValue = true;
	// 		return event;
	// 	}
	// }
	constructor(
		injector: Injector,
		private readonly adminBioService: AdminBioService,
		private readonly fileService: FileService,
		private readonly groupsService: GroupsService,
		private readonly userService: UserService,
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly securedStorageProvider: SecuredStorageProviderService
	) {
		super(injector);
	}

	loadingAnimationOption: AnimationOptions = {
		path: './assets/json/loading-animation.json'
	};

	successAnimationOption: AnimationOptions = {
		path: './assets/json/success-animation.json'
	};

	draftSavedAnimationOption: AnimationOptions = {
		path: './assets/json/draft-saved-animation.json'
	};

	async ngOnInit() {
		super._ngOnInit();
		this.initialize();
	}

	async initialize() {
		this.enableScrolling();
		this.securedStorageProvider.removeSessionStorage('login_through_OAuthState');
		await this.adminBioService.init();
		this.checkQueryStringForStateParameter();
		this.subscriptionsToDestroy.concat([
			this.adminBioService.currentDraftAdminBioData$.subscribe(draftAdmin => {
				this.draftAdminBio = draftAdmin;
			}),
			this.adminBioService.mainAdminBioData$.subscribe(mainAdmin => {
				this.mainAdminBio = mainAdmin;
				super.setPageTitle(
					`GA - ${this.mainAdminBio.firstName} ${this.mainAdminBio.lastName} - Admin Bio`,
					'GA - Admin Name - Admin Bio',
					{
						user_id: this.mainAdminBio.userId,
						admin_name: `${this.mainAdminBio.firstName} ${this.mainAdminBio.lastName}`,
						url: !!window ? window?.location?.href : ''
					}
				);
			}),
			this.adminBioService.showPublishBioButton$.subscribe(bool => {
				this.showPublishButton = bool;
			}),
			this.adminBioService.isAdminBioLoaded$.subscribe(bool => {
				this.isAdminBioLoaded = bool;
			}),
			this.adminBioService.draftButtonStatus$.subscribe(status => {
				this.draftButtonStatus = status;
			})
		]);
	}

	checkQueryStringForStateParameter() {
		this.subscriptionsToDestroy.push(
			this.route.queryParams.subscribe(queryParams => this.checkStateHasGroupPermission(queryParams))
		);
	}

	async checkStateHasGroupPermission(queryParams) {
		if (!_.isEmpty(queryParams)) {
			const currentUser = await this.userService.getUser();
			try {
				if (
					queryParams.state &&
					JSON.parse(queryParams.state).permissionAskFor === FacebookPermissionEnum.GroupPermission
				) {
					await this.groupsService.addMoreGroupsFromFacebook(currentUser);
				}
				if (
					queryParams.ref === 'open_admin_bio_popup' &&
					!currentUser.isAdminBioCompleted &&
					!this.securedStorageProvider.getCookie('AdminBioJourneyInManagePage')
				) {
					this.showAdminPromptModal = true;
					this.disableScrolling();
				}
			} catch {
				// Json.parse may throw serialization exception is queryParams.state is not json
			}
		}
	}

	adminBioSupportingDocs(event) {
		this.supportingDocs = event.map(e => {
			if (!e.file && e.url) {
				return e;
			}
			return {
				file: e.file,
				size: e.size,
				title: e.title,
				type: e.type,
				fileExtension: e.fileExtension,
				fileTitle: e.fileTitle
			};
		});
	}

	closeAdminOverlay(event) {
		this.enableScrolling();
		this.securedStorageProvider.setCookie('AdminBioJourneyInManagePage', 'true');
		this.showAdminPromptModal = false;
	}

	async saveAdminBio() {
		try {
			this.saveButtonLoading = true;
			this.isAdminBioUpdated = false;
			await this.adminBioService.updateAdminBio();
			await this.userService.refreshUser();
			this.showAdminPopupLoader = true;
			this.disableScrolling();
			this.saveButtonLoading = false;
			this.adminBioService.updatePublishButtonStatus(false);
		} catch (e) {
			this.alert.error('Something went wrong, Please try after some time', '');
			this.logger.error(
				e,
				'Error while updating admin bio',
				{show_admin_popup_loader: this.showAdminPopupLoader},
				'AdminBioComponent',
				'saveAdminBio',
				LoggerCategory.AppLogs
			);
			this.adminBioService.updatePublishButtonStatus(false);
			this.showPublishButton = false;
			this.enableScrolling();
			this.saveButtonLoading = false;
		}
	}

	async getFilesUrl(file) {
		const url = await this.fileService.uploadToS3(file.file, file.file.type.split('/')[0], this.randomUuid());

		return {
			url: url,
			title: file.title,
			size: file.size,
			type: file.type,
			fileExtension: file.fileExtension,
			fileTitle: file.fileTitle
		};
	}

	closePreview(event) {
		this.openAdminPreviewOverlay = false;
		this.enableScrolling();
	}

	openPreviewOverlay() {
		this.openAdminPreviewOverlay = true;
		this.showAdminPopupLoader = false;
		this.disableScrolling();
	}

	closePopup(event) {
		this.enableScrolling();
		this.openShareModal = false;
		this.showAdminPopupLoader = false;
	}

	openShareModalPopup() {
		this.disableScrolling();
		this.openShareModal = true;
	}

	closeAdminPopup() {
		this.enableScrolling();
		this.showAdminPopupLoader = false;
	}

	cancelProcess() {
		this.cancelUploadAdminBio = true;
		this.showAdminPopupLoader = false;
		this.enableScrolling();
		this.showPublishButton = true;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
