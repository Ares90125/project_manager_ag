describe('admin bio test cases 3', () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});
	beforeEach(() => {
		cy.restoreLocalStorage();
		cy.visit('/group-admin/settings/admin-bio?ref=open_admin_bio_popup');
	});
	it(`C23478336: Verify that User's Bio section renders properly with all editor tools in Admin Bio Preview page`, () => {
		cy.window()
			.scrollTo(0, 500)
			.get(`app-bio-personal-info form h5`)
			.should('have.text', ` About me`)
			.get(`app-bio-personal-info form h6`)
			.should('have.text', `Write a brief description about yourself with regards to your Facebook groups.`)
			.get(`[data-placeholder="Write your bio here..."]`)
			.should('have.attr', 'contenteditable', 'true')
			.get('app-bio-personal-info form quill-editor .ql-bold')
			.should('be.visible')
			.get(`app-bio-personal-info form quill-editor .ql-italic`)
			.should('be.visible')
			.should('have.attr', 'type', 'button')
			.get(`app-bio-personal-info form quill-editor .ql-link`)
			.should('be.visible')
			.should('have.attr', 'type', 'button')
			.get(`app-bio-personal-info form quill-editor .ql-list`)
			.eq(0)
			.should('be.visible')
			.should('have.attr', 'type', 'button')
			.should('have.attr', 'value', 'ordered')
			.get(`app-bio-personal-info form quill-editor .ql-list`)
			.eq(1)
			.should('be.visible')
			.should('have.attr', 'type', 'button')
			.should('have.attr', 'value', 'bullet');
	});
});
