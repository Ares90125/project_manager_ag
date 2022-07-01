import {ComponentPortal, DomPortalOutlet} from '@angular/cdk/portal';
import {
	ApplicationRef,
	Component,
	ComponentFactoryResolver,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import * as Highcharts from 'highcharts';
import * as _ from 'lodash';

export interface StackedBarGraphConent {
	afterSOV: {};
	beforeSOV: {};
	duringSOV: {};
	nonHashTag: {};
}

export type CategoryKeys = keyof StackedBarGraphConent;
export type CategoriesSelectionChange = Partial<Record<CategoryKeys, boolean>>;
export type ReferenceConversations = Partial<Record<CategoryKeys, {[brandName: string]: boolean}>>;
const campaginCategories = ['Pre-Campaign', 'During Campaign', 'Post-Campaign', 'Non-Hastag'] as const;
export type CategoryNames = typeof campaginCategories[number];

@Component({
	selector: 'app-stacked-bar-chart',
	templateUrl: './stacked-bar-chart.component.html',
	styleUrls: ['./stacked-bar-chart.component.scss']
})
export class ShareofVoiceStackedBarChartComponent implements OnInit, OnDestroy, OnChanges {
	@Input()
	content: StackedBarGraphConent;
	@Input()
	brandName: string;

	@Input()
	showpreCampaign = false;
	@Input()
	showduringCampaign = false;
	@Input()
	showAfterCampaign = false;
	@Input()
	showNonHastag = false;
	@Input()
	isBrandLoggedIn = false;

	@Input()
	disableToggle = true;

	@Input()
	referenceConversations: ReferenceConversations;

	@ViewChild('legendList')
	legendList: ElementRef<HTMLUListElement>;

	/**
	 * @description Based on the status of this flag, we decided whether to show the border or not
	 * on legendList.
	 */

	scrollExistsonLegendList = false;

	Highcharts: typeof Highcharts = Highcharts;

	ChartColors = [
		'#2CA02C',
		'#1F77B4',
		'#B23333',
		'#9467BD',
		'#17BECF',
		'#BCBD22',
		'#8C564B',
		'#FF7F0E',
		'#C5B0D5',
		'#E377C2',
		'#98DF8A',
		'#FFBB78',
		'#F7B6D2',
		'#DBDB8D',
		'#9EDAE5',
		'#7F7F7F'
	];
	updateFlag = false;
	oneToOneFlag = true;
	runOutsideAngularFlag = false;
	chartHeight = 0;
	@Output()
	categoriesSelectionChange = new EventEmitter<CategoriesSelectionChange>(null);
	@Output()
	categoryBarClicked = new EventEmitter<any>(null);
	chart: Highcharts.Chart;
	toggleMapper: {[key in CategoryNames]?: MatSlideToggle} = {};

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private injector: Injector,
		private appRef: ApplicationRef
	) {}

	ngOnInit(): void {
		this.calculateChartHeight();
		this.setNewChartConfig(this.content);
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.content && !_.isEqual(change.content.currentValue, change.content.previousValue)) {
			this.updateChart(change.content.currentValue);
		}

		if (
			change.referenceConversations &&
			!_.isEqual(change.referenceConversations.currentValue, change.referenceConversations.previousValue) &&
			this.chart
		) {
			setTimeout(() => this.updateChart(this.content));
		}

		if (
			change.showpreCampaign &&
			!_.isEqual(change.showpreCampaign.currentValue, change.showpreCampaign.previousValue)
		) {
			if (this.toggleMapper[campaginCategories[0]]) {
				this.toggleMapper[campaginCategories[0]].checked = change.showpreCampaign.currentValue;
			}
		}

		if (
			change.showduringCampaign &&
			!_.isEqual(change.showduringCampaign.currentValue, change.showduringCampaign.previousValue)
		) {
			if (this.toggleMapper[campaginCategories[1]]) {
				this.toggleMapper[campaginCategories[1]].checked = change.showduringCampaign.currentValue;
			}
		}

		if (
			change.showAfterCampaign &&
			!_.isEqual(change.showAfterCampaign.currentValue, change.showAfterCampaign.previousValue)
		) {
			if (this.toggleMapper[campaginCategories[2]]) {
				this.toggleMapper[campaginCategories[2]].checked = change.showAfterCampaign.currentValue;
			}
		}

		if (change.showNonHastag && !_.isEqual(change.showNonHastag.currentValue, change.showNonHastag.previousValue)) {
			if (this.toggleMapper[campaginCategories[3]]) {
				this.toggleMapper[campaginCategories[3]].checked = change.showNonHastag.currentValue;
			}
		}

		if (change.disableToggle && !_.isEqual(change.disableToggle.currentValue, change.disableToggle.previousValue)) {
			this.updateToggleState(change.disableToggle.currentValue);
		}
	}

	onClickingCategoryBar = data => {
		const category: CategoryNames = data.point.category as any;

		return this.categoryBarClicked.emit({
			brandName: data.point.brandName,
			type: category,
			percentage: data.point.percentage
		});
	};

	chartOptions = {
		chart: {
			type: 'bar',
			backgroundColor: 'rgba(0,0,0,0)'
		},
		title: {
			text: undefined
		},
		legend: {
			enabled: false,
			maxheight: 50,
			width: '30%',
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			x: 300,
			y: 100,
			floating: true,
			borderWidth: 1,
			borderColor: '#F2F2F4',
			borderRadius: 4,
			backgroundColor: '#FBFCFD',
			itemCheckboxStyle: {width: '13px', height: '13px', position: 'absolute'},
			shadow: false,
			title: {
				text: 'Legends'
			},
			symbolWidth: 10,
			symbolHeight: 10,
			symbolRadius: 0,
			squareSymbol: false,
			itemMarginTop: 10,
			itemMarginBottom: 5,
			itemMarginLeft: 10,
			padding: 10
		},
		xAxis: {
			categories: [],
			title: {
				text: undefined
			},
			labels: {
				color: '#fff',
				x: -30,
				useHTML: true,
				formatter: data => {
					const span = `<span class="sov-bar-column-${data.value}"> <span class="category-name mr-2">${data.value}</span> </span>`;
					return span;
				}
			}
		},
		yAxis: {
			gridLineWidth: 0,
			lineWidth: 1,
			min: 0,
			max: 100,
			tickInterval: 25,
			title: {
				text: '',
				align: 'high'
			},
			labels: {
				overflow: 'justify',
				formatter: function (data) {
					return `${this.value}%`;
				}
			}
		},
		tooltip: {
			borderWidth: 0,
			borderRadius: 10,
			backgroundColor: '#33334F',
			color: 'white',
			enabled: true,
			useHTML: true,
			formatter: function (tooltip) {
				const header = `<div class="tooltip-container"> 
				<div class="row">
        	<span class="color" style="background: ${this.color}"></span> 
          <span class="label-name"> ${this.series?.name} </span>
          <span class="label-value">${this.y}%</span>
        </div>
       ${
					this.point.showReferenceConversation && this.series?.name === this.point.brandName
						? 'Click to view the reference conversation'
						: ''
				} 
					
				</div>`;
				return header;
			},
			positioner: function (boxWidth, boxHeight, point) {
				return {x: point.plotX + 70, y: point.plotY + 37 / 2};
			}
		},
		colors: [],
		plotOptions: {
			bar: {
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					formatter: function () {
						return this.y < 5 ? null : `<span style="color: white">${this.y}%</span>`;
					}
				}
			},
			series: {
				events: {
					click: (event: Highcharts.SeriesClickEventObject) => {
						this.onClickingCategoryBar(event);
					}
				},
				stacking: 'normal',
				borderWidth: 0,
				pointWidth: 30,
				states: {
					hover: {
						enabled: false
					},
					inactive: {
						opacity: 1
					}
				}
			}
		},
		credits: {
			enabled: false
		},
		series: []
	};

	updateChart(data: StackedBarGraphConent) {
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
		this.onChartCreated(this.chart);
	}

	setNewChartConfig(content: StackedBarGraphConent) {
		const duringList = this.sortList(content.duringSOV);
		const beforeList = this.sortList(content.beforeSOV);
		const afterList = this.sortList(content.afterSOV);
		const nonHashTagList = this.sortList(content.nonHashTag);
		const newSeries = this.calculateNewChartSeries(beforeList, duringList, afterList, nonHashTagList, content);

		this.chartOptions.xAxis.categories = this.getCategoriesListToShow();
		this.chartOptions.xAxis.labels.x = !this.isBrandLoggedIn ? -50 : -10;
		this.chartOptions.series = [...newSeries];
	}

	calculateNewChartSeries(beforeList: any[], duringList: any[], afterList: any[], nonHashTagList: any[], content) {
		return duringList.map((obj, index) => {
			const seriesData: {y: number; brandName: string; showReferenceConversation: boolean}[] = [];
			if (obj.key == 'Others') {
				if (this.showpreCampaign || !this.isBrandLoggedIn) {
					seriesData.push({
						y: beforeList[0].value as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.beforeSOV[obj.key]
					});
				}
				if (this.showduringCampaign || !this.isBrandLoggedIn) {
					seriesData.push({
						y: duringList[0].value as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.duringSOV[obj.key]
					});
				}
				if (this.showAfterCampaign || !this.isBrandLoggedIn) {
					seriesData.push({
						y: afterList[0].value as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.afterSOV[obj.key]
					});
				}
				if (this.showNonHastag || !this.isBrandLoggedIn) {
					seriesData.push({
						y: nonHashTagList[0].value as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.nonHashTag[obj.key]
					});
				}
			} else {
				if (this.showpreCampaign || !this.isBrandLoggedIn) {
					seriesData.push({
						y: content.beforeSOV[obj.key] as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.beforeSOV[obj.key]
					});
				}
				if (this.showduringCampaign || !this.isBrandLoggedIn) {
					seriesData.push({
						y: content.duringSOV[obj.key] as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.duringSOV[obj.key]
					});
				}
				if (this.showAfterCampaign || !this.isBrandLoggedIn) {
					seriesData.push({
						y: content.afterSOV[obj.key] as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.afterSOV[obj.key]
					});
				}
				if (this.showNonHastag || !this.isBrandLoggedIn) {
					seriesData.push({
						y: content.nonHashTag[obj.key] as number,
						brandName: obj.key,
						showReferenceConversation: this.referenceConversations?.nonHashTag[obj.key]
					});
				}
			}
			let color: String;
			if (obj.key === 'Others') {
				color = this.ChartColors[this.ChartColors.length - 1];
			} else if (obj.key == this.brandName) {
				color = this.ChartColors[0];
			} else {
				const length = duringList.length - 1;
				color = this.ChartColors[length - index];
			}
			const newObj = {
				name: obj.key,
				showLegend: false,
				data: seriesData,
				color
			};
			return newObj;
		});
	}

	getCategoriesListToShow() {
		const list: CategoryNames[] = [];
		if (this.showpreCampaign || !this.isBrandLoggedIn) {
			list.push(campaginCategories[0]);
		}
		if (this.showduringCampaign || !this.isBrandLoggedIn) {
			list.push(campaginCategories[1]);
		}
		if (this.showAfterCampaign || !this.isBrandLoggedIn) {
			list.push(campaginCategories[2]);
		}
		if (this.showNonHastag || !this.isBrandLoggedIn) {
			list.push(campaginCategories[3]);
		}
		return list;
	}

	sortList(data: {[key: string]: number}) {
		let list = [];
		for (const [key, value] of Object.entries(data)) {
			list.push({key, value: value as number});
		}
		return list.sort((catA, catB) => {
			if (catA.key === 'Others') {
				return -1;
			}
			if (catB.key === 'Others') {
				return 1;
			}
			if (catA.key === this.brandName) {
				return 1;
			}
			if (catB.key === this.brandName) {
				return -1;
			}
			if (catA.value !== catB.value) {
				return catA.value - catB.value;
			}
			return catA.key.localeCompare(catB.key);
		});
	}

	calculateChartHeight() {
		this.chartHeight = 0;
		if (this.showpreCampaign || !this.isBrandLoggedIn) {
			this.chartHeight += 100;
		}
		if (this.showduringCampaign || !this.isBrandLoggedIn) {
			this.chartHeight += 100;
		}
		if (this.showAfterCampaign || !this.isBrandLoggedIn) {
			this.chartHeight += 100;
		}
		if (this.showNonHastag || !this.isBrandLoggedIn) {
			this.chartHeight += 100;
		}
	}

	onChartCreated = (chart: Highcharts.Chart) => {
		this.chart = chart;
		this.chart.setSize(this.chart.chartWidth, this.chartHeight);
		if (!this.isBrandLoggedIn) {
			chart.axes[0].categories.forEach((category: CategoryNames) => this.addToggle(category));
		}
		setTimeout(() => {
			this.evaluateLegendListScroll();
			if (this.disableToggle) {
				this.updateToggleState(true);
			}
		});
	};

	updateToggleState(disable: boolean) {
		if (!this.toggleMapper) {
			return;
		}
		for (const [category, toggleInstance] of Object.entries(this.toggleMapper)) {
			toggleInstance.setDisabledState(disable);
		}
	}

	addToggle(category: CategoryNames) {
		const toggleComponent = new ComponentPortal(MatSlideToggle);

		const TogglePortalOutlet = new DomPortalOutlet(
			document.querySelector(`span[class^="sov-bar-column-${category}"]`),
			this.componentFactoryResolver,
			this.appRef,
			this.injector
		);
		const toggleInstancee = toggleComponent.attach(TogglePortalOutlet).instance;
		this.toggleMapper[category] = toggleInstancee;
		switch (category) {
			case 'Pre-Campaign':
				toggleInstancee.checked = this.showpreCampaign;
				return toggleInstancee.change.subscribe(value =>
					this.categoriesSelectionChange.emit({beforeSOV: value.checked})
				);
			case 'During Campaign':
				toggleInstancee.checked = this.showduringCampaign;

				return toggleInstancee.change.subscribe(value =>
					this.categoriesSelectionChange.emit({duringSOV: value.checked})
				);
			case 'Post-Campaign':
				toggleInstancee.checked = this.showAfterCampaign;

				return toggleInstancee.change.subscribe(value =>
					this.categoriesSelectionChange.emit({afterSOV: value.checked})
				);
			case 'Non-Hastag':
				toggleInstancee.checked = this.showNonHastag;
				return toggleInstancee.change.subscribe(value =>
					this.categoriesSelectionChange.emit({nonHashTag: value.checked})
				);
			default:
				console.warn('invalid category toggled');
		}
	}

	addListenerToggle(toggleInstancee: MatSlideToggle, category: CategoryNames) {
		toggleInstancee.change.subscribe(value => {
			switch (category) {
				case 'Pre-Campaign':
					return this.categoriesSelectionChange.emit({beforeSOV: value.checked});
				case 'During Campaign':
					return this.categoriesSelectionChange.emit({duringSOV: value.checked});
				case 'Post-Campaign':
					return this.categoriesSelectionChange.emit({afterSOV: value.checked});
				case 'Non-Hastag':
					return this.categoriesSelectionChange.emit({nonHashTag: value.checked});
				default:
					console.warn('invalid category toggled');
			}
		});
	}

	ngOnDestroy(): void {
		if (this.chart?.series) {
			this.chart?.destroy();
		}
	}

	private evaluateLegendListScroll() {
		this.scrollExistsonLegendList =
			this.legendList.nativeElement.scrollHeight > this.legendList.nativeElement.clientHeight;
	}
}
