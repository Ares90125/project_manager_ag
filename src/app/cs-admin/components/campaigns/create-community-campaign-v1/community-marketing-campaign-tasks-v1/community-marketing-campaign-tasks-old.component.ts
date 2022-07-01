import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {PostContentTypeEnum} from '@groupAdminModule/models/facebook-post.model';
import {AlertService} from '@sharedModule/services/alert.service';
import {read, utils, writeFile} from 'xlsx';
import {BaseComponent} from '@sharedModule/components/base.component';
import {Group, TaskStatusEnum} from '@sharedModule/models/graph-ql.model';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {FileService} from '@sharedModule/services/file.service';
import {Lightbox, LightboxConfig} from 'ngx-lightbox';
import {Role} from '@sharedModule/enums/role.enum';
import * as _ from 'lodash';
import {DateTime} from '@sharedModule/models/date-time';
import {UtilityService} from '@sharedModule/services/utility.service';

@Component({
	selector: 'app-community-marketing-campaign-tasks-old',
	templateUrl: './community-marketing-campaign-tasks-old.component.html',
	styleUrls: ['./community-marketing-campaign-tasks-old.component.scss']
})
export class CommunityMarketingCampaignTasksOldComponent extends BaseComponent implements OnInit, OnDestroy {
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
		'GROUP ID',
		'GROUP NAME',
		'GROUP ADMIN/MODERATOR',
		'POST TYPE',
		'PERIOD',
		'TITLE',
		'TEXT',
		'DATE',
		'TIME',
		'videoUrls',
		'imageUrls',
		'fbPermlink'
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

	groupDetails: Group[];
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

	@Input() campaignTaskViewDetails: any = [];
	@Input() numberOfMissings;
	@Input() taskName;
	@Input() isCsAdmin;
	@Output() closeTaskDetailsView = new EventEmitter();
	@Output() closeAddNewTask = new EventEmitter();
	@Input() isCMCEdition = false;
	@Input() isFromBrand = false;
	@Input() campaign;
	@Input() startDate;
	@Input() endDate;
	@Input() defaultTitle;
	@Input() defaultPeriod;
	@Input() defaultTaskDate;
	@Input() defaultTimezoneName;
	@Input() defaultPublishTime;

	constructor(
		injector: Injector,
		private createCampaignService: CreateCampaignService,
		private readonly fileService: FileService,
		private alertService: AlertService,
		private utilityService: UtilityService,
		private _lightboxConfig: LightboxConfig,
		private readonly lightbox: Lightbox
	) {
		super(injector);
	}

	get addNewTask() {
		return this.showAddTask;
	}

	@Input()
	set addNewTask(shouldShow: boolean) {
		this.showAddTask = shouldShow;
		this.isDuplicateTask = false;
		if (this.showAddTask) {
			this.createEditTaskRowDetailsForm({}, this.campaignTaskViewDetails.length);
			document.getElementById('openAddTaskModal').click();
		}
	}

	@Input()
	set updatedTaskDetails(details) {
		this.campaignTasks = details;
		this.applyFilters(false);
		this.setCampaignTaskDetails();
	}

	ngOnInit() {
		this.setCampaignTaskDetails();
	}

	applyFilters(isFromFilters) {
		const selectedTypeFilter = this.typeFilters[0].list.filter(item => item.isSelected);
		const selectedStatusFilter = this.statusFilters[0].list.filter(item => item.isSelected);
		this.campaignTaskViewDetails = [];
		let campaignSelectedTasks = [];
		selectedTypeFilter.forEach(item => {
			let tasks = [];
			if (item.name === 'Image') {
				tasks = this.campaignTasks.filter(task => task['POST TYPE'] === item.name || task['POST TYPE'] === 'Album');
			} else {
				tasks = this.campaignTasks.filter(task => task['POST TYPE'] === item.name);
			}
			campaignSelectedTasks = campaignSelectedTasks.concat(tasks);
		});

		selectedStatusFilter.forEach(item => {
			const tasks = campaignSelectedTasks.filter(task => task['STATUS'] === item.name);
			this.campaignTaskViewDetails = this.campaignTaskViewDetails.concat(tasks);
		});

		this.campaignTaskViewDetails = _.orderBy(
			this.campaignTaskViewDetails,
			[
				task =>
					new DateTime(new DateTime(task['DATE']).format('MM/DD/YYYY') + ', ' + task['TIME'], 'MM/DD/YYYY, hh:mm A')
			],
			['asc']
		);
		if (isFromFilters || this.campaignTaskViewDetails.length < this.startOfTask) {
			this.startOfTask = 0;
			this.endOfTask = this.numberOfTasksPerPage;
		}
	}

