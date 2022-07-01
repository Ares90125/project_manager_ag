// import { test, expect } from '@playwright/test';
// import FacebookUtilities from '../../utils/facebookUtilities';
// import NoGroupsPage from '../../pages/noGroupsPage';
// import {deleteUser} from '../../utils/database.adapter';
// import {baseUrl, fetchGroupUser} from '../../utils/credentials';
//
// test.describe('User Onboarding 2.0', () => {
//
// 	test.skip('C14 : Verify that new user is able to sign up for convosight and fetch groups.', async ({page, context}) => {
//     const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
//     const noGroupsPage: NoGroupsPage = new NoGroupsPage(page, context);
// 		//Arrange
// 		await page.goto(baseUrl);
//
// 		// //Act
// 		await page.waitForSelector(`#loginbutton`, {timeout: 60000});
// 		await facebookUtilities.login(fetchGroupUser.username, fetchGroupUser.password);
// 		await facebookUtilities.profilePopupClickContinue();
// 		await facebookUtilities.groupsPageClickOnOk();
// 		await page.waitForSelector('.primary-text').then(async text => {
// 			const innertext = await text.innerText();
// 			expect(innertext).toEqual(`You are just 1 step away`);
// 		});
// 		const processSteps = await page.$$(`[data-test-id="process-text"]`);
// 		const stepsText = [`Sign up`, `Add groups`, `Add app to Groups`, `Get Insights`];
// 		processSteps.forEach(async (ele, index) => {
// 			const innerText = await ele.innerText();
// 			expect(innerText).toEqual(stepsText[index]);
// 		});
// 		const groupNameEle = await page.$$(`.group-name`).then(async ele => {
// 			expect(await ele[0].innerText()).toEqual(`Automation Group Testing`);
// 		});
//
// 		await page.waitForSelector(`.convo-btn-normal`);
// 	});
//
//
// 	test.skip('C14 : Verify that user is able to install convosight app from the above group.', async ({page, context}) => {
//     const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
//     const noGroupsPage: NoGroupsPage = new NoGroupsPage(page, context);
// 		await page.click(`.convo-btn-normal`);
// 		const heading = await page.waitForSelector(`[data-test-id='heading-add-convosight']`);
// 		const innerText = await heading.innerText();
// 		expect(innerText).toEqual(`Add Convosight to your Group`);
// 		const [newPage] = await Promise.all([
// 			context.waitForEvent('page'),
// 			page.click('[data-cs-label="Go to Group Apps on Facebook"]') // Opens a new tab
// 		]);
// 		await newPage.reload();
// 		await newPage.waitForSelector(`[placeholder="Search"]`);
// 		await (await newPage.$(`[placeholder="Search"]`)).type(`Convosight`);
// 		await newPage.waitForSelector(`//*[@aria-label="Add App"]/div[1]`);
// 		await newPage.click(`//*[@aria-label="Add App"]/div[1]`);
// 		await newPage.click(
// 			`//*[@aria-label="Add app to this group"]//*[contains(@aria-label,"Add") and contains(@tabindex,'0')]`
// 		);
// 		await newPage.close();
// 		await page.waitForSelector(`[data-cs-label="Entertainment"]`);
// 		await page.click(`[data-cs-label="Entertainment"]`);
// 		await page.click(`.custom-search-wrapper`);
// 		await page.click(`//*[@data-test-id="searched-timezone-value"][1]`);
// 		await page.click(`[data-cs-label="Confirm"]`);
// 		await page.waitForSelector(`[data-cs-label="View insights"]`, {timeout: 100000});
// 		await page.click(`[data-cs-label="View insights"]`);
// 	});
//
// 	test.skip('C14 : Verify that user is able to uninstall convosight app from the above group.', async ({page, context}) => {
//     const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
// 		await facebookUtilities.removeConvosightApp();
// 		await page.goto(`https://localhost:4200/group-admin/manage`);
// 		await page.click(`.convo-btn-normal`);
// 		await page.waitForSelector(`[data-test-id='heading-add-convosight']`);
// 	});
//
// 	test.afterAll(async ({page, context}) => {
//     const facebookUtilities: FacebookUtilities = new FacebookUtilities(page, context);
// 		await facebookUtilities.deleteConvosightPermissionNewUI();
// 		await deleteUser(`joshirohan336@gmail.com`);
// 	});
// });
