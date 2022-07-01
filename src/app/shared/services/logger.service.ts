import {Injectable, Injector} from '@angular/core';
import * as Sentry from '@sentry/browser';
import * as _ from 'lodash';
import {LoggerCategory, LoggerLevel} from 'src/app/shared/enums/logger-level.enum';
import {environment} from '../../../environments/environment';
import {BackendService} from './backend.service';
import {AppService} from './app.service';
import {SecuredStorageProviderService} from './secured-storage-provider.service';
import userflow from 'userflow.js';
import {getCLS, getFID, getLCP} from 'web-vitals';
import {DateTime} from '@sharedModule/models/date-time';
import {CoreVitalModel} from '@sharedModule/models/core-vital.model';

declare var window: any;

@Injectable({
	providedIn: 'root'
})
export class LoggerService {
	public pageName: string;
	public pageUrl: string;
	private _isInitialized = false;
	private isRemoteLoggingEnabled = false;
	public queryString: any = {};
	private _logsArray = [];
	private _flushTimer = null;
	public isNewUser: boolean = false;
	private user_id: string;
	private backendService: BackendService;
	private appService: AppService;
	private securedStorage: SecuredStorageProviderService;
	public webCoreVitalObj: CoreVitalModel = {};

	constructor(private readonly injector: Injector) {}

	public init(): void {
		if (this._isInitialized) {
			return;
		}

		this._isInitialized = true;

		this.backendService = this.injector.get(BackendService);
		this.appService = this.injector.get(AppService);
		this.securedStorage = this.injector.get(SecuredStorageProviderService);
		if (environment.envName !== 'local') {
			this.configure();
			this.isRemoteLoggingEnabled = true;
			this.trackWebCoreVital();
		}
		this.appService.currentPageName.subscribe(pageName => {
			if (pageName) {
				this.pageName = pageName;
			}
		});

		this.appService.currentPageUrl.subscribe(pageUrl => {
			if (pageUrl) {
				this.pageUrl = pageUrl;
			}
		});

		try {
			this.queryString = JSON.parse(this.securedStorage.getSessionStorage('queryString'));
		} catch (e) {}

		this._flushTimer = setTimeout(() => this.flushLogsArray(), 3000);
	}

	public trackWebCoreVital() {
		if (!!window.navigator.connection) {
			this.webCoreVitalObj['effective_type'] = window.navigator.connection.effectiveType;
			this.webCoreVitalObj['downlink'] = window.navigator.connection.downlink;
		}
		getCLS(metric => {
			this.webCoreVitalObj['CLS'] = metric.value;
			this.recordCoreVitals();
		});
		getFID(metric => {
			this.webCoreVitalObj['FID'] = metric.value;
			this.recordCoreVitals();
		});
		getLCP(metric => {
			this.webCoreVitalObj['LCP'] = metric.value;
			this.recordCoreVitals();
		});
	}

	public setUserId(userId: string): void {
		this.user_id = userId;
		if (!this.isRemoteLoggingEnabled) {
			return;
		}

		try {
			if (!!userflow) {
				userflow.identify(userId);
			}

			if (!!window.analytics) {
				window.analytics.identify(userId);
			}

			Sentry.configureScope(scope => scope.setUser({id: userId}));

			if (!!window.fcWidget) {
				window.fcWidget.setExternalId(userId);
			}
		} catch (e) {
			this.warn(e, 'Error in identifying the user', {userId}, 'LoggerService', 'setUser', LoggerCategory.AppLogs);
		}
	}

	public setUserProperty(userId: string, userProperty): void {
		if (!this.isRemoteLoggingEnabled) {
			return;
		}
		try {
			if (!!window.analytics) {
				window.analytics.identify(userId, userProperty);
			}

			Sentry.configureScope(scope => scope.setUser(userProperty));
			if (!!userflow) {
				userflow.identify(userId, userProperty);
			}

			if (!!window.fcWidget) {
				window.fcWidget.user.setProperties(userProperty);
			}
		} catch (e) {
			this.warn(e, 'Error while updating the attributes of the user', {userId}, 'LoggerService', 'setUserProperties');
		}
	}

