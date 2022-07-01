import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
@Component({
	selector: 'app-bio-preview-key-achievements',
	templateUrl: './bio-preview-key-achievements.component.html',
	styleUrls: ['./bio-preview-key-achievements.component.scss']
})
export class BioPreviewKeyAchievementsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() keyAchievement;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
