import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {GroupModel} from 'src/app/shared/models/group.model';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupTrendsReportService} from '../../../_services/group-conversation-trends.service';
import {GroupsService} from 'src/app/shared/services/groups.service';
import {BusinessCategoryEnum} from '@sharedModule/enums/business-category.enum';
import {WordCloudService} from '@sharedModule/services/word-cloud.service';
import {PublishService} from 'src/app/group-admin/_services/publish.service';
import {KeyValue} from '@angular/common';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-group-conversation-trends',
	templateUrl: './group-conversation-trends.component.html',
	styleUrls: ['./group-conversation-trends.component.scss']
})
export class GroupConversationTrendsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Output() categoryDetailClicked = new EventEmitter();
	@Output() goToOverviewPage = new EventEmitter<string>();
	user: UserModel;
	topTopics = null;
	topCategories: {[key: string]: number} = null;
	numberOfTopCategories: number = 0;
	topIssues = null;
	topRemedies = null;
	topProducts = null;
	topBrands = null;
	top10Bigrams = null;
	metricsFor7Days = new BehaviorSubject<any>(null);
	metricsFor14Days = new BehaviorSubject<any>(null);
	showConversationList = false;
	groupIds = [];
	keyWords = [];
	conversationType = '';
	showCategory = false;
	selectedCategory = '';
	noTrendsFound = false;
	loadingTrends = false;
	hashParam = '';
	days = 7;
	showConvoTrend;
	showCategorySurvey = false;
	wordCloud;
	showInactivityMsg = false;

	constructor(
		private injector: Injector,
		private readonly router: Router,
		private readonly groupTrendsReportService: GroupTrendsReportService,
		private readonly groupsService: GroupsService,
		private readonly wordCloudService: WordCloudService,
		private publishService: PublishService,
		private readonly userService: UserService
	) {
		super(injector);
	}

	counter(i) {
		return new Array(i);
	}

	async ngOnInit() {
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				this.group = group;
				if (this.appService.currentPageUrl.getValue().includes('CT-')) {
					this.showCategory = false;
					this.router.navigateByUrl(`/group-admin/group/${this.group.id}/conversationtrends#7days`);
				}
				this.metricsFor7Days.next(null);
				this.metricsFor14Days.next(null);
				this.setUrlParamAndLog('7days');
				this.groupIds.push(this.group.id);
			})
		);
		this.checkToShowInactivityMessage();
		const e = this;
		window.addEventListener('popstate', function (event) {
			if (e.router.url.includes('CT-')) {
				e.closeCategory(false);
			}
		});
		super._ngOnInit();
	}

	async checkToShowInactivityMessage() {
		this.user = await this.userService.getUser();
		if (!this.user.accessTokenReActivatedAtUTC) {
			return;
		}
		const currDate = new DateTime().valueOf();
		const oneDayPlusReactivateDate = this.user.accessTokenReActivatedAtUTC
			? new DateTime(this.user.accessTokenReActivatedAtUTC).add(1, 'd').valueOf()
			: '';

		if (currDate < oneDayPlusReactivateDate) {
			this.showInactivityMsg = true;
		}
	}

	async getConversationTrendsData(days: number) {
		this.days = days;
		if (days === 7) {
			this.hashParam = '7days';
			this.router.navigateByUrl(`/group-admin/group/${this.group.id}/conversationtrends#7days`);
			this.logPageTitle(`GA - ${this.group.name} - Conversation Trends 7 days`, 'GA - Conversation Trends', {
				group_fb_id: this.group.fbGroupId,
				group_id: this.group.id,
				group_name: this.group.name
			});
		} else {
			this.hashParam = '14days';
			this.router.navigateByUrl(`/group-admin/group/${this.group.id}/conversationtrends#14days`);
			this.logPageTitle(`GA - ${this.group.name} - Conversation Trends 14 days`, 'GA - Conversation Trends', {
				group_fb_id: this.group.fbGroupId,
				group_id: this.group.id,
				group_name: this.group.name
			});
		}
		if (days === 7 && this.metricsFor7Days.getValue()) {
			this.noTrendsFound = false;
			this.setConversationTrendsData(this.metricsFor7Days.getValue());
			return;
		} else if (days === 14 && this.metricsFor14Days.getValue()) {
			this.noTrendsFound = false;
			this.setConversationTrendsData(this.metricsFor14Days.getValue());
			return;
		}

		this.loadingTrends = true;
		await this.group.loadConversationTrends(this.groupTrendsReportService);
		const metrics = days === 7 ? this.group.conversationTrendsForLast7Days : this.group.conversationTrendsForLast14Days;
		this.loadingTrends = false;

		if (metrics && metrics.isEmpty) {
			this.noTrendsFound = true;
			return;
		}

		this.noTrendsFound = false;

		if (days === 7) {
			this.metricsFor7Days.next(metrics);
		} else {
			this.metricsFor14Days.next(metrics);
		}

		this.setConversationTrendsData(metrics);

		if (this.group['businessCategory'] !== BusinessCategoryEnum.Parenting) {
			this.top10Bigrams = metrics.top10Bigrams;
			this.wordCloud = metrics.topTopics
				? {wordCloudData: await this.wordCloudService.getWordCloudData(metrics.topTopics)}
				: {wordCloudData: null};
		}
	}

	setConversationTrendsData(data: any) {
		this.topTopics = data.topTopics;
		this.topCategories = data.topCategories;
		this.numberOfTopCategories = Object.keys(this.topCategories).length;
		this.topBrands = data.topBrands;
		this.topIssues = data.topIssues;
		this.topProducts = data.topProducts;
		this.topRemedies = data.topRemedies;
	}

	goToOverview(event) {
		this.goToOverviewPage.next('overview');
	}

	showConversations(keyword: string, type: string, element: any) {
		this.recordButtonClick(element, this.group, keyword);
		this.conversationType = type;
		this.keyWords.push(keyword);
		this.showConversationList = true;
		this.disableScrolling();
	}

	closeConversationList(event) {
		if (this.router.url.includes('conversationtrends#7days')) {
			this.setUrlParamAndLog('7days');
		} else {
			this.setUrlParamAndLog('14days');
		}
		this.showConversationList = event;
		this.keyWords = [];
		this.enableScrolling();
	}

	closeCategory(event) {
		if (this.router.url.includes('CT-7')) {
			this.setUrlParamAndLog('7days');
		} else {
			this.setUrlParamAndLog('14days');
		}
		this.categoryDetailClicked.emit(this.showCategory);
		// the next line does not seems useful here
		this.showCategory = event;
	}

	groupTabVisibilityToggle() {
		this.categoryDetailClicked.emit(!this.showCategory);
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	preserveOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
		return 0;
	};

	setUrlParamAndLog(param) {
		if (this.router.url.includes('conversationtrends')) {
			if (param === '7days') {
				this.getConversationTrendsData(7);
			} else if (param === '14days') {
				this.getConversationTrendsData(14);
			} else if (param[2] === 'category') {
				this.showCategoryPage(param);
			} else {
				if (param[1] !== '7D' && param[1] !== '14D') {
					this.getConversationTrendsData(7);
				} else {
					this.showConversation(param);
				}
			}
		}
	}

	showConversation(param) {
		if (param[1] === '7D') {
			this.hashParam = '7days';
			this.getConversationTrendsData(7);
			if (param[2] === 'toptopics') {
				this.keyWords.push(param[4]);
			} else {
				this.keyWords.push(param[3]);
			}
		} else {
			this.hashParam = '14days';
			this.getConversationTrendsData(14);
			if (param[2] === 'toptopics') {
				this.keyWords.push(param[4]);
			} else {
				this.keyWords.push(param[3]);
			}
		}
		this.showConversationList = true;
		this.disableScrolling();
	}

	showCategoryPage(param) {
		if (param[1] === '7D') {
			this.hashParam = '7days';
		} else {
			this.hashParam = '14days';
		}
		this.showCategory = true;
		this.selectedCategory = param[3];
		this.categoryDetailClicked.emit(!this.showCategory);
	}

	async closeBusinessCategory() {
		await this.groupsService.refresh();
		this.showCategorySurvey = false;
		this.showConvoTrend = true;
		await this.ngOnInit();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
		this.appService.currentPageFragment = '';
		this.setUrlParamAndLog(this.appService.currentPageFragment);
	}
}
