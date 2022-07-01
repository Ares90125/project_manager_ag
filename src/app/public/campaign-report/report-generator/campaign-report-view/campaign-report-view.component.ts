import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {CampaignReportService} from '@sharedModule/services/campaign-report.service';
import {UserService} from '@sharedModule/services/user.service';
import {environment} from 'src/environments/environment';
import {Lightbox, LIGHTBOX_EVENT, LightboxEvent} from 'ngx-lightbox';
import {Subscription} from 'rxjs';
import {DateTime} from '@sharedModule/models/date-time';
import * as _ from 'lodash';
import {GroupsService} from '@sharedModule/services/groups.service';

@Component({
	selector: 'app-campaign-report-view',
	templateUrl: './campaign-report-view.component.html',
	styleUrls: ['./campaign-report-view.component.scss']
})
export class CampaignReportViewComponent extends BaseComponent implements OnInit, OnDestroy {
	campaignReportWithPosts;
	campaignReport;
	campaign;
	campaignPosts;
	campaignId;
	beforeAndAfterKeywordMentions = [];
	beforeAndAfterKeywordMentionsByGroup = [];
	beforeAndAfterBrandConversations = [];
	groupEngagementDetails = [];
	allPosts = [];
	user;
	showConfirmation = false;
	showDidNotRecievedPopup = false;
	participantGroupsDetails;
	storageUrl;
	quillConfig = {
		toolbar: [['bold', 'italic', {list: 'ordered'}, {list: 'bullet'}]]
	};
	isFromGroupAdmin = false;
	isSubmitting = false;
	campaignSummary = '';
	isCampaignPostsEnabled = false;
	groupIds = [];
	autoUpdateDate;
	shortenUrl = '';
	today = new DateTime().format('MMM, DD YYYY');
	campaignHighlights = [];
	limit = 100;
	from = 0;
	end = 100;
	isConversationsLoaded = false;
	isBrandMentionsAndConversationsEmpty = false;
	private _subscription: Subscription;

