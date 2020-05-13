
import scripts from './scripts';

const [ scriptId ] = process.argv.slice(2);

if (scriptId) {
  const script = scripts.find(script => script.id === scriptId);

  if (script) {
    const { valid, reason } = script.validateScriptRequirements();

    if (valid) {
      script
        .run()
        .then(console.log)
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