import {Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-bio-preview-introduction',
	templateUrl: './bio-preview-introduction.component.html',
	styleUrls: ['./bio-preview-introduction.component.scss']
})
export class BioPreviewIntroductionComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() bio;
	@Input() pitchVideo;
	@ViewChild('video') myVideo: ElementRef;
	isFacebookBrowser: any;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.isFacebookBrowser = this.isFacebookApp();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
