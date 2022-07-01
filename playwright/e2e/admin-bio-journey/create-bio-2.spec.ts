import {expect, test} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {adminBioEnabledAndCompletedUser, adminBioEnabledAndNotCompletedUser} from '../../utils/credentials';

test.describe('create bio when user not logged in', () => {
	let facebookUtilities: FacebookUtilities;
	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		await page.goto('/public/admin/b93cf95d-a5da-40ed-b0af-35b300b42cd7?utm_source=shareButton', {timeout: 60000});
	});

	test.skip(`verify user gets "complete your bio" pop up when admin bio feature is enables but not completed bio`, async ({
		page
	}) => {
		// waiting to load admin bio public profile page and click on crtea a bio.
		await page.waitForSelector(`[class="video"]`, {timeout: 60000});
		await page.click(`[data-cs-label="create a bio"]`);

		//log into convosight
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(
			adminBioEnabledAndNotCompletedUser.username,
			adminBioEnabledAndNotCompletedUser.password
		);

		await page.waitForSelector(`[role="document"] button`, {timeout: 60000});

		//assertion for Admin Bio Pop up

		const video = await page.$('[id="video"]');
		expect(video).toBeVisible;

		const text1 = await (await page.$('[role="document"] h6')).innerText();
		await expect(text1).toEqual(`Introducing ‘Admin Bio’ from Convosight`);

		const text2 = await (await page.$('[role="document"] p')).innerText();
		await expect(text2).toEqual(`Complete your Bio today to increase your chances of getting paid brand campaigns.`);

		const text3 = await (await page.$('[role="document"] button')).innerText();
		await expect(text3).toEqual('Complete your Admin Bio ');
	});

	test.skip(`verify user should not get complete your bio pop-up when the admin bio is enabled and created. `, async ({
		page,
		context
	}) => {
		// waiting to load admin bio public profile page and click on crtea a bio.
		await page.waitForSelector(`[class="video"]`, {timeout: 60000});
		await page.click(`[data-cs-label="create a bio"]`);

		//log into convosight
		await facebookUtilities.login(adminBioEnabledAndCompletedUser.username, adminBioEnabledAndCompletedUser.password);
		await page.waitForSelector(`[data-cs-label="Share bio"]`, {timeout: 45000});

		//assertion for disabled Admin bio pop up button
		const ele = await page.$('[role="document"] button');
		await expect(ele).toBeNull();

		const textShareBio = await (await page.$('[data-cs-label="Share bio"] span')).innerText();
		await expect(textShareBio).toEqual('Share bio');

		const textPreviewBio = await (await page.$('[data-cs-label="Preview bio"] span')).innerText();
		await expect(textPreviewBio).toEqual('Preview bio');
	});
});
