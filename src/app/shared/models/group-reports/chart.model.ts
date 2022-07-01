export class PieChartModel {
	chartOptions = {
		colors: [
			'#08B99C',
			'#FD9433',
			'#2EAADF',
			'#E4007C',
			'#318175',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			plotBorderWidth: null,
			plotShadow: false,
			height: 300
		},
		title: {
			text: '',
			align: 'center',
			verticalAlign: 'bottom',
			margin: 50,
			floating: true,
			style: {
				fontFamily: 'Roboto',
				fontWeight: 500,
				fontSize: '15px',
				color: 'rgba(57, 62, 67, .8)',
				textTransform: 'none'
			}
		},
		tooltip: {
			pointFormat: '<span style="color:{point.color}">\u25CF</span> <span><b>{point.name}: </span>{point.y:,.0f}<br/>',
			enabled: true
		},
		plotOptions: {
			pie: {
				point: {
					events: {legendItemClick: e => false}
				},
				allowPointSelect: false,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '{point.percentage:.1f}%',
					distance: -25,
					color: 'white',
					filter: {
						property: 'percentage',
						operator: '>',
						value: 4
					}
				},
				showInLegend: false
			}
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		series: [
			{
				type: 'pie',
				name: '',
				data: []
			}
		]
	};

	constructor() {}
}

export class ColumnChartModel {
	chartOptions = {
		colors: [
			'#08B99C',
			'#FD9433',
			'#2EAADF',
			'#E4007C',
			'#318175',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			type: 'column',
			height: 300
		},
		title: {
			text: ''
		},
		tooltip: {
			headerFormat: '<span>{series.name}</span><br/>',
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{point.category}: </span>{point.y:,.0f}<br/>',
			enabled: true
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			allowDecimals: false,
			min: 0,
			title: {
				text: ''
			}
		},
		plotOptions: {
			column: {
				events: {legendItemClick: e => false},
				stacking: 'normal',
				dataLabels: {
					enabled: ''
				}
			}
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		series: [
			{name: 'comments', data: [], color: '#13d2ec', stack: 'comments'},
			{name: 'posts', data: [], color: '#41d079', stack: 'posts'},
			{name: 'reactions', data: [], color: '#f9dd3d', stack: 'shares'}
		]
	};

	constructor() {}
}

export class StackedColumnChartModel {
	chartOptions = {
		colors: [
			'#08B99C',
			'#FD9433',
			'#2EAADF',
			'#E4007C',
			'#318175',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			type: 'column'
		},
		title: {
			text: ''
		},
		subtitle: {
			text: ''
		},
		legend: {
			align: 'right',
			verticalAlign: 'middle',
			width: 300,
			height: 600,
			layout: 'vertical',
			backgroundColor: '#F4F6F8',
			borderWidth: 1,
			itemStyle: {
				color: '#000000'
			}
		},
		xAxis: {
			categories: [],
			title: {
				text: null
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: '',
				align: 'high'
			},
			labels: {
				overflow: 'justify'
			}
		},
		tooltip: {
			valueSuffix: ''
		},
		plotOptions: {
			column: {
				dataLabels: {
					enabled: true
				}
			},
			series: {
				pointWidth: '40',
				stacking: 'percent'
			}
		},
		credits: {
			enabled: false
		},
		series: []
	};

