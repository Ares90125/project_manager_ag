import * as _ from 'lodash';
import {PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class EmotionalAnalysisReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;
	colors = ['#00BE8E', '#6633CC', '#33BEF1', '#D84596', '#FF7C00'];

	constructor(reportData: ReportDataOutputModel) {
		this.reportData = reportData;

		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new PieChartModel().chartOptions;
		this.reportData.chartOptions.chart['type'] = 'pie';
		this.reportData.chartOptions.tooltip['headerFormat'] = '<span>Emotional Analysis</span><br/>';
		this.reportData.chartOptions.plotOptions.pie.dataLabels.style = {
			color: 'contrast',
			fontSize: '15px',
			fontFamily: 'Roboto',
			fontWeight: 'normal',
			textOutline: 'none'
		};
		this.reportData.chartOptions.plotOptions.pie.innerSize = 75;

		const series = [
			{
				name: 'Emotional Analysis',
				color: this.colors,
				data: [
					{name: 'Trust', color: '#19EFAF', y: 0},
					{name: 'Joy', color: '#15B082', y: 0},
					{name: 'Anticipation', color: '#088767', y: 0},
					{name: 'Sadness', color: '#FF3F61', y: 0},
					{name: 'Disgust', color: '#D41C3D', y: 0},
					{name: 'Fear', color: '#A6132D', y: 0},
					{name: 'Other', color: '#AFAFAF', y: 0}
				]
			}
		];
		const seriesNames = series[0].data.map(s => s.name);
		const latestMonth = this.reportData.dataPoints.length - 1;

		this.reportData.dataPoints.forEach((dp, index) => {
			if (index === latestMonth) {
				dp.ys.forEach(y => {
					if (y.label !== 'Positive' && y.label !== 'Negative' && y.label !== 'Neutral') {
						const seriesIndex = seriesNames.findIndex(s => s === y.label);
						if (seriesIndex >= 0) {
							series[0].data[seriesIndex].y = y.value;
						} else {
							series[0].data[6].y += y.value;
						}
					}
				});
			}
		});

		this.reportData.chartOptions.series = series;

		const total = _.reduce(
			this.reportData.dataPoints,
			(sum, datapoint) =>
				sum +
				Number(
					_.reduce(
						datapoint.ys,
						(sumYs, ys) =>
							sumYs +
							(ys.label !== 'Positive' && ys.label !== 'Negative' && ys.label !== 'Neutral' ? Number(ys.value) : 0),
						0
					)
				),
			0
		);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
