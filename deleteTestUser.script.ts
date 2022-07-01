import {deleteUser, getUserIdByUsername} from './playwright/utils/database.adapter';
import * as readline from 'readline';

(async () => {
	let rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question(`Do you have aws credentials configured in your system?[y/n]`, async answer => {
		switch (answer.toLocaleLowerCase()) {
			case 'y':
				rl.question(`please provide username of the username : `, async username => {
					const {Count} = await getUserIdByUsername(username);
					Count > 0 ? await deleteUser(username) : console.log(`username not valid`);
				});
				break;
			case 'n':
				console.log(`Please configure aws credentials on your system`);
				break;
		}
	});
})().catch(e => {
	console.log(e);
	process.exit();
});
