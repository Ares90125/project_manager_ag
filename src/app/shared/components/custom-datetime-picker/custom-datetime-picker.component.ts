import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-custom-datetime-picker',
	templateUrl: './custom-datetime-picker.component.html',
	styleUrls: ['./custom-datetime-picker.component.scss']
})
export class CustomDateTimePickerComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() selectedGroup;
	@Input() minDate;
	@Input() maxDate;
	@Output() dateTimeSelection = new EventEmitter();
	@Output() closeDateTimePicker = new EventEmitter();
	isDateViewActive = true;
	selectedDate;
	selectedTime;

	constructor(injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	selectDate(event) {
		this.selectedDate = event.toDateString();
		this.isDateViewActive = false;
	}

	updateDateTime() {
		const dateTime = new DateTime(this.selectedDate + ' ' + this.selectedTime.toTimeString());
		this.dateTimeSelection.emit(dateTime);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
