import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';
import {PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {environment} from '../../../../environments/environment';

export class SovSubTypeReportModel {
	colors = ['#00BE8E', '#6633CC', '#33BEF1', '#D84596', '#FF7C00'];
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel, private sovReportType: string, private insightViewId: string = '') {
		this.reportData = Object.assign({}, reportData);
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		const headerText =
			this.sovReportType === 'Products' && environment.insightViewIdsForMilestones.has(this.insightViewId)
				? environment.insightViewIdsForMilestones.get(this.insightViewId).altTooltipHeader
				: this.sovReportType;

		this.reportData.chartOptions = new PieChartModel().chartOptions;
		this.reportData.chartOptions.tooltip['headerFormat'] = '<span>' + headerText + '</span><br/>';
		this.reportData.chartOptions.plotOptions.pie['point'] = {
			events: {
				legendItemClick: e => {
					window.dispatchEvent(
						new CustomEvent('openKeywordInsights', {
							detail: {
								value: e.target.name,
								isSubscriptionCheckRequired: e.target.series.name.includes('Brand'),
								sovReportType: this.sovReportType
							}
						})
					);
					// return false to prevent hiding of the slice behaviour when clicked on the legend.
					return false;
				},
				click: e => {
					window.dispatchEvent(
						new CustomEvent('openKeywordInsights', {
							detail: {
								value: e.point.name,
								isSubscriptionCheckRequired: e.point.series.name.includes('Brand'),
								sovReportType: this.sovReportType
							}
						})
					);
					// return false to prevent hiding of the slice behaviour when clicked on the point.
					return false;
				}
			}
		};
		this.reportData.chartOptions.chart['type'] = 'pie';
		this.reportData.chartOptions.plotOptions.pie.dataLabels.style = {
			color: 'contrast',
			fontSize: '15px',
			fontFamily: 'Roboto',
			fontWeight: 'normal',
			textOutline: 'none'
		};
		this.reportData.chartOptions.plotOptions.pie.innerSize = 75;
		this.reportData.chartOptions.plotOptions.pie.showInLegend = true;
		this.reportData.chartOptions.legend = {
			symbolHeight: 17,
			symbolWidth: 17,
			symbolRadius: 2,
			enabled: true,
			itemMarginBottom: 8,
			itemMarginTop: 8,
			align: 'right',
			verticalAlign: 'middle',
			layout: 'vertical',
			x: 0,
			y: 0
		};
		this.reportData.chartOptions.legend.labelFormatter = function () {
			return (
				'<span> ' +
				this.name +
				" <span class='percentage-value'> " +
				((this.y / this.total) * 100).toFixed(1) +
				'%</span></span>'
			);
		};

		const series = [
			{
				name: 'SOV ' + this.sovReportType + ' Report',
				color: this.colors,
				data: []
			}
		];

		this.reportData.dataPoints.forEach(dp => {
			if (dp.x === this.sovReportType) {
				dp.ys = dp.ys.sort((a, b) => b.value - a.value).slice(0, 30);
				dp.ys.forEach(y => {
					series[0].data.push({
						name: y.label,
						y: y.value
					});
				});
			}
		});

		this.reportData.chartOptions.series = series;

		this.isEmpty = !(
			this.reportData.dataPoints
				.filter(dp => dp.x === this.sovReportType)
				.reduce((acc, cur) => {
					acc += cur.ys.reduce((accy, cury) => {
						accy += cury.value;
						return accy;
					}, 0);
					return acc;
				}, 0) > 0
		);
	}
}
