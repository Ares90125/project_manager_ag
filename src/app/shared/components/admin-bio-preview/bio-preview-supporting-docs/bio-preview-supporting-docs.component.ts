import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-bio-preview-supporting-docs',
	templateUrl: './bio-preview-supporting-docs.component.html',
	styleUrls: ['./bio-preview-supporting-docs.component.scss']
})
export class BioPreviewSupportingDocsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() files;
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

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.fetchFileExtensionTypes();
	}

	fetchFileExtensionTypes() {
		this.files.forEach(file => {
			this.processExtensionType(file.fileExtension);
		});
	}

	triggerFileDownload(index) {
		document.getElementById('downloader-' + index).click();
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

	shrinkName(name: string) {
		if (name) {
			if (name.length < 30) {
				return name;
			} else {
				return name.substring(0, 15) + '...' + name.substring(length - 10, length);
			}
		} else {
			return null;
		}
	}

	redirectToUrl(url) {
		if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
			window.open(`https://${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}

	showDefaultFilePreview(event) {
		event.target.src = 'assets/images/default_meta_image.png';
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
