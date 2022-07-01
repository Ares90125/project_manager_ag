import * as _ from 'lodash';
import {ColumnChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class SovKeywordReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel, private sovReportType: string, private keyword: string) {
		this.reportData = Object.assign({}, reportData);
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new ColumnChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: this.keyword.toUpperCase(),
				color: '#F8D50D',
				data: []
			}
		];
		if (this.sovReportType === 'ShareOfInvoice') {
			this.reportData?.dataPoints?.forEach(dp => {
				categories.push(dp.x);
				const ys = dp.ys.filter(yDataPoint => yDataPoint.label === this.keyword);
				series[0].data.push(ys.length > 0 ? ys[0].value : 0);
			});
		} else {
			this.reportData?.keywordDataPoints?.forEach(dp => {
				categories.push(dp.x);
				const ys = dp.ys[this.sovReportType];
				series[0].data.push(dp.ys[this.sovReportType]?.[this.keyword] ? dp.ys[this.sovReportType]?.[this.keyword] : 0);
			});
		}

		this.reportData.chartOptions.xAxis.categories = categories;
		this.reportData.chartOptions.series = series;
		this.reportData.chartOptions.yAxis.title.text = this.keyword.toUpperCase();

		const total = _.reduce(this.reportData.chartOptions.series, (sum, datapoint) => sum + datapoint, 0);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
