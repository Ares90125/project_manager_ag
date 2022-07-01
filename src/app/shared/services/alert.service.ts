import {Injectable} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {AlertTypeEnum} from 'src/app/shared/enums/alert-type.enum';
import {AlertModel} from '../models/alert.model';

@Injectable({
	providedIn: 'root'
})
export class AlertService {
	private readonly subject = new Subject<AlertModel>();
	private keepAfterRouteChange = false;

	constructor(private readonly router: Router) {
		router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				if (this.keepAfterRouteChange) {
					this.keepAfterRouteChange = false;
				} else {
					this.clear();
				}
			}
		});
	}

	getAlert(): Observable<any> {
		return this.subject.asObservable();
	}

	error(title: string, message: string, autoHide: number = 10000, keepAfterRouteChange: boolean = false): void {
		this.alert(AlertTypeEnum.Error, title, message, autoHide, keepAfterRouteChange);
	}

	warning(title: string, message: string, autoHide: number = 10000, keepAfterRouteChange: boolean = false): void {
		this.alert(AlertTypeEnum.Warning, title, message, autoHide, keepAfterRouteChange);
	}

	info(title: string, message: string, autoHide: number = 5000, keepAfterRouteChange: boolean = false): void {
		this.alert(AlertTypeEnum.Info, title, message, autoHide, keepAfterRouteChange);
	}

	success(title: string, message: string, autoHide: number = 5000, keepAfterRouteChange: boolean = false): void {
		this.alert(AlertTypeEnum.Success, message, title, autoHide, keepAfterRouteChange);
	}

	private alert(
		type: AlertTypeEnum,
		title: string,
		message: string,
		autoHide: number,
		keepAfterRouteChange: boolean = false
	): void {
		this.keepAfterRouteChange = keepAfterRouteChange;
		this.subject.next({
			title: title,
			type: type,
			message: message,
			autoHide: autoHide,
			keepAfterRouteChange: keepAfterRouteChange
		});
	}

	clear(): void {
		this.subject.next();
	}
}
