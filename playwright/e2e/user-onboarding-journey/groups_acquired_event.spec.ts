import {test, expect} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {adminUser, segmentUrl} from '../../utils/credentials';

test.describe('User Onboarding 2.0', () => {
	test('C8 : Verify groups_acquired event is being sent to segment.', async ({page, context}) => {
		const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
		await page.goto('/login-response');
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(adminUser.username, adminUser.password);
		await page.route(segmentUrl, async (route, request) => {
			let requestBody = request.postData();
			if (requestBody.includes('groups_acquired')) {
				let requestBodyJsonObject = await JSON.parse(requestBody);
				const {
					user_id,
					group_count,
					count_of_new_groups,
					page_name,
					is_new_user,
					skip_email,
					application_platform,
					device_form_factor
				} = await requestBodyJsonObject.properties;
				console.log(page_name);
				await expect(user_id).toEqual(`b93cf95d-a5da-40ed-b0af-35b300b42cd7`);
				await expect(group_count).toEqual(1);
				await expect(count_of_new_groups).toEqual(0);
				await expect(page_name).toEqual(`Group Admin Manage Groups`);
				await expect(is_new_user).toEqual(false);
				await expect(skip_email).toEqual(false);
				await expect(application_platform).toEqual(`Website`);
				await expect(device_form_factor).toEqual(`Desktop`);
				await page.unroute;
			}
		});
		await page.waitForSelector(`[data-cs-label="Add Groups"]`, {timeout: 180000});
		await page.click(`[data-cs-label="Add Groups"]`);

		await page.click(facebookUtilities.BtnProfileContinue);
		await page.click(facebookUtilities.BtnGroupsOk);
		await page.waitForNavigation({waitUntil: `load`, timeout: 60000});
		await page.waitForSelector(`button.linker`);
	});
});
