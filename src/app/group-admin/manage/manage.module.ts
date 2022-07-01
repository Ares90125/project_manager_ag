import {NgModule} from '@angular/core';
import {ManageGroupsComponent} from '@groupAdminModule/manage/manage-groups/manage-groups.component';
import {GroupCardComponent} from '@groupAdminModule/manage/group-card/group-card.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '@sharedModule/shared.module';
import {AddAppDialogComponentComponent} from './add-app-dialog-component/add-app-dialog-component.component';
import {NoGroupsComponent} from './no-groups/no-groups.component';
import {CarouselModule} from 'ngx-owl-carousel-o';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {OverlaysModule} from '@groupAdminModule/overlays/overlays.module';
import {AllPromptCardComponent} from './all-prompt-card/all-prompt-card.component';

@NgModule({
	declarations: [
		ManageGroupsComponent,
		GroupCardComponent,
		AddAppDialogComponentComponent,
		NoGroupsComponent,
		AllPromptCardComponent
	],
	providers: [],
	imports: [
		CommonModule,
		FormsModule,
		OverlaysModule,
		SharedModule,
		CarouselModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatCardModule
	],
	exports: [
		ManageGroupsComponent,
		GroupCardComponent,
		AddAppDialogComponentComponent,
		NoGroupsComponent,
		AllPromptCardComponent
	]
})
export class ManageModule {}
