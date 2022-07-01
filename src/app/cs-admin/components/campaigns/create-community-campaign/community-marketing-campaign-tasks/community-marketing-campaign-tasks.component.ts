import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CreateCampaignService} from 'src/app/cs-admin/services/create-campaign.service';
import {PostContentTypeEnum} from 'src/app/group-admin/models/facebook-post.model';
import {AlertService} from '@sharedModule/services/alert.service';
import {read, utils, writeFile} from 'xlsx';
import {BaseComponent} from '@sharedModule/components/base.component';
import {TaskStatusEnum} from '@sharedModule/models/graph-ql.model';
import {FileService} from '@sharedModule/services/file.service';
import {Lightbox, LightboxConfig} from 'ngx-lightbox';
import * as _ from 'lodash';
import {DateTime} from '@sharedModule/models/date-time';
import {UtilityService} from '@sharedModule/services/utility.service';
import {CampaignAcceptanceStatusEnum} from '@sharedModule/enums/campaign-acceptance-status-type.enum';
import {CampaignTaskModel} from '@sharedModule/models/campaign-task.model';
import {CampaignCommunityStatusEnum} from '@sharedModule/enums/campaign-type.enum';
import {CampaignService} from '@brandModule/services/campaign.service';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {CampaignGroupsModel} from '@sharedModule/models/campaign-groups.model';

@Component({
	selector: 'app-community-marketing-campaign-tasks',
	templateUrl: './community-marketing-campaign-tasks.component.html',
	styleUrls: ['./community-marketing-campaign-tasks.component.scss']
})
export class CommunityMarketingCampaignTasksComponent extends BaseComponent implements OnInit, OnDestroy {
	showAddTask = false;
	taskEditForm: FormGroup;
	selectedEditableRow;
	selectedRowNumber;
	timeOptions;
	publishTime = '12:30 AM';
	lastUpdatedIndex = 1;
	campaignId;
	moreInfoRow = false;
	isDuplicateTask = false;
	typeFilters = [
		{
			name: 'Type',
			displayName: 'Type',
			isMultipleSelection: true,
			list: [
				{displayName: 'Video', name: 'Video', isSelected: true},
				{displayName: 'Image', name: 'Image', isSelected: true},
				{displayName: 'Text', name: 'Text', isSelected: true},
				{displayName: 'Live video', name: 'LiveVideo', isSelected: true},
				{displayName: 'Multiple videos', name: 'MultiVideo', isSelected: true},
				{displayName: 'Video + Images', name: 'VideoImage', isSelected: true}
			]
		}
	];
	statusFilters = [
		{
			name: 'State',
			displayName: 'State',
			isMultipleSelection: true,
			list: [
				{displayName: 'Empty', name: null, isSelected: true},
				{displayName: 'Campaign Brief Sent', name: 'CampaignBriefSent', isSelected: true},
				{displayName: 'Content Approved', name: 'ContentApproved', isSelected: true},
				{displayName: 'Task Created', name: 'TaskCreated', isSelected: true},
				{displayName: 'Task Request Sent', name: 'TaskRequestSent', isSelected: true},
				{displayName: 'Task Scheduled', name: 'TaskScheduled', isSelected: true},
				{displayName: 'Task Declined', name: 'TaskDeclined', isSelected: true},
				{displayName: 'Task Completed', name: 'TaskCompleted', isSelected: true},
				{displayName: 'Task Paused', name: 'TaskPaused', isSelected: true},
				{displayName: 'Task Failed', name: 'TaskFailed', isSelected: true}
			]
		}
	];
	statusFiltersOld = [
		{
			name: 'State',
			displayName: 'State',
			isMultipleSelection: true,
			list: [
				{displayName: 'Completed', name: 'Completed', isSelected: true},
				{displayName: 'Failed', name: 'Failed', isSelected: true},
				{displayName: 'PendingApproval', name: 'PendingApproval', isSelected: true},
				{displayName: 'Queued', name: 'Queued', isSelected: true},
				{displayName: 'Rejected', name: 'Rejected', isSelected: true},
				{displayName: 'Paused', name: 'Paused', isSelected: true},
				{displayName: 'Suspended', name: 'Suspended', isSelected: true},
				{displayName: 'Unassigned', name: null, isSelected: true}
			]
		}
	];
	numberOfFieldsChecked = 6;

	uploadCampaignTasks = [];
	campaignTaskColumnNames = [
		'No.',
		'groupId',
		'groupName',
		'communityAdminName',
		'postType',
		'period',
		'title',
		'text',
		'toBePerformedByUTC',
		'videoUrls',
		'imageUrls',
		'fbPermlink',
		'memberCount',
		'groupTaskStatus',
		'adminName',
		'pricing',
		'communityAdminName',
		'email',
		'mobileNumber',
		'cohort',
		'communityManager'
	];
	isSubmitting = false;
	isDateValid = true;
	isTaskTypeValid = true;
	minDate = new DateTime().toDate();
	tasksPerPage = [50, 100, 150];
	numberOfTasksPerPage = 50;
	startOfTask = 0;
	endOfTask = 50;
	isGroupNotInstalled = false;

	groupDetails;
	groupModerators = [];
	selectedGroup = null;

	previewImage = [];
	imageFiles = [];
	videoFiles = [];
	showGallery = false;
	selectedPreview = [];
	fbPermlink = null;
	fbPermLinkRegex =
		/^(https)?(:\/\/)?((www|m)\.)?facebook.com\/groups\/[a-z|A-Z|0-9|.|_]*\/(permalink|posts)\/[0-9]*[\/]{0,1}$/;
	isFbPermLinkValid = true;
	campaignTasks = [];
	timezoneName = DateTime.guess();
	timeZonePlaceholder = 'TIME ZONE';
	timeZone = DateTime.guess();
	userTimezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timezoneOffsetInMins = new DateTime().utc().getUtcOffset(this.timeZone);
	timeZoneList;
	selectedGroupState = '';
	markAsCompleteModal: boolean = false;

