import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Pipe({
	name: 'sanitizeUrl'
})
export class SanitizeUrlPipe implements PipeTransform {
	constructor(protected sr: DomSanitizer) {}

	transform(url: string): SafeUrl {
		return this.sr.bypassSecurityTrustResourceUrl(this.sr.sanitize(SecurityContext.URL, url));
	}
}
