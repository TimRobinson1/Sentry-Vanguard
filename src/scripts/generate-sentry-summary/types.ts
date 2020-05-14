export enum SummaryType {
  OLDER_THAN_1_WEEK = 'OLDER_THAN_1_WEEK',
  AVERAGE_ISSUE_AGE = 'AVERAGE_ISSUE_AGE',
  OLDEST_ISSUE = 'OLDEST_ISSUE',
  ISSUES_ON_LATEST_RELEASE = 'ISSUES_ON_LATEST_RELEASE',
  LATEST_RELEASE_VERSION = 'LATEST_RELEASE_VERSION',
  ISSUES_NEW_TO_LATEST_RELEASE = 'ISSUES_NEW_TO_LATEST_RELEASE',
  UNTICKETED_ISSUES = 'UNTICKETED_ISSUES',
  TOTAL_ISSUES = 'TOTAL_ISSUES',
  NEW_ISSUES = 'NEW_ISSUES',
}

export enum Status {
  OKAY = 'okay',
  GOOD = 'good',
  BAD = 'bad',
  NEUTRAL = 'neutral',
}

export type StatusThreshold = {
  good: number;
  bad: number;
  okay?: number;
  isNeutral?: boolean;
}

export type Options = {
  showOutput?: boolean;
  saveToNotion?: boolean;
  saveToDb?: boolean;
}