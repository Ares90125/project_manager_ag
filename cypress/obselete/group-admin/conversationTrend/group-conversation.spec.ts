describe('Group admin test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		const path = `mock-responses/group-conversation.spec`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path);
		cy.restoreLocalStorage();
	});

	it('verify 7 days page elements', () => {
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/conversationtrends#7days`);
		cy.clock(Date.UTC(2021, 6, 4));
		cy.getDataTestId(`group-conversation-heading`).should(`be.visible`).should(`contain.text`, `Conversations`);
		cy.getDataTestId(`group-conversation-subHeading`)
			.should(`be.visible`)
			.should(`contain.text`, `Detailed insights on the conversations happening in your group`);
		cy.getDataCsLabel(`7 days`).should(`be.visible`).should(`contain.text`, ` 7 days `);
		cy.getDataTestId(`heading-top10DiscussedTopics`)
			.should(`be.visible`)
			.should(`contain.text`, `Top 10 discussed topics`);
		cy.getDataTestId(`subheading-top10DiscussedTopics`)
			.should(`be.visible`)
			.should(`contain.text`, ` These are the topics that is being talked about the most recently in your group `);
		cy.getDataTestId(`heading-top5categories`).should(`be.visible`).should(`contain.text`, `Top 5 categories`);
		cy.getDataTestId(`subheading-top5categories`)
			.should(`be.visible`)
			.should(`contain.text`, ` These are some of the categories identified from the conversations in your group `);
		cy.getDataTestId(`parenting-heading-card-issues`)
			.should(`be.visible`)
			.should(`contain.text`, ` Top 5 Issue keywords identified `);
		cy.getDataTestId(`parenting-heading-card-remedy`)
			.should(`be.visible`)
			.should(`contain.text`, ` Top 5 Remedy keywords identified `);
		cy.getDataTestId(`parenting-heading-card-products`)
			.should(`be.visible`)
			.should(`contain.text`, `Top 5  Products identified`);
		cy.getDataTestId(`parenting-heading-card-brands`)
			.should(`be.visible`)
			.should(`contain.text`, `Top 5  Brands identified`);
	});

	it('verify 7 days top 5 card issues ', () => {
		const cards = [
			'Constipation 7718+ mentions',
			'Weight 2752+ mentions',
			'Digestion 2353+ mentions',
			'Infection 1852+ mentions',
			'Growth 1760+ mentions'
		];
		cy.getDataTestId(`text-card-isssue`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 7 days top 5 remedy keywords ', () => {
		const cards = [
			'Water 5271+ mentions',
			'Supplement 4795+ mentions',
			'Vegetables 3178+ mentions',
			'Turmeric 3046+ mentions',
			'Calcium 2996+ mentions'
		];
		cy.getDataTestId(`remedy-keyword-text`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 7 days top 5 Products keywords ', () => {
		const cards = [
			'Dairy 10315+ mentions',
			'Oil 2920+ mentions',
			'Formula 2518+ mentions',
			'Fruit 2204+ mentions',
			'Vegetable 1943+ mentions'
		];
		cy.getDataTestId(`top-5-products-text`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 7 days top 5 Brands ', () => {
		const cards = [
			'Aptamil 7028+ mentions',
			'Pediasure 2232+ mentions',
			'Dexolac 923+ mentions',
			'Nan Pro 745+ mentions',
			'Biotique 649+ mentions'
		];
		cy.getDataTestId(`top-5-brands-list`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 7 days top 10 discussed conversations', () => {
		const path = `mock-responses/group-conversation.spec/fetchConversationsMilk`;
		cy.MockQueryUsingFile(`FetchConversations`, path);
		cy.getDataTestId(`card-top-10-topics`).as(`viewMentions`).should(`have.length`, `5`);
		cy.get(`@viewMentions`)
			.eq(0)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`conversation-card-name`).as(`card`).should(`contain.text`, `Milk`);
				cy.get(`@card`).click();
			});
		cy.getDataTestId(`heading-conversation-container`).should(`be.visible`).should(`contain.text`, `Milk`);
		cy.getDataTestId(`conversation-text`).each(card => {
			cy.wrap(card).should(`contain.text`, `ilk`);
		});
		cy.getDataTestId(`close-conversation-container`).should(`be.visible`).click();
		cy.getDataTestId(`heading-conversation-container`).should(`not.exist`);
	});

	it('verify 7 days top 10 discussed Cards', () => {
		const cards = ['Milk', 'Food', 'Aptamil', 'Fruit', 'Prayer', 'Powder', 'Water', 'Recipe', 'Activity', 'Delicious'];
		const mentions = ['2852+', '889+', '830+', '617+', '591+', '552+', '539+', '517+', '475+', '468+'];
		cy.getDataTestId(`card-top-10-topics`).as(`viewMentions`).should(`have.length`, `5`);
		cy.get(`@viewMentions`).each((card, index) => {
			cy.wrap(card).within(() => {
				cy.getDataTestId(`conversation-card-name`).should(`contain.text`, cards[index]);
				cy.getDataTestId(`mentions-count`).should(`contain.text`, mentions[index] + ' mentions');
			});
		});
	});

	it('verify 7 days top 5 Categories ', () => {
		const cards = ['Nutrition', 'Toddler Nutrition & Gut Health', 'Foods And Recipes', 'Women Beauty', 'Food'];
		const mentions = ['14597 +', '12334 +', '11055 +', '10995 +', '10131 +'];
		cy.getDataTestId(`top-5-Categories-cards`).as(`viewMentions`).should(`have.length`, `5`);
		cy.get(`@viewMentions`).each((card, index) => {
			cy.wrap(card).within(() => {
				cy.getDataTestId(`category-card-name`).should(`contain.text`, cards[index]);
				cy.getDataTestId(`mentions-categories`).should(`contain.text`, mentions[index] + ' conversations');
			});
		});
	});

	it('verify 14 days page elements', () => {
		const path = `mock-responses/group-conversation.spec`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/conversationtrends#7days`);
		cy.clock(Date.UTC(2021, 6, 4));
		cy.getDataTestId(`group-conversation-heading`).should(`be.visible`).should(`contain.text`, `Conversations`);
		cy.getDataTestId(`group-conversation-subHeading`)
			.should(`be.visible`)
			.should(`contain.text`, `Detailed insights on the conversations happening in your group`);
		cy.getDataCsLabel(`14 days`).should(`be.visible`).click();
		cy.getDataTestId(`heading-top10DiscussedTopics`)
			.should(`be.visible`)
			.should(`contain.text`, `Top 10 discussed topics`);
		cy.getDataTestId(`subheading-top10DiscussedTopics`)
			.should(`be.visible`)
			.should(`contain.text`, ` These are the topics that is being talked about the most recently in your group `);
		cy.getDataTestId(`heading-top5categories`).should(`be.visible`).should(`contain.text`, `Top 5 categories`);
		cy.getDataTestId(`subheading-top5categories`)
			.should(`be.visible`)
			.should(`contain.text`, ` These are some of the categories identified from the conversations in your group `);
		cy.getDataTestId(`parenting-heading-card-issues`)
			.should(`be.visible`)
			.should(`contain.text`, ` Top 5 Issue keywords identified `);
		cy.getDataTestId(`parenting-heading-card-remedy`)
			.should(`be.visible`)
			.should(`contain.text`, ` Top 5 Remedy keywords identified `);
		cy.getDataTestId(`parenting-heading-card-products`)
			.should(`be.visible`)
			.should(`contain.text`, `Top 5  Products identified`);
		cy.getDataTestId(`parenting-heading-card-brands`)
			.should(`be.visible`)
			.should(`contain.text`, `Top 5  Brands identified`);
	});

	it('verify 14 days top 5 card issues ', () => {
		const cards = [
			'Constipation 13839+ mentions',
			'Digestion 4568+ mentions',
			'Poop 2874+ mentions',
			'Weight 2869+ mentions',
			'Infection 2866+ mentions'
		];
		cy.getDataTestId(`text-card-isssue`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 14 days top 5 remedy keywords ', () => {
		const cards = [
			'Water 11539+ mentions',
			'Supplement 7218+ mentions',
			'Massage 6550+ mentions',
			'Vegetables 5421+ mentions',
			'Calcium 5348+ mentions'
		];
		cy.getDataTestId(`remedy-keyword-text`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 14 days top 5 Products keywords ', () => {
		const cards = [
			'Dairy 16979+ mentions',
			'Formula 5226+ mentions',
			'Oil 4703+ mentions',
			'Shampoo 4100+ mentions',
			'Fruit 3102+ mentions'
		];
		cy.getDataTestId(`top-5-products-text`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 14 days top 5 Brands ', () => {
		const cards = [
			'Aptamil 17775+ mentions',
			'Himalaya 4847+ mentions',
			'Sebamed 2670+ mentions',
			'Nan Pro 2628+ mentions',
			'Pediasure 2416+ mentions'
		];
		cy.getDataTestId(`top-5-brands-list`).as(`viewList`).should(`have.length`, `5`);
		cy.get(`@viewList`).each((card, index) => {
			cy.wrap(card).should(`contain.text`, cards[index]);
		});
	});

	it('verify 14 days top 10 discussed conversations', () => {
		const path = `mock-responses/group-conversation.spec/fetchConversationsMilk`;
		cy.MockQueryUsingFile(`FetchConversations`, path);
		cy.getDataTestId(`card-top-10-topics`).as(`viewMentions`).should(`have.length`, `5`);
		cy.get(`@viewMentions`)
			.eq(0)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`conversation-card-name`).as(`card`).should(`contain.text`, `Milk`);
				cy.get(`@card`).click();
			});
		cy.getDataTestId(`heading-conversation-container`).should(`be.visible`).should(`contain.text`, `Milk`);
		cy.getDataTestId(`conversation-text`).each(card => {
			cy.wrap(card).should(`contain.text`, `ilk`);
		});
		cy.getDataTestId(`close-conversation-container`).should(`be.visible`).click();
		cy.getDataTestId(`heading-conversation-container`).should(`not.exist`);
	});

	it('verify 14 days top 10 discussed Cards', () => {
		const cards = [
			'Milk',
			'Prayer',
			'Food',
			'Water',
			'Aptamil',
			'Aptamilactivity',
			'Fruit',
			'Powder',
			'Delicious',
			'Eat'
		];
		const mentions = ['5241+', '2531+', '1661+', '1232+', '1150+', '844+', '824+', '640+', '592+', '570+'];
		cy.getDataTestId(`card-top-10-topics`).as(`viewMentions`).should(`have.length`, `5`);
		cy.get(`@viewMentions`).each((card, index) => {
			cy.wrap(card).within(() => {
				cy.getDataTestId(`conversation-card-name`).should(`contain.text`, cards[index]);
				cy.getDataTestId(`mentions-count`).should(`contain.text`, mentions[index] + ' mentions');
			});
		});
	});

	it('verify 14 days top 5 Categories ', () => {
		const cards = ['Nutrition', 'Infant Feeding', 'Toddler Nutrition & Gut Health', 'Women Beauty', 'Feeding'];
		const mentions = ['26852 +', '21807 +', '20607 +', '19703 +', '14798 +'];
		cy.getDataTestId(`top-5-Categories-cards`).as(`viewMentions`).should(`have.length`, `5`);
		cy.get(`@viewMentions`).each((card, index) => {
			cy.wrap(card).within(() => {
				cy.getDataTestId(`category-card-name`).should(`contain.text`, cards[index]);
				cy.getDataTestId(`mentions-categories`).should(`contain.text`, mentions[index] + ' conversations');
			});
		});
	});
});
