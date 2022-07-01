import {Component, Input} from '@angular/core';
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';

more(Highcharts);

@Component({
	selector: 'app-chart',
	templateUrl: './chart.component.html',
	styleUrls: ['./chart.component.scss']
})
export class ChartComponent {
	Highcharts = Highcharts; // required
	public chartObject: any = null;
	private chartOptionsKeyName = null;

	constructor() {}

	@Input()
	set setChartObject(data: any) {
		this.chartObject = data;
	}

	@Input()
	set setChartOptionsKey(chartOptionsKeyName: string) {
		this.chartOptionsKeyName = chartOptionsKeyName;
	}

	public getChartOption() {
		const chartData =
			this.chartOptionsKeyName !== null
				? this.chartObject.reportData[this.chartOptionsKeyName]
				: this.chartObject.reportData.chartOptions;

		chartData.credits.enabled = chartData.credits ? chartData.credits.enabled || false : false;
		chartData.legend.enabled = chartData.legend ? chartData.legend.enabled || false : false;
		return chartData;
	}
}
