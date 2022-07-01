import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderBy'})
export class OrderByPipe implements PipeTransform {
	transform(array: any, sortBy: string): any[] {
		return array.sort((a, b) => (a[sortBy] > b[sortBy] ? -1 : a[sortBy] < b[sortBy] ? 1 : 0));
	}
}
