describe('Moderator test cases', function () {
	const path = `mock-responses/moderator.spec`;

	const VerifyHeading = (headingSelector: string, headingText: string) => {
		return cy.getDataTestId(headingSelector).should(`be.visible`).should(`have.text`, headingText);
	};
	const VerifySubHeading = (subHeadingSelector: string, subHeadingText: string) => {
		return cy.getDataTestId(subHeadingSelector).should(`be.visible`).should(`have.text`, subHeadingText);
	};

	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(() => {
		cy.restoreLocalStorage();
		cy.InterceptRoute([`GetGroupModeratorsByGroupId`, `GetInvitations`]);
	});

	it('Verify page elements for Add moderator Page without any moderator', () => {
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.MockQueryUsingFile(`GetInvitations`, path).MockQueryUsingFile(`GetGroupModeratorsByGroupId`, path);
		cy.getDataTestId(`btn-group-add-moderators`).should(`be.visible`).should(`have.text`, `Add Moderators`).click();
		cy.getDataTestId(`no-moderator-image`).should(`be.visible`);
		VerifyHeading(`heading-no-moderator`, `You have not added any moderators yet`);
		VerifySubHeading(`subheading-no-moderaor`, `Moderators can help you manage your groups.`);
		cy.getDataTestId(`button-add-moderator`).should(`be.visible`).should(`have.text`, ` Add new moderator `);
		cy.getDataTestId(`link-see-moderator-permission`)
			.should(`be.visible`)
			.should(`have.text`, `See moderators permissions `);
	});
	it('Verify button add moderator is redirected to add moderator screen.', () => {
		cy.getDataTestId(`button-add-moderator`).should(`be.visible`).click();
		cy.getDataTestId(`button-send-invite`)
			.should(`be.visible`)
			.should(`be.disabled`)
			.should(`have.text`, `Send invite`);
		cy.getDataTestId(`field-mobileNumber-add-moderator-pop-up`).should(`be.visible`);
		cy.getDataTestId(`field-Email-add-moderator-pop-up`).should(`be.visible`);
		cy.getDataTestId(`field-name-add-moderator-pop-up`).should(`be.visible`);
		cy.getDataTestId(`button-close-add-moderator`).should(`be.visible`).click();
		cy.getDataTestId(`add-moderator-detail-pop-up`).should(`have.attr`, `aria-hidden`, `true`);
	});

	it('Verify link see moderator permissions pop up ', () => {
		cy.getDataTestId(`link-see-moderator-permission`).should(`be.visible`).click();
		VerifyHeading(`moderator-permission-heading`, ` What can moderators do with your groups? `);
		cy.getDataTestId(`permission-table-mooderator`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`column-first-permission-table`).should(`be.visible`).should(`have.text`, `Features`);
				cy.getDataTestId(`column-second-permission-table`).should(`be.visible`).should(`have.text`, `Administrator`);
				cy.getDataTestId(`column-third-permission-table`).should(`be.visible`).should(`have.text`, `Moderator`);
			});
		cy.getDataTestId(`button-close-moderator-permission`).should(`be.visible`).click();
		cy.getDataTestId(`moderation-permission-pop-up`).should(`have.attr`, `aria-hidden`, `true`);
	});

	it('Verify add moderator screen elements when moderator exist', () => {
		cy.reload();
		cy.getDataTestId(`btn-group-add-moderators`).should(`be.visible`).should(`have.text`, `Add Moderators`).click();
		cy.contains(`[data-test-id="moderator-name"]`, `Devashish Testuser`)
			.should(`be.visible`)
			.should(`have.text`, `Devashish Testuser`);
		VerifyHeading(`heading-add-moderator`, `Add Moderators`);
		VerifySubHeading(`subheading-add-moderator`, `Invite other admins and moderators of your group to Convosight`);
		VerifySubHeading(`moderator-sub-heading-number`, ` All moderators 3`);
		VerifyHeading(`heading-moderator-permissions`, ` What can moderators do with your groups? `);
		cy.getDataTestId(`search-moderator-field`).should(`be.visible`);
		cy.getDataTestId(`button-add-new-moderator`).should(`be.visible`).should(`have.text`, ` Add new moderator `);
		cy.getDataTestId(`moderator-table-name-column`).should(`be.visible`).should(`have.text`, `NAME`);
		cy.getDataTestId(`moderator-table-status-column`).should(`be.visible`).should(`have.text`, `STATUS`);
		cy.getDataTestId(`moderator-table-contact-column`).should(`be.visible`).should(`have.text`, `CONTACT`);
	});

	it('Verify user is able to search moderator from the existing moderators present on table', () => {
		cy.contains(`[data-test-id="moderator-name"]`, `Devashish Testuser`).should(`be.visible`);
		cy.getDataTestId(`search-moderator-field`).as(`searchfield`).should(`be.visible`).type(`Moderator`);
		cy.contains(`[data-test-id="moderator-name"]`, `testModerator`)
			.should(`be.visible`)
			.should(`have.text`, `testModerator`);
		cy.getDataTestId(`moderator-invitation-status-invited`).should(`be.visible`).should(`have.text`, ` Invited `);
		cy.contains(`[data-test-id="moderator-email"]`, ` test@gmail.com `).should(`be.visible`);
		cy.contains(`[data-test-id="moderator-phone"]`, ` 88888 88888 `).should(`be.visible`);
		cy.getDataTestId(`moderator-name`).as(`nameValue`).should(`have.lengthOf`, `1`);
		cy.get(`@searchfield`).clear();
		cy.getDataTestId(`moderator-name`).should(`have.lengthOf.greaterThan`, 1);
	});
});
