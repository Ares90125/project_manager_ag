import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfilePageLeftPaneComponent} from '@campaigns/profile-pages/_components/left-pane/profile-page-left-pane.component';
import {CampaignsLeftPanelComponent} from '@campaigns/_components/campaigns-left-panel/campaigns-left-panel.component';
import {CampaignsDashboardComponent} from '@campaigns/campaigns-dashboard.component';
import {CampaignsOverviewComponent} from '@campaigns/overview/campaigns-overview.component';
import {InfluencerTeamComponent} from '@campaigns/influencer-teams/influencer-team/influencer-team.component';
import {BrandConnectionsComponent} from '@campaigns/brand-connections/brand-connections.component';
import {ProfilePagesDashboardComponent} from '@campaigns/profile-pages/profile-pages-dashboard.component';
import {ProfileOnboardingComponent} from '@groupAdminModule/campaigns/profile-onboarding/profile-onboarding.component';
import {PitchOnboardingIntroComponent} from '@groupAdminModule/campaigns/pitch-onboarding/pitch-onboarding-intro/pitch-onboarding-intro.component';
import {ProfilePageEditComponent} from '@campaigns/profile-pages/details/edit/profile-page-edit.component';
import {ProfilePagePricingComponent} from '@campaigns/profile-pages/details/pricing/profile-page-pricing.component';
import {PitchOnboardingComponent} from '@campaigns/pitch-onboarding/pitch-onboarding.component';
import {ProfilePageReviewsComponent} from '@campaigns/profile-pages/details/reviews/profile-page-reviews.component';
import {ProfilePageSettingsComponent} from '@campaigns/profile-pages/details/settings/profile-page-settings.component';
import {IntegrityDisclosureComponent} from '@campaigns/integrity-disclosure/integrity-disclosure.component';
import {InfluencerTeamsDashboardComponent} from '@campaigns/influencer-teams/influencer-teams-dashboard.component';
import {EarningsComponent} from '@campaigns/earnings/earnings.component';
import {TaskDetailsComponent} from '@campaigns/_components/task-details/task-details.component';
import {ProfilePageOverviewComponent} from '@campaigns/profile-pages/details/overview/profile-page-overview.component';
import {PreviewGroupProfilePageComponent} from '@campaigns/profile-pages/public-profile-page/preview-group-profile-page.component';
import {ReportGeneratorComponent} from '../../public/campaign-report/report-generator/report-generator.component';
import {CampaignReportComponent} from '../../public/campaign-report/report-generator/campaign-report/campaign-report.component';
import {CampaignReportViewComponent} from '../../public/campaign-report/report-generator/campaign-report-view/campaign-report-view.component';
import {UnSavedGuard} from '@sharedModule/guards/un-saved.guard';
import {PreviewOnboardProfilePageComponent} from '@campaigns/profile-onboarding/profile-onboarding-preview/profile-onboarding-preview.component';
import {PreviewOnboardPitchPageComponent} from '@campaigns/pitch-onboarding/pitch-onboarding-preview/pitch-onboarding-preview.component';
import {SuccessPublishedProfileComponent} from '@campaigns/profile-onboarding/success-published-profile/success-published-profile.component';
import {PitchOnboardingExamplesComponent} from '@campaigns/pitch-onboarding/pitch-onboarding-examples/pitch-onboarding-examples.component';
import {SuccessPublishedPitchComponent} from '@campaigns/pitch-onboarding/success-published-pitch/success-published-pitch.component';

