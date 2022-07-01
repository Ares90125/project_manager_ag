import {Component, Input} from '@angular/core';
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';

more(Highcharts);

@Component({
	selector: 'app-high-chart',
	template: `
		<div *ngIf="chartOptions">
			<highcharts-chart
				[Highcharts]="Highcharts"
				[options]="chartOptions"
				style="width: 100%; display: block;"
			></highcharts-chart>
		</div>
	`,
	styleUrls: ['./high-chart.component.scss']
})
export class HighChartComponent {
	Highcharts = Highcharts; // required
	public chartOptions: any;

	constructor() {}

	@Input()
	set chartData(data: any) {
		if (!data) {
			return;
		}

		this.applyChartOption(data);
	}

	private applyChartOption(chartData: any) {
		chartData.chart = chartData.chart;
		chartData.title = chartData.title;
		chartData.xAxis = chartData.xAxis;
		chartData.yAxis = chartData.yAxis;
		chartData.plotOptions = chartData.plotOptions;
		chartData.credits.enabled = chartData.credits ? chartData.credits.enabled || false : false;
		chartData.legend.enabled = chartData.legend ? chartData.legend.enabled || false : false;
		chartData.series = chartData.series;
		this.chartOptions = chartData;
	}
}
