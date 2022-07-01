import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';
import {PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {environment} from '../../../../environments/environment';

export class CategoryBreakupReportModel {
	reportData: ReportDataOutputModel;
	isEmpty = false;

	constructor(reportData: ReportDataOutputModel, private insightViewId: string) {
		this.reportData = Object.assign({}, reportData);
		this.getHighChartsModel();
	}

	getHighChartsModel() {
		this.reportData.chartOptions = new PieChartModel().chartOptions;
		this.reportData.chartOptions.chart['type'] = 'pie';
		this.reportData.chartOptions.tooltip['headerFormat'] = '<span>Category Breakup</span><br/>';
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
				name: 'Top Keywords',
				data: [
					{name: 'Products', color: '#D84596', y: 0},
					{name: 'Brands', color: '#00AEEE', y: 0},
					{name: 'Remedies', color: '#00BE8E', y: 0},
					{name: 'Issues', color: '#FF7C00', y: 0},
					{name: 'Amenities', color: '#F8D50D', y: 0},
					{name: 'Purchase Consideration', color: '#790C2A', y: 0}
				]
			}
		];

		this.reportData.dataPoints.forEach(dp => {
			if (dp.x !== 'Top Keywords') {
				dp.ys.forEach(y => {
					switch (y.label) {
						case 'Products':
							series[0].data[0].y += y.value;
							break;
						case 'Brands':
							series[0].data[1].y += y.value;
							break;
						case 'Remedies':
							series[0].data[2].y += y.value;
							break;
						case 'Issues':
							series[0].data[3].y += y.value;
							break;
						case 'Amenities':
							series[0].data[4].y += y.value;
							break;
						case 'Purchase Consideration':
							series[0].data[5].y += y.value;
							break;
					}
				});
			}
		});

		if (environment.insightViewIdsForMilestones.has(this.insightViewId)) {
			series[0].data[0].name = environment.insightViewIdsForMilestones.get(this.insightViewId).altTooltipHeader;
		}

		this.reportData.chartOptions.series = series;

		this.isEmpty = !(
			this.reportData.dataPoints
				.filter(dp => dp.x !== 'Top Keywords')
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
