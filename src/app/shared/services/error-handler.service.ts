import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {NavigationError, Router} from '@angular/router';

import {LoggerService} from './logger.service';

declare var window: any;
@Injectable({
	providedIn: 'root'
})
export class ErrorsHandler implements ErrorHandler {
	constructor(private readonly injector: Injector) {}

	handleError(error: Error | HttpErrorResponse): void {
		const router = this.injector.get<Router>(Router);
		const loggerService = this.injector.get<LoggerService>(LoggerService);
		try {
			if (JSON.stringify(error).includes('ChunkLoadError') && !!window) {
				window.location.reload();
				return;
			}
		} catch {}

		if (error instanceof HttpErrorResponse) {
			if (!navigator.onLine) {
				return;
			} else {
				loggerService.error(error, 'Unhandled HttpErrorResponse error', {}, 'handleError', 'ErrorsHandler');
				router.navigate(['/']);
			}
		} else if (event instanceof NavigationError) {
			loggerService.error(
				error,
				'Unhandled Navigation Error Caught In ErrorHandler',
				{},
				'handleError',
				'ErrorsHandler'
			);
		} else {
			loggerService.error(error, 'Unhandled Error Caught In ErrorHandler', error, 'handleError', 'ErrorsHandler');
		}
	}
}