	constructor() {}
}

export class BarChartModel {
	chartOptions = {
		colors: [
			'#08B99C',
			'#FD9433',
			'#2EAADF',
			'#E4007C',
			'#318175',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			type: 'bar',
			height: 300
		},
		title: {
			text: ''
		},
		tooltip: {
			headerFormat: '<span>{series.name}</span><br/>',
			pointFormat:
				'<span style="color:{point.color}">\u25CF</span> <span><b>{point.category}: </span>{point.y:,.0f}<br/>',
			enabled: true
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			allowDecimals: false,
			min: 0,
			title: {
				text: ''
			}
		},
		plotOptions: {
			series: {
				events: {legendItemClick: e => false},
				stacking: 'normal'
			}
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		series: [
			{name: 'comments', data: [], color: '#13d2ec', stack: 'comments'},
			{name: 'posts', data: [], color: '#41d079', stack: 'posts'},
			{name: 'reactions', data: [], color: '#f9dd3d', stack: 'shares'}
		]
	};

	constructor() {}
}

export class AreaChartModel {
	chartOptions = {
		colors: [
			'#08B99C',
			'#FD9433',
			'#2EAADF',
			'#E4007C',
			'#318175',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			type: 'area',
			height: 300
		},
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			allowDecimals: false,
			title: {
				text: ''
			},
			labels: {
				enabled: true
			},
			min: 0
		},
		tooltip: {
			enabled: true
		},
		plotOptions: {
			area: {
				events: {legendItemClick: e => false},
				fillOpacity: 0.5
			}
		},
		series: [
			{
				name: 'memberGrowth',
				data: []
			}
		]
	};

	constructor() {}
}

export class WordCloudChartModel {
	chartOptions = {
		colors: [
			'#08B99C',
			'#FD9433',
			'#2EAADF',
			'#E4007C',
			'#318175',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			height: 300
		},
		title: {
			text: ''
		},
		series: [
			{
				type: 'wordcloud',
				data: [],
				name: 'Occurrences'
			}
		],
		credits: {
			enabled: false
		},
		tooltip: {
			enabled: true
		}
	};
}

export class SunBurstModel {
	chartOptions = {
		colors: [
			'#3654FF',
			'#B7B7DC',
			'#A0A0C2',
			'#76768D',
			'#646475',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			height: 200
		},
		title: {
			text: ''
		},
		tooltip: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		series: [
			{
				type: 'sunburst',
				data: [],
				allowDrillToNode: false,
				cursor: 'pointer',
				dataLabels: {
					format: '{point.name}',
					filter: {
						property: 'innerArcLength',
						operator: '>',
						value: 0
					},
					rotationMode: 'circular'
				},
				levels: [
					{
						level: 1,
						levelIsConstant: false,
						dataLabels: {
							filter: {
								property: 'outerArcLength',
								operator: '>',
								value: 0
							}
						}
					}
				]
			}
		]
	};

	constructor() {}
}

export class CircularModel {
	chartOptions = {
		colors: [
			'#3654FF',
			'#B7B7DC',
			'#A0A0C2',
			'#76768D',
			'#646475',
			'#DE356A',
			'#917EBE',
			'#5F818A',
			'#1872A4',
			'#688C40',
			'#930077',
			'#BDBE35',
			'#164D3F',
			'#3365A5',
			'#790C2A',
			'#BB1542',
			'#363B4E',
			'#68A7AB',
			'#204177',
			'#983A3B',
			'#4F3A77',
			'#387559',
			'#CA5FA6',
			'#2D3A87',
			'#790C2A',
			'#2BC4CB',
			'#540E33',
			'#FA8282',
			'#156A79',
			'#36585E'
		],
		chart: {
			type: 'column',
			inverted: true,
			polar: true,
			height: 200
		},
		title: {
			text: ''
		},
		tooltip: {
			outside: false,
			enabled: false
		},
		pane: {
			size: '85%',
			innerSize: '60%',
			endAngle: 360
		},
		xAxis: {
			tickInterval: 1,
			labels: {
				align: 'right',
				useHTML: true,
				allowOverlap: false,
				step: 1,
				y: 2,
				style: {
					fontSize: '13px'
				}
			},
			lineWidth: 0,
			categories: ['']
		},
		yAxis: {
			crosshair: {
				enabled: false,
				color: '#333'
			},
			labels: {
				enabled: false
			},
			lineWidth: 0,
			tickInterval: 0,
			reversedStacks: false,
			endOnTick: false,
			showLastLabel: false
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				borderWidth: 0,
				pointPadding: 0,
				groupPadding: 0
			}
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		series: []
	};

	constructor() {}
}
