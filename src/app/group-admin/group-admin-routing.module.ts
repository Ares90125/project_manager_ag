import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GroupComponent} from './_components/group/group.component';
import {GroupOverviewComponent} from './_components/group/group-overview/group-overview.component';
import {GroupUnansweredComponent} from './_components/group/group-unanswered/group-unanswered.component';
import {GroupDetailsComponent} from './_components/group/group-details/group-details.component';
import {ModeratorsComponent} from './_components/group/moderators/moderators.component';
import {GroupInsightsComponent} from './_components/group/group-insights/group-insights.component';
import {GroupConversationTrendsComponent} from './_components/group/conversation-trends/group-conversation-trends.component';
import {PostTrendsComponent} from './_components/group/post-trends/post-trends.component';
import {PostComposerComponent} from '@groupAdminModule/_components/publish-queue/post-composer/post-composer.component';
import {PostAnalyticsComponent} from '@groupAdminModule/_components/publish-queue/publish/post-analytics/post-analytics.component';
import {GroupKeywordComponent} from './_components/group/group-keyword/group-keyword.component';
import {GroupPostComponent} from './_components/group/group-post/group-post.component';
import {GroupConversationCategoryDetailsComponent} from '@groupAdminModule/_components/group/group-conversation-category-details/group-conversation-category-details.component';

const routes: Routes = [
	{
		path: ':id',
		component: GroupComponent,
		children: [
			{path: '', component: GroupOverviewComponent},
			{path: 'overview', component: GroupOverviewComponent},
			{path: 'unanswered', component: GroupUnansweredComponent},
			{path: 'groupdetails', component: GroupDetailsComponent},
			{path: 'moderator', component: ModeratorsComponent},
			{path: 'statistics', component: GroupInsightsComponent},
			{path: 'conversationtrends', component: GroupConversationTrendsComponent},
			{path: 'conversationtrends/:category', component: GroupConversationCategoryDetailsComponent},
			{path: 'scheduledposts', component: GroupPostComponent},
			{path: 'postanalytics', component: PostAnalyticsComponent},
			{path: 'postTrends', component: PostTrendsComponent},
			{path: 'urgentAlerts', component: GroupKeywordComponent},
			{path: 'urgentAlerts/:report', component: GroupKeywordComponent},
			{path: 'post/create', component: PostComposerComponent},
			{path: 'post/edit', component: PostComposerComponent}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class GroupAdminRoutingModule {}
