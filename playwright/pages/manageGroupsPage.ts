import {BrowserContext, Page} from 'playwright';

export default class ManageGroupsPage {
	readonly page: Page;
	readonly context: BrowserContext;
	constructor(page: Page, context: BrowserContext) {
		this.page = page;
		this.context = context;
	}

	init = async () => {
		const url = 'https://localhost:4200/group-admin/manage';
		try {
			if (this.page.url() !== url) {
				await this.page.waitForNavigation({
					url: url,
					timeout: 30000,
					waitUntil: 'load'
				});
			}
		} catch {}
	};

	getGroupsPopupTitle = async (): Promise<string> => {
		await this.page.waitForSelector('div.modal-header > h5.modal-title');
		return await this.page.$eval('div.modal-header > h5.modal-title', element => element.textContent);
	};

	goToSettingsPage = async () => {
		await this.page.click(`[data-cs-label="Profile Image"]`);
		await this.page.click(`'Settings'`);
	};

	addModerator = async (name: string, email: string, mobile: string) => {
		await this.page.click(`[data-test-id="button-add-new-moderator"]`, {timeout: 90000});
		await this.page.fill(`[data-placeholder="Name*"]`, name);
		await this.page.fill(`[data-placeholder="Email*"]`, email);
		await this.page.fill(`#phone`, mobile);
		await this.page.click(`[data-cs-label="Send invite"]`);
	};
}
