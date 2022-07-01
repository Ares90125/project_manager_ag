import {Component, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-what-this-video',
	templateUrl: './what-this-video.component.html',
	styleUrls: ['./what-this-video.component.scss']
})
export class WhatThisVideoComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() videoLink: string;
	@Input() title: string;
	@Output() closeVideoPlayer = new EventEmitter<boolean>();
	@HostListener('document:click', ['$event.target.classList'])
	public onClick(targetElement) {
		if (targetElement?.value.includes('close-video')) {
			this.closeVideoPlayer.emit(false);
		}
	}
	constructor(injector: Injector) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	closeVideo(type) {
		let vid = <HTMLVideoElement>document.getElementById(type);
		vid.pause();
		this.closeVideoPlayer.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
