import {BrowserContext, Page} from 'playwright';
import {getOTPFromEmail} from '../utils/testUtilities';

export default class SettingsPage {
	readonly page: Page;
	readonly context: BrowserContext;
	constructor(page: Page, context: BrowserContext) {
		this.page = page;
		this.context = context;
	}

	init = async () => {
		const url = 'https://localhost:4200/group-admin/settings#moderators';
		if (this.page.url() !== url)
			await this.page.waitForNavigation({
				url: url,
				timeout: 10000,
				waitUntil: 'domcontentloaded'
			});
	};

	completeEmailVerification = async (email: string): Promise<void> => {
		await this.page.waitForSelector(`[data-cs-label="Continue"]`);
		await (await this.page.$(`[data-test-id="txt-box-email-verification"]`)).click();
		await this.page.fill(`[data-test-id="txt-box-email-verification"]`, email);
		await this.page.click(`[data-cs-label="Continue"]`);
		await this.page.waitForSelector(`text='Please enter the OTP we have sent you on'`);
		const OTP = await (await getOTPFromEmail(email)).trim();
		console.log(OTP);
		let otp = Array.from(OTP);
		let otpElements = await this.page.$$(`li > input[type="text"]`);
		let i = 0;
		for await (let element of otpElements) {
			await element.fill(otp[i]);
			i++;
		}
		await this.page.waitForSelector(`[data-cs-id="527e5a9f-678f-4281-baeb-1295669ae6c2"]`);
		await this.page.click(`[data-cs-id="527e5a9f-678f-4281-baeb-1295669ae6c2"]`);
	};
}
