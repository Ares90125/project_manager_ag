import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminBioContactLead} from '@sharedModule/models/admin-bio.model';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {AnimationOptions} from 'ngx-lottie';

@Component({
	selector: 'app-bio-message-lead-overlay',
	templateUrl: './bio-message-lead-overlay.component.html',
	styleUrls: ['./bio-message-lead-overlay.component.scss']
})
export class BioMessageLeadOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	@Output() closePopup = new EventEmitter<boolean>();
	@Output() openShareModalFromLead = new EventEmitter<boolean>();
	@Input() messageLeadCount;
	isLoading;
	messageLead: AdminBioContactLead[];
	nextToken;
	showShareModal = false;
	loadingExtraLead;
	messageBoxAnimation: AnimationOptions = {
		path: './assets/json/message-box-animation.json'
	};
	constructor(injector: Injector, private readonly adminBioService: AdminBioService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.isLoading = true;
		if (this.messageLeadCount !== 0) {
			this.loadMessageData();
		}
	}

	async loadMessageData() {
		const messageLeadData = await this.adminBioService.getAdminBioMessageLead();
		this.messageLead = messageLeadData.items;
		let urlPattern = /(\b(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-&?=%.]+)/gim;

		this.messageLead.map(msg => {
			if (msg.message) {
				msg.message = msg.message.replace(urlPattern, function (text, link) {
					if (link.indexOf('http') === 0) {
						return '<a target="_blank" href="' + link + '">' + link + '</a> ';
					}
					return '<a target="_blank" href="https://' + link + '">' + link + '</a> ';
				});
			}
			return msg;
		});
		this.nextToken = messageLeadData.nextToken;
		this.isLoading = false;
	}

	async loadMoreMessageLead() {
		this.loadingExtraLead = true;
		const extraMessageLead = await this.adminBioService.getAdminBioMessageLead(this.nextToken);
		this.messageLead.concat(extraMessageLead.items);
		this.nextToken = extraMessageLead.nextToken;
		this.loadingExtraLead = false;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	closeMessageLeadPopup(element) {
		this.recordButtonClick(element);
		this.closePopup.emit(false);
	}

	openShareModal(element) {
		this.recordButtonClick(element);
		this.disableScrolling();
		this.openShareModalFromLead.emit(true);
	}
}
