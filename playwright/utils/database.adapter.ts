/// <reference types="aws-sdk" />
const AWS = require('aws-sdk');

const Region = process.env.AWS_DEFAULT_REGION || 'us-east-1';

AWS.config.region = Region;
const db = new AWS.DynamoDB.DocumentClient();
const brandId = '2bad5887-6191-4797-acc3-ddeefc2673be';
const csAdminUserId = '41b98c53-7c76-4af0-8640-e16f06ffd428';
export const getUserIdByUsername = async (
	username: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-users',
		IndexName: 'username-Index',
		KeyConditionExpression: '#username = :username',
		ExpressionAttributeNames: {
			'#username': 'username'
		},
		ExpressionAttributeValues: {
			':username': username
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: {Items: [any]; Count: number; ScannedCount: number}) => {
			if (err) {
				console.log(`Get user by username failed ${username}`);
				reject(err);
			} else {
				console.log(`Get user by username is successful`);
				resolve(data);
			}
		});
	});
};

const removeFBAccessToken = async (cognitoId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-users',
		Key: {
			cognitoId: cognitoId
		},
		UpdateExpression: 'REMOVE fbUserAccessToken',
		ReturnValues: 'UPDATED_NEW'
	};

	return new Promise((resolve, reject) => {
		db.update(params, (err: any, data: any) => {
			if (err) {
				console.log(`Delete fb token by cognitoId failed ${cognitoId}`);
				reject(err);
			} else {
				console.log(`Delete fb token by cognitoId is successful`);
				resolve(data);
			}
		});
	});
};

const getUserDetailsByUserId = async (userId: string): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: `bd-convosight-dev-users`,
		IndexName: `id-Index`,
		KeyConditionExpression: `#id = :id`,
		ExpressionAttributeNames: {
			'#id': 'id'
		},
		ExpressionAttributeValues: {
			':id': userId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get user details by id is failed ${userId}`);
				reject(err);
			} else {
				console.log(`Get user details by user id is successful`);
				resolve(data);
			}
		});
	});
};

const getGroupMembersByUserId = async (
	userId: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-groupMembers',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'userId'
		},
		ExpressionAttributeValues: {
			':a': userId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`get group members by user id is failed ${userId}`);
				reject(err);
			} else {
				console.log(`Get group members by user id is successful`);
				resolve(data);
			}
		});
	});
};

const getGroupDataById = async (groupId: string) => {
	let params = {
		TableName: 'bd-convosight-dev-groups',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'id'
		},
		ExpressionAttributeValues: {
			':a': groupId
		}
	};

	return await db
		.query(params, (err: any) => {
			if (err) {
				console.log(`Unable to get group data by id is failed ${groupId}`);
				console.log(err);
			} else {
				console.log(`Get groups data by id is successful`);
			}
		})
		.promise();
};

const deleteGroupMembersById = async (userId: string, GroupId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-groupMembers',
		Key: {
			groupId: GroupId,
			userId: userId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Unable to delete group members by id ${userId} and ${GroupId}`);
				reject(err);
			} else {
				console.log(`Delete group members by id is successful`);
				resolve(data);
			}
		});
	});
};

const deleteGroupById = async (groupId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-groups',
		Key: {
			id: groupId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Unable to delete group by id ${groupId}`);
				reject(err);
			} else {
				console.log(`Delete group by id id successfull`);
				resolve(data);
			}
		});
	});
};

const deleteUserByCognitoId = async (cognitoId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-users',
		Key: {
			cognitoId: cognitoId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Delete user failed, user: ${cognitoId}`);
				reject(err);
			} else {
				console.log(`Delete user sucessfull`);
				resolve(data);
			}
		});
	});
};

const getCampaignIdByCampaignName = async (
	campaignName: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-campaigns',
		IndexName: 'campaignName-index',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'campaignName'
		},
		ExpressionAttributeValues: {
			':a': campaignName
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get campaign failed, Camapign Name: ${campaignName}`);
				reject(err);
			} else {
				console.log(`Get campaign successful`);
				resolve(data);
			}
		});
	});
};

const getCampaignsByBrandId = async (brandId: string): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-campaigns',
		IndexName: 'brandId-index',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'brandId'
		},
		ExpressionAttributeValues: {
			':a': brandId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get campaign failed, BrandId ${brandId} failed`);
				reject(err);
			} else {
				console.log(`Get campaign successful`);
				resolve(data);
			}
		});
	});
};

