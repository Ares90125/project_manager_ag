import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';

@Component({
	selector: 'app-bio-media-coverage',
	templateUrl: './bio-media-coverage.component.html',
	styleUrls: ['./bio-media-coverage.component.scss']
})
export class BioMediaCoverageComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;

	mediaCoverageList: any[] = [];
	articleForm: FormGroup;
	showError = false;
	metaPreview = false;
	metaPreviewData: any;
	showMetaLoader = false;
	showArticleForm = false;
	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly appSync: AmplifyAppSyncService,
		private adminBioService: AdminBioService
	) {
		super(injector);
	}

	buildForm() {
		this.articleForm = this.formBuilder.group({
			article: ['', [Validators.required, Validators.pattern(/[ A-Za-z0-9_@./#&+-?=]+\.[ A-Za-z0-9_@./#&+-?=]+$/)]]
		});
	}

	async processMetaInfo(event) {
		let data = (event.target as HTMLInputElement).value.trim();
		this.showError = false;
		this.metaPreview = false;
		this.showMetaLoader = true;
		if (this.articleForm.get('article').errors) {
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
				return;
			}
			this.metaPreviewData = await this.formatForMetaInformation(metaData.body);
			if (!this.metaPreviewData.url) {
				this.metaPreviewData.url = data;
			}
			this.metaPreview = true;
			this.showError = false;
			this.showMetaLoader = false;
		} catch (error) {
			this.metaPreviewData = await this.formatForMetaInformation(data, true);
			this.showError = false;
			this.metaPreview = true;
			this.showMetaLoader = false;
		}
	}

	redirectToUrl(e, url) {
		e.preventDefault();
		if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
			window.open(`https://${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}

	showMediaCoveragePopup() {
		this.disableScrolling();
		this.showArticleForm = true;
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

	ngOnInit() {
		super._ngOnInit();
		this.buildForm();
		if (this.adminBio?.mediaCoverages && this.adminBio?.mediaCoverages.length > 0) {
			this.mediaCoverageList = this.adminBio.mediaCoverages;
		}
	}

	async addMediaCoverage() {
		// Save the article in
		this.mediaCoverageList.push(this.metaPreviewData);
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.MediaCoverages, this.mediaCoverageList);
		this.adminBioService.updatePublishButtonStatus(true);
		this.closeMediaCoveragePopup();
	}

	closeMediaCoveragePopup() {
		this.articleForm.reset();
		this.enableScrolling();
		this.metaPreview = false;
		this.showError = false;
		this.showArticleForm = false;
		this.metaPreviewData = {};
		this.showMetaLoader = false;
	}

	removeMediaCoverage(index) {
		this.mediaCoverageList.splice(index, 1);
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.MediaCoverages, this.mediaCoverageList);
		this.adminBioService.updatePublishButtonStatus(true);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
