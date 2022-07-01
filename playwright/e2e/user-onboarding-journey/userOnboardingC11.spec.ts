import {test, expect} from '../baseFixtures';
import ManageGroupsPage from '../../pages/manageGroupsPage';
import FacebookUtilities from '../../utils/facebookUtilities';
import NoGroupsPage from '../../pages/noGroupsPage';
import {adminUser, baseUrl, moderatorExistingUser} from '../../utils/credentials';
import {deleteUser} from '../../utils/database.adapter';

test.describe('User Onboarding 2.0', () => {
	let facebookUtilities: FacebookUtilities;
	let manageGroupsPage: ManageGroupsPage;
	let id: string, email: string, password: string;
	let adminContext;
	let adminPage;

	test.beforeEach(async ({page, context}) => {
		facebookUtilities = new FacebookUtilities(page, context);
		manageGroupsPage = new ManageGroupsPage(page, context);
		({id, email, password} = await facebookUtilities.TestUserCreation());
	});

	test.skip('C11 : Verify when user logged into convosight as moderator and later user removed by admin', async ({
		page,
		context,
		browser
	}) => {
		const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
		adminContext = await browser.newContext();
		adminPage = await adminContext.newPage();

		const adminFacebookUtilities = new FacebookUtilities(adminPage, adminContext);
		const noGroupsPage: NoGroupsPage = new NoGroupsPage(page, context);
		await adminPage.goto('/login-response');
		await adminPage.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await adminFacebookUtilities.login(adminUser.username, adminUser.password);
		await adminPage.waitForSelector(`button.linker`).then(ele => ele.click());
		// await adminPage.click(`[name="__CONFIRM__"]`); - for additional fb pop up if comes in future.
		await adminPage.click(`[data-cs-label="Add Moderators"]`, {force: true});
		await adminPage.waitForSelector(`[data-test-id="button-add-moderator"]`).then(ele => ele.click());
		await adminPage.fill(`[data-placeholder="Name*"]`, `Jitendra Choudary`);
		await adminPage.fill(`[data-placeholder="Email*"]`, moderatorExistingUser.username);
		await adminPage.fill(`#phone`, `9879879877`);
		await adminPage.click(`[data-cs-label="Send invite"]`);
		await page.goto(baseUrl);
		//Act
		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
		await facebookUtilities.login(moderatorExistingUser.username, moderatorExistingUser.password);
		//Assert
		await page.waitForSelector(`p.group-name`, {timeout: 60000});
		await page.waitForTimeout(10000);
		const groupName = await (await page.$(`p.group-name`)).innerText();
		await expect(groupName).toEqual(`Test`);
		const title = await page.title();
		expect(title).toEqual('Group Admin Manage Groups');
		await adminPage.waitForSelector(`[data-test-id="edit-existing-moderator"]`).then(ele => ele.click());
		await adminPage.$(`[data-test-id="remove-moderator-permission"]`).then(ele => ele.click());
		await adminPage.$(`[data-test-id="button-remove-moderator-pop-up"]`).then(ele => ele.click());
		await adminPage.waitForSelector(`[data-test-id="button-add-moderator"]`);
		await page.reload();
		await page.waitForSelector(noGroupsPage.ElmtWelcomeText);
		const innerText = await (await page.waitForSelector(noGroupsPage.ElmtWelcomeText)).innerText();
		//Assert
		expect(innerText).toContain(`Oops! No groups found`);
		expect(await page.title()).toEqual('Group Admin No Groups');
	});

	test.afterEach(async () => {
		await deleteUser(email);
		await facebookUtilities.TestUserDeletion(id);
		await adminPage.close();
		await adminContext.close();
	});
});
