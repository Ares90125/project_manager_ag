import * as _ from 'lodash';
import {BarChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';

export class SentimentalAnalysisReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel, private readonly brandName: string) {
		this.reportData = Object.assign({}, reportData);

		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new BarChartModel().chartOptions;
		this.reportData.chartOptions.plotOptions.series.stacking = 'percent';
		this.reportData.chartOptions.yAxis.tickInterval = 20;
		this.reportData.chartOptions.tooltip['headerFormat'] = '<span>Sentimental Analysis</span><br/>';
		this.reportData.chartOptions.tooltip['pointFormat'] =
			'<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.percentage:.0f}%</b><br/>';
		this.reportData.chartOptions.yAxis.labels = {format: '{value}%'};
		this.reportData.chartOptions.legend = {
			symbolHeight: 17,
			symbolWidth: 17,
			symbolRadius: 2,
			enabled: true,
			itemMarginBottom: 10,
			reversed: true,
			align: 'left',
			verticalAlign: 'bottom',
			layout: 'horizontal'
		};
		const categories = [];
		const series = [
			{
				name: 'Neutral',
				color: '#D5D5D5',
				clickable: true,
				data: []
			},
			{
				name: 'Negative',
				color: '#F33456',
				clickable: true,
				data: []
			},
			{
				name: 'Positive',
				color: '#11D69B',
				clickable: true,
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

		const total = _.reduce(
			this.reportData.dataPoints,
			(sum, datapoint) =>
				sum +
				Number(
					_.reduce(
						datapoint.ys,
						(sumYs, ys) =>
							sumYs +
							(ys.label === 'Positive' || ys.label === 'Negative' || ys.label === 'Neutral' ? Number(ys.value) : 0),
						0
					)
				),
			0
		);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
