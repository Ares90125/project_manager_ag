import Highcharts from 'highcharts';

export class ColumnAndGroupedLineChart {
	chartOptions = {
		credits: {
			enabled: false
		},
		colors: ['#9999A7', '#3654FF', '#27AE60'],
		chart: {
			zoomType: 'xy',
			backgroundColor: '#F9FAFB'
		},
		xAxis: [
			{
				categories: [],
				crosshair: true,
				title: {
					text: 'Timeline',
					style: {
						color: '#707084'
					}
				},
				labels: {
					rotation: 0
				}
			}
		],
		yAxis: [
			{
				// Primary yAxis
				labels: {
					style: {
						color: '#27AE60'
					}
				},
				title: {
					text: 'Aggregate Values',
					style: {
						color: '#27AE60'
					}
				},
				opposite: true
			},
			{
				// Secondary yAxis
				gridLineWidth: 0,
				title: {
					text: 'Absolute Values',
					style: {
						color: '#9999A7'
					}
				},
				labels: {
					style: {
						color: '#9999A7'
					}
				}
			},
			{
				// Tertiary yAxis
				visible: false,
				gridLineWidth: 0,
				labels: {
					format: '{value}',
					style: {
						color: '#3654FF'
					}
				},
				opposite: true
			}
		],
		title: {
			text: ''
		},
		plotOptions: {
			column: {
				dataLabels: {
					enabled: true,
					color: '#707084'
				}
			}
		},
		tooltip: {
			pointFormat: '<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		},
		legend: {
			enabled: false,
			layout: 'vertical',
			align: 'left',
			x: 80,
			verticalAlign: 'top',
			y: 55,
			floating: true,
			backgroundColor:
				Highcharts.defaultOptions.legend.backgroundColor || // theme
				'rgba(255,255,255,0.25)'
		},
		series: [
			{
				pointWidth: 48,
				name: 'Absolute',
				type: 'column',
				yAxis: 1,
				data: [],
				tooltip: {
					valueSuffix: ''
				}
			},
			{
				marker: {
					symbol: 'c-rect',
					lineWidth: 3,
					lineColor: '#3754ff',
					radius: 20
				},
				type: 'scatter',
				yAxis: 1,
				data: [],
				name: 'Target'
			},
			{
				name: 'Aggregate',
				type: 'spline',
				data: [7.0, 6.9, 9.5, 14.5],
				tooltip: {
					valueSuffix: ''
				}
			}
		],
		responsive: {
			rules: [
				{
					condition: {
						maxWidth: 500
					},
					chartOptions: {
						legend: {
							floating: false,
							layout: 'horizontal',
							align: 'center',
							verticalAlign: 'bottom',
							x: 0,
							y: 0
						},
						yAxis: [
							{
								labels: {
									align: 'right',
									x: 0,
									y: -6
								},
								showLastLabel: false
							},
							{
								labels: {
									align: 'left',
									x: 0,
									y: -6
								},
								showLastLabel: false
							},
							{
								visible: false
							}
						]
					}
				}
			]
		}
	};
}

export class ColumnWIthTargetChart {
	chartOptions = {
		credits: {
			enabled: false
		},
		colors: ['#9999A7', '#3654FF', '#27AE60'],
		chart: {
			type: 'column',
			backgroundColor: '#F9FAFB'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: [],
			title: {
				text: 'Timeline'
			},
			labels: {
				rotation: 0
			}
		},
		yAxis: {
			title: {
				text: ''
			}
		},
		plotOptions: {
			column: {
				dataLabels: {
					enabled: true,
					color: '#707084'
				}
			}
		},
		tooltip: {
			pointFormat: '<span style="color:{point.color}">\u25CF</span> <span><b>{series.name}: </span>{point.y:,.0f}<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		},
		series: [
			{
				pointWidth: 48,
				name: 'Absolute',
				type: 'column',
				data: [],
				tooltip: {
					valueSuffix: ''
				}
			},
			{
				marker: {
					symbol: 'c-rect',
					lineWidth: 3,
					lineColor: '#3754ff',
					radius: 20
				},
				type: 'scatter',
				data: [],
				name: 'Target'
			}
		],
		legend: {
			enabled: false
		}
	};
}

export class ColumnStackedChart {
	chartOptions = {
		credits: {
			enabled: false
		},
		chart: {
			type: 'column',
			backgroundColor: '#F9FAFB'
		},
		colors: ['#98DF8A', '#E48686'],
		title: {
			text: ''
		},
		xAxis: {
			categories: [],
			title: {
				text: 'Timeline'
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Number of Surveys'
			},
			stackLabels: {
				enabled: true,
				style: {
					fontWeight: 'bold',
					color:
						// theme
						(Highcharts.defaultOptions.title.style && Highcharts.defaultOptions.title.style.color) || 'gray'
				}
			}
		},
		legend: {
			enabled: false,
			align: 'right',
			x: -30,
			verticalAlign: 'top',
			y: 25,
			floating: true,
			backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
			borderColor: '#CCC',
			borderWidth: 1,
			shadow: false
		},
		tooltip: {
			pointFormat:
				'<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
			shared: true,
			backgroundColor: 'rgba(0, 0, 0, 0.85)',
			style: {
				color: '#F0F0F0'
			}
		},
		plotOptions: {
			column: {
				stacking: 'percent'
			}
		},
		series: [
			{
				name: 'Accepted',
				data: []
			},
			{
				name: 'Declined',
				data: []
			}
		]
	};
}
export class ActiveUsersOptions {
	chartOptions = {
		credits: {
			enabled: false
		},
		colors: ['#9999A7', '#3654FF', '#27AE60'],
		chart: {
			type: 'column',
			backgroundColor: '#F9FAFB'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: [],
			title: {
				text: 'Timeline'
			}
		},
		yAxis: {
			title: {
				text: 'Number of Users'
			}
		},
		series: [
			{
				pointWidth: 48,
				data: [29.9, 71.5, 106.4, 129.2]
			},
			{
				marker: {
					symbol: 'c-rect',
					lineWidth: 3,
					lineColor: '#3754ff',
					radius: 20
				},
				type: 'scatter',
				data: [29.9, 71.5, 106.4, 129.2].reverse()
			}
		],
		legend: {
			enabled: false
		}
	};
}
export class ActiveUsersPercentageOptions {
	chartOptions = {
		credits: {
			enabled: false
		},
		colors: ['#9999A7', '#3654FF', '#27AE60'],
		chart: {
			type: 'column',
			backgroundColor: '#F9FAFB'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: [],
			title: {
				text: 'Timeline'
			}
		},
		yAxis: {
			title: {
				text: 'Percentage of Users'
			}
		},
		series: [
			{
				pointWidth: 48,
				data: [29.9, 71.5, 106.4, 129.2]
			},
			{
				marker: {
					symbol: 'c-rect',
					lineWidth: 3,
					lineColor: '#3754ff',
					radius: 20
				},
				type: 'scatter',
				data: [29.9, 71.5, 106.4, 129.2].reverse()
			}
		],
		legend: {
			enabled: false
		}
	};
}

export enum SelectedTimePeriod {
	fourWeeks = 'fourWeeks',
	threeMonths = 'threeMonths',
	sixMonths = 'sixMonths',
	oneYear = 'oneYear',
	lifetime = 'lifetime'
}
