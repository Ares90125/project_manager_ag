import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {BackendService} from '@sharedModule/services/backend.service';
import {UserService} from '@sharedModule/services/user.service';
import {environment} from 'src/environments/environment';
@Component({
	selector: 'app-bio-slug-url',
	templateUrl: './bio-slug-url.component.html',
	styleUrls: ['./bio-slug-url.component.scss']
})
export class BioSlugUrlComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio;
	isCopied: boolean = false;
	bioUrlForm: FormGroup;
	errorState: string;
	isOldUrlExpired = false;
	showConfirmDialog = false;
	profileBaseUrl: string = environment.profileConvosightUrl;
	isOldProfileLinkExpired: boolean = false;
	showExpiredPopup: boolean = false;
	showFormModal: boolean = false;
	showError: boolean = false;
	isLinkUnique: boolean = false;
	OldSlugUrl: string;
	checkingSlugIsUnique: boolean = false;
	isFocused: boolean = false;
	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly backendService: BackendService,
		private readonly userService: UserService,
		private readonly adminBioService: AdminBioService
	) {
		super(injector);
	}
	ngOnInit() {
		super._ngOnInit();
		this.adminBioService.openSlugPopup$.subscribe(bool => {
			if (bool) {
				if (this.isOldProfileLinkExpired) {
					this.openExpiredModal();
				} else {
					this.openEditModal();
				}
				this.adminBioService.setSlugPopupStatus(false);
			}
		});
		this.checkIfOldSlugIsExpired();
		this.initForm();
	}

	checkIfOldSlugIsExpired() {
		if (this.adminBio?.oldProfileUrlSlug) {
			this.OldSlugUrl = `${this.profileBaseUrl}${this.adminBio?.oldProfileUrlSlug}`;
			this.isOldProfileLinkExpired = new Date().getTime() - new Date(this.adminBio?.oldSlugExpiredDate).getTime() > 0;
		}
	}

	initForm() {
		this.bioUrlForm = this.formBuilder.group({
			url: [this.adminBio?.profileUrlSlug, [Validators.required, Validators.pattern('[a-z0-9-._]{3,30}')]]
		});
	}

	async processSlugInput(event: Event) {
		this.isLinkUnique = false;
		this.checkingSlugIsUnique = true;
		this.showError = false;
		this.errorState = '';
		const data = (event.target as HTMLInputElement).value;
		if (data.length === 0) {
			this.checkingSlugIsUnique = false;
			this.showError = true;
			this.errorState = 'Unfilled';
			return;
		}

		if (data.length < 3 || data.length > 30) {
			this.checkingSlugIsUnique = false;
			this.showError = true;
			this.errorState = 'Length';
			return;
		}

		if (this.bioUrlForm.invalid) {
			this.checkingSlugIsUnique = false;
			this.showError = true;
			if (this.bioUrlForm.get('url')?.errors?.pattern) {
				this.errorState = 'Pattern';
				return;
			}
		}

		const isLinkUnique = await this.checkIfSlugIsUnique(data);
		if (!isLinkUnique.success) {
			this.checkingSlugIsUnique = false;
			this.showError = true;
			this.errorState = 'Unique';
			return;
		}
		this.checkingSlugIsUnique = false;
		this.isLinkUnique = true;
	}

	async checkIfSlugIsUnique(slug) {
		return await this.backendService.restGet(
			`/adminprofile/slug?slug=${slug}`,
			await this.userService.getCurrentSessionJWTToken()
		);
	}

	processCopyText(event) {
		this.logger.info(
			'button_clicked',
			{
				button_cs_id: '084a8ee5-ae1f-453a-8871-129dc33d34ed',
				button_label: 'Copy Field',
				share_from: 'slug',
				source: 'dialog'
			},
			'ShareWidgetComponent',
			'processCopyText',
			LoggerCategory.ClickStream
		);
	}

	copyToClipboard(url: string) {
		this.isCopied = true;
		this.appService.copyToClipboard(url);
	}

	openEditModal() {
		this.disableScrolling();
		this.showConfirmDialog = true;
	}

	openExpiredModal() {
		this.disableScrolling();
		this.showExpiredPopup = true;
	}

	openFormModal() {
		this.disableScrolling();
		this.showFormModal = true;
		this.showConfirmDialog = false;
	}

	closeModal() {
		this.enableScrolling();
		this.showExpiredPopup = false;
		this.showConfirmDialog = false;
		this.showFormModal = false;
		this.showError = false;
		this.isLinkUnique = false;
	}

	async submitForm() {
		const slug = this.bioUrlForm.getRawValue();
		const data = await this.backendService.restPut(
			'/adminprofile/slug',
			{
				slug: `${slug.url}`
			},
			await this.userService.getCurrentSessionJWTToken()
		);
		if (data.success) {
			this.adminBio = await (await this.adminBioService.getAdminBio()).mainBio;
			this.OldSlugUrl = `${this.profileBaseUrl}${this.adminBio?.oldProfileUrlSlug}`;
		} else {
			this.alert.error('Something went wrong, please try again !', '');
		}
		this.closeModal();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
