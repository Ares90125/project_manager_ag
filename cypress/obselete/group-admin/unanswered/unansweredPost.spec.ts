import dayjs from 'dayjs';

describe(`Unanswered Post Scenarios on Group Admin`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
		//dummy commit
	});

	it(`Verify user is redirected to unanswered post successfully`, () => {
		cy.visit(`group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/overview`);
		cy.getDataCsLabel(`Unanswered posts`)
			.eq(0)
			.as(`unansweredPostButton`)
			.should(`be.visible`)
			.should(`have.text`, `Unanswered posts`)
			.click();
		cy.getDataTestId(`heading-unanswered-post-page`).should(`be.visible`).should(`have.text`, `Unanswered Posts`);
	});
	it(`Verify the page elements for unanswered post screen.`, () => {
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.getDataTestId(`heading-unanswered-post-page`).should(`be.visible`).should(`have.text`, `Unanswered Posts`);
		cy.getDataTestId(`subheading-unanswered-post-page`)
			.should(`be.visible`)
			.should(
				`contain.text`,
				`Never leave a post unanswered. This screen shows posts that receive no comments for 2 hours`
			);
		cy.get(`.post-box-wrap`).should(`have.length`, 2).should(`be.visible`);
	});

	it(`C23477653: To verify the screen if there are No Unanswered Posts for Today`, () => {
		const path = `mock-responses/unansweredPost.spec/noPostScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.getDataTestId(`number-of-unanswered-post-heading`)
			.should(`be.visible`)
			.should(`have.text`, `No  unanswered posts found Today`);
		cy.getDataTestId(`no-comments-last7Days-class`).eq(0).should(`be.visible`);
		cy.getDataTestId(`img-no-comments-last7Days-class`).eq(0).should(`be.visible`);
		cy.getDataTestId(`heading-no-comments-last7Days-class`)
			.eq(0)
			.should(`be.visible`)
			.should(`contain.text`, `You’re doing great!`);
		cy.getDataTestId(`subheading-no-comments-last7Days-class`)
			.eq(0)
			.should(`be.visible`)
			.should(`contain.text`, `All recent posts in your group have received comments`);
	});

	it(`C23477654: To verify the screen if there are No Unanswered Posts for Last 7 days`, () => {
		const path = `mock-responses/unansweredPost.spec/noPostScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.getDataTestId(`number-unanswered-post-last-7-days`)
			.should(`be.visible`)
			.should(`have.text`, ` No  unanswered posts from past 7 days`);
		cy.getDataTestId(`img-no-comments-last7Days-class`).eq(1).should(`be.visible`);
		cy.getDataTestId(`heading-no-comments-last7Days-class`)
			.eq(1)
			.should(`be.visible`)
			.should(`contain.text`, `You’re doing great!`);
		cy.getDataTestId(`subheading-no-comments-last7Days-class`)
			.eq(1)
			.should(`be.visible`)
			.should(`contain.text`, `All recent posts in your group have received comments`);
	});

	it.skip(`C23477652: To verify the screen when group is just installed and data is being pulled`, () => {
		const path = `mock-responses/unansweredPost.spec/appNotInstalled`;
		const noCommentspath = `mock-responses/unansweredPost.spec/noPostScenario`;
		cy.MockQueryUsingFile(`GetGroupsByUserId`, path).MockQueries(`getZeroCommentPostsByGroupId`, noCommentspath);
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Kids Nutrition and Recipes 👶🍎🍜`, {timeout: 60000}).should(`be.visible`);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.getDataTestId(`analysing-state-today-class-unanswered`)
			.should(`be.visible`)
			.should(`have.text`, `Analysing Information`);
		cy.getDataTestId(`analysing-state-last7days-class-unanswered`)
			.should(`be.visible`)
			.should(`have.text`, `Analysing Information`);
	});

	it(`C23477655: To verify that screen shows correct data if unanswered posts data is available for today.`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622633011707); //Date is set as 3rd Jun 2021
		cy.getDataTestId(`number-of-unanswered-post-heading`)
			.should(`be.visible`)
			.should(`have.text`, `8 unanswered posts found Today`);
		cy.getDataTestId(`number-unanswered-post-last-7-days`)
			.should(`be.visible`)
			.should(`contain.text`, ` No  unanswered posts from past 7 days`);
		cy.getDataTestId(`img-no-comments-last7Days-class`).should(`be.visible`);
		cy.getDataTestId(`heading-no-comments-last7Days-class`)
			.should(`be.visible`)
			.should(`contain.text`, `You’re doing great!`);
		cy.getDataTestId(`subheading-no-comments-last7Days-class`)
			.should(`be.visible`)
			.should(`contain.text`, `All recent posts in your group have received comments`);
		cy.getDataTestId(`post-raw-today-body`).should(`have.length`, 8);
		cy.getDataTestId(`post-raw-today-text`).each(card => {
			cy.wrap(card).should(`be.visible`).should(`have.text`, `Hello post made by admin`);
		});
		cy.getDataTestId(`post-raw-today-video`).should(`be.visible`);
		cy.getDataTestId('post-raw-today-photo').should(`be.visible`);
	});

	it(`C23477656: To verify that screen shows correct data if unanswered posts data is available for last 7 days.`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622678676000); //Date is set as 2nd Jun 2021
		cy.getDataTestId(`img-no-comments-last7Days-class`).should(`be.visible`);
		cy.getDataTestId(`heading-no-comments-last7Days-class`)
			.should(`be.visible`)
			.should(`contain.text`, `You’re doing great`);
		cy.getDataTestId(`subheading-no-comments-last7Days-class`)
			.should(`be.visible`)
			.should(`contain.text`, `All recent posts in your group have received comments`);
		cy.getDataTestId(`number-of-unanswered-post-heading`)
			.should(`be.visible`)
			.should(`have.text`, `No  unanswered posts found Today`);
		cy.getDataTestId(`number-unanswered-post-last-7-days`).should(`be.visible`).should(`contain.text`, `21`);
		cy.getDataTestId(`post-raw-last7Days-body`).should(`have.length`, 21);
		cy.getDataTestId(`post-raw-last7Days-text`).each(card => {
			cy.wrap(card).should(`be.visible`).should(`have.text`, `Hello post made by admin`);
		});
		cy.getDataTestId(`post-raw-last7Days-video`).should(`be.visible`);
		cy.getDataTestId('post-raw-last7Days-photo').should(`be.visible`);
	});

	it(`C23477657: To verify that Correct image and text is shown on the screen for unanswered.`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622678676000); //Date is set as 2nd Jun 2021
		cy.getDataTestId(`post-raw-last7Days-video`)
			.should(`be.visible`)
			.should(
				`have.attr`,
				`src`,
				`https://scontent-iad3-2.xx.fbcdn.net/v/t15.5256-10/s130x130/188348533_315103930110133_5598375760275185798_n.jpg?_nc_cat=111&ccb=1-3&_nc_sid=1055be&_nc_ohc=U-fefWi2mZkAX9Ekimk&_nc_ht=scontent-iad3-2.xx&tp=7&oh=c06147cc4b8e6e9bf4443f917e642a39&oe=60BA4AC7`
			);
		cy.getDataTestId('post-raw-last7Days-photo')
			.should(`be.visible`)
			.should(
				`have.attr`,
				`src`,
				`https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-0/p130x130/194953388_1844544472373609_545720733404629122_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=ca434c&_nc_ohc=OtvC-EfO5Z0AX9k7dF8&_nc_ht=scontent-lga3-2.xx&tp=6&oh=2958e1c3fefaacbe8eb6e108d3dea2c4&oe=60DCB9F1`
			);
	});

	it(`C23477658: To verify that Correct Date and Time is shown against each post`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622633011707); //Date is set as 2nd Jun 2021
		cy.getDataTestId(`post-raw-today-body`).should(`have.length`, 8);
		cy.window()
			.its(`todaysUnansweredPosts`)
			.then(data => {
				cy.getDataTestId(`post-raw-today-time`).each((card, index) => {
					const {postCreatedAtUTC} = data[index];
					const time = dayjs(postCreatedAtUTC).format(`hh:mm A, MMM DD`);
					cy.wrap(card).should(`be.visible`).should(`contain.text`, time);
				});
			});
	});

	it(`C23477659: To verify that user is taken to fb post when click on FB icon`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622633011707); //Date is set as 2nd Jun 2021
		cy.getDataTestId(`post-raw-today-body`).should(`have.length`, 8);
		cy.window()
			.its(`todaysUnansweredPosts`)
			.then(data => {
				cy.getDataTestId(`post-today-unanswered`).each((card, index) => {
					const {fbGroupId, id} = data[index];
					const postId = id.replace(fbGroupId + '_', '');
					const fbPermlink = 'https://www.facebook.com/groups/' + fbGroupId + `/permalink/` + postId + '/';
					cy.wrap(card).should(`be.visible`).should(`have.attr`, `href`, fbPermlink);
				});
			});
	});
	it(`C23477660: To verify that user is taken to fb post in new tab when click on Respond button`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622633011707); //Date is set as 2nd Jun 2021
		cy.getDataTestId(`post-raw-today-body`).should(`have.length`, 8);
		cy.window()
			.its(`todaysUnansweredPosts`)
			.then(data => {
				cy.getDataTestId(`link-respond-unanswered-post`).each((card, index) => {
					const {fbGroupId, id} = data[index];
					const postId = id.replace(fbGroupId + '_', '');
					const fbPermlink = 'https://www.facebook.com/groups/' + fbGroupId + `/permalink/` + postId + '/';
					cy.wrap(card).should(`be.visible`).should(`have.attr`, `href`, fbPermlink);
				});
			});
	});

	it(`C23477661: To verify that if user has clicked on mark as read then post is removed for unanswered post screen.`, () => {
		const path = `mock-responses/unansweredPost.spec/postUnderTodaySectionScenario`;
		cy.MockQueries(`getZeroCommentPostsByGroupId`, path);
		cy.InterceptRoute(`MarkUnansweredPostAsRead`);
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/unanswered');
		cy.clock(1622633011707); //Date is set as 2nd Jun 2021
		cy.getDataTestId(`post-raw-today-body`).should(`have.length`, 8);
		cy.getDataTestId('post-raw-today-photo').should(`be.visible`);
		cy.getDataTestId(`button-mark-as-read-unanswered`).as(`buttonMarkasRead`).should(`have.length`, 8);
		cy.get(`@buttonMarkasRead`).eq(0).should(`be.visible`).click();
		cy.wait(`@MarkUnansweredPostAsRead`);
		cy.getDataTestId('post-raw-today-photo').should(`not.exist`);
		cy.getDataTestId(`button-mark-as-read-unanswered`).as(`buttonMarkasRead`).should(`have.length`, 7);
	});
});
