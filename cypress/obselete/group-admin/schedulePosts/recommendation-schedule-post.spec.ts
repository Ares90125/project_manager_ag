import dayjs from 'dayjs';

describe.skip(`Recommendation Suggestion and Timings Scenarios`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
	});

	it(`Verify the page elements for timing suggestion`, () => {
		const path = `mock-responses/recommendation-schedule-post.spec`;
		cy.MockQueryUsingFile(`GetGRecommendationByDay`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/scheduledposts`);
		const time = dayjs().add(1, `day`).set(`hour`, 9).unix();
		cy.clock(time);
		cy.getDataCsLabel(`Continue`).click();
		cy.getDataTestId(`create-own-post-list-posts-screen`)
			.should(`be.visible`)
			.should(`contain.text`, `Create your own posts`);
		cy.getDataTestId(`subheading-create-own-post`)
			.should(`be.visible`)
			.should(`contain.text`, `SUGGESTED POSTING TIMES FOR THE DAY`);
		cy.getDataTestId(`heading-create-own-post-box`)
			.eq(0)
			.should(`be.visible`)
			.should(`contain.text`, `Schedule a post for 10:00 PM for high engagement`);
		cy.getDataTestId(`button-schedule-suggest-timings`).should(`be.visible`).eq(0).should(`contain.text`, `Schedule`);
		cy.getDataTestId(`heading-create-own-post-box`)
			.eq(1)
			.should(`be.visible`)
			.should(`contain.text`, `Schedule a post for 07:00 AM for high engagement`);
		cy.getDataTestId(`button-schedule-suggest-timings`).should(`be.visible`).eq(1).should(`contain.text`, `Schedule`);
		cy.getDataTestId(`heading-create-own-post-box`)
			.eq(2)
			.should(`be.visible`)
			.should(`contain.text`, `Schedule a post for 09:00 AM for high engagement`);
		cy.getDataTestId(`button-schedule-suggest-timings`).should(`be.visible`).eq(2).should(`contain.text`, `Schedule`);
	});

	it(`Verify the page elements for post suggestion`, () => {
		const path = `mock-responses/recommendation-schedule-post.spec`;
		cy.MockQueryUsingFile(`GetGRecommendationByDay`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/scheduledposts`);
		const time = dayjs().add(1, `day`).set(`hour`, 9).unix();
		cy.clock(time);
		cy.getDataCsLabel(`Continue`).click();
		cy.getDataTestId(`suggested-post-listpost`)
			.should(`be.visible`)
			.should(`contain.text`, `Suggested posts by Convosight`);
		cy.getDataTestId(`figure-image-suggested-post`).eq(0).should(`be.visible`);
		cy.getDataTestId(`recommendation-heading-description-suggested-post`).eq(0).should(`be.visible`);
		cy.getDataTestId(`button-schedule-suggested-post`)
			.should(`be.visible`)
			.eq(0)
			.should(`contain.text`, `Schedule this post for 10:00 PM`);
		cy.getDataTestId(`recommendation-heading-description-suggested-post`).eq(1).should(`be.visible`);
		cy.getDataTestId(`button-schedule-suggested-post`)
			.should(`be.visible`)
			.eq(1)
			.should(`contain.text`, `Schedule this post for 07:00 AM`);
		cy.getDataTestId(`recommendation-heading-description-suggested-post`).eq(2).should(`be.visible`);
		cy.getDataTestId(`button-schedule-suggested-post`)
			.should(`be.visible`)
			.eq(2)
			.should(`contain.text`, `Schedule this post for 09:00 AM`);
	});

	it(`Verify the post is scheduled for the time selected by user for recommended time`, () => {
		const path = `mock-responses/recommendation-schedule-post.spec`;
		cy.MockQueryUsingFile(`GetGRecommendationByDay`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/scheduledposts`);
		cy.getDataCsLabel(`Continue`).click();
		cy.contains(`[data-test-id="heading-create-own-post-box"]`, `Schedule a post for 10:00 PM for high engagement`)
			.parent()
			.within(() => {
				cy.getDataTestId(`button-schedule-suggest-timings`)
					.should(`be.visible`)
					.eq(0)
					.should(`contain.text`, `Schedule`)
					.click();
			});

		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});

		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.get(`[id="mat-radio-3-input"]`).should(`be.checked`).should(`be.visible`);
		cy.get(`[data-test-id="suggested-post-time"]`).eq(0).should(`be.visible`).should(`contain.text`, `10:00 PM`);
		cy.get('#postMessage').type(`this is a text post`);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.contains(`[data-test-id="scheduled-post-body"]`, `this is a text post`).as(`post`);
		const date = dayjs().format(`MMM D`);
		cy.contains(`[data-test-id="post-time"]`, date)
			.should(`be.visible`)
			.then(value => {
				expect(value.text()).satisfy(value => value == '10:00PM' || '10:01PM');
			});
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`contain.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
	});
	it(`Verify the post is scheduled for the time selected by user for the recommended post suggestion`, () => {
		const path = `mock-responses/recommendation-schedule-post.spec`;
		cy.MockQueryUsingFile(`GetGRecommendationByDay`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/scheduledposts`);
		cy.getDataCsLabel(`Continue`).click();
		cy.contains(`[data-test-id="button-schedule-suggested-post"]`, `Schedule this post for 10:00 PM`)
			.should(`be.visible`)
			.eq(0)
			.click();
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});

		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.get(`[id="mat-radio-3-input"]`).should(`be.checked`).should(`be.visible`);
		cy.get(`[data-test-id="suggested-post-time"]`).eq(0).should(`be.visible`).should(`contain.text`, `10:00 PM`);
		cy.getDataTestId(`suggested-post-time`).eq(0).should(`be.visible`).should(`contain.text`, `10:00 PM`);
		cy.get('#postMessage').invoke(`val`).should(`eq`, `Write something about Nutrition.. Pregnancy.. Feeding.. `);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.contains(`[data-test-id="scheduled-post-body"]`, `Write something about Nutrition.. Pregnancy.. Feeding.. `).as(
			`post`
		);
		const date = dayjs().format(`MMM D`);
		cy.contains(`[data-test-id="post-time"]`, date).should(`be.visible`);
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`contain.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
	});
});
