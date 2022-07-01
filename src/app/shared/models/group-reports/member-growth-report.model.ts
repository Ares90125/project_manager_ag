import * as _ from 'lodash';
import {AreaChartModel} from 'src/app/shared/models/group-reports/chart.model';
import {ReportBase} from './report-base.model';
import {ReportDataOutputModel} from './report-data.model';

export class MemberGrowthReportModel extends ReportBase {
	constructor(reportData: ReportDataOutputModel) {
		super(reportData);

		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.memberChartOptions = new AreaChartModel().chartOptions;
		const categories = [];
		const series = [
			{
				name: 'Member Growth',
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

		this.reportData.memberChartOptions.xAxis.categories = categories;
		this.reportData.memberChartOptions.series = series;
		this.reportData.memberChartOptions.yAxis.title.text = 'Member Count';
		if (series[0].data.length > 0) {
			this.reportData.memberChartOptions.yAxis.min = Math.min(...series[0].data);
			this.reportData.memberChartOptions.yAxis.max = Math.max(...series[0].data);
		}
		const total = _.reduce(
			this.reportData.dataPoints,
			(sum, datapoint) =>
				sum +
				Number(_.reduce(datapoint.ys, (sumYs, ys) => sumYs + (ys.label === 'Member Growth' ? Number(ys.value) : 0), 0)),
			0
		);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
