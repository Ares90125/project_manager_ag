import {BrowserContext, Page} from 'playwright';

import {Window} from 'happy-dom';

const token = process.env.APP_TOKEN;
const MailosaurClient = require('mailosaur');
const client = new MailosaurClient('pTei1Musx2GPNFZ');

export const SERVER = 'mtf8kzil';

export async function watchModeOn(page: Page) {
	page.on('pageerror', exception => {
		console.log(`Uncaught exception: "${exception}"`);
	});
	page.on('console', msg => {
		// Handle only errors.
		if (msg.type() !== 'error') return;
		console.log(`text: "${msg.text()}"`);
	});
	page.on('request', error => {
		console.log(error);
	});

	page.on(`response`, response => {
		// @ts-ignore
		if (response.json().error) console.log(response.json());
	});
}

export async function getOTPFromEmail(email: string): Promise<string> {
	const message: any = await getEmail(`OTP for Convosight`, email);
	const window = new Window();
	const document = window.document;
	document.body.innerHTML = message.html.body;
	const el = document.querySelector('div > div:nth-child(5)');
	return el.textContent;
}

export async function generateEmail(): Promise<string> {
	return await client.servers.generateEmailAddress(SERVER);
}

export async function getEmail(subject: string, email: string) {
	return await client.messages.get(
		SERVER,
		{
			sentTo: `${email}`,
			subject: `${subject}`
		},
		{
			timeout: 50000
		}
	);
}

export async function fbTokenExpiry(path: string, data, routeUrl: string, page, context) {
	await page.route(routeUrl, async (route, request) => {
		let requestBody = request.postData();
		if (requestBody.includes(path)) {
			console.log(`request found`);
			await route.fulfill({
				status: 200,
				body: JSON.stringify(data),
				headers: {
					'access-control-allow-origin': '*'
				}
			});
			console.log(`response stubbed with : `, data);
			try {
				await page.unroute(routeUrl);
			} catch (err) {
				console.log(err);
			}
		} else {
			route.continue();
			console.log(`query not found`);
		}
	});
}

export const wait = async () => {
	return new Promise(resolve => {
		let random4DigitNumber = Math.floor(1000 + Math.random() * 3000);
		setTimeout(resolve, random4DigitNumber);
	});
};
