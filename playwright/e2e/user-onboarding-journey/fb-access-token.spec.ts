import {expect, test} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {routeUrl} from '../../utils/credentials';
import {getUserIdByUsername} from '../../utils/database.adapter';
import {fbTokenExpiry} from '../../utils/testUtilities';
import * as executeFBResponse from '../../mockData/fbTokenExpiry.json';

test.describe('FB Access permission and token related test cases', () => {
	let facebookUtilities: FacebookUtilities;
	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		await page.goto('/login-response', {timeout: 60000});
	});

	test.skip('Verify that user is logged out when mocked response for fbapi to fetch user profile has token expired', async ({
		page,
		context
	}) => {
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login('ldtbnsovbz_1613629756@tfbnw.net', 'convosight');
		await page.waitForSelector(`button.linker`);
		let userData = await getUserIdByUsername('ldtbnsovbz_1613629756@tfbnw.net');
		const {
			Items: [{fbUserAccessToken}]
		} = userData;
		expect(fbUserAccessToken).not.toBeUndefined();
		expect(fbUserAccessToken).not.toBeNull;
		console.log(`fbuseraccesstoken for the user is :`, fbUserAccessToken);
		await fbTokenExpiry(`/me?fields=id,name,email,picture`, executeFBResponse, routeUrl, page, context);
		await page.reload();
		await page.waitForSelector(`[data-cs-label="Continue with Facebook"]`, {timeout: 30000});
		const title = await page.title();
		await expect(title).toEqual('Convosight | Best Platform to Monetize your Facebook group');
		userData = await getUserIdByUsername('ldtbnsovbz_1613629756@tfbnw.net');
		const {
			Items: [{fbUserAccessToken: fbToken}]
		} = userData;
		expect(fbToken).toBeUndefined();
		expect(fbToken).not.toBeNull;
	});

	test('Verify that user is not logged out when mocked response for fbapi to fetch user profile picture has token expired', async ({
		page,
		context
	}) => {
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login('ldtbnsovbz_1613629756@tfbnw.net', 'convosight');
		await page.waitForSelector(`button.linker`);
		let userData = await getUserIdByUsername('ldtbnsovbz_1613629756@tfbnw.net');
		const {
			Items: [{fbUserAccessToken}]
		} = userData;
		expect(fbUserAccessToken).not.toBeUndefined();
		expect(fbUserAccessToken).not.toBeNull;
		console.log(`fbuseraccesstoken for the user is :`, fbUserAccessToken);

		await page.reload();
		await fbTokenExpiry('/113120024148395/picture?redirect=0', executeFBResponse, routeUrl, page, context);
		await page.waitForSelector(`button.linker`, {timeout: 60000});
		const title = await page.title();
		expect(title).not.toEqual(`Convosight | Free Facebook Group Analytics & Publishing Tool`);
		const {
			Items: [{fbUserAccessToken: fbToken}]
		} = userData;
		expect(fbToken).not.toBeUndefined();
		expect(fbToken).not.toBeNull;
	});
});
