import dayjs, {ConfigType, Dayjs, ManipulateType, OpUnitType} from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import isAfter from 'dayjs/plugin/isSameOrAfter';
import isBefore from 'dayjs/plugin/isSameOrBefore';
import from from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isAfter);
dayjs.extend(isBefore);
dayjs.extend(from);
dayjs.extend(customParseFormat);

export {Dayjs as DateTimeObj};
export class DateTime {
	private _dateTime: Dayjs;
	private readonly timezone;
	private readonly defaultFormatString = 'YYYY-MM-DDTHH:mm:ss.sssZ';
	private static defaultTimezone = dayjs.tz.guess();

	constructor(date?: Dayjs | Date | string | number, format?: string | string[], timezone?: string) {
		timezone = timezone ? timezone : DateTime.defaultTimezone;
		this.timezone = timezone;
		this._dateTime = format === undefined ? dayjs(date).tz(timezone) : dayjs(date, format).tz(timezone);
		//@ts-ignore
		if (window.Cypress && window.convoDate) {
			//@ts-ignore
			const duration = dayjs().diff(dayjs(window.convoDate), 'days');
			//@ts-ignore
			this._dateTime = this._dateTime.subtract(<number>duration, 'days');
		}
		return this;
	}

	valueOf(): number {
		return this._dateTime.valueOf();
	}

	minute(): number {
		return this._dateTime.minute();
	}

	get dayJsObj(): Dayjs {
		return this._dateTime;
	}

	startOf(unit: OpUnitType): DateTime {
		this._dateTime = dayjs.tz(this._dateTime.utc().startOf(unit).format(), this.timezone);
		return this;
	}

	add(amount: number, unit: ManipulateType): DateTime {
		this._dateTime = this._dateTime.add(amount, unit);
		return this;
	}

	subtract(amount: number, unit: ManipulateType): DateTime {
		this._dateTime = this._dateTime.subtract(amount, unit);
		return this;
	}

	endOf(unit: OpUnitType): DateTime {
		this._dateTime = dayjs.tz(this._dateTime.utc().endOf(unit).format(), this.timezone);
		return this;
	}

	format(formatString: string = this.defaultFormatString): string {
		return this._dateTime.format(formatString);
	}

	month(monthNumber?: number): any {
		return this._dateTime.month(monthNumber);
	}

	year(): number {
		return this._dateTime.year();
	}

	date(): number {
		return this._dateTime.date();
	}

	utc(): DateTime {
		this._dateTime = this._dateTime.utc();
		return this;
	}

	diff(date: ConfigType, unit, float = false): number {
		return this._dateTime.diff(date, unit, float);
	}

	isBetween(startDate: Dayjs, endDate: Dayjs): boolean {
		return this._dateTime.isBetween(startDate, endDate);
	}

	isAfter(date: Dayjs): boolean {
		return this._dateTime.isAfter(date);
	}

	getUtcOffset(timezone: string) {
		return dayjs().tz(timezone).utcOffset();
	}

	toDate(): Date {
		return this._dateTime.toDate();
	}

	tz(timezone: string): DateTime {
		this._dateTime.tz(timezone);
		return this;
	}

	utcOffset(): number {
		return this._dateTime.utcOffset();
	}

	static guess(): string {
		return this.defaultTimezone;
	}

	unix(): number {
		return this._dateTime.unix();
	}

	parseUTCString(dateTimeString: string, timezone: string = DateTime.defaultTimezone): DateTime {
		this._dateTime = dayjs.utc(dateTimeString).tz(timezone);
		return this;
	}

	parseUnix(t: number): DateTime {
		this._dateTime = dayjs.unix(t);
		return this;
	}

	toISOString(): string {
		return this._dateTime.toISOString();
	}

	local(): DateTime {
		this._dateTime = this._dateTime.local();
		return this;
	}

	from(date: Dayjs): string {
		return this._dateTime.from(date);
	}

	isBefore(date: Dayjs): boolean {
		return this._dateTime.isBefore(date);
	}

	static getMonthsShorts = () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	static getMonths() {
		return [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
	}
}
