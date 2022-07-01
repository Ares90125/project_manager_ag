import {Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FileService} from '@sharedModule/services/file.service';

export interface INewScreenshotAdded {
	fbPermLink?: string;
	s3Key: string;
	groupName: string;
	type?: string;
	sectionName?: string;
	key?: string;
	campaignId: string;
	order?: number;
}

@Component({
	selector: 'app-upload-screenshot',
	templateUrl: './upload-screenshot.component.html',
	styleUrls: ['./upload-screenshot.component.scss']
})
export class UploadScreenshotComponent extends BaseComponent implements OnInit, OnChanges {
	@Output()
	newScreenshotAdded = new EventEmitter<INewScreenshotAdded>(null);

	@Input()
	campaignGroups: any[];

	@Input()
	sectionName: string;

	@Input()
	campaignId: string;

	@Input()
	order: number;

	@Input()
	id: string;

	campaignGroupNames: string[] = [];
	previewImage: string | ArrayBuffer;
	form: FormGroup;
	isUploading = false;
	originalScreenshot: File;

	constructor(
		injector: Injector,
		private fb: FormBuilder,
		private readonly fileService: FileService,
		private readonly campaignService: CreateCampaignService
	) {
		super(injector);
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.campaignGroups) {
			if (change.campaignGroups.currentValue) {
				this.campaignGroupNames = change.campaignGroups.currentValue.map(cg => cg.groupName);
			}
		}
	}

	ngOnInit(): void {
		this.createForm();
	}

	async fileUpload(event: Event) {
		this.originalScreenshot = (<HTMLInputElement>event.target).files[0];
		const reader = new FileReader();
		reader.readAsDataURL(this.originalScreenshot);
		reader.onload = _event => {
			this.previewImage = reader.result;
		};
	}

	createForm() {
		this.form = this.fb.group({
			fbPermLink: [null],
			groupName: [null],
			type: [null, Validators.required]
		});
	}

	selectedNewGroup(event) {}

	reset() {
		this.form.reset();
		this.previewImage = null;
		this.isUploading = false;
	}

	async onSave() {
		if (!this.campaignId) {
			return console.warn('campaign id not found');
		}
		if (!this.previewImage) {
			return;
		}
		this.isUploading = true;
		const key = this.randomUuid();
		const url = await this.processFilesForUrls(this.originalScreenshot, key);

		let databaseObj: INewScreenshotAdded = {
			type: this.form.value.type,
			groupName: this.form.value.groupName,
			fbPermLink: this.form.value.fbPermLink,
			s3Key: url as string,
			sectionName: this.sectionName,
			key: `${this.campaignId}_${this.sectionName}`,
			campaignId: this.campaignId,
			order: this.order || 1
		};

		try {
			const response = await this.campaignService.addManualUploadedScreenshot(databaseObj);
			databaseObj = {...databaseObj, ...response};
		} catch (error) {
			this.logger.error(error, `Faield to upload screenshot for section ${this.sectionName}`);

			return;
		}

		this.newScreenshotAdded.emit(databaseObj);
		this.alert.success('Screenshot Uploaded successfully', '', 3000, true);

		document.getElementById('close-screenshot')?.click();

		this.reset();
	}

	private async processFilesForUrls(file: File, key: string) {
		return this.fileService.uploadToS3(file, 'image', key);
	}
}
