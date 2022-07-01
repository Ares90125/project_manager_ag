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
export class AssociationReportService {
	constructor() {}

	getAssociationReport(data): ReportDataOutputModel {
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		const DPs = {
			Issues: {},
			Remedies: {},
			Products: {},
			Brands: {},
			Amenities: {}
		};
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
		reportData['metrics'] = inputData.metrics;
		reportData['keywords'] = [];
		reportData['brandMetrics'] = [];
		reportData.associationKeywordDataPoints = [];

		if (!_.isEmpty(metrics) && inputData.frequency.toLowerCase() !== 'weekly') {
			inputData.months.forEach(month => {
				reportData.associationKeywordDataPoints.push(new DataPointModel(month, []));
			});
		} else if (!_.isEmpty(metrics) && inputData.frequency.toLowerCase() === 'weekly') {
			const weekNumberInMonth = Math.ceil(daysLeft / 7);
			for (let i = 0; i < weekNumberInMonth; i++) {
				reportData.associationKeywordDataPoints.push(
					new DataPointModel(this.getStartAndEndWeekLabels(i, daysLeft, startDate), [])
				);
			}
		}
		const timePeriodDPsBasedOnType = {};
		_.each(metrics, (metric, index) => {
			const monthNumber = Number(index) - 1;
			const x = this.getXAxisLabel(inputData.frequency, monthNumber, daysLeft, startDate);
			let timePeriodDPs = {};

			_.forEach(metric, (met: any) => {
				const associationMetrics = JSON.parse(met['associationMetrics']);
				for (let key of Object.keys(associationMetrics)) {
					const keywordInLowerCase = key.toLowerCase();
					const metricValue = associationMetrics[key];
					if (timePeriodDPsBasedOnType?.hasOwnProperty(keywordInLowerCase)) {
						this.getKeywordTypeBrandValues(
							metricValue['numKeywords'],
							timePeriodDPsBasedOnType[keywordInLowerCase]['timePeriodDPsBasedOnType']
						);
					} else {
						timePeriodDPsBasedOnType[keywordInLowerCase] = {};
						timePeriodDPsBasedOnType[keywordInLowerCase]['timePeriodDPsBasedOnType'] = {
							Issues: {},
							Remedies: {},
							Products: {},
							Brands: {},
							Amenities: {}
						};
						this.getKeywordTypeBrandValues(
							metricValue['numKeywords'],
							timePeriodDPsBasedOnType[keywordInLowerCase]['timePeriodDPsBasedOnType']
						);
					}
					if (timePeriodDPs?.hasOwnProperty(keywordInLowerCase)) {
						timePeriodDPs[keywordInLowerCase]['posts'] += metricValue.numPost;
						timePeriodDPs[keywordInLowerCase]['conversations'] += metricValue.numPost + metricValue.numComment;
						timePeriodDPs[keywordInLowerCase]['mentionOfKeyword'] += metricValue.numKeywordMention;
						timePeriodDPs[keywordInLowerCase]['mentionsOfBrand'] = this.getKeywordValue(
							timePeriodDPs[keywordInLowerCase]['mentionsOfBrand'],
							metricValue.numBrandMention
						);
						timePeriodDPs[keywordInLowerCase]['mentionsOfKeywordBrand'] = this.getKeywordValue(
							timePeriodDPs[keywordInLowerCase]['mentionsOfKeywordBrand'],
							metricValue.numBrandMention
						);
						if (reportData['keywords'].indexOf(keywordInLowerCase) < 0) {
							reportData['keywords'].push(keywordInLowerCase);
						}
					} else {
						timePeriodDPs[keywordInLowerCase] = {};
						timePeriodDPs[keywordInLowerCase]['posts'] = metricValue.numPost;
						timePeriodDPs[keywordInLowerCase]['conversations'] = metricValue.numPost + metricValue.numComment;
						timePeriodDPs[keywordInLowerCase]['mentionOfKeyword'] = metricValue.numKeywordMention;
						timePeriodDPs[keywordInLowerCase]['mentionsOfBrand'] = this.getKeywordValue(
							timePeriodDPs[keywordInLowerCase]['mentionsOfBrand'],
							metricValue.numBrandMention
						);
						timePeriodDPs[keywordInLowerCase]['mentionsOfKeywordBrand'] = this.getKeywordValue(
							timePeriodDPs[keywordInLowerCase]['mentionsOfKeywordBrand'],
							metricValue.numBrandMention
						);
						if (reportData['keywords'].indexOf(keywordInLowerCase) < 0) {
							reportData['keywords'].push(keywordInLowerCase);
						}
					}
				}
			});

			reportData.associationKeywordDataPoints.forEach(datapoint => {
				if (datapoint.x === x) {
					datapoint.ys = timePeriodDPs;
				}
			});
		});

		const keyDataPoints = [];
		for (let key of Object.keys(timePeriodDPsBasedOnType)) {
			const dataPoints = [];
			Object.keys(DPs).forEach(keywordType => {
				const yDPs = [];
				const dpsOfKeywordType = timePeriodDPsBasedOnType[key]['timePeriodDPsBasedOnType'];
				for (let keyType of Object.keys(dpsOfKeywordType[keywordType])) {
					yDPs.push(new DataPointYModel(keyType, dpsOfKeywordType[keywordType][keyType]));
				}
				dataPoints.push(new DataPointModel(keywordType, yDPs));
			});
			keyDataPoints.push({key: key, dataPoints: dataPoints});
		}

		reportData['brandMetrics'] = keyDataPoints;

		return reportData;
	}

	private getKeywordTypeBrandValues(numKeywordsValue, timePeriodDPsBasedOnType) {
		if (numKeywordsValue) {
			for (let numKey of Object.keys(numKeywordsValue)) {
				const numKeyInLowerCase = numKey.toLowerCase();
				const keywordType = numKeywordsValue[numKey].type;
				if (timePeriodDPsBasedOnType[keywordType]?.hasOwnProperty(numKeyInLowerCase)) {
					timePeriodDPsBasedOnType[keywordType][numKeyInLowerCase] += numKeywordsValue[numKey].numOccurrences;
				} else {
					if (timePeriodDPsBasedOnType[keywordType]) {
						timePeriodDPsBasedOnType[keywordType][numKeyInLowerCase] = numKeywordsValue[numKey].numOccurrences;
					}
				}
			}
		}

		return timePeriodDPsBasedOnType;
	}

	private getKeywordValue(timePeriodValueOfkeyword, met) {
		const brandMentionKeywords = met;
		if (!timePeriodValueOfkeyword) {
			timePeriodValueOfkeyword = {};
		}
		for (let key of Object.keys(brandMentionKeywords)) {
			const keyInLowerCase = key.toLowerCase();
			if (timePeriodValueOfkeyword?.hasOwnProperty(keyInLowerCase)) {
				timePeriodValueOfkeyword[keyInLowerCase] += brandMentionKeywords[key];
			} else {
				timePeriodValueOfkeyword[keyInLowerCase] = {};
				timePeriodValueOfkeyword[keyInLowerCase] = brandMentionKeywords[key];
			}
		}
		return timePeriodValueOfkeyword;
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
