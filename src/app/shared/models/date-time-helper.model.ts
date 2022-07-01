import {DateTime} from '@sharedModule/models/date-time';

export class DateTimeHelper {
	private _dayNameFormatString = 'DD MMM';
	private _monthNameFormatString = 'MMMM';

	constructor(private readonly timezone: string) {}

	private get newDateTime() {
		return new DateTime(undefined, undefined, this.timezone);
	}

	private get _now() {
		return this.newDateTime;
	}

	get todayStart() {
		return this._now.startOf('d');
	}

	get yesterdayEnd() {
		return this.newDateTime.add(-1, 'd').endOf('d');
	}

	get sixthDayInPast() {
		return this.newDateTime.add(-6, 'd').startOf('d');
	}

	get sixthDayInPastName() {
		return this.sixthDayInPast.format(this._dayNameFormatString);
	}

	get seventhDayInPast() {
		return this.newDateTime.add(-7, 'd').startOf('d');
	}

	get seventhDayInPastName() {
		return this.seventhDayInPast.format(this._dayNameFormatString);
	}

	get thirteenthDayInPast() {
		return this.newDateTime.add(-13, 'd').startOf('d');
	}

	get thirteenthDayInPastName() {
		return this.thirteenthDayInPast.format(this._dayNameFormatString);
	}

	get fourteenthDayInPast() {
		return this.newDateTime.add(-14, 'd').startOf('d');
	}

	get fourteenthDayInPastName() {
		return this.fourteenthDayInPast.format(this._dayNameFormatString);
	}

	get twentyEighthDayInPastStart() {
		return this.newDateTime.add(-28, 'd').startOf('d');
	}

	get twentyNinthDayInPastStart() {
		return this.newDateTime.add(-29, 'd').startOf('d');
	}

	get thirtiethDayInPastStart() {
		return this.newDateTime.add(-30, 'd').startOf('d');
	}

	private get thirtyFirstDayInPast() {
		return this.newDateTime.add(-31, 'd');
	}

	get thirtyFirstDayInPastStart() {
		return this.thirtyFirstDayInPast.startOf('d');
	}

	get thirtyFirstDayInPastEnd() {
		return this.thirtyFirstDayInPast.endOf('d');
	}

	get thirtyFirstDayInPastName() {
		return this.thirtyFirstDayInPastStart.format(this._dayNameFormatString);
	}

	get sixtiethDayInPastStart() {
		return this.newDateTime.add(-60, 'd').startOf('d');
	}

	get sixtiethDayInPastName() {
		return this.sixtiethDayInPastStart.format(this._dayNameFormatString);
	}

	private get sixtyFirstDayInPast() {
		return this.newDateTime.add(-61, 'd').startOf('d');
	}

	get sixtyFirstDayInPastName() {
		return this.sixtyFirstDayInPast.format(this._dayNameFormatString);
	}

	get currentMonthStart() {
		return this.newDateTime.startOf('M');
	}

	get currentMonthName() {
		return this.currentMonthStart.format(this._monthNameFormatString);
	}

	get currentMonthNumber() {
		return this.currentMonthStart.month() + 1;
	}

	private get lastMonth() {
		return this.newDateTime.add(-1, 'M');
	}

	get lastMonthStart() {
		return this.lastMonth.startOf('M');
	}

	get lastMonthEnd() {
		return this.lastMonth.endOf('M');
	}

	get lastMonthName() {
		return this.lastMonthStart.format(this._monthNameFormatString);
	}

	get lastMonthNumber() {
		return this.lastMonthStart.month() + 1;
	}

	private get secondLastMonth() {
		return this.newDateTime.add(-2, 'M');
	}

	get secondLastMonthStart() {
		return this.secondLastMonth.startOf('M');
	}

	get secondLastMonthEnd() {
		return this.secondLastMonth.endOf('M');
	}

	get secondLastMonthName() {
		return this.secondLastMonthStart.format(this._monthNameFormatString);
	}

	get secondLastMonthNumber() {
		return this.secondLastMonth.month() + 1;
	}

	get secondLastMonthStartName() {
		return this.secondLastMonthStart.format(this._dayNameFormatString);
	}

	get secondLastMonthEndName() {
		return this.secondLastMonthEnd.format(this._dayNameFormatString);
	}

	get fourthLastMonthStartName() {
		return this.fourthLastMonthStart.format(this._dayNameFormatString);
	}

	get thirdLastMonthEndName() {
		return this.thirdLastMonthEnd.format(this._dayNameFormatString);
	}

	private get thirdLastMonth() {
		return this.newDateTime.add(-3, 'M');
	}

	get thirdLastMonthStart() {
		return this.thirdLastMonth.startOf('M');
	}

	get thirdLastMonthEnd() {
		return this.thirdLastMonth.endOf('M');
	}

	get thirdLastMonthName() {
		return this.thirdLastMonthStart.format(this._monthNameFormatString);
	}

	get thirdLastMonthNumber() {
		return this.thirdLastMonthStart.month() + 1;
	}

	private get fourthLastMonth() {
		return this.newDateTime.add(-4, 'M');
	}

	get fourthLastMonthStart() {
		return this.fourthLastMonth.startOf('M');
	}

	get fourthLastMonthEnd() {
		return this.fourthLastMonth.endOf('M');
	}

	get fourthLastMonthName() {
		return this.fourthLastMonthStart.format(this._monthNameFormatString);
	}

	get currentYear() {
		return this.now.year();
	}

	private get sixthLastMonth() {
		return this.newDateTime.add(-6, 'M');
	}

	get sixthLastMonthStart() {
		return this.sixthLastMonth.startOf('M');
	}

	private get fifthLastMonth() {
		return this.newDateTime.add(-5, 'M');
	}

	get fifthLastMonthStart() {
		return this.fifthLastMonth.startOf('M');
	}

	private get lastYear() {
		return this.newDateTime.add(-1, 'year');
	}

	get lastYearStart() {
		return this.lastYear.startOf('year');
	}

	get lastYearEnd() {
		return this.lastYear.endOf('year');
	}

	get now() {
		return this._now;
	}
}
