import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {GroupsService} from 'src/app/shared/services/groups.service';
import {environment} from 'src/environments/environment';
import {PublishService} from '../../_services/publish.service';

@Component({
	selector: 'app-group',
	templateUrl: './group.component.html',
	styleUrls: ['./group.component.scss']
})
export class GroupComponent extends BaseComponent implements OnInit, OnDestroy {
	group: GroupModel;
	isNonProd = false;
	hashParam = '';
	loadingData = true;
	title = '';
	showMobileHeader = false;

	constructor(
		injector: Injector,
		private groupsService: GroupsService,
		readonly router: Router,
		private route: ActivatedRoute,
		private readonly publishService: PublishService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.getGroupData();
		this.publishService.selectedGroup.subscribe(group => {
			this.group = group;
		});
		this.checkForShowingMobileHeader();
		if (environment.envName !== 'production') {
			this.isNonProd = true;
		}
		/*redirection from fragments to urls*/
		const url = this.router.url;
		const urlParams = url.split('/');
		if (
			urlParams[3]?.match('#') &&
			!this.router.url.includes('statistics') &&
			!this.router.url.includes('conversationtrends') &&
			!this.router.url.includes('create')
		) {
			this.router.navigateByUrl(`/${urlParams[1]}/group/${urlParams[3].split('#')[0]}/${urlParams[3].split('#')[1]}`);
		}
		if (this.router.url.includes('statistics')) {
			this.router.navigateByUrl(`group-admin/group/${urlParams[3].split('#')[0]}/statistics`);
		}
		if (this.router.url.includes('conversationtrends7days')) {
			this.router.navigateByUrl(`group-admin/group/${urlParams[3].split('#')[0]}/conversationtrends#7days`);
		}
		if (this.router.url.includes('conversationtrends14days')) {
			this.router.navigateByUrl(`group-admin/group/${urlParams[3].split('#')[0]}/conversationtrends#14days`);
		}
	}

	checkForShowingMobileHeader() {
		const pageUrl = this.router.url;
		if (pageUrl.includes('urgentAlerts/') || pageUrl.includes('CT-') || pageUrl.includes('/post/')) {
			this.showMobileHeader = false;
			this.hashParam = pageUrl.split('/').pop();
			return;
		}
		this.showMobileHeader = true;
		this.hashParam = pageUrl.split('/').pop();
	}

	async goBack(element) {
		this.recordButtonClick(element, this.group);
		this.router.navigate(['/group-admin/manage']);
	}

	async getGroupData() {
		try {
			this.group = await this.groupsService.getGroupDetails(this.route.snapshot.params.id);
			this.publishService.setSelectedGroup(this.group);
			this.loadingData = false;
		} catch (e) {
			this.router.navigate(['/group-admin/manage']);
			return;
		}
	}

	recordEvents(type: string) {
		let navigateToURL = `/group-admin/group/${this.group.id}/`;
		this.hashParam = type;
		const currentHash = this.appService.currentGroupPageUrl;

		switch (type) {
			case 'statistics':
				navigateToURL += type;
				this.title = 'Group Health';
				this.appService.setFreshchatFAQ('grouphealth');
				break;
			case 'overview':
				navigateToURL += type;
				this.title = 'Overview';
				this.appService.setFreshchatFAQ('overview');
				break;
			case 'conversationtrends':
				navigateToURL += 'conversationtrends#7days';
				this.title = 'Conversations';
				this.appService.setFreshchatFAQ('conversation');
				break;
			case 'conversationtrends#7days':
				navigateToURL += 'conversationtrends#7days';
				this.title = 'Conversations';
				this.appService.setFreshchatFAQ('conversation');
				break;
			case 'conversationtrends#14days':
				navigateToURL += 'conversationtrends#14days';
				this.title = 'Conversations';
				this.appService.setFreshchatFAQ('conversation');
				break;
			case 'urgentAlerts':
				this.hashParam = 'keywordTracking';
				navigateToURL += 'urgentAlerts';
				this.title = 'Keyword Alerts';
				this.appService.setFreshchatFAQ('keywordalerts');
				break;
			case 'scheduledposts':
				navigateToURL += type;
				this.title = 'Create a post';
				this.appService.setFreshchatFAQ('createpost');
				break;
			case 'postanalytics':
				navigateToURL += type;
				this.title = 'Post Analytics';
				this.appService.setFreshchatFAQ('postanalytics');
				break;
			case 'postTrends':
				navigateToURL += type;
				this.title = 'Reshare Posts';
				this.appService.setFreshchatFAQ('resharepost');
				break;
			case 'moderator':
				navigateToURL += type;
				this.title = 'Add Moderators';
				break;
			case 'groupdetails':
				navigateToURL += type;
				this.title = 'Group Details';
				this.appService.setFreshchatFAQ('groupdetails');
				break;
			case 'unanswered':
				navigateToURL += type;
				this.title = 'Unanswered Posts';
				this.appService.setFreshchatFAQ('unansweredpost');
				break;
		}
		this.router.navigateByUrl(navigateToURL);
		this.checkForShowingMobileHeader();
	}

	changeTitle(title) {
		this.title = title;
	}

	changeOfRoutes() {
		this.appService.currentGroupPageUrl = this.router.url.split('?')[0].split('/').pop();
		if (
			this.appService.currentGroupPageUrl !== 'create' &&
			this.appService.currentGroupPageUrl !== 'edit' &&
			!this.router.url.includes('urgentAlerts/') &&
			this.appService.currentGroupPageUrl !== this.group.id
		) {
			this.recordEvents(this.appService.currentGroupPageUrl);
		} else if (this.appService.currentGroupPageUrl === this.group.id) {
			this.recordEvents('overview');
		} else {
			this.checkForShowingMobileHeader();
		}
	}

	isGroupSideBarToBeDisplayed() {
		return !this.router.url.includes('/post/') || this.renderedOn !== 'Desktop';
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
