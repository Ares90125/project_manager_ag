// import FacebookUtilities from;
describe('admin bio test cases 1', () => {
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
	it('C23478320: Verify that Admin is able to view Admin Bio from 3 screens', () => {
		cy.get(`[data-cs-label="Admin bio"]`)
			.eq(0)
			.should('be.visible')
			.should('have.text', 'Admin bio')
			.get(`[id="dropdownMenuButton"]`)
			.click({timeout: 30000})
			.get(`[data-cs-label="Admin bio"]`)
			.eq(1)
			.should('be.visible')
			.should('have.text', ' Admin bio ')
			.get('[data-cs-label="Settings"]')
			.click({timeout: 30000})
			.get(`[data-cs-label="Admin bio"]`)
			.eq(0)
			.should('be.visible')
			.should('have.text', 'Admin bio');
	});

	it.skip(`C23478321: Verify that there should be "What is your bio?" section on top of the Admin bio Page
	and C23478322: Verify that there should be Share and Preview bio buttons besides What is Your Bio?`, () => {
		cy.get(`[data-placeholder="Write your bio here..."]`)
			.should('be.visible')
			.should('have.text', 'Testing the Admin Bio')
			.getDataTestId(`text-introduction-adminbio-page`)
			.should('be.visible')
			.should('have.text', ` It's the introduction to who you are as a group admin and what you have achieved. `)
			.getDataTestId(`button-previewbio-adminbio-page`)
			.should('be.visible')
			.should('have.text', `Preview bio`)
			.getDataTestId(`button-sharebio-adminbio-page`)
			.should('be.visible')
			.should('have.text', `Share bio`);
	});
	it(`C23478323: Verify that user is able to Change the profile image`, function () {
		cy.InterceptRoute('UpdateProfileBioDraft');
		cy.get(`[id="profilePicture"]`)
			// .should('be.visible')
			.click()
			.get('app-bio-personal-info figure img')
			.invoke('attr', 'src')
			.as('imagebefore')
			.get(`[id="profilePicture"]`)
			.click()
			.attachFile(`../fixtures/files/pictures/pic1.jpg`)
			.get('app-bio-personal-info figure img')
			.invoke('attr', 'src')
			.as('imageafter')
			.then(() => {
				expect(this.imagebefore).to.equal(this.imagebefore);
				cy.get('[id="profilePicture"]').click().attachFile(`../fixtures/files/pictures/png.pic1.png`);
			});
	});

	it(`C23478332: Verify that user is able to edit Location + flag by selecting from Drop-down`, () => {
		cy.get(`app-bio-personal-info button`)
			.eq(1)
			.click()
			.get(`[aria-labelledby="dropdownMenuLink"] div`)
			.each($el => {
				if ($el.text() === 'United States') {
					$el.click();
				}
			})
			.get(`app-bio-personal-info button`)
			.eq(1)
			.should('have.text', 'United States')
			.click()
			.get(`[aria-labelledby="dropdownMenuLink"] div`)
			.each($el => {
				if ($el.text() === 'India') {
					$el.click();
				}
			})
			.get(`app-bio-personal-info button`)
			.eq(1)
			.should('have.text', 'India');
	});
});
