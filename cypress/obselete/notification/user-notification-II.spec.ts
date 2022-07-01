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
		cy.restoreLocalStorage();
		cy.InterceptRoute([`GetLastdayGroupMetricsByGroupId`]);
	});

	it(`Verify the page elements`, {tags: [`@pullRequest`]}, () => {
		const path = `mock-responses/user-notification.spec`;
		cy.MockQueryUsingFile(`GetNotifications`, path);
		cy.visit('group-admin/manage');
		OpenNotificationPanel();
		cy.getDataTestId(`heading-notification-pannel`).should(`be.visible`).should(`contain.text`, `Notifications`);
		// cy.getDataTestId(`notification-mark-all-read`).should(`be.visible`).should(`contain.text`, `Mark all as read`);
		cy.getDataTestId(`text-notification`).should(`be.visible`);
		cy.getDataCsLabel(`Bell`).eq(0).should(`be.visible`).click();
		cy.get(`[class="notification-dropdown-wrapper dropdown-menu dropdown-menu-right show"]`).should(`not.exist`);
	});

	it(`Verify convosight app installation notification`, {tags: [`@pullRequest`]}, () => {
		OpenNotificationPanel();
		cy.contains(`[data-test-id="text-notification"]`, 'Installation of Convosight completed in Hello WOrld 10')
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId('notfication-redirection-link').click();
			});
		// cy.wait(`@GetLastdayGroupMetricsByGroupId`, {timeout: 30000});
		//cy.getDataTestId(`heading-overview`).should(`contain.text`, `Overview`).should(`be.visible`);
		cy.getDataTestId(`toggle-group-list-drop-down`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`group-name-sidebar`).should(`be.visible`).should(`contain.text`, `Hello WOrld 10`);
			});
	});

	it(`Verify convosight app added notification`, () => {
		OpenNotificationPanel();
		cy.contains(`[data-test-id="text-notification"]`, 'Convosight App is added to your Facebook group Hello World 8')
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId('notfication-redirection-link').click();
			});
		cy.contains(`.list-item`, `Hello WOrld 10`, {timeout: 30000}).should(`be.visible`);
	});

	it(`Verify unistallation of convosight app notification`, () => {
		cy.get(`button.linker`).eq(0).click();
		// cy.wait(`@GetLastdayGroupMetricsByGroupId`, {timeout: 30000});
		OpenNotificationPanel();
		cy.contains(`[data-test-id="text-notification"]`, 'Uninstall of Convosight complete in Hello WOrld 4')
			.scrollIntoView()
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId('notfication-redirection-link').click();
			});
		cy.contains(`.list-item`, `Hello WOrld 10`, {timeout: 30000}).should(`be.visible`);
	});

	it(`Verify added as moderator notification`, () => {
		OpenNotificationPanel();
		cy.contains(
			`[data-test-id="text-notification"]`,
			'You have been added as a Moderator to a new group by Mukta Gupta'
		)
			.scrollIntoView()
			.should(`be.visible`);
	});
});
