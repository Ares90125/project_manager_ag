import {test, expect} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import NoGroupsPage from '../../pages/noGroupsPage';
import {deleteUser} from '../../utils/database.adapter';

test.describe('User Onboarding 2.0', () => {
	let facebookUtilities: FacebookUtilities;
	let noGroupsPage: NoGroupsPage;
	let id: string, email: string, password: string;

	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		noGroupsPage = new NoGroupsPage(page, context);
		({id, email, password} = await facebookUtilities.TestUserCreation());
	});

	test.skip('C13 : Verify when the user logged into Convosight but not given permission and later given', async ({
		page
	}) => {
		//Arrange
		await page.goto('/login-response');

		// //Act
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(email, password);
		await facebookUtilities.profilePopupClickContinue();
		await facebookUtilities.groupsPageClickOnNotNow();
		await noGroupsPage.clickOnAddGroupsButton();
		await page.waitForSelector(noGroupsPage.ElmtWelcomeText);
		//Assert
		const heading = await (await page.waitForSelector(noGroupsPage.ElmtWelcomeText)).innerText();
		await expect(heading).toEqual('Oops! No groups found');
	});

	test.afterEach(async () => {
		await deleteUser(email);
		await facebookUtilities.TestUserDeletion(id);
	});
});
