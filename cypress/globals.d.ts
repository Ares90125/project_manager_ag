declare namespace Cypress {
	interface Chainable {
		getDataCsLabel(value: string, options?: any): Chainable;

		getDataTestId(value: string, options?: any): Chainable;

		getDataCsParentLabel(value: string, options?: any): Chainable;

		RestoreSession(data: any): Chainable;

		AddCampaign(campaignName: string): Chainable;

		loginByCognitoApi(username: string, password: string): Chainable;

		AddCampaignDetails(
			brief: string,
			objective: string,
			category?: string,
			subCategory?: string,
			brand?: string
		): Chainable;

		StartDateEndDate(StartDate: Number, EndDate: Number): Chainable;

		FileUpload(selector: string, path: string): Chainable;

		parseXlsx(filePath: string): Chainable;

		isFileExists(filePath: string): Chainable;

		deleteFile(filePath: string): Chainable;

		SelectCategorySubBrand(category?: string, subCategory1?: string, brand?: string, subCategory2?: string): Chainable;

		AddCampaignTask(
			groupName: string,
			title: string,
			user: string,
			period: string,
			task?: {
				type: string;
				content?: string;
				files?: string[];
				emojis?: number[];
			},
			postType?: number
		): Chainable;
		AddCampaignBrandEmail(brandEmail: string): Chainable;

		LoginAsOtherAdmin(userEmail: string, password: string): Chainable;

		LoginAsCSAdmin(): Chainable;

		CreateCampaignWithApi(campaignName: string, brandId: string): Chainable;

		AcceptCampaign(campaignName: string): Chainable;

		VerifyEmailWithSubject(subject: string): Chainable;

		GetOtpFromEmail(subject: string): Chainable;

		InterceptRoute(queries: Array<string> | string): Chainable;

		InterceptEventsProperties(queries: string): Chainable;

		MockQueryUsingFile(query: string, path: string): Chainable;

		MockQueryUsingObject(query: string, body: Object): Chainable;

		MockQueries(query: string, path: string): Chainable;

		VerifyAlert(heading: string, subheading: string): Chainable;
	}
}
