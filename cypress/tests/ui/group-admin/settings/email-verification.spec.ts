describe(`Email verification test cases`, () => {
	before(`login using facebook`, () => {
		cy.fixture(`api-test/convosightWithNoGroups.json`)
			.then(session => {
				cy.RestoreSession(session);
			})
			.visit(`/group-admin/no-groups`)
			.saveLocalStorage()
			.task(`generateEmail`)
			.then(generatedEmail => {
				this.generatedEmail = generatedEmail;
			});
	});

	beforeEach(() => {
		if (this.generatedEmail) this.email = this.generatedEmail;
		cy.InterceptRoute([`VerifyEmail`, `mutation TriggerEmailVerification`]);
		cy.restoreLocalStorage().visit(`/group-admin/no-groups`);
	});
	//dummy commit
	it(`Verify the email using incorrect otp`, () => {
		//Due to exisiting bug assigned to Abhishek
		cy.getDataCsLabel(`Profile Image`)
			.click()
			.getDataCsLabel(`Settings`)
			.click()
			.getDataTestId(`edit-email`)
			.click()
			.getDataTestId(`txt-box-email-verification`)
			.clear()
			.type(this.email)
			.getDataTestId(`btn-continue-email-verification`)
			.click()
			.get(`li > input`)
			.each($ele => {
				cy.wrap($ele).type(`a`);
			})
			.getDataTestId(`btn-verify-email-verification`)
			.click()
			.get(`.warning-message  > span`)
			.should(`have.text`, `Incorrect verification code.`);
	});

	it(`Verify the user able to edit the email after otp is generated`, () => {
		cy.getDataCsLabel(`Profile Image`)
			.click()
			.getDataCsLabel(`Settings`)
			.click()
			.getDataTestId(`edit-email`)
			.click()
			.getDataTestId(`txt-box-email-verification`)
			.as(`txtBxEmail`)
			.clear()
			.type(this.email)
			.getDataTestId(`btn-continue-email-verification`)
			.click()
			.get(`[data-cs-label="edit"]`)
			.click()
			.get(`@txtBxEmail`)
			.should(`be.visible`);
		//dummy
	});

	it.skip(`verify the user to enter email and complete the flow`, () => {
		cy.getDataCsLabel(`Profile Image`)
			.click()
			.getDataCsLabel(`Settings`)
			.click()
			.getDataTestId(`edit-email`)
			.click()
			.getDataTestId(`txt-box-email-verification`)
			.clear()
			.type(this.email)
			.getDataTestId(`btn-continue-email-verification`)
			.click()
			.task(`getOTPFromEmail`, {email: this.email})
			.then(otp => {
				// @ts-ignore
				const otpArray: Array<string> = Array.from(otp.trim());
				cy.get(`li > input`).each(($ele, index) => {
					cy.wrap($ele).type(otpArray[index]);
				});
			})
			.getDataTestId(`btn-verify-email-verification`)
			.click();
		cy.wait(`@VerifyEmail`, {timeout: 30000})
			.its(`response.body.data.verifyEmail.emailVerificationStatus`)
			.should(`eq`, `Verified`);
	});

	it.skip(`Verify when user try to enter existing email`, () => {
		//Due to exisiting bug
		cy.getDataCsLabel(`Profile Image`)
			.click()
			.getDataCsLabel(`Settings`)
			.click()
			.getDataTestId(`edit-email`)
			.click()
			.getDataTestId(`txt-box-email-verification`)
			.clear()
			.type(this.email)
			.getDataTestId(`btn-continue-email-verification`)
			.click()
			.get(`.warning-message  > span`)
			.should(`have.text`, `You have already verified your account using this email.`);
	});

	it.skip(`Verify the user to use the option when they already have an otp`, () => {
		cy.task(`generateEmail`).then((email: string) => {
			cy.getDataCsLabel(`Profile Image`)
				.as(`profileImage`)
				.click()
				.getDataCsLabel(`Settings`)
				.as(`settings`)
				.click()
				.getDataTestId(`edit-email`)
				.as(`editEmail`)
				.click()
				.getDataTestId(`txt-box-email-verification`)
				.as(`txtBxEmail`)
				.clear()
				.type(email)
				.getDataTestId(`btn-continue-email-verification`)
				.click()
				.getDataTestId(`btn-verify-email-verification`)
				.should(`be.visible`)
				.get(`.close-modal`)
				.eq(1)
				.click()
				.get(`@editEmail`)
				.click()
				.getDataCsLabel(`I already have an OTP`)
				.click()
				.task(`getOTPFromEmail`, {email: email})
				.then(otp => {
					// @ts-ignore
					const otpArray: Array<string> = Array.from(otp.trim());
					cy.get(`li > input`).each(($ele, index) => {
						cy.wrap($ele).type(otpArray[index]);
					});
				})
				.getDataTestId(`btn-verify-email-verification`)
				.click();
		});
		cy.wait(`@VerifyEmail`, {timeout: 30000})
			.its(`response.body.data.verifyEmail.emailVerificationStatus`)
			.should(`eq`, `Verified`);
	});

	it.skip(`verify the user able to resend the otp`, () => {
		cy.task(`generateEmail`).then((email: string) => {
			cy.getDataCsLabel(`Profile Image`)
				.click()
				.getDataCsLabel(`Settings`)
				.click()
				.getDataTestId(`edit-email`)
				.click()
				.getDataTestId(`txt-box-email-verification`)
				.clear()
				.type(email)
				.getDataTestId(`btn-continue-email-verification`)
				.click()
				.task(`getOTPFromEmail`, {email: email})
				.getDataCsLabel(`resend otp`)
				.click()
				.wait(`@mutation TriggerEmailVerification`, {timeout: 30000});
		});
	});

	it(`verify user able to use verify later option`, () => {
		cy.task(`generateEmail`).then((email: string) => {
			cy.getDataCsLabel(`Profile Image`)
				.click()
				.getDataCsLabel(`Settings`)
				.click()
				.getDataTestId(`edit-email`)
				.click()
				.getDataTestId(`txt-box-email-verification`)
				.clear()
				.type(email)
				.getDataTestId(`btn-continue-email-verification`)
				.click()
				.task(`getOTPFromEmail`, {email: email})
				.getDataCsLabel(`Verify Later`)
				.click()
				.get(`.step-2`)
				.should(`not.exist`);
		});
	});
});
