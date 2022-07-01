import {Injectable} from '@angular/core';
import {
	DataPointModel,
	DataPointYModel,
	ReportDataInputModel,
	ReportDataOutputModel
} from '@sharedModule/models/group-reports/report-data.model';
import * as _ from 'lodash';

@Injectable()
export class KeywordDistributionReportService {
	constructor() {}

	getKeywordDistributionReport(data): ReportDataOutputModel {
		const reportData = new ReportDataOutputModel();
		const inputData = data as ReportDataInputModel;
		const yDataPoints = [];
		const keywordsDistribution = {};
		const yDataPointsForWordCloud = [];
		const keywordsDistributionForWordCloud = {};
		const DPs = {
			Products: new DataPointYModel('Products', 0),
			Remedies: new DataPointYModel('Remedies', 0),
			Issues: new DataPointYModel('Issues', 0),
			Brands: new DataPointYModel('Brands', 0),
			Amenities: new DataPointYModel('Amenities', 0),
			'Purchase Consideration': new DataPointYModel('Purchase Consideration', 0)
		};
		const metrics = inputData.metrics;

		_.forEach(metrics, (met: any) => {
			const numKeywordsJson = this.combineFacebookAndWhatsAppData(met.numKeywordsFB, met.numKeywordsWA);
			const numTokensJson = this.combineFacebookAndWhatsAppData(met.numTokensFB, met.numTokensWA, false);

			Object.keys(numKeywordsJson).forEach(keyword => {
				const keywordLowerCase = keyword.toLowerCase();
				if (keywordsDistribution?.hasOwnProperty(keywordLowerCase)) {
					keywordsDistribution[keywordLowerCase] += numKeywordsJson[keyword].numOccurrences;
				} else {
					keywordsDistribution[keywordLowerCase] = numKeywordsJson[keyword].numOccurrences;
				}

				if (DPs[numKeywordsJson[keyword].type]) {
					DPs[numKeywordsJson[keyword].type].value += numKeywordsJson[keyword].numOccurrences;
				}
			});

			Object.keys(numTokensJson).forEach(keyword => {
				const keywordLowerCase = keyword.toLowerCase();
				if (keywordsDistributionForWordCloud?.hasOwnProperty(keywordLowerCase)) {
					keywordsDistributionForWordCloud[keywordLowerCase] += numTokensJson[keyword];
				} else {
					keywordsDistributionForWordCloud[keywordLowerCase] = numTokensJson[keyword];
				}
			});
		});

		Object.keys(keywordsDistribution).forEach(keyword => {
			yDataPoints.push(new DataPointYModel(keyword, keywordsDistribution[keyword]));
		});

		reportData.dataPoints.push(new DataPointModel('Top Keywords', yDataPoints));
		Object.keys(DPs).forEach(key => {
			reportData.dataPoints.push(new DataPointModel(DPs[key].label, [].concat(DPs[key])));
		});

		Object.keys(keywordsDistributionForWordCloud).forEach(keyword => {
			yDataPointsForWordCloud.push(new DataPointYModel(keyword, keywordsDistributionForWordCloud[keyword]));
		});

		reportData.dataPoints.push(new DataPointModel('Keywords Distribution', yDataPointsForWordCloud));

		return reportData;
	}

	combineFacebookAndWhatsAppData(jsonStringFB, jsonStringWA, hasNumOccurrences: boolean = true): any {
		const json = JSON.parse(jsonStringFB);
		const jsonWA = JSON.parse(jsonStringWA);

		Object.keys(jsonWA).forEach(keyword => {
			if (json.hasOwnProperty(keyword)) {
				hasNumOccurrences
					? (json[keyword].numOccurrences += jsonWA[keyword].numOccurrences)
					: (json[keyword] += jsonWA[keyword]);
			} else {
				json[keyword] = jsonWA[keyword];
			}
		});

		return json;
	}
}