	constructor(
		injector: Injector,
		private userService: UserService,
		private campaignReportService: CampaignReportService,
		private groupsService: GroupsService,
		private router: Router,
		private route: ActivatedRoute,
		private readonly lightbox: Lightbox,
		private _lightboxEvent: LightboxEvent
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Report View', 'GA - Campaign Report View');
		this.storageUrl = environment.storageUrl;
		const url = window.location.href;
		if (url.indexOf('public/campaign-report/view') < 0) {
			this.isFromGroupAdmin = true;
			this.subscriptionsToDestroy.push(
				this.userService.currentUser$.subscribe(usr => {
					if (!usr) {
						return;
					}

					this.user = usr;
				})
			);
		} else {
			document.querySelector("[name='viewport']").remove();
			document.querySelector('body').classList.add('without-meta');
			this.appService.hideFreshchat();
		}
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(async params => {
				const id = params['campaignId'];
				if (!id) {
					return;
				}
				this.campaignId = id;
				if (url.indexOf('public/campaign-report/view') < 0) {
					this.getCampaignReports();
				}
				this.campaignReportWithPosts = await this.campaignReportService.getCampaignReportWithPosts(id);
				const autoUpdate = new DateTime()
					.parseUTCString(this.campaignReportWithPosts?.CampaignDetails?.endDateAtUTC)
					.add(7, 'days');
				if (autoUpdate.diff(new DateTime().dayJsObj, 'days') >= 0) {
					this.autoUpdateDate = autoUpdate.format('MMM, DD YYYY');
				} else {
					this.autoUpdateDate = null;
				}
				if (this.campaignReportWithPosts?.CampaignDetails) {
					this.campaignReportWithPosts.CampaignDetails['startDate'] = new DateTime(
						this.campaignReportWithPosts?.CampaignDetails['startDateAtUTC']
					).format('DD MMM, YYYY');
					this.campaignReportWithPosts.CampaignDetails['endDate'] = new DateTime(
						this.campaignReportWithPosts?.CampaignDetails['endDateAtUTC']
					).format('DD MMM, YYYY');
				}
				this.campaignReport = this.campaignReportWithPosts.CampaignReport;
				this.campaignPosts = this.campaignReportWithPosts.CampaignPosts;
				const campaignDetails = this.campaignReportWithPosts?.CampaignDetails;
				let customKeywords = campaignDetails?.customKeywords ? campaignDetails?.customKeywords : [];
				customKeywords = campaignDetails?.hashtags ? customKeywords.concat(campaignDetails?.hashtags) : customKeywords;
				if (this.campaignReportWithPosts?.CampaignDetails) {
					this.campaignReportWithPosts.CampaignDetails['customKeywords'] = customKeywords;
				}
				this.isConversationsLoaded = true;
				this.campaignReport?.campaignHighlights?.forEach(post => {
					this.campaignHighlights.push({src: this.storageUrl + post + '.png', type: 'image'});
				});
				this.setKeywordMentions(this.campaignReport);
				this.setBrandConversationsMentions(this.campaignReport);
				this.setGroupEngagementDetails(this.campaignReport);
				this.setKeywordAndBrandMentionByGroup(this.campaignReport);
				if (this.campaignReport?.participantGroupsDetails) {
					this.participantGroupsDetails = [];
					const details = JSON.parse(this.campaignReport.participantGroupsDetails);

					for (let key of Object.keys(details)) {
						const memberDet = details[key];
						memberDet['name'] = key;
						this.participantGroupsDetails.push(memberDet);
					}
				}
			})
		);
	}

	async getCampaignReports() {
		try {
			const campaignReports = await this.campaignReportService.getUserSelfMonetizationCampaigns();
			const dateTimeNow = new DateTime();
			campaignReports.forEach(campaignReport => {
				campaignReport['isCompleted'] =
					dateTimeNow.diff(new DateTime().parseUTCString(campaignReport.createdAtUTC).dayJsObj, 'days') > 7;
			});
			this.campaign = campaignReports.find(campaign => campaign.campaignId === this.campaignId);
			this.groupIds = [];
			this.campaign?.groupIds?.forEach(group => this.groupIds.push({id: group}));
			const groups = this.groupsService.groups.getValue();
			this.groupIds.forEach(group => {
				const selectedGroup = groups?.find(selectGroup => selectGroup.id === group.id);
				group.name = selectedGroup?.name;
			});
			if (!this.campaign) {
				this.router.navigateByUrl(`group-admin/campaigns`);
			}
		} catch (e) {
			this.router.navigateByUrl(`/group-admin/campaigns`);
		}
	}

	async setKeywordMentions(campaignReport) {
		let maxKeywordMention = 0;
		let keywordKeys = [];
		if (campaignReport?.beforeKeywordCount) {
			const beforeKeywordMentions = JSON.parse(campaignReport?.beforeKeywordCount);
			const keys = Object.keys(beforeKeywordMentions);
			keywordKeys = keys.concat(keywordKeys);
			keys.forEach(key => {
				if (+beforeKeywordMentions[key] >= maxKeywordMention) {
					maxKeywordMention = +beforeKeywordMentions[key];
				}
				this.beforeAndAfterKeywordMentions.push({name: key, beforeValue: beforeKeywordMentions[key], afterValue: 0});
			});
		}

		if (campaignReport?.afterKeywordCount) {
			const afterKeywordMentions = JSON.parse(campaignReport?.afterKeywordCount);
			const keys = Object.keys(afterKeywordMentions);
			keywordKeys = keys.concat(keywordKeys);
			maxKeywordMention = await this.setBeforeCampaignValues(
				this.beforeAndAfterKeywordMentions,
				keys,
				afterKeywordMentions,
				maxKeywordMention
			);
		}

		this.setPercentageForKeywordsAndConversations(this.beforeAndAfterKeywordMentions, maxKeywordMention);
	}

	async setKeywordAndBrandMentionByGroup(campaignReport) {
		let maxKeywordMention = 0;
		if (campaignReport?.participantGroupsDetails) {
			const keywordByGroup = JSON.parse(campaignReport?.participantGroupsDetails);

			const keys = Object.keys(keywordByGroup);
			keys.forEach(key => {
				const beforeValue = +keywordByGroup[key].beforeBrandMentions + +keywordByGroup[key].beforeKeywordMentions;
				const afterValue = +keywordByGroup[key].afterBrandMentions + +keywordByGroup[key].afterKeywordMentions;
				if (beforeValue >= maxKeywordMention) {
					maxKeywordMention = beforeValue;
				}
				if (afterValue >= maxKeywordMention) {
					maxKeywordMention = afterValue;
				}
				this.beforeAndAfterKeywordMentionsByGroup.push({
					name: key,
					beforeValue: beforeValue,
					afterValue: afterValue
				});
			});
		}

		this.setPercentageForKeywordsAndConversations(this.beforeAndAfterKeywordMentionsByGroup, maxKeywordMention);
	}

	setBrandConversationsMentions(campaignReport) {
		let maxKeywordMention = 0;
		this.beforeAndAfterBrandConversations.push({
			name: 'Brand Mentions',
			beforeValue: campaignReport?.beforeBrandMntn ? +campaignReport?.beforeBrandMntn : 0,
			afterValue: campaignReport?.afterBrandMntn ? +campaignReport?.afterBrandMntn : 0
		});
		this.beforeAndAfterBrandConversations.push({
			name: 'Brand Conversations',
			beforeValue: campaignReport?.beforeBrandConversations ? +campaignReport?.beforeBrandConversations : 0,
			afterValue: campaignReport?.afterBrandConversations ? +campaignReport?.afterBrandConversations : 0
		});
		if (+campaignReport?.beforeBrandMntn > maxKeywordMention) {
			maxKeywordMention = campaignReport?.beforeBrandMntn;
		}

		if (+campaignReport?.afterBrandMntn > maxKeywordMention) {
			maxKeywordMention = campaignReport?.afterBrandMntn;
		}

		if (+campaignReport?.beforeBrandConversations > maxKeywordMention) {
			maxKeywordMention = campaignReport?.beforeBrandConversations;
		}

		if (+campaignReport?.afterBrandConversations > maxKeywordMention) {
			maxKeywordMention = campaignReport?.afterBrandConversations;
		}

		this.isBrandMentionsAndConversationsEmpty = !(
			this.beforeAndAfterBrandConversations.reduce((sum, conv) => sum + conv.beforeValue + conv.afterValue, 0) > 0
		);
		this.setPercentageForKeywordsAndConversations(this.beforeAndAfterBrandConversations, maxKeywordMention);
	}

	setGroupEngagementDetails(campaignReport) {
		if (!campaignReport?.groupEngagementDetails) {
			return;
		}
		let maxKeywordMention = 0;
		const groupEngagementMetrics = JSON.parse(campaignReport?.groupEngagementDetails);
		const keys = Object.keys(groupEngagementMetrics);
		keys.forEach(key => {
			if (+groupEngagementMetrics[key] >= maxKeywordMention) {
				maxKeywordMention = +groupEngagementMetrics[key];
			}
			if (+groupEngagementMetrics[key] > -1) {
				this.groupEngagementDetails.push({name: key, value: groupEngagementMetrics[key]});
			}
		});
		this.groupEngagementDetails.forEach(keyword => {
			if (keyword.value && maxKeywordMention) {
				keyword['percentage'] = (keyword['value'] * 100) / maxKeywordMention;
			} else {
				keyword['percentage'] = 0;
			}
		});
		this.groupEngagementDetails = _.orderBy(this.groupEngagementDetails, [group => group.percentage], ['desc']);
	}

	setBeforeCampaignValues(keywords, keys, afterCampaignValues, maxKeywordMention) {
		keys.forEach(key => {
			if (+afterCampaignValues[key] >= maxKeywordMention) {
				maxKeywordMention = +afterCampaignValues[key];
			}

			const keyIndex = keywords.findIndex(keyword => keyword.name === key);
			if (keyIndex > -1) {
				keywords[keyIndex]['afterValue'] = afterCampaignValues[key];
			} else {
				keywords.push({name: key, beforeValue: 0, afterValue: afterCampaignValues[key]});
			}
		});
		return maxKeywordMention;
	}

	setPercentageForKeywordsAndConversations(keywords, maxKeywordMention) {
		keywords.forEach(keyword => {
			if (keyword.afterValue && maxKeywordMention) {
				keyword['afterPercentage'] = (+keyword['afterValue'] * 100) / maxKeywordMention;
			} else {
				keyword['afterPercentage'] = 0;
			}
			if (keyword.beforeValue && maxKeywordMention) {
				keyword['beforePercentage'] = (+keyword['beforeValue'] * 100) / maxKeywordMention;
			} else {
				keyword['beforePercentage'] = 0;
			}

			keyword['impact'] = keyword['afterValue'] - keyword['beforeValue'];
			if (keyword['afterValue'] > keyword['beforeValue'] && keyword['beforeValue'] > 0) {
				keyword['impactPercentage'] = ((keyword['impact'] / +keyword['beforeValue']) * 100).toFixed(0);
			} else if (keyword['beforeValue'] > 0) {
				keyword['impactPercentage'] = ((-keyword['impact'] / +keyword['beforeValue']) * 100).toFixed(0);
			} else {
				keyword['impactPercentage'] = 0;
			}
		});
	}

	openImageGallery(index: number, previewImages): void {
		this.disableScrolling();
		document.body.classList.add('special-class');

		this._subscription = this._lightboxEvent.lightboxEvent$.subscribe(event => this._onReceivedEvent(event));

		this.lightbox.open(previewImages, index, {
			centerVertically: false,
			enableTransition: false,
			resizeDuration: '0',
			disableScrolling: false,
			fitImageInViewPort: false
		});
	}

	getNextConversations() {
		if (this.from + this.limit + 1 > this.campaignPosts?.length && !this.isConversationsLoaded) {
			this.from += this.limit;
		} else if (this.from + this.limit + 1 <= this.campaignPosts?.length) {
			this.from += this.limit;
			this.end += this.limit;
		}
	}

	getPreviousConversations() {
		this.from -= this.limit;
		this.end -= this.limit;
	}

	private _onReceivedEvent(event: any): void {
		// remember to unsubscribe the event when lightbox is closed
		if (event.id === LIGHTBOX_EVENT.CLOSE) {
			// event CLOSED is fired
			this._subscription.unsubscribe();
			this.enableScrolling();
			this.lightbox.close();
		}
	}

	toggleMoreInfo(event) {
		event.currentTarget.nextElementSibling.classList.toggle('show');
	}

	toggleInfo(postId) {
		const post = document.getElementById(postId);
		post.classList.remove('show');
	}

	async updateCampaign() {
		this.isSubmitting = true;
		const selfMonetizationCampaignInput = {};
		if (this.campaign) {
			selfMonetizationCampaignInput['campaignId'] = this.campaign.campaignId;
		}
		selfMonetizationCampaignInput['campaignName'] = this.campaign.campaignName;
		selfMonetizationCampaignInput['startDateAtUTC'] = new DateTime()
			.parseUTCString(this.campaign.startDateAtUTC)
			.utc()
			.toISOString();
		selfMonetizationCampaignInput['endDateAtUTC'] = new DateTime()
			.parseUTCString(this.campaign.endDateAtUTC)
			.utc()
			.toISOString();
		selfMonetizationCampaignInput['groupIds'] = this.campaign.groupIds;
		selfMonetizationCampaignInput['brandKeywords'] = this.campaign.brandKeywords;
		selfMonetizationCampaignInput['hashtags'] = this.campaign.hashtags;
		selfMonetizationCampaignInput['customKeywords'] = this.campaign.customKeywords;
		selfMonetizationCampaignInput['campaignSummary'] = this.campaignSummary;

		this.campaign = await this.campaignReportService.updateSelfMonetizationCampaignDetails(
			selfMonetizationCampaignInput
		);
		this.campaignSummary = null;
		document.getElementById('cancel')?.click();
		this.isSubmitting = false;
	}

	async getShortenUrl() {
		this.shortenUrl = null;
		this.shortenUrl = await this.campaignReportService.getShortenUrl(
			environment.baseUrl + 'public/campaign-report/view/' + this.campaignId
		);
	}

	copyToClipboard() {
		const copyText = <HTMLInputElement>document.getElementById('copyCode');
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand('copy');
		this.alert.success('Link to your campaign report has been copied successfully', '', 5000, true);
		setTimeout(() => {
			document.getElementById('cancelShareLink')?.click();
		}, 1000);
	}

	closeConversations(event) {
		this.isCampaignPostsEnabled = false;
		if (event) {
			this.campaign.isReportAvailable = false;
			this.getCampaignReports();
		}
	}

	hideWAConfirmOptInCard() {
		this.showConfirmation = false;
		($('#convosight-whatsapp-opt') as any).modal('hide');
	}

	hideWhatsAppOverlay() {
		this.showConfirmation = false;
		($('#convosight-whatsapp-opt') as any).modal('hide');
	}

	didNotReceiveCardStatus(event) {
		this.showDidNotRecievedPopup = event;
	}

	openSubscribeNowOverlay() {
		// To open the modal
		($('#convosight-whatsapp-opt') as any).modal('show');
	}

	navigateCampaignReport() {
		this.router.navigateByUrl(`group-admin/campaigns/campaign-report`);
	}

	navigateToCampaignReportEdit() {
		this.router.navigateByUrl(`group-admin/campaigns/campaign-report/edit-report/${this.campaignId}`);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
