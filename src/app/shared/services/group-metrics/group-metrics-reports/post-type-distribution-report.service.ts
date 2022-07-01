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
export class PostTypeDistributionReportService {
	constructor() {}

	getpostTypeDistributionReport(data) {
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
				dataPoint.ys[0].value += met.numTextPosts;
				dataPoint.ys[1].value += met.numLinkPosts;
				dataPoint.ys[2].value += met.numPhotoPosts;
				dataPoint.ys[3].value += met.numVideoPosts;
				dataPoint.ys[4].value += met.numEventPosts;
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
