import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import Highcharts from 'highcharts';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {UserService} from '@sharedModule/services/user.service';
import {HTMLInputElement} from 'happy-dom';

@Component({
	selector: 'app-top-posts-screenshots',
	templateUrl: './top-posts-screenshots.component.html',
	styleUrls: ['./top-posts-screenshots.component.scss']
})
export class TopPostsScreenshotsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() groupId: string;
	@Input() brandId: string;
	_selectedTimePeriod: string;
	groupTimezoneName: string | null;
	topPosts: string[];
	screenshotsDataJson = {};
	isScreenshotsDataVisible = true;
	@Output() screenshotsJson = new EventEmitter();

	@Input()
	public set selectedTimePeriod(value: string) {
		this._selectedTimePeriod = value;
	}
	private dateTimeHelper: DateTimeHelper;
	editingSupportingText = false;
	supportingText;
	@Input() set supportingTextInput(value) {
		this.supportingText = value;
	}

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

	openSupportingTextArea(event) {
		event.currentTarget.nextElementSibling.classList.add('show');
		event.currentTarget.classList.remove('show');
	}

	editSupportingText(event) {
		event.currentTarget.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.classList.remove('show');
	}

	hideSupportingTextArea(event) {
		event.currentTarget.parentElement.parentElement.classList.remove('show');
		event.currentTarget.parentElement.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.parentElement.nextElementSibling.classList.add('show');
	}

	async saveSupportingText(event, type) {
		this.editingSupportingText = true;
		const text = (event.currentTarget.parentElement.previousSibling as HTMLInputElement).value;
		if (text.trim().length === 0) {
			if (this.supportingText[type]) {
				delete this.supportingText[type];
			}
		} else {
			this.supportingText[type] = text;
		}
		await this.brandCommunityReportService.updateBrandCommunityReport({
			brandId: this.brandId,
			groupId: this.groupId,
			supportingText: JSON.stringify(this.supportingText)
		});
		this.editingSupportingText = false;
		event.target.parentElement.parentElement.classList.remove('show');
		setTimeout(() => {
			event.target.parentElement.parentElement.previousElementSibling.classList.add('show');
			event.target.parentElement.parentElement.nextElementSibling.classList.add('show');
		}, 1000);
	}

	async getTopPostsIds(isFromPublish = null) {
		this.topPosts = [];
		const posts = await this.brandCommunityReportService.getScreenshotData(this.groupId);
		if (isFromPublish) {
			this.screenshotsDataJson['topPosts'] = posts;
		} else {
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
	}

	async getScreenshotsDataJSON() {
		await this.getTopPostsIds(true);
		this.screenshotsDataJson['isScreenshotsVisible'] = this.isScreenshotsDataVisible;
		this.screenshotsJson.emit(this.screenshotsDataJson);
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