const defaultLeftPanelComponent: Routes = [{path: '', component: CampaignsLeftPanelComponent, outlet: 'leftPanel'}];
const profilePageLeftPanelComponent: Routes = [
	{path: '', component: ProfilePageLeftPaneComponent, outlet: 'leftPanel'}
];
const routes: Routes = [
	{
		path: '',
		component: CampaignsDashboardComponent,
		children: [
			{path: 'campaign-report', redirectTo: 'reports', pathMatch: 'full'},
			{path: 'campaign-report/create-report', redirectTo: 'reports/create', pathMatch: 'full'},
			{path: 'campaign-report/edit-report/:campaignId', redirectTo: 'reports/edit/:campaignId', pathMatch: 'full'},
			{
				path: ':groupId/profile-pages',
				children: [
					{
						path: '',
						children: [{path: '', component: ProfilePagesDashboardComponent}, ...defaultLeftPanelComponent]
					},
					{
						path: ':profileId',
						children: [
							{
								path: 'profile-onboarding',
								children: [
									{path: '', component: ProfileOnboardingComponent, ...profilePageLeftPanelComponent},
									{path: 'preview', component: PreviewOnboardProfilePageComponent}
								]
							},
							{
								path: 'pitch-onboarding',
								children: [
									{path: '', component: PitchOnboardingComponent, ...profilePageLeftPanelComponent},
									{path: 'intro', component: PitchOnboardingIntroComponent},
									{path: 'examples', component: PitchOnboardingExamplesComponent, ...profilePageLeftPanelComponent},
									{path: 'preview', component: PreviewOnboardPitchPageComponent}
								]
							},
							{
								path: 'success-publish',
								children: [
									{path: 'profile', component: SuccessPublishedProfileComponent},
									{path: 'pitch', component: SuccessPublishedPitchComponent}
								]
							},
							{
								path: 'overview',
								children: [{path: '', component: ProfilePageOverviewComponent}]
							},
							{
								path: 'edit',
								children: [{path: '', component: ProfilePageEditComponent}, ...profilePageLeftPanelComponent]
							},
							{
								path: 'pricing',
								children: [{path: '', component: ProfilePagePricingComponent}, ...profilePageLeftPanelComponent]
							},
							{
								path: 'reviews',
								children: [{path: '', component: ProfilePageReviewsComponent}, ...profilePageLeftPanelComponent]
							},
							{
								path: 'settings',
								children: [
									{path: '', component: ProfilePageSettingsComponent, canDeactivate: [UnSavedGuard]},
									...profilePageLeftPanelComponent
								]
							},
							{path: 'preview', component: PreviewGroupProfilePageComponent},

							{path: '', redirectTo: 'overview', pathMatch: 'full'}
						]
					}
				]
			},
			{
				path: 'campaign-report/campaign-report-view/:campaignId',
				redirectTo: 'reports/view/:campaignId',
				pathMatch: 'full'
			},
			{
				path: 'overview',
				children: [{path: '', component: CampaignsOverviewComponent}, ...defaultLeftPanelComponent]
			},
			{
				path: 'view',
				children: [
					{path: ':groupId/:campaignId', component: TaskDetailsComponent},
					{path: ':campaignId', component: TaskDetailsComponent}
				]
			},
			{
				path: 'influencer-team',
				children: [{path: '', component: InfluencerTeamComponent}, ...defaultLeftPanelComponent]
			},
			{
				path: 'brand-connections',
				children: [{path: '', component: BrandConnectionsComponent}, ...defaultLeftPanelComponent]
			},

			{
				path: 'integrity-disclosure',
				children: [{path: '', component: IntegrityDisclosureComponent}, ...defaultLeftPanelComponent]
			},
			{
				path: 'influencer-teams',
				children: [{path: '', component: InfluencerTeamsDashboardComponent}, ...defaultLeftPanelComponent]
			},
			{
				path: 'earnings',
				children: [{path: '', component: EarningsComponent}, ...defaultLeftPanelComponent]
			},
			{
				path: 'reports',
				children: [
					{
						path: '',
						children: [{path: '', component: ReportGeneratorComponent}, ...defaultLeftPanelComponent]
					},
					{path: 'create', component: CampaignReportComponent},
					{path: 'edit/:campaignId', component: CampaignReportComponent},
					{path: 'view/:campaignId', component: CampaignReportViewComponent}
				]
			},
			{path: ':campaignId', redirectTo: 'view/:campaignId', pathMatch: 'full'},
			{path: ':groupId/:campaignId', redirectTo: 'view/:groupId/:campaignId', pathMatch: 'full'},
			{path: '', redirectTo: 'overview', pathMatch: 'full'}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CampaignsRoutingModule {}
