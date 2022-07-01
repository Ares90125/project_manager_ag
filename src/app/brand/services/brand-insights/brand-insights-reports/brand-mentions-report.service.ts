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
export class BrandMentionsReportService {
	constructor() {}

	getBrandMentionsReport(data: any, brandName: string): ReportDataOutputModel {
		brandName = brandName.toLowerCase();
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		const emptyDataYPoints = [new DataPointYModel('Brand Mentions', 0)];
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

			const brandMentionsDP = new DataPointYModel('Brand Mentions', 0);
			_.forEach(metric, (met: any) => {
				const numKeywordsJson = this.combineFacebookAndWhatsAppData(met.numKeywordsFB, met.numKeywordsWA);

				Object.keys(numKeywordsJson).forEach(keyword => {
					if (numKeywordsJson[keyword].type === 'Brands' && keyword.toLowerCase() === brandName) {
						brandMentionsDP.value += numKeywordsJson[keyword].numOccurrences;
					}
				});
			});

			reportData.dataPoints.forEach(datapoint => {
				if (datapoint.x === x) {
					datapoint.ys = [brandMentionsDP];
				}
			});
		});
		return reportData;
	}

	combineFacebookAndWhatsAppData(jsonStringFB, jsonStringWA): any {
		const json = JSON.parse(jsonStringFB);
		const jsonWA = JSON.parse(jsonStringWA);

		Object.keys(jsonWA).forEach(keyword => {
			if (json.hasOwnProperty(keyword)) {
				json[keyword].numOccurrences += jsonWA[keyword].numOccurrences;
			} else {
				json[keyword] = jsonWA[keyword];
			}
		});

		return json;
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
