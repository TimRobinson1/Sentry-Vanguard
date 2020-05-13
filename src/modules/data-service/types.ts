export type Payload = {
  [k: string]: any
}

export interface DataService {
  save(collection: string, payload?: Payload): Promise<any>;
  update(collection: string, id: string, payload: Payload): Promise<any>;
  upsert(collection: string, payload: Payload): Promise<any>;
  get(collection: string, id?: string): Promise<any>;
  delete(collection: string, id: string): Promise<any>;
}