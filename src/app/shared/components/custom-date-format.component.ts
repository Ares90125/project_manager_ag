import {NativeDateAdapter} from '@angular/material/core';
import {MatDateFormats} from '@angular/material/core/datetime/date-formats';
import {DateTime} from '@sharedModule/models/date-time';

export class AppDateAdapter extends NativeDateAdapter {
	format(date: Date, displayFormat: Object): string {
		if (displayFormat === 'input') {
			let dateToBeFormatted = new DateTime(date);
			return dateToBeFormatted.format('DD MMM, YYYY');
		}
		return date.toDateString();
	}
}
export const DATE_FORMATS: MatDateFormats = {
	parse: {
		dateInput: {month: 'short', year: 'numeric', day: 'numeric'}
	},
	display: {
		dateInput: 'input',
		monthYearLabel: {year: 'numeric', month: 'numeric'},
		dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
		monthYearA11yLabel: {year: 'numeric', month: 'long'}
	}
};
