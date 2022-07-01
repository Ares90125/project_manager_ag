import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-facebook-post-screenshot',
	templateUrl: './facebook-post-screenshot.component.html',
	styleUrls: ['./facebook-post-screenshot.component.scss']
})
export class FacebookPostScreenshotComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() isPostView = false;

	@Input() set postData(value) {
		this.data = value;
		this.postImagesLength = this.data.imagePostLinks.length;
		this.postVideoLength = this.data.videoPostLinks.length;
	}

	data;
	postImagesLength;
	postVideoLength;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
	}
}
