import axios, { AxiosInstance } from 'axios';
import { DataService, Payload } from '../../types';

export default class RestDBAdaptor implements DataService {
  private readonly dbUrl: string;
  private readonly authToken: string;
  private axios: AxiosInstance;

  constructor(authToken: string, dbUrl: string) {
    this.dbUrl = dbUrl;
    this.authToken = authToken;
    this.axios = axios.create({
      baseURL: this.dbUrl,
      headers: {
        'x-apikey': this.authToken
      },
    });
  }

  private getURI(collection: string, id?: string) {
    const uri = collection.startsWith('/') ? collection : `/${collection}`;
    if (!id) {
      return uri;
    }

    return `${uri}/${id}`;
  }

  public async save(collection: string, payload: Payload) {
    const uri = this.getURI(collection);
    const { data } = await this.axios.post(uri, payload);

    return data
  }

  public async update(collection: string, id: string, payload: Payload) {
    const uri = this.getURI(collection, id);

    const { data: existingEntity } = await this.axios.get(uri);

    if (!existingEntity) {
      throw new Error(`Entry for "${uri}" was not found`);
    }

    const { data } = await this.axios.put(uri, payload);

    return data
  }

  public async upsert(collection: string, payload: Payload) {
    const uri = this.getURI(collection);
    const { data } = await this.axios.put(uri, payload);

    return data
  }

  public async get(collection: string, id?: string) {
    const uri = this.getURI(collection, id);
    console.log('BASE_URL', this.dbUrl, uri)
    const { data } = await this.axios.get(uri);

    return data;
  }

  public async delete(collection: string, id: string) {
    const uri = this.getURI(collection, id);
    const { data } = await this.axios.delete(uri);

    return data;
  }
}