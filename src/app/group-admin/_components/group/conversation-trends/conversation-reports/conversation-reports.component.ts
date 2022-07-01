import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupModel} from '@sharedModule/models/group.model';

@Component({
	selector: 'app-conversation-reports',
	templateUrl: './conversation-reports.component.html',
	styleUrls: ['./conversation-reports.component.scss']
})
export class ConversationReportsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Input() topTopics = null;
	@Input() topCategories = null;
	@Input() topIssues = null;
	@Input() topRemedies = null;
	@Input() topProducts = null;
	@Input() topBrands = null;
	@Input() top10Bigrams = null;
	@Input() currentDate: Date;
	@Input() convStartDate: Date;
	@Input() noTrendsFound = false;
	@Input() loadingTrends = false;
	@Input() wordCloud = null;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
