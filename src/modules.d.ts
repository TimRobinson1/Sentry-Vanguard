declare namespace NodeJS {
  export interface ProcessEnv {
    REACT_APP_DB_AUTH_TOKEN: string;
    REACT_APP_DB_URL: string;
    REACT_APP_VANGUARD_ISSUES_ID: string;
    REACT_APP_SENTRY_ORG: string;
    REACT_APP_SENTRY_REPO: string;
    REACT_APP_SENTRY_RELEASE_PREFIX: string;
  }
}
