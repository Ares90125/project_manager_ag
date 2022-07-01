// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
// @ts-check
///<reference path="../../globals.d.ts" />
import 'cypress-localstorage-commands';
import 'cypress-file-upload';
import 'cypress-iframe';
import {Window} from 'happy-dom';
import dayjs from 'dayjs';

let date = new Date();
date.setDate(date.getDate() + 1);
let tomorrow = date.getDate();
let hours = date.getHours();
if (hours === 0) {
	hours = 12;
}
let ampm = hours >= 12 ? 'PM' : 'AM';
if (ampm === 'PM') {
	hours = hours - 11;
}

export const generateRandomNumber = () => Math.floor(Math.random() * 1000) + 1;

Cypress.Commands.add(`getDataCsLabel`, function (value, ...options) {
	return cy.get(`[data-cs-label="${value}"]`, ...options);
});

Cypress.Commands.add(`getDataTestId`, function (value, ...options) {
	return cy.get(`[data-test-id="${value}"]`, ...options);
});

Cypress.Commands.add(`getDataCsParentLabel`, function (value, ...options) {
	return cy.get(`[data-cs-parent-label="${value}"]`, ...options);
});

Cypress.Commands.add(`LoginAsOtherAdmin`, function (userEmail, password) {
	return cy
		.get(`[type="submit"]`)
		.as(`BtnSubmit`)
		.should(`be.disabled`)
		.get(`[data-placeholder="Email"]`)
		.type(userEmail)
		.get(`[data-placeholder="Password"]`)
		.type(password)
		.get(`@BtnSubmit`)
		.should(`be.enabled`)
		.click();
});

Cypress.Commands.add(`RestoreSession`, function ({cookies, lsd, ssd}) {
	const wList = [];
	cy.clearCookies();
	cookies.forEach(cookie => {
		wList.push(cookie.name);
		cy.setCookie(cookie.name, cookie.value, {
			log: true,
			domain: cookie.domain,
			path: cookie.path,
			expiry: cookie.expires,
			httpOnly: cookie.httpOnly,
			secure: cookie.secure
		});
	});

	Cypress.Cookies.defaults({
		preserve: wList
	});

	return cy.window().then(window => {
		Object.keys(ssd).forEach(key => window.sessionStorage.setItem(key, ssd[key]));
		Object.keys(lsd).forEach(key => window.localStorage.setItem(key, lsd[key]));
	});
});

Cypress.Commands.add(`AddCampaign`, function (campaignName) {
	return cy
		.get(`[placeholder="Campaign name"]`)
		.type(campaignName)
		.get(`button`)
		.contains(`Next`)
		.click()
		.get(`li`)
		.contains(`Community Marketing`)
		.click()
		.get(`button`)
		.contains(` Continue `)
		.click();
});

Cypress.Commands.add(
	`AddCampaignDetails`,
	function (brief, objective, category = `Makeup`, subCategory = `Makeup`, brand = `Music Flower`) {
		cy.get(`button[aria-label="Open calendar"]`).as(`date`).should(`have.length`, 3);

		cy.get(`@date`)
			.eq(0)
			.then(date => {
				cy.wrap(date).click();
				cy.get(`[role="gridcell"]`)
					.contains(tomorrow)
					.as(`tom`)
					.then(() => {
						const $tomorrow = Cypress.$(`[aria-label="${dayjs().add(1, `days`).format(`LL`)}"]`);
						if ($tomorrow.length === 0) {
							cy.get(`.mat-calendar-next-button`).click();
						}
					});
				cy.get(`@tom`).click({force: true});
			});

		cy.get(`@date`)
			.eq(1)
			.then(date => {
				cy.wrap(date).click();
				cy.get(`[role="gridcell"]`).contains(tomorrow).click({force: true});
			});

		return cy
			.get(`div[data-placeholder="Add Campaign brief"]`)
			.type(brief)
			.get(`div[data-placeholder="Add Campaign objective"]`)
			.type(objective)
			.getDataTestId('button-drop-down')
			.eq(0)
			.click()
			.should(`have.attr`, `aria-expanded`, `true`)
			.getDataTestId(`value-drop-down`)
			.eq(0)
			.within(() => cy.contains(`${category}`).click())
			.getDataTestId('button-drop-down')
			.eq(1)
			.click()
			.getDataTestId(`value-drop-down`)
			.eq(1)
			.within(() => cy.contains(`${subCategory}`).click())
			.getDataTestId('button-drop-down')
			.eq(2)
			.click()
			.getDataTestId(`value-drop-down`)
			.eq(2)
			.within(() => cy.contains(`${brand}`).click())
			.getDataTestId(`button-save-campaigninfo-details`)
			.click();
	}
);

