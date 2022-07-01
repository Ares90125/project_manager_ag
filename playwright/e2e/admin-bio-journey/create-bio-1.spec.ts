import {expect, test} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {
	adminBioDisabledUser,
	adminBioEnabledAndCompletedUser,
	adminBioEnabledAndNotCompletedUser,
	baseUrl
} from '../../utils/credentials';

test.describe('Kudos-journey-1', () => {
	let facebookUtilities: FacebookUtilities;
	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		await page.goto(baseUrl);
	});

	test.skip(`verify admin bio button should be not be visible to the user when admin bio feature is disabled for the user`, async ({
		page,
		context
	}) => {
		//log into convosight
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(adminBioDisabledUser.username, adminBioDisabledUser.password);
		await page.waitForSelector(`button.linker`, {timeout: 45000});

		//assertion for Admin bio button
		const ele = await page.$(`[data-cs-label="Admin bio"]`);
		await expect(ele).toBeNull();
	});

	test(`verify user gets complete your bio pop-up after logging in when admin bio is not completed`, async ({
		page,
		context
	}) => {
		//log into convosight
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(
			adminBioEnabledAndNotCompletedUser.username,
			adminBioEnabledAndNotCompletedUser.password
		);
		await page.waitForSelector(`[role="document"] button`, {timeout: 60000});

		//assertion for Admin Bio Pop up
		const text = await (await page.$('[role="document"] button')).innerText();
		await expect(text).toEqual('Complete your Admin Bio ');
	});

	test(`verify user should not get complete your bio pop-up when the admin bio is already created. `, async ({
		page,
		context
	}) => {
		//log into convosight
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(adminBioEnabledAndCompletedUser.username, adminBioEnabledAndCompletedUser.password);
		await page.waitForSelector(`button.linker`, {timeout: 45000});

		//assertion for disabled Admin bio pop up button
		const ele = await page.$('[role="document"] button');
		await expect(ele).toBeNull();
	});
});
