var shell = require('shelljs');

shell.echo('Make sure, Amplify CLI is globally installed.');
shell.echo('Or Install it using npm install -g @aws-amplify/cli .');
shell.rm('.graphqlconfig.yml');
shell.rm('-rf', 'src/graphql');
shell.rm('src\\app\\API.service.ts');
shell.echo(
	'IMPORTANT! Please run amplify init adter every clone/checkout and select existing env "main" for the same.'
);
