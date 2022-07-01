import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-bio-preview-social-profiles',
	templateUrl: './bio-preview-social-profiles.component.html',
	styleUrls: ['./bio-preview-social-profiles.component.scss']
})
export class BioPreviewSocialProfilesComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() socialProfiles;
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	recordSocialMediaLink(element, socialProfile) {
		this.recordButtonClick(element, null, null, {social_platform: socialProfile.platform});
	}
	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
