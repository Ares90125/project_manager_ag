///<reference types="playwright" />
import {BrowserContext} from 'playwright';

const playwright = require('playwright');
const {kidsNutritionGroupAdmin} = require(`./playwright/utils/credentials`);
const axios = require('axios');
const lighthouse = require('lighthouse');
var Analytics = require('analytics-node');

var analytics = new Analytics('iFQhnL5Yr3BBTsNK03lFqq2ZBTu6dpXX');

const LOGS_URL = `https://api.convosight.com/v1/logs/`;
const AUDIT_URL = `https://develop.convosight.com`;
const PORT = 9222;
const pages = [
	{
		pageName: `GA - Convosight Landing Page`,
		pageUrl: AUDIT_URL
	},
	{
		pageName: `Group Admin Manage Groups`,
		pageUrl: `${AUDIT_URL}/app/group-admin/manage`
	},
	{
		pageName: `Overview`,
		pageUrl: `${AUDIT_URL}/app/group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2#overview`
	},
	{
		pageName: `GA - Schedule Posts Post Analytics`,
		pageUrl: `${AUDIT_URL}/app/group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2#postanalytics`
	},
	{
		pageName: `GA - Schedule Posts`,
		pageUrl: `${AUDIT_URL}/app/group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2#scheduledposts`
	},
	{
		pageName: `GA - Keywords Alerts Landing`,
		pageUrl: `${AUDIT_URL}/app/group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2#urgentAlerts`
	},
	{
		pageName: `GA - Conversation Trends`,
		pageUrl: `${AUDIT_URL}/app/group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2#conversationtrends7days`
	}
];

export interface AuditLogs {
	page_name: string;
	page_url: string;
	performance: number;
	pwa: number;
	best_practices: number;
}

const uploadLogs = async (url: string, data: AuditLogs) => {
	return await axios.post(url, {
		message: `Performance logs`,
		environment: 'development',
		logSource: 'Page Performance Tests',
		level: 'INFO',
		createdAtUTC: new Date().toISOString(),
		logCategory: 'applogs',
		callerTypeName: 'LightHouse Spec',
		callerMethodName: `${data.page_name}`,
		metainfo: data
	});
};

const loginAndSaveSession = async (url: string, context: BrowserContext, username: string, password: string) => {
	const page = await context.newPage();
	await page.goto(url, {waitUntil: 'networkidle'});
	await page.waitForSelector(`#email`);
	await page.fill(`#email`, username);
	await page.fill(`#pass`, password);
	await page.click(`#loginbutton`);
	await page.waitForSelector(`button.linker`, {timeout: 45000});
	return {
		storage: await context.storageState(),
		sessionStorage: await page.evaluate(() => sessionStorage)
	};
};

const compare = (thresholds, newValue) => {
	const errors = [];
	const results = [];

	Object.keys(thresholds).forEach(key => {
		if (thresholds[key] > newValue[key]) {
			errors.push(`${key} record is ${newValue[key]} and is under the ${thresholds[key]} threshold`);
		} else {
			results.push(`${key} record is ${newValue[key]} and desired threshold was ${thresholds[key]}`);
		}
	});

	return {errors, results};
};

const lighthouseFlagOptions = {
	logLevel: `info`,
	port: PORT
};

const lighthouseConfig = {
	extends: 'lighthouse:default',
	settings: {
		maxWaitForFcp: 15 * 1000,
		maxWaitForLoad: 35 * 1000,
		onlyCategories: [`performance`, `pwa`, `best-practices`]
	}
};

(async () => {
	const browser = await playwright['chromium'].launch({
		args: [`--remote-debugging-port=${PORT}`]
	});
	const context = await browser.newContext();
	const {storage, sessionStorage} = await loginAndSaveSession(
		`${AUDIT_URL}/app/login-response/`,
		context,
		kidsNutritionGroupAdmin.username,
		kidsNutritionGroupAdmin.password
	);
	await context.close();
	try {
		const context = await browser.newContext({storage});
		await context.addInitScript(() => {
			Object.keys(sessionStorage).forEach(key => {
				window.sessionStorage.setItem(key, sessionStorage[key]);
			});
		}, sessionStorage);
		for await (const {pageName, pageUrl} of pages) {
			console.log(`results generating for ${pageUrl}`);
			const {
				lhr: {categories}
			} = await lighthouse(pageUrl, lighthouseFlagOptions, lighthouseConfig);
			const audit = {
				page_name: pageName,
				page_url: pageUrl,
				performance: Math.round(categories.performance.score * 100),
				best_practices: Math.round(categories[`best-practices`].score * 100),
				pwa: Math.round(categories.pwa.score * 100)
			};
			console.log(audit);
			await uploadLogs(LOGS_URL, audit);
			// AnonymousId will be same otherwise it will add up in MTU cost in segment
			await analytics.track({
				anonymousId: 'lighthouse-2b867afe-fd38-401d-88b8-8a47ff8d76e2',
				event: 'lighthouse_log',
				properties: {
					...audit
				}
			});
			console.log(`Logs uploaded for ${pageName}`);
		}
	} catch (err) {
		console.log(err);
	}
	await browser.close();
})();
