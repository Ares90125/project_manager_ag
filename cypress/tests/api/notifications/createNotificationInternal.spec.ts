/// <reference types="Cypress" />
import {mutation, query} from 'gql-query-builder';

describe(`API Test cases for createNotificationsInternal`, () => {
	it(`C179951 : Verify that convosight app installation notification is successfull created`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const notifiicationData = this.userDataJson.createNotificationData;
		const createNotificationsInternal = mutation({
			operation: `createNotificationsInternal`,
			variables: {
				input: {
					value: {
						forUserId: this.userDataJson.postDetails.userId,
						forGroupId: notifiicationData.notificationForGroupId,
						type: notifiicationData.installationType,
						inAppTitle: notifiicationData.installationInAppTitle,
						payload: notifiicationData.installationPayload,
						channelsToSkip: [notifiicationData.installationChannelsToSkip]
					},
					required: true,
					type: 'CreateNotificationsInputInternal'
				}
			},
			fields: [
				`inAppTitle`,
				`forUserId`,
				`forGroupId`,
				`type`,
				`error`,
				`payload`,
				`channelsToSkip`,
				`createdAtUTCTick`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				['x-api-key']: Cypress.env(`developAPIKey`)
			},
			body: createNotificationsInternal
		}).then(({body}) => {
			const {
				data: {
					createNotificationsInternal: {inAppTitle, payload, type, forUserId, channelsToSkip, forGroupId}
				}
			} = body;
			expect(inAppTitle).to.be.equal(notifiicationData.installationInAppTitle);
			expect(payload).to.be.equal(notifiicationData.installationPayload);
			expect(type).to.be.equal(notifiicationData.installationType);
			expect(forUserId).to.be.equal(this.userDataJson.postDetails.userId);
			expect(forGroupId).to.be.equal(notifiicationData.notificationForGroupId);
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
		const getNotifications = query({
			operation: `getNotifications`,
			variables: {
				forUserId: {value: this.userDataJson.postDetails.userId, required: true},
				limit: {value: 1}
			},
			fields: [`items{inAppTitle,payload,type,status,channelsToSkip}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getNotifications
		}).then(({body}) => {
			const {
				data: {
					getNotifications: {
						items: [{inAppTitle, payload, channelsToSkip, type}]
					}
				}
			} = body;
			expect(inAppTitle).to.be.not.null;
			expect(payload).to.be.not.null;
			expect(type).to.be.not.null;
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
	});

	it(`C179951 : Verify that convosight app added notification notification is successfull created`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const notifiicationData = this.userDataJson.createNotificationData;
		const createNotificationsInternal = mutation({
			operation: `createNotificationsInternal`,
			variables: {
				input: {
					value: {
						forUserId: this.userDataJson.postDetails.userId,
						forGroupId: notifiicationData.notificationForGroupId,
						type: notifiicationData.appAddedType,
						inAppTitle: notifiicationData.appAddedInAppTitle,
						payload: notifiicationData.appAddedPayLoad,
						channelsToSkip: [notifiicationData.installationChannelsToSkip]
					},
					required: true,
					type: 'CreateNotificationsInputInternal'
				}
			},
			fields: [
				`inAppTitle`,
				`forUserId`,
				`forGroupId`,
				`type`,
				`error`,
				`payload`,
				`channelsToSkip`,
				`createdAtUTCTick`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				['x-api-key']: Cypress.env(`developAPIKey`)
			},
			body: createNotificationsInternal
		}).then(({body}) => {
			const {
				data: {
					createNotificationsInternal: {inAppTitle, payload, type, forUserId, channelsToSkip, forGroupId}
				}
			} = body;
			expect(inAppTitle).to.be.equal(notifiicationData.appAddedInAppTitle);
			expect(payload).to.be.equal(notifiicationData.appAddedPayLoad);
			expect(type).to.be.equal(notifiicationData.appAddedType);
			expect(forUserId).to.be.equal(this.userDataJson.postDetails.userId);
			expect(forGroupId).to.be.equal(notifiicationData.notificationForGroupId);
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
		const getNotifications = query({
			operation: `getNotifications`,
			variables: {
				forUserId: {value: this.userDataJson.postDetails.userId, required: true},
				limit: {value: 1}
			},
			fields: [`items{inAppTitle,payload,type,status,channelsToSkip}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getNotifications
		}).then(({body}) => {
			const {
				data: {
					getNotifications: {
						items: [{inAppTitle, payload, channelsToSkip, type}]
					}
				}
			} = body;
			expect(inAppTitle).to.be.not.null;
			expect(payload).to.be.not.null;
			expect(type).to.be.not.null;
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
	});

	it(`C179951 : Verify that unistallation of convosight app notification is successfull created`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const notifiicationData = this.userDataJson.createNotificationData;
		const createNotificationsInternal = mutation({
			operation: `createNotificationsInternal`,
			variables: {
				input: {
					value: {
						forUserId: this.userDataJson.postDetails.userId,
						forGroupId: notifiicationData.notificationForGroupId,
						type: notifiicationData.uninstallationType,
						inAppTitle: notifiicationData.uninstalltionInAppTitle,
						payload: notifiicationData.uninstallationPayLoad,
						channelsToSkip: [notifiicationData.installationChannelsToSkip]
					},
					required: true,
					type: 'CreateNotificationsInputInternal'
				}
			},
			fields: [
				`inAppTitle`,
				`forUserId`,
				`forGroupId`,
				`type`,
				`error`,
				`payload`,
				`channelsToSkip`,
				`createdAtUTCTick`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				['x-api-key']: Cypress.env(`developAPIKey`)
			},
			body: createNotificationsInternal
		}).then(({body}) => {
			const {
				data: {
					createNotificationsInternal: {inAppTitle, payload, type, forUserId, channelsToSkip, forGroupId}
				}
			} = body;
			expect(inAppTitle).to.be.equal(notifiicationData.uninstalltionInAppTitle);
			expect(payload).to.be.equal(notifiicationData.uninstallationPayLoad);
			expect(type).to.be.equal(notifiicationData.uninstallationType);
			expect(forUserId).to.be.equal(this.userDataJson.postDetails.userId);
			expect(forGroupId).to.be.equal(notifiicationData.notificationForGroupId);
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
		const getNotifications = query({
			operation: `getNotifications`,
			variables: {
				forUserId: {value: this.userDataJson.postDetails.userId, required: true},
				limit: {value: 1}
			},
			fields: [`items{inAppTitle,payload,type,status,channelsToSkip}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getNotifications
		}).then(({body}) => {
			const {
				data: {
					getNotifications: {
						items: [{inAppTitle, payload, channelsToSkip, type}]
					}
				}
			} = body;
			expect(inAppTitle).to.be.not.null;
			expect(payload).to.be.not.null;
			expect(type).to.be.not.null;
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
	});

	it(`C179951 : Verify that added as moderator notification is successfull created`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const notifiicationData = this.userDataJson.createNotificationData;
		const createNotificationsInternal = mutation({
			operation: `createNotificationsInternal`,
			variables: {
				input: {
					value: {
						forUserId: this.userDataJson.postDetails.userId,
						forGroupId: notifiicationData.notificationForGroupId,
						type: notifiicationData.uninstallationType,
						inAppTitle: notifiicationData.uninstalltionInAppTitle,
						payload: notifiicationData.uninstallationPayLoad,
						channelsToSkip: [notifiicationData.installationChannelsToSkip]
					},
					required: true,
					type: 'CreateNotificationsInputInternal'
				}
			},
			fields: [
				`inAppTitle`,
				`forUserId`,
				`forGroupId`,
				`type`,
				`error`,
				`payload`,
				`channelsToSkip`,
				`createdAtUTCTick`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				['x-api-key']: Cypress.env(`developAPIKey`)
			},
			body: createNotificationsInternal
		}).then(({body}) => {
			const {
				data: {
					createNotificationsInternal: {inAppTitle, payload, type, forUserId, channelsToSkip, forGroupId}
				}
			} = body;
			expect(inAppTitle).to.be.equal(notifiicationData.uninstalltionInAppTitle);
			expect(payload).to.be.equal(notifiicationData.uninstallationPayLoad);
			expect(type).to.be.equal(notifiicationData.uninstallationType);
			expect(forUserId).to.be.equal(this.userDataJson.postDetails.userId);
			expect(forGroupId).to.be.equal(notifiicationData.notificationForGroupId);
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
		const getNotifications = query({
			operation: `getNotifications`,
			variables: {
				forUserId: {value: this.userDataJson.postDetails.userId, required: true},
				limit: {value: 1}
			},
			fields: [`items{inAppTitle,payload,type,status,channelsToSkip}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getNotifications
		}).then(({body}) => {
			const {
				data: {
					getNotifications: {
						items: [{inAppTitle, payload, channelsToSkip, type}]
					}
				}
			} = body;
			expect(inAppTitle).to.be.not.null;
			expect(payload).to.be.not.null;
			expect(type).to.be.not.null;
			expect(channelsToSkip[0]).to.be.equal(notifiicationData.installationChannelsToSkip);
		});
	});

	it(`C179951 : Verify that Urgent Alert notification is successfull created`, () => {
		cy.get(`@userDataJson`).then(
			({
				postDetails: {userId},
				createNotificationData: {
					installationChannelsToSkip,
					urgentAlertType,
					urgentAlertInAPPTitle,
					urgentAlertPayload,
					notificationForGroupId
				}
			}: any) => {
				cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
					const appSyncUrl = Cypress.env(`developAppSyncUrl`);
					const createNotificationsInternal = mutation({
						operation: `createNotificationsInternal`,
						variables: {
							input: {
								value: {
									forUserId: userId,
									forGroupId: notificationForGroupId,
									type: urgentAlertType,
									inAppTitle: urgentAlertInAPPTitle,
									payload: urgentAlertPayload,
									channelsToSkip: [installationChannelsToSkip]
								},
								required: true,
								type: 'CreateNotificationsInputInternal'
							}
						},
						fields: [
							`inAppTitle`,
							`forUserId`,
							`forGroupId`,
							`type`,
							`error`,
							`payload`,
							`channelsToSkip`,
							`createdAtUTCTick`
						]
					});

					// @ts-ignore
					cy.api({
						method: `POST`,
						url: appSyncUrl,
						headers: {
							['x-api-key']: Cypress.env(`developAPIKey`)
						},
						body: createNotificationsInternal
					}).then(({body}) => {
						const {
							data: {
								createNotificationsInternal: {inAppTitle, payload, type, forUserId, channelsToSkip, forGroupId}
							}
						} = body;
						expect(inAppTitle).to.be.equal(urgentAlertInAPPTitle);
						expect(payload).to.be.equal(urgentAlertPayload);
						expect(type).to.be.equal(urgentAlertType);
						expect(forUserId).to.be.equal(userId);
						expect(forGroupId).to.be.equal(notificationForGroupId);
						expect(channelsToSkip[0]).to.be.equal(installationChannelsToSkip);
					});
					const getNotifications = query({
						operation: `getNotifications`,
						variables: {
							forUserId: {value: userId, required: true},
							limit: {value: 1}
						},
						fields: [`items{inAppTitle,payload,type,status,channelsToSkip}`]
					});

					// @ts-ignore
					cy.api({
						method: `POST`,
						url: appSyncUrl,
						headers: {
							authorization: groupAdminToken
						},
						body: getNotifications
					}).then(({body}) => {
						const {
							data: {
								getNotifications: {
									items: [{inAppTitle, payload, channelsToSkip, type}]
								}
							}
						} = body;
						expect(inAppTitle).to.be.not.null;
						expect(payload).to.be.not.null;
						expect(type).to.be.not.null;
						expect(channelsToSkip[0]).to.be.equal(installationChannelsToSkip);
					});
				});
			}
		);
	});

	it(`C179951 : Verify that welcome note notification is successfull created`, () => {
		cy.get(`@userDataJson`).then(
			({
				postDetails: {userId},
				createNotificationData: {installationChannelsToSkip, welcomeType, welcomeInAppTitle, notificationForGroupId}
			}: any) => {
				cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
					const appSyncUrl = Cypress.env(`developAppSyncUrl`);
					const createNotificationsInternal = mutation({
						operation: `createNotificationsInternal`,
						variables: {
							input: {
								value: {
									forUserId: userId,
									forGroupId: notificationForGroupId,
									type: welcomeType,
									inAppTitle: welcomeInAppTitle,
									channelsToSkip: [installationChannelsToSkip]
								},
								required: true,
								type: 'CreateNotificationsInputInternal'
							}
						},
						fields: [
							`inAppTitle`,
							`forUserId`,
							`forGroupId`,
							`type`,
							`error`,
							`payload`,
							`channelsToSkip`,
							`createdAtUTCTick`
						]
					});

					// @ts-ignore
					cy.api({
						method: `POST`,
						url: appSyncUrl,
						headers: {
							['x-api-key']: Cypress.env(`developAPIKey`)
						},
						body: createNotificationsInternal
					}).then(({body}) => {
						const {
							data: {
								createNotificationsInternal: {inAppTitle, type, forUserId, channelsToSkip, forGroupId}
							}
						} = body;
						expect(inAppTitle).to.be.equal(welcomeInAppTitle);
						expect(type).to.be.equal(welcomeType);
						expect(forUserId).to.be.equal(userId);
						expect(forGroupId).to.be.equal(notificationForGroupId);
						expect(channelsToSkip[0]).to.be.equal(installationChannelsToSkip);
					});
					const getNotifications = query({
						operation: `getNotifications`,
						variables: {
							forUserId: {value: userId, required: true},
							limit: {value: 1}
						},
						fields: [`items{inAppTitle,payload,type,status,channelsToSkip}`]
					});

					// @ts-ignore
					cy.api({
						method: `POST`,
						url: appSyncUrl,
						headers: {
							authorization: groupAdminToken
						},
						body: getNotifications
					}).then(({body}) => {
						const {
							data: {
								getNotifications: {
									items: [{inAppTitle, channelsToSkip, type}]
								}
							}
						} = body;
						expect(inAppTitle).to.be.not.null;
						expect(type).to.be.not.null;
						expect(channelsToSkip[0]).to.be.equal(installationChannelsToSkip);
					});
				});
			}
		);
	});
});
