
import scripts from './scripts';
import getCliArgs from 'command-line-args';

const [ scriptId ] = process.argv.slice(2);

if (scriptId) {
  const script = scripts.find(script => script.id === scriptId);

  if (script) {
    const { valid, reason } = script.validateScriptRequirements();
    const args = getCliArgs(script.options, { partial: true, camelCase: true });

    if (valid) {
      script
        .run(args as any)
        .then(result => {
          if (args.showOutput) {
            console.log(result);
          }
        })
        .catch(console.error);
      
    } else {
      console.log(reason);
    }
  } else {
    console.log(`Script "${scriptId}" not found`);
  }
} else {
  console.log('Please provide a script to run. E.g. `npm run script generate-sentry-summary`');
}