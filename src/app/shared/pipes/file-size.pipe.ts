import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
	transform(fileSize: number, ...args: unknown[]): string {
		if (fileSize < 1048576) {
			return `${(fileSize / 1024).toFixed(2)} KB`;
		} else {
			return `${(fileSize / 1024 / 1024).toFixed(2)} MB`;
		}
	}
}
