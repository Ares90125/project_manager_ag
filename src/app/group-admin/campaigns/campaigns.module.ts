import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlaysModule} from '@groupAdminModule/overlays/overlays.module';
import {CampaignsRoutingModule} from './campaigns-routing.module';
import {GroupsListLeftPaneComponent} from './_components/groups-list-left-pane/groups-list-left-pane.component';
import {ProfilePageLeftPaneComponent} from '@campaigns/profile-pages/_components/left-pane/profile-page-left-pane.component';
import {ProfileIntroductionModalComponent} from '@groupAdminModule/campaigns/profile-pages/_components/profile-introduction-modal/profile-introduction-modal.component';
import {GroupSelectionModalComponent} from '@groupAdminModule/campaigns/profile-pages/_components/group-selection-modal/group-selection-modal.component';
import {CampaignsComponent} from '@campaigns/_components/campaigns/campaigns.component';
import {InfluencerTeamComponent} from '@campaigns/influencer-teams/influencer-team/influencer-team.component';
import {BrandConnectionsComponent} from '@campaigns/brand-connections/brand-connections.component';
import {ProfilePagesDashboardComponent} from '@campaigns/profile-pages/profile-pages-dashboard.component';
import {ProfileOnboardingComponent} from '@groupAdminModule/campaigns/profile-onboarding/profile-onboarding.component';
import {VerticalProgressBarComponent} from '@groupAdminModule/campaigns/_components/vertical-progress-bar/vertical-progress-bar.component';
import {TopProfilesListComponent} from '@campaigns/_components/top-profiles-list/top-profiles-list.component';
import {OnboardingStepDescriptionComponent} from '@campaigns/_components/onboarding-step-desc/onboarding-step-desc.component';
import {OnboardingStepNavComponent} from '@campaigns/_components/onboarding-step-nav/onboarding-step-nav.component';
import {PitchOnboardingComponent} from '@campaigns/pitch-onboarding/pitch-onboarding.component';
import {SuccessPublishedPitchComponent} from '@campaigns/pitch-onboarding/success-published-pitch/success-published-pitch.component';
import {SkipStepModalComponent} from '@campaigns/_components/skip-step-modal/skip-step-modal.component';
import {TopProfilesListModalComponent} from '@campaigns/_components/top-profiles-list-modal/top-profiles-list-modal.component';
import {OverviewStepComponent} from '@campaigns/profile-onboarding/steps/overview-step/overview-step.component';
import {TopConversationsStepComponent} from '@campaigns/profile-onboarding/steps/top-conversation-step/top-conversation-step.component';
import {PreviewPublishStepComponent} from '@campaigns/profile-onboarding/steps/preview-publish-step/preview-publish-step.component';
import {PopularTopicsStepComponent} from '@campaigns/profile-onboarding/steps/popular-topics-step/popular-topics-step.component';
import {SuccessPublishedProfileComponent} from '@campaigns/profile-onboarding/success-published-profile/success-published-profile.component';
import {PitchOnboardingIntroComponent} from '@campaigns/pitch-onboarding/pitch-onboarding-intro/pitch-onboarding-intro.component';
import {PitchOnboardingExamplesComponent} from '@campaigns/pitch-onboarding/pitch-onboarding-examples/pitch-onboarding-examples.component';
import {PreviewOnboardProfilePageComponent} from '@campaigns/profile-onboarding/profile-onboarding-preview/profile-onboarding-preview.component';
import {ProfilePageEditComponent} from '@campaigns/profile-pages/details/edit/profile-page-edit.component';
import {ProfilePagePricingComponent} from '@campaigns/profile-pages/details/pricing/profile-page-pricing.component';
import {ProfilePageReviewsComponent} from '@campaigns/profile-pages/details/reviews/profile-page-reviews.component';
import {ProfilePageSettingsComponent} from '@campaigns/profile-pages/details/settings/profile-page-settings.component';
import {IntegrityDisclosureComponent} from '@campaigns/integrity-disclosure/integrity-disclosure.component';
import {InfluencerTeamsDashboardComponent} from '@campaigns/influencer-teams/influencer-teams-dashboard.component';
import {EarningsComponent} from '@campaigns/earnings/earnings.component';
import {TaskDetailsComponent} from '@campaigns/_components/task-details/task-details.component';
import {CampaignsLeftPanelComponent} from '@campaigns/_components/campaigns-left-panel/campaigns-left-panel.component';
import {CampaignsOverviewComponent} from '@campaigns/overview/campaigns-overview.component';
import {CampaignsDashboardComponent} from '@campaigns/campaigns-dashboard.component';
import {ProfilePageOverviewComponent} from '@campaigns/profile-pages/details/overview/profile-page-overview.component';
import {CampaignDetailsComponent} from '@campaigns/_components/campaign-details/campaign-details.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '@sharedModule/shared.module';
import {QuillModule} from 'ngx-quill';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {GroupProfilePagesService} from '@campaigns/_services/group-profile-pages.service';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PreviewGroupProfilePageComponent} from './profile-pages/public-profile-page/preview-group-profile-page.component';
import {PublicModule} from '../../public/public.module';
import {MatTabsModule} from '@angular/material/tabs';
import {MatRadioModule} from '@angular/material/radio';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {LottieModule} from 'ngx-lottie';
import {PreviewOnboardPitchPageComponent} from '@campaigns/pitch-onboarding/pitch-onboarding-preview/pitch-onboarding-preview.component';

@NgModule({
	declarations: [
		CampaignsComponent,
		CampaignDetailsComponent,
		TaskDetailsComponent,
		CampaignsLeftPanelComponent,
		BrandConnectionsComponent,
		EarningsComponent,
		InfluencerTeamComponent,
		CampaignsOverviewComponent,
		CampaignsDashboardComponent,
		IntegrityDisclosureComponent,
		ProfilePagesDashboardComponent,
		ProfileOnboardingComponent,
		SuccessPublishedProfileComponent,
		SuccessPublishedPitchComponent,
		OnboardingStepDescriptionComponent,
		PitchOnboardingIntroComponent,
		PitchOnboardingExamplesComponent,
		OnboardingStepNavComponent,
		SkipStepModalComponent,
		OverviewStepComponent,
		TopConversationsStepComponent,
		PopularTopicsStepComponent,
		PreviewPublishStepComponent,
		PitchOnboardingComponent,
		TopProfilesListComponent,
		TopProfilesListModalComponent,
		VerticalProgressBarComponent,
		InfluencerTeamsDashboardComponent,
		GroupsListLeftPaneComponent,
		ProfilePageEditComponent,
		ProfilePageOverviewComponent,
		ProfilePagePricingComponent,
		ProfilePageReviewsComponent,
		ProfilePageSettingsComponent,
		GroupSelectionModalComponent,
		ProfileIntroductionModalComponent,
		ProfilePageLeftPaneComponent,
		PreviewOnboardPitchPageComponent,
		PreviewOnboardProfilePageComponent,
		PreviewGroupProfilePageComponent
	],
	imports: [
		CommonModule,
		CampaignsRoutingModule,
		OverlaysModule,
		MatChipsModule,
		MatFormFieldModule,
		FormsModule,
		SharedModule,
		QuillModule.forRoot(),
		MatInputModule,
		MatDatepickerModule,
		MatIconModule,
		MatSlideToggleModule,
		ReactiveFormsModule,
		MatTooltipModule,
		PublicModule,
		MatTabsModule,
		LottieModule,
		MatRadioModule
	],
	providers: [GroupProfilePagesService]
})
export class CampaignsModule {}
