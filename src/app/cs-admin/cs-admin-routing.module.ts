import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListeningDetailsComponent} from '../brand/components/campaigns/listening-campaigns/listening-details/listening-details.component';
import {GroupComponent} from '../group-admin/_components/group/group.component';
import {CreateCampaignComponent} from './components/campaigns/create-campaign/create-campaign.component';
import {CreateCommunityMarketingCampaignComponent} from './components/campaigns/create-community-campaign/create-community-marketing-campaign/create-community-marketing-campaign.component';
import {ListBrandCampaignsComponent} from './components/campaigns/list-brand-campaigns/list-brand-campaigns.component';
import {ListBrandsComponent} from './components/list-brands/list-brands.component';
import {DashboardComponent} from '../dashboard/dashboard/dashboard.component';
import {ContentManagerComponent} from './components/content-manager/content-manager.component';
import {CSAdminAuthGuard} from '@csAdminModule/guards/cs-admin-auth.guard';
import {CommunityMarketingCampaignDetailsComponent} from './components/campaigns/create-community-campaign/community-marketing-campaign-details/community-marketing-campaign-details.component';
import {ManageGroupsComponent} from '@groupAdminModule/manage/manage-groups/manage-groups.component';
import {CreateCommunityListeningCampaignComponent} from './components/campaigns/create-community-campaign/create-community-listening-campaign/create-community-listening-campaign.component';
import {CreateBrandComponent} from '@csAdminModule/components/create-brand/create-brand.component';
import {CreateCommunityMarketingCampaignOldComponent} from '@csAdminModule/components/campaigns/create-community-campaign-v1/create-community-marketing-campaign-v1/create-community-marketing-campaign-old.component';
import {CommunityMarketingCampaignDetailsOldComponent} from '@csAdminModule/components/campaigns/create-community-campaign-v1/community-marketing-campaign-details-v1/community-marketing-campaign-details-old.component';
import {ListeningPowerBiComponent} from '@brandModule/components/campaigns/listening-campaigns/listening-power-bi/listening-power-bi.component';
import {BrandCommunityReportComponent} from '@sharedModule/components/brand-community-report/brand-community-report.component';
import {BrandCommunitiesComponent} from '@sharedModule/components/brand-communities/brand-communities.component';
import {BrandCbrComponent} from '@sharedModule/components/brand-cbr/brand-cbr.component';
import {WhatsAppComponent} from './components/whatsApp-campaigns/whatsApp-campaigns.component';
import {TrainingsComponent} from './components/trainings/trainings.component';

const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		children: [
			{path: 'manage', component: ManageGroupsComponent},
			{path: 'group/:id', component: GroupComponent},
			{path: 'manage-brands', component: ListBrandsComponent},
			{path: 'manage-brands/create', component: CreateBrandComponent},
			{path: 'brands/:brandId/manage-brand-campaigns', component: ListBrandCampaignsComponent},
			{path: 'brands/:brandId/create-campaign', component: CreateCampaignComponent},
			{path: 'brands/:brandId/edit-campaign/:campaignId', component: CommunityMarketingCampaignDetailsComponent},
			{path: 'brands/:brandId/edit-campaign/:campaignId/old', component: CreateCommunityMarketingCampaignOldComponent},
			{path: 'brands/:brandId/brand-communities', component: BrandCommunitiesComponent},
			{path: 'brands/:brandId/brand-community/:groupId', component: BrandCommunityReportComponent},
			{path: 'brands/:brandId/brand-community/:groupId/preview', component: BrandCbrComponent},
			{
				path: 'brands/:brandId/listening-campaigns/:campaignId',
				component: CreateCommunityListeningCampaignComponent
			},
			{
				path: 'brands/:brandId/campaigns/:campaignId/edit',
				component: CommunityMarketingCampaignDetailsComponent
			},
			{
				path: 'brands/:brandId/campaigns/:campaignId/edit/old',
				component: CommunityMarketingCampaignDetailsOldComponent
			},
			{path: 'brands/:brandId/campaign/new', component: CommunityMarketingCampaignDetailsComponent},
			{path: 'brands/:brandId/campaign/:campaignId', component: ListeningDetailsComponent},
			{path: 'brands/:brandId/campaign/:campaignId/power-bi', component: ListeningPowerBiComponent},
			{
				path: 'brands/:brandId/create-community-marketing-campaign',
				component: CreateCommunityMarketingCampaignComponent
			},
			{path: 'content-manager', component: ContentManagerComponent},
			{path: 'content-manager/brand/:brandId/campaign/:campaignId', component: ContentManagerComponent},
			{path: '', redirectTo: 'manage', pathMatch: 'full'},
			{path: 'whatsApp-campaigns', component: WhatsAppComponent},
			{path: 'trainings', component: TrainingsComponent}
		],
		canActivate: [CSAdminAuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CSAdminRoutingModule {}

