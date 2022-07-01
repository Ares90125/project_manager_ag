// import {test, expect} from '../baseFixtures';
// import FacebookUtilities from '../../utils/facebookUtilities';
// import ManageGroupsPage from '../../pages/manageGroupsPage';
// import NoGroupsPage from '../../pages/noGroupsPage';
// import SettingsPage from '../../pages/settingsPage';
// import {deleteUser} from '../../utils/database.adapter';
// import {usergroupAdmin} from '../../utils/credentials';
// import {generateEmail, getEmail} from '../../utils/testUtilities';
// let generatedemail: string;
// test.describe('User Onboarding 2.0', () => {
// 	let id: string, email: string, password: string;
// 	let facebookUtilities: FacebookUtilities;
// 	let manageGroupsPage: ManageGroupsPage;

// 	test.beforeAll(async () => {
// 		generatedemail = (await generateEmail()).split(' ').join('');
// 	});

// 	test.beforeEach(async ({page, context}) => {
// 		facebookUtilities = new FacebookUtilities(page, context);
// 		manageGroupsPage = new ManageGroupsPage(page, context);
// 		({id, email, password} = await facebookUtilities.TestUserCreation());
// 	});

// 	test.skip('C10 : Verify when user logged into Convosight first time with Groups as moderator', async ({
// 		page,
// 		context
// 	}) => {
// 		//Arrange
// 		//Admin

// 		const adminFacebookUtilities = new FacebookUtilities(page, context);
// 		const adminManageGroupsPage = new ManageGroupsPage(page, context);
// 		await page.goto('/login-response');
// 		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
// 		await adminFacebookUtilities.login(usergroupAdmin.username, usergroupAdmin.password);
// 		await page.waitForSelector(`[role="document"] button`).then(ele => ele.click());
// 		await (await page.waitForSelector(`//a[@routerlink="/group-admin/manage"]/span[text()="Groups "]`)).click();
// 		await page.waitForSelector(`button.linker`).then(ele => ele.click());
// 		await page.click(`[data-cs-label="Add Moderators"]`, {force: true});
// 		await adminManageGroupsPage.addModerator('Jitendra Choudary', generatedemail, '9879879877');
// 		const inviteEMail = await getEmail(
// 			`Advitiya Sujeet invited you to become a moderator for the group Test group`,
// 			generatedemail
// 		);
// 		expect(inviteEMail).toBeTruthy();
// 	});

// 	test.skip('C10.2 : Verify when moderator is able to access the group.', async ({page, context}) => {
// 		//Moderator
// 		const noGroupsPage = new NoGroupsPage(page, context);
// 		const settingsPage = new SettingsPage(page, context);
// 		await page.goto('/login-response');
// 		//Act
// 		await page.waitForSelector(facebookUtilities.BtnLogin, {timeout: 60000});
// 		await facebookUtilities.login(email, password);
// 		await facebookUtilities.profilePopupClickContinue();
// 		await facebookUtilities.groupsPageClickOnOk();
// 		await noGroupsPage.init();
// 		await noGroupsPage.goToSettingsPage();
// 		await page.click(`[data-cs-id="c1da9b60-5f5d-41e6-841e-f646dadf5057"]`);
// 		await settingsPage.completeEmailVerification(generatedemail);
// 		await manageGroupsPage.init();

// 		//Assert
// 		await page.waitForSelector(`p.group-name`);
// 		const groupName = await (await page.$(`p.group-name`)).innerText();
// 		await expect(groupName).toEqual(`Test group`);
// 		const title = await page.title();
// 		expect(title).toEqual('Group Admin Manage Groups');
// 	});

// 	test.afterAll(async () => {
// 		await deleteUser(email);
// 		await facebookUtilities.TestUserDeletion(id);
// 	});
// });
