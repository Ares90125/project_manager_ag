import {HttpClient} from '@angular/common/http';
import {Component, HostListener, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import $ from 'jquery';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {CampaignInsightViewModel} from '@sharedModule/models/campaign-insight-view.model';
import {InsightViewSummaryReportModel} from '../../../../models/insight-view-summary-report.model';
import {BrandService} from 'src/app/brand/services/brand.service';
import {ActivatedRoute} from '@angular/router';
import {environment} from 'src/environments/environment';
import {UserService} from '@sharedModule/services/user.service';
import {SovKeywordReportModel} from '@brandModule/models/report-models/sov-keyword-report-model';
import {AssociationReportModel} from '@brandModule/models/report-models/association-report.model';
import {SovSubTypeReportModel} from '@brandModule/models/report-models/sov-subType-report-model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-listening-insights',
	templateUrl: './listening-insights.component.html',
	styleUrls: ['./listening-insights.component.scss']
})
export class CampaignInsightsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() campaignStartDate;
	@Input() campaignId;
	user;
	showCalendar = false;
	showDateRangeSelector = false;
	alternateTextToBeDisplayed = null;
	insightView: CampaignInsightViewModel = null;
	monthPrefixOfReport = 'currentMonth';
	monthWords = DateTime.getMonths();
	summaryReport: InsightViewSummaryReportModel = null;
	showInsightsList = false;
	months = {
		'current month': 'currentMonth',
		'last 1 month': 'firstMonth',
		'last 2 months': 'twoMonths',
		'last 3 months': 'threeMonths'
	};
	container = null;
	insights;
	selectedInsight;
	selectedKeyword;
	isAmenitiesEnabled = false;
	selectedKeywordInsights;
	associationInsights;
	associationKeywordMetrics: AssociationReportModel;
	associationShareOfVoiceMetrics: SovSubTypeReportModel;
	selectedAssociationKeyword = null;
	selectedAssociationLegendDetails = null;
	subCategoryInsights;
	isAssociationGraphEmpty;
	isPurchaseConsiderationEnabled = false;
	showLoadingBar = false;

	constructor(
		injector: Injector,
		private http: HttpClient,
		private brandService: BrandService,
		private route: ActivatedRoute,
		private userService: UserService
	) {
		super(injector);
	}

	@Input()
	set insightViewInput(insightView: CampaignInsightViewModel) {
		if (!insightView) {
			return;
		}

		this.insightView = insightView;
		this.insightView.isAmenitiesEnabled.subscribe(isAmenitiesEnabled => {
			this.isAmenitiesEnabled = isAmenitiesEnabled;
		});

		this.alternateTextToBeDisplayed = environment.insightViewIdsForMilestones.has(this.insightView.id)
			? environment.insightViewIdsForMilestones.get(this.insightView.id).altHeading
			: null;

		this.isPurchaseConsiderationEnabled = insightView.id === '88c48bfd-8939-42f1-8b1e-96fcc7764a94';
	}

	@Input() campaignName = '';
	@Input() subcategoryId;
	@Input()
	set associationInsightViewInput(insightView: CampaignInsightViewModel) {
		this.associationInsights = insightView;
		this.setAssociationTabView(this.selectedAssociationKeyword);
	}

	@Input() set subCategoryInsightViews(insightViews: CampaignInsightViewModel[]) {
		this.subCategoryInsights = insightViews;
	}

	async ngOnInit() {
		super._ngOnInit();
		this.user = await this.userService.getUser();
		setTimeout(() => {
			this.showLoadingBar = true;
		}, 10000);
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(param => {
				if (param.campaignId) {
					this.setPageAndLog(param.campaignId);
				}
			})
		);
		const campaignInsightsFileName = this.campaignName?.toLowerCase().replace(/ /g, '_');
		try {
			this.insights = await this.http
				.get(environment.baseUrl + 'assets/insights/' + campaignInsightsFileName + '.json', {responseType: 'json'})
				.toPromise();
		} catch (e) {
			this.insights = {};
		}
		this.insightView.summaryMetrics.subscribe(metrics => {
			if (!metrics) {
				return;
			}

			this.summaryReport = metrics;
		});
		await this.insightView.getMetrics();
		this.container = $('.compaign-insight-component-wrapper');

		window.addEventListener('scroll', this.scroll, true);
	}

	async setPageAndLog(campaignId) {
		this.subscriptionsToDestroy.push(
			this.brandService.brands.subscribe(brand => {
				if (!brand) {
					return;
				}

				super.setPageTitle('Campaign Insights', 'Campaign Insights', {
					brandId: brand[0].id,
					brandName: brand[0].name,
					campaignName: this.campaignName,
					campaignId: campaignId
				});
			})
		);
	}

	@HostListener('window:openAssociationKeywordInsights', ['$event.detail'])
	getAssociationInsightsData(eventDetails: {value: string}) {
		this.associationKeywordMetrics?.['reportData']?.['associationKeywordDataPoints']?.forEach(dp => {
			if (dp.x === eventDetails.value) {
				this.selectedAssociationLegendDetails = dp.ys[this.selectedAssociationKeyword];
				this.selectedAssociationLegendDetails['selectedMonth'] = eventDetails.value;
				this.selectedAssociationLegendDetails['frequency'] =
					this.selectedAssociationLegendDetails['mentionOfKeyword'] &&
					this.selectedAssociationLegendDetails['mentionsOfBrand'][this.insightView.viewName?.toLowerCase()]
						? (
								(this.selectedAssociationLegendDetails['mentionsOfBrand'][this.insightView.viewName?.toLowerCase()] /
									this.selectedAssociationLegendDetails['mentionOfKeyword']) *
								100
						  ).toFixed(3)
						: 0;
			}
		});
	}

	@HostListener('window:openKeywordInsights', ['$event.detail'])
	getKeywordInsightsData(eventDetails: {
		value: string;
		isSubscriptionCheckRequired: boolean;
		sentiment: string;
		sovReportType: string;
	}) {
		this.computeKeywordInsights(eventDetails);
	}

	computeKeywordInsights(eventDetails) {
		setTimeout(() => {
			const sovReportType = eventDetails.sovReportType;
			const selectedSOVReport =
				sovReportType === 'ShareOfInvoice'
					? this.insightView[this.monthPrefixOfReport + 'ShareOfVoiceReport']
					: this.insightView[this.monthPrefixOfReport + 'SOV' + sovReportType];
			if (selectedSOVReport) {
				const keywordInsights = new SovKeywordReportModel(
					selectedSOVReport.reportData,
					sovReportType,
					eventDetails.value
				);
				this.selectedKeywordInsights = keywordInsights;
				selectedSOVReport.isKeywordView = true;
				selectedSOVReport.selectedKeywordInsights = keywordInsights;
				selectedSOVReport['isSubscriptionCheckRequired'] = eventDetails.isSubscriptionCheckRequired;
				selectedSOVReport['value'] = eventDetails.value;
			}
		}, 200);
	}

	openConversationPanel(keywords: string[], sovCategory: string) {
		window.dispatchEvent(
			new CustomEvent('openConversationListWithHeading', {detail: {keywords, heading: sovCategory}})
		);
	}

	openKeywordConverstaionalPanel(selectedSOVReport) {
		window.dispatchEvent(
			new CustomEvent('openConversationList', {
				detail: {
					value: selectedSOVReport['value'],
					isSubscriptionCheckRequired:
						this.user?.userType === 'CSAdmin' ? false : selectedSOVReport['isSubscriptionCheckRequired']
				}
			})
		);
	}

	showSOVInsights(selectedSOVReport) {
		selectedSOVReport.isKeywordView = false;
		selectedSOVReport.selectedKeywordInsights = null;
	}

	showInsights(insightName, viewName) {
		this.selectedInsight = this.insights[insightName];
		this.showInsightsList = true;
		this.selectedKeyword = viewName;
		this.disableScrolling();
	}

	closeInsights(event) {
		this.selectedInsight = null;
		this.showInsightsList = event;
		this.selectedKeyword = '';
		this.enableScrolling();
	}

	setMonthPrefixOfReport(month: string) {
		this.showCalendar = false;
		this.showDateRangeSelector = false;
		this.setSOVInsights();
		this.monthPrefixOfReport = null;
		setTimeout(() => {
			this.monthPrefixOfReport = this.months[month];
			this.setAssociationTabView(this.selectedAssociationKeyword);
		}, 10);
	}
	setCustomMonthPrefixOfReport(event) {
		if (event.isAuto) {
			this.showCalendar = true;
		}
		this.monthPrefixOfReport = 'custom';
		this.setAssociationTabView(this.selectedAssociationKeyword);
	}
	getNumberOfInsights(insightName: string) {
		const insights = this.insights[insightName];
		return insights ? Object.keys(insights).length : null;
	}

	getTabId() {
		// required to get the tab switching
		switch (this.insightView.level) {
			case 'Category':
				return '';
			case 'SubCategory':
				return this.insightView.level.trim();
			case 'Brand':
				return this.insightView.viewName.replace(/ /g, '').replace(/\(/g, '').replace(/\)/g, '').trim();
		}
	}

	activateTab(y) {
		const parents = $('#openAnotherTab').parents('.listen-campaign-content-wrapper');
		parents.find('.secondary-tabs li a').removeClass('active');
		parents.find('.secondary-tabs li #' + this.getTabId() + this.subcategoryId + 'shareVoice-tab').addClass('active');
		parents.find('.secondary-tabs-content .tab-pane').removeClass('show active');
		parents
			.find('.secondary-tabs-content .tab-pane#' + this.getTabId() + this.subcategoryId + 'shareVoice')
			.addClass('show active');
		window.scrollTo({top: y, left: 0, behavior: 'smooth'});
	}

	getMonthDisplayNameForChart(mothsInPast: 1 | 2 | 3 = 1) {
		const currentMonthIndex = new DateTime().month();
		const currentYear = new DateTime().subtract(mothsInPast, 'months').year();
		let monthIndex = currentMonthIndex - mothsInPast;
		monthIndex = monthIndex < 0 ? monthIndex + 12 : monthIndex;
		return this.monthWords[monthIndex] + ', ' + currentYear;
	}

	defaultComparator(): any {
		return 0;
	}

	scroll(): void {
		if (!this.container) {
			return;
		}
		const scrolled = $(window).scrollTop();
		if (scrolled >= 350) {
			this.container.find('#SubCategoryshareVoice .pills-container').addClass('fixed');
		} else {
			this.container.find('#SubCategoryshareVoice .pills-container').removeClass('fixed');
		}
	}

	switchToFirstTab() {
		this.showDateRangeSelector = false;
		this.showCalendar = false;
		if (this.monthPrefixOfReport === 'custom') {
			this.monthPrefixOfReport = 'currentMonth';
		}
		this.setSOVInsights();
	}

	setSOVInsights() {
		['SOVIssues', 'SOVRemedies', 'SOVBrands', 'SOVAmenities', 'SOVProducts', 'ShareOfVoiceReport'].forEach(
			insightType => {
				if (this.insightView[this.monthPrefixOfReport + insightType]?.isKeywordView) {
					this.insightView[this.monthPrefixOfReport + insightType].isKeywordView = false;
				}
			}
		);
	}

	setAssociationTabView(keyword) {
		this.associationKeywordMetrics = null;
		this.isAssociationGraphEmpty = !this.associationInsights;
		this.associationShareOfVoiceMetrics = null;
		const metrics = this.monthPrefixOfReport === 'custom' ? this.insightView : this.associationInsights;

		metrics?.[this.monthPrefixOfReport + 'AssociationReport'].subscribe(report => {
			if (!report) {
				return;
			}

			this.selectedAssociationKeyword = keyword ? keyword.toLowerCase() : report.keywords[0]?.toLowerCase();
			this.associationKeywordMetrics = new AssociationReportModel(
				report,
				this.selectedAssociationKeyword,
				this.insightView.viewName
			);

			this.getSovInsights(report);
			const selectedDatapoint = this.associationKeywordMetrics?.['reportData']?.['associationKeywordDataPoints']?.[0];
			if (selectedDatapoint) {
				this.selectedAssociationLegendDetails = selectedDatapoint.ys[this.selectedAssociationKeyword];
				this.selectedAssociationLegendDetails['selectedMonth'] = selectedDatapoint.x;
				this.selectedAssociationLegendDetails['frequency'] =
					this.selectedAssociationLegendDetails['mentionOfKeyword'] &&
					this.selectedAssociationLegendDetails['mentionsOfBrand'][this.insightView.viewName?.toLowerCase()]
						? (
								(this.selectedAssociationLegendDetails['mentionsOfBrand'][this.insightView.viewName?.toLowerCase()] /
									this.selectedAssociationLegendDetails['mentionOfKeyword']) *
								100
						  ).toFixed(3)
						: 0;
			}
		});
	}

	private getSovInsights(report) {
		let reportData = new ReportDataOutputModel();
		reportData['dataPoints'] = [];
		report['brandMetrics'].forEach(brandMetric => {
			if (brandMetric.key === this.selectedAssociationKeyword) {
				reportData['dataPoints'] = brandMetric['dataPoints'];
			}
		});
		this.associationShareOfVoiceMetrics = new SovSubTypeReportModel(reportData, 'Brands');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
