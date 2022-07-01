import {AfterViewInit, Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {FileService} from '@sharedModule/services/file.service';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BackendService} from '@sharedModule/services/backend.service';
import * as _ from 'lodash';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
	selector: 'app-group-profile-files',
	templateUrl: './group-profile-files.component.html',
	styleUrls: ['./group-profile-files.component.scss']
})
export class GroupProfileFilesComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Output() saveFilesSection = new EventEmitter();
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	isSaveInProgress: boolean = false;
	filesDetails: {
		fileToBeUploaded?;
		fileName;
		fileURL?;
		fileUUID?;
		fileSize?;
		fileType?;
		fileThumbnailURL?;
		updateToFileName?;
		isFileNameChanged?;
	}[] = [];
	initialValue;
	initialVisibilityValue;
	welcomeTitle: string = 'Upload custom files';
	welcomeContent: string = 'You can upload files that supports your value proposition here:';
	viewToolTip: boolean = false;
	isFilesRemoved = false;
	openUploadDialog: boolean = false;
	defaultIconCheck = [];
	type1 = ['psd', 'ai', 'cdr', 'tiff', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps', 'raw'];
	type2 = ['flv', '3gp', 'mpg', 'mpeg', 'mpeg', 'mpe', 'mpv', 'mp4', 'wmv', 'mov', 'qt', 'avi', 'flv', 'mkv', 'webm'];
	type3 = ['csv', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlsx', 'xlt', 'xltm', 'xltx', 'xlw', 'ods', 'ots'];
	type4 = ['pdf'];
	type5 = ['ppt', 'pptx', 'odp', 'otp'];
	type6 = ['zip', 'rar', 'zipx', '7z', 'apk', 'dmg', 'iso'];
	type7 = ['mp3', 'aac', 'wav', 'flac', 'ogg', 'wma'];
	type8 = ['docx', 'odt', 'ott', 'odm', 'doc', 'docm'];
	incomingFile: any;
	ref: string = 'group-profile';
	openFilesModal: boolean = false;
	isExpanded: boolean = false;
	showNoFilledBorder: boolean = false;

	constructor(
		injector: Injector,
		readonly fileService: FileService,
		public readonly groupProfilePageService: GroupProfilePagesService,
		public readonly backendService: BackendService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.initialize();
		this.setDefaultIconcheck();
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => setTimeout(() => this.initialize(), 500));
		this.groupProfilePageService.profilePageOnboardingTracker
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => (this.viewToolTip = value === 4));
	}

	setDefaultIconcheck() {
		this.filesDetails.forEach(file => this.iconChecker(file.fileType));
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

	iconChecker(extension) {
		if (!extension) {
			this.defaultIconCheck.push(true);
			return;
		}
		if (this.type1.includes(extension)) {
			this.defaultIconCheck.push(false);
		} else if (this.type2.includes(extension)) {
			this.defaultIconCheck.push(false);
		} else if (this.type3.includes(extension)) {
			this.defaultIconCheck.push(true);
		} else if (this.type4.includes(extension)) {
			this.defaultIconCheck.push(true);
		} else if (this.type5.includes(extension)) {
			this.defaultIconCheck.push(true);
		} else if (this.type6.includes(extension)) {
			this.defaultIconCheck.push(true);
		} else if (this.type7.includes(extension)) {
			this.defaultIconCheck.push(true);
		} else if (this.type8.includes(extension)) {
			this.defaultIconCheck.push(true);
		} else {
			this.defaultIconCheck.push(true);
		}
	}

	initialize() {
		this.isSaveInProgress = false;
		this.filesDetails = this.groupProfilePage.filesDetails
			? this.groupProfilePage.filesDetails.map(file => {
					if (file.fileType) {
						file.fileType = file.fileType;
					} else {
						if (!file.fileThumbnailURL) {
							this.getFileType(file.fileName).toLocaleLowerCase();
						} else {
							file.fileType = null;
						}
					}
					file.isFileNameChanged = false;
					if (!file.fileThumbnailURL) {
						file.updateToFileName = file.fileName.split('.').shift();
					} else {
						file.updateToFileName = '';
					}
					return file;
			  })
			: [];
		this.filesDetails = _.cloneDeep(this.filesDetails);
		this.initialValue = _.cloneDeep(this.filesDetails);
		this.initialVisibilityValue = _.cloneDeep(this.groupProfilePage.showFiles);
	}

	updateFiles(closeButtonForEditFiles?) {
		this.isSaveInProgress = true;
		this.groupProfilePage.isFilesSectionChanged = true;
		this.groupProfilePage.showFiles = this.filesDetails?.length > 0 ? this.groupProfilePage.showFiles : false;
		this.groupProfilePage.filesDetails = _.cloneDeep(this.filesDetails);
		this.saveFilesSection.emit({closeButtonForPopup: closeButtonForEditFiles});
	}

	reset() {
		this.initialValue = _.cloneDeep(this.groupProfilePage.filesDetails);
		this.openFilesModal = false;
		this.initialValue = _.cloneDeep(this.filesDetails);
		this.initialVisibilityValue = _.cloneDeep(this.groupProfilePage.showFiles);
	}

	removeFile(index: number) {
		this.defaultIconCheck.splice(index, 1);
		this.filesDetails.splice(index, 1);
		this.isFilesRemoved = true;
		this.updateFiles();
	}

	getFileType(fileName: string): string {
		const tokens = fileName.split('.');
		return tokens[tokens.length - 1].toUpperCase();
	}

	getFileName(name: string, type: string, fileThumbnailURL) {
		if (!fileThumbnailURL) {
			if (name.length < 50) {
				return name.includes(type.toLocaleLowerCase()) ? name.split('.').shift() : name;
			}
			const length = name.length;
			const fileNameToBeDisplayed = name.substring(0, 25) + '...' + name.substring(length - 10, length);
			return fileNameToBeDisplayed.includes(type.toLocaleLowerCase())
				? fileNameToBeDisplayed.split('.').shift()
				: fileNameToBeDisplayed;
		} else {
			if (name.length < 50) {
				return name;
			}
			const length = name.length;
			return name.substring(0, 25) + '...' + name.substring(length - 10, length);
		}
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

	hasError(value: string, changed: boolean) {
		return changed ? value.trim() === '' : false;
	}

	redirectToUrl(url) {
		if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
			window.open(`https://${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}

	openUploadDialogWithFile(index) {
		this.incomingFile = {};
		this.incomingFile.fileDetails = this.filesDetails[index];
		this.incomingFile.identity = index;
		this.openUploadDialog = true;
	}

	async downloadFile(fileDetails) {
		fileDetails.isFileBeingDownloaded = true;
		const response = await this.backendService.httpGetBlob(fileDetails.fileURL);
		if (response) {
			await this.fileService.downloadBlob(response, fileDetails.fileName);
			fileDetails.isFileBeingDownloaded = false;
		} else {
			this.alert.error('Something went wrong', 'Please try again');
		}
	}

	calculatedSize(size) {
		let check = size.toString();
		return check.includes('KB') || check.includes('MB');
	}

	processTheFile(event: any) {
		this.openUploadDialog = false;
		this.iconChecker(event.fileType);
		this.groupProfilePage.showFiles = true;
		this.filesDetails.push(event);
		this.updateFiles();
	}

	updateTheFileName(event: any) {
		this.openUploadDialog = false;
		this.incomingFile = null;
		this.filesDetails.forEach((doc, index) => {
			if (index === event.identity) {
				doc.updateToFileName = event.nameChange;
				doc.isFileNameChanged = true;
			}
		});

		this.updateFiles();
	}

	showDefaultFilePreview(event) {
		event.target.src = 'assets/images/default_meta_image.png';
	}

	noOfFiles(){
		return this.filesDetails ? this.filesDetails.length : 0;
	}
	
	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			if(!this.groupProfilePage.filesDetails || this.groupProfilePage.filesDetails?.length === 0 || this.groupProfilePageService.checkIfAllSectionNeedToBeExpanded(this.groupProfilePage)) {
				this.isExpanded = true;
				x.hideToggle = true;
				x.expanded = true;
			}

			if(!this.groupProfilePage.filesDetails || this.groupProfilePage.filesDetails?.length === 0) {
				this.showNoFilledBorder = true;
			}
			x.expandedChange.subscribe(data => {
				if(data){
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			})
		});
	}
}
