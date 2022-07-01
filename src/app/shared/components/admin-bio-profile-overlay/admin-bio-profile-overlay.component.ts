import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-admin-bio-profile-overlay',
	templateUrl: './admin-bio-profile-overlay.component.html',
	styleUrls: ['./admin-bio-profile-overlay.component.scss']
})
export class AdminBioProfileOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	videoLink = 'assets/videos/admin-bio-onboarding.mp4';

	@ViewChild('video') myVideo: ElementRef;
	@Output() closeAdminOverlay = new EventEmitter<boolean>(null);
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	playVideo() {
		this.myVideo.nativeElement.play();
	}

	goToAdminBio() {
		this.closeAdminOverlay.next(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
