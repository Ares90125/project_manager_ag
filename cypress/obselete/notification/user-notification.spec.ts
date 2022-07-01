describe.skip(`User notification on group side`, () => {
	const OpenNotificationPanel = () => {
		cy.getDataCsLabel(`Bell`).eq(0).should(`be.visible`).click();
		cy.get(`[class="notification-dropdown-wrapper dropdown-menu dropdown-menu-right show"]`).should(`be.visible`);
	};

	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(`restore the session`, () => {
		const path = `mock-responses/user-notification.spec`;
		cy.MockQueryUsingFile(`GetNotifications`, path);
		cy.restoreLocalStorage();
		cy.visit('group-admin/manage').InterceptRoute(`GetLastdayGroupMetricsByGroupId`);
	});

	it(`Verify Urgent Alert notification`, {tags: [`@pullRequest`]}, () => {
		OpenNotificationPanel();
		cy.contains(`[data-test-id="text-notification"]`, 'Keep your group safe. Act upon the urgent alerts.')
			.scrollIntoView()
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId('notfication-redirection-link').click();
			});
		cy.getDataTestId(`heading-keywords-alert-page`).should(`be.visible`).should(`have.text`, `Keyword Alerts`);
		cy.getDataTestId(`toggle-group-list-drop-down`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`group-name-sidebar`).should(`be.visible`).should(`contain.text`, `Homemaking Tips`);
			});
	});

	it(`Verify welcome note notification`, () => {
		OpenNotificationPanel();
		cy.contains(`[data-test-id="text-notification"]`, 'Welcome to Convosight').scrollIntoView().should(`be.visible`);
	});
});
