import {test} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import {deleteUser} from '../../utils/database.adapter';

test.describe('Kudos-journey-2', () => {
	let facebookUtilities: FacebookUtilities;
	let id: string, email: string, password: string;
	//const thankYouSelector = `div[role="document"] h6`;
	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		({id, email, password} = await facebookUtilities.TestUserCreation());
		await page.goto('/public/admin/b93cf95d-a5da-40ed-b0af-35b300b42cd7?utm_source=shareButton', {timeout: 60000});
	});

	test.skip('verify new user should go throigh signup journey when clicked on the hearts of public admin profile ', async ({
		page
	}) => {
		await page.waitForSelector(`[id="bio-preview-introduction"]`, {timeout: 60000});
		await page.click(`[data-cs-label="Hearts"]`);
	});

	test.afterEach(async () => {
		await deleteUser(email);
		await facebookUtilities.TestUserDeletion(id);
	});
});
