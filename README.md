# Vanguard 🛡
> A straightforward Sentry reporter for a high-level overview of your Sentry issues.

<img width="762" alt="Screenshot 2020-06-10 at 10 36 57 am" src="https://user-images.githubusercontent.com/24386407/84252329-5d330680-ab06-11ea-97cc-458439644db0.png">

## Available Scripts

In the project directory, you can use the command `npm run script` to run the following script:
- `generate-sentry-summary`

### Generate Sentry Summary

This will generate a summary of the issues in your provided Sentry repo and can be configured to send the information to either a db, a Notion table, or both.

#### Example usage
```shell
npm run script generate-sentry-summary -- --save-to-db
```

#### Options
`--save-to-db`
  - This will save the output to your provided db.

`--save-to-notion`
  - This will save the output to a Notion table at a provided URL.

