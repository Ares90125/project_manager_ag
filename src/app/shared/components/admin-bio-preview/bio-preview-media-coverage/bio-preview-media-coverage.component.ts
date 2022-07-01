import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
@Component({
	selector: 'app-bio-preview-media-coverage',
	templateUrl: './bio-preview-media-coverage.component.html',
	styleUrls: ['./bio-preview-media-coverage.component.scss']
})
export class BioPreviewMediaCoverageComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() mediaCoverages;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	showDefaultMediaCoverageImage(event) {
		event.target.src = 'assets/images/default_meta_image.png';
	}

	redirectToUrl(e, url) {
		e.preventDefault();
		if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
			window.open(`https://${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
