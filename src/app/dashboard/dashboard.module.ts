import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard/dashboard.component';
import {HeaderComponent} from './header/header.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CarouselModule} from 'ngx-owl-carousel-o';
import {NotificationsComponent} from './notifications/notifications.component';
import {PrivacyPolicyComponent} from './privacy-policy/privacy-policy.component';
import {ProductTourComponent} from './product-tour/product-tour.component';
import {GroupHeaderComponent} from './group-header/group-header.component';
import {GroupNotificationsComponent} from './group-notifications/group-notifications.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
	declarations: [
		DashboardComponent,
		HeaderComponent,
		NotificationsComponent,
		PrivacyPolicyComponent,
		ProductTourComponent,
		GroupHeaderComponent,
		GroupNotificationsComponent
	],
	imports: [CommonModule, RouterModule, CarouselModule, MatTooltipModule],
	exports: [DashboardComponent]
})
export class DashboardModule {}
