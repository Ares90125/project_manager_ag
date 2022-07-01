import {Component, Injector, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {environment} from 'src/environments/environment';

@Component({
	selector: 'app-bio-pitch-video',
	templateUrl: './bio-pitch-video.component.html',
	styleUrls: ['./bio-pitch-video.component.scss']
})
export class BioPitchVideoComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;

	uploadSection = false;
	uploading = false;
	isCancelButtonClicked = false;
	initialState = true;
	video;
	previewImage;
	fileSizeError = false;
	typeError = false;
	fanVideoUrl: string;
	private unlistener: () => void;

	constructor(injector: Injector, private adminBioService: AdminBioService, private readonly renderer2: Renderer2) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.fanVideoUrl = `${environment.fanVideoRecorderUrl}?customId=${this.adminBio.userId}&design=convosight#src=iframe`;
		this.unlistener = this.renderer2.listen('window', 'message', event => this.handlePitchVideoUpload(event));
	}

	handlePitchVideoUpload(event) {
		switch (event.data.eventName) {
			case 'UPLOAD_COMPLETE':
				if (event.data.status === 'SUCCESS') {
					this.savedPitchVideoUrlToDatabase(event.data.assetUrl);
				}
				break;
			case 'CLOSE':
				this.logger.debug('Fanvideo Cross clicked', {}, 'BioPitchVideoComponent', 'handlePitchVideoUpload');
				this.initialState = true;
				break;
			case 'DELETE':
				this.logger.debug('Fanvideo removed', {}, 'BioPitchVideoComponent', 'handlePitchVideoUpload');
				this.removePitchVideo();
				break;
		}
	}

	savedPitchVideoUrlToDatabase(url) {
		this.logger.debug('Fanvideo save successfully', {}, 'BioPitchVideoComponent', 'savedPitchVideoUrlToDatabase');
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.pitchVideo, {
			url: url
		});
		this.adminBioService.updatePublishButtonStatus(true);
	}

	closeVideo(type) {
		let vid = <HTMLVideoElement>document.getElementById(type);
		vid.pause();
	}

	removePitchVideo() {
		this.initialState = true;
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.pitchVideo, {
			url: '',
			title: '',
			size: 0,
			type: ''
		});
		this.adminBioService.updatePublishButtonStatus(true);
	}

	cancelUpload() {
		this.uploadSection = true;
		this.uploading = false;
		this.isCancelButtonClicked = true;
		this.video = null;
		this.adminBio['pitchVideo'] = null;
		this.previewImage = null;
	}

	closeErrorOverlay(event) {
		this.enableScrolling();
		event === 'fileSizeError' ? (this.fileSizeError = false) : (this.typeError = false);
	}

	ngOnDestroy() {
		this.unlistener();
		super._ngOnDestroy();
	}
}
