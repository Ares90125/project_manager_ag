import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../base.component';
import {FileSizeEnum} from '@sharedModule/enums/file-size.enum';
import {FileService} from '@sharedModule/services/file.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';

@Component({
	selector: 'app-shared-modal',
	templateUrl: './shared-modal.component.html',
	styleUrls: ['./shared-modal.component.scss']
})
export class SharedModalComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closePopup = new EventEmitter<boolean>();
	@Output() fileObject = new EventEmitter<any>();
	@Output() updateToFileObject = new EventEmitter<any>();
	@Input() incomingFile = null;
	@Input() ref = '';

	filesDetails: any = {
		fileToBeUploaded: null,
		fileName: '',
		updateToFileName: '',
		fileSize: 0,
		fileType: null,
		fileURL: null,
		isFileNameChanged: false,
		fileThumbnailURL: '',
		fileUUID: null
	};
	isFileLimitExceeded = false;
	type1 = ['psd', 'ai', 'cdr', 'tiff', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps', 'raw'];
	type2 = ['flv', '3gp', 'mpg', 'mpeg', 'mpeg', 'mpe', 'mpv', 'mp4', 'wmv', 'mov', 'qt', 'avi', 'flv', 'mkv', 'webm'];
	type3 = ['csv', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlsx', 'xlt', 'xltm', 'xltx', 'xlw', 'ods', 'ots'];
	type4 = ['pdf'];
	type5 = ['ppt', 'pptx', 'odp', 'otp'];
	type6 = ['zip', 'rar', 'zipx', '7z', 'apk', 'dmg', 'iso'];
	type7 = ['mp3', 'aac', 'wav', 'flac', 'ogg', 'wma'];
	type8 = ['docx', 'odt', 'ott', 'odm', 'doc', 'docm'];
	defaultIconCheck: boolean = false;
	isFileUploading: boolean = false;
	isFileUploaded: boolean = false;
	isLinkUploading: boolean = false;
	isLinkUploaded: boolean = false;
	initialFileName: string = '';
	URLForm: FormGroup;
	showError = false;
	metaPreview = false;
	metaPreviewData: any;
	showMetaLoader = false;

	constructor(
		injector: Injector,
		private readonly fileService: FileService,
		private readonly formBuilder: FormBuilder,
		private readonly appSync: AmplifyAppSyncService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.buildForm();
		if (this.incomingFile) {
			if (this.ref === 'group-profile') {
				this.filesDetails.fileSize = this.incomingFile.fileDetails['fileSize'];
				this.filesDetails.fileType = this.incomingFile.fileDetails['fileType'];
				this.filesDetails.fileURL = this.incomingFile.fileDetails['fileURL'];
				this.filesDetails.updateToFileName = this.incomingFile.fileDetails['updateToFileName'];
				this.initialFileName = this.incomingFile.fileDetails['updateToFileName'];
			} else if (this.ref === 'admin-bio') {
				this.filesDetails.fileSize = this.incomingFile.fileDetails['size'];
				this.filesDetails.fileType = this.incomingFile.fileDetails['fileExtension'];
				this.filesDetails.fileURL = this.incomingFile.fileDetails['url'];
				this.filesDetails.updateToFileName = this.incomingFile.fileDetails['title'];
				this.initialFileName = this.incomingFile.fileDetails['title'];
			}
			this.isFileUploaded = true;
			setTimeout(() => {
				document.getElementById('fileTitleInput').focus();
			}, 10);
		}
	}

	buildForm() {
		this.URLForm = this.formBuilder.group({
			URLLink: ['', [Validators.required, Validators.pattern(/[ A-Za-z0-9_@./#&+-?=]+\.[ A-Za-z0-9_@./#&+-?=]+$/)]]
		});
	}

	async fileChange(event: any) {
		if (event.target.files.length < 1) {
			return;
		}
		const file = event.target.files[0];
		if (file.size > FileSizeEnum.THREE_HUNDRED_MB) {
			this.isFileLimitExceeded = true;
			this.disableScrolling();
			return;
		}
		this.isFileUploading = true;
		this.isFileUploaded = false;

		if (file.name.split('.').shift().length > 36) {
			this.initialFileName = file.name.split('.').shift().slice(0, 36);
		} else {
			this.initialFileName = file.name.split('.').shift();
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = _event => {
			file.url = reader.result;
		};
		let fileUUID = this.randomUuid();

		const fileUrl = await this.fileService.uploadToS3(file, file.type.split('/')[0], fileUUID);
		this.filesDetails.fileURL = fileUrl;
		this.filesDetails.fileToBeUploaded = null;
		this.filesDetails.fileName = file.name;
		this.filesDetails.updateToFileName = this.initialFileName;
		this.filesDetails.isFileNameChanged = true;
		this.filesDetails.fileSize = file.size;
		this.filesDetails.fileType = this.getFileType(file.name).toLocaleLowerCase();
		this.filesDetails.fileUUID = fileUUID;
		this.isFileUploading = false;
		this.isFileUploaded = true;
		setTimeout(() => {
			document.getElementById('fileTitleInput').focus();
		}, 10);
	}

	async processMetaInfo(event) {
		let data = (event.target as HTMLInputElement).value.trim();
		this.showError = false;
		this.metaPreview = false;
		this.showMetaLoader = true;
		if (this.URLForm.get('URLLink').errors) {
			this.showError = true;
			this.metaPreview = false;
			this.showMetaLoader = false;
			return;
		}
		// call facebook api to get the meta info and try to limit the call -- for build
		if (data.toLowerCase().indexOf('http://') === 0) {
			data = 'http'.concat(data.slice(4));
		} else if (data.toLowerCase().indexOf('https://') === 0) {
			data = 'https'.concat(data.slice(5));
		}
		try {
			const metaData = await this.appSync.getLinkPreview(data);
			if (metaData && (metaData.error || !metaData.body)) {
				this.metaPreviewData = await this.formatForMetaInformation(data, true);
				this.showError = false;
				this.metaPreview = true;
				this.showMetaLoader = false;
				this.isLinkUploading = false;
				this.isLinkUploaded = true;
				return;
			}
			this.metaPreviewData = await this.formatForMetaInformation(metaData.body);
			if (!this.metaPreviewData.url) {
				this.metaPreviewData.url = data;
			}
			this.metaPreview = true;
			this.showError = false;
			this.showMetaLoader = false;
			this.isLinkUploading = false;
			this.isLinkUploaded = true;
		} catch (error) {
			this.metaPreviewData = await this.formatForMetaInformation(data, true);
			this.showError = false;
			this.metaPreview = true;
			this.showMetaLoader = false;
			this.isLinkUploading = false;
			this.isLinkUploaded = true;
		}
	}

	async formatForMetaInformation(metaInfo, onlyUrl = false) {
		// check if meta info doesn't have image
		if (onlyUrl) {
			return {
				title: metaInfo.title,
				description: metaInfo.description,
				imageUrl: metaInfo.image,
				url: metaInfo
			};
		}
		let metaInfoJsonObj = metaInfo;
		if (typeof metaInfo == 'string') {
			metaInfoJsonObj = JSON.parse(metaInfo);
		}
		return {
			title: metaInfoJsonObj.title,
			description: metaInfoJsonObj.description,
			imageUrl: metaInfoJsonObj.image,
			url: metaInfoJsonObj.url
		};
	}

	enableURLLink() {
		this.isLinkUploading = true;
		this.isLinkUploaded = false;
		setTimeout(() => {
			document.getElementById('URLTitleInput').focus();
		}, 10);
	}

	updateTitle() {
		let updatedValue = (<HTMLInputElement>document.getElementById('fileTitleInput')).value;
		this.filesDetails.updateToFileName = updatedValue;
	}

	setToDefault() {
		let input = <HTMLInputElement>document.getElementById('fileTitleInput');
		if (input.value.trim() === '') {
			if (this.incomingFile) {
				if (this.ref === 'group-profile') {
					input.value = this.incomingFile.fileDetails['updateToFileName'];
				} else if (this.ref === 'admin-bio') {
					input.value = this.incomingFile.fileDetails['title'];
				}
				this.filesDetails.updateToFileName = input.value;
			} else {
				if (this.filesDetails.fileName.split('.').shift().length > 36) {
					input.value = this.filesDetails.fileName.split('.').shift().slice(0, 36);
				} else {
					input.value = this.filesDetails.fileName.split('.').shift();
				}
				this.filesDetails.updateToFileName = input.value;
			}
		}
	}

	closeErrorOverlay(event) {
		this.enableScrolling();
		this.isFileLimitExceeded = false;
	}

	getFileCategory(extension) {
		if (this.type1.includes(extension)) {
			return 'type1';
		} else if (this.type2.includes(extension)) {
			return 'type2';
		} else if (this.type3.includes(extension)) {
			return 'type3';
		} else if (this.type4.includes(extension)) {
			return 'type4';
		} else if (this.type5.includes(extension)) {
			return 'type5';
		} else if (this.type6.includes(extension)) {
			return 'type6';
		} else if (this.type7.includes(extension)) {
			return 'type7';
		} else if (this.type8.includes(extension)) {
			return 'type8';
		} else {
			return 'type9';
		}
	}

	closeFileUploadPopup() {
		this.enableScrolling();
		this.closePopup.emit(false);
	}

	navigate() {
		if (this.incomingFile) {
			this.closeFileUploadPopup();
		} else {
			if (this.isFileUploading || this.isFileUploaded || this.isLinkUploading || this.isLinkUploaded) {
				this.isFileUploading = false;
				this.isFileUploaded = false;
				this.isLinkUploading = false;
				this.isLinkUploaded = false;
				this.initialize();
			} else {
				this.closeFileUploadPopup();
			}
		}
	}

	initialize() {
		this.filesDetails.fileToBeUploaded = null;
		this.filesDetails.fileName = '';
		this.filesDetails.updateToFileName = '';
		this.filesDetails.fileSize = 0;
		this.filesDetails.fileType = null;
		this.filesDetails.fileURL = null;
		this.filesDetails.isFileNameChanged = false;
		this.filesDetails.fileThumbnailURL = '';
		this.filesDetails.fileUUID = null;
		this.isFileLimitExceeded = false;
		this.defaultIconCheck = false;
		this.initialFileName = '';
		this.showError = false;
		this.metaPreview = false;
		this.metaPreviewData = null;
		this.showMetaLoader = false;
	}

	redirectToUrl(e, url) {
		e.preventDefault();
		if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
			window.open(`https://${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}

	processTheFile() {
		if (this.isFileUploaded) {
			if (this.incomingFile) {
				this.updateToFileObject.emit({
					nameChange: this.filesDetails.updateToFileName,
					identity: this.incomingFile.identity
				});
			} else {
				this.fileObject.emit(this.filesDetails);
			}
		} else if (this.isLinkUploaded) {
			if (this.metaPreviewData.title) {
				this.filesDetails.fileName = this.metaPreviewData.title;
			} else {
				this.filesDetails.fileName = '';
			}
			if (this.metaPreviewData.imageUrl) {
				this.filesDetails.fileThumbnailURL = this.metaPreviewData.imageUrl;
			} else {
				this.filesDetails.fileThumbnailURL = 'no-image';
			}
			this.filesDetails.fileURL = this.metaPreviewData.url;
			this.filesDetails.isFileNameChanged = false;
			this.filesDetails.updateToFileName = '';
			this.fileObject.emit(this.filesDetails);
		}
	}

	calculateSize(totalBytes) {
		return totalBytes < 1000000 ? Math.floor(totalBytes / 1000) + ' KB' : Math.floor(totalBytes / 1000000) + ' MB';
	}

	getFileType(fileName: string): string {
		const tokens = fileName.split('.');
		return tokens[tokens.length - 1].toUpperCase();
	}

	showDefaultFilePreview(event) {
		event.target.src = 'assets/images/default_meta_image.png';
	}
}
