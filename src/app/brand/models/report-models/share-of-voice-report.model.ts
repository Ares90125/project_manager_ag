import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';
import {BarChartModel} from '@sharedModule/models/group-reports/chart.model';
import * as _ from 'lodash';

export class ShareOfVoiceReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel) {
		this.reportData = Object.assign({}, reportData);
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new BarChartModel().chartOptions;
		this.reportData.chartOptions.plotOptions.series.stacking = 'percent';
		this.reportData.chartOptions.yAxis.tickInterval = 20;
		this.reportData.chartOptions.tooltip['headerFormat'] = '<span>Share of Voice</span><br/>';
		this.reportData.chartOptions.tooltip['pointFormat'] =
			'<span style="color:{point.color}">\u25CF</span><b>{series.name}: {point.percentage:.0f}%</b><br/>';
		this.reportData.chartOptions.yAxis.labels = {format: '{value}%'};
		this.reportData.chartOptions.legend = {
			symbolHeight: 17,
			symbolWidth: 17,
			symbolRadius: 2,
			enabled: true,
			itemMarginBottom: 8,
			itemMarginTop: 8,
			reversed: true,
			align: 'right',
			verticalAlign: 'middle',
			layout: 'vertical'
		};
		this.reportData.chartOptions.plotOptions.series.events = {
			legendItemClick: e => {
				window.dispatchEvent(
					new CustomEvent('openKeywordInsights', {
						detail: {value: e.target.name, isSubscriptionCheckRequired: true, sovReportType: 'ShareOfInvoice'}
					})
				);
				// return false to prevent hiding of the slice behaviour when clicked on the legend.
				return false;
			},
			click: e => {
				window.dispatchEvent(
					new CustomEvent('openKeywordInsights', {
						detail: {value: e.point.series.name, isSubscriptionCheckRequired: true, sovReportType: 'ShareOfInvoice'}
					})
				);
				// return false to prevent hiding of the slice behaviour when clicked on the point.
				return false;
			}
		};

		this.reportData.dataPoints = this.reportData.dataPoints.filter(
			dp => ['Brands', 'Issues', 'Remedies', 'Products', 'Amenities'].findIndex(sovCategory => sovCategory === dp.x) < 0
		);

		this.reportData.dataPoints.map(dataPoint => {
			dataPoint.ys = dataPoint.ys.sort((a, b) => b.value - a.value).slice(0, 10);
			return dataPoint;
		});

		const categories = [];
		const series = [];

		this.reportData.dataPoints.reduce((acc1, dp) => {
			const topKeyWordsInX = dp.ys.reduce((acc, y) => acc.concat(y.label.toLowerCase()), []);
			topKeyWordsInX.forEach(keywordInX => {
				if (acc1.findIndex(keyword => keyword === keywordInX) < 0) {
					acc1.push(keywordInX);
					series.push({name: keywordInX, data: []});
				}
			});
			return acc1;
		}, []);

		this.reportData.dataPoints.forEach(dp => {
			categories.push(dp.x);
			series.forEach(s => {
				const dpIndex = dp.ys.findIndex(yDp => yDp.label.toLowerCase() === s.name);
				s.data.push(dpIndex < 0 ? 0 : dp.ys[dpIndex].value);
			});
		});

		this.reportData.chartOptions.xAxis.categories = categories;
		this.reportData.chartOptions.series = series;

		const total = _.reduce(
			this.reportData.dataPoints,
			(sum, datapoint) => sum + Number(_.reduce(datapoint.ys, (sumYs, ys) => sumYs + Number(ys.value), 0)),
			0
		);
		this.isEmpty = this.reportData.dataPoints.length === 0 || total === 0;
	}
}
