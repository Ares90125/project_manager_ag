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
export class EngagementPerPostTypeDistReportService {
	constructor() {}

	getEngagementPerPostTypeDistReport(data) {
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;

		const metrics = _.chain(inputData.metrics).groupBy('metricForHourUTCMonth').value();

		if (!_.isEmpty(metrics) && inputData.frequency.toLowerCase() === 'monthly') {
			inputData.months.forEach(month => {
				reportData.dataPoints.push(
					new DataPointModel(month, [
						new DataPointYModel('Status', 0),
						new DataPointYModel('Link', 0),
						new DataPointYModel('Photo', 0),
						new DataPointYModel('Video', 0),
						new DataPointYModel('Event', 0)
					])
				);
			});
		} else {
			reportData.dataPoints.push(
				new DataPointModel('Last 30 days', [
					new DataPointYModel('Status', 0),
					new DataPointYModel('Link', 0),
					new DataPointYModel('Photo', 0),
					new DataPointYModel('Video', 0),
					new DataPointYModel('Event', 0)
				])
			);
		}

		_.each(metrics, (metric, index) => {
			let x;
			let dataPoint;

			if (inputData.frequency !== 'monthly') {
				x = 'Last 30 days';
				dataPoint = reportData.dataPoints[0];
			} else {
				const monthNumber = Number(index) - 1;
				x = `${new DateTime().month(monthNumber).format('MMM')} ${metric[0].metricForHourUTCYear}`;
				dataPoint = new DataPointModel(x, [
					new DataPointYModel('Status', 0),
					new DataPointYModel('Link', 0),
					new DataPointYModel('Photo', 0),
					new DataPointYModel('Video', 0),
					new DataPointYModel('Event', 0)
				]);
			}

			_.forEach(metric, function (met) {
				dataPoint.ys[0].value += met.numCommentsOnTextPosts + met.numReactionsOnTextPosts + met.numSharesOnTextPosts;
				dataPoint.ys[1].value += met.numCommentsOnLinkPosts + met.numReactionsOnLinkPosts + met.numSharesOnLinkPosts;
				dataPoint.ys[2].value += met.numCommentsOnPhotoPosts + met.numReactionsOnPhotoPosts + met.numSharesOnPhotoPosts;
				dataPoint.ys[3].value += met.numCommentsOnVideoPosts + met.numReactionsOnVideoPosts + met.numSharesOnVideoPosts;
				dataPoint.ys[4].value += met.numCommentsOnEventPosts + met.numReactionsOnEventPosts + met.numSharesOnEventPosts;
			});

			reportData.dataPoints.filter(point => {
				if (point.x === x) {
					point.ys = dataPoint.ys;
				}
			});
		});

		return reportData;
	}
}
