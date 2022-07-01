import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AnimationOptions} from 'ngx-lottie';
import {BaseComponent} from '@sharedModule/components/base.component';
import {ProfilePublishStatusEnum} from '@sharedModule/models/graph-ql.model';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';

@Component({
	selector: 'app-auto-save-bottom-bar',
	templateUrl: './auto-save-bottom-bar.component.html',
	styleUrls: ['./auto-save-bottom-bar.component.scss']
})
export class AutoSaveBottomBarComponent extends BaseComponent implements OnInit, OnDestroy {
	draftSavedAnimationOption: AnimationOptions = {
		path: './assets/json/draft-saved-animation.json'
	};
	@Input() draftButtonStatus: ProfilePublishStatusEnum;
	@Input() isSaveInProgress;
	@Input() profilePage: GroupProfilePageModel;
	@Output() publishProfile = new EventEmitter();
	profilePublishStatusEnum = ProfilePublishStatusEnum;
	isPublishInitiated = false;

	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	emitPublishProfileClick(event) {
		this.recordButtonClick(
			event,
			null,
			null,
			{
				immediate_publish: false
			},
			this.profilePage
		);
		this.isPublishInitiated = true;
		this.publishProfile.emit(true);
	}
}
