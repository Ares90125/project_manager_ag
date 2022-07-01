import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {FileService} from '@sharedModule/services/file.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {GroupModel} from '@sharedModule/models/group.model';
import {FacebookInsightsDetails, FacebookInsightsFileStatus} from '@sharedModule/models/graph-ql.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-facebook-insights-upload-card',
	templateUrl: './facebook-insights-upload-card.component.html',
	styleUrls: ['./facebook-insights-upload-card.component.scss']
})
export class FacebookInsightsUploadCardComponent extends BaseComponent implements OnInit, OnDestroy {
	insightsExcelsFolderRoot = 'insightsExcels/';
	fileName: string = '';
	modifiedFileName: string = '';
	insightFile: any;
	fileExist: boolean = false;
	fileUploading: boolean = false;
	fileProcessing: boolean = false;
	fileStatus: string = '';
	sheetUid: string = '';
	fileKey: string = '';
	uploadCancelled: boolean = false;
	enableInputBlock: boolean = false;
	processedFileDetails: object = {};
	facebookInsightsDetails: FacebookInsightsDetails = new FacebookInsightsDetails();
	@Input() group: GroupModel;
	@Input() pageType: string = '';

	constructor(
		injector: Injector,
		private fileService: FileService,
		private readonly loggerService: LoggerService,
		private readonly appSync: AmplifyAppSyncService,
		private groupsService: GroupsService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		if (!this.group.facebookInsightsFileDetails) {
			if (this.pageType === 'group-details') {
				this.enableInputBlock = true;
			}
			return;
		} else {
			this.fileExist = true;
			this.fileName = this.group.facebookInsightsFileDetails.fileName;
			this.fileStatus = this.getFileStatus(
				this.group.facebookInsightsFileDetails.fileStatus,
				this.group.facebookInsightsFileDetails.fileUploadedAtUTC
			);
			if (this.group.facebookInsightsFileDetails.fileStatus !== this.fileStatus) {
				this.frameInsightsDetails();
				this.updateGroupOnInsights();
			}
			this.sheetUid = this.group.facebookInsightsFileDetails.sheetUID;
			this.fileKey = this.insightsExcelsFolderRoot + this.sheetUid;
			this.modifiedFileName = this.getFileNameForDisplay(this.fileName);
			this.processedFileDetails['fileName'] = this.fileName;
			this.processedFileDetails['modifiedFileName'] = this.modifiedFileName;
			this.processedFileDetails['fileStatus'] = this.fileStatus;
		}
	}

	getFileStatus(fileStatus: FacebookInsightsFileStatus, uploadTimestamp: string) {
		if (fileStatus === FacebookInsightsFileStatus.Invalid) {
			return 'Invalid';
		} else if (fileStatus === FacebookInsightsFileStatus.Expired) {
			return 'Expired';
		} else {
			return new DateTime().diff(new DateTime(uploadTimestamp).dayJsObj, 'day') > 90 ? 'Expired' : 'Valid';
		}
	}

	getFileNameForDisplay(fileName: string) {
		return fileName.length > 20 ? fileName.substr(0, 10) + '...' + fileName.substr(-9) : fileName;
	}

	async fileChange(event: any) {
		this.enableInputBlock = false;
		if (event.target.files.length < 1) {
			return;
		}
		if (event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1) !== 'xlsx') {
			this.alert.error('Invalid File Format', 'Upload insights data in a .xlsx file format.');
			return;
		}

		this.fileExist = true;
		this.fileUploading = true;
		this.fileStatus = '';
		this.insightFile = event.target.files[0];
		this.fileName = this.insightFile.name;
		this.modifiedFileName = this.getFileNameForDisplay(this.fileName);
		const processedFileURLs = this.insightFile ? await this.uploadInsightsFileAndFetchURL(this.insightFile) : null;

		if (!processedFileURLs || this.uploadCancelled) {
			if (!this.uploadCancelled) {
				this.alert.error('File could not be uploaded', '');
			}
			this.uploadCancelled = false;
			return;
		}
		this.alert.success('File upload successful', '');
		this.sheetUid = processedFileURLs.substring(processedFileURLs.lastIndexOf('/') + 1);
		this.fileKey = this.insightsExcelsFolderRoot + this.sheetUid;
		this.fileUploading = false;
		this.fileProcessing = true;
		const result = await this.triggerInsightsParsing();
		if (result) {
			this.fileProcessing = false;
			this.fileStatus = 'Valid';
		} else {
			this.fileProcessing = false;
			this.fileStatus = 'Invalid';
		}
		this.processedFileDetails['fileName'] = this.fileName;
		this.processedFileDetails['modifiedFileName'] = this.modifiedFileName;
		this.processedFileDetails['fileStatus'] = this.fileStatus;
		this.frameInsightsDetails();
		await this.updateGroupOnInsights();
	}

	cancelUploading() {
		this.uploadCancelled = true;
		if (Object.keys(this.processedFileDetails).length) {
			this.fileExist = true;
			this.fileUploading = false;
			this.fileName = this.processedFileDetails['fileName'];
			this.modifiedFileName = this.processedFileDetails['modifiedFileName'];
			this.fileStatus = this.processedFileDetails['fileStatus'];
		} else {
			if (this.pageType === 'group-details') {
				this.enableInputBlock = true;
			}
			this.fileExist = false;
			this.fileUploading = false;
			this.fileName = '';
			this.modifiedFileName = '';
			this.fileStatus = '';
		}
	}

	frameInsightsDetails() {
		this.facebookInsightsDetails.fileName = this.fileName;
		this.facebookInsightsDetails.sheetUID = this.sheetUid;
		if (this.fileStatus === 'Valid') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Valid;
		} else if (this.fileStatus === 'Invalid') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Invalid;
		} else if (this.fileStatus === 'Expired') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Expired;
		}
		this.facebookInsightsDetails.fileUploadedAtUTC = new Date().toISOString();
	}

	private async updateGroupOnInsights() {
		return await this.groupsService.updateFacebookInsightFileDetailsOnGroup(
			this.group.id,
			this.facebookInsightsDetails
		);
	}

	public async triggerInsightsParsing(): Promise<boolean> {
		try {
			const sheetNameWithoutExtension = this.sheetUid.substring(0, this.sheetUid.lastIndexOf('.'));
			await this.appSync.facebookInsightsParser(this.group.id, sheetNameWithoutExtension);
			return true;
		} catch (error) {
			this.loggerService.error(
				error,
				'Post call to api failed',
				{},
				'FacebookInsightsUploadCardComponent',
				'uploadInsights'
			);
			return false;
		}
	}

	private async uploadInsightsFileAndFetchURL(file: any) {
		return await this.fileService.uploadToS3(file, 'excel', this.randomUuid());
	}

	async downloadFile() {
		const response = await this.fileService.getDataFromS3(this.fileKey);
		if (response) {
			await this.fileService.downloadBlob(response, this.fileName);
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
