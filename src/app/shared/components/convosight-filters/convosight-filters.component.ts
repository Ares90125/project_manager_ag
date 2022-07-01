import {Component, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../base.component';

@Component({
	selector: 'app-convosight-filters',
	templateUrl: './convosight-filters.component.html',
	styleUrls: ['./convosight-filters.component.scss']
})
export class ConvosightFiltersComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() filters;
	@Input() headerText: string;
	@Input() isConversationFilters = false;
	@Input() fromCsAdmin = false;
	@Output() filterChanged = new EventEmitter<any>();
	selectedItems = [];

	constructor(injector: Injector) {
		super(injector);
	}

	@HostListener('window:setFilters', ['$event.detail'])
	setFilters(value) {
		this.filters = value;
		this.getSelectedItems();
	}

	ngOnInit() {
		this.getSelectedItems();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	getListOfEachFilters(filterList) {
		return Object.keys(filterList);
	}

	addOrRemoveItemFromListItemsOfMultipleSelection(listItem) {
		listItem.isSelected = !listItem.isSelected;
		this.emitFilters();
	}

	recordClickEvent(element, buttonLabel) {
		if (this.isConversationFilters) {
			this.recordButtonClick(element, null, buttonLabel);
		}
	}

	addOrRemoveItemFromListItemsOfSingleSelection(listItem, filter) {
		if (!listItem.isSelected) {
			filter.list.forEach(item => {
				item.isSelected = false;
			});
			listItem.isSelected = !listItem.isSelected;
			this.emitFilters();
		}
	}

	removeItemFromSelectedList(listItem) {
		const selectedFilter = this.filters.filter(filter => filter.displayName === listItem.filterName);
		selectedFilter[0].list.forEach(item => {
			if (listItem.name === item.name) {
				item.isSelected = !item.isSelected;
			}
		});
		this.emitFilters();
	}

	getSelectedItems() {
		this.selectedItems = [];
		this.filters.forEach(filter => {
			filter.list.forEach(item => {
				if (item.isSelected) {
					this.selectedItems.push({
						name: item.name,
						filterName: filter.displayName,
						displayName: item.displayName,
						isHide: item.isHide
					});
				}
			});
		});
	}

	emitFilters() {
		this.getSelectedItems();
		this.filterChanged.emit(this.filters);
	}
}
