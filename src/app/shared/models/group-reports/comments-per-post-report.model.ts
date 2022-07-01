import * as _ from 'lodash';
import {ColumnChartModel} from 'src/app/shared/models/group-reports/chart.model';
import {ReportBase} from './report-base.model';
import {ReportDataOutputModel} from './report-data.model';

export class CommentsPerPostReportModel extends ReportBase {
	constructor(reportData: ReportDataOutputModel) {
		super(reportData);

		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.commentsChartOptions = new ColumnChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: 'Comments Per Posts',
				color: '#08B99C',
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

		this.reportData.commentsChartOptions.xAxis.categories = categories;
		this.reportData.commentsChartOptions.series = series;
		this.reportData.commentsChartOptions.yAxis.title.text = 'Comments Volume';
		this.reportData.commentsChartOptions.plotOptions.column.dataLabels.enabled = false;

		const total = _.reduce(
			this.reportData.dataPoints,
			(sum, datapoint) =>
				sum +
				Number(
					_.reduce(datapoint.ys, (sumYs, ys) => sumYs + (ys.label === 'Comments Per Posts' ? Number(ys.value) : 0), 0)
				),
			0
		);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
