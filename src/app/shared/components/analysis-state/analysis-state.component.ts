import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-analysis-state',
	templateUrl: './analysis-state.component.html',
	styleUrls: ['./analysis-state.component.scss']
})
export class AnalysisStateComponent {
	@Input() iconSm;
	@Input() iconLg;
	@Input() value;
	@Input() heading;
	@Input() subHeading;
	@Input() inline;
	@Input() diameter;

	constructor() {}
}