Cypress.Commands.add(`AddCampaignTask`, function (groupName, title, user, period, task, postType) {
	cy.getDataTestId(`button-add-task`).should(`be.visible`).click();
	if (task) {
		if (task.type === `image` || task.type === `video`) {
			if (!task.files) {
				throw Error(`file is not mentioned`);
			} else {
				if (task.content) {
					cy.get(`#postMessage`).type(task.content, {force: true});
				}
				if (task.emojis) {
					cy.get(`#toggleEmoji`).scrollIntoView().click().get(`.emoji-mart-emoji.ng-star-inserted`).as(`emojis`);
					task.emojis.forEach(function (index) {
						cy.get(`@emojis`).eq(index).scrollIntoView().click({force: true});
					});
				}
				task.files.forEach((file, index) => {
					if (index === 0) {
						cy.get(`.custom-upload > input[type="file"]`).attachFile(file);
					} else {
						cy.get(`.add-new-media > input[type="file"]`).attachFile(file);
					}
				});
				cy.get(`button.remove-media`).should(`have.length`, task.files.length);
			}
		} else if (task.type === 'text') {
			if (!task.content) {
				throw Error('task content not mentioned');
			} else {
				if (task.files) {
					throw Error(`No files supported for text content types`);
				} else {
					cy.get(`#postMessage`).type(task.content, {force: true});
					if (task.emojis) {
						cy.get(`#toggleEmoji`).scrollIntoView().click().get(`.emoji-mart-emoji.ng-star-inserted`).as(`emojis`);
						task.emojis.forEach(function (index) {
							cy.get(`@emojis`).eq(index).scrollIntoView().click({force: true});
						});
					}
				}
			}
		} else {
			throw Error(`Incorrect task type mentioned. Pass on task type as 'text' or 'video' or 'image'`);
		}
	}

	//Group selection
	cy.get(`[placeholder="Enter group name"]`)
		.click()
		.type(groupName, {force: true})
		.should(`have.value`, groupName)
		.get(`ul.data-ul > li`)
		.eq(0)
		.should('have.length.greaterThan', 0)
		.click({force: true});

	//Enter title
	cy.get(`[placeholder='Enter title']`).type(title);

	//Post type
	if (postType) {
		cy.get(`[type="radio"]`).eq(postType).check({force: true});
		cy.get(`.brief-section.ng-star-inserted`).should(`not.exist`);
		cy.get(`div.note-section > p.m-0`).should(
			`have.text`,
			`Note:This type of posts are not supported by Convosight. You can still create a placeholder task for tracking. The group admin will not see this task. You can come later and associate the facebook permalink of the actual post with this task for tracking in the report `
		);
	}

	//Select admin
	cy.contains(`.placeholder`, `Admin/moderator name`).click();
	cy.getDataTestId(`dropdown-container-admin-list`).within(() => {
		cy.getDataTestId(`list-group-admin`).should(`have.lengthOf.greaterThan`, 0);
		cy.contains(`[data-test-id="list-group-admin"]`, `${user}`).click();
	});

	//Select date and time
	cy.get(`button[aria-label="Open calendar"]`).click();
	cy.get(`.mat-calendar-body-cell`)
		.contains(tomorrow)
		.as(`tom`)
		.then(() => {
			const $tomorrow = Cypress.$(`[aria-label="${dayjs().add(1, `days`).format(`LL`)}"]`);
			if ($tomorrow.length === 0) {
				cy.get(`.mat-calendar-next-button`).click();
			}
		});
	return cy
		.get(`@tom`)
		.click()
		.get(`div.timepicker-wrap`)
		.eq(0)
		.click()
		.get(`.form-check`)
		.contains(` ${hours}:00 ${ampm} `)
		.scrollIntoView()
		.click({force: true})
		.get(`[placeholder="E.g. Prelaunch, Phase 1"]`)
		.type(period)
		.getDataTestId(`button-save-task-modal`)
		.click();
});

Cypress.Commands.add(`AddCampaignBrandEmail`, brandEmail =>
	cy
		.get(`button.add-email`)
		.click()
		.get(`.email-adderss-row > input[type="text"]`)
		.type(brandEmail)
		.getDataTestId(`button-cmc-save-add-brand-email`)
		.click()
);

