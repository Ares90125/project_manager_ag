import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {LoggerService} from '@sharedModule/services/logger.service';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {environment} from '../../environments/environment';

@Injectable()
export class HttpInterceptors implements HttpInterceptor {
	private loggerService: LoggerService;
	private securedStorageProvider: SecuredStorageProviderService;

	constructor(private readonly injector: Injector) {}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.loggerService = this.injector.get<LoggerService>(LoggerService);
		this.securedStorageProvider = this.injector.get<SecuredStorageProviderService>(SecuredStorageProviderService);
		let headers = request.headers.keys().length > 0 ? request.headers : new HttpHeaders();
		headers = headers.append('Content-Type', 'application/json');
		request = request.clone({headers: headers});
		const started = Date.now();
		let ok: string;

		return next.handle(request).pipe(
			tap(
				// Succeeds when there is a response; ignore other events
				event => (ok = event instanceof HttpResponse ? 'succeeded' : ''),
				// Operation failed; error is an HttpErrorResponse
				() => {
					ok = 'failed';
				}
			),
			// Log when response observable either completes or errors
			finalize(() => {
				if (request.url === environment.logApiUrl) {
					return;
				}

				const elapsed = Date.now() - started;
				const msg = `${request.method} "${request.urlWithParams}" ${ok} in ${elapsed} ms.`;
				try {
					// this.loggerService.info(msg, request, 'HttpInterceptors', 'intercept');
				} catch (e) {
					throw new Error('Error while logging the intercepted api call');
				}
			})
		);
	}
}
