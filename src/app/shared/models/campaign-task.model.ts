import {PostContentTypeEnum} from '@groupAdminModule/models/facebook-post.model';
import {TaskStatusEnum, TaskTypeEnum} from './graph-ql.model';
import {DateTime} from '@sharedModule/models/date-time';

export class CampaignTaskModel {
	campaignId: string;
	taskId: string;
	userId: string;
	userName: string;
	groupId: string;
	status: TaskStatusEnum;
	groupName: string;
	title: string;
	toBePerformedByUTC: string;
	type: TaskTypeEnum;
	postType: PostContentTypeEnum;
	description: string;
	text: string;
	mediaAllowed: string;
	imageUrls: string[];
	videoUrls: string[];
	linkUrls: string[];
	createdAtUTC: string;
	updatedAtUTC: string;
	period: string;
	reasonForFailure: string;
	fbPermlink: string;
	isPlaceholder: boolean;
	errorFromSource: string;

	public static getTaskDate(task: CampaignTaskModel) {
		return new DateTime(new DateTime(task['DATE']).format('MM/DD/YYYY') + ', ' + task['TIME'], 'MM/DD/YYYY, hh:mm A');
	}

	public static setProperties(task: CampaignTaskModel, campaignId) {
		const timeZone = DateTime.guess();
		const userTimezoneOffsetInMins = new DateTime().utc().getUtcOffset(timeZone);
		const publishTime = '12:30 AM';
		const taskInfo = {};
		taskInfo['taskId'] = task['taskId'];
		taskInfo['campaignId'] = campaignId;
		taskInfo['GROUP ADMIN/MODERATOR'] = task['userName'];
		taskInfo['USER ID'] = task['userId'];
		taskInfo['GROUP ID'] = task['groupId'];
		taskInfo['GROUP NAME'] = task['groupName'];
		taskInfo['DATE'] = new DateTime(task['toBePerformedByUTC']).format('MM/DD/YYYY');
		taskInfo['TIME'] = new DateTime(task['toBePerformedByUTC']).format('hh:mm a').toString().toUpperCase();
		taskInfo['type'] = task['type'];
		taskInfo['TITLE'] = task['title'];
		taskInfo['PERIOD'] = task['period'];
		taskInfo['STATUS'] = task['status'];
		taskInfo['isPlaceholder'] = task['isPlaceholder'];
		taskInfo['REASON FOR FAILURE'] = task['reasonForFailure'];
		taskInfo['errorFromSource'] = task['errorFromSource'];
		// taskInfo['POST TYPE'] =
		// 	task['postType'] === PostContentTypeEnum.Photo ? 'Image' : PostContentTypeEnum[task['postType']];
		taskInfo['POST TYPE'] = task['postType'] === PostContentTypeEnum.Photo ? 'Image' : task['postType'];
		taskInfo['TEXT'] = task['text'];
		taskInfo['imageUrls'] = task['imageUrls'];
		taskInfo['videoUrls'] = task['videoUrls'];
		taskInfo['fbPermlink'] = task['fbPermlink'];
		taskInfo['timezoneName'] = task['timezoneName'];
		if (task['imageUrls']) {
			taskInfo['URL'] = task['imageUrls'];
		}
		if (task['videoUrls']) {
			taskInfo['URL'] = task['videoUrls'];
		}
		if (task['linkUrls']) {
			taskInfo['URL'] = task['linkUrls'];
		}
		task['timezoneName'] = task['timezoneName'] ? task['timezoneName'] : DateTime.guess();

		task['timezoneName'] =
			task['timezoneName'].indexOf('UTC') > -1 ? task['timezoneName']?.substr(13) : task['timezoneName'];
		const timezoneOffsetInMins = new DateTime().utc().getUtcOffset(task['timezoneName']);

		let defaultDate = null;
		if (task['toBePerformedByUTC']) {
			defaultDate = new DateTime(task['toBePerformedByUTC']).add(
				timezoneOffsetInMins - userTimezoneOffsetInMins,
				'minutes'
			);
		}

		taskInfo['TIME'] = defaultDate ? defaultDate.format('hh:mm a').toString().toUpperCase() : publishTime;

		taskInfo['DATE'] = defaultDate ? new DateTime(defaultDate.format('MMMM D YYYY')).toDate() : null;

		return taskInfo;
	}

	public static validationForTime(task) {
		if (!task['TIME']) {
			return 1;
		} else if (task['TIME'].toString().match(/^(\d{1,2}):(\d{2}) ([AP]M)$/)) {
			if (!task['invalidDate']) {
				const dateTimeOfTask = new DateTime(
					new DateTime(task['DATE']).format('MM/DD/YYYY') + ', ' + task['TIME'],
					'MM/DD/YYYY, hh:mm A'
				);
				if (!task['invalidDate'] && new DateTime() > dateTimeOfTask) {
					task['invalidTime'] = false;
					task['errorTime'] = true;
					return 1;
				} else {
					task['invalidTime'] = false;
					task['errorTime'] = false;
					return 0;
				}
			} else {
				task['invalidTime'] = false;
				task['errorTime'] = false;
				return 0;
			}
		} else {
			task['errorTime'] = false;
			task['invalidTime'] = true;
			return 1;
		}
	}

	public static validationForDate(task) {
		const isDateValid = Date.parse(task['DATE']);
		if (!task['DATE']) {
			return 1;
		} else if (task['DATE'] && !isDateValid) {
			task['invalidDate'] = true;
			task['errorDate'] = false;
			return 1;
		} else if (task['DATE'] && new DateTime(task['DATE']).diff(new DateTime().dayJsObj, 'days') < 0) {
			task['errorDate'] = true;
			task['invalidDate'] = false;
			return 1;
		} else {
			task['invalidDate'] = false;
			task['errorDate'] = false;
			return 0;
		}
	}
}
