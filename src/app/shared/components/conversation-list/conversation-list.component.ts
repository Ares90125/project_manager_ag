import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {ConversationModel} from 'src/app/shared/models/conversation.model';
import {ConversationService} from 'src/app/shared/services/conversation.service';
import {Router} from '@angular/router';
import {GroupModel} from '../../models/group.model';

@Component({
	selector: 'app-conversation-list',
	templateUrl: './conversation-list.component.html',
	styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Input() heading: string;
	@Output() closeConversationList = new EventEmitter<boolean>();

	public conversationItems = [];
	public conversationList: ConversationModel[] = [];
	public ids = [];
	public from = 0;
	public limit = 100;
	public isConversationLoading = false;
	public rows = [];
	public sentimentsFilter = [];
	public type = '';
	conversationFilters = [
		{
			name: 'Sentiment',
			displayName: 'Sentiment',
			isMultipleSelection: false,
			list: [
				{name: 'Positive', displayName: 'Positive', isSelected: false},
				{name: 'Negative', displayName: 'Negative', isSelected: false},
				{name: 'Neutral', displayName: 'Neutral', isSelected: false}
			]
		}
	];

	constructor(
		injector: Injector,
		private readonly conversationService: ConversationService,
		private readonly router: Router
	) {
		super(injector);
	}

	@Input() set conversationType(value: any) {
		if (!value) {
			return;
		}

		this.type = value;
	}

	@Input()
	set keywords(value: any) {
		if (!value) {
			return;
		}

		this.conversationItems = value;
		this.initiateConversation();
	}

	@Input()
	set sentiment(value: any) {
		if (!value) {
			return;
		}
		this.sentimentsFilter = value;
	}

	@Input()
	set groupIds(value: any) {
		if (!value) {
			return;
		}

		this.ids = value;
		this.initiateConversation();
	}

	async ngOnInit() {
		super._ngOnInit();
	}

	initiateConversation() {
		this.isConversationLoading = true;
		if (this.ids.length > 0 && this.conversationItems.length > 0) {
			this.navigateAsPerHash(this.appService.currentGroupPageUrl, this.type);
			this.conversationList = [];
			this.from = 0;
			this.isConversationLoading = false;
			this.fetchConversations(this.conversationItems, this.ids, this.from, this.limit, this.sentimentsFilter, true);
		}
	}

	addItemFilter(itemName) {
		if (!this.rows.includes(itemName)) {
			this.rows.push(itemName);
		}
		this.modifiedConversation(this.rows);
	}

	filterChanged(filters) {
		this.sentimentsFilter = [];
		filters.forEach(filter => {
			filter.list.forEach(item => {
				if (item.isSelected) {
					this.sentimentsFilter.push(item.displayName.toLowerCase());
				}
			});
		});
		this.fetchConversations(this.conversationItems, this.ids, this.from, this.limit, this.sentimentsFilter, true);
	}

	modifiedConversation(Item) {
		// API CALL with filter goes here for modification
	}

	removeItemFilter(itemIndex) {
		this.rows.splice(itemIndex, 1);
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	navigateAsPerHash(hash, convoType) {
		if (!hash) {
			return;
		}
		if (!convoType) {
			convoType = hash.split('-')[2];
		}
		switch (convoType) {
			case 'toptopics' || hash.includes('D-toptopics-'):
				if (hash === 'conversationtrends#7days' || hash.includes('CT-7D')) {
					this.router.navigateByUrl(
						`/group-admin/group/${this.ids[0]}#CT-7D-toptopics-COverlay-${this.conversationItems[0]}`
					);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 7D - Top Topics - COverlay - ${this.conversationItems[0]}`,
						'GA - CT - 7D - Top Topics - COverlay',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				} else {
					this.router.navigateByUrl(
						`/group-admin/group/${this.ids[0]}#CT-14D-toptopics-COverlay-${this.conversationItems[0]}`
					);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 14D - Top Topics - COverlay - ${this.conversationItems[0]}`,
						'GA - CT - 14D - Top Topics - COverlay',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				}
				break;
			case 'issue' || hash.includes('D-issue-'):
				if (hash === 'conversationtrends#7days' || hash.includes('CT-7D')) {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-7D-issue-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 7D - Issue - ${this.conversationItems[0]}`,
						'GA - CT - 7D - Issue',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				} else {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-14D-issue-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 14D - Issue - ${this.conversationItems[0]}`,
						'GA - CT - 14D - Issue',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				}
				break;
			case 'remedy' || hash.includes('D-remedy-'):
				if (hash === 'conversationtrends#7days' || hash.includes('CT-7D')) {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-7D-remedy-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 7D - Remedy - ${this.conversationItems[0]}`,
						'GA - CT - 7D - Remedy',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				} else {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-14D-remedy-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 14D - Remedy - ${this.conversationItems[0]}`,
						'GA - CT - 14D - Remedy',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				}
				break;
			case 'product' || hash.includes('D-product-'):
				if (hash === 'conversationtrends#7days' || hash.includes('CT-7D')) {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-7D-product-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 7D - Product - ${this.conversationItems[0]}`,
						'GA - CT - 7D - Product',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				} else {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-14D-product-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 14D - Product - ${this.conversationItems[0]}`,
						'GA - CT - 14D - Product',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				}
				break;
			case 'brand' || hash.includes('D-brand-'):
				if (hash === 'conversationtrends#7days' || hash.includes('CT-7D')) {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-7D-brand-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 7D - Brand - ${this.conversationItems[0]}`,
						'GA - CT - 7D - Brand',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				} else {
					this.router.navigateByUrl(`/group-admin/group/${this.ids[0]}#CT-14D-brand-${this.conversationItems[0]}`);
					this.logPageTitle(
						`GA - ${this.group.name} - CT - 14D - Brand - ${this.conversationItems[0]}`,
						'GA - CT - 14D - Brand',
						{
							group_id: this.group.id,
							group_name: this.group.name,
							group_fb_id: this.group.fbGroupId,
							conversationType: convoType,
							keyword: this.conversationItems[0]
						}
					);
				}
				break;
		}
	}

	closeList(element) {
		this.recordButtonClick(element, this.group);
		this.closeConversationList.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	private async fetchConversations(
		keywords: any,
		groupIds: any,
		from: number,
		limit: number,
		sentimentFilter: Array<string>,
		isNewList: boolean
	) {
		this.isConversationLoading = true;
		this.conversationList = isNewList ? [] : this.conversationList;
		const conversations = (
			await this.conversationService.getConversations(keywords, groupIds, [], from, limit, sentimentFilter, null)
		).map(conversation => new ConversationModel(conversation));
		this.conversationList = isNewList ? conversations : this.conversationList.concat(conversations);
		this.isConversationLoading = false;
		super.highlightKeyword(this.conversationItems, 'ConversationsContainer');
	}
}
