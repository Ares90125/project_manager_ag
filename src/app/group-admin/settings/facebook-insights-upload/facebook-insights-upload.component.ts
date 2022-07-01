import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-facebook-insights-upload',
	templateUrl: './facebook-insights-upload.component.html',
	styleUrls: ['./facebook-insights-upload.component.scss']
})
export class FacebookInsightsUploadComponent extends BaseComponent implements OnInit, OnDestroy {
	isLoading = true;
	videoLink: string = 'https://www.youtube.com/embed/CD3lJ3l50gc';
	pageType = 'facebook-insights';
	eligibleGroups = [];

	constructor(injector: Injector, public readonly groupsService: GroupsService, public router: Router) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.groupsService.groups.subscribe(async groups => {
				if (!groups) {
					return;
				}
				this.eligibleGroups = await this.groupsService.eligibleGroupsForInsightsUpload();
			})
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	closeModal() {
		this.videoLink = '';
	}

	playVideo() {
		this.videoLink = 'https://www.youtube.com/embed/CD3lJ3l50gc';
	}
}
