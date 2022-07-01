import {WordCloudChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class WordCloudReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;
	wordCloudData = {};
	wordCloudImage = null;

	constructor(reportData: ReportDataOutputModel) {
		this.reportData = reportData;
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.wordCloudChartOptions = new WordCloudChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				type: 'wordcloud',
				data: [],
				name: 'Occurrences'
			}
		];

		this.reportData.dataPoints.forEach(dp => {
			if (dp.x === 'Keywords Distribution') {
				dp.ys = dp.ys
					.sort((a, b) => b.value - a.value)
					.filter((y, i) => (i > 10 ? y.label.length < 11 && y.value !== 0 : true))
					.slice(0, 30);

				dp.ys.forEach(y => {
					categories.push(y.label.charAt(0).toUpperCase() + y.label.slice(1));
					series[0].data.push({name: y.label.charAt(0).toUpperCase() + y.label.slice(1), weight: y.value});
				});
			}
		});

		series[0].data.forEach(item => {
			this.wordCloudData[item.name] = item.weight;
		});

		this.reportData.wordCloudChartOptions.series = series;
		this.isEmpty = this.reportData.dataPoints.find(dp => dp.x === 'Keywords Distribution').ys.length === 0;
	}
}
