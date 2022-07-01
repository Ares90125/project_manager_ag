import {expect, test} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {routeUrl} from '../../utils/credentials';
import {fbTokenExpiry} from '../../utils/testUtilities';
import * as postPermission from '../../mockData/postPermission.json';

test.describe('FB Access permission and token related test cases', () => {
	let facebookUtilities: FacebookUtilities;
	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		await page.goto('/login-response', {timeout: 60000});
	});

	test.skip('Verify that user is given an option to grant publish permission from create a post screen if check publish permission is set to false', async ({
		page,
		context
	}) => {
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login('ldtbnsovbz_1613629756@tfbnw.net', 'convosight');
		await page.waitForSelector(`button.linker`, {timeout: 45000});
		await page.click(`button.linker`);
		await page.waitForSelector(`[data-test-id='btn-group-create-a-post']`);
		await page.click(`[data-test-id='btn-group-create-a-post']`);
		await fbTokenExpiry(`query CheckPublishPermissionForGroup`, postPermission, routeUrl, page, context);
		await page.waitForSelector(`[data-cs-label="Continue"]`, {timeout: 45000});
		await page.click(`[data-cs-label="Continue"]`);
		await page.click(`[data-cs-label="To post page"]`);
		try {
			await page.waitForSelector(`[data-cs-label="Grant permission"]`, {timeout: 20000});
		} catch {
			await page.waitForSelector(`#postMessage`);
			await page.click(`#postMessage`);
			await page.waitForSelector(`[data-cs-label="Grant permission"]`);
		}
		const grantPermissionHeading = await (
			await page.$(`[data-test-id="heading-publish-permission-overlay"]`)
		).innerText();
		expect(grantPermissionHeading).toEqual(`Publishing permission required`);
		const grantPermissionSubheading = await (
			await page.$(`[data-test-id="subheading-publish-permission-overlay"]`)
		).innerText();
		expect(grantPermissionSubheading).toEqual(
			`To use Convosight publishing features, you need to give publishing permission from your facebook account`
		);
		await page.click(`[data-cs-label="Grant permission"]`);
		await facebookUtilities.groupsPageClickOnOk();
		await page.waitForSelector(`[data-test-id="heading-post-composer-page"]`);
		await page.fill(`#postMessage`, `testPost`);
		await page.$$(`.publish-btn`).then(ele => ele[0].click());
		expect(await page.$$(`[data-test-id="scheduled-post-body"]:text("testPost")`)).toBeDefined;
	});

	test.skip('Verify that user is given an option to grant publish permission from overview screen if checkpublishpermission is set to false', async ({
		page,
		context
	}) => {
		await fbTokenExpiry(`query CheckPublishPermissionForGroup`, postPermission, routeUrl, page, context);
		await page.waitForSelector(`button.linker`, {timeout: 60000});
		await page.click(`button.linker`);
		await page.waitForSelector(`[data-test-id="button-redirect-to-post-overview"]`).then(ele => ele.click());
		await page.waitForSelector(`[data-cs-label="Grant permission"]`);
		const grantPermissionHeading = await (
			await page.$(`[data-test-id="heading-publish-permission-overlay"]`)
		).innerText();
		expect(grantPermissionHeading).toEqual(`Publishing permission required`);
		const grantPermissionSubheading = await (
			await page.$(`[data-test-id="subheading-publish-permission-overlay"]`)
		).innerText();
		expect(grantPermissionSubheading).toEqual(
			`To use Convosight publishing features, you need to give publishing permission from your facebook account`
		);
		await page.click(`[data-cs-label="Grant permission"]`);
		await facebookUtilities.groupsPageClickOnOk();
		await page.waitForSelector(`[data-test-id="heading-post-composer-page"]`);
		expect(await page.$(`[data-test-id="reshare-post-desc-post-composer"]`)).toBeDefined;
	});

	test.skip('Verify that user is given an option to grant publish permission from reshare screen if checkpublishpermission is set to false', async ({
		page,
		context
	}) => {
		await fbTokenExpiry(`query CheckPublishPermissionForGroup`, postPermission, routeUrl, page, context);
		await page.waitForSelector(`button.linker`);
		await page.click(`button.linker`);
		await page.waitForSelector(`[data-test-id="button-redirect-to-post-overview"]`).then(ele => ele.click());
		await page.waitForSelector(`[data-cs-label="Grant permission"]`);
		const grantPermissionHeading = await (
			await page.$(`[data-test-id="heading-publish-permission-overlay"]`)
		).innerText();
		expect(grantPermissionHeading).toEqual(`Publishing permission required`);
		const grantPermissionSubheading = await (
			await page.$(`[data-test-id="subheading-publish-permission-overlay"]`)
		).innerText();
		expect(grantPermissionSubheading).toEqual(
			`To use Convosight publishing features, you need to give publishing permission from your facebook account`
		);
		await page.click(`[data-cs-label="Grant permission"]`);
		await facebookUtilities.groupsPageClickOnOk();
		await page.waitForSelector(`[data-test-id="button-redirect-to-post-overview"]`).then(ele => ele.click());
		await page.waitForSelector(`[data-test-id="heading-post-composer-page"]`);
		expect(await page.$(`[data-test-id="reshare-post-desc-post-composer"]`)).toBeDefined;
	});
});