Cypress.Commands.add(`AcceptCampaign`, campaignName =>
	cy
		.get(`#active-campaigns-tab`)
		.click()
		.get(`.campaigns-row-header`)
		.filter(`:contains("${campaignName}")`)
		.as(`campaign`)
		.find(`button.convo-dropdown.convo-normal-dropdown.dropdown-toggle`)
		.click()
		.get(`@campaign`)
		.find(`button.dropdown-item`)
		.click()
		.get(`.right-section > .convo-btn-primary`)
		.click()
		.get(`#accept-proposal > .modal-dialog > .modal-content > .modal-body > .convo-btn-primary`)
		.click()
);

Cypress.Commands.add(`VerifyEmailWithSubject`, subject => {
	const fromTimeInMin = new Date(Date.now() - 10000 * 60);
	// @ts-ignore
	return cy
		.mailosaurGetMessage(
			`mtf8kzil`,
			{
				subject: subject
			},
			{
				timeout: 60000,
				receivedAfter: fromTimeInMin
			}
		)
		.then(email => {
			expect(email.subject).to.contain(subject);
			// @ts-ignore
			cy.mailosaurDeleteMessage(email.id);
		});
});

Cypress.Commands.add(`GetOtpFromEmail`, subject => {
	const fromTimeInMin = new Date(Date.now() - 10000 * 60);
	// @ts-ignore
	return cy
		.mailosaurGetMessage(
			`mtf8kzil`,
			{
				subject: subject
			},
			{
				timeout: 60000,
				receivedAfter: fromTimeInMin
			}
		)
		.then(email => {
			const window = new Window();
			const document = window.document;
			document.body.innerHTML = email.html.body;
			const el = document.querySelector('div > div:nth-child(5)');
			// @ts-ignore
			cy.mailosaurDeleteMessage(email.id);
			return el.textContent;
		});
});

Cypress.Commands.add(`StartDateEndDate`, (startDate, Enddate) => {
	cy.get(`button[aria-label="Open calendar"]`).as(`date`).should(`have.length`, 2);

	cy.get(`@date`)
		.eq(0)
		.then(date => {
			cy.wrap(date).click();
			cy.get(`[role="gridcell"]`)
				.contains(`${startDate}`)
				.as(`tom`)
				.then(() => {
					const $tomorrow = Cypress.$(`[aria-label="${dayjs().add(1, `days`).format(`LL`)}"]`);
					$tomorrow.length === 0 && cy.get(`.mat-calendar-next-button`).click();
				});
			cy.get(`@tom`).click({force: true});
		});

	return cy
		.get(`@date`)
		.eq(1)
		.then(date => {
			cy.wrap(date).click();
			if (Enddate > startDate) {
				cy.get(`[role="gridcell"]`).contains(`${Enddate}`).click({force: true});
			} else {
				cy.get(`[role="gridcell"]`).contains(`${Enddate}`).parent().should(`have.attr`, 'aria-disabled', 'true');
			}
		});
});

Cypress.Commands.add(`SelectCategorySubBrand`, function (category, subcategory1, subcategory2, brand) {
	if (category !== undefined) {
		cy.getDataTestId('button-drop-down').eq(0).should(`be.visible`).click();
		return cy
			.getDataTestId(`value-drop-down`)
			.eq(0)
			.within(() => cy.contains(`${category}`).click());
	}
	if (subcategory1 !== undefined) {
		cy.getDataTestId('button-drop-down').eq(1).should(`be.visible`).click();
		return cy
			.getDataTestId(`value-drop-down`)
			.eq(1)
			.within(() => cy.contains(`${subcategory1}`).click());
	}
	if (subcategory2 !== undefined) {
		cy.getDataTestId(`value-drop-down`)
			.eq(1)
			.within(() => cy.contains(`${subcategory2}`).click());
		return cy.get(`.multiple-badges`).should(`be.visible`);
	}
	if (brand !== undefined) {
		cy.getDataTestId('button-drop-down').eq(2).should(`be.visible`).click();
		return cy
			.getDataTestId(`value-drop-down`)
			.eq(2)
			.within(() => cy.contains(`${brand}`).click());
	}
});

Cypress.Commands.add(`FileUpload`, function (selector, path) {
	return cy.get(selector).attachFile(path);
});

Cypress.Commands.add(`parseXlsx`, function (filePath) {
	return cy.task('parseXlsx', {filePath: filePath});
});

Cypress.Commands.add(`VerifyAlert`, function (heading, subheading) {
	cy.get(`[class="modal file-alert"]`)
		.as(`alert`)
		.should(`be.visible`)
		.within(() => {
			cy.get(`h5`).should(`be.visible`).should(`have.text`, heading);
			cy.get(`p`).should(`be.visible`).should(`have.text`, subheading);
			cy.get(`[type=button]`).should(`be.visible`).should(`have.text`, ` OK `).click();
		});
	return cy.get(`@alert`).should(`not.exist`);
});
