import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminBioPreviewComponent} from '../admin-bio-preview/admin-bio-preview.component';
import {AdminPreviewDashboardComponent} from '../admin-preview-dashboard/admin-preview-dashboard.component';

const routes: Routes = [
	{
		path: '',
		component: AdminPreviewDashboardComponent,
		children: [
			{
				path: 'admin/:id',
				component: AdminBioPreviewComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminPreviewRoutingModule {}