const getCampaignTasksByCampaignId = async (
	campaignId: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-campaignTasks',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'campaignId'
		},
		ExpressionAttributeValues: {
			':a': campaignId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get campaign task failed, CampaignId: ${campaignId}`);
				reject(err);
			} else {
				console.log(`Get campaign task successful`);
				resolve(data);
			}
		});
	});
};

const deleteCampaignTasksByCampaignTaskId = async (CampaignTaskId: string, CampaignId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-campaignTasks',
		Key: {
			campaignId: CampaignId,
			taskId: CampaignTaskId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Delete campaign task failed, CampaignTaskId: ${CampaignTaskId}`);
				reject(err);
			} else {
				console.log(`Delete campaign task successful CampaignTaskId: ${CampaignTaskId}`);
				resolve(data);
			}
		});
	});
};

const getFbPostsByCampaignId = async (
	campaignId: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-fbPostModel',
		IndexName: 'campaignId-index',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'campaignId'
		},
		ExpressionAttributeValues: {
			':a': campaignId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get Fb posts failed, Camapign Id: ${campaignId}`);
				reject(err);
			} else {
				console.log(`Get Fb Posts successful`);
				resolve(data);
			}
		});
	});
};

const deleteFbPostByGroupIdAndTicks = async (GroupId: string, ticks: number): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-fbPostModel',
		Key: {
			groupId: GroupId,
			toBePostedAtUTCTicks: ticks
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Delete Fb posts failed, Group Id: ${GroupId}`);
				reject(err);
			} else {
				console.log(`Delete Fb Post successful`);
				resolve(data);
			}
		});
	});
};

const getUserCampaignsFromCampaignId = async (
	campaignId: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-userCampaigns',
		IndexName: 'campaignId-index',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'campaignId'
		},
		ExpressionAttributeValues: {
			':a': campaignId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get user campaigns failed, Camapign Id: ${campaignId}`);
				reject(err);
			} else {
				console.log(`Get user campaigns successful`);
				resolve(data);
			}
		});
	});
};

const deleteUserCampaignByUserIdAndTicks = async (UserId: string, ticks: number): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-userCampaigns',
		Key: {
			userId: UserId,
			campaignStartDateUTCTick: ticks
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Delete user campaigns failed, UserId: ${UserId}`);
				reject(err);
			} else {
				console.log(`Delete user campaign successful`);
				resolve(data);
			}
		});
	});
};

const getBrandCampaignsByCampaignId = async (
	campaignId: string
): Promise<{Items: [any]; Count: number; ScannedCount: number}> => {
	let params = {
		TableName: 'bd-convosight-dev-brandCampaigns',
		IndexName: 'campaignId-index',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'campaignId'
		},
		ExpressionAttributeValues: {
			':a': campaignId
		}
	};

	return new Promise((resolve, reject) => {
		db.query(params, (err: any, data: any) => {
			if (err) {
				console.log(`Get brand campaigns failed, UserId: ${campaignId}`);
				reject(err);
			} else {
				console.log(`Get brand campaigns successful`);
				resolve(data);
			}
		});
	});
};

