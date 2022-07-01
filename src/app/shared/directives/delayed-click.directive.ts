import {Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject, Subscription} from 'rxjs';

import {debounceTime} from 'rxjs/operators';

@Directive({
	selector: '[appDelayClick]'
})
export class DelayClickDirective implements OnInit, OnDestroy {
	@Input() debounceTime = 500;
	@Output() delayedClick = new EventEmitter();
	private clicks = new Subject();
	private subscription: Subscription;

	constructor() {}

	ngOnInit() {
		this.subscription = this.clicks.pipe(debounceTime(this.debounceTime)).subscribe(e => this.delayedClick.emit(e));
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	@HostListener('click', ['$event'])
	clickEvent(event) {
		event.preventDefault();
		event.stopPropagation();
		this.clicks.next(event);
	}
}
