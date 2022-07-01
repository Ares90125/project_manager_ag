export class TimePeriod {
	static readonly TODAY = new TimePeriod('Today', {startDateOffSet: 0, endDateOffSet: 0, offSetType: 'days'});
	static readonly YESTERDAY = new TimePeriod('Yesterday', {startDateOffSet: 1, endDateOffSet: 1, offSetType: 'days'});
	static readonly LAST_30Days = new TimePeriod('Last 30 Days', {
		startDateOffSet: 30,
		endDateOffSet: 1,
		offSetType: 'days'
	});
	static readonly THIS_WEEK = new TimePeriod('This Week', {startDateOffSet: 0, endDateOffSet: 0, offSetType: 'weeks'});
	static readonly LAST_WEEK = new TimePeriod('Last Week', {startDateOffSet: 1, endDateOffSet: 1, offSetType: 'weeks'});
	static readonly THIS_MONTH = new TimePeriod('This Month', {
		startDateOffSet: 0,
		endDateOffSet: 0,
		offSetType: 'months'
	});
	static readonly LAST_MONTH = new TimePeriod('Last Month', {
		startDateOffSet: 1,
		endDateOffSet: 1,
		offSetType: 'months'
	});
	static readonly LAST_TWO_MONTHS = new TimePeriod('Last Two Months', {
		startDateOffSet: 2,
		endDateOffSet: 1,
		offSetType: 'months'
	});
	static readonly LAST_THREE_MONTHS = new TimePeriod('Last Three Months', {
		startDateOffSet: 3,
		endDateOffSet: 1,
		offSetType: 'months'
	});
	static readonly TODAY_TO_LAST_MONTH = new TimePeriod('Today To Last Month', {
		startDateOffSet: 1,
		endDateOffSet: 0,
		offSetType: 'months'
	});
	// private to disallow creating other instances of this type
	private constructor(private readonly key: string, public readonly value: any) {}

	toString() {
		return this.key;
	}
}
