import {test, expect} from '../baseFixtures';
import FacebookUtilities from '../../utils/facebookUtilities';
import NoGroupsPage from '../../pages/noGroupsPage';
import {deleteUser} from '../../utils/database.adapter';

test.describe('User Onboarding 2.0', () => {
	let facebookUtilities: FacebookUtilities;
	let id: string, email: string, password: string;

	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		({id, email, password} = await facebookUtilities.TestUserCreation());
	});

	test('C8 : Verify when user logged into convosight with no Groups', async ({page, context}) => {
		const noGroupsPage: NoGroupsPage = new NoGroupsPage(page, context);
		await page.goto('/login-response');
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(email, password);
		await facebookUtilities.profilePopupClickContinue();
		await facebookUtilities.groupsPageClickOnOk();
		await page.waitForSelector(noGroupsPage.ElmtWelcomeText);
		const innerText = await (await page.waitForSelector(noGroupsPage.ElmtWelcomeText)).innerText();
		//Assert
		expect(innerText).toContain(`Oops! No groups found`);
		expect(await page.title()).toEqual('Group Admin No Groups');
		//Act
		//dummycommit
	});

	test.afterEach(async () => {
		await deleteUser(email);
		await facebookUtilities.TestUserDeletion(id);
	});
});
