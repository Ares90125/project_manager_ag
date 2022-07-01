import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_WordCloud from 'highcharts/modules/wordcloud';
import * as _ from 'lodash';

HC_WordCloud(Highcharts);

export interface WordCloudData {
	name: string;
	weight: number;
	color: string;
}

export interface IWordCloudSeries {
	type: 'wordcloud';
	spiral: 'archimedean';
	name: 'Occurrences';
	data: WordCloudData[];
}

export interface IWordCloudChartOption {
	series: IWordCloudSeries[];
}

@Component({
	selector: 'app-wordcloud-chart',
	templateUrl: './wordcloud-chart.component.html',
	styleUrls: ['./wordcloud-chart.component.scss']
})
export class WordcloudChartComponent implements OnInit, OnChanges {
	@Input()
	content: WordCloudData[];

	Highcharts: typeof Highcharts = Highcharts;

	updateFlag = false;
	oneToOneFlag = true;
	runOutsideAngularFlag = false;
	chartHeight = 0;

	chart: Highcharts.Chart;
	chartOption = {
		tooltip: {
			enabled: false
		},
		chart: {
			backgroundColor: 'transparent'
		},
		credits: {
			enabled: false
		},
		title: {
			text: ''
		},
		legend: {
			shadow: false,
			enabled: false
		},
		series: [
			{
				minFontSize: 45,
				maxFontSize: 90,

				type: 'wordcloud',
				spiral: 'archimedean',
				data: [],
				name: ''
			}
		]
	};

	constructor() {}

	ngOnChanges(change: SimpleChanges) {
		if (!_.isEqual(change.content.currentValue, change.content.previousValue) && this.chart) {
			this.updateChart(change.content.currentValue);
		}
	}

	ngOnInit(): void {
		this.updateChartOption(this.content);
	}

	onChartCreated = (chart: Highcharts.Chart) => {
		this.chart = chart;
	};

	updateChart(content: WordCloudData[]) {
		if (!this.chart) {
			return null;
		}
		this.updateChartOption(content);
		while (this.chart.series.length) {
			this.chart.series[0].remove();
		}
		let i = 0;
		while (i < this.chartOption.series.length) {
			this.chart.addSeries(this.chartOption.series[i++] as any);
		}
	}

	private updateChartOption(data: WordCloudData[]) {
		this.chartOption.series[0].data = data;
	}
}
