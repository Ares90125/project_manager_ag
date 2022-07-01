import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
	selector: 'app-brand-insights-sidebar',
	templateUrl: './brand-insights-sidebar.component.html',
	styleUrls: ['./brand-insights-sidebar.component.scss']
})
export class BrandInsightsSidebarComponent {
	@Input() insights;
	@Input() keyword;
	@Output() closeInsights = new EventEmitter<boolean>();

	constructor() {}

	close() {
		this.closeInsights.emit(false);
	}

	getKeysOfInsights(insights) {
		return Object.keys(insights);
	}
}
