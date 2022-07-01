import {test, expect} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {usergroupAdmin} from '../../utils/credentials';
import {getUserIdByUsername, removeFacebookAccessTokenUsingUsername} from '../../utils/database.adapter';

test.describe('User Onboarding 2.0', () => {
	test('C8 : Verify when user logged into convosight and fb access token saved after login', async ({
		page,
		context
	}) => {
		const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
		//Arrange
		await removeFacebookAccessTokenUsingUsername(usergroupAdmin.username);

		await getUserIdByUsername(usergroupAdmin.username).then(param => {
			const {
				Items: [{fbUserAccessToken}]
			} = param;
			expect(fbUserAccessToken).toBeUndefined();
		});

		await page.goto('/login-response');
		// //Act
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(usergroupAdmin.username, usergroupAdmin.password);
		await page.waitForSelector(`[data-cs-label="Groups"]`);
		await getUserIdByUsername(usergroupAdmin.username).then(param => {
			const {
				Items: [{fbUserAccessToken}]
			} = param;
			expect(fbUserAccessToken).not.toBeNull();
			expect(fbUserAccessToken).not.toBeUndefined();
			console.log(`fbuserAcess token is :`, fbUserAccessToken);
		});
	});
});
