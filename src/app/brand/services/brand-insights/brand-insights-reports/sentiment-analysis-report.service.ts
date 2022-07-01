import {Injectable} from '@angular/core';
import {
	DataPointModel,
	DataPointYModel,
	ReportDataInputModel,
	ReportDataOutputModel
} from '@sharedModule/models/group-reports/report-data.model';
import * as _ from 'lodash';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable()
export class SentimentAnalysisReportService {
	constructor() {}

	getSentimentAnalysisReport(data): ReportDataOutputModel {
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		const groupingClause = 'metricForHourUTCMonth';

		const metrics = _.chain(inputData.metrics).groupBy(groupingClause).value();

		if (_.isEmpty(metrics)) {
			inputData.months.forEach(month => {
				reportData.dataPoints.push(
					new DataPointModel(month, [
						// Sentimental Analysis Data Points
						new DataPointYModel('Positive', 0),
						new DataPointYModel('Negative', 0),
						new DataPointYModel('Neutral', 0),
						// Emotional Analysis Data Points
						new DataPointYModel('Anger', 0),
						new DataPointYModel('Anticipation', 0),
						new DataPointYModel('Joy', 0),
						new DataPointYModel('Sadness', 0),
						new DataPointYModel('Disgust', 0),
						new DataPointYModel('Surprise', 0),
						new DataPointYModel('Trust', 0),
						new DataPointYModel('Fear', 0)
					])
				);
			});
		}

		_.each(metrics, (metric, index) => {
			const monthNumber = Number(index) - 1;
			const x = `${new DateTime().month(monthNumber).format('MMM')} ${metric[0].metricForHourUTCYear}`;
			const yDataPointsArray = [
				// Sentimental Analysis Data Points
				new DataPointYModel('Positive', 0),
				new DataPointYModel('Negative', 0),
				new DataPointYModel('Neutral', 0),
				// Emotional Analysis Data Points
				new DataPointYModel('Anger', 0),
				new DataPointYModel('Anticipation', 0),
				new DataPointYModel('Joy', 0),
				new DataPointYModel('Sadness', 0),
				new DataPointYModel('Disgust', 0),
				new DataPointYModel('Surprise', 0),
				new DataPointYModel('Trust', 0),
				new DataPointYModel('Fear', 0)
			];

			_.forEach(metric, function (met: any) {
				// Sentimental Analysis Data Points
				yDataPointsArray[0].value += met.numPositiveFB + met.numPositiveWA;
				yDataPointsArray[1].value += met.numNegativeFB + met.numNegativeWA;
				yDataPointsArray[2].value += met.numNeutralFB + met.numNeutralWA;

				// Emotional Analysis Data Points
				yDataPointsArray[3].value += met.numAngerFB + met.numAngerWA;
				yDataPointsArray[4].value += met.numAnticipationFB + met.numAnticipationWA;
				yDataPointsArray[5].value += met.numJoyFB + met.numJoyWA;
				yDataPointsArray[6].value += met.numSadnessFB + met.numSadnessWA;
				yDataPointsArray[7].value += met.numDisgustFB + met.numDisgustWA;
				yDataPointsArray[8].value += met.numSurpriseFB + met.numSurpriseWA;
				yDataPointsArray[9].value += met.numTrustFB + met.numTrustWA;
				yDataPointsArray[10].value += met.numFearFB + met.numFearWA;
			});

			reportData.dataPoints.push(new DataPointModel(x, yDataPointsArray));
		});

		return reportData;
	}
}
