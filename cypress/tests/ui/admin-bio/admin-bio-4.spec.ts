describe.skip('admin bio test cases 4', () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});

		cy.visit('/group-admin/settings/admin-bio?ref=open_admin_bio_popup')
			.get('app-bio-personal-info form .ql-editor')
			.clear()
			.type(updatingBioData.bio)
			.get(`[placeholder="Enter an achievement"]`)
			.clear()
			.type(updatingBioData.achievements)
			.window()
			.scrollTo('center')
			.get(`[data-cs-label="Upload video"]`)
			.click()
			.get(`[data-cs-label="Upload Pitch Video"]`)
			.click()
			.attachFile(`../fixtures/files/videos/video1.mp4`)
			.get(`[data-cs-label="Add article"]`)
			.click()
			.get(`[placeholder="Paste article URL here.."]`)
			.type(updatingBioData.meiadURL)
			.get(`[data-cs-label="Done"]`)
			.first()
			.click()
			.get(`[data-cs-label="Select groups"]`)
			.first()
			.click()
			.get(`//*[@id="mat-checkbox-2"]/label/span[1]`)
			.click()
			.get(`//*[@id="mat-checkbox-3"]/label/span[1]`)
			.click()
			.get(`[data-cs-label="Done"]`)
			.click()
			.get(`[data-cs-label="Upload file"]`)
			.click()
			.get(`[data-cs-label="Upload Supoorting Docs"]`)
			.click()
			.attachFile(`../fixtures/files/pictures/pic1.jpg`);
	});

	it(`verify that draft changes on admin bio should not get publish on the public profile page`, () => {
		cy.visit(`/public/admin/3a4930da-3da0-4dd2-9cbf-e9ca3860de66?utm_source=shareButton`)
			.get(`app-bio-preview-introduction .bio`)
			.should('have.text', `Testing the Admin Bio`)
			.get(`app-admin-bio-preview .achievements-wrap span`)
			.last()
			.should('have.text', `Testing the Admin Bio`);
	});

	after('restting the data of the admin bio page', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit('/group-admin/settings/admin-bio?ref=open_admin_bio_popup')
			.get('app-bio-personal-info form .ql-editor')
			.clear()
			.type('Testing the Admin Bio')
			.get(`[placeholder="Enter an achievement"]`)
			.clear()
			.type('Testing the Admin Bio');
	});
});

export const updatingBioData = {
	bio: 'updating the bio information but not publishing',
	achievements: 'updating the my achievements but not publishing',
	meiadURL: 'https://www.infoq.com/articles/series-enhancing-resilience-5/',
	fileAttachment: `../fixtures/files/Worksheets/groupidsxlsx.xlsx`,
	socailMediaURL: 'https://www.facebook.com/profile.php?id=100052385131544'
};
