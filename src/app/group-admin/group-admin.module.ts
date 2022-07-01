import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {NgxPopper} from 'angular-popper';
import {TreeviewModule} from 'ngx-treeview';
import {HighchartsChartModule} from 'highcharts-angular';
import {MatDialogModule} from '@angular/material/dialog';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {GroupComponent} from './_components/group/group.component';
import {GroupInsightsComponent} from './_components/group/group-insights/group-insights.component';
import {GroupConversationTrendsComponent} from './_components/group/conversation-trends/group-conversation-trends.component';
import {GroupConversationCategoryDetailsComponent} from './_components/group/group-conversation-category-details/group-conversation-category-details.component';
import {ConversationReportService} from '../brand/services/brand-insights/brand-insights-reports/conversation-report.service';
import {SharedModule} from '../shared/shared.module';
import {LanguageService} from './_services/language.service';
import {GeographyService} from './_services/geography.service';
import {TopicService} from './_services/topic.service';
import {DropdownComponent} from './_components/group/group-details/dropdown/dropdown.component';
import {GroupDetailsComponent} from './_components/group/group-details/group-details.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {PublishComponent} from './_components/publish-queue/publish/publish.component';
import {PostAnalyticsComponent} from './_components/publish-queue/publish/post-analytics/post-analytics.component';
import {GroupPublishComponent} from './_components/group/group-publish/group-publish.component';
import {QueueComponent} from './_components/publish-queue/publish/queue/queue.component';
import {PostTrendsComponent} from './_components/group/post-trends/post-trends.component';
import {AccountSettingsService} from '@groupAdminModule/_services/account-settings.service';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {GroupCampaignService} from './_services/group-campaign.service';
import {DashboardModule} from '../dashboard/dashboard.module';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {EngagementPerPostTypeDistReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/engagement-per-post-type-dist-report.service';
import {EngagementReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/engagement-report.service';
import {PostTypeDistributionReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/post-type-distribution-report.service';
import {SummaryReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/summary-report.service';
import {PublishService} from './_services/publish.service';
import {FileService} from '../shared/services/file.service';
import {GroupTrendsReportService} from './_services/group-conversation-trends.service';
import {GroupAdminAuthGuard} from './_guards/group-admin-auth.guard';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ModeratorsComponent} from './_components/group/moderators/moderators.component';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {GroupsAnalysingComponent} from './_components/group/groups-analysing/groups-analysing.component';
import {ManageGroupsComponent} from '@groupAdminModule/manage/manage-groups/manage-groups.component';
import {ManageModule} from '@groupAdminModule/manage/manage.module';
import {OverlaysModule} from '@groupAdminModule/overlays/overlays.module';
import {InvitationsService} from './_services/invitations.service';
import {GroupOverviewComponent} from './_components/group/group-overview/group-overview.component';
import {GroupUnansweredComponent} from './_components/group/group-unanswered/group-unanswered.component';
import {GroupSidebarComponent} from './_components/group/group-sidebar/group-sidebar.component';
import {PostComposerComponent} from '@groupAdminModule/_components/publish-queue/post-composer/post-composer.component';
import {MultiGroupSelectComponent} from './_components/publish-queue/post-composer/multi-group-select/multi-group-select.component';
import {PublishTimeComponent} from './_components/publish-queue/post-composer/publish-time/publish-time.component';
import {TemplatesComponent} from '@groupAdminModule/_components/publish-queue/post-composer/templates/templates.component';
import {GroupAdminRoutingModule} from './group-admin-routing.module';
import {GroupKeywordComponent} from './_components/group/group-keyword/group-keyword.component';
import {GroupPostComponent} from './_components/group/group-post/group-post.component';
import {ConversationReportsComponent} from './_components/group/conversation-trends/conversation-reports/conversation-reports.component';
import {GroupInsightsReportsComponent} from './_components/group/group-insights/group-insights-reports/group-insights-reports.component';
import {LightboxModule} from 'ngx-lightbox';

@NgModule({
	declarations: [
		GroupComponent,
		GroupInsightsComponent,
		GroupConversationTrendsComponent,
		GroupConversationCategoryDetailsComponent,
		GroupDetailsComponent,
		GroupOverviewComponent,
		DropdownComponent,
		PostTrendsComponent,
		PublishComponent,
		PostComposerComponent,
		MultiGroupSelectComponent,
		PublishTimeComponent,
		TemplatesComponent,
		PostAnalyticsComponent,
		QueueComponent,
		GroupPublishComponent,
		GroupsAnalysingComponent,
		ModeratorsComponent,
		GroupUnansweredComponent,
		GroupSidebarComponent,
		GroupKeywordComponent,
		GroupPostComponent,
		ConversationReportsComponent,
		GroupInsightsReportsComponent
	],
	imports: [
		CommonModule,
		DashboardModule,
		NgxPopper,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,
		MatRadioModule,
		FormsModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatChipsModule,
		MatAutocompleteModule,
		HighchartsChartModule,
		SharedModule,
		OverlaysModule,
		MatDatepickerModule,
		MatNativeDateModule,
		TreeviewModule.forRoot(),
		LightboxModule,
		ManageModule,
		NgxIntlTelInputModule,
		GroupAdminRoutingModule,
		MatTooltipModule,
		MatProgressSpinnerModule
	],
	providers: [
		GroupMetricsService,
		FileService,
		EngagementPerPostTypeDistReportService,
		EngagementReportService,
		PostTypeDistributionReportService,
		SummaryReportService,
		ConversationReportService,
		TopicService,
		GeographyService,
		PublishService,
		LanguageService,
		AccountSettingsService,
		KeywordTrackerService,
		MatDatepickerModule,
		GroupCampaignService,
		GroupTrendsReportService,
		GroupAdminAuthGuard,
		InvitationsService
	],
	exports: [
		ManageGroupsComponent,
		GroupComponent,
		GroupInsightsComponent,
		GroupConversationTrendsComponent,
		GroupConversationCategoryDetailsComponent,
		GroupDetailsComponent,
		GroupOverviewComponent,
		DropdownComponent,
		PostTrendsComponent,
		PublishComponent,
		PostComposerComponent,
		MultiGroupSelectComponent,
		PublishTimeComponent,
		TemplatesComponent,
		PostAnalyticsComponent,
		QueueComponent,
		GroupPublishComponent,
		GroupsAnalysingComponent,
		GroupKeywordComponent,
		GroupPostComponent
	],
	entryComponents: [GroupDetailsComponent]
})
export class GroupAdminModule {}
