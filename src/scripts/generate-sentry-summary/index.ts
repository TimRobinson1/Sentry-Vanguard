import moment from 'moment';
import dotenv from 'dotenv';
import SentryClient from '../../modules/sentry';
import DataService from '../../modules/data-service';
import { validateScriptRequirements, createSummarySection } from './helpers';
import { SummaryType, Options } from './types';
import Logger from '../utils/logger';
import { Notional } from '../../modules/notion';

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
      REACT_APP_NOTION_API_KEY: string;
      REACT_APP_NOTION_USER_ID: string;
      REACT_APP_NOTION_COLLECTION_ID: string;
      REACT_APP_NOTION_COLLECTION_VIEW_ID: string;
    }
  }
}

const logger = new Logger('SentrySummary');

async function generateSentrySummary({
  saveToNotion = false,
  saveToDb = false,
}: Options) {
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
  const notion = new Notional({
    apiKey: process.env.REACT_APP_NOTION_API_KEY,
    userId: process.env.REACT_APP_NOTION_USER_ID
  });

  const { issues, releases } = await sentry.generateSummary();

  const ageInDays = issues.map((issue) =>
    moment().diff(moment(issue.firstSeen), 'days')
  ) as number[];
  const daySum = ageInDays.reduce((previous, current) => current += previous, 0);
  const averageAgeOfTickets = Math.round(daySum / ageInDays.length);

  const release = releases[0].version;

  const issuesOlderThan1Week = issues.filter((issue) => moment(issue.firstSeen).isBefore(moment().subtract({ days: 7 })));
  const oldestIssue = Math.max(...ageInDays);
  const issuesOnLatestRelease = issues.filter((issue) => issue.isOnLatestRelease);
  const issuesNewToLatestRelease = issues.filter((issue) => issue.firstRelease === release);
  const unticketedIssues = issues.filter((issue) => !issue.ticketUrl);
  const newIssues = issues.filter((issue) => moment(issue.firstSeen).isAfter(moment().subtract({ hours: 24 })));

  const baseData = {
    latestRelease: release,
    updatedAt: (new Date()).toISOString(),
    summary: {
      'Issues Older than 1 week': createSummarySection(
        SummaryType.OLDER_THAN_1_WEEK,
        issuesOlderThan1Week.length,
        issuesOlderThan1Week
      ),
      'Average issue age': createSummarySection(
        SummaryType.AVERAGE_ISSUE_AGE,
        averageAgeOfTickets,
        undefined,
        (value) => `${value} days old`,
      ),
      'Oldest issue': createSummarySection(
        SummaryType.OLDEST_ISSUE,
        oldestIssue,
        undefined,
        (value) => `${value} days old`,
      ),
      'Issues on latest release': createSummarySection(
        SummaryType.ISSUES_ON_LATEST_RELEASE,
        issuesOnLatestRelease.length,
        issuesOnLatestRelease,
      ),
      'Latest release version': {
        id: SummaryType.LATEST_RELEASE_VERSION,
        value: release,
        icon: 'FaTabletAlt',
        status: 'neutral',
      },
      'Issues new to latest release': createSummarySection(
        SummaryType.ISSUES_NEW_TO_LATEST_RELEASE,
        issuesNewToLatestRelease.length,
        issuesNewToLatestRelease,        
      ),
      'Unticketed issues': createSummarySection(
        SummaryType.UNTICKETED_ISSUES,
        unticketedIssues.length,
        unticketedIssues,
      ),
      'Total issues': createSummarySection(
        SummaryType.TOTAL_ISSUES,
        issues.length,
        issues,
      ),
      'New issues (last 24 hours)': createSummarySection(
        SummaryType.NEW_ISSUES,
        newIssues.length,
        newIssues,
      )
    }
  }

  const tabularData = Object.entries(baseData.summary).reduce((obj, [key, values]) => {
    const title = key === 'Latest release version' ? 'Release' : key;

    obj[title] = values.value;
    return obj;
  }, {} as { [k: string]: string | number });

  const data = {
    ...baseData,
    // Data for inserting into to Notion table
    tableUpdate: {
      ...tabularData,
      Date: moment().format('YYYY-MM-DD'),
    },
    allIssues: issues,
  }

  if (saveToDb) {
    try {
      await db.update('issues', process.env.REACT_APP_VANGUARD_ISSUES_ID, {
        date: moment().toISOString(),
        summary: data,
      });
      logger.info('Saved to DB');
    } catch (err) {
      logger.error('Failed to export data to DB:', err.message);
    }
  }

  if (saveToNotion) {
    try {
      const table = await notion.table({
        collectionId: process.env.REACT_APP_NOTION_COLLECTION_ID,
        collectionViewId: process.env.REACT_APP_NOTION_COLLECTION_VIEW_ID,
      });

      await table.insertRows([data.tableUpdate]);

      logger.info('Saved to Notion');
    } catch (err) {
      logger.error('Failed to export data to Notion:', err.message);
    }
  }

  return data;
}

export default {
  id: 'generate-sentry-summary',
  name: 'Generate Sentry summary',
  run: generateSentrySummary,
  validateScriptRequirements,
  options: [
    { name: 'show-output', alias: 'o', type: Boolean, defaultValue: false },
    { name: 'save-to-notion', type: Boolean, defaultValue: false },
    { name: 'save-to-db', type: Boolean, defaultValue: false },
  ]
}