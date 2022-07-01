import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {CampaignReportService} from '@sharedModule/services/campaign-report.service';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {UtilityService} from '@sharedModule/services/utility.service';
import {DateTime} from '@sharedModule/models/date-time';
import {CampaignPost} from '@sharedModule/models/graph-ql.model';

@Component({
	selector: 'app-campaign-report-posts',
	templateUrl: './campaign-report-posts.component.html',
	styleUrls: ['./campaign-report-posts.component.scss']
})
export class CampaignReportPostsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaign;
	@Input() startDate = null;
	@Input() endDate = null;
	@Input() groups = [];
	@Input() campaignHighlights = [];
	@Input() isFromReportView = false;
	@Output() closeConversations = new EventEmitter<any>();

	conversations: CampaignPost[] = [];
	terms = [];
	searchParam = null;
	isLoading = false;
	startDatePicker;
	endDatePicker;
	isSearchParamEnabled = false;
	from = 0;
	end = 0;
	isConversationsLoaded = false;
	isSubmitting = false;
	nextToken = null;
	limit = 100;
	numOfSearchedConversations = [];
	isAllowedToUpdate = false;
	selectedPosts = [];

	constructor(
		injector: Injector,
		private conversationService: ConversationService,
		private campaignReportService: CampaignReportService,
		private utilityService: UtilityService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.startDatePicker = this.startDate;
		this.endDatePicker = new DateTime(this.endDate).add(7, 'days').toDate();
		this.campaignHighlights = this.campaignHighlights.sort();
		this.getCampaignPosts();
		this.startDate = new DateTime(this.startDate).toDate();
		this.endDate = new DateTime(this.endDate).add(7, 'days').toDate();
	}

	async getCampaignPosts() {
		this.isLoading = true;
		const campaignPosts = await this.campaignReportService.getCampaignPosts(
			this.campaign.campaignId,
			1000,
			this.nextToken
		);
		this.nextToken = campaignPosts.nextToken;

		let conversations = campaignPosts.items;
		if (conversations.length === 1000) {
			const nextCampaignPosts = await this.campaignReportService.getCampaignPosts(
				this.campaign.campaignId,
				1000,
				this.nextToken
			);
			conversations = conversations.concat(nextCampaignPosts.items);
		}

		if (conversations.length < this.limit) {
			if (conversations.length === 0) {
				this.from -= this.limit;
			} else {
				this.end += this.limit;
			}
		} else {
			this.end += this.limit;
		}

		if (this.nextToken === null) {
			this.isConversationsLoaded = true;
		}

		this.conversations = this.conversations.concat(conversations);
		this.conversations.forEach(conv => {
			conv['isSelected'] = this.campaignHighlights.find(post => conv.sourceId === post)?.length > 0;
		});
		this.selectedPosts = this.conversations.filter(conv => conv['isSelected'] === true);
		this.conversations.forEach(conv => {
			conv['isSearched'] = true;
		});
		this.numOfSearchedConversations = this.conversations;
		this.isLoading = false;
	}

	getNextConversations() {
		if (this.from + this.limit + 1 > this.conversations?.length && !this.isConversationsLoaded) {
			this.from += this.limit;
		} else if (this.from + this.limit + 1 <= this.conversations?.length) {
			this.from += this.limit;
			this.end += this.limit;
		}
	}

	getPreviousConversations() {
		this.from -= this.limit;
		this.end -= this.limit;
	}

	onSearchInput() {
		this.isSearchParamEnabled = this.searchParam?.trim()?.length >= 3;
	}

	saveDate() {
		if (this.endDatePicker) {
			this.onKeywordAndDateRangeApplied();
		}
	}

	onSearch() {
		this.terms = [];
		this.terms.push(this.searchParam);
		this.searchParam = null;
		this.isSearchParamEnabled = false;
		this.onKeywordAndDateRangeApplied();
	}

	onKeywordRemove(index) {
		this.terms.splice(index, 1);
		this.onKeywordAndDateRangeApplied();
	}

	onKeywordAndDateRangeApplied() {
		this.isLoading = true;
		const terms = [];
		this.terms.forEach(term => terms.push(term.toLowerCase()));
		this.conversations.forEach(conv => {
			conv['isSearched'] = true;
			const rawText = conv.postRawText.toLowerCase();
			terms.forEach(term => {
				conv['isSearched'] = rawText.indexOf(term) > -1;
			});

			if (new DateTime().parseUTCString(conv.postCreatedAtUTC).isBetween(this.startDatePicker, this.endDatePicker)) {
				conv['isSearched'] = conv['isSearched'];
			} else {
				conv['isSearched'] = false;
			}
		});
		this.numOfSearchedConversations = this.conversations.filter(conv => conv['isSearched'] === true);
		this.resetPagination();
		if (this.numOfSearchedConversations.length < this.limit) {
			this.end = this.numOfSearchedConversations.length;
		} else {
			this.end += this.limit;
		}
		this.isLoading = false;
	}

	resetPagination() {
		this.from = 0;
		this.end = 0;
	}

	onPostSelection(post) {
		post.isSelected = !post.isSelected;
		this.selectedPosts = this.conversations.filter(conv => conv['isSelected']);
		const selectedSourceIds = this.selectedPosts.map(post => post.sourceId)?.sort();
		this.isAllowedToUpdate = !(JSON.stringify(this.campaignHighlights) === JSON.stringify(selectedSourceIds));
	}

	async onCloseConversations(isFromBackBtn) {
		if (this.isFromReportView && !isFromBackBtn) {
			await this.updatePosts();
		}
		if (isFromBackBtn) {
			this.closeConversations.emit(null);
		} else {
			this.closeConversations.emit(this.selectedPosts);
		}
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	async updatePosts() {
		if (!this.isAllowedToUpdate) {
			this.closeConversations.emit(this.selectedPosts);
			return;
		}

		this.isSubmitting = true;
		let calls = [];
		const chunkSize = 25;
		const batchOfCampaignTasks = [];
		const campaignPostsInfo = [];

		this.selectedPosts.forEach(async post => {
			const taskInfo = {};
			taskInfo['campaignId'] = this.campaign.campaignId;
			taskInfo['sourceId'] = post['sourceId'];
			taskInfo['fbPermlink'] = post['fbPermlink'];
			taskInfo['groupName'] = post['groupName'];
			taskInfo['postCreatedAtUTC'] = new DateTime().parseUTCString(post['postCreatedAtUTC']).utc().toISOString();
			taskInfo['postCreatedByName'] = post['postCreatedByName'];
			taskInfo['postRawText'] = post['postRawText'];
			taskInfo['postPhotoUrl'] = post['postPhotoUrl'] ? post['postPhotoUrl'] : post['videothumbnailurl'];
			campaignPostsInfo.push(taskInfo);
		});

		for (let index = 0; index < campaignPostsInfo.length; index += chunkSize) {
			const tasks = campaignPostsInfo.slice(index, index + chunkSize);
			batchOfCampaignTasks.push(tasks);
		}
		try {
			for (let index = 0; index < batchOfCampaignTasks.length; index++) {
				calls = [];
				if (batchOfCampaignTasks[index]) {
					calls.push(this.campaignReportService.updateCampaignPosts(batchOfCampaignTasks[index]));
				}
				await Promise.all(calls);
			}
			this.isSubmitting = false;
		} catch (e) {
			this.isSubmitting = false;
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
