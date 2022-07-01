import {Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {BaseComponent} from '../base.component';

export interface DialogData {
	animal: string;
	name: string;
}
@Component({
	selector: 'app-unsaved-form-dialog',
	templateUrl: './unsaved-form-dialog.component.html',
	styleUrls: ['./unsaved-form-dialog.component.scss']
})
export class UnsavedFormDialogComponent extends BaseComponent implements OnInit, OnDestroy {
	constructor(
		injector: Injector,
		public dialogRef: MatDialogRef<UnsavedFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	onNoClick() {
		this.dialogRef.close(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
