import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-fb-group-cover-image',
	templateUrl: './fb-group-cover-image.component.html',
	styleUrls: ['./fb-group-cover-image.component.scss']
})
export class FbGroupCoverImageComponent {
	@Input() coverImageUrl: string;
	@Input() fbGroupId: string;

	constructor() {}
}
