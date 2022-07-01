import * as _ from 'lodash';
import {PieChartModel} from 'src/app/shared/models/group-reports/chart.model';
import {ReportBase} from './report-base.model';
import {ReportDataOutputModel} from './report-data.model';

export class EngagementPerPostTypeDistReportModel extends ReportBase {
	colors = {status: '#08B99C', link: '#1872A4', video: '#CA5FA6', event: '#FD9433', photo: '#2EAADF'};

	constructor(reportData: ReportDataOutputModel) {
		super(reportData);
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new PieChartModel().chartOptions;
		this.reportData.chartOptionsForLastTwoMonths = new PieChartModel().chartOptions;
		this.reportData.chartOptionsForLastThreeMonths = new PieChartModel().chartOptions;
		this.reportData.chartOptions.tooltip['headerFormat'] = '<span>Engagement per post type</span><br/>';
		this.reportData.dataPoints = this.reportData.dataPoints.reverse();

		const report = this.reportData.dataPoints;
		_.forEach(report, (metric, index) => {
			const total = _.reduce(metric.ys, (sum, ys) => sum + Number(ys.value), 0);
			const data = [];
			_.each(metric.ys, (point, i) => {
				data.push({name: point.label, y: point.value, color: this.colors[point.label.toLowerCase()]});
			});
			if (index === 0) {
				this.reportData.chartOptions.series[0].data = data;
				this.isEmpty = report.length - 1 === index ? total === 0 : this.isEmpty;
			} else if (index === 1) {
				this.reportData.chartOptionsForLastTwoMonths.series[0].data = data;
				this.isEmpty = report.length - 1 === index ? total === 0 : this.isEmpty;
				this.reportData.chartOptions.legend = {enabled: false};
			} else if (index === 2) {
				this.reportData.chartOptionsForLastThreeMonths.series[0].data = data;
				this.isEmpty = report.length - 1 === index ? total === 0 : this.isEmpty;
				this.reportData.chartOptions.legend = {enabled: false};
			}
		});
	}
}