const deleteBrandCampaignByBrandIdAndTicks = async (BrandId: string, ticks: number): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-brandCampaigns',
		Key: {
			brandId: BrandId,
			createdAtUTCTick: ticks
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Delete brand campaigns failed, UserId: ${BrandId}`);
				reject(err);
			} else {
				console.log(`Delete brand campaign sucessfull`);
				resolve(data);
			}
		});
	});
};

export const deleteCampaignByCampaignId = async (CampaignId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-campaigns',
		Key: {
			campaignId: CampaignId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err, data) => {
			if (err) {
				console.log(`Delete campaign failed, CampaignId: ${CampaignId}`);
				reject(err);
			} else {
				console.log(`Delete campaign successful`);
				resolve(data);
			}
		});
	});
};

export const deleteUser = async (username: string) => {
	const getUser = await getUserIdByUsername(username);
	const {Count} = getUser;
	try {
		if (Count > 0) {
			const {
				Items: [{id, cognitoId}]
			} = getUser;
			console.log(id, cognitoId);
			if (typeof id !== `undefined`) {
				console.log(`deleting groupMembers`);
				const {Items} = await getGroupMembersByUserId(id);
				if (typeof Items !== `undefined`) {
					for await (let {role, userId, groupId} of Items) {
						if (role === `Admin`) {
							console.log(`deleting group`);
							await deleteGroupById(groupId);
							console.log(`deleting deleteGroupMetrics`);
							await deleteGroupMetrics(groupId);
							await deleteGroupKeywordTrackerStatus(groupId);
							await deleteGroupKeywordMetrics(groupId);
							await deleteGroupKeywordMetricsStatus(groupId);
						}
						await deleteGroupMembersById(userId, groupId);
					}
				}
				await deleteUserByCognitoId(cognitoId);
			}
		}
	} catch (error) {
		console.log('user already deleted', error);
	}
};

export const getUserOtp = async (username: string): Promise<string> => {
	const {
		Items: [{id: userId}]
	} = await getUserIdByUsername(username);
	const {
		Items: [
			{
				emailVerificationDetails: {verificationCode}
			}
		]
	} = await getUserDetailsByUserId(userId);
	return verificationCode;
};

const deleteCampaign = async (campaignId: string) => {
	const fbPostModels = await getFbPostsByCampaignId(campaignId);
	if (typeof fbPostModels !== `undefined`) {
		try {
			for await (let {groupId, toBePostedAtUTCTicks} of fbPostModels.Items) {
				await deleteFbPostByGroupIdAndTicks(groupId, toBePostedAtUTCTicks);
			}
		} catch (e) {
			console.log(e);
		}
	}
	const campaignTasks = await getCampaignTasksByCampaignId(campaignId);
	if (typeof campaignTasks !== 'undefined') {
		try {
			for await (let {taskId} of campaignTasks.Items) {
				await deleteCampaignTasksByCampaignTaskId(taskId, campaignId);
			}
		} catch (e) {
			console.log(e);
		}
	}
	try {
		const brandCampaigns = await getBrandCampaignsByCampaignId(campaignId);
		if (brandCampaigns.Items[0]?.brandId) {
			const {
				Items: [{brandId, createdAtUTCTick}]
			} = brandCampaigns;
			await deleteBrandCampaignByBrandIdAndTicks(brandId, createdAtUTCTick);
		}
	} catch (e) {
		console.log(e);
	}
	try {
		const userCampaigns = await getUserCampaignsFromCampaignId(campaignId);
		if (userCampaigns.Items[0]?.userId) {
			const {
				Items: [{userId, campaignStartDateUTCTick}]
			} = userCampaigns;
			console.log(userId);
			await deleteUserCampaignByUserIdAndTicks(userId, campaignStartDateUTCTick);
		}
	} catch (e) {
		console.log(e);
	}
	await deleteCampaignByCampaignId(campaignId);
};

export const deleteTestCampaigns = async (campaignNumber: string) => {
	const {Items} = await getCampaignsByBrandId(brandId);
	const filteredItems: any[] = Items.filter(x => x.campaignName.includes(campaignNumber));
	for await (const {campaignId} of filteredItems) {
		await deleteCampaign(campaignId);
	}
	return null;
};

export const removeFacebookAccessTokenUsingUsername = async (userName: string) => {
	try {
		const {
			Items: [{cognitoId}]
		}: {Items: [any]} = await getUserIdByUsername(userName);
		return await removeFBAccessToken(cognitoId);
	} catch (error) {
		console.log(`unable to delete`, error);
	}
};
const deleteBrandMembers = async (brandId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-brandMembers',
		Key: {
			brandId: brandId,
			userId: csAdminUserId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Unable to delete brand members by id ${brandId}`);
				reject(err);
			} else {
				console.log(`Delete brand members by id is successful`);
				resolve(data);
			}
		});
	});
};
const deleteBrandId = async (brandId: string): Promise<any> => {
	let params = {
		TableName: 'bd-convosight-dev-brands',
		Key: {
			id: brandId
		}
	};

	return new Promise((resolve, reject) => {
		db.delete(params, (err: any, data: any) => {
			if (err) {
				console.log(`Unable to delete brand by id ${brandId}`);
				reject(err);
			} else {
				console.log(`Delete brand by id is successful`);
				resolve(data);
			}
		});
	});
};
export const deleteBrand = async (brandId: string) => {
	try {
		await deleteBrandMembers(brandId);
		await deleteBrandId(brandId);
	} catch (e) {
		console.log('Not able to delete Brand ID,' + brandId + 'due to  : ' + e);
	}
	return null;
};

