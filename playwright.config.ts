import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
	//Global Setup
	//globalSetup: require.resolve(`./global-setup`),

	// Look for test files in the "tests" directory, relative to this configuration file
	testDir: 'playwright/e2e',

	// Limit the number of workers to maximum 4
	workers: 1,

	// Each test is given 120 seconds
	timeout: 120000,

	//number of retries if test case fails
	retries: 0,

	preserveOutput: 'failures-only',

	reporter: 'dot',

	projects: [
		{
			name: `Chrome`,

			// Configure browser and context here
			use: {
				// Configure the browser to use.
				browserName: `chromium`,

				//Chrome Browser Config
				channel: `chrome`,

				//Base url from user
				baseURL: 'https://localhost:4200',

				//Browser mode
				headless: true,

				//Browser height and width
				viewport: {width: 1366, height: 768},
				ignoreHTTPSErrors: true,

				//Enable File Downloads in Chrome
				acceptDownloads: true,

				//Artifacts
				screenshot: `only-on-failure`,
				video: `retain-on-failure`,
				trace: `retain-on-failure`,

				//Slows down execution by ms
				launchOptions: {
					slowMo: 0
				}
			}
		}
	]
};
export default config;
