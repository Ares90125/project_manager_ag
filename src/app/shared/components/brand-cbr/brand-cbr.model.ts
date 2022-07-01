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
				}
			}
		],
		yAxis: [
			{
				// Primary yAxis
				labels: {
					format: '{value}',
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
					format: '{value}',
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
		tooltip: {
			shared: true
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
				name: '',
				type: 'column',
				yAxis: 1,
				data: [],
				tooltip: {
					valueSuffix: ''
				}
			},
			{
				name: '',
				type: 'spline',
				yAxis: 2,
				data: [],
				marker: {
					enabled: false
				},
				dashStyle: 'LongDash',
				tooltip: {
					valueSuffix: ''
				}
			},
			{
				name: '',
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
			}
		},
		yAxis: {
			title: {
				text: ''
			}
		},
		series: [
			{
				pointWidth: 48,
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
				data: []
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
			headerFormat: '<b>{point.x}</b><br/>',
			pointFormat: '{point.y}'
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				dataLabels: {
					enabled: true
				}
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
