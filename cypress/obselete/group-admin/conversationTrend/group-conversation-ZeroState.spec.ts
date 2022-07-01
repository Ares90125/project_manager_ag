describe('Group admin test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		const path = `mock-responses/group-conversation-ZeroState.spec`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path);
		cy.InterceptRoute([`GetLastdayGroupMetricsByGroupId`, `FetchConversations`, `ListGroupMetricsByGroupId`]);
		cy.restoreLocalStorage();
	});

	it('verify 7 days page elements when no conversations are there', () => {
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/conversationtrends#7days`);
		cy.clock(Date.UTC(2021, 6, 4));
		cy.getDataTestId(`image-no-conversation-trend`).should(`be.visible`);
		cy.getDataTestId(`heading-text-no-conversation-trend`)
			.should(`be.visible`)
			.should(`have.text`, `No conversation trends found, yet`);
		cy.getDataTestId(`subheading-text-no-conversation-trend`)
			.should(`be.visible`)
			.should(
				`have.text`,
				` Due to your inactivity on Convosight, we did not update your latest data. You will be able to see updated data in 24 hours `
			);
	});

	it('verify 14 days page elements when no conversations are there', () => {
		cy.getDataCsLabel(`14 days`).should(`be.visible`).click();
		cy.getDataTestId(`heading-text-no-conversation-trend`)
			.should(`be.visible`)
			.should(`have.text`, `No conversation trends found, yet`);
		cy.getDataTestId(`subheading-text-no-conversation-trend`)
			.should(`be.visible`)
			.should(
				`have.text`,
				` Due to your inactivity on Convosight, we did not update your latest data. You will be able to see updated data in 24 hours `
			);
	});
});
