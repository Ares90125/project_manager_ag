import {ColumnChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class BrandMentionsReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel) {
		this.reportData = Object.assign({}, reportData);

		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new ColumnChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: 'Brand Mentions',
				color: '#F8D50D',
				data: []
			}
		];

		this.reportData.dataPoints.forEach(dp => {
			categories.push(dp.x);

			dp.ys.forEach(y => {
				series.forEach(s => {
					if (s.name === y.label) {
						s.data.push(y.value);
					}
				});
			});
		});

		this.reportData.chartOptions.xAxis.categories = categories;
		this.reportData.chartOptions.series = series;
		this.reportData.chartOptions.yAxis.title.text = 'Brand Mentions';

		const total = this.reportData.dataPoints.reduce((acc, cur) => {
			acc += cur.ys.reduce((accy, cury) => {
				accy += cury.value;
				return accy;
			}, 0);
			return acc;
		}, 0);

		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
