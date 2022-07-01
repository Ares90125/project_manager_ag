import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ContentManagerService} from '../../cs-admin/services/content-manager.service';
import {ActivatedRoute} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';

@Component({
	selector: 'app-campaign-brief',
	templateUrl: './campaign-brief.component.html',
	styleUrls: ['./campaign-brief.component.scss']
})
export class CampaignBriefComponent extends BaseComponent implements OnInit, OnDestroy {
	campaign;
	showPreview: boolean = true;
	quillConfig = {
		toolbar: [['bold', 'italic', 'link', {list: 'ordered'}, {list: 'bullet'}]]
	};

	constructor(
		injector: Injector,
		private readonly contentManagerService: ContentManagerService,
		private readonly router: ActivatedRoute
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async ngOnInit() {
		super._ngOnInit();

		this.getCampaignDetails();
	}

	async getCampaignDetails() {
		const res = await this.contentManagerService.getCampaignByCampaignId({
			campaignId: this.router.snapshot.params.campaignId
		});
		this.campaign = res;
		// this.campaign.details = "Hello hi 👋 <strong>hello</strong>";
	}

	changeAssetText(event) {
		this.campaign.details = event.target.value;
	}
}
