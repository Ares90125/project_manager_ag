import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {DefaultTreeviewI18n, TreeviewConfig, TreeviewHelper, TreeviewI18n, TreeviewItem} from 'ngx-treeview';

@Component({
	selector: 'app-dropdown',
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.scss'],
	providers: [
		{
			provide: TreeviewI18n,
			useValue: Object.assign(new DefaultTreeviewI18n(), {
				getFilterPlaceholder(): string {
					return 'Search';
				}
			})
		}
	]
})
export class DropdownComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Input() optionsList;
	@Output() sendSelectedItems = new EventEmitter();
	@Input() setSelectedList;
	@Input() catSubCatObjList;
	@Input() categoryList;

	@Input() placeholder: string;

	dropdownEnabled = true;
	items: TreeviewItem[] = [];
	values: string[] = [];
	isOpen = false;
	config = TreeviewConfig.create({
		hasAllCheckBox: true,
		hasFilter: true,
		hasCollapseExpand: true,
		decoupleChildFromParent: false,
		maxHeight: 230
	});

	constructor(injector: Injector, private treeviewI18nDefault: TreeviewI18n) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
	}

	ngOnChanges(changes: SimpleChanges) {
		// only run when property "data" changed
		if (changes['setSelectedList']) {
			this.setSelection();
		}
		if (changes['optionsList']) {
			this.removeCheckList(this.optionsList);
		}
	}

	removeCheckList(options: TreeviewItem[]) {
		if (options.length > 0) {
			options.forEach(option => {
				option.checked = false;
				if (option['internalChildren']) {
					option['internalChildren'].forEach(optionchild => {
						optionchild.checked = false;
					});
				}
			});
			this.items = options;
		}
	}

	setSelection() {
		if (this.setSelectedList !== undefined && this.setSelectedList !== null) {
			if (this.setSelectedList.length > 0) {
				this.setSelectedList.forEach(selectedItem => {
					const foundChildItem = TreeviewHelper.findItemInList(this.items, selectedItem);
					if (foundChildItem !== undefined) {
						foundChildItem.checked = true;
						if (this.categoryList !== undefined && this.categoryList.length > 0) {
							this.changeParentSelection(selectedItem);
						}
					}
				});
			}
		}
	}

	changeParentSelection(selectedItem) {
		const parentItem = this.catSubCatObjList[selectedItem];
		if (this.categoryList.includes(parentItem)) {
			let allChildUnchecked = true;
			let allChildChecked = true;
			this.items.forEach(item => {
				if (item.value === parentItem) {
					if (item.children !== undefined && item.children.length > 0) {
						item.children.forEach(childItem => {
							if (childItem.checked) {
								allChildUnchecked = false;
							} else {
								allChildChecked = false;
							}
						});
					}
					if (allChildUnchecked) {
						item.checked = false;
					}
					if (allChildChecked) {
						item.checked = true;
					}
				}
			});
		}
	}

	onSelectedChange($event) {
		this.values = $event;
		this.setSelectedList = this.values;
		this.sendSelectedItems.emit(this.values);
	}

	toggleDropdown() {
		this.isOpen = !this.isOpen;
	}

	removeSelectedItem(row, index) {
		const foundChildItem = TreeviewHelper.findItemInList(this.items, row);
		foundChildItem.checked = false;
		this.setSelectedList.splice(this.setSelectedList.indexOf(row), 1);
		this.sendSelectedItems.emit(this.setSelectedList);
		if (this.categoryList !== undefined && this.categoryList.length > 0) {
			this.changeParentSelection(row);
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
