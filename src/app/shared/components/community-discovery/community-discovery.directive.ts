import {Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {fromEvent, pipe, Subject} from 'rxjs';
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: 'table[rangeSelection]'
})
export class CommunityDiscoveryDirective implements OnDestroy, OnInit {
	@Input() selectionClass = 'state--selected';

	@Output() rangeChanged = new EventEmitter();

	selectedRange = new Set<HTMLTableCellElement>();

	private readonly table: HTMLTableElement;

	private startCell: HTMLTableCellElement = null;

	private cellIndices = new Map<HTMLTableCellElement, {row: number; column: number}>();

	private selecting: boolean;

	private destroy$ = new Subject<void>();

	constructor(private zone: NgZone, {nativeElement}: ElementRef<HTMLTableElement>) {
		this.table = nativeElement;
	}

	emitChanges() {
		const cells = Array.from(this.selectedRange).map(cell => {
			const rowId = (cell.parentNode as Element).id;

			return {
				cell,
				rowId
			};
		});

		this.zone.run(() => {
			this.rangeChanged.emit(cells);
		});
	}

	ngOnInit() {
		this.zone.runOutsideAngular(() => this.initListeners());
	}

	private initListeners() {
		const withCell = pipe(
			map((event: MouseEvent) => ({
				event,
				cell: (event.target as HTMLElement).closest<HTMLTableCellElement>('mat-header-cell,td')
			})),
			filter(({cell}) => !!cell)
		);
		const mouseDown$ = fromEvent<MouseEvent>(this.table, 'mousedown').pipe(
			filter(event => event.button === 0),
			withCell,
			tap(this.startSelection)
		);
		const mouseOver$ = fromEvent<MouseEvent>(this.table, 'mouseover');
		const mouseUp$ = fromEvent(document, 'mouseup').pipe(tap(() => (this.selecting = false)));
		this.handleOutsideClick();

		mouseDown$
			.pipe(
				switchMap(() => mouseOver$.pipe(takeUntil(mouseUp$))),
				takeUntil(this.destroy$),
				withCell
			)
			.subscribe(this.select);
	}

	private handleOutsideClick() {
		fromEvent(document, 'mouseup')
			.pipe(takeUntil(this.destroy$))
			.subscribe((event: any) => {
				if (!this.selecting && !this.table.contains(event.target as HTMLElement)) {
					this.clearCells();
					this.emitChanges();
				}
			});
	}

	private startSelection = ({cell, event}: {event: MouseEvent; cell: HTMLTableCellElement}) => {
		this.updateCellIndices();
		if (!event.ctrlKey && !event.shiftKey) {
			this.clearCells();
		}

		if (event.shiftKey) {
			this.select({cell});
		}

		this.selecting = true;
		this.startCell = cell;

		if (!event.shiftKey) {
			if (this.selectedRange.has(cell)) {
				this.selectedRange.delete(cell);
			} else {
				this.selectedRange.add(cell);
			}
			this.emitChanges();
			if (cell.parentElement.classList.contains(this.selectionClass)) {
				cell.parentElement.classList.remove(this.selectionClass);
			} else {
				cell.parentElement.classList.add(this.selectionClass);
			}
		}
	};

	private select = ({cell}: {cell: HTMLTableCellElement}) => {
		this.clearCells();
		this.getCellsBetween(this.startCell, cell).forEach(item => {
			this.selectedRange.add(item);
			item.parentElement.classList.add(this.selectionClass);
		});
		this.emitChanges();
	};

	private clearCells() {
		Array.from(this.selectedRange).forEach(cell => {
			cell.parentElement.classList.remove(this.selectionClass);
		});
		this.selectedRange.clear();
	}

	private getCellsBetween(start: HTMLTableCellElement, end: HTMLTableCellElement) {
		const startCoords = this.cellIndices.get(start);
		const endCoords = this.cellIndices.get(end);
		const boundaries = {
			top: Math.min(startCoords.row, endCoords.row),
			right: Math.max(startCoords.column + start.colSpan - 1, endCoords.column + end.colSpan - 1),
			bottom: Math.max(startCoords.row + start.rowSpan - 1, endCoords.row + end.rowSpan - 1),
			left: Math.min(startCoords.column, endCoords.column)
		};

		const cells = [];

		iterateCells(this.table, cell => {
			const {column, row} = this.cellIndices.get(cell);
			if (
				column >= boundaries.left &&
				column <= boundaries.right &&
				row >= boundaries.top &&
				row <= boundaries.bottom
			) {
				cells.push(cell);
			}
		});
		return cells;
	}

	private updateCellIndices() {
		this.cellIndices.clear();
		const matrix = [];
		iterateCells(this.table, (cell, y, x) => {
			for (; matrix[y] && matrix[y][x]; x++) {}
			for (let spanX = x; spanX < x + cell.colSpan; spanX++) {
				for (let spanY = y; spanY < y + cell.rowSpan; spanY++) {
					(matrix[spanY] = matrix[spanY] || [])[spanX] = 1;
				}
			}
			this.cellIndices.set(cell, {row: y, column: x});
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
	}
}

function iterateCells(
	table: HTMLTableElement,
	callback: (cell: HTMLTableCellElement, y: number, x: number) => void
): void {
	for (let y = 0; y < table.rows.length; y++) {
		for (let x = 0; x < table.rows[y].cells.length; x++) {
			callback(table.rows[y].cells[x], y, x);
		}
	}
}
