describe.skip('admin bio test cases 2', () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithAdminBioEnabledNotCompletedUser.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(() => {
		cy.restoreLocalStorage().visit(`/group-admin/settings/admin-bio`);
	});
	it('C23478326: Verify that For very first time, bio section is blank with only Name pre-filled', () => {
		cy.get(`[data-placeholder="Write your bio here..."]`)
			.should('have.text', '')
			.window()
			.scrollTo('center')
			.getDataTestId('video-pitch-adminbio-page')
			.should('not.exist')
			.get(`[placeholder="Enter an achievement"]`)
			.should('not.exist')
			.get(`[data-cs-label="Media Coverage Link opened"]`)
			.should('not.exist')
			.window()
			.scrollTo(0, 500)
			.get(`grouplist-yourgroups-adminbio-page`)
			.should('not.exist')
			.get(`attachfiles-adminbio-page`)
			.should('not.exist')
			.getDataTestId(`link-socialprofile-adminbio-page`)
			.should('not.exist')
			.window()
			.scrollTo('bottom')
			.get(`[role="switch"]`)
			.should('be.visible')
			.get(`[name="email"]`)
			.should('have.value', 'kkhoqshhmh_1637915229@tfbnw.net');
	});

	it(`C23478347: Verify that user is able to delete the video by clicking on x icon
	and C23478345: Verify that user is shown video thumbnail with play icon as soon as video upload completed`, () => {
		cy.window()
			.scrollTo('center')
			.get(`[data-cs-label="Upload video"]`)
			.click()
			.get(`[data-cs-label="Upload Pitch Video"]`)
			.click()
			.attachFile(`../fixtures/files/videos/video1.mp4`)
			.then(() => {
				cy.get(`[data-cs-label="Play"]`)
					.should('be.visible')
					.get(`[src=""]`)
					.should('not.exist')
					.get(`.video-size`)
					.should('be.visible')
					.should(`have.text`, ' 5.10 MB ')
					.getDataTestId(`text-videoname-adminbio-page`)
					.should('have.text', ' video1.mp4 ')
					.getDataTestId(`button-cross-pitchvideo-adminbio`)
					.click()
					.getDataTestId(`button-close-pitchvideo-adminbio`)
					.click()
					.get(`[data-cs-label="Upload video"]`)
					.should('be.visible');
			});
	});

	it(`C23478327: Verify that Preview bio without filling any section should show Empty Screen (blurred one)`, () => {
		cy.get(`[data-cs-label="Preview bio"]`)
			.click()
			.get(`[data-test-id="text-Bio-adminBio-public-page"] span`)
			.should('not.exist')
			.get(`[id="bio-preview-introduction"] div`)
			.should('not.exist')
			.get(`[id="bio-preview-key"] h5`)
			.should('not.exist');
	});

	it(`C23478330: Verify that First and Last names are Non-editable fields`, () => {
		cy.get(`app-bio-personal-info div form input`)
			.eq(0)
			.should('be.disabled')
			.get(`app-bio-personal-info div form input`)
			.eq(1)
			.should('be.disabled');
	});

	it(`C23478331: Verify that user's Location is fetched automatically`, () => {
		cy.get(`app-bio-personal-info button`).eq(1).should('have.text', 'IN');
	});

	it(`C23478344: Verify that user should be able to Cancel the upload in between while uploading video`, () => {
		cy.scrollTo('center')
			.get(`[data-cs-label="Upload video"]`)
			.click()
			.get(`[data-cs-label="Upload Pitch Video"]`)
			.click()
			.attachFile(`../fixtures/files/videos/video1.mp4`)
			.get('[data-cs-label="Cancel upload"]')
			.click()
			.get('[data-cs-label="Cancel upload"]')
			.should('not.exist');
	});

	it(`C23478339: Verify that user is shown Drag and Drop or Browse File option to upload Pitch Video`, () => {
		cy.window()
			.scrollTo('center')
			.get(`[data-cs-label="Upload video"]`)
			.click()
			.get(`app-bio-pitch-video div div h6`)
			.should('have.text', 'Drag and drop your video here or browse file');
	});
});
