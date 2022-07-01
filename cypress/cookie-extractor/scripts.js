// @ts-check
const {chromium} = require('playwright');
module.exports = {
	ConvosightLoginWithGroups: async function (username, password, url) {
		let browser = await launchChromium();
		const context = await browser.newContext();
		const page = await context.newPage();
		await loginFacebook(page, username, password, url);
		await page.waitForSelector(`div.list-item.group-installed-wrap`, {timeout: 180000});
		const cookies = await context.cookies();
		const lsd = await getLocalStorageData(page);
		const ssd = await getSessionStorageData(page);
		await context.close();
		await browser.close();
		return {cookies, lsd, ssd};
	},

	ConvosightLoginNoGroups: async function (username, password, url) {
		let browser = await launchChromium();
		const context = await browser.newContext();
		const page = await context.newPage();
		await loginFacebook(page, username, password, url);
		await page.waitForSelector(`[data-cs-label="Yes"]`, {timeout: 180000});
		const cookies = await context.cookies();
		const lsd = await getLocalStorageData(page);
		const ssd = await getSessionStorageData(page);
		await context.close();
		await browser.close();
		return {cookies, lsd, ssd};
	},

	GetAuthToken: async function (username, password) {
		let browser = await launchChromium();
		const context = await browser.newContext();
		const page = await context.newPage();
		let header = ``;
		await page.on(`response`, response => {
			if (response.url().endsWith(`graphql`)) {
				console.log(`GraphQL url is ${response.url()}`);
				if (header === ``) header = response.request().headers().authorization;
			}
		});
		let timer = 0;
		await loginFacebook(page, username, password, 'https://localhost:4200/login-response');
		do {
			await wait(250);
			timer += 250;
		} while (header === `` || timer > 120000);
		await browser.close();
		return header;
	}
};

async function launchChromium() {
	return await chromium.launch({
		headless: true,
		ignoreDefaultArgs: ['--disable-extensions'],
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--ignore-certificate-errors',
			'--unsafely-treat-insecure-origin-as-secure=https://localhost:4200',
			'--disable-notifications'
		]
	});
}

async function loginFacebook(page, username, password, url) {
	if (!username || !password) {
		throw new Error('Username or Password missing for login');
	}
	await page.goto(url, {timeout: 120000});
	await page.waitForSelector(`#email`);
	await page.fill(`#email`, username);
	await page.fill(`#pass`, password);
	return await page.click(`#loginbutton`);
}

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

async function getLocalStorageData(page) {
	return await page.evaluate(() => {
		return Object.keys(localStorage).reduce(
			(items, curr) => ({
				...items,
				[curr]: localStorage.getItem(curr)
			}),
			{}
		);
	});
}

async function getSessionStorageData(page) {
	return page.evaluate(() => {
		return Object.keys(sessionStorage).reduce(
			(items, curr) => ({
				...items,
				[curr]: sessionStorage.getItem(curr)
			}),
			{}
		);
	});
}
