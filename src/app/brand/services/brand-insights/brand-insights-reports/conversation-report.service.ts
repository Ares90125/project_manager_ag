import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {
	DataPointModel,
	DataPointYModel,
	ReportDataInputModel,
	ReportDataOutputModel
} from '@sharedModule/models/group-reports/report-data.model';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable()
export class ConversationReportService {
	constructor() {}

	getConversationReport(data): ReportDataOutputModel {
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		const emptyDataYPoints = [
			new DataPointYModel('Comments Per Posts', 0),
			new DataPointYModel('Conversation Volume', 0)
		];
		const metrics = _.chain(inputData.metrics)
			.groupBy(inputData.frequency.toLowerCase() === 'weekly' ? 'numWeekOfMonth' : 'metricForHourUTCMonth')
			.value();
		let daysLeft = 0;
		let startDate;
		let endDate;
		if (inputData.frequency.toLowerCase() === 'weekly') {
			startDate = new DateTime(inputData.months[0]).format('MMMM D YYYY');
			endDate =
				new DateTime(inputData.months[1]).month() !== new DateTime(inputData.months[0]).month()
					? new DateTime(inputData.months[0]).endOf('month').format('MMMM D YYYY')
					: new DateTime(inputData.months[1]).format('MMMM D YYYY');
			daysLeft = new DateTime(endDate).diff(new DateTime(startDate).dayJsObj, 'days');
		}

		if (!_.isEmpty(metrics) && inputData.frequency.toLowerCase() !== 'weekly') {
			inputData.months.forEach(month => {
				reportData.dataPoints.push(new DataPointModel(month, emptyDataYPoints));
			});
		} else if (!_.isEmpty(metrics) && inputData.frequency.toLowerCase() === 'weekly') {
			const weekNumberInMonth = Math.ceil(daysLeft / 7);
			for (let i = 0; i < weekNumberInMonth; i++) {
				reportData.dataPoints.push(
					new DataPointModel(this.getStartAndEndWeekLabels(i, daysLeft, startDate), emptyDataYPoints)
				);
			}
		}

		_.each(metrics, (metric, index) => {
			const monthNumber = Number(index) - 1;
			const x = this.getXAxisLabel(inputData.frequency, monthNumber, daysLeft, startDate);

			const commentsPerPostDP = new DataPointYModel('Comments Per Posts', 0);
			const conversationVolumeDP = new DataPointYModel('Conversation Volume', 0);
			let numOfFBPosts = 0;
			let numOfWAPosts = 0;
			let numOfFBComments = 0;
			let numOfWAComments = 0;
			_.forEach(metric, (met: any) => {
				numOfFBPosts += met.numPostFB;
				numOfWAPosts += met.numPostWA;
				numOfFBComments += met.numCommentFB;
				numOfWAComments += met.numCommentWA;
			});
			commentsPerPostDP.value = numOfFBPosts !== 0 ? numOfFBComments / numOfFBPosts : 0;
			conversationVolumeDP.value = numOfFBComments + numOfFBPosts + numOfWAComments + numOfWAPosts;

			commentsPerPostDP.value = Math.round(commentsPerPostDP.value);
			reportData.dataPoints.forEach(datapoint => {
				if (datapoint.x === x) {
					datapoint.ys = [commentsPerPostDP, conversationVolumeDP];
				}
			});
		});

		return reportData;
	}

	private getXAxisLabel(frequency: string, monthNumber: number, daysLeft: number, startDate: any) {
		if (frequency.toLowerCase() === 'weekly') {
			return this.getStartAndEndWeekLabels(monthNumber, daysLeft, startDate);
		} else {
			const labelDate =
				monthNumber > new DateTime().month()
					? new DateTime().month(monthNumber).subtract(1, 'year')
					: new DateTime().month(monthNumber);
			return labelDate.format('MMM YYYY');
		}
	}

	private getStartAndEndWeekLabels(index: number, daysLeft: number, startDate) {
		const start = index === 0 ? 7 * index : 7 * index;
		const end = start + 6 >= daysLeft ? daysLeft : start + 6;
		const startOfWeek = new DateTime(startDate).add(start, 'days').format("D MMM 'YY");
		const endOfWeek = new DateTime(startDate).add(end, 'days').format("D MMM 'YY");
		return startOfWeek + ' - ' + endOfWeek;
	}
}
