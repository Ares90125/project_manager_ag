import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GroupProfilePageComponent} from './group-profile/group-profile-page.component';
import {CampaignReportViewDashboardComponent} from './campaign-report/campaign-report-view-dashboard/campaign-report-view-dashboard.component';
import {CampaignReportViewComponent} from './campaign-report/report-generator/campaign-report-view/campaign-report-view.component';
import {CampaignBriefComponent} from './campaign-brief/campaign-brief.component';

const routes: Routes = [
	{path: 'group-profile/:profileId', component: GroupProfilePageComponent},
	{
		path: 'campaign-report',
		component: CampaignReportViewDashboardComponent,
		children: [{path: 'view/:campaignId', component: CampaignReportViewComponent}]
	},
	{path: 'campaign-brief/:campaignId', component: CampaignBriefComponent}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PublicRoutingModule {}
