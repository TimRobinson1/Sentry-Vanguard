import { Status, SummaryType, StatusThreshold } from "./types";
import { SentryIssue } from "../../modules/sentry/types";

export function validateScriptRequirements() {
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
    'REACT_APP_NOTION_API_KEY',
    'REACT_APP_NOTION_USER_ID',
    'REACT_APP_NOTION_COLLECTION_ID',
    'REACT_APP_NOTION_COLLECTION_VIEW_ID',
  ];

  const missingEnvs = requiredEnvs.filter(env => process.env[env] === undefined);

  if (missingEnvs.length) {
    validationResults.valid = false;
    validationResults.reason = `You are missing the following required environment variables: ${missingEnvs.join(', ')}`;
  }

  return validationResults;
}

export function getStatus(count: number, type: SummaryType): Status {
  const thresholds = statusThresholds[type];

  if (thresholds.isNeutral) {
    return Status.NEUTRAL;
  }

  if (count > thresholds.bad) {
    return Status.BAD;
  }

  return count < thresholds.good ? Status.GOOD : Status.OKAY;
}

export const summaryIcons: { [key in SummaryType]: string } = {
  [SummaryType.OLDER_THAN_1_WEEK]: 'FaRegCalendarTimes',
  [SummaryType.AVERAGE_ISSUE_AGE]: 'FaRegClock',
  [SummaryType.OLDEST_ISSUE]: 'FaBusinessTime',
  [SummaryType.ISSUES_ON_LATEST_RELEASE]: 'FaRegCalendarTimes',
  [SummaryType.ISSUES_NEW_TO_LATEST_RELEASE]: 'FaExclamationTriangle',
  [SummaryType.UNTICKETED_ISSUES]: 'FaTicketAlt',
  [SummaryType.TOTAL_ISSUES]: 'FaCalculator',
  [SummaryType.NEW_ISSUES]: 'FaSun',
  [SummaryType.LATEST_RELEASE_VERSION]: 'FaTabletAlt',
}

export const createSummarySection = (
  type: SummaryType,
  value: number,
  issues?: SentryIssue[],
  renderValue: (value: number) => string = (value) => `${value}`,
) => ({
  id: type,
  value: renderValue(value),
  status: getStatus(value, type),
  icon: summaryIcons[type],
  // ! Format these
  issues,
})

// TODO: Refine with team what constitutes bad, good, etc. statuses :)
export const statusThresholds: { [key in SummaryType]: StatusThreshold } = {
  [SummaryType.OLDER_THAN_1_WEEK]: {
    good: 1,
    bad: 5
  },
  [SummaryType.AVERAGE_ISSUE_AGE]: {
    good: 2,
    bad: 7
  },
  [SummaryType.OLDEST_ISSUE]: {
    good: 2,
    bad: 7
  },
  [SummaryType.ISSUES_ON_LATEST_RELEASE]: {
    good: 1,
    bad: 5
  },
  [SummaryType.ISSUES_NEW_TO_LATEST_RELEASE]: {
    good: 1,
    bad: 3
  },
  [SummaryType.UNTICKETED_ISSUES]: {
    good: 1,
    bad: 3
  },
  [SummaryType.TOTAL_ISSUES]: {
    good: 2,
    bad: 10
  },
  [SummaryType.NEW_ISSUES]: {
    good: 2,
    bad: 5
  },
  [SummaryType.LATEST_RELEASE_VERSION]: {
    good: 0,
    bad: 0,
    isNeutral: true,
  },
}