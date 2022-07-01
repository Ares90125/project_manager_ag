import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {PostAnalyticsFor30Days} from 'src/app/group-admin/models/post-analytics-for-30-days.model';
import {TimePeriod} from '@sharedModule/enums/time-period.enum';
import {Router} from '@angular/router';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-post-analytics',
	templateUrl: './post-analytics.component.html',
	styleUrls: ['./post-analytics.component.scss']
})
export class PostAnalyticsComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Output() toQueuePage = new EventEmitter();

	@Input() set postAnalyticData(data) {
		if (data) {
			this.selectedGroup = data.selectedGroup;
			this.showSubNav = data.isNavRequired;
		}
	}

	timePeriodForReport = '7_DAYS';
	timePeriod = '7_DAYS';
	isLoading = true;
	isInitialLoadComplete;
	isChaningFilter = false;
	postAnalytics30Days: PostAnalyticsFor30Days;
	posts: any = [];
	selectedGroup: GroupModel;
	sortByOptions = {
		'Last published': 'createdAtUTC',
		'Highest activity': 'activityRate',
		'Most reactions': 'reactions',
		'Most comments': 'commentCount'
	};
	timePeriodOptions = TimePeriod;
	selectedSortBy = 'Last published';
	selectedTimePeriod = TimePeriod.LAST_30Days;
	showEmptyPostScreen = false;
	showSubNav = false;
	report: any;
	post30DaysAnalyticsLoaded = false;

	constructor(
		injector: Injector,
		private readonly metricsService: GroupMetricsService,
		private readonly publishService: PublishService,
		private router: Router,
		private utilityService: UtilityService
	) {
		super(injector);
	}

	async ngOnInit() {
		if (!this.selectedGroup) {
			this.subscriptionsToDestroy.push(
				this.publishService.selectedGroup.subscribe(group => {
					this.loadInitialData(group);
				})
			);
		} else {
			this.loadInitialData(this.selectedGroup);
		}

		this.showEmptyPostScreen = false;
		this.post30DaysAnalyticsLoaded = false;

		super._ngOnInit();
	}

	loadInitialData(group) {
		this.selectedGroup = group;
		this.showSubNav = false;
		if (this.appService.currentPageUrl.getValue().includes('publish')) {
			this.setUrlParamAndLog('publish');
		} else {
			this.setUrlParamAndLog('groupPublish');
		}
		this.postAnalytics30Days = new PostAnalyticsFor30Days();
		this.timePeriodForReport = '7_DAYS';
		this.checkForBlankPost();
	}

	async sortPosts(option: string) {
		this.selectedSortBy = option;
		const key = this.sortByOptions[option];
		this.posts = this.posts.sort((a: any, b: any) => {
			const valueA = key === 'createdAtUTC' ? a[key] : parseInt(a.analytics[key]);
			const valueB = key === 'createdAtUTC' ? b[key] : parseInt(b.analytics[key]);
			if (valueA < valueB) {
				return 1;
			}
			if (valueA > valueB) {
				return -1;
			}

			return 0;
		});
	}

	async checkForBlankPost() {
		await this.selectedGroup.getPostsCreated('LAST_30Days', this.publishService);
		const toShowBlankScreen = (await this.selectedGroup.loadPostsCreatedForPostAnalytics['LAST_30Days'].length) === 0;
		if (toShowBlankScreen) {
			this.posts = [];
			this.showEmptyPostScreen = true;
			this.isInitialLoadComplete = true;
			return;
		} else {
			await this.loadPostAnalyticsForTimePeriod('7_DAYS');
		}
	}

	async loadPostAnalytics(timePeriod) {
		this.timePeriod = timePeriod;
		let createdPosts;
		this.posts = [];
		if (timePeriod === '7_DAYS' || timePeriod === '14_DAYS' || timePeriod === 'LAST_30Days') {
			await this.selectedGroup.getPostsCreated('LAST_30Days', this.publishService);
			createdPosts = await this.selectedGroup.loadPostsCreatedForPostAnalytics['LAST_30Days'];
			await this.selectedGroup.getPostsCreated('TODAY', this.publishService);
			const postsCreatedToday = await this.selectedGroup.loadPostsCreatedForPostAnalytics['TODAY'];
			if (timePeriod === '7_DAYS') {
				createdPosts = createdPosts
					.concat(postsCreatedToday)
					.filter(
						post =>
							new DateTime().utc().startOf('day').subtract(6, 'days').unix() <= new DateTime(post.createdAtUTC).unix()
					);
			} else if (timePeriod === '14_DAYS') {
				createdPosts = createdPosts
					.concat(postsCreatedToday)
					.filter(
						post =>
							new DateTime().utc().startOf('day').subtract(13, 'days').unix() <= new DateTime(post.createdAtUTC).unix()
					);
			}
		} else {
			await this.selectedGroup.getPostsCreated(timePeriod, this.publishService);
			createdPosts = await this.selectedGroup.loadPostsCreatedForPostAnalytics[timePeriod];
		}

		if (createdPosts.length > 0) {
			this.posts = createdPosts
				.map((post: any) => {
					post['dateForUI'] = this.publishService.getPostAnalyticsDateForUI(post.toBePostedAtUTCTicks);
					if (post.analytics) {
						post['activityPercentage'] = this.getActivityPercentage(post.analytics.activityRate);
					}
					return post;
				})
				.sort((postA, postB) =>
					postA.createdAtUTC > postB.createdAtUTC ? -1 : postA.createdAtUTC < postB.createdAtUTC ? 1 : 0
				);
		} else {
			this.posts = [];
		}
		this.isLoading = false;
		this.isInitialLoadComplete = true;
	}

	async loadPostAnalyticsForTimePeriod(timePeriod) {
		this.isLoading = true;
		this.selectedGroup.initializeMetricsService(this.metricsService);
		let report;
		if (timePeriod === 'LAST_MONTH') {
			await this.selectedGroup.generateReportsForTheLastMonth(this.selectedGroup.id);
			this.selectedGroup.summaryReportForLastMonth.subscribe(data => (report = data));
		} else {
			await this.selectedGroup.generateReportsForLast30Days(this.selectedGroup.id);
			if (timePeriod === '7_DAYS') {
				report = this.selectedGroup.summarydataForLast7Days;
			} else if (timePeriod === '14_DAYS') {
				report = this.selectedGroup.summarydataForLast14Days;
			} else {
				this.selectedGroup.summaryReportForLast30Days.subscribe(data => (report = data));
			}
		}
		this.report = report;
		await this.loadPostAnalytics(timePeriod);
		this.postAnalytics30Days['totalPosts'] = report.totalPosts;
		this.postAnalytics30Days['convosightPosts'] = this.posts.length;
		this.postAnalytics30Days['convosightPostPercentage'] =
			report.totalPosts > 0
				? (this.postAnalytics30Days['convosightPosts'] / this.postAnalytics30Days['totalPosts']).toString()
				: '0';
		this.postAnalytics30Days['convosightActivityRate'] = Number(
			(
				this.posts
					.filter(post => post.analytics && Object.keys(post.analytics).length > 0)
					.reduce((accumulator, currentValue) => {
						return accumulator + currentValue.analytics.activityRate;
					}, 0) / this.posts.length
			).toFixed(2)
		);

		this.postAnalytics30Days['totalActivityRate'] = report.totalActivityRate;

		const last30DaysConvosightActivity = this.getActivityPercentage(this.postAnalytics30Days['convosightActivityRate']);

		if (last30DaysConvosightActivity) {
			this.postAnalytics30Days['convosightActivityPercentage'] = `${last30DaysConvosightActivity.perf}%`;
			this.postAnalytics30Days['convosightActivityColor'] = last30DaysConvosightActivity.color;
		} else {
			this.postAnalytics30Days['convosightActivityPercentage'] = null;
			this.postAnalytics30Days['convosightActivityColor'] = null;
		}

		if (this.postAnalytics30Days['convosightActivityRate'] > this.postAnalytics30Days['totalActivityRate']) {
			this.postAnalytics30Days['convosigtSuggestionImapactRate'] =
				this.postAnalytics30Days['totalActivityRate'] !== 0
					? Math.ceil(
							((this.postAnalytics30Days['convosightActivityRate'] - this.postAnalytics30Days['totalActivityRate']) /
								this.postAnalytics30Days['totalActivityRate']) *
								100
					  ) * this.postAnalytics30Days['totalActivityRate']
					: Math.ceil(this.postAnalytics30Days['convosightActivityRate'] * 100);
			this.postAnalytics30Days['convosigtSuggestionImapactRateDifference'] =
				this.postAnalytics30Days['totalActivityRate'] !== 0
					? Math.ceil(
							((this.postAnalytics30Days['convosightActivityRate'] - this.postAnalytics30Days['totalActivityRate']) /
								this.postAnalytics30Days['totalActivityRate']) *
								100
					  )
					: 0;
		}

		this.post30DaysAnalyticsLoaded = true;
	}

	getActivityPercentage(postAvtivity) {
		if (this.report && this.report.totalActivityRate > 0) {
			if (postAvtivity >= this.report.totalActivityRate) {
				return {
					color: 'green',
					perf: (((postAvtivity - this.report.totalActivityRate) / this.report.totalActivityRate) * 100).toFixed(0)
				};
			} else if (postAvtivity < this.report.totalActivityRate) {
				return {
					color: 'red',
					perf: (
						(Math.abs(postAvtivity - this.report.totalActivityRate) / this.report.totalActivityRate) *
						100
					).toFixed(0)
				};
			}
		}
		return null;
	}

	setUrlParamAndLog(from) {
		let url, title, name;
		const data = {
			group_id: this.selectedGroup.id,
			group_name: this.selectedGroup.name,
			group_fb_id: this.selectedGroup.fbGroupId
		};
		if (this.router.url.includes('postanalytics')) {
			if (from === 'groupPublish') {
				url = `/group-admin/group/${this.selectedGroup.id}/postanalytics`;
				title = `GA - ${this.selectedGroup.name} - Schedule Posts - Post Analytics`;
				name = 'GA - Schedule Posts Post Analytics';
			} else {
				url = `/group-admin/publish/${this.selectedGroup.id}/postanalytics`;
				title = `GA - Schedule Posts - ${this.selectedGroup.name} - Post Analytics`;
				name = 'GA - Schedule Posts - Post Analytics';
			}
		}

		this.router.navigateByUrl(url);
		this.logPageTitle(title, name, data);
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	setTimePeriod(timePeriod) {
		switch (timePeriod) {
			case '7_DAYS':
				this.timePeriodForReport = '7_DAYS';
				break;
			case '14_DAYS':
				this.timePeriodForReport = '14_DAYS';
				break;
			case 'LAST_30Days':
				this.timePeriodForReport = 'last30Days';
				break;
			case 'LAST_MONTH':
				this.timePeriodForReport = 'lastMonth';
				break;
		}
		this.isChaningFilter = true;
		this.selectedTimePeriod = this.timePeriodOptions[timePeriod];
		this.loadPostAnalyticsForTimePeriod(timePeriod);
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	async ngOnChanges(changes: SimpleChanges) {
		if (!changes.postAnalyticData.currentValue.selectedGroup) {
			return;
		}
		this.selectedGroup = changes.postAnalyticData.currentValue.selectedGroup;
		this.showSubNav = changes.postAnalyticData.currentValue.isNavRequired;
		this.showEmptyPostScreen = false;
		this.post30DaysAnalyticsLoaded = false;
		this.loadInitialData(this.selectedGroup);
	}

	goToComposePost() {
		if (this.appService.currentPageUrl.getValue().includes('publish')) {
			this.router.navigateByUrl(`/group-admin/publish/${this.selectedGroup.id}/post/create?method=direct`);
		} else {
			this.router.navigateByUrl(`/group-admin/group/${this.selectedGroup.id}/post/create?method=direct`);
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
