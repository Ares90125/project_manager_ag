import {BrowserContext, Page} from 'playwright';
import axios from 'axios';
import {wait} from './testUtilities';

const token = process.env.APP_TOKEN;
export default class FacebookUtilities {
	readonly page: Page;
	readonly context: BrowserContext;

	constructor(page: Page, context: BrowserContext) {
		this.page = page;
		this.context = context;
	}

	TxtBxLogin = `#email`;
	TxtBxPassword = `#pass`;
	BtnLogin = `#loginbutton`;
	BtnRoleButton = `[role="button"]`;
	BtnProfileContinue = `[role="button"]`;
	BtnGroupsNotNow = `[aria-label="Not Now"]`;
	BtnGroupsOk = `[aria-label="Continue"]`;
	BtnGroupCancel = `[aria-label="Not Now"]`;

	//Login
	login = async (email: string, password: string) => {
		await wait();
		await this.page.type(this.TxtBxLogin, email, {delay: 100});
		await wait();
		await this.page.type(this.TxtBxPassword, password, {delay: 100});
		await wait();
		await this.page.click(this.BtnLogin);
		await wait();
		//await this.page.waitForNavigation({waitUntil: `domcontentloaded`});
	};

	//Profile Page

	profilePopupClickContinue = async () => {
		await this.page.waitForSelector(this.BtnProfileContinue);
		await wait();
		await this.page.$$(this.BtnProfileContinue).then($ele => $ele[1].click());
	};

	//Groups Page
	groupsPageClickOnNotNow = async () => {
		try {
			await this.page.waitForSelector(this.BtnGroupsNotNow);
			await wait();
			await this.page.$$(this.BtnRoleButton).then(elements => {
				elements[2].click();
			});
			await this.page.waitForNavigation({waitUntil: `domcontentloaded`});
		} catch (error) {}
	};

	groupsPageClickOnOk = async () => {
		await this.page.waitForSelector(this.BtnGroupsOk);
		await wait();
		await this.page.click(this.BtnGroupsOk);
		await this.page.waitForNavigation({waitUntil: `domcontentloaded`});
	};

	TestUserCreation = async (): Promise<{
		id: string;
		access_token: string;
		login_url: string;
		email: string;
		password: string;
	}> => {
		const url = `https://graph.facebook.com/v8.0/336167437102103/accounts/test-users?installed=true&access_token=${token}&name=Sai`;
		let {data} = await axios.post(url);
		if (data.email === '') {
			({data} = await axios.post(url));
		}
		return data;
	};

	TestUserCreation1 = async (): Promise<{
		id: string;
		access_token: string;
		login_url: string;
		email: string;
		password: string;
	}> => {
		const url = `https://graph.facebook.com/v8.0/336167437102103/accounts/test-users?installed=true&access_token=${token}&name=testUserAdminBio`;
		let {data} = await axios.post(url);
		if (data.email === '') {
			({data} = await axios.post(url));
		}
		return data;
	};

	TestUserDeletion = async (userId: string) => {
		const {data} = await axios.delete(`https://graph.facebook.com/v8.0/${userId}?access_token=${token}`);
		return data;
	};

	deleteConvosightPermissionNewUI = async () => {
		await this.page.goto('https://www.facebook.com/settings?tab=applications&ref=settings');
		await this.page.waitForSelector(`[aria-label="Remove"]`, {timeout: 30000});
		await this.page.click(`[aria-label="Remove"]`);
		await this.page.click(
			`//*[contains(@aria-label,'Remove Convosight?')]//div[contains(@aria-label,'Remove')  and contains(@tabindex,'0')]`
		);
		await this.page.waitForSelector(`//span[contains(text(),'You don')]`);
	};

	removeConvosightApp = async () => {
		await this.page.goto(`https://www.facebook.com/groups/223513286311537/edit`);
		await this.page.waitForSelector(`[aria-label="Group admin information for selected tool SETTINGS"]`);
		await this.page.press(`[aria-label="Group admin information for selected tool SETTINGS"]`, `End`);
		await this.page.$$(`[aria-label="Edit"]`).then(async ele => {
			await ele[20].click();
		});
		await this.page.click(`[aria-label="Remove Convosight"]`);
	};
}
