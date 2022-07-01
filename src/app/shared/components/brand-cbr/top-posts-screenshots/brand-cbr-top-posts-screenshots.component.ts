import {Component, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import Highcharts from 'highcharts';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-brand-CBR-top-posts-screenshots',
	templateUrl: './brand-cbr-top-posts-screenshots.component.html',
	styleUrls: ['./brand-cbr-top-posts-screenshots.component.scss']
})
export class BrandCbrTopPostsScreenshotsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupId: string;
	@Input() data;
	@Input() supportingText;
	_selectedTimePeriod: string;
	groupTimezoneName: string | null;
	topPosts: string[];

	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
	}
	private dateTimeHelper: DateTimeHelper;

	constructor(
		injector: Injector,
		private brandCommunityReportService: BrandCommunityReportService,
		private createCampaignService: CreateCampaignService,
		private userService: UserService
	) {
		super(injector);
		this.dateTimeHelper = new DateTimeHelper(this.groupTimezoneName);
	}

	async ngOnInit() {
		super._ngOnInit();
		await this.getTopPostsIds();
	}

	async getTopPostsIds() {
		this.topPosts = [];
		const posts = this.data['topPosts'];

		posts.forEach(async post => {
			const posturl = await this.createCampaignService.getScreenshotsFromPostIds(
				{
					sourceId: post.sourceId,
					commentEnable: false,
					skipScreenshot: false
				},
				await this.userService.getCurrentSessionJWTToken()
			);
			if (posturl) {
				this.topPosts.push(posturl['location']);
			}
		});
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
