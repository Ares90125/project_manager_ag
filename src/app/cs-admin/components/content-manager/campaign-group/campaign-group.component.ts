import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ContentManagerService} from '../../../services/content-manager.service';
import {Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {CampaignAsset, CMCNotification, UserRole} from 'src/app/shared/models/graph-ql.model';
import {Clipboard} from '@angular/cdk/clipboard';
import axios from 'axios';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {environment} from 'src/environments/environment';
import 'quill-emoji/dist/quill-emoji.js';
import {SecuredStorageProviderService} from '../../../../shared/services/secured-storage-provider.service';
import {UserService} from '../../../../shared/services/user.service';

@Component({
	selector: 'app-campaign-group',
	templateUrl: './campaign-group.component.html',
	styleUrls: ['./campaign-group.component.scss']
})
export class CampaignGroupComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaignAsset: CampaignAsset;
	@Input() selectedCampaign: CampaignModel;
	@Input() selectedNotification: CMCNotification;
	@Input() designers: UserRole[];
	@Input() copywriters: UserRole[];
	@Input() selectedFilter: string;
	@Output() wipeSelectedNotification: EventEmitter<any> = new EventEmitter<any>();
	@Output() handleGetCampaignAssets: EventEmitter<CampaignAsset[]> = new EventEmitter<CampaignAsset[]>();
	@Output() handleUpdateCampaignAsset: EventEmitter<CampaignAsset> = new EventEmitter<CampaignAsset>();

	showRejectionModal: boolean = false;
	showAssignRoleModal: string = '';
	showRequireAssetModal: boolean = false;
	showCreateTextAssetModal: boolean = false;
	rateFbAdminModal: boolean = false;

	selectedUserRole: UserRole;
	selectedAsset: CampaignAsset;
	selectedAssetType: string;
	selectedAssetItem;
	assetText: string = '';
	isEditingText: boolean = false;
	rejectionReason: string = '';
	isEditingAddress: boolean = false;
	assetAddress = null;
	createTaskLoading: boolean = false;
	requireAssetMessage: string = '';
	fbAdminRating: number = 5;

	constructor(
		injector: Injector,
		private readonly contentManagerService: ContentManagerService,
		private readonly securedStorageProvider: SecuredStorageProviderService,
		private readonly userService: UserService,
		private readonly router: Router,
		private clipboard: Clipboard
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	changeAssetText(event) {
		if (Array.isArray(event)) {
			this.assetText = event.join('');
		}
	}

	changeAssetAddress({value, field}) {
		this.assetAddress[field] = value;
	}

	extractFieldFromJsonByName(obj, name) {
		obj = JSON.parse(obj);
		return obj[name];
	}

	changeRejectionReason(event) {
		this.rejectionReason = event.target.value;
	}

	changeRequireAssetMessage(event) {
		this.requireAssetMessage = event.target.value;
	}

	async uploadFile({
		event,
		asset,
		type,
		isCreation
	}: {
		event: any;
		asset: any;
		type: 'image' | 'video';
		isCreation?: boolean;
	}) {
		const self = this;
		const file = event.target.files[0];
		const fileReader = new FileReader();

		fileReader.readAsArrayBuffer(file);

		const token = await this.userService.getCurrentSessionJWTToken();
		fileReader.onload = async function (e) {
			const signedUrls = await axios({
				method: 'put',
				data: {type},
				url: `${environment.restApiUrl}/cmc/contentManager/generateSignedUrl`,
				headers: {
					Authorization: token
				}
			}).then(response => response.data);

			await axios({
				method: 'put',
				url: signedUrls.signedUrl,
				data: fileReader.result,
				headers: type === 'image' ? {'Content-Type': 'image/png'} : {'Content-Type': 'video/mp4'}
			});

			if (isCreation) {
				await self.handleCreateAsset({
					campaignId: self.campaignAsset.campaignId,
					groupId: self.campaignAsset.groupId,
					value: signedUrls.cloudfrontUrl,
					type
				});
				return;
			}

			const preparedAssetItem = {
				id: asset.id,
				status: 'PendingApproval',
				value: signedUrls.cloudfrontUrl,
				rejectReason: asset.rejectionReason,
				assignedContentUserId: asset.assignedContentUserId
			};

			const updatedGroup = await self.contentManagerService.updateCampaignGroupAssets(
				self.campaignAsset.campaignId,
				self.campaignAsset.groupId,
				preparedAssetItem
			);

			self.handleUpdateCampaignAsset.emit(updatedGroup);
		};
	}

	async handleCreateAsset({campaignId, groupId, value, type}) {
		const prepareData = {
			campaignId,
			groupId,
			input: {
				status: 'PendingApproval',
				type,
				value
			}
		};

		await this.contentManagerService.createCampaignGroupAsset(prepareData);
		this.refetchCampaignAssets();
	}

	async handleUpdateText() {
		if (!this.isEditingText) {
			this.isEditingText = true;
			this.assetText = this.selectedAssetItem.value;
		} else {
			const preparedAssetItem = {
				id: this.selectedAssetItem.id,
				status: 'PendingApproval',
				value: this.assetText,
				rejectReason: this.selectedAssetItem.rejectionReason,
				assignedContentUserId: this.selectedAssetItem.assignedContentUserId
			};

			const updatedGroup = await this.contentManagerService.updateCampaignGroupAssets(
				this.campaignAsset.campaignId,
				this.campaignAsset.groupId,
				preparedAssetItem
			);

			this.handleUpdateCampaignAsset.emit(updatedGroup);
			this.assetText = '';
			this.isEditingText = false;
		}
	}

	async handleUpdateAddress({asset}) {
		if (!this.isEditingAddress) {
			this.isEditingAddress = true;
			this.assetAddress = JSON.parse(asset.value);
		} else {
			const preparedAssetItem = {
				id: asset.id,
				status: 'PendingApproval',
				value: JSON.stringify(this.assetAddress),
				rejectReason: asset.rejectionReason,
				assignedContentUserId: asset.assignedContentUserId
			};

			const updatedGroup = await this.contentManagerService.updateCampaignGroupAssets(
				this.campaignAsset.campaignId,
				this.campaignAsset.groupId,
				preparedAssetItem
			);

			this.handleUpdateCampaignAsset.emit(updatedGroup);
			this.isEditingAddress = false;
			this.assetAddress = null;
		}
	}

	handleAssignRoleModal({assetItem, assignment, role}) {
		if (this.showAssignRoleModal) {
			this.selectedAsset = {
				brandId: null,
				brandName: null,
				campaignId: null,
				campaignName: null,
				communityAdminName: null,
				groupId: null,
				groupName: null,
				items: null,
				rating: null,
				status: null
			};
			this.showAssignRoleModal = '';
			this.rejectionReason = '';
		} else {
			const preparedAssetItem = {
				id: assetItem.id,
				status: assetItem.status,
				value: assetItem.value,
				rejectReason: assetItem.rejectionReason,
				assignedContentUserId: assignment.id
			};

			this.selectedAsset = {
				...this.campaignAsset,
				items: [preparedAssetItem]
			};
			this.showAssignRoleModal = role;
		}
	}

	handleRequireAssetModal() {
		if (this.showRequireAssetModal) {
			this.showRequireAssetModal = false;
			this.requireAssetMessage = '';
		} else {
			this.showRequireAssetModal = true;
		}
	}

	handleCreateTextAssetModal() {
		if (this.showCreateTextAssetModal) {
			this.showCreateTextAssetModal = false;
			this.assetText = '';
		} else {
			this.showCreateTextAssetModal = true;
		}
	}

	handleEditTextAssetModal() {
		if (this.isEditingText) {
			this.isEditingText = false;
			this.assetText = '';
		} else {
			this.isEditingText = true;
		}
	}

	async handleAssignRole() {
		const updatedGroup = await this.contentManagerService.updateCampaignGroupAssets(
			this.campaignAsset.campaignId,
			this.campaignAsset.groupId,
			{...this.selectedAsset.items[0], rejectReason: this.rejectionReason}
		);

		this.handleUpdateCampaignAsset.emit(updatedGroup);
		this.showAssignRoleModal = '';
		this.rejectionReason = '';
	}

	handleRejectionModal({assetItem}) {
		if (this.showRejectionModal) {
			this.selectedAsset = {
				brandId: null,
				brandName: null,
				campaignId: null,
				campaignName: null,
				communityAdminName: null,
				groupId: null,
				groupName: null,
				items: null,
				rating: null,
				status: null
			};
			this.showRejectionModal = false;
			this.rejectionReason = '';
		} else {
			this.selectedAsset = {
				brandId: this.campaignAsset.brandId,
				brandName: this.campaignAsset.brandName,
				campaignId: this.campaignAsset.campaignId,
				campaignName: this.campaignAsset.campaignName,
				communityAdminName: this.campaignAsset.communityAdminName,
				groupId: this.campaignAsset.groupId,
				groupName: this.campaignAsset.groupName,
				items: [assetItem],
				rating: this.campaignAsset.rating,
				status: this.campaignAsset.status
			};
			this.showRejectionModal = true;
		}
	}

	async handleAssetStatus({campaignId, groupId, assetItem, status}) {
		const preparedAssetItem = {
			id: assetItem.id,
			status: status,
			value: assetItem.value,
			rejectReason: this.rejectionReason,
			assignedContentUserId: assetItem.assignedContentUserId
		};

		if (status === 'Declined') {
			this.selectedAsset = {
				brandId: null,
				brandName: null,
				campaignId: null,
				campaignName: null,
				communityAdminName: null,
				groupId: null,
				groupName: null,
				items: null,
				rating: null,
				status: null
			};
			this.showRejectionModal = false;
			this.rejectionReason = '';
		}

		const updatedGroup = await this.contentManagerService.updateCampaignGroupAssets(
			campaignId,
			groupId,
			preparedAssetItem
		);
		this.handleUpdateCampaignAsset.emit(updatedGroup);
	}

	async refetchCampaignAssets() {
		if (this.selectedNotification.id) {
			const campaignAssetsByGroupId = await this.contentManagerService.getCampaignGroupAssets(
				this.selectedNotification.campaignId,
				this.selectedNotification.groupId
			);
			this.handleGetCampaignAssets.emit([campaignAssetsByGroupId]);
		} else {
			const campaignAssets = await this.contentManagerService.getCampaignAssets(this.selectedCampaign.campaignId);
			if (campaignAssets.length) {
				this.handleGetCampaignAssets.emit(campaignAssets);
			} else {
				this.handleGetCampaignAssets.emit([]);
			}
		}
	}

	async handleBackToPreviousCampaign() {
		this.wipeSelectedNotification.emit();

		const campaignAssets = await this.contentManagerService.getCampaignAssets(this.selectedCampaign.campaignId);
		if (campaignAssets.length) {
			this.handleGetCampaignAssets.emit(campaignAssets);
		} else {
			this.handleGetCampaignAssets.emit([]);
		}
	}

	async deleteCampaignGroupAsset({campaignId, groupId, itemId}) {
		await this.contentManagerService.deleteCampaignGroupAsset({campaignId, groupId, itemId});
		this.refetchCampaignAssets();
	}

	async handleCreateTask() {
		this.createTaskLoading = true;
		const createTaskResponse = await this.contentManagerService.createTaskForCampaignGroupAsset({
			campaignId: this.campaignAsset.campaignId,
			groupId: this.campaignAsset.groupId
		});

		if (createTaskResponse instanceof Error) {
			const errorMessage = createTaskResponse.message.slice(
				createTaskResponse.message.indexOf('"') + 1,
				createTaskResponse.message.lastIndexOf('"')
			);
			this.alert.error('Creating task error', errorMessage);
			this.createTaskLoading = false;
			return;
		}

		this.refetchCampaignAssets();
		this.createTaskLoading = false;
	}

	async requireAssetReminder({campaignId, groupId, message}: {campaignId: string; groupId: string; message?: string}) {
		this.createTaskLoading = true;
		const response = await this.contentManagerService.requireAssetReminder({campaignId, groupId, message});
		if (response && response.status === 'Ok') {
			this.alert.success('Require asset reminder was sent', '');
		}
		this.handleRequireAssetModal();
		this.createTaskLoading = false;
	}

	getUserRoleById({id, type}) {
		if (type === 'designer') {
			const user = this.designers.find(designer => designer.id === id);
			if (user) {
				return user.fullname;
			}
		} else {
			const user = this.copywriters.find(copywriter => copywriter.id === id);
			if (user) {
				return user.fullname;
			}
		}
	}

	onDownload(imageUrl) {
		let headers = new Headers();
		headers.append('crossDomain', 'true');
		headers.append('dataType', 'jsonp');
		fetch(imageUrl, {method: 'GET', headers: headers})
			.then(res => {
				return res.blob();
			})
			.then(blob => {
				var url = window.URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				// a.download = imageUrl.indexOf('.png') > -1 ? '.png' : '.jpg';
				a.download = imageUrl;
				document.body.appendChild(a);
				a.click();
				setTimeout(_ => {
					window.URL.revokeObjectURL(url);
				}, 60000);
				a.remove();
			})
			.catch(err => {
				console.error('err: ', err);
			});
	}

	copyToClipboard(text: string) {
		this.clipboard.copy(text);
	}

	async sendFbAdminRating() {
		const response = await this.contentManagerService.cmcSendRating({
			campaignId: this.campaignAsset.campaignId,
			groupId: this.campaignAsset.groupId,
			rating: this.fbAdminRating
		});

		this.rateFbAdminModal = false;
		if (response.status && response.status === 'Ok') {
			this.campaignAsset.rating = this.fbAdminRating;
			this.alert.success('Rating for facebook admin successfully sent', '');
		} else {
			this.alert.error('Error while sending rating for facebook admin', '');
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
