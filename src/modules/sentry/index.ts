import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { get, omitBy, isUndefined } from 'lodash';
import Bluebird from 'bluebird';
import cheerio from 'cheerio';
import parseLink from 'parse-link-header';
import { SentryProject, SentryCache, SentryIssue, FetchIssueOptions, SentryRelease } from './types';

export class SentryClient {
  private readonly token: string;
  private axios: AxiosInstance;
  private project: SentryProject;
  private cache: SentryCache;

  constructor(project: SentryProject) {
    this.project = project
    this.token = project.authToken;
    this.axios = axios.create({
      baseURL: 'https://sentry.io/api/0/',
      headers: {
        authorization: `Bearer ${this.token}`,
      },
    })
    this.cache = {
      releases: [],
    }
  }
  
  private async fetch<ResponseType>(url: string, config?: AxiosRequestConfig) {
    const response = await this.axios.get<ResponseType>(url, config);
    return response.data;
  }

  private parseTicketUrl (data: any) {
    if (!this.project.ticketHostname) {
      return;
    }

    const html = get(data, 'annotations', [])
      .find((annotation: string) =>
        annotation.includes(this.project.ticketHostname!)
      )

    if (!html) {
      return;
    }

    return cheerio.load(html)('a').attr('href');
  }

  private async formatIssue(data: any) {
    const releases = await this.fetchReleases();
    const latestRelease = this.coerceReleaseVersionToSemver(get(data, 'lastRelease.version', ''));
    const ticketUrl = this.parseTicketUrl(data);
    const isOnLatestRelease = latestRelease === releases[0].version;
    const id = get(data, 'id');

    return omitBy({
      id,
      title: get(data, 'title'),
      isOnLatestRelease,
      lastSeen: get(data, 'lastSeen'),
      latestRelease,
      firstSeen: get(data, 'firstSeen'),
      firstRelease: this.coerceReleaseVersionToSemver(get(data, 'firstRelease.version')),
      errorMessage: get(data, 'metadata.value'),
      userCount: get(data, 'userCount'),
      eventCount: get(data, 'count'),
      type: get(data, 'metadata.type'),
      filename: get(data, 'metadata.filename'),
      level: get(data, 'level'),
      assignee: get(data, 'assignedTo.name'),
      issueUrl: `sentry.io/organizations/${this.project.org}/issues/${id}`,
      ticketUrl: ticketUrl,
    }, isUndefined);
  }

  async generateSummary () {
    // Load releases into the cache
    await this.fetchReleases();

    const rawIssues = await this.find();

    const issues = await Bluebird.map(rawIssues, issue => this.fetchIssue(issue.id), {
      concurrency: 4,
    }) as SentryIssue[];

    return {
      issues,
      releases: this.cache.releases,
    }
  }

  async find(query?: string): Promise<SentryIssue[]> {
    return this.fetchList<SentryIssue>(`/projects/${this.project.org}/${this.project.repo}/issues/`, {
      params: {
        query: query || 'is:unresolved',
        statsPeriod: '',
        environment: this.project.environment,
      },
      headers: {
        authorization: `Bearer ${this.token}`,
      },
    });
  }

  private coerceReleaseVersionToSemver (releaseName: string) {
    const [ patch, minor, major ] = releaseName
      .split('.')
      .reverse()
      .map(string =>
        string.replace(/^\D+/g, '')
      );

    return `${major}.${minor}.${patch}`;
  }

  async getLatestRelease () {
    if (this.cache.releases.length) {
      return this.cache.releases[0];
    }

    this.cache.releases = await this.fetchReleases();

    return this.cache.releases[0];
  }

  async fetchReleases () {
    if (this.cache.releases.length) {
      return this.cache.releases;
    }

    const queryString = this.project.releasePrefix ? `?query=${this.project.releasePrefix}` : '';
    const releases = await this.fetch<SentryRelease[]>(`/organizations/${this.project.org}/releases/${queryString}`);

    this.cache.releases = releases.map(release => ({
      version: this.coerceReleaseVersionToSemver(release.version),
      created: release.dateCreated,
    }));

    return this.cache.releases;
  }

  async fetchIssue(id: string, { formatted = true }: FetchIssueOptions = { formatted: true }) {
    const data = await this.fetch(`/issues/${id}/`);
    return formatted ? this.formatIssue(data) : data;
  }

  private async fetchList<T>(url: string, config: AxiosRequestConfig): Promise<T[]> {
    const response = await this.axios.get<T[]>(url, config);
    let items = response.data;

    if (Array.isArray(items) && items.length > 0 && response.headers.link) {
      const links = parseLink(response.headers.link);

      if (links && links.next) {
        items = items.concat(
          await this.fetchList(links.next.url, config),
        );
      }
    }

    return items;
  }
}