	showAllFilters() {
		this.statusFilters[0].list.forEach(item => (item.isSelected = true));
		this.typeFilters[0].list.forEach(item => (item.isSelected = true));
		this.applyFilters(true);
	}

	setCampaignTaskDetails() {
		this.campaignTaskViewDetails.forEach((task, index) => {
			task['No.'] = index + 1;
			if (task['POST TYPE'].toString().toLowerCase() === 'album') {
				task['POST TYPE'] = 'Image';
			}
		});
		this.campaignId = this.campaign?.campaignId;
		this.setTaskPreviewUrls();
		if (this.isCsAdmin) {
			this.timeOptions = this.createCampaignService.getTimesOnWhichPostCanBePublished();
			this.numberOfMissings = this.createCampaignService.validatingMissingDetails(this.campaignTaskViewDetails);
		}

		if (this.campaign) {
			this.startDate = this.campaign.startDateAtUTC;
			this.endDate = this.campaign.endDateAtUTC;
		}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	closeDetailsView() {
		this.closeTaskDetailsView.emit(this.campaignTaskViewDetails);
	}

	closeAddNewTaskPopup() {
		this.isGroupNotInstalled = false;
		this.isDateValid = true;
		this.showAddTask = false;
		this.isDuplicateTask = false;
		this.groupModerators = [];
		this.closeAddNewTask.emit(false);
	}

	async pushTimezoneNames() {
		const momentScriptLoad = await this.utilityService.insertMomentTimeZoneScript();
		if (!momentScriptLoad) {
			return;
		}

		this.timeZoneList = this.utilityService.pushTimezoneNames();
		const timeZone = this.timeZoneList.find(zone => zone.indexOf(this.timezoneName) > -1);
		this.timeZone = timeZone ? timeZone : this.timeZone;
		this.optionSelected(timeZone);
	}

	async optionSelected(event: string) {
		const timezoneInfo = await this.utilityService.optionSelected(event);
		this.timezoneName = timezoneInfo.timezoneName;
		this.timezoneOffsetInMins = timezoneInfo.timezoneOffsetInMins;
	}

	async setDefaultDate(campaignInfo) {
		const timezoneName = campaignInfo?.['timezoneName'] ? campaignInfo['timezoneName'] : DateTime.guess();
		const defaultTaskDate = this.utilityService.setDefaultDate(
			timezoneName,
			campaignInfo['defaultTaskDate'],
			this.userTimezoneOffsetInMins
		);

		campaignInfo['publishTime'] = defaultTaskDate.publishTime ? defaultTaskDate.publishTime : this.publishTime;

		campaignInfo['date'] = defaultTaskDate.date;
	}

	setTaskPreviewUrls() {
		this.campaignTaskViewDetails.forEach((task, index) => {
			const taskType = task['imageUrls'] && task['imageUrls'].length > 0 ? 'image' : 'video';
			task['taskType'] = taskType;
			task['previewImage'] = [];
			if (task['imageUrls'] && !task['taskId'] && task['imageUrls'].length > 0) {
				task['imageUrls'].forEach((url, index) => {
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
			} else if (task['videoUrls'] && !task['taskId'] && task['videoUrls'].length > 0) {
				task['videoUrls'].forEach((url, index) => {
					const reader = new FileReader();
					reader.readAsDataURL(url);
					reader.onload = _event => {
						task['previewImage'].push({src: reader.result, type: 'video'});
					};
				});
			} else if (task['imageUrls'] && task['imageUrls'].length > 0) {
				task['imageUrls'].forEach(url => {
					task['previewImage'].push({src: url, type: 'image'});
				});
			} else if (task['videoUrls'] && task['videoUrls'].length > 0) {
				task['videoUrls'].forEach(url => {
					task['previewImage'].push({src: url, type: 'video'});
				});
			}
		});
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
			event.currentTarget.nextElementSibling.classList.toggle('show');
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

	filterChanged(event) {}

	createEditTaskRowDetailsForm(task, rowNumber, isDuplicateTask = false) {
		this.selectedEditableRow = task;
		this.selectedRowNumber = isDuplicateTask ? this.campaignTaskViewDetails.length : rowNumber;
		this.lastUpdatedIndex = 1;
		if (this.campaign && this.campaign['timezoneName']) {
			this.setDefaultDate(this.campaign);
		}
		if (isDuplicateTask) {
			this.showAddTask = true;
			this.isDuplicateTask = true;
		}
		this.publishTime = !task['invalidTime'] && !isDuplicateTask ? task['TIME'] : '';
		const taskType =
			task['POST TYPE'] === 'Text' || task['POST TYPE'] === 'Video' || task['POST TYPE'] === 'Image'
				? task['POST TYPE']
				: null;
		const postType =
			task['POST TYPE'] === 'Text' ||
			task['POST TYPE'] === 'Video' ||
			task['POST TYPE'] === 'Image' ||
			!task['POST TYPE']
				? 'Basic'
				: task['POST TYPE'];
		let date = task['DATE'];
		const defaultTaskTitle = task['TITLE']
			? task['TITLE']
			: this.campaign
			? this.campaign['taskTitle']
			: this.defaultTitle;
		const defaultPeriod = task['PERIOD']
			? task['PERIOD']
			: this.campaign
			? this.campaign['campaignPeriod']
			: this.defaultPeriod;

		if (!task['invalidTime'] && task['TIME']) {
			this.publishTime = task['TIME'];
		} else if (this.campaign?.['defaultTaskDate']) {
			this.publishTime = this.campaign['publishTime'];
		} else if (this.defaultPublishTime) {
			this.publishTime = this.defaultPublishTime;
		} else {
			this.publishTime = '';
		}
		if (!date && this.campaign?.['defaultTaskDate']) {
			date = this.campaign['date'];
		} else if (!date && this.defaultTaskDate) {
			date = new DateTime(new DateTime(this.defaultTaskDate).format('MMMM D YYYY')).toDate();
		}
		const groupForm = {
			groupId: new FormControl(isDuplicateTask ? '' : task['GROUP ID'], [Validators.required]),
			groupName: new FormControl(isDuplicateTask ? '' : task['GROUP NAME'], [Validators.required]),
			groupAdmin: new FormControl(isDuplicateTask ? '' : task['GROUP ADMIN/MODERATOR'], [Validators.required]),
			title: new FormControl(defaultTaskTitle, [Validators.required]),
			period: new FormControl(defaultPeriod, [Validators.required]),
			startDate: new FormControl(date, [Validators.required]),
			taskText: new FormControl(task['TEXT']),
			postType: new FormControl(postType),
			taskType: new FormControl(taskType),
			role: new FormControl(),
			userId: new FormControl(task['USER ID']),
			imageUrls: new FormControl(task['imageUrls']),
			videoUrls: new FormControl(task['videoUrls'])
		};
		this.previewImage = [];
		this.imageFiles = [];
		this.videoFiles = [];
		this.selectedGroup = task['GROUP NAME'];
		if (task['imageUrls'] && !task['taskId'] && task['imageUrls'].length > 0) {
			this.imageFiles = task['imageUrls'];
			task['imageUrls'].forEach((url, index) => {
				if (typeof url !== 'string') {
					const reader = new FileReader();
					reader.readAsDataURL(url);
					reader.onload = _event => {
						this.previewImage.push({src: reader.result, type: 'image'});
					};
				} else {
					let fileType = taskType.toLowerCase();
					this.previewImage.push({src: url, type: 'image'});
				}
			});
		} else if (task['videoUrls'] && !task['taskId'] && task['videoUrls'].length > 0) {
			task['videoUrls'].forEach((url, index) => {
				this.videoFiles.push(url);
				const reader = new FileReader();
				reader.readAsDataURL(url);
				reader.onload = _event => {
					this.previewImage.push({src: reader.result, type: 'video'});
				};
			});
		} else if (
			(task['imageUrls'] && task['imageUrls'].length > 0) ||
			(task['videoUrls'] && task['videoUrls'].length > 0)
		) {
			task['imageUrls'].forEach(url => {
				let fileType = taskType.toLowerCase();
				this.previewImage.push({src: url, type: fileType});
				this.imageFiles.push(url);
			});
			task['videoUrls'].forEach(url => {
				let fileType = taskType.toLowerCase();
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

		if (task?.['timezoneName']) {
			this.timezoneName = task['timezoneName'];
		} else if (task?.['DATE']) {
			this.timezoneName = DateTime.guess();
		} else if (this.campaign?.['timezoneName']) {
			this.timezoneName = this.campaign['timezoneName'];
		} else if (this.defaultTimezoneName) {
			this.timezoneName = this.defaultTimezoneName;
		}

		this.onPostTypeChange();
		this.pushTimezoneNames();
	}

	downloadSheet() {
		const campaignDetails = [];
		this.campaignTaskViewDetails.forEach(task => {
			const taskDet = {};
			this.campaignTaskColumnNames.forEach(column => {
				if (task['imageUrls'] && task['imageUrls'].length > 0 && column === 'imageUrls') {
					taskDet['Image Urls'] = task['imageUrls'].join(';');
				} else if (task['videoUrls'] && task['videoUrls'].length > 0 && column === 'videoUrls') {
					taskDet['Video Urls'] = task['videoUrls'].join(';');
				} else if (task['fbPermlink'] && column === 'fbPermlink' && task['status'] === 'Completed') {
					taskDet['FB Post Link'] = task['fbPermlink'];
				} else {
					taskDet[column] = task[column];
				}
			});
			campaignDetails.push(taskDet);
		});
		const worksheet = utils.json_to_sheet(campaignDetails);
		const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
		writeFile(workbook, 'Updated Campaign Task.xlsx');
	}

	onPostTypeChange() {
		if (this.taskEditForm.get('postType').value !== 'Basic') {
			this.isTaskTypeValid = true;
		} else {
			const taskType =
				this.taskEditForm.get('imageUrls').value && this.taskEditForm.get('imageUrls').value.length > 0
					? 'Image'
					: this.taskEditForm.get('videoUrls').value && this.taskEditForm.get('videoUrls').value.length > 0
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

	async getGroupsDetailsByName() {
		this.groupDetails = null;
		this.selectedGroup = null;
		this.isGroupNotInstalled = false;
		const name = this.taskEditForm.get('groupName').value.replace(/\\/g, '');
		this.groupDetails = await this.createCampaignService.getGroupsDetailsByName(name);
		this.groupDetails = this.groupDetails.filter(
			group => group.groupType && group.groupType.toLowerCase() === 'facebook'
		);
		this.taskEditForm.get('groupAdmin').setValue(null);
		this.taskEditForm.get('role').setValue(null);
		this.taskEditForm.get('userId').setValue(null);
		this.groupModerators = [];
	}

	async selectGroup(selectedGroup) {
		this.selectedGroup = selectedGroup;
		this.taskEditForm.get('groupName').setValue(this.selectedGroup.name);
		this.taskEditForm.get('groupId').setValue(this.selectedGroup.id);
		this.isGroupNotInstalled = !(this.selectedGroup.state === GroupStateEnum.Installed);
		if (this.isGroupNotInstalled) {
			return;
		}
		const groupModerators = await this.createCampaignService.getGroupMembersByGroupId(this.selectedGroup.id);

		groupModerators.items = groupModerators.items.filter(
			moderator => moderator.role === Role.Admin || moderator.role === Role.Moderator
		);

		if (groupModerators) {
			const calls = [];
			groupModerators.items.forEach(item => {
				calls.push(this.createCampaignService.getUserByUserId(item.userId));
			});
			const details = await Promise.all(calls);
			details.forEach((users, index) => {
				if (users?.fullname) {
					groupModerators.items[index]['fullname'] = users.fullname;
				} else {
					this.logger.debug(
						'User details not found',
						{userId: groupModerators.items[index]},
						'CommunityMarketingCampaignTasksComponent',
						'selectGroup'
					);
					delete groupModerators.items[index];
				}
			});
			this.groupModerators = groupModerators.items;
		}
	}

	selectModerator(moderator) {
		this.taskEditForm.get('groupAdmin').setValue(moderator.fullname);
		this.taskEditForm.get('role').setValue(moderator.role);
		this.taskEditForm.get('userId').setValue(moderator.userId);
	}

	async editTaskRowDetails() {
		if (this.taskEditForm.valid) {
			this.isSubmitting = true;
			if (this.showAddTask) {
				this.campaignTaskViewDetails.push({});
			}
			const selectedTask = this.campaignTaskViewDetails[this.selectedRowNumber];
			const files = this.imageFiles.concat(this.videoFiles);
			if (this.showAddTask) {
				this.campaignTaskViewDetails[this.selectedRowNumber]['No.'] = this.selectedRowNumber + 1;
			}
			this.campaignTaskViewDetails[this.selectedRowNumber]['GROUP ID'] = this.taskEditForm.get('groupId').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['GROUP NAME'] = this.taskEditForm.get('groupName').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['GROUP ADMIN/MODERATOR'] =
				this.taskEditForm.get('groupAdmin').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['USER ID'] = this.taskEditForm.get('userId').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['POST TYPE'] = this.getTaskType();
			this.campaignTaskViewDetails[this.selectedRowNumber]['TITLE'] = this.taskEditForm.get('title').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['PERIOD'] = this.taskEditForm.get('period').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['TEXT'] = this.taskEditForm.get('taskText').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['URL'] = files;
			this.campaignTaskViewDetails[this.selectedRowNumber]['imageUrls'] = this.taskEditForm.get('imageUrls').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['videoUrls'] = this.taskEditForm.get('videoUrls').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['TIME'] = this.publishTime;
			this.campaignTaskViewDetails[this.selectedRowNumber]['DATE'] = this.taskEditForm.get('startDate').value;
			this.campaignTaskViewDetails[this.selectedRowNumber]['timezoneOffsetInMins'] =
				this.userTimezoneOffsetInMins - this.timezoneOffsetInMins;
			if (this.taskEditForm.get('startDate').value) {
				this.campaignTaskViewDetails[this.selectedRowNumber]['defaultTaskDate'] = new DateTime(
					new DateTime(this.taskEditForm.get('startDate').value).format('MM/DD/YYYY') + ', ' + this.publishTime,
					'MM/DD/YYYY, hh:mm A'
				)
					.add(this.campaignTaskViewDetails[this.selectedRowNumber]['timezoneOffsetInMins'], 'minutes')
					.utc()
					.toISOString();
				this.campaignTaskViewDetails[this.selectedRowNumber]['timezoneName'] = this.timezoneName;
			}
			this.numberOfMissings = this.createCampaignService.validatingMissingDetails(this.campaignTaskViewDetails);
			if (this.showAddTask) {
				if (this.isCMCEdition) {
					await this.sendCampaignTaskDetails(
						this.campaignTaskViewDetails[this.selectedRowNumber],
						this.campaignId,
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
						this.campaignTaskViewDetails[this.selectedRowNumber],
						this.campaignId,
						selectedTask,
						this.selectedRowNumber
					);
				} else {
					this.campaignTaskViewDetails[this.selectedRowNumber]['isTaskEdited'] = true;
					this.isSubmitting = false;
					this.setTaskPreviewUrls();
					this.closeDetailsView();
				}
			}
			document.getElementById('closeEditDetailsId').click();
		}
	}

	getTaskType() {
		const postType = this.taskEditForm.get('postType').value;
		if (postType !== 'Basic') {
			return postType;
		} else if (this.taskEditForm.get('imageUrls').value.length > 0) {
			return 'Image';
		} else if (this.taskEditForm.get('videoUrls').value.length > 0) {
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
			this.campaignTaskViewDetails[rowNumber]['taskId'] = taskDetails[0]['taskId'];
			this.closeAddNewTaskPopup();
			this.showAddTask = false;
			this.isDuplicateTask = false;
			this.isSubmitting = false;
		} catch (e) {
			this.removeSelectedRow(task, rowNumber);
			this.isSubmitting = false;
		}
	}

	async createInputData(task, campaignId) {
		const taskInfo = {};
		taskInfo['campaignId'] = campaignId;
		taskInfo['userId'] = task['USER ID'];
		taskInfo['userName'] = task['GROUP ADMIN/MODERATOR'];
		taskInfo['groupId'] = task['GROUP ID'];
		taskInfo['groupName'] = task['GROUP NAME'];
		taskInfo['title'] = task['TITLE'];
		taskInfo['toBePerformedByUTC'] = this.campaignTaskViewDetails[this.selectedRowNumber]['defaultTaskDate'];
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

	onFbPermLinkUpdate() {
		if (this.fbPermlink?.match(this.fbPermLinkRegex)) {
			this.isFbPermLinkValid = true;
		} else {
			this.isFbPermLinkValid = false;
			return;
		}

		this.isSubmitting = true;
		const selectedTask = this.campaignTaskViewDetails[this.selectedRowNumber];
		this.campaignTaskViewDetails[this.selectedRowNumber]['fbPermlink'] = this.fbPermlink;
		this.campaignTaskViewDetails[this.selectedRowNumber]['timezoneOffsetInMins'] =
			this.userTimezoneOffsetInMins - this.timezoneOffsetInMins;
		this.campaignTaskViewDetails[this.selectedRowNumber]['defaultTaskDate'] = new DateTime(
			new DateTime(this.campaignTaskViewDetails[this.selectedRowNumber]['DATE']).format('MM/DD/YYYY') +
				', ' +
				this.campaignTaskViewDetails[this.selectedRowNumber]['TIME'],
			'MM/DD/YYYY, hh:mm A'
		)
			.add(this.campaignTaskViewDetails[this.selectedRowNumber]['timezoneOffsetInMins'], 'minutes')
			.utc()
			.toISOString();
		this.updateCampaignTaskDetails(
			this.campaignTaskViewDetails[this.selectedRowNumber],
			this.campaignId,
			selectedTask,
			this.selectedRowNumber,
			true
		);
		document.getElementById('cancel').click();
	}

	async updateCampaignTaskDetails(task, campaignId, selectedTask, selectedRowNumber, isShellTask = false) {
		const calls = [];
		const taskInfo = {};
		taskInfo['taskId'] = task['taskId'];
		taskInfo['campaignId'] = campaignId;
		taskInfo['userId'] = task['USER ID'];
		taskInfo['userName'] = task['GROUP ADMIN/MODERATOR'];
		taskInfo['groupId'] = task['GROUP ID'];
		taskInfo['groupName'] = task['GROUP NAME'];
		taskInfo['title'] = task['TITLE'];
		taskInfo['period'] = task['PERIOD'];
		taskInfo['toBePerformedByUTC'] = this.campaignTaskViewDetails[this.selectedRowNumber]['defaultTaskDate'];
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
			this.campaignTaskViewDetails[selectedRowNumber] = task;
			this.setTaskPreviewUrls();
			this.closeAddNewTaskPopup();
			this.isSubmitting = false;
			this.alertService.success(
				'Check campaign task list for selected campaign',
				'Campaign task updated successfully',
				5000,
				true
			);
		} catch (e) {
			this.campaignTaskViewDetails[selectedRowNumber] = selectedTask;
			this.isSubmitting = false;
			this.alertService.error(
				'Campaign task update unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
		}
	}

	async deleteCampaignTask(campaignId, task, rowNumber) {
		try {
			const deletedTask = await this.createCampaignService.deleteCampaignTask(campaignId, task['taskId']);
			task = deletedTask;
			this.closeAddNewTaskPopup();
			this.removeSelectedRow(task, rowNumber);
			this.alertService.success(
				'Check campaign task list for selected campaign',
				'Campaign task deleted successfully',
				5000,
				true
			);
		} catch (e) {
			this.alertService.error(
				'Campaign task deletion unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
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
				requestsForProcessingFileURLs.push(this.fileService.uploadToS3(files[i], 'image', this.randomUuid()));
			} else {
				requestsForProcessingFileURLs.push(new Promise(resolve => resolve(files[i])));
			}
		}

		return await Promise.all(requestsForProcessingFileURLs);
	}

	getPostType(task: any, postType: string) {
		if (postType === 'Image') {
			return task['imageUrls'].length > 1 ? PostContentTypeEnum.Album : PostContentTypeEnum.Photo;
		} else {
			return postType;
		}
	}

	uploadCampaignData(event) {
		const file = event.target.files[0];
		if (file && file.name.indexOf('.xlsx') > 0) {
			let arrayBuffer: any;
			const fileReader = new FileReader();
			fileReader.onload = e => {
				arrayBuffer = fileReader.result;
				const data = new Uint8Array(arrayBuffer);
				const arr = [];
				for (let i = 0; i !== data.length; ++i) {
					arr[i] = String.fromCharCode(data[i]);
				}
				const bstr = arr.join('');
				const workbook = read(bstr, {type: 'binary', cellDates: true});
				const first_sheet_name = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[first_sheet_name];
				let campaignTasks = [];
				campaignTasks = utils.sheet_to_json(worksheet, {raw: true});
				campaignTasks.forEach(task => {
					if (task['URL']) {
						task['URL'] = task['URL'].split(';');
					}
					task['DATE'] = new DateTime(task['DATE']).add(2, 'hours').toDate();
					if (task['TIME']) {
						if (task['TIME'].toString().match(/^(\d{1,2}):(\d{2}):(\d{2}) ([AP]M)$/)) {
							const time = task['TIME'].split(':');
							task['TIME'] = time[0] + ':' + time[1] + ' ' + time[2].split(' ')[1];
						}
					}
				});
				const numberOfMissings = this.createCampaignService.validatingMissingDetails(campaignTasks);
				if (numberOfMissings > 0) {
					this.uploadCampaignTasks = campaignTasks;
					document.getElementById('showFileTaskError').click();
				} else {
					this.sendCampaignTasks(campaignTasks);
				}
			};
			fileReader.readAsArrayBuffer(file);
		} else if (file && file.name.indexOf('.xlsx') < 0) {
			document.getElementById('showFileTypeMessage').click();
		}
	}

	async sendCampaignTasks(uploadedCampaignTasks) {
		let calls = [];
		const chunkSize = 25;
		const batchOfCampaignTasks = [];
		const campaignTasksInfo = [];
		const callSize = 10;
		uploadedCampaignTasks.forEach(task => {
			const taskInfo = this.createInputData(task, this.campaignId);
			campaignTasksInfo.push(taskInfo);
		});
		for (let index = 0; index < campaignTasksInfo.length; index += chunkSize) {
			const tasks = campaignTasksInfo.slice(index, index + chunkSize);
			batchOfCampaignTasks.push(tasks);
		}
		try {
			for (let index = 0; index < batchOfCampaignTasks.length; index += callSize) {
				calls = [];
				for (let callIndex = index; callIndex < index + callSize; callIndex++) {
					calls.push(
						this.createCampaignService.createCampaignTask(batchOfCampaignTasks[callIndex], this.campaign?.brandId)
					);
				}
				await Promise.all(calls);
			}
			uploadedCampaignTasks.forEach(task => {
				this.campaignTaskViewDetails.push(task);
			});
			this.alertService.success(
				'Check campaign task list for selected campaign',
				'Campaign task added successfully',
				5000,
				true
			);
		} catch (e) {}
	}

	validatePublishTime(time) {
		const date = this.taskEditForm.get('startDate').value;
		const startDate = new DateTime(this.startDate);
		const endDate = new DateTime(this.endDate);
		if (date && time) {
			const dateTimeOfTask = new DateTime(new DateTime(date).format('MM/DD/YYYY') + ', ' + time, 'MM/DD/YYYY, hh:mm A');
			this.isDateValid =
				dateTimeOfTask.diff(startDate.dayJsObj, 'days') >= 0 &&
				endDate.diff(dateTimeOfTask.dayJsObj, 'days') >= 0 &&
				new DateTime() <= dateTimeOfTask;
		} else if (date) {
			const dateTimeOfTask = new DateTime(date);
			this.isDateValid =
				dateTimeOfTask.diff(startDate.dayJsObj, 'days') >= 0 && endDate.diff(dateTimeOfTask.dayJsObj, 'days') >= 0;
		}
	}

	removeSelectedRow(selectedTask, rowNumber) {
		if (this.isCMCEdition) {
			this.campaignTaskViewDetails = this.campaignTaskViewDetails.filter(
				task => task['taskId'] !== selectedTask['taskId']
			);
		} else {
			this.campaignTaskViewDetails = this.campaignTaskViewDetails.filter(task => task['No.'] !== selectedTask['No.']);
		}
		for (let i = rowNumber; i < this.campaignTaskViewDetails.length; i++) {
			this.campaignTaskViewDetails[i]['No.'] = i + 1;
		}
		this.numberOfMissings = this.createCampaignService.validatingMissingDetails(this.campaignTaskViewDetails);
		this.closeDetailsView();
	}
}
