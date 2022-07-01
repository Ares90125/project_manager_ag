import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard/dashboard.component';
import {ManageGroupsComponent} from '@groupAdminModule/manage/manage-groups/manage-groups.component';
import {NoGroupsComponent} from '@groupAdminModule/manage/no-groups/no-groups.component';
import {PublishComponent} from '@groupAdminModule/_components/publish-queue/publish/publish.component';
import {GroupAdminAuthGuard} from '@groupAdminModule/_guards/group-admin-auth.guard';
import {LoginResponseComponent} from './group-admin-login/login-response/login-response.component';
import {PlaceHolderComponent} from './place-holder.component';
import {PostComposerComponent} from '@groupAdminModule/_components/publish-queue/post-composer/post-composer.component';
import {QuicklinkModule, QuicklinkStrategy} from 'ngx-quicklink';
import {GroupAdminLoginComponent} from './group-admin-login/landing/group-admin-login.component';
import {GroupNotificationsComponent} from './dashboard/group-notifications/group-notifications.component';

const routes: Routes = [
	{path: 'group-admin-login', component: GroupAdminLoginComponent},
	{path: 'login-response', component: LoginResponseComponent},
	{
		path: 'public',
		loadChildren: () =>
			import('./shared/components/admin-preview/admin-preview.module').then(module => module.AdminPreviewModule)
	},
	{
		path: 'group-admin',
		component: DashboardComponent,
		children: [
			{path: 'manage', component: ManageGroupsComponent},
			{path: 'no-groups', component: NoGroupsComponent},
			{
				path: 'campaigns',
				loadChildren: () =>
					import('@groupAdminModule/campaigns/campaigns.module').then(module => module.CampaignsModule)
			},
			{
				path: 'settings',
				loadChildren: () => import('@groupAdminModule/settings/settings.module').then(module => module.SettingsModule)
			},
			{
				path: 'group',
				loadChildren: () => import('@groupAdminModule/group-admin.module').then(module => module.GroupAdminModule)
			},
			{path: 'publish', component: PublishComponent},
			{path: 'publish/:groupId', redirectTo: 'publish/:groupId/scheduledposts', pathMatch: 'full'},
			{path: 'publish/:groupId/scheduledposts', component: PublishComponent},
			{path: 'publish/:groupId/postanalytics', component: PublishComponent},
			{path: 'publish/:groupId/post/create', component: PostComposerComponent},
			{path: 'publish/:groupId/post/edit', component: PostComposerComponent},
			{path: ':groupId/post/create', redirectTo: 'group/:groupId/post/create', pathMatch: 'full'},
			{path: 'notifications', component: GroupNotificationsComponent}
		],
		canActivate: [GroupAdminAuthGuard]
	},
	{path: 'public', loadChildren: () => import('./public/public.module').then(module => module.PublicModule)},
	{path: 'brand', loadChildren: () => import('./brand/brand.module').then(module => module.BrandModule)},
	{path: 'cs-admin', loadChildren: () => import('./cs-admin/cs-admin.module').then(module => module.CSAdminModule)},
	{
		path: 'cs-admin-login',
		loadChildren: () => import('./cs-admin-login/cs-admin.module').then(module => module.CsAdminModule)
	},
	{
		path: 'brand-login',
		loadChildren: () => import('./brand-login/brand-login.module').then(module => module.BrandLoginModule)
	},
	{
		path: 'request-access',
		loadChildren: () =>
			import('./brand-request-access/brand-request-access.module').then(module => module.BrandRequestAccessModule)
	},
	{
		path: 'password-recovery',
		loadChildren: () =>
			import('./password-recovery/password-recovery.module').then(module => module.PasswordRecoveryModule)
	},
	{
		path: '404',
		loadChildren: () => import('./page-not-found/page-not-found.module').then(module => module.PageNotFoundModule)
	},
	{
		path: 'campaign-report/report-view/:campaignId',
		redirectTo: 'public/campaign-report/view/:campaignId',
		pathMatch: 'full'
	},
	{path: 'group-admin-hello', redirectTo: 'group-admin', pathMatch: 'full'},
	{path: '', component: PlaceHolderComponent},
	{path: '**', redirectTo: '404', pathMatch: 'full'}
];

@NgModule({
	imports: [
		QuicklinkModule,
		RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled', preloadingStrategy: QuicklinkStrategy})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}
