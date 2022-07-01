import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-preview-group-profile-page',
	templateUrl: './preview-group-profile-page.component.html',
	styleUrls: ['./preview-group-profile-page.component.scss']
})
export class PreviewGroupProfilePageComponent extends BaseComponent implements OnInit, OnDestroy {
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
