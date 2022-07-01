import * as _ from 'lodash';
import {ColumnChartModel} from 'src/app/shared/models/group-reports/chart.model';
import {ReportBase} from './report-base.model';
import {ReportDataOutputModel} from './report-data.model';

export class EngagementReportModel extends ReportBase {
	constructor(reportData: ReportDataOutputModel) {
		super(reportData);
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new ColumnChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: 'Posts',
				yAxis: 1,
				stack: 'Posts',
				color: '#CA5FA6',
				data: []
			},
			{
				name: 'Comments',
				stack: 'Comments',
				color: '#58BBE5',
				data: []
			},
			{
				name: 'Reactions',
				stack: 'Reactions',
				color: '#39C7B0',
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
		this.reportData.chartOptions.yAxis = [
			{
				allowDecimals: false,
				min: 0,
				title: {
					text: 'Volume for Comments & Reactions'
				},
				opposite: false
			},
			{
				allowDecimals: false,
				min: 0,
				title: {
					text: 'Volume for Posts',
					rotation: 270,
					x: 10
				},
				opposite: true
			}
		];
		this.reportData.chartOptions.plotOptions.column.dataLabels.enabled = false;

		const total = _.reduce(
			this.reportData.dataPoints,
			(sum, datapoint) =>
				sum +
				Number(
					_.reduce(
						datapoint.ys,
						(sumYs, ys) =>
							sumYs +
							(ys.label === 'Posts' || ys.label === 'Comments' || ys.label === 'Reactions' ? Number(ys.value) : 0),
						0
					)
				),
			0
		);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
