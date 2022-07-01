import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	Renderer2,
	ViewChild
} from '@angular/core';
import {Lightbox, LightboxConfig} from 'ngx-lightbox';
import {BaseComponent} from '../base.component';
import {FileService} from '@sharedModule/services/file.service';
import {OnPropertyChange} from '@sharedModule/decorator/property-changes.decorator';
import {UtilityService} from '@sharedModule/services/utility.service';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, skipWhile} from 'rxjs/operators';

@Component({
	selector: 'app-custom-post-text-area',
	templateUrl: './custom-post-text-area.component.html',
	styleUrls: ['./custom-post-text-area.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomPostTextAreaComponent extends BaseComponent implements OnInit, OnDestroy {
	@ViewChild('file') fileUpl: ElementRef;
	@ViewChild('emojis', {read: ElementRef}) emojis: ElementRef;
	@ViewChild('emojiToggle', {read: ElementRef}) emojiToggle: ElementRef;
	@Input() previewImage: Array<any> = [];
	@Input() imageFiles: Array<File> = [];
	@Input() videoFiles: Array<File> = [];
	@Input() postMessage = '';
	@Input() showSpinner = false;
	@Input() isTypeRepost;
	@Input() postToBeReShared;
	@Input() @OnPropertyChange('onPostedValueChange') isPublished;
	@Output() postMessageChange = new EventEmitter<any>();
	@Output() postUpdate = new EventEmitter<any>();
	showGallery: boolean;
	alertMessage = {heading: '', content: ''};
	showAlert: boolean;
	hideEmojis: boolean = true;
	compressionInProgress = false;
	compressionStatus;
	postMessageValueChange: Subject<string> = new Subject();

	constructor(
		private injector: Injector,
		private _lightboxConfig: LightboxConfig,
		private readonly lightbox: Lightbox,
		private renderer: Renderer2,
		private utilityService: UtilityService,
		readonly fileService: FileService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.renderer.listen('window', 'click', (e: Event) => {
			if (!this.emojiToggle?.nativeElement.contains(e.target) && !this.emojis?.nativeElement.contains(e.target)) {
				this.hideEmojis = true;
			}
		});
		this.subscribeToPostTextChanges();
		this.eventOnPostUpdate();
	}

	onPostedValueChange(isPublished: string) {
		this.isPublished = isPublished;
	}

	resetFileUpload() {
		this.fileUpl.nativeElement.files = null;
		this.fileUpl.nativeElement.value = '';
		this.eventOnPostUpdate();
		this.logger.debug('Resetting file upload data', {}, 'CustomPostTextAreaComponent', 'fileUpload');
	}

	async fileUpload(event: Event) {
		const file = (<HTMLInputElement>event.target).files[0];
		if (!file) {
			return;
		}

		this.logger.debug('File selected', {file}, 'CustomPostTextAreaComponent', 'fileUpload');
		const mimeType = file.type;
		const size = file.size;
		const isNotAllowedMediaType = mimeType.match(/image\/*/) === null && mimeType.match(/video\/*/) === null;
		const isAllowedImageType = mimeType.split('/')[0] === 'image' && mimeType !== 'image/gif';
		const isVideoType = mimeType.split('/')[0] === 'video';
		const isCombinationOfImageAndVideo =
			(isAllowedImageType && this.videoFiles.length > 0) || (this.imageFiles.length > 0 && isVideoType);
		const isVideoAlreadyAdded = this.videoFiles.length > 0;

		if (
			isNotAllowedMediaType ||
			(!isNotAllowedMediaType && isCombinationOfImageAndVideo) ||
			(!isNotAllowedMediaType && isVideoType && isVideoAlreadyAdded)
		) {
			let msg;
			let alert = {content: null, heading: null};
			switch (true) {
				case isNotAllowedMediaType:
					msg = 'File type not matches with image or else with video';
					alert.heading = 'Incorrect file format';
					alert.content = 'Only files with the following extention are allowed: gif, png, jpg, jpeg, mp4, avi, mov';
					break;
				case isCombinationOfImageAndVideo:
					msg = 'Videos and images cannot exist together in the same post.';
					alert.heading = 'Can not upload ' + (isAllowedImageType ? 'Image' : 'Video');
					alert.content = 'Videos and images cannot exist together in the same post.';
					break;
				case isVideoAlreadyAdded:
					alert.content = 'Remove existing video to upload a new one.';
					alert.heading = 'Only one video is allowed per post';
					msg = 'Only one video is allowed per post.';
					break;
			}
			this.logger.debug(msg, {fileType: file.type}, 'CustomPostTextAreaComponent', 'fileUpload');
			this.showAlert = true;
			this.alertMessage = alert;
			this.resetFileUpload();
			return;
		}

		if (mimeType.split('/')[0] === 'image' && mimeType !== 'image/gif') {
			if (size <= 4000000) {
				this.imageFiles.push(file);
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = _event => {
					this.previewImage.push({src: reader.result, type: 'image'});
					this.logger.debug('Adding original file to preview Image', {}, 'CustomPostTextAreaComponent', 'fileUpload');
					this.eventOnPostUpdate();
				};
			} else {
				this.compressionInProgress = true;
				this.compressionStatus = 'inProgress';
				await this.fileService.uploadToS3ToCompress(file, this.randomUuid());
				const img = await this.fileService.getImage(this.fileService.compressedUrl);
				if (img) {
					this.compressionStatus = 'success';
					this.logger.debug('Adding compressed file to preview Image', {}, 'CustomPostTextAreaComponent', 'fileUpload');
				} else {
					this.compressionStatus = 'failed';
					this.resetFileUpload();
					return;
				}
				this.eventOnPostUpdate();
			}
		} else {
			if (size > 204800000) {
				this.logger.debug(
					'That file is too large to be uploaded. The limit is 200 MB for video.',
					{file},
					'CustomPostTextAreaComponent',
					'fileUpload'
				);
				this.showAlert = true;
				this.alertMessage = {
					heading: 'Video size too large',
					content: 'That file is too large to be uploaded. The limit is 200 MB for video.'
				};
				return;
			}
			this.videoFiles.push(file);
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = _event => {
				this.logger.debug('Adding file to preview Image', {file: file}, 'CustomPostTextAreaComponent', 'fileUpload');
				this.previewImage.push({src: reader.result, type: 'video'});
				this.eventOnPostUpdate();
			};
		}
	}

	pushImageToPreview() {
		this.imageFiles.push(this.fileService.compressedUrl);
		this.previewImage.push({src: this.fileService.compressedUrl, type: 'image'});
		this.eventOnPostUpdate();
	}

	focusFunction(event) {
		event.target.parentElement.classList.add('active');
	}

	focusOutFunction(event) {
		event.target.parentElement.classList.remove('active');
	}

	private subscribeToPostTextChanges() {
		const debouncedPostMessageValueChange = this.postMessageValueChange.pipe(debounceTime(500), distinctUntilChanged());
		this.subscriptionsToDestroy.concat([
			debouncedPostMessageValueChange.subscribe(() => this.eventOnPostUpdate()),
			debouncedPostMessageValueChange
				.pipe(skipWhile(postText => postText.length < 63206))
				.subscribe(() => this.processMaxLengthOnPostMessage())
		]);
	}

	processMaxLengthOnPostMessage() {
		this.postMessage = this.postMessage.slice(0, 63206);
		this.logger.debug('Character count limit', {}, 'CustomPostTextAreaComponent', 'processMaxLengthForPostMessage');
		this.showAlert = true;
		this.alertMessage = {
			heading: 'Character count limit',
			content: 'The maximum length of post can not exceed 63206 characters. Please keep your post within the limit.'
		};
	}

	eventOnPostUpdate() {
		// checking if post contains empty string then remove the whitespace and newline else do nothing
		this.postMessage = this.postMessage?.trim().length === 0 ? this.postMessage?.trim() : this.postMessage;
		this.postMessageChange.emit(this.postMessage);
		this.postUpdate.emit({
			postMessage: this.postMessage,
			previewImage: this.previewImage,
			imageFiles: this.imageFiles,
			videoFiles: this.videoFiles,
			isPostEdited: true
		});
	}

	openImageGallery(index: number): void {
		this.lightbox.open(this.previewImage, index, {
			centerVertically: true,
			enableTransition: false,
			resizeDuration: '0'
		});
	}

	close(): void {
		this.lightbox.close();
	}

	openVideoGallery(index: number) {
		if (this.previewImage[index]?.src.indexOf('image/gif') > -1) {
			this.openImageGallery(index);
			return;
		}
		this.showGallery = true;
	}

	closeVideoGallery() {
		this.showGallery = false;
	}

	removePreview(i, type) {
		this.previewImage.splice(i, 1);
		if (type === 'image') {
			this.imageFiles.splice(i, 1);
		} else {
			this.videoFiles.splice(i, 1);
		}
		this.eventOnPostUpdate();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	emojiSelect(event) {
		this.postMessage = this.postMessage + event.emoji.native;
		this.postMessageValueChange.next(this.postMessage);
	}

	autofocusTextArea() {
		const event = document.getElementById('postMessage');
		event.parentElement.classList.add('active');
		setTimeout(function () {
			event.blur();
			event.focus();
		}, 100);
	}
}
