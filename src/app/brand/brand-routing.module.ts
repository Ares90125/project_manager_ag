import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrandTrackComponent} from './components/brand-track/brand-track.component';
import {ListeningDetailsComponent} from './components/campaigns/listening-campaigns/listening-details/listening-details.component';
import {ManageCampaignsComponent} from './components/campaigns/manage-campaigns/manage-campaigns.component';
import {CommunityDetailsComponent} from './components/communities/community-details/community-details.component';
import {CampaignProposalComponent} from './components/campaigns/community-marketing-campaigns/campaign-proposal/campaign-proposal.component';
import {DashboardComponent} from '../dashboard/dashboard/dashboard.component';
import {BrandAuthGuard} from '@brandModule/guards/brand-auth.guard';
import {CommunityMarketingCampaignDetailsComponent} from '@csAdminModule/components/campaigns/create-community-campaign/community-marketing-campaign-details/community-marketing-campaign-details.component';
import {CampaignProposalOldComponent} from '@brandModule/components/campaigns/community-marketing-campaigns/campaign-proposal-v1/campaign-proposal-old.component';
import {ListeningPowerBiComponent} from './components/campaigns/listening-campaigns/listening-power-bi/listening-power-bi.component';
import {BrandCommunityReportComponent} from '@sharedModule/components/brand-community-report/brand-community-report.component';
import {BrandCommunitiesComponent} from '@sharedModule/components/brand-communities/brand-communities.component';
import {BrandCbrComponent} from '@sharedModule/components/brand-cbr/brand-cbr.component';

const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		children: [
			{path: 'manage-campaigns', component: ManageCampaignsComponent},
			{path: 'brands/:brandId/campaign/:campaignId/details', component: CommunityMarketingCampaignDetailsComponent},
			{path: 'campaign-details', component: ListeningDetailsComponent},
			{path: 'brands/:brandId/campaign-proposal/:campaignId/old', component: CampaignProposalOldComponent},
			{path: 'brands/:brandId/campaign-proposal/:campaignId', component: CampaignProposalComponent},
			{path: 'brands/:brandId/campaign/:campaignId', component: ListeningDetailsComponent},
			{path: 'brands/:brandId/campaign/:campaignId/power-bi', component: ListeningPowerBiComponent},
			{path: 'community/:id', component: CommunityDetailsComponent},
			{path: 'brand-track', component: BrandTrackComponent},
			{path: 'brand-communities', component: BrandCommunitiesComponent},
			{path: ':brandId/brand-community/:groupId', component: BrandCbrComponent},
			{path: '', redirectTo: 'manage-campaigns', pathMatch: 'full'}
		],
		canActivate: [BrandAuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BrandRoutingModule {}
