const data = require('./data/chart-data.json');

const issues = data.allIssues;

const issuesWithoutTickets = issues.filter(issue => !issue.ticketUrl).map(issue => issue.issueUrl);

console.log(issuesWithoutTickets);