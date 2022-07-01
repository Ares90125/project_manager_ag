import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CreateCampaignService} from 'src/app/cs-admin/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignCommunityStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {CampaignService} from '@brandModule/services/campaign.service';
import {FileService} from '@sharedModule/services/file.service';

declare var navigator: any;
declare var ClipboardItem: any;

@Component({
	selector: 'app-community-marketing-campaign-content-manager',
	templateUrl: './community-marketing-campaign-content-manager.component.html',
	styleUrls: ['./community-marketing-campaign-content-manager.component.scss']
})
export class CommunityMarketingCampaignContentManagerComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() selectedCommunities;
	@Output() updateContentManager = new EventEmitter<any>();
	@Output() closeContentManager = new EventEmitter();
	campaignTasks = [];
	selectedCommunityManagers = [];
	showAlert = false;
	alertMessage = {heading: '', content: ''};
	compressionInProgress = false;
	compressionStatus;
	postTypes = [
		{name: 'Text', type: 'Basic', isSelected: false},
		{name: 'Text + Image / Video', type: 'Basic', isSelected: false},
		{name: 'Image / Video', type: 'Basic', isSelected: false},
		{name: 'Live video', type: 'Shell', isSelected: false},
		{name: 'Multi Video', type: 'Shell', isSelected: false},
		{name: 'Video + Images', type: 'Shell', isSelected: false}
	];
	selectedCampaignCommunities;
	numberOfSelectedFilters = 0;
	selectedFilterType = 'postType';
	selectedContentFilter = 'all';
	fbPermLinkRegex =
		/^(https)?(:\/\/)?((www|m)\.)?facebook.com\/groups\/[a-z|A-Z|0-9|.|_]*\/(permalink|posts)\/[0-9]*[\/]{0,1}$/;
	isUpdatingCampaignTasks = false;
	hideEmojis: boolean = true;
	searchResults = '';
	timeZone = DateTime.guess();
	userTimezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);

	constructor(
		injector: Injector,
		private fileService: FileService,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService
	) {
		super(injector);
	}

	@Input() set communityManagers(value) {
		if (value) {
			this.selectedCommunityManagers = JSON.parse(JSON.stringify(value));
		}
	}

	@Input() set selectedCampaignTasks(value) {
		this.campaignTasks = value;
		this.setCommunityDetails();
	}

	ngOnInit() {
		super._ngOnInit();
		this.setCommunityDetails();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async setCommunityDetails() {
		if (this.selectedCommunities?.length === 0 && this.selectedCampaignCommunities?.length > 0) {
			this.selectedCommunities = this.selectedCampaignCommunities;
		}
		this.selectedCommunities?.forEach(community => {
			const selectedCampaignTask = this.campaignTasks.find(task => task.groupId === community.groupId);
			if (selectedCampaignTask) {
				community.selectedPostType = this.linkSelectedPostType(
					community.postType
						? community.postType
						: this.campaign.defaultPostContentType
						? this.campaign.defaultPostContentType
						: 'Text + Image / Video'
				);
				community.imageUrls = selectedCampaignTask.imageUrls?.length > 0 ? selectedCampaignTask.imageUrls : [];
				community.videoUrls = selectedCampaignTask.videoUrls?.length > 0 ? selectedCampaignTask.videoUrls : [];
				community['previewImage'] = [];
				if (selectedCampaignTask['imageUrls']?.length > 0) {
					community['imageUrls'].forEach(url => {
						community['previewImage'].push({src: url, type: 'image'});
					});
				} else if (selectedCampaignTask['videoUrls']?.length > 0) {
					community['videoUrls'].forEach(url => {
						community['previewImage'].push({src: url, type: 'video'});
					});
				}
				community.content = selectedCampaignTask.text;
				community.textContent = selectedCampaignTask.text;
				community.fbPermlink = selectedCampaignTask.fbPermlink ? selectedCampaignTask.fbPermlink : null;
				community.isTextContentEdit = !selectedCampaignTask.text;
				community.taskId = selectedCampaignTask;
				community.isFbPermLinkValid = true;
				return community;
			} else {
				community.selectedPostType = this.linkSelectedPostType(
					this.campaign.defaultPostContentType ? this.campaign.defaultPostContentType : 'Text + Image / Video'
				);
				community.imageUrls = [];
				community.videoUrls = [];
				community['previewImage'] = [];
				community.content = '';
				community.textContent = '';
				community.isTextContentEdit = true;
				community.fbPermlink = null;
				community.isFbPermLinkValid = true;
			}
			community.isFbPermLinkValid = true;
		});
		this.selectedCommunities?.forEach(community => {
			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskCreated ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskRequestSent ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.CampaignAccepted ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.ContentApproved
			) {
				community.isEditable = true;
			} else {
				community.isEditable = false;
			}

			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskCompleted ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskScheduled ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskDeclined ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskPaused ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.TaskFailed ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.PaymentSent
			) {
				community.isFieldsEditable = false;
			} else {
				community.isFieldsEditable = true;
			}

			if (
				community.groupTaskStatus === CampaignCommunityStatusEnum.CampaignBriefSent ||
				community.groupTaskStatus === CampaignCommunityStatusEnum.CampaignDeclined ||
				!community.groupTaskStatus
			) {
				community.isCommunityAdminAccepted = false;
			} else {
				community.isCommunityAdminAccepted = true;
			}
		});
		this.selectedCampaignCommunities = this.selectedCommunities;
		this.applyContentFilters(this.selectedContentFilter);
	}

	setCommunityData(community, selectedCampaignTask) {
		community.selectedPostType = this.linkSelectedPostType(
			community.postType
				? community.postType
				: this.campaign.defaultPostContentType
				? this.campaign.defaultPostContentType
				: 'Text + Image / Video'
		);
		community.imageUrls = selectedCampaignTask.imageUrls?.length > 0 ? selectedCampaignTask.imageUrls : [];
		community.videoUrls = selectedCampaignTask.videoUrls?.length > 0 ? selectedCampaignTask.videoUrls : [];
		community['previewImage'] = [];
		if (selectedCampaignTask['imageUrls']?.length > 0) {
			community['imageUrls'].forEach(url => {
				community['previewImage'].push({src: url, type: 'image'});
			});
		} else if (selectedCampaignTask['videoUrls']?.length > 0) {
			community['videoUrls'].forEach(url => {
				community['previewImage'].push({src: url, type: 'video'});
			});
		}
		community.content = selectedCampaignTask.text;
		community.textContent = selectedCampaignTask.text;
		community.fbPermlink = selectedCampaignTask.fbPermlink ? selectedCampaignTask.fbPermlink : null;
		community.isTextContentEdit = !selectedCampaignTask.text;
		community.taskId = selectedCampaignTask;
		return community;
	}

	setPostType(community, type) {
		community.selectedPostType = type;
		community.isTextContentEdit = !community.textContent;
	}

	linkPostType(postType) {
		switch (postType) {
			case 'Text':
				return 'Text';
			case 'Image / Video':
				return 'ImageOrVideo';
			case 'Text + Image / Video':
				return 'TextImageOrVideo';
			case 'Live video':
				return 'LiveVideo';
			case 'Multi Video':
				return 'MultiVideo';
			case 'Video + Images':
				return 'VideoImage';
		}
	}

	linkSelectedPostType(postType) {
		switch (postType) {
			case 'Text':
				return 'Text';
			case 'ImageOrVideo':
				return 'Image / Video';
			case 'TextImageOrVideo':
				return 'Text + Image / Video';
			case 'LiveVideo':
				return 'Live video';
			case 'MultiVideo':
				return 'Multi Video';
			case 'VideoImage':
				return 'Video + Images';
			default:
				return postType;
		}
	}

	async copyToClipBoard(community, type, i = 0) {
		if (type === 'text') {
			const copyText = <HTMLInputElement>document.getElementById('text' + community.id);
			copyText.select();
			copyText.setSelectionRange(0, 99999);
			document.execCommand('copy');
		} else if (type === 'image') {
			if (community.previewImage[i].src.indexOf('image/jpeg') > -1) {
				const response = await fetch(community.previewImage[i].src.replace('image/jpeg', 'image/png'));
				const blob = await response.blob();
				this.setToClipboard(blob);
			} else {
				let img = new Image();
				img.crossOrigin = 'Anonymous';
				img.src = community.previewImage[i].src;
				img.onload = async () => {
					var canvas = <HTMLCanvasElement>document.createElement('CANVAS'),
						ctx = canvas.getContext('2d'),
						dataURL;
					canvas.height = img.height;
					canvas.width = img.width;
					ctx.drawImage(img, 0, 0);
					dataURL = canvas.toDataURL('imag/png');
					const response = await fetch(dataURL);
					const blob1 = await response.blob();
					this.setToClipboard(blob1);
					canvas = null;
				};
			}
		} else {
		}
	}

	async setToClipboard(blob) {
		const data = [new ClipboardItem({[blob.type]: blob})];
		return await navigator.clipboard.write(data);
	}

	onDownload(community, previewUrl) {
		let headers = new Headers();

		headers.append('crossDomain', 'true');
		headers.append('dataType', 'jsonp');
		fetch(previewUrl, {method: 'GET', headers: headers})
			.then(res => {
				return res.blob();
			})
			.then(blob => {
				var url = window.URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				a.download = community.groupName + (previewUrl.indexOf('.png') > -1 ? '.png' : '.mp4');
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

	onClickPasteButton(community) {
		if (this.isUpdatingCampaignTasks) {
			return;
		}
		navigator.permissions.query({name: 'clipboard-read'}).then(result => {
			if (result.state == 'granted' || result.state == 'prompt') {
				navigator.clipboard.read().then(data => {
					for (let i = 0; i < data.length; i++) {
						if (!data[i].types.includes('image/png')) {
							let alert = {content: null, heading: null};
							alert.heading = 'Incorrect file format';
							alert.content = 'Only files with the following extention are allowed: gif, png, jpg, jpeg, mp4, avi, mov';
							this.showAlert = true;
							this.alertMessage = alert;
						} else {
							data[i].getType('image/png').then(blob => {
								const reader = new FileReader();
								reader.readAsDataURL(blob);
								reader.onload = _event => {
									const file = this.convertBase64ToFileObject(reader.result, 'imagefile.png');
									this.fileUpload([file], community, true);
								};
							});
						}
					}
				});
			}
		});
	}

	convertBase64ToFileObject(dataUrl, fileName) {
		var arr = dataUrl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);

		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}

		return new File([u8arr], fileName, {type: mime});
	}

	emojiSelect(event, community) {
		community.content = community.content + event.emoji.native;
	}

	updateEmoji(isEnable = false) {
		this.selectedCommunities.forEach(community => {
			community['hideEmojis'] = isEnable;
		});
	}

	updateEmojiOnCommunity(community) {
		this.selectedCommunities.forEach(group => {
			group['hideEmojis'] = false;
		});
		community['hideEmojis'] = true;
	}

	savePostData(community) {
		community.isTextContentEdit = false;
		community.textContent = community.content;
		this.updateCampaignTasks(community);
	}

	saveDataForShellTask(event, community) {
		if (!community.isEditable) {
			return;
		}
		const value = event.target.value;
		if (value?.match(this.fbPermLinkRegex)) {
			community.isFbPermLinkValid = true;
		} else {
			community.isFbPermLinkValid = false;
			return;
		}

		if ((event.key === 'v' && event.ctrlKey) || event.key === 'Enter') {
			community.fbPermlink = event.target.value;

			this.updateCampaignTasks(community);
		}
	}

	searchByName(event) {
		this.searchResults = event;
		this.applyFilters();
		this.selectedCommunities = this.selectedCommunities.filter(community => {
			if (
				community?.communityAdminName?.toLowerCase().indexOf(event?.toLowerCase()) > -1 ||
				community?.groupName?.toLowerCase().indexOf(event?.toLowerCase()) > -1
			) {
				return true;
			} else {
				return false;
			}
		});
	}

	async applyContentFilters(filter) {
		this.applyFilters();
		if (filter === 'contentAdded') {
			this.selectedCommunities = this.selectedCommunities.filter(community => {
				if (community.selectedPostType === 'Text' && community.textContent) {
					return true;
				} else if (
					community.selectedPostType === 'Text + Image / Video' &&
					community.textContent &&
					(community.imageUrls?.length > 0 || community.videoUrls?.length > 0)
				) {
					return true;
				} else if (
					community.selectedPostType === 'Image / Video' &&
					(community.imageUrls?.length > 0 || community.videoUrls?.length > 0)
				) {
					return true;
				} else if (
					(community.selectedPostType === 'Live video' ||
						community.selectedPostType === 'Multi Video' ||
						community.selectedPostType === 'Video + Images') &&
					community.fbPermlink
				) {
					return true;
				} else {
					return false;
				}
			});
		} else if (filter === 'contentPending') {
			this.selectedCommunities = this.selectedCommunities.filter(community => {
				if (community.selectedPostType === 'Text' && !community.textContent) {
					return true;
				} else if (
					community.selectedPostType === 'Text + Image / Video' &&
					(!community.textContent || (community.imageUrls?.length === 0 && community.videoUrls?.length === 0))
				) {
					return true;
				} else if (
					community.selectedPostType === 'Image / Video' &&
					community.imageUrls?.length === 0 &&
					community.videoUrls?.length === 0
				) {
					return true;
				} else if (
					(community.selectedPostType === 'Live video' ||
						community.selectedPostType === 'Multi Video' ||
						community.selectedPostType === 'Video + Images') &&
					!community.fbPermlink
				) {
					return true;
				} else {
					return false;
				}
			});
		} else if (filter === 'shellTasks') {
			this.selectedCommunities = this.selectedCommunities.filter(community => {
				if (
					community.selectedPostType === 'Live video' ||
					community.selectedPostType === 'Multi Video' ||
					community.selectedPostType === 'Video + Images'
				) {
					return true;
				} else {
					return false;
				}
			});
		}
	}

	async applyFilters() {
		const selectedPostTypeFilter = this.postTypes.filter(item => item.isSelected);
		const selectedCommunityManagerFilter = this.selectedCommunityManagers.filter(item => item.isSelected);
		this.numberOfSelectedFilters = selectedPostTypeFilter.length + selectedCommunityManagerFilter.length;
		this.selectedCommunities = this.selectedCampaignCommunities;

		if (selectedPostTypeFilter.length > 0) {
			this.selectedCommunities = this.selectedCommunities.filter(community => {
				for (const element of selectedPostTypeFilter) {
					if (community.selectedPostType === element.name) {
						return true;
					}
				}
				return false;
			});
		}

		if (selectedCommunityManagerFilter.length > 0) {
			this.selectedCommunities = this.selectedCommunities.filter(community => {
				for (const element of selectedCommunityManagerFilter) {
					if (community.communityManagerName === element.fullname) {
						return true;
					}
				}
				return false;
			});
		}
	}

	async fileUpload(event, community, isFromDragAndDrop = false) {
		const file = isFromDragAndDrop ? event[0] : (<HTMLInputElement>event.target).files[0];
		if (!file || !community.isEditable || this.isUpdatingCampaignTasks) {
			return;
		}

		const mimeType = file.type;
		const size = file.size;
		const isNotAllowedMediaType = mimeType.match(/image\/*/) === null && mimeType.match(/video\/*/) === null;
		const isAllowedImageType = mimeType.split('/')[0] === 'image' && mimeType !== 'image/gif';
		const isVideoType = mimeType.split('/')[0] === 'video' || mimeType === 'image/gif';
		const isCombinationOfImageAndVideo =
			(isAllowedImageType && community.videoUrls?.length > 0) || (community.imageUrls?.length > 0 && isVideoType);
		const isVideoAlreadyAdded = community.videoUrls?.length > 0;

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
			this.showAlert = true;
			this.alertMessage = alert;
			this.resetFileUpload(community);
			return;
		}
		if (mimeType.split('/')[0] === 'image' && mimeType !== 'image/gif') {
			if (size <= 4000000) {
				community.imageUrls.push(file);
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = _event => {
					community.previewImage.push({src: reader.result, type: 'image'});
					this.updateCampaignTasks(community);
				};
			} else {
				this.showAlert = true;
				this.alertMessage = {
					heading: 'Image size too large',
					content: 'That file is too large to be uploaded. The limit is 4MB for Image.'
				};
				return;
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
			community.videoUrls.push(file);
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = _event => {
				community.previewImage.push({src: reader.result, type: 'video'});
				this.updateCampaignTasks(community);
			};
		}
		(<HTMLInputElement>document.getElementById('file' + community.id)).value = '';
		(<HTMLInputElement>document.getElementById('file' + community.id)).files = null;
	}

	resetFileUpload(community) {
		(<HTMLInputElement>document.getElementById('file' + community.id)).value = '';
		(<HTMLInputElement>document.getElementById('file' + community.id)).files = null;
		this.updateCampaignTasks(community);
	}

	setVideoPreviews(community, i) {
		setTimeout(() => {
			var canvas = <HTMLCanvasElement>document.getElementById('canvas' + i);
			var video = <HTMLVideoElement>document.getElementById('video' + i);
			canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
			let dataURL = canvas.toDataURL();
			community.previewImage = [];
			community.previewImage.push({src: dataURL, type: 'video'});
		}, 500);
	}

	onDiscardTextChanges(community) {
		if (community.textContent) {
			community.content = community.textContent;
		} else if (!community.textContent && community.content) {
			community.content = community.textContent;
		}
	}

	async updateCampaignTasks(community) {
		this.isUpdatingCampaignTasks = true;
		const taskData = this.campaignTasks?.find(task => task.groupId === community['groupId']);
		const taskInfo = {};
		taskInfo['campaignId'] = community.campaignId ? community.campaignId : this.campaign.campaignId;
		taskInfo['userId'] = community['communityAdminId'];
		taskInfo['userName'] = community['communityAdminName'];
		taskInfo['communityManagerId'] = community['communityManagerId'];
		taskInfo['communityManagerName'] = community['communityManagerName'];
		taskInfo['pricing'] = community['pricing'];
		taskInfo['groupId'] = community['groupId'];
		taskInfo['groupName'] = community['name'];
		taskInfo['title'] = this.campaign?.taskTitle
			? this.campaign.taskTitle
			: taskData?.['title']
			? taskData['title']
			: '';
		taskInfo['type'] = 'Post';
		taskInfo['period'] = this.campaign?.campaignPeriod
			? this.campaign.campaignPeriod
			: taskData?.['period']
			? taskData['period']
			: '';
		taskInfo['postType'] = this.getPostType(community.selectedPostType, community);
		if (
			taskInfo['postType'] === 'LiveVideo' ||
			taskInfo['postType'] === 'MultiVideo' ||
			taskInfo['postType'] === 'VideoImage'
		) {
			taskInfo['isPlaceholder'] = true;
			taskInfo['fbPermlink'] = community.fbPermlink;
			taskInfo['status'] = 'Completed';
			taskInfo['imageUrls'] = [];
			taskInfo['videoUrls'] = [];
		} else {
			taskInfo['isPlaceholder'] = false;
			taskInfo['fbPermlink'] = null;
			taskInfo['status'] = taskData?.status === 'Completed' ? null : taskData?.status;
		}
		taskInfo['text'] = community['selectedPostType'].indexOf('Text') > -1 ? community.textContent : '';
		community.textContent = taskInfo['text'];
		if (
			(community['imageUrls']?.length > 0 || community['videoUrls']?.length > 0) &&
			taskInfo['postType'] !== 'LiveVideo' &&
			taskInfo['postType'] !== 'MultiVideo' &&
			taskInfo['postType'] !== 'VideoImage'
		) {
			const processedFileURLs = await Promise.all([
				this.processFilesForUrls('image', community['imageUrls']),
				this.processFilesForUrls('video', community['videoUrls'])
			]);
			taskInfo['imageUrls'] = processedFileURLs[0];
			taskInfo['videoUrls'] = processedFileURLs[1];
			community['imageUrls'] = processedFileURLs[0];
			community['videoUrls'] = processedFileURLs[1];
		} else {
			taskInfo['imageUrls'] = [];
			taskInfo['videoUrls'] = [];
		}
		const calculatedTimezoneOffsetInMins = this.userTimezoneOffsetInMins - community['timezoneOffsetInMins'];
		if (taskData?.toBePerformedByUTC || community['defaultTaskDate']) {
			taskInfo['toBePerformedByUTC'] = taskData?.toBePerformedByUTC
				? taskData.toBePerformedByUTC
				: new DateTime(community['defaultTaskDate']).add(calculatedTimezoneOffsetInMins, 'minutes').utc().toISOString();
		} else {
			taskInfo['toBePerformedByUTC'] = null;
		}
		taskInfo['timezoneName'] = taskData?.['timezoneName'] ? taskData['timezoneName'] : community['timezoneName'];
		taskInfo['isDraft'] = taskData && !taskData['isDraft'] ? taskData?.['isDraft'] : true;
		if (taskData) {
			taskInfo['taskId'] = taskData['taskId'];
			if (taskInfo['status'] === 'Completed') {
				taskInfo['isDraft'] = false;
			} else if (taskData?.status === 'Completed') {
				taskInfo['isDraft'] = true;
			}
			try {
				const selectedCampaignTask = await this.createCampaignService.updateCampaignTaskDetails(taskInfo);
				community.postType = community.selectedPostType;
				const postTypeInput = {
					campaignId: this.campaign.campaignId,
					groupId: community.groupId,
					postType: this.linkPostType(community.selectedPostType),
					campaignGroupTaskId: taskData['taskId']
				};
				await this.campaignService.updateCMCampaignGroup(postTypeInput);
				if (taskInfo['status'] === 'Completed') {
					const input = {
						campaignId: this.campaign.campaignId,
						groupId: community.groupId,
						groupTaskStatus: CampaignCommunityStatusEnum.TaskCompleted
					};
					community.groupTaskStatus = CampaignCommunityStatusEnum.TaskCompleted;
					await this.campaignService.updateCMCampaignGroup(input);
				} else if (taskData?.status === 'Completed') {
					const input = {
						campaignId: this.campaign.campaignId,
						groupId: community.groupId,
						groupTaskStatus: CampaignCommunityStatusEnum.ContentApproved
					};
					community.groupTaskStatus = CampaignCommunityStatusEnum.ContentApproved;
					await this.campaignService.updateCMCampaignGroup(input);
				}
				this.setCommunityData(community, selectedCampaignTask);
				this.updateContentManager.emit(this.selectedCommunities);
			} catch (e) {}
		} else {
			try {
				const selectedCampaignTask = await this.createCampaignService.createCampaignTask(
					taskInfo,
					this.campaign?.brandId
				);
				community.postType = community.selectedPostType;
				this.campaignTasks.push(selectedCampaignTask);
				const postTypeInput = {
					campaignId: this.campaign.campaignId,
					groupId: community.groupId,
					postType: this.linkPostType(community.selectedPostType)
				};
				await this.campaignService.updateCMCampaignGroup(postTypeInput);
				const input = {
					campaignId: this.campaign.campaignId,
					groupId: community.groupId,
					groupTaskStatus:
						taskInfo['status'] === 'Completed'
							? CampaignCommunityStatusEnum.TaskCompleted
							: CampaignCommunityStatusEnum.ContentApproved
				};
				community.groupTaskStatus =
					taskInfo['status'] === 'Completed'
						? CampaignCommunityStatusEnum.TaskCompleted
						: CampaignCommunityStatusEnum.ContentApproved;
				await this.campaignService.updateCMCampaignGroup(input);
				const campaignGroupTaskId = {
					campaignId: this.campaign.campaignId,
					groupId: community.groupId,
					campaignGroupTaskId: selectedCampaignTask.taskId
				};
				await this.campaignService.updateCMCampaignGroup(campaignGroupTaskId);
				this.setCommunityData(community, selectedCampaignTask);
				this.updateContentManager.emit(this.selectedCommunities);
			} catch (e) {}
		}

		this.isUpdatingCampaignTasks = false;
	}

	getPostType(postType, task) {
		switch (postType) {
			case 'Text':
				return 'Text';
			case 'Image / Video':
				return task.imageUrls?.length > 1
					? 'Album'
					: task.videoUrls?.length > 0
					? 'Video'
					: task.imageUrls?.length > 0
					? 'Photo'
					: 'Text';
			case 'Text + Image / Video':
				return task.imageUrls?.length > 1
					? 'Album'
					: task.videoUrls?.length > 0
					? 'Video'
					: task.imageUrls?.length > 0
					? 'Photo'
					: 'Text';
			case 'Live video':
				return 'LiveVideo';
			case 'Multi Video':
				return 'MultiVideo';
			case 'Video + Images':
				return 'VideoImage';
		}
	}

	removePreview(community, i) {
		if (this.isUpdatingCampaignTasks) {
			return;
		}
		community.previewImage.splice(i, 1);
		if (community.imageUrls?.length > 0) {
			community.imageUrls.splice(i, 1);
		} else {
			community.videoUrls.splice(i, 1);
		}
		this.updateCampaignTasks(community);
	}

	openWhatsappOrEmailChatWindow(value, type) {
		switch (type) {
			case 'email':
				window.open('https://mail.google.com/mail/u/0/#search/' + value);
				break;
			case 'whatsapp':
				window.open('https://wa.me/' + value);
				break;
		}
	}

	private async processFilesForUrls(type: 'image' | 'video', files: any) {
		const requestsForProcessingFileURLs = [];

		for (let i = 0; i < files.length; i++) {
			const data = ({}[type + 'File'] = files[i]);

			if (typeof files[i] !== 'string') {
				this.logger.debug(
					'Uploading' + type + ' file data to s3',
					data,
					'CommunityMarketingCampaignTasksComponent',
					'processFilesForUrls'
				);
				requestsForProcessingFileURLs.push(this.fileService.uploadToS3(files[i], type, this.randomUuid(), true));
			} else {
				requestsForProcessingFileURLs.push(new Promise(resolve => resolve(files[i])));
			}
		}

		return await Promise.all(requestsForProcessingFileURLs);
	}
}
