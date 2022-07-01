import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {UserService} from '@sharedModule/services/user.service';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-bio-contact',
	templateUrl: './bio-contact.component.html',
	styleUrls: ['./bio-contact.component.scss']
})
export class BioContactComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio;
	contactForm: FormGroup;
	disabledChecked = true;
	isEmailAlreadyExists = false;
	submittingDetails = false;
	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly adminBioService: AdminBioService,
		private readonly userService: UserService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.initiateForm();
	}

	async initiateForm() {
		const user = await this.userService.getUser();
		let userEmail;
		if (user?.email && !this.adminBio?.contactEmail) {
			this.disabledChecked = false;
			this.isEmailAlreadyExists = false;
			this.adminBio.allowBrandsToContact = true;
			userEmail = user.email.toLowerCase();
			this.updateBioContact(true);
		} else if (this.adminBio?.contactEmail) {
			this.disabledChecked = false;
			this.isEmailAlreadyExists = true;
			userEmail = this.adminBio.contactEmail.toLowerCase();
		}
		this.contactForm = this.formBuilder.group({
			email: [userEmail, [Validators.required, Validators.email]]
		});
		this.contactForm
			.get('email')
			.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(1000))
			.subscribe(data => {
				this.validateContactForm();
			});
	}

	validateContactForm() {
		if (this.contactForm.invalid) {
			this.disabledChecked = true;
		}
		if (!this.contactForm.invalid || !this.contactForm?.get('email').value) {
			if (!this.isEmailAlreadyExists) {
				this.adminBio.allowBrandsToContact = true;
			}
			if (!this.contactForm?.get('email').value) {
				this.adminBio.allowBrandsToContact = false;
				this.disabledChecked = true;
			} else {
				this.disabledChecked = false;
			}
			this.updateBioContact();
		}
	}

	async updateBioContact(isFromUser = false) {
		const user = await this.userService.getUser();
		this.submittingDetails = true;
		try {
			const input = {
				allowBrandsToContact: !!this.adminBio.allowBrandsToContact,
				contactEmail: isFromUser ? user?.email?.toLowerCase() : this.contactForm.get('email').value?.toLowerCase()
			};
			if ((!this.isEmailAlreadyExists || isFromUser) && user?.isAdminBioCompleted) {
				await this.adminBioService.setandUpdateDraftAdminBio(null, null, input);
				await this.adminBioService.updateAdminBio();
				this.isEmailAlreadyExists = true;
			} else {
				await this.adminBioService.setandUpdateDraftAdminBio(null, null, input);
				this.adminBioService.updatePublishButtonStatus(true);
			}
			if (!this.contactForm?.get('email').value) {
				this.isEmailAlreadyExists = false;
			}
			this.submittingDetails = false;
		} catch (e) {
			this.submittingDetails = false;
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
