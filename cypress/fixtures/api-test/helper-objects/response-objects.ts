export const unauthorizedErrorObject = (apiName, errorType, errorMessage, lineNumber, ColumnNumber) => {
	return {
		data: {
			[apiName]: null
		},
		errors: [
			{
				path: [apiName],
				data: null,
				errorType: errorType,
				errorInfo: null,
				locations: [
					{
						line: lineNumber,
						column: ColumnNumber,
						sourceName: null
					}
				],
				message: errorMessage
			}
		]
	};
};

export const staticResponseObject = (apiName, object) => {
	return {
		data: {
			[apiName]: object
		}
	};
};

export const withoutValidParameterObject = (errorMessage, lineNumber, ColumnNumber) => {
	return {
		data: null,
		errors: [
			{
				path: null,
				locations: [
					{
						line: lineNumber,
						column: ColumnNumber,
						sourceName: null
					}
				],
				message: errorMessage
			}
		]
	};
};