	public setFreshchatAndUpscodeNameAndEmail(userId, firstName, lastName, email) {
		if (!this.isRemoteLoggingEnabled) {
			return;
		}

		if (!!window.fcWidget) {
			window.fcWidget.user.setFirstName(firstName);
			window.fcWidget.user.setLastName(lastName);
			window.fcWidget.user.setEmail(email);
		}
	}

	public trackPage(pageName, data) {
		try {
			if (!this.isRemoteLoggingEnabled && !window.cypressTrackEvent) {
				return;
			}

			if (this.securedStorage.getSessionStorage('queryString')) {
				Object.assign(data, JSON.parse(this.securedStorage.getSessionStorage('queryString')));
			}

			if (!!window.analytics || window.cypressTrackEvent) {
				window.analytics.page(pageName, data);
				this.info('page_loaded', data, 'LoggerService', 'trackPage', LoggerCategory.ClickStream);
			}
		} catch (e) {
			this.warn(e, 'Error while Page load event', {userId: this.user_id ? this.user_id : null}, 'LoggerService', 'log');
		}
	}

	public recordCoreVitals() {
		if (this.webCoreVitalObj.FID && this.webCoreVitalObj.LCP) {
			this.info(
				'web_core_vital',
				{
					...this.webCoreVitalObj,
					page_name: this.pageName,
					page_url: this.pageUrl
				},
				'LoggerService',
				'recordCoreVitals'
			);
		}
	}

	public info(
		msg: string,
		data: object = null,
		callerTypeName: string = null,
		callerMethodName: string = null,
		category: LoggerCategory = LoggerCategory.AppLogs
	): void {
		try {
			this.log(null, msg, LoggerLevel.Info, data, callerTypeName, callerMethodName, category);
		} catch {}
	}

	public error(
		err: any,
		msg: string,
		data: object = null,
		callerTypeName: string = null,
		callerMethodName: string = null,
		category: LoggerCategory = LoggerCategory.AppLogs
	): void {
		try {
			this.log(err, msg, LoggerLevel.Error, data, callerTypeName, callerMethodName, category);
		} catch {}
	}

	public debug(
		msg: string,
		data: object = null,
		callerTypeName: string = null,
		callerMethodName: string = null,
		category: LoggerCategory = LoggerCategory.AppLogs
	): void {
		try {
			this.log(null, msg, LoggerLevel.Debug, data, callerTypeName, callerMethodName, category);
		} catch {}
	}

	public warn(
		err: any,
		msg: string,
		data: object = null,
		callerTypeName: string = null,
		callerMethodName: string = null,
		category: LoggerCategory = LoggerCategory.AppLogs
	): void {
		try {
			this.log(err, msg, LoggerLevel.Warn, data, callerTypeName, callerMethodName, category);
		} catch {}
	}

	public critical(
		err: any,
		msg: string,
		data: object = null,
		callerTypeName: string = null,
		callerMethodName: string = null,
		category: LoggerCategory = LoggerCategory.AppLogs
	): void {
		try {
			this.log(err, msg, LoggerLevel.Critical, data, callerTypeName, callerMethodName, category);
		} catch {}
	}

	public flushLogsArray() {
		this.resetFlushTimer();
		if (this._logsArray.length === 0) {
			return;
		}

		const logsToBePushed = [...this._logsArray];
		this._logsArray = [];
		try {
			this.backendService.postLogsToAPI(JSON.stringify(logsToBePushed));
		} catch {
			this._logsArray = logsToBePushed.concat(...this._logsArray);
		}
	}

