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
export class ShareOfVoiceReportService {
	constructor() {}

	getShareOfVoiceReport(data): {
		reportDataOutput: ReportDataOutputModel;
		totalConversations: {};
		isAmenitiesEnabled: boolean;
	} {
		const totalConversations = {
			Issues: {count: 0, keywords: []},
			Remedies: {count: 0, keywords: []},
			Products: {count: 0, keywords: []},
			Brands: {count: 0, keywords: []},
			Amenities: {count: 0, keywords: []}
		};
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		let startDate = new DateTime(inputData.months[0]);
		let endDate = new DateTime(inputData.months[1]);
		let daysLeft = 0;
		const DPs = {
			Issues: {},
			Remedies: {},
			Products: {},
			Brands: {},
			Amenities: {}
		};

		let isAmenitiesEnabled = false;
		const metrics = _.chain(inputData.metrics)
			.groupBy(inputData.frequency.toLowerCase() === 'weekly' ? 'numWeekOfMonth' : 'metricForHourUTCMonth')
			.value();
		const keywordDataPoints = [];
		const frequency = inputData.frequency;

		if (!_.isEmpty(metrics) && frequency == 'monthly') {
			inputData.months.forEach(month => keywordDataPoints.push({x: month, ys: 0}));
			inputData.months.forEach(month => reportData.dataPoints.push(new DataPointModel(month, [])));
		} else if (!_.isEmpty(metrics) && frequency !== 'monthly') {
			const startOfWeek = new DateTime(startDate.dayJsObj).format('MMMM D YYYY');
			const endOfWeek = new DateTime(endDate.dayJsObj).format('MMMM D YYYY');
			daysLeft = new DateTime(endOfWeek).diff(new DateTime(startOfWeek).dayJsObj, 'days');
			const weekNumberInMonth = Math.ceil(daysLeft / 7);

			for (let i = 0; i < weekNumberInMonth; i++) {
				const xLabel = this.getXLabel(inputData.frequency, Number(i + 1), startDate, endDate);
				keywordDataPoints.push({x: xLabel, ys: 0});
				reportData.dataPoints.push(new DataPointModel(xLabel, []));
			}
		}

		_.each(metrics, (metric, index) => {
			const yDataPoints = [];
			const shareOfVoiceDistribution = {};
			const x = this.getXLabel(inputData.frequency, Number(index), startDate, endDate);
			const timePeriodDPs = {
				Issues: {},
				Remedies: {},
				Products: {},
				Brands: {},
				Amenities: {}
			};

			_.forEach(metric, (met: any) => {
				const numKeywordsJson = this.combineFacebookAndWhatsAppData(met.numKeywordsFB, met.numKeywordsWA);
				Object.keys(numKeywordsJson).forEach(key => {
					const keyInLowerCase = key.toLowerCase();
					const keywordType = numKeywordsJson[key].type;
					if (timePeriodDPs[keywordType]?.hasOwnProperty(keyInLowerCase)) {
						timePeriodDPs[keywordType][keyInLowerCase] += numKeywordsJson[key].numOccurrences;
					} else {
						if (timePeriodDPs[keywordType]) {
							timePeriodDPs[keywordType][keyInLowerCase] = numKeywordsJson[key].numOccurrences;
						}
					}
					if (DPs[keywordType]?.hasOwnProperty(keyInLowerCase)) {
						DPs[keywordType][keyInLowerCase] += numKeywordsJson[key].numOccurrences;
					} else {
						if (DPs[keywordType]) {
							DPs[keywordType][keyInLowerCase] = numKeywordsJson[key].numOccurrences;
						}

						if (totalConversations[keywordType]) {
							totalConversations[keywordType]['keywords'].push(keyInLowerCase);
						}
					}
					if (totalConversations[keywordType]) {
						totalConversations[keywordType]['count'] += numKeywordsJson[key].numOccurrences;
					}

					if (keywordType === 'Brands') {
						shareOfVoiceDistribution?.hasOwnProperty(keyInLowerCase)
							? (shareOfVoiceDistribution[keyInLowerCase] += numKeywordsJson[key].numOccurrences)
							: (shareOfVoiceDistribution[keyInLowerCase] = numKeywordsJson[key].numOccurrences);
					}

					if (keywordType === 'Amenities') {
						isAmenitiesEnabled = true;
					}
				});
			});

			Object.keys(shareOfVoiceDistribution).forEach(keyword => {
				yDataPoints.push(new DataPointYModel(keyword, shareOfVoiceDistribution[keyword]));
			});

			keywordDataPoints.forEach(datapoint => {
				if (datapoint.x === x) {
					datapoint.ys = timePeriodDPs;
				}
			});
			reportData.dataPoints.forEach(datapoint => {
				if (datapoint.x === x) {
					datapoint.ys = yDataPoints;
				}
			});
		});

		Object.keys(DPs).forEach(keywordType => {
			const yDPs = [];
			Object.keys(DPs[keywordType]).forEach(keyword =>
				yDPs.push(new DataPointYModel(keyword, DPs[keywordType][keyword]))
			);

			reportData.dataPoints.push(new DataPointModel(keywordType, yDPs));
		});
		reportData.keywordDataPoints = keywordDataPoints;
		return {reportDataOutput: reportData, totalConversations, isAmenitiesEnabled};
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

	private getXLabel(frequency: string, index: number, startDate: any, endDate: any): string {
		if (frequency.toLowerCase() === 'weekly') {
			const startOfWeek = new DateTime(startDate).add((index - 1) * 7, 'days');
			const intermEndOfWeek = new DateTime(startOfWeek.dayJsObj).add(6, 'days');
			const endOfWeek = new DateTime(endDate).diff(intermEndOfWeek.dayJsObj, 'days') > 0 ? intermEndOfWeek : endDate;
			return startOfWeek.format("D MMM 'YY") + ' - ' + endOfWeek.format("D MMM 'YY");
		} else {
			const monthNumber = index - 1;
			const labelDate =
				monthNumber > new DateTime().month()
					? new DateTime().month(monthNumber).subtract(1, 'year').utc()
					: new DateTime().month(monthNumber).utc();

			return labelDate.format('MMM YYYY');
		}
	}
}
