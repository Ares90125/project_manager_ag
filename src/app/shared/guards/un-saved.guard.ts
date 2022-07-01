import {createComponent} from '@angular/compiler/src/core';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CanDeactivate} from '@angular/router';
import {SettingAdminBioComponent} from '@groupAdminModule/settings/setting-admin-bio/setting-admin-bio.component';
import {UnsavedFormDialogComponent} from '@sharedModule/components/unsaved-form-dialog/unsaved-form-dialog.component';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UnSavedGuard implements CanDeactivate<SettingAdminBioComponent> {
	constructor(public dialog: MatDialog) {}

	canDeactivate(component: SettingAdminBioComponent): Observable<boolean> {
		if (component.isThereAnyUnSavedChanges) {
			const title = 'You have unsaved changes';
			const message = 'You are about to leave this page. All unsaved changes will be lost. Save before you go!';
			const data = {message: message, title: title};
			const dialogRef = this.dialog.open(UnsavedFormDialogComponent, {
				width: '440px',
				height: '196px',
				data: data
			});

			return dialogRef.afterClosed().pipe(map(result => result === true));
		}
		return of(true);
	}
}
