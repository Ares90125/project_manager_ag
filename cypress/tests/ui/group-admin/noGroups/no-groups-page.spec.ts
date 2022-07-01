describe(`No group page test cases`, () => {
	before(`login using facebook`, () => {
		cy.fixture(`api-test/convosightWithNoGroups.json`)
			.then(session => {
				cy.RestoreSession(session);
			})
			.visit(`/group-admin/no-groups`)
			.getDataCsLabel(`No`)
			.should(`be.visible`)
			.saveLocalStorage();
	});

	beforeEach(() => {
		cy.restoreLocalStorage().visit(`/group-admin/no-groups`).getDataCsLabel(`No`).as(`btnNo`).should(`be.visible`);
	});

	it(`Verify the page when user click on no for group admin`, () => {
		cy.get(`@btnNo`)
			.click()
			.getDataTestId(`admin-wrapper-text`)
			.should(`have.text`, `Convosight works for facebook group admins only`)
			.getDataCsLabel(`Convosight blog`)
			.as(`blog`)
			.invoke(`attr`, `href`)
			.should(
				`equal`,
				`https://www.convosight.com/blogs/how-to-create-a-facebook-group-in-5-minutes/?utm_source=App_Group_Manage_0Group`
			)
			.get(`@blog`)
			.click()
			.getDataCsLabel(`Facebook share`)
			.as(`share`)
			.invoke(`attr`, `href`)
			.should(
				`equal`,
				`https://www.facebook.com/sharer/sharer.php?u=https://www.convosight.com/?utm_source=App_Group_Manage_0Group&utm_medium=FBShareIconInNoGroupPage`
			)
			.get(`@share`)
			.click();
	});

	it(`Verify the privacy policy component`, () => {
		cy.get(`@btnNo`)
			.should(`be.visible`)
			.getDataCsLabel(`Convosight`)
			.should(`exist`)
			.getDataCsLabel(`Profile Image`)
			.click()
			.getDataCsLabel(`Privacy policy`)
			.should(`be.visible`)
			.click()
			.get(`div.modal-content`)
			.within(() => {
				cy.get(`.modal-title`)
					.should(`contain.text`, `Privacy Policy`)
					.getDataCsLabel(`Add Groups`)
					.should(`be.visible`)
					.getDataCsLabel(`Close`)
					.should(`be.visible`)
					.click();
			});
	});

	it(`Verify the no groups page click on yes for group admin`, () => {
		cy.getDataCsLabel(`Yes`).should(`be.visible`).click();
		cy.get(`.permission-missing-left`).within(() => {
			cy.get(`h6`).as(`leftContent`).should(`have.length`, 3);
			cy.get(`@leftContent`).eq(0).should(`have.text`, `Growth to 7000+ Active Facebook Groups`);
			cy.get(`@leftContent`).eq(1).should(`have.text`, `Trusted by 5000+ Happy Group Admins`);
			cy.get(`@leftContent`).eq(2).should(`have.text`, `All Safe with You Insights, Data & Privacy`);
		});
		cy.get(`.add-group-process`).within(() => {
			cy.getDataCsLabel(`Add Groups`).should(`be.visible`);
			cy.get(`h2 > span`).should(`have.text`, `Oops! No groups found`);
			cy.get(`ul.list-unstyled`).within(() => {
				cy.get(`.group-process-box`).as(`processBox`).should(`have.length`, 4);
				cy.get(`@processBox`)
					.eq(0)
					.within(() => {
						cy.get(`p`).should(`have.text`, `Sign up`);
					});
				cy.get(`@processBox`)
					.eq(1)
					.within(() => {
						cy.get(`p`).should(`have.text`, `Add groups`);
					});
				cy.get(`@processBox`)
					.eq(2)
					.within(() => {
						cy.get(`p`).should(`have.text`, `Add app to Groups`);
					});
				cy.get(`@processBox`)
					.eq(3)
					.within(() => {
						cy.get(`p`).should(`have.text`, `Get Insights`);
					});
			});
			cy.get(`h6`)
				.should(`have.text`, `Are you a facebook group admin?`)
				.getDataCsLabel(`Yes`)
				.should(`be.visible`)
				.getDataCsLabel(`No`)
				.should(`be.visible`);
		});
		cy.getDataCsLabel(`How it works`)
			.click()
			.getDataTestId(`how-it-works-overlay`)
			.should(`be.visible`)
			.getDataTestId(`how-it-works-overlay-close-button`)
			.click();
	});
});
