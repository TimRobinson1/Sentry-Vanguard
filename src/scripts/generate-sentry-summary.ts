import moment from 'moment';
import dotenv from 'dotenv';
import { SentryClient } from '../modules/sentry';
import DataService from '../modules/data-service';

dotenv.config();

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      REACT_APP_DB_AUTH_TOKEN: string;
      REACT_APP_DB_URL: string;
      REACT_APP_VANGUARD_ISSUES_ID: string;
      REACT_APP_SENTRY_ORG: string;
      REACT_APP_SENTRY_REPO: string;
      REACT_APP_SENTRY_RELEASE_PREFIX: string;
      REACT_APP_SENTRY_TOKEN: string;
      REACT_APP_SENTRY_TICKET_HOSTNAME: string;
    }
  }
}

function validateScriptRequirements () {
  let validationResults = {
    valid: true,
    reason: '',
  };
  const requiredEnvs = [
    'REACT_APP_SENTRY_ORG',
    'REACT_APP_SENTRY_REPO',
    'REACT_APP_SENTRY_TOKEN',
    'REACT_APP_SENTRY_RELEASE_PREFIX',
    'REACT_APP_SENTRY_TICKET_HOSTNAME',
    'REACT_APP_DB_AUTH_TOKEN',
    'REACT_APP_DB_URL',
    'REACT_APP_VANGUARD_ISSUES_ID',
  ];

  const missingEnvs = requiredEnvs.filter(env => process.env[env] === undefined);

  if (missingEnvs.length) {
    validationResults.valid = false;
    validationResults.reason = `You are missing the following required environment variables: ${missingEnvs.join(', ')}`;
  }

  return validationResults;
}

async function generateSentrySummary () {
  const db = new DataService(
    process.env.REACT_APP_DB_AUTH_TOKEN,
    process.env.REACT_APP_DB_URL,
  );
  const sentry = new SentryClient({
    org: process.env.REACT_APP_SENTRY_ORG,
    repo: process.env.REACT_APP_SENTRY_REPO,
    releasePrefix: process.env.REACT_APP_SENTRY_RELEASE_PREFIX,
    authToken: process.env.REACT_APP_SENTRY_TOKEN,
    ticketHostname: process.env.REACT_APP_SENTRY_TICKET_HOSTNAME
  });

  const { issues, releases } = await sentry.generateSummary();

  const ageInDays = issues.map((issue) =>
    moment().diff(moment(issue.firstSeen), 'days')
  ) as number[];
  const daySum = ageInDays.reduce((previous, current) => current += previous, 0);
  const averageAgeOfTickets = Math.round(daySum / ageInDays.length);

  const release = releases[0].version;

  const issuesOlderThan1Week = issues.filter((issue) => moment(issue.firstSeen).isBefore(moment().subtract({ days: 7 }))).length;
  const oldestIssue = Math.max(...ageInDays);
  const issuesOnLatestRelease = issues.filter((issue) => issue.isOnLatestRelease).length;
  const issuesNewToLatestRelease = issues.filter((issue) => issue.firstRelease === release).length;
  const unticketedIssues = issues.filter((issue) => !issue.ticketUrl).length;
  const newIssues = issues.filter((issue) => moment(issue.firstSeen).isAfter(moment().subtract({ hours: 24 }))).length;

  const baseData = {
    latestRelease: release,
    updatedAt: (new Date()).toISOString(),
    // TODO: Refine with team what constitutes bad, good, etc. statuses :)
    summary: {
      'Issues Older than 1 week': {
        value: issuesOlderThan1Week,
        status: issuesOlderThan1Week > 5 ? 'bad' : (issuesOlderThan1Week < 1 ? 'good' : 'okay'),
        icon: 'FaRegCalendarTimes'
      },
      'Average issue age': {
        value: `${averageAgeOfTickets} days old`,
        status: averageAgeOfTickets > 7 ? 'bad' : (averageAgeOfTickets < 2 ? 'good' : 'okay'),
        icon: 'FaRegClock'
      },
      'Oldest issue': {
        value: `${oldestIssue} days old`,
        status: oldestIssue > 7 ? 'bad' : (oldestIssue < 2 ? 'good' : 'okay'),
        icon: 'FaBusinessTime'
      },
      'Issues on latest release': {
        value: issuesOnLatestRelease,
        status: issuesOnLatestRelease > 5 ? 'bad' : (issuesOnLatestRelease < 1 ? 'good' : 'okay'),
        icon: 'FaRegCalendarTimes',
      },
      'Latest release version': {
        value: release,
        icon: 'FaTabletAlt',
        status: 'neutral',
      },
      'Issues new to latest release': {
        value: issuesNewToLatestRelease,
        status: issuesNewToLatestRelease > 3 ? 'bad' : (issuesNewToLatestRelease < 1 ? 'good' : 'okay'),
        icon: 'FaExclamationTriangle',
      },
      'Unticketed issues': {
        value: unticketedIssues,
        status: unticketedIssues > 2 ? 'bad' : (unticketedIssues < 1 ? 'good' : 'okay'),
        icon: 'FaTicketAlt',
      },
      'Total issues': {
        value: issues.length,
        status: issues.length > 10 ? 'bad' : (issues.length < 2 ? 'good' : 'okay'),
        icon: 'FaCalculator',
      },
      'New issues (last 24 hours)': {
        value: newIssues,
        status: newIssues > 5 ? 'bad' : (newIssues < 2 ? 'good' : 'okay'),
        icon: 'FaSun',
      }
    }
  }

  const data = {
    ...baseData,
    // Data for inserting into to Notion table
    tableUpdate: Object.entries(baseData.summary).reduce((obj, [key, values]) => {
      obj[key] = values.value;
      return obj;
    }, {} as { [k: string]: string | number }),
    allIssues: issues,
  }

  try {
    await db.update('issues', process.env.REACT_APP_VANGUARD_ISSUES_ID, {
      date: new Date().toISOString(),
      summary: data,
    });
  } catch (err) {
    console.error('Failed to export data:', err.message);
  } finally {
    return data;
  }
}

export default {
  id: 'generate-sentry-summary',
  name: 'Generate Sentry summary',
  run: generateSentrySummary,
  validateScriptRequirements,
}