import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {FileSizeEnum} from '@sharedModule/enums/file-size.enum';
import {UserModel} from '@sharedModule/models/user.model';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {FileService} from '@sharedModule/services/file.service';
import {UserService} from '@sharedModule/services/user.service';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-bio-personal-info',
	templateUrl: './bio-personal-info.component.html',
	styleUrls: ['./bio-personal-info.component.scss']
})
export class BioPersonalInfoComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;

	quillConfig = {
		toolbar: [['bold', 'italic', 'link', {list: 'ordered'}, {list: 'bullet'}]]
	};
	image;
	previewImage;
	bioPersonalForm: FormGroup;
	countryList = [];
	selectedCountry;
	fileSizeError = false;
	typeError = false;
	user: UserModel;
	uploading = false;
	isCancelButtonClicked = false;
	userProfilePic;
	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private userService: UserService,
		private adminBioService: AdminBioService,
		private fileService: FileService,
		private facebookService: FacebookService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.initialize();
	}

	async initialize() {
		this.buildForm();
		this.user = await this.userService.getUser();
		this.previewImage = 'assets/images/default_user.png';
		if (!this.adminBio?.profilePictureUrl) {
			this.getUserProfilePic();
		}
		this.countryList = await this.userService.getCountries();
	}

	async getUserProfilePic() {
		this.userProfilePic = await this.facebookService.getProfilePicture(this.user.fbUserId);
		if (this.userProfilePic) {
			this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.profilePictureUrl, this.userProfilePic);
		}
	}

	buildForm() {
		this.bioPersonalForm = this.formBuilder.group({
			bio: [this.adminBio.bio ?? '']
		});

		this.bioPersonalForm.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(1000)).subscribe(data => {
			if (data.bio === '') {
				this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.Bio, '');
			}
			if (this.bioPersonalForm.get('bio').dirty) {
				this.adminBioService.updatePublishButtonStatus(true);
				this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.Bio, data.bio);
			}
		});
	}

	cancelUpload() {
		this.uploading = false;
		this.isCancelButtonClicked = true;
		this.image = null;
	}

	onFocus(event) {
		event.editor.container.classList.add('focus');
	}

	onBlur(event) {
		event.editor.container.classList.remove('focus');
	}

	selectedLocation(countryData) {
		this.adminBio.country = countryData.isoCode;
		this.adminBio.countryFullName = countryData.name;
		this.adminBioService.updatePublishButtonStatus(true);
		this.adminBioService.setandUpdateDraftAdminBio(null, null, {
			country: countryData.isoCode,
			countryFullName: countryData.name
		});
	}

	async fileUpload(event: Event) {
		this.isCancelButtonClicked = false;
		this.typeError = false;
		this.fileSizeError = false;
		this.enableScrolling();
		this.image = (<HTMLInputElement>event.target).files[0];
		if (!this.image.type.includes('image')) {
			this.typeError = true;
			this.disableScrolling();
			return;
		}
		if (this.image.size > FileSizeEnum.THREE_HUNDRED_MB) {
			this.fileSizeError = true;
			this.disableScrolling();
			return;
		}
		this.uploading = true;

		this.adminBioService.updatePublishButtonStatus(true);
		// Send Image url to Parent
		const imageUrl = await this.fileService.uploadToS3(this.image, 'image', this.randomUuid());
		if (this.isCancelButtonClicked) {
			return;
		}
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.profilePictureUrl, imageUrl);
		const reader = new FileReader();
		reader.readAsDataURL(this.image);
		reader.onload = _event => {
			this.previewImage = reader.result;
			this.uploading = false;
		};
	}

	closeErrorOverlay(event) {
		this.enableScrolling();
		event === 'fileSizeError' ? (this.fileSizeError = false) : (this.typeError = false);
	}

	showDefaultUserImage(event) {
		this.logger.debug(
			'Error loading user profile pic in admin bio',
			{},
			'BioPersonalInfoComponent',
			'showDefaultUserImage'
		);
		this.getUserProfilePic();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
