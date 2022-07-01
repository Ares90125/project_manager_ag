import {NgModule} from '@angular/core';
import {PageNotFoundComponent} from './page-not-found.component';
import {RouterModule} from '@angular/router';

@NgModule({
	declarations: [PageNotFoundComponent],
	imports: [RouterModule.forChild([{path: '', component: PageNotFoundComponent}])]
})
export class PageNotFoundModule {}
