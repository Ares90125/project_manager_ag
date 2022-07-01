import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'reverseArray'})
export class ReverseArrayPipe implements PipeTransform {
	transform(value) {
		if (!value) return;

		return value.reverse();
	}
}
