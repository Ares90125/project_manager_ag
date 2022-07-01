import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {
	DataPointModel,
	DataPointYModel,
	ReportDataInputModel,
	ReportDataOutputModel
} from 'src/app/shared/models/group-reports/report-data.model';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable()
export class EngagementReportService {
	constructor() {}

	getEngagementReport(data) {
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		let groupingClause = inputData.frequency.toLowerCase() === 'weekly' ? 'numWeekOfMonth' : 'metricForHourUTCMonth';
		const emptyYDataPoint = [
			new DataPointYModel('Posts', 0),
			new DataPointYModel('Comments', 0),
			new DataPointYModel('Reactions', 0),
			new DataPointYModel('Comments Per Posts', 0),
			new DataPointYModel('Member Growth', 0)
		];
		let metrics;
		let daysLeft = 0;
		let startDate;
		let endDate;
		const frequency = inputData.frequency.toLowerCase();

		if (frequency === 'last30days') {
			inputData.metrics?.forEach(metric => {
				metric['metricForHour'] = new DateTime(metric.metricForHourUTC).utc();
			});
			this.setWeekNumbersForLast30DaysData(inputData);
			groupingClause = 'numWeekOfLast30Days';
		}

		if (frequency === 'weekly' || frequency === 'last30days') {
			startDate = new DateTime(inputData.months[0]).format('MMMM D YYYY');
			endDate = new DateTime(inputData.months[1]).format('MMMM D YYYY');
			daysLeft = new DateTime(endDate).diff(new DateTime(startDate).dayJsObj, 'days');
		}

		metrics = _.chain(inputData.metrics).groupBy(groupingClause).value();

		if (!_.isEmpty(metrics) && frequency == 'monthly') {
			inputData.months.forEach(month => reportData.dataPoints.push(new DataPointModel(month, emptyYDataPoint)));
		} else if (!_.isEmpty(metrics) && frequency !== 'monthly') {
			const weekNumberInMonth = Math.ceil(daysLeft / 7);
			for (let i = 0; i < weekNumberInMonth; i++) {
				reportData.dataPoints.push(
					new DataPointModel(this.getStartAndEndWeekLabels(i, daysLeft, startDate), emptyYDataPoint)
				);
			}
		}

		_.each(metrics, (metric, index) => {
			const monthNumber = Number(index) - 1;
			const x = this.getXAxisLabel(inputData.frequency, monthNumber, daysLeft, startDate);

			const postsDP = new DataPointYModel('Posts', 0);
			const commentsDP = new DataPointYModel('Comments', 0);
			const reactionsDP = new DataPointYModel('Reactions', 0);
			const commentsPerPostDP = new DataPointYModel('Comments Per Posts', 0);
			const memberCountDP = new DataPointYModel('Member Growth', 0);
			_.forEach(metric, function (met) {
				postsDP.value += met.numPosts;
				commentsDP.value += met.numComments;
				reactionsDP.value += met.numReactions;
				memberCountDP.value = met.memberCount > memberCountDP.value ? met.memberCount : memberCountDP.value;
			});

			if (postsDP.value !== 0) {
				commentsPerPostDP.value = Math.round(commentsDP.value / postsDP.value);
			} else {
				commentsPerPostDP.value = 0;
			}

			reportData.dataPoints.forEach(datapoint => {
				if (datapoint.x === x) {
					datapoint.ys = [postsDP, commentsDP, reactionsDP, commentsPerPostDP, memberCountDP];
				}
			});
		});
		return reportData;
	}

	private setWeekNumbersForLast30DaysData(inputData) {
		const startDate = inputData.months[0];
		const endDate = inputData.months[1];

		const daysLeft = new DateTime(endDate).diff(new DateTime(startDate).dayJsObj, 'days');
		const metrics = inputData.metrics;
		let metricIndex = 1;

		for (let index = 0; index < daysLeft; index += 7) {
			const start = new DateTime(startDate).utc().add(index, 'days');
			const end = new DateTime(startDate).utc().add(index + 6, 'days');

			metrics?.forEach(metric => {
				if (
					metric.metricForHour.diff(start, 'days') >= 0 &&
					end.diff(metric.metricForHour, 'days') >= 0 &&
					metric.metricForHour.diff(start, 'minutes') >= 0
				) {
					metric['numWeekOfLast30Days'] = metricIndex;
				}
			});

			metricIndex += 1;
		}
	}

	private getXAxisLabel(frequency: string, monthNumber: number, daysLeft: number, startDate: any) {
		if (frequency.toLowerCase() === 'weekly' || frequency.toLowerCase() === 'last30days') {
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
		const start = 7 * index;
		const end = start + 6 >= daysLeft ? daysLeft : start + 6;
		const startOfWeek = new DateTime(startDate).add(start, 'days').format('D MMM');
		const endOfWeek = new DateTime(startDate).add(end, 'days').format('D MMM');
		return startOfWeek + ' - ' + endOfWeek;
	}
}
