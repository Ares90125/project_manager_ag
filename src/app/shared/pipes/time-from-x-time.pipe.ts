import {Pipe, PipeTransform} from '@angular/core';
import {DateTime} from '@sharedModule/models/date-time';

@Pipe({
	name: 'timeFromXTime'
})
export class TimeFromXTime implements PipeTransform {
	transform(time: string | number): string {
		return new DateTime(time).from(new DateTime().dayJsObj);
	}
}
