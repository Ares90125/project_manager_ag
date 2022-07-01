import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {BaseComponent} from '../base.component';
declare var window: any;

@Component({
	selector: 'app-share-widget',
	templateUrl: './share-widget.component.html',
	styleUrls: ['./share-widget.component.scss']
})
export class ShareWidgetComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() copyUrl: string;
	@Output() closePopup = new EventEmitter<boolean>();

	@Input() type;
	@Input() profilePage;
	title: string = '';
	isCopied = false;
	constructor(injector: Injector, private readonly adminBioService: AdminBioService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.isCopied = false;
		if (this.type === 'profile') {
			this.title = 'Share this group profile page';
		} else if (this.type === 'bio') {
			this.title = 'Share this bio';
		}
	}

	copyToClipboard(url: string) {
		this.isCopied = true;
		this.appService.copyToClipboard(url);
	}

	closeShareWidget() {
		this.closePopup.next(false);
		this.isCopied = false;
	}

	processCopyText(event) {
		this.logger.info(
			'button_clicked',
			{
				button_cs_id: '084a8ee5-ae1f-453a-8871-129dc33d34ed',
				button_label: 'Copy Field',
				share_from: this.type,
				source: 'dialog',
				default_profile: this.profilePage?.isDefaultProfile
			},
			'ShareWidgetComponent',
			'processCopyText',
			LoggerCategory.ClickStream
		);
	}

	shareUrl(type) {
		let shareLink: string;
		switch (type) {
			case 'facebook':
				shareLink = `http://www.facebook.com/sharer/sharer.php?u=${this.copyUrl}`;
				break;
			case 'whatsapp':
				shareLink = `https://api.whatsapp.com/send?text=${this.copyUrl}`;
				break;
			case 'linkedIn':
				shareLink = `https://www.linkedin.com/shareArticle?url=${this.copyUrl}&title=${this.copyUrl}`;
				break;
			case 'twitter':
				shareLink = `https://twitter.com/share?url=${this.copyUrl}`;
				break;
			case 'email':
				shareLink = `mailto:?subject=${this.copyUrl}&body=${this.copyUrl}&title="${this.copyUrl}"`;
				break;
		}

		window.open(shareLink, '_blank');
	}

	recordEvent(element) {
		if (this.type === 'profile') {
			this.recordButtonClick(element, null, null, {share_from: this.type}, this.profilePage);
		} else {
			this.recordButtonClick(element, null, null, {share_from: this.type});
		}
	}

	openSlugPopup() {
		this.adminBioService.setSlugPopupStatus(true);
		this.closeShareWidget();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
