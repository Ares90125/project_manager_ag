import {expect, test} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {baseUrl, usergroupAdmin} from '../../utils/credentials';

test.describe('Kudos-journey-1', () => {
	let facebookUtilities: FacebookUtilities;
	let username = usergroupAdmin.username;
	let password = usergroupAdmin.password;
	const thankYouSelector = `div[role="document"] h6`;
	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
	});

	test('verify user should login to send hearts on a public admin profile ', async ({page, context}) => {
		await page.goto('/public/admin/b93cf95d-a5da-40ed-b0af-35b300b42cd7?utm_source=shareButton', {timeout: 60000});
		await page.waitForSelector(`[id="bio-preview-introduction"]`, {timeout: 60000});
		await page.click(`[data-cs-label="Hearts"]`);

		await facebookUtilities.login(usergroupAdmin.username, usergroupAdmin.password);
		await page.waitForSelector(`[data-cs-label="Hearts"]`, {timeout: 60000});

		//assertion for the thank you message popup
		await page.waitForSelector(thankYouSelector, {timeout: 60000});
		const thankYouMessage = await (await page.$(thankYouSelector)).innerText();
		await expect(thankYouMessage).toEqual(`Thank you for sending ❤️ Hearts!`);
		await page.click('div[role="document"] button');
		const heartsCount = await (await page.$(`//button[@data-cs-label="Hearts"]/span`)).innerText();
		await expect(heartsCount).toEqual('1');

		//deselecting the hearts
		await page.click(`[data-cs-label="Hearts"]`);
		const hearts = await page.waitForSelector(`//button[@data-cs-label="Hearts"]/span[text()="0"]`);
		await expect(hearts).toBeTruthy();
	});
	test('verify user able to send hearts on a public admin profile while he is logged in', async ({page, context}) => {
		await page.goto(baseUrl);
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(usergroupAdmin.username, usergroupAdmin.password);
		// await page.waitForSelector(`button.linker`, {timeout: 45000});

		await page.goto('/public/admin/b93cf95d-a5da-40ed-b0af-35b300b42cd7?utm_source=shareButton', {timeout: 60000});
		await page.waitForSelector(`[id="bio-preview-introduction"]`, {timeout: 60000});
		await page.click(`[data-cs-label="Hearts"]`);

		//assertion for the thank you message popup
		await page.waitForSelector(thankYouSelector, {timeout: 60000});
		const thankYouMessage = await (await page.$(thankYouSelector)).innerText();
		await expect(thankYouMessage).toEqual(`Thank you for sending ❤️ Hearts!`);
		await page.click('div[role="document"] button');
		const heartsCount = await (await page.$(`//button[@data-cs-label="Hearts"]/span`)).innerText();
		await expect(heartsCount).toEqual('1');

		//deselcting the hearts
		await page.click(`[data-cs-label="Hearts"]`);
		const hearts = await page.waitForSelector(`//button[@data-cs-label="Hearts"]/span[text()="0"]`);
		await expect(hearts).toBeTruthy();
	});
});
