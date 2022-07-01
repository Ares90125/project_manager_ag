import {ClipboardModule} from '@angular/cdk/clipboard';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatSliderModule} from '@angular/material/slider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {CommunityMarketingCampaignTasksOldComponent} from '@csAdminModule/components/campaigns/create-community-campaign-v1/community-marketing-campaign-tasks-v1/community-marketing-campaign-tasks-old.component';
import {CommunityMarketingCampaignTasksComponent} from '@csAdminModule/components/campaigns/create-community-campaign/community-marketing-campaign-tasks/community-marketing-campaign-tasks.component';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import {EmojiModule} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {GroupSelectionOverlayComponent} from '@groupAdminModule/overlays/groups-selection-overlay/group-selection-overlay';
import {WhatsappOptInComponent} from '@groupAdminModule/overlays/whatsapp-opt-in/whatsapp-opt-in.component';
import {AnalysisStateComponent} from '@sharedModule/components/analysis-state/analysis-state.component';
import {CommunicationModeVerificationComponent} from '@sharedModule/components/communication-mode-verification/communication-mode-verification.component';
import {CommunityDiscoveryDirective} from '@sharedModule/components/community-discovery/community-discovery.directive';
import {CommunityMarketingCampaignCommunityNotificationComponent} from '@sharedModule/components/community-marketing-campaign-community-notification/community-marketing-campaign-community-notification.component';
import {CommunityMarketingCampaignInfoOldComponent} from '@sharedModule/components/community-marketing-campaign-info-v1/community-marketing-campaign-info-old.component';
import {CustomDateTimePickerComponent} from '@sharedModule/components/custom-datetime-picker/custom-datetime-picker.component';
import {FacebookInsightsUploadCardComponent} from '@sharedModule/components/facebook-insights-upload-card/facebook-insights-upload-card.component';
import {FbGroupCoverImageComponent} from '@sharedModule/components/fb-group-cover-image/fb-group-cover-image.component';
import {DefaultImageOnSrcErrorDirective} from '@sharedModule/directives/default-image-on-src-error.directive';
import {DelayedInputDirective} from '@sharedModule/directives/delayed-input.directive';
import {FilterPipe} from '@sharedModule/pipes/filter.pipe';
import {OrderByPipe} from '@sharedModule/pipes/order-by.pipe';
import {HighchartsChartModule} from 'highcharts-angular';
import player from 'lottie-web';
import {TimepickerModule} from 'ngx-bootstrap/timepicker';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {LottieModule} from 'ngx-lottie';
import {QuillModule} from 'ngx-quill';

