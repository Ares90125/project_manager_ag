import {test, expect} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import NoGroupsPage from '../../pages/noGroupsPage';
import {deleteUser} from '../../utils/database.adapter';
import {baseUrl} from '../../utils/credentials';

test.describe('User Onboarding 2.0', () => {
	let facebookUtilities: FacebookUtilities;
	let noGroupsPage: NoGroupsPage;
	let id: string, email: string, password: string;

	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		noGroupsPage = new NoGroupsPage(page, context);
		({id, email, password} = await facebookUtilities.TestUserCreation());
	});

	test.skip('C12 : Verify when user logged into Convosight but not given groups permission', async ({page}) => {
		//Arrange
		await page.goto(baseUrl);

		//Act
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(email, password);
		await facebookUtilities.profilePopupClickContinue();
		await facebookUtilities.groupsPageClickOnNotNow();
		//Assert
		const heading = await (await page.waitForSelector(noGroupsPage.ElmtWelcomeText)).innerText();
		await expect(heading).toEqual('Welcome Sai!');
		const title = await page.title();
		expect(title).toEqual('Group Admin No Groups');
	});

	test.afterEach(async () => {
		await deleteUser(email);
		await facebookUtilities.TestUserDeletion(id);
	});
});
