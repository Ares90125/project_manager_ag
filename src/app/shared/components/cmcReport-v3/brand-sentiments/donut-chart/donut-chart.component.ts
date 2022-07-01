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

export interface StackedBarGraphConent {
	afterSOV: {};
	beforeSOV: {};
	duringSOV: {};
	nonHashTag: {};
}

export type CategoryKeys = keyof StackedBarGraphConent;
export type CategoriesSelectionChange = Partial<Record<CategoryKeys, boolean>>;
export type ReferenceConversations = Partial<Record<CategoryKeys, boolean>>;
const campaginCategories = ['Pre-campaign', 'During Campaign', 'Post-campaign', 'Non-hastag'] as const;
export type CategoryNames = typeof campaginCategories[number];

export interface PieSeriesData {
	name?: string;
	y?: number;
	color?: string;
	sliced?: true;
	showReferenceConversation?: boolean;
	disableTooltip?: boolean;
}

export interface PieSeries {
	data: PieSeriesData[];
}

@Component({
	selector: 'app-donut-chart',
	templateUrl: './donut-chart.component.html',
	styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit, OnDestroy, OnChanges {
	@Input()
	content: PieSeries[];

	@Input()
	period: string;

	@Input()
	brandName: string;

	@Input()
	showpreCampaign = false;
	@Input()
	showduringCampaign = false;
	@Input()
	showAfterCampaign = false;

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

	onClickingCategoryBar = data => {
		return this.arcClicked.emit({
			name: data.point.name,
			type: this.period,
			percentage: data.point.percentage
		});
	};

	chartOptions = {
		chart: {
			type: 'pie',
			plotShadow: false
		},
		credits: {
			enabled: false
		},
		plotOptions: {
			pie: {
				innerSize: '100%',
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
		legend: {},
		series: [],
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
				const header = `<div class="tooltip-container"> 
				<div class="row">
        	<span class="color" style="background: ${this.color}; "></span> 
          <span class="label-name"> ${this.key} </span>
          <span class="label-value">${this.y}%</span>
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
			this.chart.addSeries(this.chartOptions.series[i++]);
		}
	}

	setNewChartConfig(content: PieSeries[]) {
		this.chartOptions.series = content;
	}

	onChartCreated = (chart: Highcharts.Chart) => {
		this.chart = chart;
		this.chart.setSize(this.chart.chartWidth, this.chartHeight);
	};

	ngOnDestroy(): void {
		if (this.chart?.series) {
			this.chart?.destroy();
		}
	}
}
