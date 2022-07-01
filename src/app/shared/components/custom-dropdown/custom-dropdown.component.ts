import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {UtilityService} from '@sharedModule/services/utility.service';

@Component({
	selector: 'app-custom-dropdown',
	templateUrl: './custom-dropdown.component.html',
	styleUrls: ['./custom-dropdown.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CustomDropdownComponent),
			multi: true
		}
	]
})
export class CustomDropdownComponent implements ControlValueAccessor {
	@Input() items: any;
	@Input() defaultText = 'Select Item';
	@Input() isMultipleSelection = false;
	@Input() selectedItems = [];
	@Input() isDefaultSelection = false;
	@Input() value = '';
	@Input() isCampaignReport = false;
	@Input() isDisabled: boolean = false;
	@Input() type;
	@Input() isOptionSelected;
	@Input() isCurrency;
	@Input() isEditable = true;
	@Input() toReturnObject = false;
	@Input() preventChange: boolean = false;
	@Output() selectionChange = new EventEmitter<any>();

	public searchParam = '';

	private onChange;

	constructor(private utilityService: UtilityService) {}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	writeValue(value: any): void {
		this.value = value;
	}

	selectItem(item): void {
		if (!this.isMultipleSelection) {
			this.selectionChange.emit(item);
			if (this.isOptionSelected && this.type !== 'soloEditPayments') {
				this.value = this.utilityService.currencyToShow(item);
			} else {
				if (!this.preventChange) {
					this.value = item;
					this.onChange(item);
				}
			}
			//  else {
			// 	this.value = item;
			// 	this.onChange(item);
			// }
		}
	}

	onMultipleSelect(item, event): void {
		if (item) {
			item['isSelected'] = event.checked;
			this.selectedItems = this.items.filter(item => item['isSelected'] === true);
		}
		this.selectionChange.emit(this.selectedItems);
		this.value = this.selectedItems?.length > 0 ? this.selectedItems?.[0]?.name : '';
	}

	onSearch(value) {
		if (this.isCampaignReport) {
			const searchedValue = value?.toLowerCase();
			this.items.forEach(item => {
				item.hide = item?.name?.toLowerCase().indexOf(searchedValue) < 0;
			});
		}
	}
}
