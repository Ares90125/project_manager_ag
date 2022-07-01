import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {HighchartsChartModule} from 'highcharts-angular';
import {TreeviewModule} from 'ngx-treeview';
import {BrandModule, PaginatorIntl} from '../brand/brand.module';
import {GroupAdminModule} from '../group-admin/group-admin.module';
import {SharedModule} from '../shared/shared.module';
import {CreateCampaignComponent} from './components/campaigns/create-campaign/create-campaign.component';
import {CreateCommunityMarketingCampaignComponent} from './components/campaigns/create-community-campaign/create-community-marketing-campaign/create-community-marketing-campaign.component';
import {ListBrandCampaignsComponent} from './components/campaigns/list-brand-campaigns/list-brand-campaigns.component';
import {ListBrandsComponent} from './components/list-brands/list-brands.component';
import {CSAdminRoutingModule} from './cs-admin-routing.module';
import {CreateCampaignService} from './services/create-campaign.service';
import {DashboardModule} from '../dashboard/dashboard.module';
import {CSAdminAuthGuard} from '@csAdminModule/guards/cs-admin-auth.guard';
import {CampaignService} from '@brandModule/services/campaign.service';
import {ContentManagerService} from './services/content-manager.service';
import {BrandMentionsReportService} from '@brandModule/services/brand-insights/brand-insights-reports/brand-mentions-report.service';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {InsightViewSummaryReportService} from '@brandModule/services/brand-insights/brand-insights-reports/insight-view-summary-report.service';
import {ShareOfVoiceReportService} from '@brandModule/services/brand-insights/brand-insights-reports/share-of-voice-report.service';
import {BrandInsightsService} from '@brandModule/services/brand-insights/brand-insights.service';
import {KeywordDistributionReportService} from '@brandModule/services/brand-insights/brand-insights-reports/keyword-distribution-report.service';
import {SentimentAnalysisReportService} from '@brandModule/services/brand-insights/brand-insights-reports/sentiment-analysis-report.service';
import {EngagementPerPostTypeDistReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/engagement-per-post-type-dist-report.service';
import {EngagementReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/engagement-report.service';
import {PostTypeDistributionReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/post-type-distribution-report.service';
import {SummaryReportService} from '@sharedModule/services/group-metrics/group-metrics-reports/summary-report.service';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {BrandService} from '@brandModule/services/brand.service';
import {ConversationReportService} from '@brandModule/services/brand-insights/brand-insights-reports/conversation-report.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupMetricsService} from '@sharedModule/services/group-metrics/group-metrics.service';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {TopicService} from '@groupAdminModule/_services/topic.service';
import {GeographyService} from '@groupAdminModule/_services/geography.service';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {LanguageService} from '@groupAdminModule/_services/language.service';
import {AccountSettingsService} from '@groupAdminModule/_services/account-settings.service';
import {GroupCampaignService} from '@groupAdminModule/_services/group-campaign.service';
import {GroupTrendsReportService} from '@groupAdminModule/_services/group-conversation-trends.service';
import {CommunityMarketingCampaignDetailsComponent} from './components/campaigns/create-community-campaign/community-marketing-campaign-details/community-marketing-campaign-details.component';
import {QuillModule} from 'ngx-quill';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {CreateCommunityListeningCampaignComponent} from './components/campaigns/create-community-campaign/create-community-listening-campaign/create-community-listening-campaign.component';
import {CreateBrandComponent} from './components/create-brand/create-brand.component';
import {CreateCommunityMarketingCampaignOldComponent} from './components/campaigns/create-community-campaign-v1/create-community-marketing-campaign-v1/create-community-marketing-campaign-old.component';
import {CommunityMarketingCampaignDetailsOldComponent} from './components/campaigns/create-community-campaign-v1/community-marketing-campaign-details-v1/community-marketing-campaign-details-old.component';
import {CommunityMarketingCampaignTasksDashboardComponent} from './components/campaigns/create-community-campaign/community-marketing-campaign-tasks-dashboard/community-marketing-campaign-tasks-dashboard.component';
import {CommunityMarketingCampaignPaymentsComponent} from './components/campaigns/create-community-campaign/community-marketing-campaign-payments/community-marketing-campaign-payments.component';
import {PopoverModule} from 'ngx-bootstrap/popover';
import {CommunityMarketingCampaignContentManagerComponent} from '@csAdminModule/components/campaigns/create-community-campaign/community-marketing-campaign-content-manager/community-marketing-campaign-content-manager.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import {EmojiModule} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {FileService} from '@sharedModule/services/file.service';
import {ContentManagerComponent} from './components/content-manager/content-manager.component';
import {CampaignGroupComponent} from './components/content-manager/campaign-group/campaign-group.component';
import {ReactUnicodeEditorWrapperComponent} from './components/content-manager/unicode-editor/ReactUnicodeEditorWrapperComponent';
import {BarRatingModule} from 'ngx-bar-rating';
import {WhatsAppComponent} from './components/whatsApp-campaigns/whatsApp-campaigns.component';
import {WhatsAppCampaignsService} from './services/whatsApp-campaigns.service';
import {WhatsAppCSVParserService} from './services/whatsapp-csv-parser';
import {TrainingsComponent} from './components/trainings/trainings.component';

@NgModule({
	declarations: [
		ListBrandsComponent,
		ListBrandCampaignsComponent,
		CreateCampaignComponent,
		CreateCommunityMarketingCampaignComponent,
		CreateCommunityMarketingCampaignOldComponent,
		CommunityMarketingCampaignDetailsOldComponent,
		CommunityMarketingCampaignDetailsComponent,
		CreateCommunityListeningCampaignComponent,
		CreateBrandComponent,
		CommunityMarketingCampaignTasksDashboardComponent,
		CommunityMarketingCampaignPaymentsComponent,
		CommunityMarketingCampaignContentManagerComponent,
		CreateBrandComponent,
		ContentManagerComponent,
		CampaignGroupComponent,
		ReactUnicodeEditorWrapperComponent,
		WhatsAppComponent,
		TrainingsComponent
	],
	providers: [
		CreateCampaignService,
		GroupMetricsService,
		GroupsService,
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
		CampaignService,
		BrandMentionsReportService,
		ConversationService,
		InsightViewSummaryReportService,
		ShareOfVoiceReportService,
		BrandInsightsService,
		KeywordDistributionReportService,
		SentimentAnalysisReportService,
		{provide: MatPaginatorIntl, useValue: PaginatorIntl()},
		BrandService,
		CSAdminAuthGuard,
		ContentManagerService,
		WhatsAppCampaignsService,
		WhatsAppCSVParserService
	],
	imports: [
		CommonModule,
		CSAdminRoutingModule,
		DashboardModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCheckboxModule,
		MatRadioModule,
		FormsModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatChipsModule,
		MatAutocompleteModule,
		HighchartsChartModule,
		SharedModule,
		BrandModule,
		GroupAdminModule,
		MatDatepickerModule,
		TreeviewModule.forRoot(),
		QuillModule.forRoot(),
		PopoverModule.forRoot(),
		CommonModule,
		PopoverModule,
		MatRadioModule,
		MatRadioModule,
		FormsModule,
		PopoverModule,
		MatCheckboxModule,
		MatTooltipModule,
		NgxIntlTelInputModule,
		EmojiModule,
		PickerModule,
		BarRatingModule
	]
})
export class CSAdminModule {}
