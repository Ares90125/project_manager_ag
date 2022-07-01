import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BrandService} from 'src/app/brand/services/brand.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {FileService} from '@sharedModule/services/file.service';
import {UserService} from '@sharedModule/services/user.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'app-create-brand',
	templateUrl: './create-brand.component.html',
	styleUrls: ['./create-brand.component.scss']
})
export class CreateBrandComponent extends BaseComponent implements OnInit, OnDestroy {
	logo;
	previewImage;
	creationInProgress = false;
	createBrandForm: FormGroup;
	showError = false;

	constructor(
		injector: Injector,
		private readonly brandService: BrandService,
		private readonly router: Router,
		private fileService: FileService,
		private readonly route: ActivatedRoute,
		private userService: UserService,
		private readonly formBuilder: FormBuilder
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		super.setPageTitle('Create Brand', 'Create Brand');
		this.buildForm();
	}

	buildForm() {
		const name = this.route.snapshot.queryParams.brand;
		this.createBrandForm = this.formBuilder.group({
			name: [name ? name : '', [Validators.required]],
			communicationEmailForCredentials: ['', [Validators.required, Validators.email]]
		});
	}

	async goBack() {
		this.router.navigate(['/cs-admin/manage-brands']);
	}

	async fileUpload(event: Event) {
		this.logo = (<HTMLInputElement>event.target).files[0];
		const reader = new FileReader();
		reader.readAsDataURL(this.logo);
		reader.onload = _event => {
			this.previewImage = reader.result;
		};
	}

	async createBrand() {
		if (!this.createBrandForm.valid) {
			this.showError = true;
			return;
		}
		this.showError = false;
		try {
			const formData = this.createBrandForm.getRawValue();
			this.creationInProgress = true;
			const processedFileURLs = this.logo ? await Promise.all([this.processFilesForUrls(this.logo)]) : '';
			const brandResult = await this.brandService.createBrand(
				formData.name,
				formData.communicationEmailForCredentials,
				processedFileURLs[0]
			);
			// Managing error state here, will removed once it's fixed the 200 status to 400
			if (brandResult.errors && !brandResult.brandId) {
				const e = brandResult.errors;
				this.creationInProgress = false;
				this.alert.error('Brand creation unsuccessful', e && e[0].message);
				return;
			}
			await this.brandService.getBrands(await this.userService.getUser());
			this.creationInProgress = false;
			this.alert.success(brandResult.message, 'Brand created successfully');
			this.router.navigate(['/cs-admin/brands/' + brandResult.brandId + '/manage-brand-campaigns']);
		} catch (e) {
			this.creationInProgress = false;
			this.alert.error('Brand creation unsuccessful', e && e.errors[0].message);
		}
	}

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
