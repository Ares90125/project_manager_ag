import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as Highcharts from 'highcharts';
import * as _ from 'lodash';

require('./rounded-corner')(Highcharts);

// HighchartRoundedCorners(Highcharts);

export interface KPIChartContent {
	preCampaign?: number;
	target?: number;
	achieved?: number;
}

@Component({
	selector: 'app-kpi-chart',
	templateUrl: './kpi-chart.component.html',
	styleUrls: ['./kpi-chart.component.scss']
})
export class KpiChartComponent implements OnInit, OnChanges {
	@Input()
	content: KPIChartContent;

	@Input()
	valueType: 'percentage' | 'number' = 'number';

	@ViewChild('legendList')
	legendList: ElementRef<HTMLUListElement>;

	/**
	 * @description Based on the status of this flag, we decided whether to show the border or not
	 * on legendList.
	 */

	scrollExistsonLegendList = false;

	Highcharts: typeof Highcharts = Highcharts;

	preCampaignSeries = {
		name: 'Pre-Campaign',
		color: '#a2dabbbd',

		data: [10],
		tooltip: {
			enabled: false
		},
		pointPadding: 0.4,
		pointPlacement: 0
	};
	targetSeries = {
		name: 'Target',
		color: '#001aaa57',
		borderRadiusTopLeft: '50px',
		borderRadiusTopRight: '50px',
		data: [null, 50],
		pointPadding: 0.3,
		pointPlacement: 0,
		tooltip: {
			enabled: false
		}
	};

	achievedSeries = {
		name: 'Achieved',
		color: '#27AE60',
		data: [null, 100],
		borderRadiusTopLeft: '50px',
		borderRadiusTopRight: '50px',
		pointPadding: 0.4,
		pointPlacement: 0,
		tooltip: {
			enabled: false
		}
	};

	chartOptions = {
		credits: {
			enabled: false
		},
		chart: {
			type: 'bar',
			backgroundColor: 'rgba(0,0,0,0)'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: ['Pre-Campaign', 'Achieved'],
			labels: {
				style: {
					fontSize: '1.2em'
				}
			},
			title: {
				useHTML: true,
				enabled: false,
				text: undefined
			}
		},
		yAxis: {
			tickAmount: 5,
			gridLineWidth: 0,
			lineWidth: 1,
			min: 0,
			title: {
				enabled: false,
				text: ''
			}
		},

		legend: {
			shadow: false,
			enabled: false
		},
		tooltip: {
			enabled: false
		},
		plotOptions: {
			bar: {
				grouping: false,
				shadow: false,
				borderWidth: 0
			},
			series: {
				states: {
					hover: {
						enabled: false
					},
					inactive: {
						opacity: 1
					}
				},
				dataLabels: {
					useHTML: true,
					enabled: true,
					y: -12,
					x: -15,
					formatter: function (op) {
						if (!this.y) {
							return null;
						}
						return `<span class="label ${this.series?.name} "> ${this.y} </span>`;
					}
				}
			}
		},
		series: [this.preCampaignSeries, this.achievedSeries, this.targetSeries]
	};

	updateFlag = false;
	oneToOneFlag = true;
	runOutsideAngularFlag = false;

	chart: Highcharts.Chart;

	constructor() {}

	ngOnInit(): void {
		this.chartOptions = this.updateChartOptionWithContent(this.content);
	}

	ngOnChanges(change: SimpleChanges) {
		if (!_.isEqual(change.content.currentValue, change.content.previousValue) && this.chart) {
			this.updateChart(change.content.currentValue);
		}
	}

	updateChartOptionWithContent(data: KPIChartContent) {
		const newConfig = {
			...this.chartOptions,
			series: [
				{...this.preCampaignSeries, data: [data.preCampaign || 0]},
				{...this.achievedSeries, data: [null, data.achieved || 0]},
				{...this.targetSeries, data: [null, data.target || 0]}
			]
		};
		const NumberFormatter = function (op) {
			if (!this.y) {
				return null;
			}
			return `<span class="label ${this.series?.name} "> ${this.y} </span>`;
		};

		const PercentageFormatter = function (op) {
			if (!this.y) {
				return null;
			}
			return `<span class="label ${this.series?.name} "> ${this.y}% </span>`;
		};

		newConfig.plotOptions.series.dataLabels.formatter =
			this.valueType === 'number' ? NumberFormatter : PercentageFormatter;

		return newConfig;
	}

	onChartCreated = (chart: Highcharts.Chart) => {
		this.chart = chart;
	};

	updateChart(data: KPIChartContent) {
		if (!this.chart) {
			return;
		}
		const series = this.updateChartOptionWithContent(data).series as unknown as Highcharts.SeriesOptionsType[];
		this.chart.update({series: series}, true);
	}
}
