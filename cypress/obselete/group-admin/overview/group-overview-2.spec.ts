describe('Group admin test cases', function () {
	const NavigateToOverview = () => {
		const path = `mock-responses/group-overview.spec`;
		cy.MockQueryUsingFile(`GetKeywordTrackerReport`, path);
		cy.visit(`group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2/overview`);
		cy.clock(Date.UTC(2021, 6, 3));
		cy.getDataTestId(`heading-overview`).should(`contain.text`, `Overview`).should(`be.visible`);
	};
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		cy.InterceptRoute([
			`GetLastdayGroupMetricsByGroupId`,
			`FetchConversations`,
			`ListGroupMetricsByGroupId`,
			`FetchConversationBySourceIds`
		]);
		cy.restoreLocalStorage();
	});

	//@ts-ignore
	it('verify unanswered post card', () => {
		NavigateToOverview();
		cy.wait(`@GetLastdayGroupMetricsByGroupId`, {timeout: 30000});
		cy.getDataTestId(`meteric-value-engagment-rate-past30Days`).should(`be.visible`);
		cy.getDataTestId(`meteric-value-activity-rate-past30Days`).should(`be.visible`);
		cy.getDataTestId(`meteric-value-member-growth-past30Days`).should(`be.visible`);
		cy.getDataTestId(`number-of-action-required-keywords-overview`).should(`be.visible`);
		cy.window()
			.its(`DataLast30Days`, {timeout: 30000})
			.then(DataLast30Days => {
				const {unansweredPosts} = DataLast30Days;
				if (unansweredPosts > 0) {
					cy.getDataTestId(`unanswered-post-card-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Reply to unanswered posts`);
					cy.getDataTestId(`number-unanswered-post-overview`)
						.should(`be.visible`)
						.should(`contain.text`, unansweredPosts + ` recent post`);
					cy.getDataCsLabel(`Redirect to unanswered Post`)
						.should(`be.visible`)
						.should(`contain.text`, `View unanswered posts`)
						.click();
					cy.getDataTestId(`heading-unanswered-post-page`)
						.should(`be.visible`)
						.should(`contain.text`, `Unanswered Posts`)
						.click();
					cy.getDataTestId(`subheading-unanswered-post-page`)
						.should(`be.visible`)
						.should(
							`contain.text`,
							`Never leave a post unanswered. This screen shows posts that receive no comments for 2 hours`
						);
					cy.getDataTestId(`number-of-unanswered-post-heading`)
						.should(`be.visible`)
						.should(`contain.text`, unansweredPosts);
				} else {
					cy.getDataTestId(`no-unanswered-post-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Reply to unanswered posts`);
					cy.getDataTestId(`subheading-no-unanswered-post-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `You’re doing great! All recent posts in your group have received comments`);
				}
			});
	});

	it('verify keywords alert card', () => {
		NavigateToOverview();
		cy.wait(`@GetLastdayGroupMetricsByGroupId`, {timeout: 30000});
		cy.getDataTestId(`meteric-value-engagment-rate-past30Days`).should(`be.visible`);
		cy.getDataTestId(`meteric-value-activity-rate-past30Days`).should(`be.visible`);
		cy.getDataTestId(`meteric-value-member-growth-past30Days`).should(`be.visible`);
		cy.getDataTestId(`number-of-action-required-keywords-overview`).should(`be.visible`);
		cy.window()
			.its(`numOfActionRequired`, {timeout: 60000})
			.then(numOfActionRequired => {
				if (numOfActionRequired > 0) {
					cy.getDataTestId(`heading-keyword-alert-card-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Check keyword alerts`);
					cy.getDataTestId(`number-of-action-required-keywords-overview`)
						.should(`be.visible`)
						.should(`contain.text`, numOfActionRequired + `+ alerts`);
					cy.getDataCsLabel(`Redirect to Urgent Alerts`)
						.should(`be.visible`)
						.should(`contain.text`, `View keyword alerts`)
						.click();
					cy.getDataTestId(`heading-keywords-alert-page`).should(`be.visible`).should(`contain.text`, `Keyword Alerts`);
					cy.getDataTestId(`keyword-alert-report-table`).should(`be.visible`);
				} else {
					cy.getDataTestId(`review-all-keyword-alert-card-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Check keyword alerts`);
					cy.getDataTestId(`subheading-reviewed-keyword-alert`)
						.should(`be.visible`)
						.should(`contain.text`, `Nicely done! You have reviewed all keyword alerts for now`);
				}
			});
	});

	it('verify Group Health button', () => {
		NavigateToOverview();
		cy.getDataTestId(`meteric-value-engagment-rate-past30Days`).should(`be.visible`);
		cy.getDataTestId(`button-view-group-health-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `View Group Health`)
			.click();
		cy.getDataTestId(`heading-group-Health`).should(`be.visible`).should(`contain.text`, `Group Health`);
	});
});
