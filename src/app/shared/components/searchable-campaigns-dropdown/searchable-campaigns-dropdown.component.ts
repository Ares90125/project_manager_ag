import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
	selector: 'app-searchable-campaigns-dropdown',
	templateUrl: './searchable-campaigns-dropdown.component.html',
	styleUrls: ['./searchable-campaigns-dropdown.component.scss']
})
export class SearchableCampaignsDropdownComponent implements OnInit {
	@Input() mainDropDownOptions: any;
	@Input() selectedValue: any;
	@Input() placeholder: any;
	@Input() isMultiStateOption = false;
	@Input() isFromCsAdmin = false;
	@Input() headerText = null;
	@Input() isMandatory = false;
	@Input() isOptionSelected = false;
	@Input() isEditable = true;
	@Input() isFromSoloEditAdmin = false;

	@Input() set dropListChanged(value) {
		this.mainDropDownOptions = value;
		this.dropdownLists = value;
	}

	@Output() optionSelected = new EventEmitter<string>();
	searchKeyValue: string;
	dropdownLists;

	constructor() {}

	ngOnInit() {
		this.dropdownLists = this.mainDropDownOptions;
	}

	searchList(keyValue: string) {
		this.searchKeyValue = keyValue;
		this.dropdownLists = [];
		if (keyValue) {
			for (let i = 0; i < this.mainDropDownOptions.length; i++) {
				let selectedValue;
				if (this.isMultiStateOption) {
					selectedValue = this.mainDropDownOptions[i]['name'];
				} else if (this.isOptionSelected) {
					selectedValue = this.mainDropDownOptions[i]['fullname'];
				} else {
					selectedValue = this.mainDropDownOptions[i]['campaignName'];
				}
				if (selectedValue.toLowerCase().includes(keyValue.toLowerCase())) {
					this.dropdownLists.push(this.mainDropDownOptions[i]);
				}
			}
		} else {
			this.dropdownLists = this.mainDropDownOptions;
		}
	}

	selectedOption(value: any) {
		if (this.isMultiStateOption) {
			this.selectedValue = value['name'];
		} else if (this.isOptionSelected) {
			this.selectedValue = value['fullname'];
		} else {
			this.selectedValue = value['campaignName'];
		}
		this.optionSelected.emit(value);
	}
}
