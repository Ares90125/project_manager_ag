import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'textHighlight'
})
export class TextHighlightPipe implements PipeTransform {
	transform(value: any, args?: string[]): any {
		if (!args) {
			return value;
		}
		args.forEach(arg => {
			// 'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			const regExp = new RegExp(arg, 'gi');
			value = value.replace(regExp, '<mark>' + arg + '</mark>');
		});

		return value;
	}
}
