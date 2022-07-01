import {Component} from '@angular/core';
import {UserModel} from '@sharedModule/models/user.model';

@Component({
	selector: 'app-upload-pan',
	templateUrl: './upload-pan.component.html',
	styleUrls: ['./upload-pan.component.scss']
})
export class UploadPanComponent {
	user: UserModel;

	constructor() {}
}
