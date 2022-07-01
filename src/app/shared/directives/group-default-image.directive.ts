import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {FacebookService} from '@sharedModule/services/facebook.service';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: 'img[fbEntityId]'
})
export class DefaultImageDirective {
	@Input() fbEntityId: string;
	@HostListener('error') async onError() {
		this.elem.nativeElement.src = 'assets/images/default_group_image.jpg';
		if (!this.fbEntityId) {
			return;
		}
		const updatedPicture = await this.facebookService.getUpdatedGroupCover(this.fbEntityId);
		if (updatedPicture && updatedPicture.data) {
			this.elem.nativeElement.src = updatedPicture.data.url;
		}
	}
	constructor(private facebookService: FacebookService, private elem: ElementRef) {}
}
