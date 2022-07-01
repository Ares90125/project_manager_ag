import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';

@Component({
	selector: 'app-bio-social-profiles',
	templateUrl: './bio-social-profiles.component.html',
	styleUrls: ['./bio-social-profiles.component.scss']
})
export class BioSocialProfilesComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;

	socialProfileList = [];
	selectedType: string;
	showForm = false;
	socialForm: FormGroup;
	showError = false;
	constructor(injector: Injector, private readonly formBuilder: FormBuilder, private adminBioService: AdminBioService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.buildForm();
		if (this.adminBio?.socialProfiles && this.adminBio?.socialProfiles.length > 0) {
			this.socialProfileList = this.adminBio.socialProfiles;
		}
	}

	openSocialProfileOnNewTab(link) {
		window.open(link, '_blank');
	}

	buildForm() {
		this.socialForm = this.formBuilder.group({
			profileUrl: ['', [Validators.required]]
		});
		this.socialForm.get('profileUrl').valueChanges.subscribe(data => {
			this.showError = false;
			if (this.socialForm.get('profileUrl').errors) {
				this.showError = true;
				return;
			}
		});
	}

	resetForm() {
		this.showForm = false;
		this.socialForm.reset();
	}

	selectProfile(type) {
		this.selectedType = type;
		this.socialForm.get('profileUrl').clearValidators();
		this.socialForm.get('profileUrl').setValidators(Validators.required);
		switch (type) {
			case 'Facebook':
				this.socialForm
					.get('profileUrl')
					.setValidators(
						Validators.pattern(
							/^(?:http(s)?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i
						)
					);
				break;
			case 'Instagram':
				this.socialForm.get('profileUrl').setValidators(Validators.pattern(null));
				break;
			case 'Twitter':
				this.socialForm.get('profileUrl').setValidators(Validators.pattern(null));
				break;
			case 'LinkedIn':
				this.socialForm
					.get('profileUrl')
					.setValidators(
						Validators.pattern(
							/^(?:http(s)?:\/\/)?(?:www\.)?(?:linkedin)\.(?:com)\/((([\w]{2,3})?)|([^\/]+\/(([\w|\d-&#?=])+\/?){1,}))/i
						)
					);
				break;
			case 'YouTube':
				this.socialForm
					.get('profileUrl')
					.setValidators(
						Validators.pattern(/^(?:http(s)?:\/\/)?(?:www\.)?(?:youtube)\.(?:com)\/(channel|user|c)\/[\w-]+/i)
					);
				break;
			default:
				this.socialForm
					.get('profileUrl')
					.setValidators(
						Validators.pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/)
					);
		}
		this.showForm = true;
	}

	saveProfile() {
		let url = this.socialForm.getRawValue().profileUrl;
		if (this.selectedType === 'Twitter') {
			if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
				this.socialProfileList.push({
					platform: this.selectedType,
					profileLink: `http://twitter.com/${url}/`
				});
			} else {
				this.socialProfileList.push({
					platform: this.selectedType,
					profileLink: url
				});
			}
		} else if (this.selectedType === 'Instagram') {
			if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
				this.socialProfileList.push({
					platform: this.selectedType,
					profileLink: `https://www.instagram.com/${url}/`
				});
			} else {
				this.socialProfileList.push({
					platform: this.selectedType,
					profileLink: url
				});
			}
		} else {
			if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
				this.socialProfileList.push({
					platform: this.selectedType,
					profileLink: 'https://' + url
				});
			} else {
				this.socialProfileList.push({
					platform: this.selectedType,
					profileLink: url
				});
			}
		}

		this.adminBioService.updatePublishButtonStatus(true);
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.socialProfiles, this.socialProfileList);
		document.getElementById('closeSocialProfile').click();
		this.socialForm.reset();
	}

	removeSocialProfile(index) {
		this.socialProfileList.splice(index, 1);
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.socialProfiles, this.socialProfileList);
		this.adminBioService.updatePublishButtonStatus(true);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
