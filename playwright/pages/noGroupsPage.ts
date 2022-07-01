import {BrowserContext, Page} from 'playwright';
import {wait} from '../utils/testUtilities';
export default class NoGroupsPage {
	readonly page: Page;
	readonly context: BrowserContext;
	constructor(page: Page, context: BrowserContext) {
		this.page = page;
		this.context = context;
	}

	ElmtWelcomeText = `h2.primary-text`;
	BtnAddGroups = `.facebook-btn.convo-btn-normal`;

	init = async () => {
		const url = 'https://localhost:4200/group-admin/no-groups';
		try {
			if (this.page.url() !== url) {
				await this.page.waitForNavigation({
					url: url,
					timeout: 30000,
					waitUntil: 'load'
				});
			}
		} catch (e) {
			console.log(this.page.url());
		}
	};

	goToSettingsPage = async () => {
		await this.page.click(`[data-cs-label="Profile Image"]`);
		await this.page.click(`'Settings'`);
	};

	clickOnAddGroupsButton = async (): Promise<void> => {
		await wait();
		await this.page.click(this.BtnAddGroups);
		await wait();
		await this.page.click('[aria-label="Continue"]');
	};
}
