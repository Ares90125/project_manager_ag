import {GroupMetricModel} from 'src/app/shared/models/group-metric.model';

export class ReportDataInputModel {
	metrics: GroupMetricModel[];
	frequency: string;
	months: any;

	constructor(metrics: GroupMetricModel[], weeklyOrMonthly: string, months = []) {
		this.metrics = metrics;
		this.frequency = weeklyOrMonthly;
		this.months = months;
	}
}

export class ReportDataOutputModel {
	dataPoints: DataPointModel[];
	keywordDataPoints;
	chartOptions;
	commentsChartOptions;
	memberChartOptions;
	chartOptionsForLastTwoMonths;
	chartOptionsForLastThreeMonths;
	wordCloudChartOptions;
	isKeywordView = false;
	selectedKeywordInsights;
	associationKeywordDataPoints;

	constructor() {
		this.dataPoints = [];
	}
}

export class DataPointModel {
	x: any;
	ys: DataPointYModel[];

	constructor(x: any, ys: DataPointYModel[]) {
		this.x = x;
		this.ys = ys;
	}
}

export class DataPointYModel {
	label: string;
	value: number;

	constructor(label: string, value: number) {
		this.label = label;
		this.value = value;
	}
}
