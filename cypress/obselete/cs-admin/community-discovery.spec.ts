describe.skip(`Community discovery spec`, () => {
	const path = 'mock-responses/community-discovery.spec';
	before(() => {
		const replyFixture = (req, fixture) =>
			req.reply({
				fixture: fixture
			});
		cy.LoginAsCSAdmin();
		cy.InterceptRoute([`GetCampaignsByBrandId`]);
		cy.intercept(
			{
				method: `POST`,
				url: Cypress.env(`developAppSyncUrl`)
			},
			req => {
				const {query, variables} = req.body;
				if (query.includes(`CommunityDiscoveryAPI`)) {
					switch (variables.input.sortBy) {
						case 'memberCount':
							replyFixture(req, `${path}/communityDiscoveryMemberCount.json`);
							break;
						case 'memberEngagementRateUTC':
							replyFixture(req, `${path}/communityDiscoveryMemberEngagement.json`);
							break;
						case 'postEngagementRateUTC':
							replyFixture(req, `${path}/communityDiscoveryActivityScore.json`);
							break;
						default:
							replyFixture(req, `${path}/communityDiscoveryMemberCount.json`);
					}
				}
			}
		);
		cy.MockQueryUsingFile(`communityDiscoveryFilters`, path);
		cy.visit(`/cs-admin/brands/b25e02a0-6fcf-4395-ab74-84962a802f13/create-campaign`)
			.get(`[placeholder="Campaign name"]`)
			.focus();
		cy.type(`New Test Campaign`);
		cy.getDataTestId(`create-campaign-btn-next`)
			.click()
			.getDataCsLabel(`Community Marketing`)
			.click()
			.get(`button`)
			.contains(` Continue `)
			.click()
			.wait(`@GetCampaignsByBrandId-1`);
	});

	it(`should have the community count`, () => {
		cy.getDataCsLabel(`Add communities`).click();
		cy.get(`div.community-header-sort`).find(`h2`).should(`have.text`, `Showing 62 communities`);
	});

	it(`should select all groups using toggle all`, () => {
		cy.getDataTestId(`community-discovery-chkBox-toggleAll`)
			.click()
			.getDataTestId(`community-discovery-chkBox`)
			.each($ele => {
				cy.wrap($ele).should(`have.class`, `mat-checkbox-checked`);
			});
	});

	it(`should unselect all groups using toggle all`, () => {
		cy.getDataTestId(`community-discovery-chkBox-toggleAll`)
			.click()
			.getDataTestId(`community-discovery-chkBox`)
			.each($ele => {
				cy.wrap($ele).should(`not.have.class`, `mat-checkbox-checked`);
			});
	});

	it(`should select the sorting option`, () => {
		cy.getDataTestId(`button-drop-down`).click();
		cy.contains(`.dropdown-item`, ` Engagement % `).click();
		cy.get(`div.community-header-sort`).find(`h2`).should(`have.text`, `Showing 82 communities`);
	});
});
