import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {CampaignReportService} from '@sharedModule/services/campaign-report.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {BaseComponent} from '@sharedModule/components/base.component';
import {ConversationModel} from '@sharedModule/models/conversation.model';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {DateTime} from '@sharedModule/models/date-time';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {AppDateAdapter, DATE_FORMATS} from '@sharedModule/components/custom-date-format.component';
import * as _ from 'lodash';

@Component({
	selector: 'app-campaign-report',
	templateUrl: './campaign-report.component.html',
	styleUrls: ['./campaign-report.component.scss'],
	providers: [
		{provide: DateAdapter, useClass: AppDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}
	]
})
export class CampaignReportComponent extends BaseComponent implements OnInit, OnDestroy {
	campaignReportForm: FormGroup;
	groupIds = [];
	brandKeywords = [];
	customKeywords = [];
	hashtags = [];
	installedGroups = [];
	selectedGroups = [];
	isCampaignPostsEnabled = false;
	conversations = [];
	isSubmitting = false;
	campaign;
	isEditable = true;
	minDate;
	maxDate = new DateTime().toDate();
	endMinDate;
	campaignReport;
	isEditMode = false;
	user: UserModel;

	separatorKeysCodes: number[] = [ENTER, COMMA];

	constructor(
		injector: Injector,
		private groupsService: GroupsService,
		private campaignReportService: CampaignReportService,
		private userService: UserService,
		private router: Router,
		private route: ActivatedRoute
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Report', 'GA - Campaign Report');
		this.minDate = new DateTime().subtract(3, 'months').toDate();
		this.endMinDate = new DateTime().subtract(3, 'months').toDate();
		this.subscriptionsToDestroy.push(
			this.groupsService.groups.subscribe(async groups => {
				if (!groups) {
					return;
				}
				this.installedGroups = groups.filter(group => group.state === GroupStateEnum.Installed && !group.isDead);
				this.installedGroups.forEach(group => (group['isSelected'] = false));
				this.setSelectionGroupData();
			})
		);
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(usr => {
				if (!usr) {
					return;
				}

				this.user = usr;
			})
		);
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(async params => {
				const id = params['campaignId'];
				if (id) {
					this.isEditMode = true;
				}
				const campaignReports = await this.campaignReportService.getUserSelfMonetizationCampaigns();
				campaignReports.forEach(campaignReport => {
					campaignReport['isCompleted'] =
						new DateTime().diff(new DateTime().parseUTCString(campaignReport.createdAtUTC).dayJsObj, 'days') > 7;
				});
				this.campaign = campaignReports.filter(campaign => campaign.campaignId === id)?.[0];
				this.getCampaignReportWithPosts(id);
			})
		);
	}

	async getCampaignReportWithPosts(campaignId) {
		if (!campaignId) {
			this.createReportForm(null);
			return;
		}

		try {
			this.campaignReport = await this.campaignReportService.getCampaignReportWithPosts(campaignId);
			this.conversations = this.campaignReport.CampaignPosts;
			this.conversations?.forEach(conv => {
				ConversationModel.setProperties(conv);
				conv['isChecked'] = true;
			});
		} catch (e) {
			this.conversations = [];
		}
		this.createReportForm(this.campaign);
		this.setSelectionGroupData();
		this.selectedGroups = this.installedGroups.filter(group => group['isSelected'] === true);
		this.groupIds = this.selectedGroups.map(group => group.id);
		this.brandKeywords = this.campaign?.brandKeywords ? this.campaign?.brandKeywords : [];
		this.customKeywords = this.campaign?.customKeywords ? this.campaign?.customKeywords : [];
		this.customKeywords = this.campaign?.hashtags
			? this.campaign?.customKeywords.concat(this.campaign?.hashtags)
			: this.campaign?.customKeywords;
		this.customKeywords = _.uniq(this.customKeywords);
	}

	setSelectionGroupData() {
		this.installedGroups.forEach(group => {
			group['isSelected'] = this.campaign?.groupIds?.includes(group.id);
		});
	}

	createReportForm(campaignInfo) {
		this.campaignReportForm = new FormGroup({
			campaignName: new FormControl(campaignInfo?.['campaignName'], [Validators.required]),
			startDateAtUTC: new FormControl(campaignInfo?.['startDateAtUTC'], [Validators.required]),
			endDateAtUTC: new FormControl(campaignInfo?.['endDateAtUTC'], [Validators.required]),
			campaignSummary: new FormControl(campaignInfo?.['campaignSummary'])
		});

		this.subscriptionsToDestroy.push(
			this.campaignReportForm.get('startDateAtUTC').valueChanges.subscribe(data => {
				this.setMinEndDate();
			})
		);
		this.subscriptionsToDestroy.push(
			this.campaignReportForm.get('endDateAtUTC').valueChanges.subscribe(data => {
				this.selectPostsBasedOnSelection();
			})
		);
	}

	setMinEndDate() {
		const startDate = this.campaignReportForm.get('startDateAtUTC').value;
		const endDate = this.campaignReportForm.get('endDateAtUTC').value;

		this.endMinDate = new DateTime().parseUTCString(this.campaignReportForm.get('startDateAtUTC').value).toDate();

		if (
			endDate &&
			new DateTime().parseUTCString(endDate).diff(new DateTime().parseUTCString(startDate).dayJsObj, 'days') < 0
		) {
			this.campaignReportForm.get('endDateAtUTC').setValue('');
		} else {
			this.selectPostsBasedOnSelection();
		}
	}

	setSelectedGroups(event) {
		const groupIds = event?.map(group => group.id);
		this.installedGroups.forEach(group => {
			group['isSelected'] = groupIds?.includes(group.id);
		});
		this.groupIds = this.installedGroups.filter(group => group['isSelected'] === true).map(group => group.id);
		this.selectPostsBasedOnSelection();
	}

	selectPostsBasedOnSelection() {
		const startDate = new DateTime().parseUTCString(this.campaignReportForm.get('startDateAtUTC').value).toDate();
		const endDate = new DateTime().parseUTCString(this.campaignReportForm.get('endDateAtUTC').value).toDate();
		const selectedGroups = this.installedGroups.filter(group => group['isSelected'] === true);
		this.conversations.forEach(conv => {
			const convCreatedAt = new DateTime().parseUTCString(conv['createdatutc']).toDate();
			const isConvExists =
				selectedGroups.filter(
					group => group.name === conv['groupname'] && convCreatedAt >= startDate && convCreatedAt <= endDate
				)?.length > 0;
			conv['isDeleted'] = !isConvExists;
		});
		this.conversations = this.conversations.filter(conv => conv['isDeleted'] === false);
	}

	addKeywords(event: MatChipInputEvent, keywords): void {
		const input = event.input;
		const value = event.value;

		if ((value || '').trim()) {
			const words = value.trim().split(',');
			words.forEach(word => {
				if (word.trim()) {
					keywords.push(word.trim());
				}
			});
		}

		if (input) {
			input.value = '';
		}
	}

	removeKeywords(index, keywords): void {
		keywords = keywords.splice(index, 1);
	}

	navigateToCampaignReports() {
		if (this.isEditMode) {
			this.router.navigateByUrl(
				`group-admin/campaigns/campaign-report/campaign-report-view/${this.campaign?.campaignId}`
			);
		} else {
			this.router.navigateByUrl(`group-admin/campaigns/campaign-report`);
		}
	}

	closeConversations(campaignPosts) {
		const campaignReportPosts = this.campaignReport?.campaignReportPosts;
		if (campaignReportPosts?.length > 0) {
			campaignPosts?.forEach(post => {
				if (post.isChecked && !post.isSelected) {
					this.conversations = this.conversations.filter(conv => conv.sourceId !== post.sourceId);
				} else if (!post.isChecked) {
					const campaignReports = this.conversations.filter(conv => conv.sourceId === post.sourceId);
					if (campaignReports?.length === 0) {
						post['postCreatedAtUTC'] = post['createdatutc'];
						post['postCreatedByName'] = post['postedbyname'];
						post['postRawText'] = post['rawText'];
						post['postPhotoUrl'] = post['photourl'];
						this.conversations.push(post);
					}
				}
			});
		} else if (campaignPosts) {
			campaignPosts.forEach(post => {
				post['postCreatedAtUTC'] = post['createdatutc'];
				post['postCreatedByName'] = post['postedbyname'];
				post['postRawText'] = post['rawText'];
				post['postPhotoUrl'] = post['photourl'];
			});
			this.conversations = campaignPosts;
		}

		this.isCampaignPostsEnabled = false;
	}

	removePostFromConversations(convId) {
		this.conversations = this.conversations.filter((conv, index) => conv.id !== convId);
	}

	async createSelfMonetizationCampaign() {
		this.isSubmitting = true;
		const selfMonetizationCampaignInput = {};
		if (this.campaign) {
			selfMonetizationCampaignInput['campaignId'] = this.campaign.campaignId;
		}
		selfMonetizationCampaignInput['campaignName'] = this.campaignReportForm.get('campaignName').value;
		selfMonetizationCampaignInput['startDateAtUTC'] = new DateTime()
			.parseUTCString(this.campaignReportForm.get('startDateAtUTC').value)
			.utc()
			.toISOString();
		selfMonetizationCampaignInput['endDateAtUTC'] = new DateTime()
			.parseUTCString(this.campaignReportForm.get('endDateAtUTC').value)
			.utc()
			.toISOString();
		selfMonetizationCampaignInput['groupIds'] = this.groupIds;
		selfMonetizationCampaignInput['brandKeywords'] = this.brandKeywords;
		selfMonetizationCampaignInput['hashtags'] = this.hashtags;
		selfMonetizationCampaignInput['customKeywords'] = this.customKeywords;
		selfMonetizationCampaignInput['campaignSummary'] = this.campaignReportForm.get('campaignSummary').value;

		if (!this.isEditMode) {
			this.campaign = await this.campaignReportService.createSelfMonetizationCampaign(selfMonetizationCampaignInput);
		} else {
			this.campaign = await this.campaignReportService.updateSelfMonetizationCampaignDetails(
				selfMonetizationCampaignInput
			);
		}

		if (this.campaign) {
			this.createCampaignPosts(this.campaign);
			this.campaignReportService.selfMonetizeAnalyse(this.campaign.campaignId);
		}
	}

	async createCampaignPosts(campaign) {
		let calls = [];
		const chunkSize = 25;
		const batchOfCampaignTasks = [];
		const campaignPostsInfo = [];

		this.conversations?.forEach(async post => {
			const taskInfo = {};
			taskInfo['campaignId'] = campaign.campaignId;
			taskInfo['sourceId'] = post['sourceId'];
			taskInfo['fbPermlink'] = post['fbPermlink'];
			taskInfo['groupName'] = post['groupname'];
			taskInfo['postCreatedAtUTC'] = post['postCreatedAtUTC'];
			taskInfo['postCreatedByName'] = post['postCreatedByName'];
			taskInfo['postRawText'] = post['postRawText'];
			taskInfo['postPhotoUrl'] = post['postPhotoUrl'];
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
					if (!this.isEditMode) {
						calls.push(this.campaignReportService.createCampaignPosts(batchOfCampaignTasks[index]));
					} else {
						calls.push(this.campaignReportService.updateCampaignPosts(batchOfCampaignTasks[index]));
					}
				}
				await Promise.all(calls);
			}
			this.isSubmitting = false;
			this.router.navigateByUrl(`group-admin/campaigns/campaign-report/campaign-report-view/${campaign?.campaignId}`);
		} catch (e) {
			this.isSubmitting = false;
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