const deleteGroupMetrics = async groupId => {
	let params = {
		TableName: 'bd-convosight-dev-groupMetrics',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'groupId'
		},
		ExpressionAttributeValues: {
			':a': groupId
		}
	};

	let items: any;
	do {
		items = await db.query(params).promise();
		console.log(items.Items.length);
		items.Items.forEach(async item => {
			const {groupId, metricForHourUTCStartTick} = item;
			let params1 = {
				TableName: 'bd-convosight-dev-groupMetrics',
				Key: {
					groupId: groupId,
					metricForHourUTCStartTick: metricForHourUTCStartTick
				}
			};
			await db.delete(params1, (err: any, data: any) => {
				if (err) {
					console.log(`Unable to delete group metrics by id `, err);
				} else {
					console.log(`Group Metrics deleted`, data);
				}
			});
		});
		params['ExclusiveStartKey'] = items.LastEvaluatedKey;
	} while (typeof items.LastEvaluatedKey != 'undefined');
};
export const deleteGroupKeywordMetricsStatus = async groupId => {
	let params1 = {
		TableName: 'bd-convosight-dev-groupKeywordsMetricsStatus',
		Key: {
			groupId: groupId
		}
	};
	await db.delete(params1, (err: any, data: any) => {
		if (err) {
			console.log(`Unable to delete group metrics by id `, err);
		} else {
			console.log(`deleteGroupKeywordMetricsStatus deleted`, data);
		}
	});
};
export const deleteGroupKeywordTrackerStatus = async groupId => {
	let params = {
		TableName: 'bd-convosight-dev-groupKeywordTrackerStatus',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'groupId'
		},
		ExpressionAttributeValues: {
			':a': groupId
		}
	};
	let items: any;
	do {
		items = await db.query(params).promise();
		console.log(items.Items.length);
		items.Items.forEach(async item => {
			const {groupId, reportName} = item;
			let params1 = {
				TableName: 'bd-convosight-dev-groupKeywordTrackerStatus',
				Key: {
					groupId: groupId,
					reportName: reportName
				}
			};
			await db.delete(params1, (err: any, data: any) => {
				if (err) {
					console.log(`Unable to delete group metrics by id `, err);
				} else {
					console.log(`Group Metrics deleted`, data);
				}
			});
		});
		params['ExclusiveStartKey'] = items.LastEvaluatedKey;
	} while (typeof items.LastEvaluatedKey != 'undefined');
};
export const deleteGroupKeywordMetrics = async groupId => {
	let params = {
		TableName: 'bd-convosight-dev-groupKeywordMetrics',
		KeyConditionExpression: '#A = :a',
		ExpressionAttributeNames: {
			'#A': 'groupId'
		},
		ExpressionAttributeValues: {
			':a': groupId
		}
	};
	let items: any;
	do {
		items = await db.query(params).promise();
		console.log(items.Items.length);
		items.Items.forEach(async item => {
			const {groupId, metricForDayUTCStartTick} = item;
			let params1 = {
				TableName: 'bd-convosight-dev-groupKeywordMetrics',
				Key: {
					groupId: groupId,
					metricForDayUTCStartTick: metricForDayUTCStartTick
				}
			};
			await db.delete(params1, (err: any, data: any) => {
				if (err) {
					console.log(`Unable to delete group metrics by id `, err);
				} else {
					console.log(`Group Metrics deleted`, data);
				}
			});
		});
		params['ExclusiveStartKey'] = items.LastEvaluatedKey;
	} while (typeof items.LastEvaluatedKey != 'undefined');
};
