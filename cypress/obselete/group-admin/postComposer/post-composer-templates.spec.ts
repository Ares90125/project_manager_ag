import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

describe(`Post Composer Scenarios`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.InterceptRoute([
			`CreateFbPostModel`,
			`ListFbPostModels`,
			`GetLastdayGroupMetricsByGroupId`,
			`UpdateFbPost`,
			`GetGRecommendationByDay`
		]);
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
		cy.InterceptRoute([`CreateFbPostModel`, `ListFbPostModels`, `GetLastdayGroupMetricsByGroupId`, `UpdateFbPost`]);
	});
	it(`Verify all the templates are available for the user to use.`, () => {
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Test group 2`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.getDataTestId(`btn-group-create-a-post`).click();
		cy.getDataCsLabel(`Continue`).click();
		cy.get(`[data-cs-label="To post page"]`, {timeout: 60000}).click();
		cy.getDataTestId(`template-link-post-composer`).should(`be.visible`).should(`have.text`, `Use a template`).click();
		cy.getDataTestId(`heading-template-pop-up`).should(`be.visible`).should(`have.text`, `Use a template`);
		cy.getDataTestId(`button-close-template-pop-up`).should(`be.visible`).click();
		cy.getDataTestId(`template-link-post-composer`).should(`be.visible`).should(`have.text`, `Use a template`).click();
		cy.getDataTestId(`template-welcome-new-members`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`)
					.should(`have.text`, `Welcome New Members (weekly)`)
					.should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(`have.text`, `Copy this post and use this weekly to welcome the new members of your group`)
					.should(`be.visible`);
			});
		cy.getDataTestId(`template-weekly-promotion-day`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Weekly Promotion Day post`).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(`have.text`, `Use this post when you have the weekly promotion day in your group`)
					.should(`be.visible`);
			});
		cy.getDataTestId(`template-weekly-jobs-day`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Weekly Jobs Day post`).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(`have.text`, `Use this post when you have the weekly jobs day in your group`)
					.should(`be.visible`);
			});
		cy.getDataTestId(`template-group-guidlines-post`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Group Guidelines post `).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(
						`have.text`,
						`Use this post every 3 months to share the latest group guidelines with the entire community `
					)
					.should(`be.visible`);
			});
		cy.getDataTestId(`template-ask-for-help`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Regular #Askforhelp post`).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(
						`have.text`,
						`Do this regularly to enable your members to ask for any help if they need from the community `
					)
					.should(`be.visible`);
			});
	});

	it(`Verify user is able to use welcome new member template`, () => {
		cy.getDataTestId(`template-welcome-new-members`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`)
					.should(`have.text`, `Welcome New Members (weekly)`)
					.should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(`have.text`, `Copy this post and use this weekly to welcome the new members of your group`)
					.should(`be.visible`);
				cy.getDataTestId(`button-view-template`).click();
				cy.get(`[data-test-id="button-close-use-template-pop-up"]`, {withinSubject: null}).click();
				cy.get(`[data-test-id="heading-template-type"]`, {withinSubject: null}).should(`be.visible`);
				cy.get(`[data-test-id="button-view-template"]`, {withinSubject: null}).eq(0).click();
				cy.get('[data-test-id="view-template-heading"]', {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `View template`);
				cy.get(`[data-test-id="template-name-view-pop-up"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Welcome New Members (weekly)`);
				cy.get(`[data-test-id="template-description"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(
						`have.text`,
						`Hey everyone 👋 \nWelcoming all of you to <Facebook group name>\nDo share a small introduction about you which helps the members know you better 🙌\n\nFeel free to ask any questions you have`
					);
				cy.get(`[data-cs-label="Use this template"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Use this template`)
					.click();

				cy.get(`[data-test-id="heading-post-composer"]`, {withinSubject: null})
					.should(`be.visible`)
					.within(() => {
						cy.get(`#postMessage`, {withinSubject: null})
							.invoke(`val`)
							.should(
								`eq`,
								`Hey everyone 👋 \nWelcoming all of you to <Facebook group name>\nDo share a small introduction about you which helps the members know you better 🙌\n\nFeel free to ask any questions you have`
							);
					});
				cy.get(`[data-test-id="template-link-post-composer"]`, {withinSubject: null}).should(`be.visible`).click();
			});
	});

	it(`Verify user is able to use Weekly Promotion Day post`, () => {
		cy.getDataTestId(`template-weekly-promotion-day`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Weekly Promotion Day post`).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(`have.text`, `Use this post when you have the weekly promotion day in your group`)
					.should(`be.visible`);
				cy.getDataTestId(`button-view-template`).click();
				cy.get(`[data-test-id="button-close-use-template-pop-up"]`, {withinSubject: null}).click();
				cy.get(`[data-test-id="heading-template-type"]`, {withinSubject: null}).should(`be.visible`);
				cy.get(`[data-test-id="button-view-template"]`, {withinSubject: null}).eq(1).click();
				cy.get('[data-test-id="view-template-heading"]', {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `View template`);
				cy.get(`[data-test-id="template-name-view-pop-up"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Weekly Promotion Day post`);
				cy.get(`[data-test-id="template-description"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(
						`have.text`,
						`Hey everyone 👋 \n\nToday is our weekly promotion day 🎺\n\nPlease feel free to share links of whatever businesses you are working on along with description and how it can benefit the group members \n\nAlso share if you have any special discounts for the community members`
					);
				cy.get(`[data-cs-label="Use this template"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Use this template`)
					.click();

				cy.get(`[data-test-id="heading-post-composer"]`, {withinSubject: null})
					.should(`be.visible`)
					.within(() => {
						cy.get(`#postMessage`, {withinSubject: null})
							.invoke(`val`)
							.should(
								`eq`,
								`Hey everyone 👋 \n\nToday is our weekly promotion day 🎺\n\nPlease feel free to share links of whatever businesses you are working on along with description and how it can benefit the group members \n\nAlso share if you have any special discounts for the community members`
							);
					});
				cy.get(`[data-test-id="template-link-post-composer"]`, {withinSubject: null}).should(`be.visible`).click();
			});
	});

	it(`Verify user is able to use Weekly Jobs Day post`, () => {
		cy.getDataTestId(`template-weekly-jobs-day`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Weekly Jobs Day post`).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(`have.text`, `Use this post when you have the weekly jobs day in your group`)
					.should(`be.visible`);
				cy.getDataTestId(`button-view-template`).click();
				cy.get(`[data-test-id="button-close-use-template-pop-up"]`, {withinSubject: null}).click();
				cy.get(`[data-test-id="heading-template-type"]`, {withinSubject: null}).should(`be.visible`);
				cy.get(`[data-test-id="button-view-template"]`, {withinSubject: null}).eq(2).click();
				cy.get('[data-test-id="view-template-heading"]', {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `View template`);
				cy.get(`[data-test-id="template-name-view-pop-up"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Weekly Jobs Day post`);
				cy.get(`[data-test-id="template-description"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(
						`have.text`,
						`Hey everyone 👋 \n\nToday is our weekly jobs day 👨‍💻\n\nPlease feel free to share if you are hiring for any positions in your companies. Do share the link of the job posting and a small description of the role. These can be full time, remote, part-time, freelance or work from home roles.\n\nAlso share a small introduction about your company along with link so that the community members can get complete information`
					);
				cy.get(`[data-cs-label="Use this template"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Use this template`)
					.click();

				cy.get(`[data-test-id="heading-post-composer"]`, {withinSubject: null})
					.should(`be.visible`)
					.within(() => {
						cy.get(`#postMessage`, {withinSubject: null})
							.invoke(`val`)
							.should(
								`eq`,
								`Hey everyone 👋 \n\nToday is our weekly jobs day 👨‍💻\n\nPlease feel free to share if you are hiring for any positions in your companies. Do share the link of the job posting and a small description of the role. These can be full time, remote, part-time, freelance or work from home roles.\n\nAlso share a small introduction about your company along with link so that the community members can get complete information`
							);
					});
				cy.get(`[data-test-id="template-link-post-composer"]`, {withinSubject: null}).should(`be.visible`).click();
			});
	});

	it(`Verify user is able to use Group Guidelines post`, () => {
		cy.getDataTestId(`template-group-guidlines-post`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Group Guidelines post `).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(
						`have.text`,
						`Use this post every 3 months to share the latest group guidelines with the entire community `
					)
					.should(`be.visible`);
				cy.getDataTestId(`button-view-template`).click();
				cy.get(`[data-test-id="button-close-use-template-pop-up"]`, {withinSubject: null}).click();
				cy.get(`[data-test-id="heading-template-type"]`, {withinSubject: null}).should(`be.visible`);
				cy.get(`[data-test-id="button-view-template"]`, {withinSubject: null}).eq(3).click();
				cy.get('[data-test-id="view-template-heading"]', {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `View template`);
				cy.get(`[data-test-id="template-name-view-pop-up"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Group Guidelines post `);
				cy.get(`[data-test-id="template-description"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(
						`have.text`,
						`Hey everyone 👋 \n\nJust sharing the group guidelines with everyone. It would be great for everyone to just browse through them. We are an awesome and impactful community today because all of us follow the group guidelines religiously 🙏 \n\n< Paste group guidelines >`
					);
				cy.get(`[data-cs-label="Use this template"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Use this template`)
					.click();

				cy.get(`[data-test-id="heading-post-composer"]`, {withinSubject: null})
					.should(`be.visible`)
					.within(() => {
						cy.get(`#postMessage`, {withinSubject: null})
							.invoke(`val`)
							.should(
								`eq`,
								`Hey everyone 👋 \n\nJust sharing the group guidelines with everyone. It would be great for everyone to just browse through them. We are an awesome and impactful community today because all of us follow the group guidelines religiously 🙏 \n\n< Paste group guidelines >`
							);
					});
				cy.get(`[data-test-id="template-link-post-composer"]`, {withinSubject: null}).should(`be.visible`).click();
			});
	});

	it(`Verify user is able to use Ask for help`, () => {
		cy.getDataTestId(`template-ask-for-help`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-template-type`).should(`have.text`, `Regular #Askforhelp post`).should(`be.visible`);
				cy.getDataTestId(`description-template`)
					.should(
						`have.text`,
						`Do this regularly to enable your members to ask for any help if they need from the community `
					)
					.should(`be.visible`);
				cy.getDataTestId(`button-view-template`).click();
				cy.get(`[data-test-id="button-close-use-template-pop-up"]`, {withinSubject: null}).click();
				cy.get(`[data-test-id="heading-template-type"]`, {withinSubject: null}).should(`be.visible`);
				cy.get(`[data-test-id="button-view-template"]`, {withinSubject: null}).eq(4).click();
				cy.get('[data-test-id="view-template-heading"]', {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `View template`);
				cy.get(`[data-test-id="template-name-view-pop-up"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Regular #Askforhelp post`);
				cy.get(`[data-test-id="template-description"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(
						`have.text`,
						`Hey everyone 👋 \n\nTime for our regular #AskforHelp post. \n\nAll community members who need help from fellow community members can please share what help they need exactly and relevant community members can answer and solve.\n\nPlease be mindful any comment/conversation asking for money will be deleted and the member will get a stern warning.`
					);
				cy.get(`[data-cs-label="Use this template"]`, {withinSubject: null})
					.should(`be.visible`)
					.should(`have.text`, `Use this template`)
					.click();

				cy.get(`[data-test-id="heading-post-composer"]`, {withinSubject: null})
					.should(`be.visible`)
					.within(() => {
						cy.get(`#postMessage`, {withinSubject: null})

							.invoke(`val`)
							.should(
								`eq`,
								`Hey everyone 👋 \n\nTime for our regular #AskforHelp post. \n\nAll community members who need help from fellow community members can please share what help they need exactly and relevant community members can answer and solve.\n\nPlease be mindful any comment/conversation asking for money will be deleted and the member will get a stern warning.`
							);
					});
			});
	});

	it(`Verify user is not able to upload more than one video`, () => {
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/videos/video1.mp4`);
		cy.get(`video`).should(`have.length`, 1);
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/videos/video2.mp4`);
		cy.VerifyAlert(`Only one video is allowed per post`, `Remove existing video to upload a new one.`);
		cy.get(`video`).should(`have.length`, 1);
		cy.get(`.remove-media`).should(`be.visible`).realClick();
		cy.get(`video`).should(`not.exist`);
	});

	it(`Verify user is not able to upload with incorrect file `, () => {
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/Worksheets/groupids.csv`);
		cy.VerifyAlert(
			`Incorrect file format`,
			`Only files with the following extention are allowed: gif, png, jpg, jpeg, mp4, avi, mov`
		);
		cy.get(`video`).should(`not.exist`);
	});

	it(`Verify user is not able to schedule post in past time`, () => {
		cy.get(`[class="mat-radio-label-content"]:contains("Publish at a custom time")`).eq(0).should(`be.visible`).click();
		cy.getDataCsLabel(`Date picker`).should(`be.visible`);
		cy.get(`.fake-input`).eq(0).click();
		dayjs.extend(LocalizedFormat);
		const min = dayjs().format(`mm`);
		cy.wrap(dayjs().subtract(2, 'hours').subtract(Number(min), 'minutes').format(`LT`)).then(time => {
			cy.contains(time).scrollIntoView().click({force: true});
		});
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.VerifyAlert(`Scheduled time can not be in past`, `Please select a future time for scheduling your post.`);
	});
});