import {AdminBioPreviewComponent} from './components/admin-bio-preview/admin-bio-preview.component';
import {BioContactMeComponent} from './components/admin-bio-preview/bio-contact-me/bio-contact-me.component';
import {BioPreviewFacebookGroupsListComponent} from './components/admin-bio-preview/bio-preview-facebook-groups-list/bio-preview-facebook-groups-list.component';
import {BioPreviewHederComponent} from './components/admin-bio-preview/bio-preview-heder/bio-preview-heder.component';
import {BioPreviewIntroductionComponent} from './components/admin-bio-preview/bio-preview-introduction/bio-preview-introduction.component';
import {BioPreviewKeyAchievementsComponent} from './components/admin-bio-preview/bio-preview-key-achievements/bio-preview-key-achievements.component';
import {BioPreviewMediaCoverageComponent} from './components/admin-bio-preview/bio-preview-media-coverage/bio-preview-media-coverage.component';
import {BioPreviewSocialProfilesComponent} from './components/admin-bio-preview/bio-preview-social-profiles/bio-preview-social-profiles.component';
import {BioPreviewSupportingDocsComponent} from './components/admin-bio-preview/bio-preview-supporting-docs/bio-preview-supporting-docs.component';
import {AdminBioProfileOverlayComponent} from './components/admin-bio-profile-overlay/admin-bio-profile-overlay.component';
import {AdminBioComponent} from './components/admin-bio/admin-bio.component';
import {BioContactComponent} from './components/admin-bio/bio-contact/bio-contact.component';
import {BioFacebookGroupsListComponent} from './components/admin-bio/bio-facebook-groups-list/bio-facebook-groups-list.component';
import {BioIntroductionComponent} from './components/admin-bio/bio-introduction/bio-introduction.component';
import {BioKeyAchievementsComponent} from './components/admin-bio/bio-key-achievements/bio-key-achievements.component';
import {BioMediaCoverageComponent} from './components/admin-bio/bio-media-coverage/bio-media-coverage.component';
import {BioPersonalInfoComponent} from './components/admin-bio/bio-personal-info/bio-personal-info.component';
import {BioPitchVideoComponent} from './components/admin-bio/bio-pitch-video/bio-pitch-video.component';
import {BioSocialProfilesComponent} from './components/admin-bio/bio-social-profiles/bio-social-profiles.component';
import {BioSupportingDocsComponent} from './components/admin-bio/bio-supporting-docs/bio-supporting-docs.component';
import {AdminPreviewDashboardComponent} from './components/admin-preview-dashboard/admin-preview-dashboard.component';
import {ChartComponent} from './components/chart/chart.component';
import {AllPostsComponent} from './components/cmcReport-v3/all-posts/all-posts.component';
import {BrandObjectiveComponent} from './components/cmcReport-v3/brand-objective/brand-objective.component';
import {BrandSentimentsComponent} from './components/cmcReport-v3/brand-sentiments/brand-sentiments.component';
import {DonutChartComponent} from './components/cmcReport-v3/brand-sentiments/donut-chart/donut-chart.component';
import {BrandShareOfVoiceComponent} from './components/cmcReport-v3/brand-share-of-voice/brand-share-of-voice.component';
import {ShareofVoiceStackedBarChartComponent} from './components/cmcReport-v3/brand-share-of-voice/stacked-bar-chart/stacked-bar-chart.component';
import {CMCReportV3Component} from './components/cmcReport-v3/cmcreport-v3/cmcreport-v3.component';
import {EditReferenceConversationsComponent} from './components/cmcReport-v3/edit-reference-conversations/edit-reference-conversations.component';
import {BenefitsComponent} from './components/cmcReport-v3/engagement-insight/benefits/benefits.component';
import {EmotionsComponent} from './components/cmcReport-v3/engagement-insight/emotions/emotions.component';
import {EngagementInsightChartComponent} from './components/cmcReport-v3/engagement-insight/engagement-insight-chart/engagement-insight-chart.component';
import {EngagementInsightComponent} from './components/cmcReport-v3/engagement-insight/engagement-insight.component';
import {IntentComponent} from './components/cmcReport-v3/engagement-insight/intent/intent.component';
import {KeyFindingsComponent} from './components/cmcReport-v3/key-findings/key-findings.component';
import {KpiChartComponent} from './components/cmcReport-v3/kpis/kpi-chart/kpi-chart.component';
import {PhaseIdeaComponent} from './components/cmcReport-v3/phase-idea/phase-idea.component';
import {ReferenceConversationComponent} from './components/cmcReport-v3/reference-conversation/reference-conversation.component';
import {ResultsComponent} from './components/cmcReport-v3/results/results.component';
import {TopPerformingPostComponent} from './components/cmcReport-v3/top-performing-post/top-performing-post.component';
import {UnretrievedPostsComponent} from './components/cmcReport-v3/unretrieved-posts/unretrieved-posts.component';
import {UploadScreenshotComponent} from './components/cmcReport-v3/upload-screenshot/upload-screenshot.component';
import {WordcloudChartComponent} from './components/cmcReport-v3/wordcloud/wordcloud-chart/wordcloud-chart.component';
import {WordcloudComponent} from './components/cmcReport-v3/wordcloud/wordcloud.component';
import {CommunityDiscoveryComponent} from './components/community-discovery/community-discovery.component';
import {CommunityMarketingCampaignCommunitiesComponent} from './components/community-marketing-campaign-communities/community-marketing-campaign-communities.component';
import {CommunityMarketingCampaignInfoComponent} from './components/community-marketing-campaign-info/community-marketing-campaign-info.component';
import {CommunityMarketingCampaignReportDataComponent} from './components/community-marketing-campaign-report-data/community-marketing-campaign-report-data.component';
import {CommunityMarketingCampaignReportComponent} from './components/community-marketing-campaign-report/community-marketing-campaign-report.component';
import {ConversationListComponent} from './components/conversation-list/conversation-list.component';
import {ConvosightFiltersComponent} from './components/convosight-filters/convosight-filters.component';
import {CreateBrandCommunityMarketingCampaignComponent} from './components/create-brand-community-marketing-campaign/create-brand-community-marketing-campaign.component';
import {CreateCampaignDetailsV3Component} from './components/create-campaign-details-v3/create-campaign-details-v3.component';
import {CreateCampaignDetailsComponent} from './components/create-campaign-details/create-campaign-details.component';
import {CustomDateRangeComponent} from './components/custom-date-range/custom-date-range.component';
import {CustomDropdownComponent} from './components/custom-dropdown/custom-dropdown.component';
import {CustomPostTextAreaComponent} from './components/custom-post-text-area/custom-post-text-area.component';
import {ErrorOverlayComponent} from './components/error-overlay/error-overlay.component';
import {FacebookPostScreenshotComponent} from './components/facebook-post-screenshot/facebook-post-screenshot.component';
import {FixedTooltipComponent} from './components/fixed-tooltip/fixed-tooltip.component';
import {HighChartComponent} from './components/high-chart/high-chart.component';
import {KeywordTrackerComponent} from './components/keyword-tracker/keyword-tracker.component';
import {LoadingShimmerComponent} from './components/loading-shimmer/loading-shimmer.component';
import {SearchableCampaignsDropdownComponent} from './components/searchable-campaigns-dropdown/searchable-campaigns-dropdown.component';
import {SearchableDropdownComponent} from './components/searchable-dropdown/searchable-dropdown.component';
import {ShareWidgetComponent} from './components/share-widget/share-widget.component';
import {SharedModalComponent} from './components/shared-modal/shared-modal.component';
import {TooltipComponent} from './components/tooltip/tooltip.component';
import {UnsavedFormDialogComponent} from './components/unsaved-form-dialog/unsaved-form-dialog.component';
import {DelayClickDirective} from './directives/delayed-click.directive';
import {BrandCommunityReportComponent} from '@sharedModule/components/brand-community-report/brand-community-report.component';
import {ConversationsReportComponent} from '@sharedModule/components/brand-community-report/conversations-report/conversations-report.component';
import {BrandCommunityKpisComponent} from '@sharedModule/components/brand-community-report/KPIs/brand-community-kpis.component';
import {CircleStepBarComponent} from '@sharedModule/components/circle-step-bar/circle-step-bar.component';
import {DragAndDropDirective} from './directives/drag-and-drop.directive';
import {DefaultImageDirective} from './directives/group-default-image.directive';
import {LongPressDirective} from './directives/long-press.directive';
import {CampaignTaskStatusPipe} from './pipes/campaign-task-status.pipe';
import {CampaignGroupStatusPipe} from './pipes/community-group-status.pipe';
import {EllipsisPipe} from './pipes/ellipsis.pipe';
import {FileSizePipe} from './pipes/file-size.pipe';
import {SanitizeHtmlPipe} from './pipes/sanitize-html.pipe';
import {SanitizeUrlPipe} from './pipes/sanitize-url.pipe';
import {ShortNumberPipe} from './pipes/short-number.pipe';
import {TextHighlightPipe} from './pipes/text-highlight.pipe';
import {TimeFromXTime} from './pipes/time-from-x-time.pipe';
import {AutoSaveBottomBarComponent} from './components/auto-save-bottom-bar/auto-save-bottom-bar.component';
import {KpisComponent} from '@sharedModule/components/cmcReport-v3/kpis/kpis.component';
import {BrandCommunitiesComponent} from '@sharedModule/components/brand-communities/brand-communities.component';
import {CommunityDemographicsComponent} from '@sharedModule/components/brand-community-report/community-demographics/community-demographics.component';
import {TopPostsScreenshotsComponent} from '@sharedModule/components/brand-community-report/top-posts-screenshots/top-posts-screenshots.component';
import {BrandCommunityWordCloudComponent} from '@sharedModule/components/brand-community-report/brand-community-word-cloud/brand-community-word-cloud.component';
import {CustomConversationComponent} from '@sharedModule/components/brand-community-report/custom-conversation/custom-conversation.component';
import {BrandCbrWordCloudComponent} from '@sharedModule/components/brand-cbr/brand-community-word-cloud/brand-cbr-word-cloud.component';
import {BrandCbrCommunityDemographicsComponent} from '@sharedModule/components/brand-cbr/community-demographics/brand-cbr-community-demographics.component';
import {BrandCbrCustomConversationComponent} from '@sharedModule/components/brand-cbr/custom-conversation/brand-cbr-custom-conversation.component';
import {BrandCbrKpisComponent} from '@sharedModule/components/brand-cbr/KPIs/brand-cbr-kpis.component';
import {EditBrandModalComponent} from '@sharedModule/components/edit-brand-modal/edit-brand-modal.component';
import {BrandCbrTopPostsScreenshotsComponent} from '@sharedModule/components/brand-cbr/top-posts-screenshots/brand-cbr-top-posts-screenshots.component';
import {BrandCbrComponent} from '@sharedModule/components/brand-cbr/brand-cbr.component';
import {BrandCbrConversationsReportComponent} from '@sharedModule/components/brand-cbr/conversations-report/brand-cbr-conversations-report.component';
import {BioMessageLeadOverlayComponent} from './components/admin-bio/bio-message-lead-overlay/bio-message-lead-overlay.component';
import {ReverseArrayPipe} from './pipes/reverse-array.pipe';
import {FocusInputDirective} from './directives/focus-input.directive';
import {GroupReviewsComponent} from './components/group-reviews-modal/group-reviews-modal.component';
import {RangeSliderComponent} from '@sharedModule/components/range-slider/range-slider.component';
import {AngularCropperjsModule} from 'angular-cropperjs';
import {WhatThisVideoComponent} from './components/what-this-video/what-this-video.component';
import {AddAppInstallationPopupComponent} from './components/add-app-installation-popup/add-app-installation-popup.component';
import {BioSlugUrlComponent} from './components/admin-bio/bio-slug-url/bio-slug-url.component';

