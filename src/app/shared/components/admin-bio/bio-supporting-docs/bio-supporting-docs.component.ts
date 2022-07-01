import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {FileService} from '@sharedModule/services/file.service';

@Component({
	selector: 'app-bio-supporting-docs',
	templateUrl: './bio-supporting-docs.component.html',
	styleUrls: ['./bio-supporting-docs.component.scss']
})
export class BioSupportingDocsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;

	supportingDocs = [];
	showError = false;
	fileExtensionTypes = [];
	type1 = ['psd', 'ai', 'cdr', 'tiff', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps', 'raw'];
	type2 = ['flv', '3gp', 'mpg', 'mpeg', 'mpeg', 'mpe', 'mpv', 'mp4', 'wmv', 'mov', 'qt', 'avi', 'flv', 'mkv', 'webm'];
	type3 = ['csv', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlsx', 'xlt', 'xltm', 'xltx', 'xlw', 'ods', 'ots'];
	type4 = ['pdf'];
	type5 = ['ppt', 'pptx', 'odp', 'otp'];
	type6 = ['zip', 'rar', 'zipx', '7z', 'apk', 'dmg', 'iso'];
	type7 = ['mp3', 'aac', 'wav', 'flac', 'ogg', 'wma'];
	type8 = ['docx', 'odt', 'ott', 'odm', 'doc', 'docm'];
	defaultIconCheck = [];
	openUploadDialog: boolean = false;
	incomingFile: any;
	ref: string = 'admin-bio';

	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly adminBioService: AdminBioService,
		private readonly fileService: FileService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		if (this.adminBio?.files && this.adminBio?.files.length > 0) {
			this.supportingDocs = this.adminBio.files;
			this.fetchFileExtensionTypes();
		}
	}

	fetchFileExtensionTypes() {
		this.adminBio.files.forEach(file => {
			this.processExtensionType(file.fileExtension);
		});
	}

	processExtensionType(extension) {
		if (!extension) {
			this.fileExtensionTypes.push('type9');
			this.defaultIconCheck.push(true);
		} else {
			if (this.type1.includes(extension)) {
				this.fileExtensionTypes.push('type1');
				this.defaultIconCheck.push(false);
			} else if (this.type2.includes(extension)) {
				this.fileExtensionTypes.push('type2');
				this.defaultIconCheck.push(false);
			} else if (this.type3.includes(extension)) {
				this.fileExtensionTypes.push('type3');
				this.defaultIconCheck.push(true);
			} else if (this.type4.includes(extension)) {
				this.fileExtensionTypes.push('type4');
				this.defaultIconCheck.push(true);
			} else if (this.type5.includes(extension)) {
				this.fileExtensionTypes.push('type5');
				this.defaultIconCheck.push(true);
			} else if (this.type6.includes(extension)) {
				this.fileExtensionTypes.push('type6');
				this.defaultIconCheck.push(true);
			} else if (this.type7.includes(extension)) {
				this.fileExtensionTypes.push('type7');
				this.defaultIconCheck.push(true);
			} else if (this.type8.includes(extension)) {
				this.fileExtensionTypes.push('type8');
				this.defaultIconCheck.push(true);
			} else {
				this.fileExtensionTypes.push('type9');
				this.defaultIconCheck.push(true);
			}
		}
	}

	redirectToUrl(url) {
		if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
			window.open(`https://${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}

	async fileUpload(file) {
		if (file.fileName) {
			this.processExtensionType(file.fileName.split('.').pop());
		} else {
			this.defaultIconCheck.push(true);
			this.fileExtensionTypes.push('type9');
		}
		this.adminBioService.updatePublishButtonStatus(true);
		let extension = null;
		if (!file.fileThumbnailURL) {
			extension = file.fileName.split('.').pop();
		}
		this.supportingDocs.push({
			url: file.fileURL,
			title: file.updateToFileName,
			size: file.fileSize,
			type: file.fileType,
			fileExtension: extension,
			fileTitle: file.fileName,
			fileThumbnailURL: file.fileThumbnailURL
		});
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.Files, this.supportingDocs);
	}

	shrinkName(name: string) {
		if (name) {
			if (name.length < 50) {
				return name;
			} else {
				return name.substring(0, 25) + '...' + name.substring(length - 10, length);
			}
		} else {
			return null;
		}
	}

	openUploadDialogWithFile(index) {
		this.incomingFile = {};
		this.incomingFile.fileDetails = this.supportingDocs[index];
		this.incomingFile.identity = index;
		this.openUploadDialog = true;
	}

	removeFile(index) {
		this.supportingDocs.splice(index, 1);
		this.fileExtensionTypes.splice(index, 1);
		this.defaultIconCheck.splice(index, 1);
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.Files, this.supportingDocs);
		this.adminBioService.updatePublishButtonStatus(true);
	}

	processTheFile(event: any) {
		this.openUploadDialog = false;
		this.fileUpload(event);
	}

	updateTheFileName(event: any) {
		this.openUploadDialog = false;
		this.incomingFile = null;
		this.supportingDocs.forEach((doc, index) => {
			if (index === event.identity) {
				doc.title = event.nameChange;
			}
		});
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.Files, this.supportingDocs);
		this.adminBioService.updatePublishButtonStatus(true);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	showDefaultFilePreview(event) {
		event.target.src = 'assets/images/default_meta_image.png';
	}
}
