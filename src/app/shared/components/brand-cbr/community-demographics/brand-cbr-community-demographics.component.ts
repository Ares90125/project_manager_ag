import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import Highcharts from 'highcharts';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {
	ColumnAndGroupedLineChart,
	ColumnStackedChart,
	ColumnWIthTargetChart,
	SelectedTimePeriod
} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {GroupModel} from '@sharedModule/models/group.model';
import * as _ from 'lodash';
import {PieChartModel} from '@sharedModule/models/group-reports/chart.model';

@Component({
	selector: 'app-brand-CBR-community-demographics',
	templateUrl: './brand-cbr-community-demographics.component.html',
	styleUrls: ['./brand-cbr-community-demographics.component.scss']
})
export class BrandCbrCommunityDemographicsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupId: string;
	@Input() data;
	@Input() supportingText;
	@Input() group: GroupModel;
	_selectedTimePeriod: string;
	groupTimezoneName: string | null;
	genderDistributionChartOptions;
	ageWiseGenderDistributionChartOptions;
	userDistributionIn5CountriesChartOptions;
	userDistributionIn10CitiesChartOptions;
	totalWomen;
	totalMen;
	@Output() openEdit = new EventEmitter();

	private dateTimeHelper: DateTimeHelper;

	constructor(injector: Injector, private brandCommunityReportService: BrandCommunityReportService) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.genderDistributionChartOptions = new PieChartModel();
		this.ageWiseGenderDistributionChartOptions = new ColumnStackedChart();
		this.ageWiseGenderDistributionChartOptions = new ColumnStackedChart();
		this.userDistributionIn5CountriesChartOptions = new ColumnWIthTargetChart();
		this.userDistributionIn10CitiesChartOptions = new ColumnWIthTargetChart();
		setTimeout(async () => {
			await this.setChartOptions();
		}, 5000);
	}

	async setChartOptions() {
		if (!this.groupId) {
			return;
		}
		this.setChartsData();
	}

	setChartsData() {
		this.createGenderDistributionCharts('genderDistributionCBR');
		this.createGenderDistributionCharts('ageWiseGenderDistributionCBR');
		this.createGenderDistributionCharts('userDistributionIn5CountriesCBR');
		this.createGenderDistributionCharts('userDistributionIn10CitiesCBR');
	}

	async createGenderDistributionCharts(type) {
		switch (type) {
			case 'genderDistributionCBR':
				this.createChart(type, this.data.genderDistributionChartOptions);
				break;
			case 'ageWiseGenderDistributionCBR':
				this.createChart(type, this.data.ageWiseGenderDistributionChartOptions);
				break;
			case 'userDistributionIn5CountriesCBR':
				this.createChart(type, this.data.userDistributionIn5CountriesChartOptions);
				break;
			case 'userDistributionIn10CitiesCBR':
				this.createChart(type, this.data.userDistributionIn10CitiesChartOptions);
				break;
		}
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