	@Input() campaignTaskViewDetails: any = [];
	@Input() numberOfMissings;
	@Input() taskName;
	@Input() isCsAdmin;
	@Output() closeTaskDetailsView = new EventEmitter();
	@Output() isTaskCreated = new EventEmitter();
	@Output() closeAddNewTask = new EventEmitter();
	@Output() finalTaskDetailsForProposal = new EventEmitter();
	@Output() updateSelectedCommunitiesStatus = new EventEmitter();
	@Input() isCMCEdition = false;
	@Input() isFromBrand = false;
	@Input() campaign;
	@Input() brand;
	@Input() startDate;
	@Input() endDate;
	@Input() defaultTitle;
	@Input() defaultPeriod;
	@Input() defaultTaskDate;
	@Input() defaultTimezoneName;
	@Input() defaultPublishTime;
	@Input() selectedCommunitiesFromApi;
	@Input() communityManagers;

	selectedCommunitiesIDFromApi;
	isTaskFromDraft = false;
	selectedCommunityForDraftTask;
	communitiesForDraftTask;
	taskCommunitiesWithAcceptanceStatusDeclined;
	deletedTaskCommunitiesId;
	campaignTaskViewDetailsCommunities;
	sectionName;
	interval;
	searchText;
	updatedSearchValue: Subject<string> = new Subject();
	searchInputText = '';
	errorMessages = {
		isImageAndVideoEnabled:
			'Can not publish image and video together in a post due to Facebook API limitation. Please rectify to save task.',
		isImagesMoreThanSixEnabled:
			'Can not publish more than 6 images in a post due to Facebook API limitation. Please rectify to save task.',
		isMultiVideosEnabled:
			'Can not publish multiple videos in a post due to Facebook API limitation. Please rectify to save task.',
		isPostMessageValid:
			'Maximum post text size is 63206 characters due to Facebook API limitation. Please rectify to save task.'
	};
	selectedErrormessageType = null;
	taskRowToBeToggled;
	campaignGroupsAndTasks: CampaignGroupsModel[] = [];
	numberOfTasks;

	@Input() set selectedCommunities(value) {
		this.groupDetails = value.filter(
			group => group.acceptanceStatusByCommunityAdmin !== CampaignAcceptanceStatusEnum.Declined
		);
	}

	@Input() set selectedSection(value) {
		this.setCampaignTasks();
		this.sectionName = value;
	}

	constructor(
		injector: Injector,
		private createCampaignService: CreateCampaignService,
		private campaignService: CampaignService,
		private readonly fileService: FileService,
		private alertService: AlertService,
		private utilityService: UtilityService,
		private _lightboxConfig: LightboxConfig,
		private readonly lightbox: Lightbox
	) {
		super(injector);
	}

	get isCampaignNew() {
		const date = new DateTime('04 10 2021', 'DD MM YYYY');
		const campaignCreationDate = new DateTime(new DateTime(this.campaign?.createdAtUTC).dayJsObj, 'DD MM YYYY');
		return date.diff(campaignCreationDate.dayJsObj, 'days') < 0;
	}

	async ngOnInit() {
		this.getCampaignGroupsAndTaskDetails();
		this.setCampaignTaskDetails();
		this.subscribeToSearchTextChanges();
		this.subscribeToCampaignGroups();
	}

	getCampaignGroupsAndTaskDetails() {
		this.campaignGroupsAndTasks = this.selectedCommunitiesFromApi;
		this.campaignGroupsAndTasks.forEach((task, index) => {
			this.campaignGroupsAndTasks[index]['toShow'] = true;
		});
		this.numberOfTasks = this.campaignGroupsAndTasks.filter(task => task.taskId)?.length;
	}

	subscribeToCampaignGroups() {
		this.subscriptionsToDestroy.push(
			this.campaignService.onUpdateCampaignGroups.subscribe(group => {
				if (!group) {
					return;
				}
				this.campaignGroupsAndTasks.forEach(community => {
					if (
						group.groupId === community.groupId &&
						group.groupTaskStatus &&
						group.campaignId === this.campaign.campaignId
					) {
						community.groupTaskStatus = group.groupTaskStatus;
					}
				});
			})
		);
	}

	setCampaignTasks() {
		this.interval = setInterval(async () => {
			const taskSection = document.getElementById('task-section');
			if (!taskSection) {
				clearInterval(this.interval);
				return;
			}
			this.campaign.resetCampaignTasksData();
			this.setCampaignTaskDetails();
			this.subscribeToSearchTextChanges();
		}, 100000);
	}

