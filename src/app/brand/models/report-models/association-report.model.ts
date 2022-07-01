import * as _ from 'lodash';
import {ColumnChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class AssociationReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel, keyword: string, brand: string) {
		this.reportData = Object.assign({}, reportData);
		this.getHighChartsModel(keyword, brand);
	}

	getHighChartsModel(keyword, brand) {
		this.reportData.chartOptions = new ColumnChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: keyword,
				color: '#F8D50D',
				data: []
			}
		];
		const selectedBrand = brand.toLowerCase();
		this.reportData.associationKeywordDataPoints.forEach(dp => {
			categories.push(dp.x);
			const ysValue = dp.ys[keyword]?.mentionsOfBrand[selectedBrand];
			series[0].data.push(ysValue ? Number(ysValue) : 0);
		});
		this.reportData.chartOptions.xAxis.categories = categories;
		this.reportData.chartOptions.series = series;
		this.reportData.chartOptions.yAxis.title.text = 'Brand Mention ( ' + brand + ' )';
		this.reportData.chartOptions.plotOptions.column['point'] = {
			events: {
				click: e => {
					window.dispatchEvent(
						new CustomEvent('openAssociationKeywordInsights', {
							detail: {
								value: e?.point?.category
							}
						})
					);
					// return false to prevent hiding of the slice behaviour when clicked on the point.
					return false;
				}
			}
		};

		const total = _.reduce(series[0].data, (sum, datapoint) => sum + Number(datapoint), 0);
		this.isEmpty = this.reportData.associationKeywordDataPoints.length === 0 || total === 0;
	}
}
