import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {CampaignCommunityStatusEnum, CMCWhatsAppNotificationType} from '@sharedModule/enums/campaign-type.enum';
import {UpdateCampaignInput} from '@sharedModule/models/graph-ql.model';
import {FileService} from '@sharedModule/services/file.service';

import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-community-marketing-campaign-community-notification',
	templateUrl: './community-marketing-campaign-community-notification.component.html',
	styleUrls: ['./community-marketing-campaign-community-notification.component.scss']
})
export class CommunityMarketingCampaignCommunityNotificationComponent
	extends BaseComponent
	implements OnInit, OnDestroy
{
	@ViewChild('quillFile') quillFileRef: ElementRef;
	quillFile: any;
	meQuillRef: any;
	@Input() campaign;
	@Input() brand;
	@Input() isDialogOpen;
	@Input() selectedCommunities;
	@Input() communities;
	@Input() isCampaignBriefEnabled = false;
	@Input() isCampaignBriefReminderEnabled = false;
	@Input() isTaskReminderEnabled = false;
	@Input() isNotificationEnabled = false;
	@Input() isCampaignBriefAlreadySent = false;
	@Output() closeDialog = new EventEmitter();
	notificationType;
	campaignStatus;
	notificationSent = false;
	quillConfig = {
		toolbar: {
			container: ['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}],
			handlers: {
				image: image => {
					this.customImageUpload(image);
				}
			}
		}
	};
	showBriefInput = false;
	campaignBrief;
	isLoadingImage = false;
	isUpdating = false;
	messageToBeSent =
		'Yay! :tada:  Your group {{Group Name}} has been selected for {{Campaign Name}} campaign with Convosight. Please share copies at the earliest as mentioned in campaign details.';
	cohort = 'cohort1';
	campaignBriefLink = '';

	constructor(
		injector: Injector,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService,
		private fileService: FileService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.campaignBrief = this.campaign.details;
		this.campaignBriefLink = `https://convosight.typeform.com/to/${this.campaign?.typeformId}#campaignid={{1}}&groupid={{2}}&adminid={{3}}&cohort={{4}}`;
	}

	setInputToSendUpdates() {
		if (this.notificationType === 'brief') {
			this.showBriefInput = true;
		} else {
			this.triggerWANotifications(this.notificationType);
		}
	}

	goBack() {
		this.showBriefInput = false;
	}

	getMeEditorInstance(editorInstance: any) {
		this.meQuillRef = editorInstance;
	}

	customImageUpload(image: any) {
		this.quillFileRef.nativeElement.click();
	}

	async quillFileSelected(ev: any) {
		this.isLoadingImage = true;
		this.quillFile = (<HTMLInputElement>ev.target).files[0];
		const processedFileURLs = this.quillFile ? await Promise.all([this.processFilesForUrls(this.quillFile)]) : null;
		const s3ImageUrl = processedFileURLs ? processedFileURLs[0][0] : this.campaign.s3CoverImageUrl;
		const image = await this.fileService.getImage(s3ImageUrl);

		let range: any;
		const img = '<img class="img-within" src="' + image + '"></img>';

		range = this.meQuillRef.getSelection();
		this.meQuillRef.clipboard.dangerouslyPasteHTML(range.index, img);
		this.campaignBrief = this.meQuillRef.root.innerHTML;
		this.isLoadingImage = false;
	}

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}

	async triggerWANotifications(type) {
		let input = {};
		try {
			if (type === 'status') {
				input = {
					selectedCommunities: this.selectedCommunities,
					campaignName: this.campaign.campaignName,
					campaignId: this.campaign.campaignId,
					campaignStatus: this.campaignStatus,
					notificationType: CMCWhatsAppNotificationType.CampaignStatusUpdate
				};
			} else {
				input = {
					selectedCommunities: this.selectedCommunities,
					campaignName: this.campaign.campaignName,
					campaignId: this.campaign.campaignId,
					notificationType:
						type === 'briefReminder'
							? CMCWhatsAppNotificationType.CampaignBriefAndPricingReminder
							: type === 'taskReminder'
							? CMCWhatsAppNotificationType.TaskReminder
							: CMCWhatsAppNotificationType.CampaignBriefAndContentRequest
				};
				if (type === 'brief') {
					input['typeformId'] = this.campaign.typeformId;
				}
			}
			await this.createCampaignService.triggerWANotifications(input);
			if (type === 'brief') {
				this.selectedCommunities.forEach(community => {
					const selectedCommunity = this.communities.find(group => group.groupId === community);
					if (selectedCommunity && !selectedCommunity.groupTaskStatus) {
						const input = {
							campaignId: this.campaign.campaignId,
							groupId: selectedCommunity?.groupId,
							groupTaskStatus: CampaignCommunityStatusEnum.CampaignBriefSent
						};
						selectedCommunity.groupTaskStatus = CampaignCommunityStatusEnum.CampaignBriefSent;
						this.campaignService.updateCMCampaignGroup(input);
					}
				});
			}
			this.notificationSent = true;
		} catch (e) {}
	}

	async sendBriefUpdate() {
		this.isUpdating = true;
		try {
			await this.triggerWANotifications('brief');
			const campaignUpdateInput = {};
			campaignUpdateInput['campaignBriefForCommunityAdmin'] = this.campaignBrief;
			campaignUpdateInput['campaignId'] = this.campaign['campaignId'];
			campaignUpdateInput['campaignName'] = this.campaign['campaignName'];
			campaignUpdateInput['brandId'] = this.brand.id;
			await this.createCampaignService.updateCampaignDetails(campaignUpdateInput as UpdateCampaignInput);
			this.alert.success('Notifications sent sucessfully!', '');
			this.isUpdating = false;
			this.closeDialog.emit();
		} catch (e) {
			this.alert.error('', `Something went wrong while sending notifications. Please try again in sometime!`);
			this.isUpdating = false;
			this.closeDialog.emit();
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
