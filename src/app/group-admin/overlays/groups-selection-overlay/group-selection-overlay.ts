import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';

@Component({
	selector: 'app-group-selection-overlay',
	templateUrl: './group-selection-overlay.html',
	styleUrls: ['./group-selection-overlay.scss']
})
export class GroupSelectionOverlayComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group;
	@Output() setGroupSelection = new EventEmitter();
	@Input() selectedGroups = {};
	initialGroupId;
	numOfGroupSelected;
	@Input() installedGroups;

	constructor(injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.initialGroupId = this.group.id;
		this.selectedGroups[this.group.id] = this.group;
		this.numOfGroupSelected = 1;
	}

	toggleGroupSelection(group) {
		this.setGroupSelection.emit(group);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
