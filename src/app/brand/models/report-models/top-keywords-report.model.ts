import {BarChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class TopKeywordsReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel) {
		this.reportData = reportData;
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new BarChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: 'Keyword Volume',
				color: '#F8D50D',
				data: []
			}
		];

		this.reportData.dataPoints.forEach(dp => {
			if (dp.x === 'Top Keywords') {
				dp.ys = dp.ys.sort((a, b) => b.value - a.value).slice(0, 10);
				dp.ys.forEach(y => {
					categories.push(y.label.charAt(0) + y.label.slice(1));
					series[0].data.push(y.value);
				});
			}
		});

		this.reportData.chartOptions.xAxis.categories = categories;
		this.reportData.chartOptions.series = series;
		this.reportData.chartOptions.yAxis.title.text = 'Keyword Volume';

		this.isEmpty = this.reportData.dataPoints.find(dp => dp.x === 'Top Keywords').ys.length === 0;
	}
}