	private log(
		error: any,
		msg: string,
		level: LoggerLevel,
		data: object,
		callerTypeName: string,
		callerMethodName: string,
		logCategory: LoggerCategory
	): void {
		if (!this._isInitialized) {
			return;
		}

		const metadata: any = {};

		if (data !== null) {
			metadata['data'] = _.cloneDeep(data);
		} else {
			metadata['data'] = {};
		}

		if (this.pageUrl) {
			metadata['page_url'] = this.pageUrl;
		}

		if (this.pageName) {
			metadata['data']['page_name'] = this.pageName;
		}

		metadata['data']['is_new_user'] = this.isNewUser;
		metadata['data']['skip_email'] = false;

		if (window.matchMedia('(display-mode: standalone)').matches) {
			metadata['data']['application_platform'] = 'PWA';
		} else {
			metadata['data']['application_platform'] = 'Website';
		}

		if (this.securedStorage.getSessionStorage('queryString')) {
			try {
				const query = JSON.parse(this.securedStorage.getSessionStorage('queryString'));

				// remove the fcmtokens from going to logs for security
				if (query && query['qs_fcm_token']) {
					delete query['qs_fcm_token'];
				}
				if ((query && query.qs_platform === 'android') || query.qs_platform === 'ios') {
					metadata['data']['application_platform'] = 'Android';
				}
				metadata['data'] = Object.assign(metadata.data, query);
			} catch (e) {
				this.warn(
					e,
					'Error while updating querystring',
					{userId: this.user_id ? this.user_id : null},
					'LoggerService',
					'log'
				);
			}
		}

		if (this.user_id) {
			metadata['user_id'] = this.user_id;
		}

		if (this.appService.getCurrentFormFactor()) {
			metadata['data']['device_form_factor'] = this.appService.getCurrentFormFactor();
		}

		if (window.convosight.sessionId) {
			metadata['sessionId'] = window.convosight.sessionId;
		}

		if (window.convosight.analyticsId) {
			metadata['analyticsId'] = window.convosight.analyticsId;
		}

		if (environment.releaseVersion) {
			metadata['releaseVersion'] = environment.releaseVersion;
		}

		if (metadata['token']) {
			delete metadata['token'];
		}

		const logEntry = {
			message: msg,
			level: level.toString().toLowerCase(),
			data: metadata
		};

		if (!this.isRemoteLoggingEnabled && !window.cypressTrackEvent) {
			level === LoggerLevel.Error ? console.error(JSON.stringify(logEntry)) : console.log(JSON.stringify(logEntry));
			return;
		}

		if (level === LoggerLevel.Info) {
			if (!!window.analytics || window.cypressTrackEvent) {
				window.analytics.track(msg, metadata.data);
			}
			if (!!userflow) {
				// Userflow exceed 60req/min due to dual page event (1.page_loaded - from us 2.Page Viewed - from userflow) which result in sentry issue. Skiping our custom event page_loaded from userflow to fix the issue
				if (userflow.isIdentified() && msg !== 'page_loaded') {
					userflow.track(msg, metadata.data);
				}
			}
			if (!!window.fcWidget) {
				window.fcWidget.track(msg, metadata.data);
			}
		}

		this.sendToLogs(callerTypeName, callerMethodName, level, logCategory, msg, metadata);

		Sentry.addBreadcrumb({message: logEntry.message, data: logEntry.data});

		if (level === 'Error' || level === 'Warn' || level === 'Critical') {
			Sentry.captureException(error);
		}
	}

	private sendToLogs(
		callerTypeName: string,
		callerMethodName: string,
		level: LoggerLevel,
		logCategory: LoggerCategory,
		message: string,
		metainfo: object
	) {
		const logData = {
			logSource: 'WebClient',
			callerTypeName: callerTypeName,
			callerMethodName: callerMethodName,
			level: level,
			logCategory: logCategory,
			createdAtUTC: `${new DateTime().toISOString()}`,
			message: message,
			metainfo: metainfo,
			environment: environment.envNameForLog
		};

		if (callerTypeName === 'HttpInterceptors') {
			return;
		}

		this.resetFlushTimer();
		this._logsArray.push(logData);

		const _logsArrayLength = this._logsArray.length;

		if (_logsArrayLength < 6) {
			return;
		}

		const _logToBePosted = _logsArrayLength > 25 ? [...this._logsArray.splice(0, 25)] : [...this._logsArray.splice(0)];
		try {
			this.backendService.postLogsToAPI(JSON.stringify(_logToBePosted));
		} catch (e) {
			if (navigator.onLine) {
				const error = new Error(`${e.message} error in post call to bulk log api`);
				this.error(error, 'Post call to logs api failed', {}, 'LoggerService', 'sendToLogs');
			}
			this._logsArray = _logToBePosted.concat(...this._logsArray);
		}
	}

	private resetFlushTimer() {
		clearTimeout(this._flushTimer);
		this._flushTimer = setTimeout(() => this.flushLogsArray(), 3000);
	}

	private configure(): void {
		if (!!userflow) {
			userflow.init(environment.userflowToken);
		}
	}

	resetAnalytics() {
		if (!!window.analytics) {
			window.analytics.reset();
		}
	}
}