	applyFilters() {
		const selectedTypeFilter = this.typeFilters[0].list.filter(item => item.isSelected);
		const selectedStatusFilter = this.statusFilters[0].list.filter(item => item.isSelected);
		let campaignSelectedTasks = [];
		this.campaignGroupsAndTasks?.forEach((campaignTask, index) => {
			if (selectedTypeFilter.map(filter => filter.name).includes('Image')) {
				if (
					!campaignTask['postType'] ||
					((selectedTypeFilter.map(filter => filter.name).includes(campaignTask['postType']) ||
						campaignTask['postType'] === 'Album' ||
						campaignTask['postType'] === 'Photo') &&
						selectedStatusFilter.map(filter => filter.name).includes(campaignTask['groupTaskStatus']))
				) {
					if (selectedStatusFilter.map(filter => filter.name)[0] !== null && !campaignTask['groupTaskStatus']) {
						this.campaignGroupsAndTasks[index]['toShow'] = false;
					} else {
						this.campaignGroupsAndTasks[index]['toShow'] = true;
					}
				} else {
					this.campaignGroupsAndTasks[index]['toShow'] = false;
				}
			} else {
				if (
					!campaignTask['postType'] ||
					(selectedTypeFilter.map(filter => filter.name).includes(campaignTask['postType']) &&
						selectedStatusFilter.map(filter => filter.name).includes(campaignTask['groupTaskStatus']))
				) {
					if (selectedStatusFilter.map(filter => filter.name)[0] !== null && !campaignTask['groupTaskStatus']) {
						this.campaignGroupsAndTasks[index]['toShow'] = false;
					} else {
						this.campaignGroupsAndTasks[index]['toShow'] = true;
					}
				} else {
					this.campaignGroupsAndTasks[index]['toShow'] = false;
				}
			}
		});
		this.campaignGroupsAndTasks = _.orderBy(
			this.campaignGroupsAndTasks,
			[
				task =>
					new DateTime(
						new DateTime(task['toBePerformedByUTC']).format('MM/DD/YYYY') + ', ' + task['toBePerformedByUTC'],
						'MM/DD/YYYY, hh:mm A'
					)
			],
			['asc']
		);
	}

	showAllFilters() {
		this.statusFilters[0].list.forEach(item => (item.isSelected = true));
		this.typeFilters[0].list.forEach(item => (item.isSelected = true));
		this.applyFilters();
		this.updatedSearchValue.next('');
		this.searchInputText = '';
	}

	setCampaignTaskDetails() {
		this.campaignGroupsAndTasks?.forEach((task, index) => {
			task['No.'] = index + 1;
			if (task['postType']?.toString().includes('ImageOrVideo')) {
				task['imageUrls']?.length > 0 ? (task['postType'] = 'Image') : (task['postType'] = 'Video');
			} else if (task['postType']?.toString() === 'Text') {
				task['postType'] = 'Text';
			} else if (task['postType']?.toString() === 'Live video') {
				task['postType'] = 'LiveVideo';
			} else if (task['postType']?.toString() === 'Multi Video') {
				task['postType'] = 'MultiVideo';
			} else if (task['postType']?.toString() === 'Video + Images') {
				task['postType'] = 'VideoImage';
			}

			// this.validatePostMessageAndAttchedFiles(task);
		});
		this.campaignId = this.campaign?.campaignId;
		this.setTaskPreviewUrls();

		if (this.campaign) {
			this.startDate = this.campaign.startDateAtUTC;
			this.endDate = this.campaign.endDateAtUTC;
		}
	}

