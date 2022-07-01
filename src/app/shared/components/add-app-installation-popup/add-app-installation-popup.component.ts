import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '../base.component';
declare var window: any;

@Component({
  selector: 'app-add-app-installation-popup',
  templateUrl: './add-app-installation-popup.component.html',
  styleUrls: ['./add-app-installation-popup.component.scss']
})
export class AddAppInstallationPopupComponent extends BaseComponent implements OnInit, OnDestroy {
	@ViewChild('video') myVideo: ElementRef;
  @Input() fbGroupToBeInstalled;
	@Output() closeInstallationPopup = new EventEmitter<boolean>();
  installationVideo = 'assets/videos/group-install.mp4'
  constructor(injector: Injector) {
    super(injector)
   }

  ngOnInit() {
    super._ngOnInit();
  }

  videoFirstStep() {
		this.myVideo.nativeElement.currentTime = 4;
	}

  closePopup(event){
    this.closeInstallationPopup.emit(event);
  }

	videoSecondStep() {
		this.myVideo.nativeElement.currentTime = 11;
	}

	videoThirdStep() {
		this.myVideo.nativeElement.currentTime = 17;
	}
	videoForthStep() {
		this.myVideo.nativeElement.currentTime = 21;
	}

  openFreshChat() {
		window.fcWidget.open();
		window.fcWidget.show();
	}

  ngOnDestroy(){
    super._ngOnDestroy();
  }

}