export function playerFactory() {
	return player;
}

@NgModule({
	declarations: [
		ConversationListComponent,
		ConvosightFiltersComponent,
		KeywordTrackerComponent,
		HighChartComponent,
		ChartComponent,
		CommunityMarketingCampaignTasksComponent,
		CommunityMarketingCampaignTasksOldComponent,
		ShortNumberPipe,
		TextHighlightPipe,
		SanitizeHtmlPipe,
		SanitizeUrlPipe,
		ReverseArrayPipe,
		CommunityMarketingCampaignReportComponent,
		BrandCommunitiesComponent,
		BrandCommunityReportComponent,
		ConversationsReportComponent,
		TopPostsScreenshotsComponent,
		KpisComponent,
		CommunityMarketingCampaignCommunitiesComponent,
		CommunityMarketingCampaignCommunityNotificationComponent,
		SearchableDropdownComponent,
		SearchableCampaignsDropdownComponent,
		CommunityMarketingCampaignInfoComponent,
		CommunityMarketingCampaignInfoOldComponent,
		CustomDropdownComponent,
		CustomPostTextAreaComponent,
		GroupSelectionOverlayComponent,
		LongPressDirective,
		TooltipComponent,
		WhatsappOptInComponent,
		AnalysisStateComponent,
		CommunityDiscoveryComponent,
		RangeSliderComponent,
		CreateBrandCommunityMarketingCampaignComponent,
		CreateCampaignDetailsComponent,
		CommunityMarketingCampaignReportDataComponent,
		CommunityDiscoveryDirective,
		DefaultImageDirective,
		DefaultImageOnSrcErrorDirective,
		FocusInputDirective,
		CustomDateTimePickerComponent,
		CampaignTaskStatusPipe,
		CampaignGroupStatusPipe,
		CommunicationModeVerificationComponent,
		CircleStepBarComponent,
		DragAndDropDirective,
		FacebookPostScreenshotComponent,
		FbGroupCoverImageComponent,
		FacebookInsightsUploadCardComponent,
		CMCReportV3Component,
		CreateCampaignDetailsV3Component,
		PhaseIdeaComponent,
		BrandCommunityKpisComponent,
		BrandCommunityWordCloudComponent,
		CommunityDemographicsComponent,
		CustomConversationComponent,
		KeyFindingsComponent,
		BrandShareOfVoiceComponent,
		ShareofVoiceStackedBarChartComponent,
		BrandObjectiveComponent,
		ResultsComponent,
		BioIntroductionComponent,
		BioPersonalInfoComponent,
		BioPitchVideoComponent,
		BioKeyAchievementsComponent,
		BioMediaCoverageComponent,
		BioSupportingDocsComponent,
		BioSocialProfilesComponent,
		BioFacebookGroupsListComponent,
		ShareWidgetComponent,
		GroupReviewsComponent,
		BioPreviewHederComponent,
		BioPreviewIntroductionComponent,
		BioPreviewKeyAchievementsComponent,
		BioPreviewMediaCoverageComponent,
		BioPreviewSupportingDocsComponent,
		BioPreviewFacebookGroupsListComponent,
		AdminBioPreviewComponent,
		FileSizePipe,
		LoadingShimmerComponent,
		AdminBioComponent,
		ErrorOverlayComponent,
		AdminPreviewDashboardComponent,
		UnsavedFormDialogComponent,
		EllipsisPipe,
		DelayedInputDirective,
		FilterPipe,
		FixedTooltipComponent,
		AdminBioProfileOverlayComponent,
		OrderByPipe,
		ReferenceConversationComponent,
		KpiChartComponent,
		DelayClickDirective,
		BrandSentimentsComponent,
		DonutChartComponent,
		WordcloudComponent,
		WordcloudChartComponent,
		IntentComponent,
		EmotionsComponent,
		BenefitsComponent,
		EngagementInsightComponent,
		EngagementInsightChartComponent,
		DelayClickDirective,
		BioContactComponent,
		BioPreviewSocialProfilesComponent,
		BioContactMeComponent,
		AutoSaveBottomBarComponent,
		BioContactMeComponent,
		TopPerformingPostComponent,
		CustomDateRangeComponent,
		UploadScreenshotComponent,
		AllPostsComponent,
		UnretrievedPostsComponent,
		EditReferenceConversationsComponent,
		SharedModalComponent,
		TimeFromXTime,
		BrandCbrWordCloudComponent,
		BrandCbrCommunityDemographicsComponent,
		BrandCbrCustomConversationComponent,
		BrandCbrTopPostsScreenshotsComponent,
		BrandCbrComponent,
		BrandCbrKpisComponent,
		BrandCbrConversationsReportComponent,
		BioMessageLeadOverlayComponent,
		WhatThisVideoComponent,
		EditBrandModalComponent,
		AddAppInstallationPopupComponent,
		BioSlugUrlComponent
	],
	providers: [{provide: MatPaginatorIntl, useValue: PaginatorIntl()}],
	exports: [
		ConversationListComponent,
		ConvosightFiltersComponent,
		KeywordTrackerComponent,
		HighChartComponent,
		ShortNumberPipe,
		ChartComponent,
		CommunityMarketingCampaignTasksComponent,
		CommunityMarketingCampaignTasksOldComponent,
		TextHighlightPipe,
		SanitizeHtmlPipe,
		SanitizeUrlPipe,
		ReverseArrayPipe,
		CommunityMarketingCampaignReportComponent,
		BrandCommunitiesComponent,
		BrandCommunityReportComponent,
		ConversationsReportComponent,
		TopPostsScreenshotsComponent,
		KpisComponent,
		BrandCommunityKpisComponent,
		BrandCommunityWordCloudComponent,
		CommunityDemographicsComponent,
		CustomConversationComponent,
		CommunityMarketingCampaignCommunitiesComponent,
		CommunityMarketingCampaignCommunityNotificationComponent,
		SearchableDropdownComponent,
		SearchableCampaignsDropdownComponent,
		TextHighlightPipe,
		CommunityMarketingCampaignInfoComponent,
		CommunityMarketingCampaignInfoOldComponent,
		CustomDropdownComponent,
		CustomPostTextAreaComponent,
		GroupSelectionOverlayComponent,
		LongPressDirective,
		TooltipComponent,
		WhatsappOptInComponent,
		AnalysisStateComponent,
		CommunityDiscoveryComponent,
		RangeSliderComponent,
		CreateBrandCommunityMarketingCampaignComponent,
		CreateCampaignDetailsComponent,
		CommunityMarketingCampaignReportDataComponent,
		CommunityDiscoveryDirective,
		DefaultImageDirective,
		DefaultImageOnSrcErrorDirective,
		FocusInputDirective,
		CustomDateTimePickerComponent,
		CampaignTaskStatusPipe,
		CampaignGroupStatusPipe,
		CommunicationModeVerificationComponent,
		CircleStepBarComponent,
		DragAndDropDirective,
		FacebookPostScreenshotComponent,
		FbGroupCoverImageComponent,
		FacebookInsightsUploadCardComponent,
		CMCReportV3Component,
		CreateCampaignDetailsV3Component,
		DelayedInputDirective,
		FilterPipe,
		GroupReviewsComponent,
		ShareWidgetComponent,
		BioIntroductionComponent,
		BioPersonalInfoComponent,
		BioPitchVideoComponent,
		BioKeyAchievementsComponent,
		BioMediaCoverageComponent,
		BioSupportingDocsComponent,
		BioSocialProfilesComponent,
		BioFacebookGroupsListComponent,
		ShareWidgetComponent,
		BioPreviewHederComponent,
		BioPreviewIntroductionComponent,
		BioPreviewKeyAchievementsComponent,
		BioPreviewMediaCoverageComponent,
		BioPreviewSupportingDocsComponent,
		BioPreviewFacebookGroupsListComponent,
		FileSizePipe,
		LoadingShimmerComponent,
		AdminBioComponent,
		UnsavedFormDialogComponent,
		EllipsisPipe,
		FixedTooltipComponent,
		AdminBioProfileOverlayComponent,
		OrderByPipe,
		DelayClickDirective,
		BioContactMeComponent,
		CustomDateRangeComponent,
		SharedModalComponent,
		TimeFromXTime,
		DelayClickDirective,
		AutoSaveBottomBarComponent,
		BrandCbrWordCloudComponent,
		BrandCbrCommunityDemographicsComponent,
		BrandCbrCustomConversationComponent,
		BrandCbrTopPostsScreenshotsComponent,
		BrandCbrComponent,
		BrandCbrConversationsReportComponent,
		BrandCbrKpisComponent,
		BioMessageLeadOverlayComponent,
		WhatThisVideoComponent,
		EditBrandModalComponent,
		AddAppInstallationPopupComponent
	],
	imports: [
		CommonModule,
		AngularCropperjsModule,
		FormsModule,
		ReactiveFormsModule,
		MatCardModule,
		MatButtonModule,
		HighchartsChartModule,
		MatIconModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatInputModule,
		MatSliderModule,
		MatChipsModule,
		MatRadioModule,
		MatCheckboxModule,
		MatPaginatorModule,
		MatTableModule,
		MatSortModule,
		FormsModule,
		CommonModule,
		RouterModule,
		MatDatepickerModule,
		MatChipsModule,
		MatSlideToggleModule,
		EmojiModule,
		PickerModule,
		MatTooltipModule,
		NgxIntlTelInputModule,
		ClipboardModule,
		MatProgressSpinnerModule,
		MatSelectModule,
		MatTableModule,
		MatRadioModule,
		TimepickerModule.forRoot(),
		MatSlideToggleModule,
		QuillModule.forRoot(),
		LottieModule.forRoot({player: playerFactory}),
		MatSlideToggleModule,
		MatSidenavModule,
		MatTabsModule,
		LottieModule.forRoot({player: playerFactory})
	]
})
export class SharedModule {}

export function PaginatorIntl() {
	const paginatorIntl = new MatPaginatorIntl();
	paginatorIntl.itemsPerPageLabel = 'Communities per page:';
	return paginatorIntl;
}
