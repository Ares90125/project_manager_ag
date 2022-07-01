import {
	ApplicationRef,
	Component,
	ComponentFactoryResolver,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import Highcharts from 'highcharts';
import _ from 'lodash';

import {
	CategoriesSelectionChange,
	ReferenceConversations
} from '../../brand-share-of-voice/stacked-bar-chart/stacked-bar-chart.component';

export interface IPieChartData {
	name: string;
	y: number;
	color: string;
	showReferenceConversation?: boolean;
}

@Component({
	selector: 'app-engagement-insight-chart',
	templateUrl: './engagement-insight-chart.component.html',
	styleUrls: ['./engagement-insight-chart.component.scss']
})
export class EngagementInsightChartComponent implements OnInit, OnDestroy, OnChanges {
	@Input()
	content: IPieChartData[];

	@Input()
	brandName: string;

	@Input()
	isBrandLoggedIn = false;

	@Input()
	referenceConversations: ReferenceConversations;

	/**
	 * @description Based on the status of this flag, we decided whether to show the border or not
	 * on legendList.
	 */

	scrollExistsonLegendList = false;

	Highcharts: typeof Highcharts = Highcharts;
	updateFlag = false;
	oneToOneFlag = true;
	runOutsideAngularFlag = false;
	chartHeight = 0;
	@Output()
	categoriesSelectionChange = new EventEmitter<CategoriesSelectionChange>(null);
	@Output()
	arcClicked = new EventEmitter<any>(null);
	chart: Highcharts.Chart;
	isAllZerroValues = false;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private injector: Injector,
		private appRef: ApplicationRef
	) {}

	ngOnInit(): void {
		this.setNewChartConfig(this.content);
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.content && !_.isEqual(change.content.currentValue, change.content.previousValue)) {
			this.updateChart(change.content.currentValue);
		}
	}

	onClickingCategoryBar = (data: Highcharts.SeriesClickEventObject) => {
		return this.arcClicked.emit({
			name: data.point.name,
			percentage: data.point.percentage
		});
	};

	chartOptions = {
		lang: {
			noData: 'No Data is available in the chart'
		},
		chart: {
			type: 'pie',
			plotShadow: false
		},
		credits: {
			enabled: false
		},
		plotOptions: {
			pie: {
				innerSize: '60%',
				borderWidth: 8,
				borderColor: null,
				slicedOffset: 16,
				dataLabels: {
					connectorWidth: 0,
					enabled: false
				},
				events: {
					click: (event: Highcharts.SeriesClickEventObject) => {
						this.onClickingCategoryBar(event);
					}
				}
			}
		},

		title: {
			verticalAlign: 'middle',
			floating: true,
			text: ''
		},
		legend: {
			enabled: false
		},
		series: [
			{
				states: {hover: {halo: {size: 0}}},
				name: '',
				data: [
					{name: 'A', y: 50, color: 'red'},
					{name: 'B', y: 50, color: 'green'}
				],
				innerSize: '60%',
				showInLegend: true,
				dataLabels: {
					enabled: false
				}
			}
		],
		tooltip: {
			borderWidth: 0,
			borderRadius: 10,
			backgroundColor: '#33334F',
			color: 'white',
			enabled: true,
			useHTML: true,
			formatter: function (tooltip) {
				if (this.point.disableTooltip) {
					return false;
				}
				const header = `<div class='tooltip-container'> 
				<div class='row'>
        	<span class='color' style='background: ${this.color}; '></span> 
          <span class='label-name'> ${this.key} </span>
          <span class='label-value'>${this.y}%</span>
        </div>
				 ${this.point.showReferenceConversation ? 'Click to view the reference conversation' : ''} 
					
				</div>`;
				return header;
			}
		}
	};

	updateChart(data: any) {
		if (!this.chart) {
			return;
		}
		this.setNewChartConfig(data);
		while (this.chart.series.length) {
			this.chart.series[0].remove();
		}
		let i = 0;
		while (i < this.chartOptions.series.length) {
			this.chart.addSeries(this.chartOptions.series[i++] as any);
		}
	}

	setNewChartConfig(content: IPieChartData[]) {
		this.chartOptions.series[0].data = content;
		this.isAllZerroValues = !content.some(data => data.y);
	}

	onChartCreated = (chart: Highcharts.Chart) => {
		this.chart = chart;
	};

	ngOnDestroy(): void {
		if (this.chart?.series) {
			this.chart?.destroy();
		}
	}
}
