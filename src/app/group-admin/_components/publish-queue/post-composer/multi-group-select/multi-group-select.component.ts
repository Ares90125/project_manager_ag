import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {PublishService} from '@groupAdminModule/_services/publish.service';

@Component({
	selector: 'app-multi-group-select',
	templateUrl: './multi-group-select.component.html',
	styleUrls: ['./multi-group-select.component.scss']
})
export class MultiGroupSelectComponent implements OnInit {
	@Input() installedGroups;
	@Input() group;
	@Input() selectedGroups = {};
	@Input() postToBeReShared;
	@Input() postToBeEdited;
	@Output() setGroupSelection = new EventEmitter();
	@Output() setAllGroupSelection = new EventEmitter();
	@ViewChild('selectAllGroups')
	selectAllGroups: MatCheckbox;
	initialGroupId;
	numOfGroupSelected;

	constructor(public publishService: PublishService) {}

	async ngOnInit() {
		this.initialGroupId = this.group.id;
		this.selectedGroups[this.group.id] = this.group;
		this.numOfGroupSelected = 1;
		const initialGroup = this.installedGroups?.find(group => group.id === this.initialGroupId);
		this.installedGroups = this.installedGroups?.filter(group => group.id !== this.initialGroupId);
		this.installedGroups?.unshift(initialGroup);
	}

	toggleAllGroupSelection() {
		this.selectedGroups = {};
		if (this.selectAllGroups.checked) {
			this.setAllGroupSelection.emit('checked');
		} else {
			this.setAllGroupSelection.emit('notChecked');
		}
	}

	toggleGroupSelection(group) {
		this.setGroupSelection.emit({group: group});
	}
}