	validatePostMessageAndAttchedFiles(task) {
		task['isImageAndVideoEnabled'] = task['imageUrls']?.length > 0 && task['videoUrls']?.length > 0;

		task['isImagesMoreThanSixEnabled'] = !task['isImageAndVideoEnabled'] ? task['imageUrls']?.length > 6 : false;

		task['isMultiVideosEnabled'] =
			!task['isImageAndVideoEnabled'] && !task['isImagesMoreThanSixEnabled'] ? task['videoUrls']?.length > 1 : false;

		task['isPostMessageValid'] =
			!task['isImageAndVideoEnabled'] && !task['isImagesMoreThanSixEnabled'] && !task['isMultiVideosEnabled']
				? task['text']?.length > 63206
				: false;

		if (task['isImageAndVideoEnabled']) {
			task['selectedErrorType'] = this.errorMessages['isImageAndVideoEnabled'];
		} else if (task['isImagesMoreThanSixEnabled']) {
			task['selectedErrorType'] = this.errorMessages['isImagesMoreThanSixEnabled'];
		} else if (task['isMultiVideosEnabled']) {
			task['selectedErrorType'] = this.errorMessages['isMultiVideosEnabled'];
		} else if (task['isPostMessageValid']) {
			task['selectedErrorType'] = this.errorMessages['isPostMessageValid'];
		} else {
			task['selectedErrorType'] = null;
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	closeAddNewTaskPopup() {
		this.isGroupNotInstalled = false;
		this.isDateValid = true;
		this.showAddTask = false;
		this.isDuplicateTask = false;
		this.groupModerators = [];
		this.selectedGroupState = '';
		this.closeAddNewTask.emit(false);
		this.groupDetails = this.selectedCommunitiesFromApi;
	}

	openImageGallery(index: number, previewImage): void {
		this.lightbox.open(previewImage, index, {
			centerVertically: true,
			enableTransition: false,
			resizeDuration: '0'
		});
	}

	close(): void {
		this.lightbox.close();
	}

	openVideoGallery(preview) {
		this.selectedPreview = preview;
		this.showGallery = true;
	}

	closeVideoGallery() {
		this.selectedPreview = null;
		this.showGallery = false;
	}

	toggleMoreInfo(event, task) {
		if (!task['isPlaceholder']) {
			this.taskRowToBeToggled = task['groupId'];
			event.currentTarget.nextElementSibling?.classList.toggle('show');
		}
	}

	postUpdate(event) {
		this.previewImage = event.previewImage;
		this.imageFiles = event.imageFiles;
		this.videoFiles = event.videoFiles;
		const files = this.imageFiles.concat(this.videoFiles);
		this.taskEditForm.get('taskText').setValue(event.postMessage);
		this.taskEditForm.get('imageUrls').setValue(this.imageFiles);
		this.taskEditForm.get('videoUrls').setValue(this.videoFiles);
		this.onPostTypeChange();
		// let taskDetails = this.taskEditForm.getRawValue();
		// this.validatePostMessageAndAttchedFiles(taskDetails);
		// this.selectedErrormessageType = taskDetails['selectedErrorType'];
	}

	onTasksPerPageChange(value) {
		this.numberOfTasksPerPage = value;
		this.startOfTask = 0;
		this.endOfTask = this.numberOfTasksPerPage;
	}

	loadNextTasks() {
		this.startOfTask += this.numberOfTasksPerPage;
		this.endOfTask += this.numberOfTasksPerPage;
	}

	loadPreviousTasks() {
		this.startOfTask -= this.numberOfTasksPerPage;
		this.endOfTask -= this.numberOfTasksPerPage;
	}

	setTaskPreviewUrls() {
		this.campaignGroupsAndTasks?.forEach((task, index) => {
			const taskType = task['imageUrls'] && task['imageUrls']?.length > 0 ? 'image' : 'video';
			task['taskType'] = taskType;
			task['previewImage'] = [];
			if (task['imageUrls'] && !task['taskId'] && task['imageUrls']?.length > 0) {
				task['imageUrls']?.forEach((url, index) => {
					if (typeof url !== 'string') {
						const reader = new FileReader();
						reader.readAsDataURL(url);
						reader.onload = _event => {
							task['previewImage'].push({src: reader.result, type: 'image'});
						};
					} else {
						task['previewImage'].push({src: url, type: 'image'});
					}
				});
			} else if (task['videoUrls'] && !task['taskId'] && task['videoUrls']?.length > 0) {
				task['videoUrls']?.forEach((url, index) => {
					const reader = new FileReader();
					reader.readAsDataURL(url);
					reader.onload = _event => {
						task['previewImage'].push({src: reader.result, type: 'video'});
					};
				});
			} else if (task['imageUrls'] && task['imageUrls']?.length > 0) {
				task['imageUrls']?.forEach(url => {
					task['previewImage'].push({src: url, type: 'image'});
				});
			} else if (task['videoUrls'] && task['videoUrls']?.length > 0) {
				task['videoUrls']?.forEach(url => {
					task['previewImage'].push({src: url, type: 'video'});
				});
			}
		});
	}

	createEditTaskRowDetailsForm(task, rowNumber, isDuplicateTask = false) {
		this.selectedEditableRow = task;
		this.selectedRowNumber = rowNumber;
		this.lastUpdatedIndex = 1;
		this.defaultTaskDate = task.defaultTaskDate;
		const taskType =
			task['postType'] === 'Text' ||
			task['postType'] === 'Video' ||
			task['postType'] === 'Image' ||
			task['postType'] === 'Photo' ||
			task['postType'] === 'Album'
				? task['postType'] === 'Album' || task['postType'] === 'Photo'
					? 'Image'
					: task['postType']
				: null;
		let postType =
			task['postType'] === 'Text' ||
			task['postType'] === 'Video' ||
			task['postType'] === 'Image' ||
			task['postType'] === 'Photo' ||
			task['postType'] === 'Album' ||
			!task['postType']
				? 'Basic'
				: task['postType'];
		if (!task['postType'] && this.campaign?.defaultPostContentType) {
			postType = this.campaign?.defaultPostContentType;
		}
		let date = '';
		let time = '';
		if (task['toBePerformedByUTC']) {
			date = new DateTime(this.displayDateBasedOnTimezone(task['toBePerformedByUTC'], task.timezoneName)).format(
				'MM/DD/YYYY'
			);
			time = new DateTime(this.displayDateBasedOnTimezone(task['toBePerformedByUTC'], task.timezoneName))
				.format('hh:mm a')
				.toString()
				.toUpperCase();
		} else if (task['defaultTaskDate']) {
			date = new DateTime(task['defaultTaskDate']).format('MM/DD/YYYY');
			time = new DateTime(task['defaultTaskDate']).format('hh:mm a').toString().toUpperCase();
		} else if (this.campaign['defaultTaskDate']) {
			date = new DateTime(
				this.displayDateBasedOnTimezone(this.campaign['defaultTaskDate'], this.campaign['timezoneName'])
			).format('MM/DD/YYYY');
			time = new DateTime(
				this.displayDateBasedOnTimezone(this.campaign['defaultTaskDate'], this.campaign['timezoneName'])
			)
				.format('hh:mm a')
				.toString()
				.toUpperCase();
		} else {
			date = '';
			time = '';
		}
		this.publishTime = time;
		let timezoneName;
		if (task['timezoneName']) {
			timezoneName = task['timezoneName'];
		} else {
			timezoneName = this.campaign['timezoneName'];
		}
		const defaultTaskTitle = task['title']
			? task['title']
			: this.campaign
			? this.campaign['taskTitle']
			: this.defaultTitle;
		const defaultPeriod = task['period']
			? task['period']
			: this.campaign
			? this.campaign['campaignPeriod']
			: this.defaultPeriod;
		const groupForm = {
			groupId: new FormControl(task['groupId'], [Validators.required]),
			groupName: new FormControl(task['groupName'], [Validators.required]),
			groupAdmin: new FormControl(task['communityAdminName'], [Validators.required]),
			title: new FormControl(defaultTaskTitle, [Validators.required]),
			period: new FormControl(defaultPeriod, [Validators.required]),
			startDate: new FormControl(date, [Validators.required]),
			taskText: new FormControl(task['text']),
			timezoneName: new FormControl(timezoneName),
			postType: new FormControl(postType),
			taskType: new FormControl(taskType),
			role: new FormControl(),
			userId: new FormControl(task['communityAdminId']),
			imageUrls: new FormControl(task['imageUrls']),
			videoUrls: new FormControl(task['videoUrls'])
		};
		this.previewImage = [];
		this.imageFiles = [];
		this.videoFiles = [];
		const self = this;
		// this.selectedErrormessageType = this.selectedEditableRow['selectedErrorType'];

		this.selectedGroup = task['groupName'];
		if (task['imageUrls'] && !task['taskId'] && task['imageUrls']?.length > 0) {
			this.imageFiles = task['imageUrls'];
			task['imageUrls']?.forEach((url, index) => {
				if (typeof url !== 'string') {
					const reader = new FileReader();
					reader.readAsDataURL(url);
					reader.onload = _event => {
						self.previewImage.push({src: reader.result, type: 'image'});
					};
				} else {
					let fileType = taskType?.toLowerCase();
					this.previewImage.push({src: url, type: 'image'});
				}
			});
		} else if (task['videoUrls'] && !task['taskId'] && task['videoUrls']?.length > 0) {
			task['videoUrls']?.forEach((url, index) => {
				this.videoFiles.push(url);
				const reader = new FileReader();
				reader.readAsDataURL(url);
				reader.onload = _event => {
					self.previewImage.push({src: reader.result, type: 'video'});
				};
			});
		} else if (
			(task['imageUrls'] && task['imageUrls']?.length > 0) ||
			(task['videoUrls'] && task['videoUrls']?.length > 0)
		) {
			task['imageUrls']?.forEach(url => {
				let fileType = taskType?.toLowerCase();
				this.previewImage.push({src: url, type: fileType});
				this.imageFiles.push(url);
			});
			task['videoUrls']?.forEach(url => {
				let fileType = taskType?.toLowerCase();
				this.previewImage.push({src: url, type: fileType});
				this.videoFiles.push(url);
			});
		}

		this.taskEditForm = new FormGroup(groupForm);
		this.subscriptionsToDestroy.push(
			this.taskEditForm.get('startDate').valueChanges.subscribe(data => {
				this.validatePublishTime(this.publishTime);
			})
		);

		if (this.campaign) {
			if (task['timezoneName']) {
				this.timezoneName = task['timezoneName'];
			} else if (task['toBePerformedByUTC']) {
				this.timezoneName = DateTime.guess();
			} else if (this.campaign['timezoneName']) {
				this.timezoneName = this.campaign['timezoneName'];
			} else if (this.defaultTimezoneName) {
				this.timezoneName = this.defaultTimezoneName;
			}
		}

		this.onPostTypeChange();
		this.pushTimezoneNames();
		this.validatePublishTime(this.publishTime);
	}

	async downloadSheet(type) {
		if (type === 'Export .xlsx') {
			let campaignDetails = [];
			const campaignTasks = this.campaignGroupsAndTasks.filter(task => task.taskId);
			campaignTasks?.forEach(task => {
				const taskDet = {};
				this.campaignTaskColumnNames?.forEach(column => {
					if (task['imageUrls'] && task['imageUrls']?.length > 0 && column === 'imageUrls') {
						taskDet['Image Urls'] = task['imageUrls'].join(';');
					} else if (task['videoUrls'] && task['videoUrls']?.length > 0 && column === 'videoUrls') {
						taskDet['Video Urls'] = task['videoUrls'].join(';');
					} else if (task['fbPermlink'] && column === 'fbPermlink' && task['status'] === 'Completed') {
						taskDet['FB Post Link'] = task['fbPermlink'];
					} else {
						taskDet[column] = task[column];
					}
				});
				campaignDetails.push(taskDet);
			});
			campaignDetails = campaignDetails.map(({imageUrls, videoUrls, ...rest}) => ({...rest}));
			const worksheet = utils.json_to_sheet(campaignDetails);
			const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
			writeFile(workbook, this.campaign.campaignName + '_' + new DateTime().format('YYYY-MM-DD') + '.xlsx');
		} else if (type === 'Export media') {
			const result = await this.campaignService.getCampaignMedia(this.campaignId);
			var link = document.createElement('a');
			document.body.appendChild(link);
			link.setAttribute('type', 'hidden');
			if (result.isBase64Encoded) {
				link.href = 'data:text/plain;base64,' + result.body;
				link.download = this.campaign.campaignName + '_' + new DateTime().format('YYYY-MM-DD') + '.zip';
			} else {
				link.href = result.body;
				link.setAttribute('download', '');
			}
			link.click();
			document.body.removeChild(link);
		}
	}

	onPostTypeChange() {
		if (this.taskEditForm.get('postType').value !== 'Basic') {
			this.isTaskTypeValid = true;
		} else {
			const taskType =
				this.taskEditForm.get('imageUrls').value && this.taskEditForm.get('imageUrls').value?.length > 0
					? 'Image'
					: this.taskEditForm.get('videoUrls').value && this.taskEditForm.get('videoUrls').value?.length > 0
					? 'Video'
					: 'Text';
			const url =
				taskType === 'Image'
					? this.taskEditForm.get('imageUrls').value
					: taskType === 'Video'
					? this.taskEditForm.get('videoUrls').value
					: [];
			this.taskEditForm.get('taskType').setValue(taskType);
			if (taskType === 'Image' && (!url || (url && url.length === 0))) {
				this.isTaskTypeValid = false;
			} else if (taskType === 'Video' && (!url || (url && url.length === 0))) {
				this.isTaskTypeValid = false;
			} else if (taskType === 'Text' && !this.taskEditForm.get('taskText').value) {
				this.isTaskTypeValid = false;
			} else {
				this.isTaskTypeValid = true;
			}
		}
	}

	selectModerator(moderator) {
		this.taskEditForm.get('groupAdmin').setValue(moderator.fullname);
		this.taskEditForm.get('role').setValue(moderator.role);
		this.taskEditForm.get('userId').setValue(moderator.id);
	}

	getTaskType() {
		const postType = this.taskEditForm.get('postType').value;
		if (postType !== 'Basic') {
			return postType;
		} else if (this.taskEditForm.get('imageUrls').value?.length > 0) {
			return 'Image';
		} else if (this.taskEditForm.get('videoUrls').value?.length > 0) {
			return 'Video';
		} else {
			return 'Text';
		}
	}

	async sendCampaignTaskDetails(task, campaignId, rowNumber) {
		const calls = [];
		const campaignTask = [];
		const taskInfo = await this.createInputData(task, campaignId);
		campaignTask.push(taskInfo);
		calls.push(this.createCampaignService.createCampaignTask(campaignTask, this.campaign?.brandId));
		try {
			const taskDetails = await Promise.all(calls);
			this.campaignGroupsAndTasks[rowNumber]['taskId'] = taskDetails[0]['taskId'];
			Object.assign(this.campaignGroupsAndTasks[rowNumber], taskInfo);
			this.closeAddNewTaskPopup();
			this.showAddTask = false;
			this.isDuplicateTask = false;
			this.isSubmitting = false;
		} catch (e) {
			this.isSubmitting = false;
		}
		this.isTaskCreated.emit(true);
	}

	async createInputData(task, campaignId) {
		const taskInfo = {};
		taskInfo['campaignId'] = campaignId;
		taskInfo['userId'] = task['USER ID'];
		taskInfo['userName'] = task['GROUP ADMIN/MODERATOR'];
		taskInfo['groupId'] = task['GROUP ID'];
		taskInfo['groupName'] = task['GROUP NAME'];
		taskInfo['title'] = task['TITLE'];
		taskInfo['toBePerformedByUTC'] = this.campaignGroupsAndTasks[this.selectedRowNumber]['defaultTaskDate'];
		taskInfo['type'] = 'Post';
		taskInfo['period'] = task['PERIOD'];
		if (
			task['POST TYPE'] === PostContentTypeEnum.LiveVideo ||
			task['POST TYPE'] === PostContentTypeEnum.MultiVideo ||
			task['POST TYPE'] === PostContentTypeEnum.VideoImage
		) {
			taskInfo['text'] = '';
			taskInfo['imageUrls'] = [];
			taskInfo['videoUrls'] = [];
			taskInfo['isPlaceholder'] = true;
		} else {
			taskInfo['text'] = task['TEXT'];
			const processedFileURLs = await Promise.all([
				this.processFilesForUrls('image', task['imageUrls']),
				this.processFilesForUrls('video', task['videoUrls'])
			]);
			taskInfo['imageUrls'] = processedFileURLs[0];
			taskInfo['videoUrls'] = processedFileURLs[1];
			taskInfo['isPlaceholder'] = false;
		}
		taskInfo['postType'] = this.getPostType(taskInfo, task['POST TYPE']);
		taskInfo['timezoneName'] = task['timezoneName'];
		return taskInfo;
	}

	async editTaskRowDetails() {
		this.selectedGroupState = '';
		if (this.taskEditForm.valid) {
			this.isSubmitting = true;
			const selectedTask = this.campaignGroupsAndTasks[this.selectedRowNumber];
			const files = this.imageFiles.concat(this.videoFiles);
			if (this.showAddTask) {
				this.campaignGroupsAndTasks[this.selectedRowNumber]['No.'] = this.selectedRowNumber + 1;
			}
			this.campaignGroupsAndTasks[this.selectedRowNumber]['GROUP ID'] = this.taskEditForm.get('groupId').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['GROUP NAME'] = this.taskEditForm.get('groupName').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['GROUP ADMIN/MODERATOR'] =
				this.taskEditForm.get('groupAdmin').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['USER ID'] = this.taskEditForm.get('userId').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['POST TYPE'] = this.getTaskType();
			this.campaignGroupsAndTasks[this.selectedRowNumber]['TITLE'] = this.taskEditForm.get('title').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['PERIOD'] = this.taskEditForm.get('period').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['TEXT'] = this.taskEditForm.get('taskText').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['URL'] = files;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['imageUrls'] = this.taskEditForm.get('imageUrls').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['videoUrls'] = this.taskEditForm.get('videoUrls').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['TIME'] = this.publishTime;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['DATE'] = this.taskEditForm.get('startDate').value;
			this.campaignGroupsAndTasks[this.selectedRowNumber]['timezoneOffsetInMins'] =
				this.userTimezoneOffsetInMins - this.timezoneOffsetInMins;
			if (this.taskEditForm.get('startDate').value) {
				this.campaignGroupsAndTasks[this.selectedRowNumber]['defaultTaskDate'] = new DateTime(
					new DateTime(this.taskEditForm.get('startDate').value).format('MM/DD/YYYY') + ', ' + this.publishTime,
					'MM/DD/YYYY, hh:mm A'
				)
					.add(this.campaignGroupsAndTasks[this.selectedRowNumber]['timezoneOffsetInMins'], 'minutes')
					.utc()
					.toISOString();
				this.campaignGroupsAndTasks[this.selectedRowNumber]['timezoneName'] =
					this.taskEditForm.get('timezoneName').value;
			}
			this.timezoneName = DateTime.guess();
			if (!this.campaignGroupsAndTasks[this.selectedRowNumber].taskId) {
				if (this.isCMCEdition) {
					await this.sendCampaignTaskDetails(
						this.campaignGroupsAndTasks[this.selectedRowNumber],
						this.campaign.campaignId,
						this.selectedRowNumber
					);
					this.setTaskPreviewUrls();
					this.alertService.success(
						'Check campaign task list for selected campaign',
						'Campaign task added successfully',
						5000,
						true
					);
				} else {
					this.isSubmitting = false;
					this.setTaskPreviewUrls();
					this.closeAddNewTaskPopup();
				}
			} else {
				if (this.isCMCEdition) {
					this.updateCampaignTaskDetails(
						this.campaignGroupsAndTasks[this.selectedRowNumber],
						this.campaignId,
						selectedTask,
						this.selectedRowNumber
					);
				} else {
					this.campaignGroupsAndTasks[this.selectedRowNumber]['isTaskEdited'] = true;
					this.isSubmitting = false;
					this.setTaskPreviewUrls();
				}
			}
			document.getElementById('closeEditDetailsId').click();
		}
		this.groupDetails = this.selectedCommunitiesFromApi;
		const input = {
			campaignId: this.campaign.campaignId,
			groupId: this.campaignGroupsAndTasks[this.selectedRowNumber]['GROUP ID'],
			groupTaskStatus:
				this.campaign.status && this.campaign.status !== 'Draft' && this.campaign.status !== 'PendingApproval'
					? CampaignCommunityStatusEnum.TaskRequestSent
					: CampaignCommunityStatusEnum.TaskCreated
		};
		await this.campaignService.updateCMCampaignGroup(input);
		this.campaignGroupsAndTasks[this.selectedRowNumber]['groupTaskStatus'] = input.groupTaskStatus;
		this.campaignGroupsAndTasks[this.selectedRowNumber]['toShow'] = true;
		this.updateSelectedCommunitiesStatus.emit({groupId: input.groupId, groupTaskStatus: input.groupTaskStatus});
	}

	async updateCampaignTaskDetails(
		task,
		campaignId,
		selectedTask,
		selectedRowNumber,
		isShellTask = false,
		isMarkAsCompleteFlow = false
	) {
		const calls = [];
		const taskInfo = {};
		taskInfo['taskId'] = task['taskId'];
		taskInfo['campaignId'] = campaignId;
		taskInfo['userId'] = task['USER ID'];
		taskInfo['userName'] = task['GROUP ADMIN/MODERATOR'];
		taskInfo['groupId'] = task['GROUP ID'] ? task['GROUP ID'] : task['groupId'];
		taskInfo['groupName'] = task['GROUP NAME'];
		taskInfo['title'] = task['TITLE'];
		taskInfo['period'] = task['PERIOD'];
		if (!isMarkAsCompleteFlow) {
			taskInfo['toBePerformedByUTC'] = this.campaignGroupsAndTasks[this.selectedRowNumber]['defaultTaskDate'];
		}
		taskInfo['status'] = isShellTask ? TaskStatusEnum.Completed : task['STATUS'];
		task['STATUS'] = taskInfo['status'];
		if (
			task['POST TYPE'] === PostContentTypeEnum.LiveVideo ||
			task['POST TYPE'] === PostContentTypeEnum.MultiVideo ||
			task['POST TYPE'] === PostContentTypeEnum.VideoImage
		) {
			taskInfo['text'] = '';
			taskInfo['imageUrls'] = [];
			taskInfo['videoUrls'] = [];
			taskInfo['isPlaceholder'] = true;
			task['TEXT'] = '';
			task['imageUrls'] = [];
			task['videoUrls'] = [];
			task['isPlaceholder'] = true;
		} else {
			taskInfo['text'] = task['TEXT'];
			const processedFileURLs = await Promise.all([
				this.processFilesForUrls('image', task['imageUrls']),
				this.processFilesForUrls('video', task['videoUrls'])
			]);
			taskInfo['imageUrls'] = processedFileURLs[0];
			taskInfo['videoUrls'] = processedFileURLs[1];
			taskInfo['isPlaceholder'] = false;
			task['isPlaceholder'] = false;
		}
		taskInfo['postType'] = this.getPostType(taskInfo, task['POST TYPE']);
		taskInfo['fbPermlink'] = task['fbPermlink'];
		taskInfo['timezoneName'] = task['timezoneName'];
		try {
			const details = await this.createCampaignService.updateCampaignTaskDetails(taskInfo);
			this.setTaskPreviewUrls();
			this.closeAddNewTaskPopup();
			this.isSubmitting = false;
			Object.assign(this.campaignGroupsAndTasks[selectedRowNumber], taskInfo);
			this.alertService.success(
				'Check campaign task list for selected campaign',
				'Campaign task updated successfully',
				5000,
				true
			);
		} catch (e) {
			console.log('updateCampaignTaskDetails error', e);
			this.campaignGroupsAndTasks[selectedRowNumber] = selectedTask;
			this.isSubmitting = false;
			this.alertService.error(
				'Campaign task update unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
		}
	}

	private async processFilesForUrls(type: 'image' | 'video', files: any) {
		const requestsForProcessingFileURLs = [];

		for (let i = 0; i < files?.length; i++) {
			const data = ({}[type + 'File'] = files[i]);

			if (typeof files[i] !== 'string') {
				this.logger.debug(
					'Uploading' + type + ' file data to s3',
					data,
					'CommunityMarketingCampaignTasksComponent',
					'processFilesForUrls'
				);
				requestsForProcessingFileURLs.push(this.fileService.uploadToS3(files[i], 'image', this.randomUuid()));
			} else {
				requestsForProcessingFileURLs.push(new Promise(resolve => resolve(files[i])));
			}
		}

		return await Promise.all(requestsForProcessingFileURLs);
	}

	getPostType(task: any, postType: string) {
		if (postType === 'Image') {
			return task['imageUrls']?.length > 1 ? PostContentTypeEnum.Album : PostContentTypeEnum.Photo;
		} else {
			return postType;
		}
	}

	onFbPermLinkUpdate() {
		if (this.fbPermlink?.match(this.fbPermLinkRegex)) {
			this.isFbPermLinkValid = true;
		} else {
			this.isFbPermLinkValid = false;
			document.getElementById('cancel').click();
			this.isSubmitting = false;
			this.markAsCompleteModal = false;
			return;
		}

		this.isSubmitting = true;
		const selectedTask = this.campaignGroupsAndTasks[this.selectedRowNumber];
		this.campaignGroupsAndTasks[this.selectedRowNumber]['fbPermlink'] = this.fbPermlink;
		this.campaignGroupsAndTasks[this.selectedRowNumber]['toBePerformedByUTC'] = selectedTask['toBePerformedByUTC'][
			'_dateTime'
		]
			? selectedTask['toBePerformedByUTC']['_dateTime']
			: selectedTask['toBePerformedByUTC'];
		this.updateCampaignTaskDetails(
			this.campaignGroupsAndTasks[this.selectedRowNumber],
			this.campaignId,
			selectedTask,
			this.selectedRowNumber,
			true,
			true
		);

		const input = {
			campaignId: this.campaign.campaignId,
			groupId: this.campaignGroupsAndTasks[this.selectedRowNumber]['groupId'],
			groupTaskStatus: CampaignCommunityStatusEnum.TaskCompleted
		};
		this.campaignService.updateCMCampaignGroup(input);
		this.campaignService.markCampaignTaskDone(selectedTask.campaignId, selectedTask.groupId);
		document.getElementById('cancel').click();
		this.isSubmitting = false;
		this.markAsCompleteModal = false;
		this.updateSelectedCommunitiesStatus.emit({groupId: input.groupId, groupTaskStatus: input.groupTaskStatus});
	}

	validatePublishTime(time) {
		const date = this.taskEditForm.get('startDate').value;
		const startDate = new DateTime(this.startDate);
		const endDate = new DateTime(this.endDate);
		const todayDate = new DateTime();

		if (date && time) {
			const dateTimeOfTask = new DateTime(new DateTime(date).format('MM/DD/YYYY') + ', ' + time);
			this.isDateValid =
				dateTimeOfTask.diff(startDate.dayJsObj, 'minutes') >= 0 &&
				dateTimeOfTask.diff(todayDate.dayJsObj, 'minutes') >= 0 &&
				endDate.diff(dateTimeOfTask.dayJsObj, 'minutes') >= 0;
		} else if (date) {
			const dateTimeOfTask = new DateTime(date);
			this.isDateValid =
				dateTimeOfTask.diff(startDate.dayJsObj, 'minutes') >= 0 &&
				dateTimeOfTask.diff(todayDate.dayJsObj, 'minutes') >= 0 &&
				endDate.diff(dateTimeOfTask.dayJsObj, 'minutes') >= 0;
		}
	}

	onSearchChange(searchValue) {
		this.updatedSearchValue.next(searchValue.value);
	}

	subscribeToSearchTextChanges() {
		const debouncedSearchText = this.updatedSearchValue.pipe(debounceTime(1000));
		this.subscriptionsToDestroy.push(
			debouncedSearchText.subscribe(searchValue => {
				this.searchText = searchValue;
				if (searchValue !== '' && searchValue) {
					this.searchText = searchValue.toLowerCase();
					this.startOfTask = 0;
					this.endOfTask = this.selectedCommunitiesFromApi?.length;
					this.statusFilters[0].list.forEach(item => (item.isSelected = true));
					this.typeFilters[0].list.forEach(item => (item.isSelected = true));
					this.applyFilters();
				}
			})
		);
	}

	async pushTimezoneNames() {
		const momentScriptLoad = await this.utilityService.insertMomentTimeZoneScript();
		if (!momentScriptLoad) {
			return;
		}

		this.timeZoneList = this.utilityService.pushTimezoneNames();
		const timeZone = this.timeZoneList.find(zone => zone.indexOf(this.timezoneName) > -1);
		this.timeZone = timeZone ? timeZone : this.timeZone;
		this.optionSelected(this.timeZone);
	}

	displayDateBasedOnTimezone(dateTimeString, timezone = this.timeZone) {
		if (dateTimeString) {
			const timezoneOffsetInMins = new DateTime().utc().getUtcOffset(timezone);
			return new DateTime(dateTimeString)
				.add(timezoneOffsetInMins - this.userTimezoneOffsetInMins, 'minutes')
				.toISOString();
		}
	}

	async optionSelected(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		this.timezoneName = timezoneInfo.timezoneName;
		this.timezoneOffsetInMins = timezoneInfo.timezoneOffsetInMins;
	}

	handleMarkAsCompleteClick(event: any, fbPermlink: any, index, startOfTask) {
		this.selectedRowNumber = index + startOfTask;
		this.fbPermlink = fbPermlink;
		this.markAsCompleteModal = true;
		event.stopPropagation();
	}

	async handleDeleteTaskClick(event, task) {
		event.stopPropagation();
		const response = await this.campaignService.markDeleteCampaignTask(task.campaignId, task.groupId);

		if (response && response.status === 'Ok') {
			this.alert.success('Campaign task successfully deleted', '');
		} else {
			this.alert.error('Error while deleting campaign task', '');
		}
	}

	async handleBrandApprove(event, task) {
		event.stopPropagation();
		const response = await this.campaignService.brandApproveCampaign(task.campaignId, task.groupId);

		if (response && response.status === 'Ok') {
			this.alert.success('Brand campaign successfully approved', '');
		} else {
			this.alert.error('Error while approving brand campaign', '');
		}
	}
}
