import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
	selector: 'app-custom-date-range',
	templateUrl: './custom-date-range.component.html',
	styleUrls: ['./custom-date-range.component.scss']
})
export class CustomDateRangeComponent extends BaseComponent implements OnInit, OnDestroy {
	customPrefixOfReport = '';
	rangeSelected;
	customRange;
	range = new FormGroup({
		startDate: new FormControl(),
		endDate: new FormControl()
	});
	@Input() insightView;
	@Input() campaignId;
	@Input() showCalendar;
	@Input() campaignStartDate;
	@Input() monthPrefixOfReport;
	@Input() showDateRangeSelector;
	@Input() associationInsightId;
	@Output() setMonthPrefixOfReport = new EventEmitter();

	constructor(injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		if (this.insightView.dateRangeSelectors) {
			this.customRange = JSON.parse(this.insightView.dateRangeSelectors)[0];
		}
	}

	async setCustomPrefixOfReport(custom: {startDate: Date; endDate: Date}, datePickerType) {
		if (custom.endDate) {
			if (datePickerType === 'auto') {
				this.setMonthPrefixOfReport.emit({
					isAuto: true
				});
			} else {
				this.setMonthPrefixOfReport.emit({
					isAuto: false
				});
			}
			setTimeout(() => (this.customPrefixOfReport = 'custom'), 10);
			await this.insightView.getcustomMetrics(custom.startDate, custom.endDate, this.associationInsightId);
		}
		if (datePickerType === 'manual') {
			this.rangeSelected = true;
			if (custom.endDate) {
				this.insightView.getCustomDateRangeSelection(this.campaignId, this.insightView.viewName, {
					startDate: custom.startDate,
					endDate: custom.endDate
				});
			}
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
