import {Component, HostListener, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {BrandModel} from '@sharedModule/models/brand.model';
import {CampaignInsightViewModel} from '@sharedModule/models/campaign-insight-view.model';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import {BrandService} from '../../../../services/brand.service';
import * as XLSX from 'xlsx';
import {UserService} from '@sharedModule/services/user.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';

@Component({
	selector: 'app-listening-details',
	templateUrl: './listening-details.component.html',
	styleUrls: ['./listening-details.component.scss']
})
export class ListeningDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
	categoryInsightViews: CampaignInsightViewModel[] = null;
	subCategoryInsightViews: CampaignInsightViewModel[] = null;
	brandInsightViews: CampaignInsightViewModel[] = null;
	associationInsightViews: CampaignInsightViewModel = null;
	insightViews: CampaignInsightViewModel[] = null;
	showCommunityList = false;
	showConversationList = false;
	showInsightsSidebar = false;
	conversationListItem = [];
	sentimentListItem = [];
	brandId = null;
	campaignId = null;
	selectedBrand = null;
	campaign: CampaignModel = null;
	conversationListHeading = null;
	showUpgradeModal = false;
	numOfBrandInsights = 0;
	user = null;
	isInsightsLoaded = false;

	constructor(
		injector: Injector,
		private userService: UserService,
		private brandService: BrandService,
		private router: Router,
		private route: ActivatedRoute
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.brandService.init();
		this.user = await this.userService.getUser();
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(params => {
				this.brandId = params['brandId'];
				this.campaignId = params['campaignId'];
				this.subscriptionsToDestroy.push(
					this.brandService.brands.subscribe(brands => {
						if (!brands) {
							return;
						}

						const selectedBrand = brands.find(brnd => brnd.id === this.brandId);
						this.brandService.selectedBrand.next(selectedBrand);
					})
				);
			})
		);

		this.subscriptionsToDestroy.push(
			this.brandService.selectedBrand.subscribe(brand => this.processBrandSelection(brand))
		);
	}

	async processBrandSelection(brand: any) {
		if (!brand) {
			return;
		}

		super.setPageTitle('Campaign Details', 'Campaign Details', {
			brandId: brand.id,
			brandName: brand.name,
			campaignId: this.campaignId
		});
		await this.loadCampaign(brand);
	}

	@HostListener('window:openConversationList', ['$event.detail'])
	getConversationList(eventDetails: {value: string; isSubscriptionCheckRequired: boolean; sentiment: string}) {
		if (eventDetails.isSubscriptionCheckRequired && !this.campaign.brands.includes(eventDetails.value)) {
			this.showUpgradeModal = true;
			return;
		}
		if (eventDetails.sentiment !== undefined) {
			this.sentimentListItem = [].concat(eventDetails.sentiment.toLowerCase());
		}
		this.conversationListItem = [].concat(eventDetails.value);
		this.showConversationList = true;
		this.disableScrolling();
	}

	@HostListener('window:openConversationListWithHeading', ['$event.detail'])
	openConversationPanel(value: {keywords: string | string[]; heading: string}) {
		if (value.heading === 'Brands' || value.heading === 'Share of voice') {
			this.showUpgradeModal = true;
			return;
		}

		this.conversationListItem = [].concat(value.keywords);
		this.conversationListHeading = value.heading;
		this.showConversationList = true;
		this.disableScrolling();
	}

	showCommunitiesList() {
		this.showCommunityList = true;
		this.disableScrolling();
	}

	closeCommunityList(event) {
		this.showCommunityList = event;
		this.enableScrolling();
	}

	async loadCampaign(brand: BrandModel) {
		const campaign = await brand.getCampaignById(this.campaignId);

		if (!campaign) {
			this.router.navigate(['/brand/manage-campaigns']);
			return;
		}

		this.campaign = campaign;
		this.campaign.brandId = brand.id;
		this.insightViews = await this.campaign.getInsightViews();

		this.groupViews();
	}

	getTooltipDisplayMessage(viewName: string) {
		let displayMessage = 'View insights for ';
		const startIndexOfSubCategory = viewName.lastIndexOf('(');
		const endIndexOfSubCategory = viewName.lastIndexOf(')');

		if (startIndexOfSubCategory > 0 && endIndexOfSubCategory > startIndexOfSubCategory) {
			displayMessage +=
				viewName.substr(0, startIndexOfSubCategory - 1) +
				' in the ' +
				viewName.substring(startIndexOfSubCategory + 1, endIndexOfSubCategory) +
				' sub-category';
		} else {
			displayMessage += viewName + ' in all sub-categories';
		}

		return displayMessage;
	}

	private groupViews() {
		this.categoryInsightViews = this.insightViews.filter(insightView => insightView.level === 'Category');
		this.subCategoryInsightViews = this.insightViews.filter(insightView => insightView.level === 'SubCategory');
		this.brandInsightViews = this.insightViews.filter(insightView => insightView.level === 'Brand');
		const associationInsights = this.insightViews.filter(insightView => insightView.level === 'Association');
		this.associationInsightViews = associationInsights.length > 0 ? associationInsights[0] : null;
		this.numOfBrandInsights = this.brandInsightViews.length - 1;
		this.brandInsightViews[this.numOfBrandInsights]?.isInsightsLoaded?.subscribe(isLoaded => {
			this.isInsightsLoaded = isLoaded;
		});
	}

	downloadInsights() {
		const timePeriods = ['currentMonth', 'firstMonth', 'twoMonths', 'threeMonths'];

		const sheets = {};
		const xlsxSheetNames = [];
		let commentsWorkbook = null;
		this.categoryInsightViews.forEach(categoryInsights => {
			timePeriods.forEach((timePeriod, index) => {
				let timePeriodWorkSheet = null;
				const insightsToBeDownloaded = [];
				categoryInsights?.downloadMetrics?.[timePeriod]?.forEach(metric => {
					insightsToBeDownloaded.push(metric);
				});
				timePeriodWorkSheet = XLSX.utils.json_to_sheet(insightsToBeDownloaded);
				const month = this.getPillNameBasedOnReportType(timePeriod);
				sheets['Cat-' + categoryInsights.viewName.substr(0, 13) + '-' + month] = timePeriodWorkSheet;
				xlsxSheetNames.push('Cat-' + categoryInsights.viewName.substr(0, 13) + '-' + month);
			});
		});
		this.subCategoryInsightViews.forEach(categoryInsights => {
			timePeriods.forEach((timePeriod, index) => {
				let timePeriodWorkSheet = null;
				const insightsToBeDownloaded = [];
				categoryInsights?.downloadMetrics?.[timePeriod]?.forEach(metric => {
					insightsToBeDownloaded.push(metric);
				});
				timePeriodWorkSheet = XLSX.utils.json_to_sheet(insightsToBeDownloaded);
				const month = this.getPillNameBasedOnReportType(timePeriod);
				sheets['Sub-Cat-' + categoryInsights.viewName.substr(0, 10) + '-' + month] = timePeriodWorkSheet;
				xlsxSheetNames.push('Sub-Cat-' + categoryInsights.viewName.substr(0, 10) + '-' + month);
			});
		});
		this.brandInsightViews.forEach(categoryInsights => {
			timePeriods.forEach((timePeriod, index) => {
				let timePeriodWorkSheet = null;
				const insightsToBeDownloaded = [];
				categoryInsights?.downloadMetrics?.[timePeriod]?.forEach(metric => {
					insightsToBeDownloaded.push(metric);
				});
				timePeriodWorkSheet = XLSX.utils.json_to_sheet(insightsToBeDownloaded);
				const month = this.getPillNameBasedOnReportType(timePeriod);
				sheets['Brand-' + categoryInsights.viewName.substr(0, 10) + '-' + month] = timePeriodWorkSheet;
				xlsxSheetNames.push('Brand-' + categoryInsights.viewName.substr(0, 10) + '-' + month);
			});
		});
		commentsWorkbook = {
			Sheets: sheets,
			SheetNames: xlsxSheetNames
		};
		XLSX.writeFile(commentsWorkbook, 'campaign_Insights.xlsx');
	}

	getPillNameBasedOnReportType(reportType) {
		const dateTimeHelper = new DateTimeHelper('');
		if (reportType === 'currentMonth') {
			return dateTimeHelper.currentMonthName;
		} else if (reportType === 'firstMonth') {
			return dateTimeHelper.lastMonthName;
		} else if (reportType === 'twoMonths') {
			return dateTimeHelper.secondLastMonthName;
		} else if (reportType === 'threeMonths') {
			return dateTimeHelper.thirdLastMonthName;
		}
	}

	closeConversationList(event) {
		this.showConversationList = event;
		this.conversationListItem = [];
		this.conversationListHeading = null;
		this.enableScrolling();
	}

	getTabId(insightView) {
		// required to get the tab switching
		switch (insightView.level) {
			case 'Category':
				return '';
			case 'SubCategory':
				return insightView.level.trim();
			case 'Brand':
				return insightView.viewName.replace(/ /g, '').replace(/\(/g, '').replace(/\)/g, '').trim();
		}
	}

	activateTab(id, insightView) {
		id = insightView.level === 'SubCategory' ? id : '';
		const parents = $('#openAnotherTab').parents('.listen-campaign-content-wrapper');
		parents.find('.secondary-tabs li a').removeClass('active');
		parents.find('.secondary-tabs li #' + this.getTabId(insightView) + id + 'conversations-tab').addClass('active');
		parents.find('.secondary-tabs-content .tab-pane').removeClass('show active');
		parents
			.find('.secondary-tabs-content .tab-pane#' + this.getTabId(insightView) + id + 'conversations')
			.addClass('show active');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
