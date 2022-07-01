import {Component, Input, OnInit} from '@angular/core';
import {GroupModel} from 'src/app/shared/models/group.model';
import {GroupMetricsService} from 'src/app/shared/services/group-metrics/group-metrics.service';

@Component({
	selector: 'app-group-insights',
	templateUrl: './group-insights.component.html',
	styleUrls: ['./group-insights.component.scss']
})
export class GroupInsightsComponent implements OnInit {
	@Input() group: GroupModel;

	reportType = 'currentMonth';

	constructor(private readonly metricService: GroupMetricsService) {}

	async ngOnInit() {
		this.group.loadSummaryMetrics(this.metricService);
		this.group.loadDetailsMetrics(this.metricService);
	}
}
