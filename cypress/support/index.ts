// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

///<reference path="../globals.d.ts" />
import './commands/ui';
import './commands/api';
import '@cypress/code-coverage/support';
import '@bahmutov/cy-api/support';
require('cypress-grep')();
require('cypress-real-events/support');
Cypress.on('uncaught:exception', () => {
	// returning false here prevents Cypress from
	// failing the test
	return false;
});

// @ts-ignore
Cypress.Commands.add(`InterceptRoute`, (queries: Array<string> | string) => {
	const intercept = query =>
		cy.intercept(`POST`, Cypress.env(`developAppSyncUrl`), req => {
			if (req.body.query.includes(query)) {
				req.alias = `${query}`;
			}
		});
	if (Cypress._.isArray(queries)) {
		return queries.forEach(query => intercept(query));
	} else {
		return intercept(queries);
	}
});

Cypress.Commands.add(`InterceptEventsProperties`, function (event: string) {
	return cy.intercept(`POST`, Cypress.env(`eventURL`), req => {
		if (typeof req.body == 'string') {
			const reqBodyJsonObj = JSON.parse(req.body);
			if (reqBodyJsonObj.event.includes(event)) {
				req.alias = `${event}`;
			}
			req.destroy();
		} else {
			req.destroy();
		}
	});
});

Cypress.Commands.add(`MockQueryUsingFile`, (query: string, path: string) => {
	return cy.intercept(
		{
			method: `POST`,
			url: Cypress.env(`developAppSyncUrl`)
		},
		req => {
			req.body.query.includes(query) && req.reply({fixture: `${path}/${query}.json`});
		}
	);
});

Cypress.Commands.add(`MockQueryUsingObject`, (query: string, body: Object) => {
	return cy.intercept(
		{
			method: `POST`,
			url: Cypress.env(`developAppSyncUrl`)
		},
		req => {
			req.body.query.includes(query) && req.reply(body);
		}
	);
});

Cypress.Commands.add(`MockQueries`, (query: string, path: string) => {
	let i = 0;
	return cy.intercept(
		{
			method: `POST`,
			url: Cypress.env(`developAppSyncUrl`)
		},
		req => {
			if (req.body.query.includes(query)) {
				i += 1;
				req.reply({fixture: `${path}/${query}-${i}.json`});
			}
		}
	);
});

beforeEach(function () {
	cy.fixture(`api-test/user-data.json`).as(`userDataJson`);
	cy.fixture(`api-test/tokens.json`).as(`tokensJson`);
});
before(function () {
	cy.fixture(`users.json`).as(`credentialsJson`);
});
