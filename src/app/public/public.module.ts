import {GroupProfilePageComponent} from './group-profile/group-profile-page.component';
import {GroupProfileOverviewComponent} from './group-profile/sections/overview/group-profile-overview.component';
import {GroupProfileAdminsComponent} from './group-profile/sections/admins/group-profile-admins.component';
import {GroupProfileKeyStatsComponent} from './group-profile/sections/key-stats/group-profile-key-stats.component';
import {GroupProfileAudienceComponent} from './group-profile/sections/audience/group-profile-audience.component';
import {GroupProfileTopicsComponent} from './group-profile/sections/topics/group-profile-topics.component';
import {GroupProfileBrandsComponent} from './group-profile/sections/brands/group-profile-brands.component';
import {GroupProfileCampaignsComponent} from './group-profile/sections/campaigns/group-profile-campaigns.component';
import {GroupProfileFilesComponent} from './group-profile/sections/files/group-profile-files.component';
import {GroupProfilePricingComponent} from './group-profile/sections/pricing/group-profile-pricing.component';
import {GroupProfileReviewsComponent} from './group-profile/sections/reviews/group-profile-reviews.component';
import {GroupProfileReviewsAdminComponent} from './group-profile/sections/reviews-admin/group-profile-reviews-admin.component';
import {NgModule} from '@angular/core';
import {PublicRoutingModule} from './public-routing.module';
import {SharedModule} from '@sharedModule/shared.module';
import {CommonModule} from '@angular/common';
import {CampaignReportViewDashboardComponent} from './campaign-report/campaign-report-view-dashboard/campaign-report-view-dashboard.component';
import {ReportGeneratorComponent} from './campaign-report/report-generator/report-generator.component';
import {CampaignReportViewComponent} from './campaign-report/report-generator/campaign-report-view/campaign-report-view.component';
import {CampaignReportPostsComponent} from './campaign-report/report-generator/campaign-report-posts/campaign-report-posts.component';
import {CampaignReportComponent} from './campaign-report/report-generator/campaign-report/campaign-report.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {QuillModule} from 'ngx-quill';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ContentManagerService} from '../cs-admin/services/content-manager.service';

import {CampaignBriefComponent} from './campaign-brief/campaign-brief.component';
import {LottieModule} from 'ngx-lottie';
import {BarRatingModule} from 'ngx-bar-rating';
import {GroupProfileFeatureConversationComponent} from './group-profile/sections/feature-conversation/group-profile-feature-conversation.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
	declarations: [
		GroupProfilePageComponent,
		GroupProfileOverviewComponent,
		GroupProfileAdminsComponent,
		GroupProfileKeyStatsComponent,
		GroupProfileAudienceComponent,
		GroupProfileTopicsComponent,
		GroupProfileBrandsComponent,
		GroupProfileCampaignsComponent,
		GroupProfileFilesComponent,
		GroupProfilePricingComponent,
		GroupProfileReviewsComponent,
		GroupProfileReviewsAdminComponent,
		CampaignReportViewDashboardComponent,
		CampaignReportViewComponent,
		ReportGeneratorComponent,
		CampaignReportPostsComponent,
		CampaignReportComponent,
		CampaignBriefComponent,
		GroupProfileFeatureConversationComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		PublicRoutingModule,
		SharedModule,
		MatDatepickerModule,
		MatSlideToggleModule,
		QuillModule.forRoot(),
		MatInputModule,
		MatChipsModule,
		MatIconModule,
		MatTooltipModule,
		ReactiveFormsModule,
		LottieModule,
		BarRatingModule,
		MatExpansionModule
	],
	exports: [
		GroupProfileAdminsComponent,
		GroupProfilePageComponent,
		GroupProfileOverviewComponent,
		GroupProfileAdminsComponent,
		GroupProfileKeyStatsComponent,
		GroupProfileAudienceComponent,
		GroupProfileTopicsComponent,
		GroupProfileBrandsComponent,
		GroupProfileCampaignsComponent,
		GroupProfileFilesComponent,
		GroupProfilePricingComponent,
		GroupProfileReviewsComponent,
		GroupProfileFeatureConversationComponent,
		GroupProfileReviewsAdminComponent
	],
	providers: [FormsModule, ReactiveFormsModule, ContentManagerService]
})
export class PublicModule {
	constructor() {}
}
