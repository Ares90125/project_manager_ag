import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BrandMentionsReportService} from '@brandModule/services/brand-insights/brand-insights-reports/brand-mentions-report.service';
import {ConversationReportService} from '@brandModule/services/brand-insights/brand-insights-reports/conversation-report.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {FileService} from '@sharedModule/services/file.service';
import {EngagementPerPostTypeDistReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/engagement-per-post-type-dist-report.service';
import {EngagementReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/engagement-report.service';
import {PostTypeDistributionReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/post-type-distribution-report.service';
import {SummaryReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/summary-report.service';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {HighchartsChartModule} from 'highcharts-angular';
import {QuillModule} from 'ngx-quill';
import {TreeviewModule} from 'ngx-treeview';

import {DashboardModule} from '../dashboard/dashboard.module';
import {SharedModule} from '../shared/shared.module';
import {BrandRoutingModule} from './brand-routing.module';
import {BrandInsightsSidebarComponent} from './components/brand-insights-sidebar/brand-insights-sidebar.component';
import {BrandTrackComponent} from './components/brand-track/brand-track.component';
import {CampaignProposalOldComponent} from './components/campaigns/community-marketing-campaigns/campaign-proposal-v1/campaign-proposal-old.component';
import {CampaignProposalComponent} from './components/campaigns/community-marketing-campaigns/campaign-proposal/campaign-proposal.component';
import {ListeningDetailsComponent} from './components/campaigns/listening-campaigns/listening-details/listening-details.component';
import {CampaignInsightsComponent} from './components/campaigns/listening-campaigns/listening-insights/listening-insights.component';
import {ListeningPowerBiComponent} from './components/campaigns/listening-campaigns/listening-power-bi/listening-power-bi.component';
import {ManageCampaignsComponent} from './components/campaigns/manage-campaigns/manage-campaigns.component';
import {BrandCommunityListComponent} from './components/communities/brand-community-list/brand-community-list.component';
import {CommunityDetailsComponent} from './components/communities/community-details/community-details.component';
import {GroupInsightsComponent} from './components/communities/community-details/group-insights/group-insights.component';
import {BrandAuthGuard} from './guards/brand-auth.guard';
import {AssociationReportService} from './services/brand-insights/brand-insights-reports/association-report.service';
import {InsightViewSummaryReportService} from './services/brand-insights/brand-insights-reports/insight-view-summary-report.service';
import {KeywordDistributionReportService} from './services/brand-insights/brand-insights-reports/keyword-distribution-report.service';
import {SentimentAnalysisReportService} from './services/brand-insights/brand-insights-reports/sentiment-analysis-report.service';
import {ShareOfVoiceReportService} from './services/brand-insights/brand-insights-reports/share-of-voice-report.service';
import {BrandInsightsService} from './services/brand-insights/brand-insights.service';
import {BrandService} from './services/brand.service';
import {CampaignService} from './services/campaign.service';

@NgModule({
	declarations: [
		ManageCampaignsComponent,
		ListeningDetailsComponent,
		BrandCommunityListComponent,
		BrandInsightsSidebarComponent,
		GroupInsightsComponent,
		CampaignInsightsComponent,
		CommunityDetailsComponent,
		BrandTrackComponent,
		CampaignProposalComponent,
		CampaignProposalOldComponent,
		ListeningPowerBiComponent
	],
	providers: [
		CampaignService,
		BrandMentionsReportService,
		ConversationService,
		InsightViewSummaryReportService,
		ShareOfVoiceReportService,
		BrandInsightsService,
		KeywordDistributionReportService,
		SentimentAnalysisReportService,
		AssociationReportService,
		EngagementPerPostTypeDistReportService,
		EngagementReportService,
		PostTypeDistributionReportService,
		SummaryReportService,
		{provide: MatPaginatorIntl, useValue: PaginatorIntl()},
		BrandService,
		ConversationReportService,
		BrandAuthGuard,
		GroupsService,
		GroupMetricsService,
		CreateCampaignService,
		KeywordTrackerService,
		FileService
	],
	imports: [
		CommonModule,
		FormsModule,
		BrandRoutingModule,
		DashboardModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatInputModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatDialogModule,
		MatRadioModule,
		MatSelectModule,
		MatChipsModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatAutocompleteModule,
		HighchartsChartModule,
		FormsModule,
		ReactiveFormsModule,
		MatTooltipModule,
		MatTabsModule,
		MatBadgeModule,
		SharedModule,
		MatDatepickerModule,
		MatNativeDateModule,
		TreeviewModule.forRoot(),
		QuillModule.forRoot()
	]
})
export class BrandModule {}

export function PaginatorIntl() {
	const paginatorIntl = new MatPaginatorIntl();
	paginatorIntl.itemsPerPageLabel = 'Communities per page:';
	return paginatorIntl;
}
