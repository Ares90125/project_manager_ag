import {T} from '@angular/cdk/keycodes';
import {ThrowStmt} from '@angular/compiler';
import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {FileSizeEnum} from '@sharedModule/enums/file-size.enum';
import {ProfilePublishStatusEnum} from '@sharedModule/models/graph-ql.model';
import {BackendService} from '@sharedModule/services/backend.service';
import {FileService} from '@sharedModule/services/file.service';
import {UserService} from '@sharedModule/services/user.service';
import {CropperComponent} from 'angular-cropperjs';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-edit-brand-modal',
	templateUrl: './edit-brand-modal.component.html',
	styleUrls: ['./edit-brand-modal.component.scss']
})
export class EditBrandModalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closeModal = new EventEmitter<boolean>();
	@Output() saveMostTalkedAboutBrandsSection = new EventEmitter();

	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isSaveInProgress: boolean = false;
	@Input() initialValue;
	@Input() currentUserId: string;
	@Input() initialVisibilityValue;

	previousNoOfVisibleBrands: number;
	isSearchInProgress: boolean = false;
	createCustomBrand: boolean = false;
	hasDifferentBrands: boolean = false;
	foundedBrands = null;
	selectedBrand = null;
	deletableBrand = null;
	userToken;
	loadedAvatar;
	customBrandNameValue;

	// upload file --- start
	validExtensions = ['jpeg', 'jpg', 'png'];
	uploadFileError = false;
	uploadTypeError = false;
	uploading = false;
	previewImage;
	loadedAvatarUrl = null;
	// upload file --- finish

	// brandstages --- start
	brandListStage: boolean = true;
	addBrandStage: boolean = false;
	customBrandStage: boolean = false;
	cropImageStage: boolean = false;
	// brandstages --- end

	editBrandMode: boolean = false;
	updatingBrand: any = {};

	// Image cropper props
	@ViewChild('angularCropper') public angularCropper: CropperComponent;
	imageFile;
	croppedImageFile;
	cropperConfig = {
		viewMode: 1,
		background: false,
		scalable: true,
		aspectRatio: 1 / 1,
		cropBoxMovable: false,
		cropBoxResizable: false,
		dragMode: 'move',
		zoomOnWheel: true,
		movable: true
	};
	imageUrl: string;
	croppedImage: string;
	scaleValue: number = 1;

	imageChangedEvent: any = '';
	cropImagePreview: any = '';

	constructor(
		private fileService: FileService,
		readonly userService: UserService,
		private groupProfilePageService: GroupProfilePagesService,
		private readonly backendService: BackendService,
		injector: Injector
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.previousNoOfVisibleBrands = this.noOfBrandsEnabled();
		this.userToken = await this.userService.getCurrentSessionJWTToken();
		this.preUpdateBrandsListHandle(this.groupProfilePage.mostTalkedAboutBrands);
		this.angularCropper.cropper.setCanvasData({
			height: 400
		});
	}

	noOfBrandsEnabled(): number {
		return this.groupProfilePage?.mostTalkedAboutBrands?.filter(brand => brand.isSelected).length;
	}

	closeModalHandle(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.closeModal.next(true);
	}

	toAddBrandStage(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.addBrandStage = true;
		this.customBrandStage = false;
		this.brandListStage = false;
		this.editBrandMode = false;
	}

	toBrandListStage(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.brandListStage = true;
		this.customBrandStage = false;
		this.addBrandStage = false;
		this.loadedAvatarUrl = null;
		this.customBrandNameValue = null;
		this.previewImage = null;
		this.selectedBrand = null;
		this.deletableBrand = null;
	}

	toCustomBrand(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.customBrandStage = true;
		this.cropImageStage = false;
		this.addBrandStage = false;
		this.selectedBrand = null;
		this.scaleValue = 1;
	}

	preUpdateBrandsListHandle(newList) {
		if (!newList) {
			return;
		}
		const customBrand = newList.find(item => item.isCustomBrand);
		const defaultBrand = newList.find(item => !item.isCustomBrand);

		this.hasDifferentBrands = !!(customBrand && defaultBrand);
	}

	async searchBrandsHandle(event) {
		const name = (event.target as HTMLInputElement).value.trim();
		if (name.length < 3) {
			this.createCustomBrand = false;
			this.foundedBrands = null;
			return;
		}
		this.isSearchInProgress = true;
		this.customBrandNameValue = name;

		const currentBrands = {};
		this.groupProfilePage.mostTalkedAboutBrands?.forEach(brand => {
			currentBrands[brand.brandName] = brand;
		});

		const response = await this.backendService.restGet(
			`/groupprofile/list-brands?searchTerm=${name}&userId=${this.currentUserId}`,
			this.userToken
		);

		this.foundedBrands = response?.filter(item => !currentBrands[item.name]);

		this.createCustomBrand = !this.foundedBrands?.length;
		this.isSearchInProgress = false;
	}

	scaleImageHandle(element) {
		this.angularCropper.cropper.scale(element?.value);
	}

	increaseImageScale(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		if (this.scaleValue === 2) {
			return;
		}
		this.scaleValue = this.scaleValue + 0.05;
		this.angularCropper.cropper.scale(this.scaleValue);
	}

	decreaseImageScale(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		if (this.scaleValue === 1) {
			return;
		}
		this.scaleValue = this.scaleValue - 0.05;
		this.angularCropper.cropper.scale(this.scaleValue);
	}

	toCropImageModal(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.customBrandStage = false;
		this.cropImageStage = true;
	}

	async createCustomBrandHandle(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		try {
			this.isSaveInProgress = true;
			const newBrandRes = await this.backendService.restPost(
				'/groupprofile/create-users-brands',
				{
					iconUrl: this.loadedAvatarUrl || '',
					name: this.customBrandNameValue
				},
				this.userToken
			);

			if (!this.groupProfilePage.mostTalkedAboutBrands) {
				this.groupProfilePage.mostTalkedAboutBrands = [];
			}

			const response = await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.groupProfilePage.id,
				groupId: this.groupProfilePage.groupId,
				mostTalkedAboutBrands: [
					...this.groupProfilePage.mostTalkedAboutBrands,
					{
						brandImageURL: this.loadedAvatarUrl || '',
						brandName: this.customBrandNameValue,
						isSelected: true,
						isCustomBrand: true,
						customBrandID: newBrandRes?.id || ''
					}
				],
				publishedStatus: ProfilePublishStatusEnum.DRAFT
			});

			this.preUpdateBrandsListHandle(response.mostTalkedAboutBrands);

			this.groupProfilePage.mostTalkedAboutBrands = (
				response as unknown as GroupProfilePageModel
			).mostTalkedAboutBrands;
			this.groupProfilePage.publishedStatus = ProfilePublishStatusEnum.DRAFT;

			this.isSaveInProgress = false;
			this.brandListStage = true;
			this.customBrandStage = false;
		} catch (error) {
		} finally {
			this.previewImage = null;
			this.customBrandNameValue = null;
			this.loadedAvatarUrl = null;
		}
	}

	async addFoundedBrand(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		try {
			this.isSaveInProgress = true;
			if (!this.groupProfilePage.mostTalkedAboutBrands) {
				this.groupProfilePage.mostTalkedAboutBrands = [];
			}
			const response = await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.groupProfilePage.id,
				groupId: this.groupProfilePage.groupId,
				mostTalkedAboutBrands: [
					...this.groupProfilePage.mostTalkedAboutBrands,
					{
						brandImageURL: this.selectedBrand.iconUrl || '',
						brandName: this.selectedBrand.name,
						isSelected: true,
						isCustomBrand: !!this.selectedBrand.isCustomBrand,
						customBrandID: this.selectedBrand.id || ''
					}
				],
				publishedStatus: ProfilePublishStatusEnum.DRAFT
			});
			this.preUpdateBrandsListHandle(response.mostTalkedAboutBrands);

			this.groupProfilePage.mostTalkedAboutBrands = (
				response as unknown as GroupProfilePageModel
			).mostTalkedAboutBrands;
			this.groupProfilePage.publishedStatus = ProfilePublishStatusEnum.DRAFT;

			this.brandListStage = true;
			this.selectedBrand = null;
			this.addBrandStage = false;
		} catch (error) {
		} finally {
			this.isSaveInProgress = false;
		}
	}

	openDeleteBrandModal(element, brand) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.deletableBrand = brand;
		this.brandListStage = false;
	}

	async deleteBrand(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		try {
			this.isSaveInProgress = true;
			const response = await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.groupProfilePage.id,
				groupId: this.groupProfilePage.groupId,
				mostTalkedAboutBrands: this.groupProfilePage.mostTalkedAboutBrands.filter(
					item => item.brandName !== this.deletableBrand.brandName
				),
				publishedStatus: ProfilePublishStatusEnum.DRAFT
			});

			this.preUpdateBrandsListHandle(response.mostTalkedAboutBrands);

			this.groupProfilePage.mostTalkedAboutBrands = (
				response as unknown as GroupProfilePageModel
			).mostTalkedAboutBrands;
			this.groupProfilePage.publishedStatus = ProfilePublishStatusEnum.DRAFT;
		} catch (error) {
		} finally {
			this.brandListStage = true;
			this.deletableBrand = null;
			this.isSaveInProgress = false;
		}
	}

	selectBrandHadle(element, brand) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.selectedBrand = brand;
		this.foundedBrands = null;
		this.customBrandNameValue = '';
	}

	toggleBrandSelection(brandObj) {
		brandObj.isSelected = !brandObj.isSelected;
		if (this.previousNoOfVisibleBrands === 0) {
			this.groupProfilePage.showMostTalkedAboutBrands = true;
		}
		this.previousNoOfVisibleBrands = this.noOfBrandsEnabled();
		this.updateBrands();
	}

	// update brand methods - START
	async toUpdateBrand(element, brand) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		this.updatingBrand = brand;
		this.previewImage = this.updatingBrand.brandImageURL;
		this.customBrandNameValue = this.updatingBrand.brandName;
		this.editBrandMode = true;
		this.customBrandStage = true;

		this.brandListStage = false;
	}

	updateBrands() {
		this.isSaveInProgress = true;
		this.groupProfilePage.mostTalkedAboutBrands = this.groupProfilePage.mostTalkedAboutBrands
			? this.groupProfilePage.mostTalkedAboutBrands
			: [];
		if (this.noOfBrandsEnabled() === 0) {
			this.groupProfilePage.showMostTalkedAboutBrands = false;
		}
		this.groupProfilePage.isMostTalkedAboutBrandsSectionChanged = true;
		this.saveMostTalkedAboutBrandsSection.next();
	}

	async updateCustomBrand(element) {
		this.recordButtonClick(element, null, null, null, this.groupProfilePage);
		try {
			this.isSaveInProgress = true;
			if (!this.groupProfilePage.mostTalkedAboutBrands) {
				this.groupProfilePage.mostTalkedAboutBrands = [];
			}
			await this.backendService.restPost(
				'/groupprofile/update-users-brands',
				{
					iconUrl: this.loadedAvatarUrl || this.updatingBrand.brandImageURL,
					name: this.customBrandNameValue,
					id: this.updatingBrand.customBrandID
				},
				this.userToken
			);
			const response = await this.groupProfilePageService.updateGroupProfileDraft({
				id: this.groupProfilePage.id,
				groupId: this.groupProfilePage.groupId,
				mostTalkedAboutBrands: this.groupProfilePage.mostTalkedAboutBrands.map(item => {
					if (item.customBrandID === this.updatingBrand.customBrandID) {
						return {
							...item,
							brandImageURL: this.loadedAvatarUrl || this.updatingBrand.brandImageURL,
							brandName: this.customBrandNameValue
						};
					}
					return item;
				}),
				publishedStatus: ProfilePublishStatusEnum.DRAFT
			});

			this.groupProfilePage.mostTalkedAboutBrands = (
				response as unknown as GroupProfilePageModel
			).mostTalkedAboutBrands;
			this.groupProfilePage.publishedStatus = ProfilePublishStatusEnum.DRAFT;

			this.brandListStage = true;
			this.customBrandStage = false;
		} catch (error) {
		} finally {
			this.isSaveInProgress = false;
			this.previewImage = null;
			this.customBrandNameValue = null;
			this.updatingBrand = {};
		}
	}

	// update brand methods - FINISH

	// brand image methods - START
	onSelectFile(event) {
		this.recordButtonClick(event, null, null, null, this.groupProfilePage);
		if (event.target.files && event.target.files[0]) {
			this.imageFile = event.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(this.imageFile);
			reader.onload = () => {
				this.imageUrl = reader.result as string;
			};
			this.cropImageStage = true;
			this.customBrandStage = false;
		}
	}

	async saveCroppedImage(event: any) {
		this.recordButtonClick(event, null, null, null, this.groupProfilePage);
		this.uploadFileError = false;
		this.uploadTypeError = false;

		this.customBrandStage = true;
		this.cropImageStage = false;
		this.scaleValue = 1;

		this.angularCropper.cropper.getCroppedCanvas().toBlob(async blob => {
			const extension = this.imageFile.name.split('.').pop().toLocaleLowerCase();

			if (!blob.type.includes('image')) {
				this.uploadTypeError = true;
				return;
			} else {
				if (!this.validExtensions.includes(extension)) {
					this.uploadTypeError = true;
					return;
				}
			}
			if (blob.size > FileSizeEnum.THREE_HUNDRED_MB) {
				this.uploadFileError = true;
				return;
			}
			this.uploading = true;
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onload = _event => {
				this.previewImage = reader.result;
			};
			const uploadedFileLink = await this.fileService.uploadToS3(blob, 'image', this.randomUuid());
			this.loadedAvatarUrl = uploadedFileLink;
			this.updatingBrand.brandImageURL = this.editBrandMode ? uploadedFileLink : null;
			this.uploading = false;
		});
	}

	// brand image methods - END

	isSaveEnabled() {
		return (
			this.groupProfilePage.showMostTalkedAboutBrands !== this.initialVisibilityValue ||
			JSON.stringify(this.initialValue) !== JSON.stringify(this.groupProfilePage.mostTalkedAboutBrands)
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
