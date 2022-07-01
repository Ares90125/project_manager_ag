import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import Amplify from '@aws-amplify/core';
import * as Sentry from '@sentry/browser';
import {Integrations as TracingIntegrations} from '@sentry/tracing';
import {routingInstrumentation} from '@sentry/angular';

if (environment.production) {
	enableProdMode();
	Sentry.init({
		dsn: environment.sentryIOUrl,
		integrations: [
			new TracingIntegrations.BrowserTracing({
				tracingOrigins: ['localhost'],
				routingInstrumentation: routingInstrumentation
			})
		],
		tracesSampleRate: 0.6,
		release: environment.releaseVersion,
		environment: environment.envName
	});
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.error(err));

Amplify.configure(environment.amplifyConfiguration);
