import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { AxiosInstance } from 'axios';
import { TableKeySet } from '../notional/types';

const NOTION_STAND_IN_NOTATION = '‣';

export default class TransactionManager {
  constructor(
    private readonly axios: AxiosInstance,
    private readonly keys: TableKeySet,
    private readonly userId: string,
  ) {}

  private formatToDateNode(dateNode: string | string[]) {
    if (Array.isArray(dateNode)) {
      const startDate = moment(dateNode[0]);
      const endDate = moment(dateNode[1]);

      return {
        type: 'daterange',
        start_date: startDate.format('YYYY-MM-DD'),
        start_time: startDate.format('HH:mm'),
        end_date: endDate.format('YYYY-MM-DD'),
        end_time: endDate.format('HH:mm'),
      };
    }

    return {
      type: 'datetime',
      start_date: moment(dateNode).format('YYYY-MM-DD'),
      start_time: moment(dateNode).format('HH:mm'),
    };
  }

  private formatToNotionTextNode(type: string, value: any) {
    switch (type) {
      case 'url':
      case 'email':
      case 'phone_number':
      case 'file':
        return [[value, ['a', value]]];
      case 'date':
        return [
          [NOTION_STAND_IN_NOTATION, [['d', this.formatToDateNode(value)]]],
        ];
      case 'multi_select':
        return [[value.join(',')]];
      case 'user':
        return [[NOTION_STAND_IN_NOTATION, ['u', value]]];
      case 'checkbox':
        return value ? [['Yes']] : null;
      default:
        return [[value]];
    }
  }

  public async insert(data: object[][]) {
    const newBlockId = uuid();
    const now = new Date().getTime();

    const dataToInsert = data.map(row => ({
      id: uuid(),
      operations: row.map((entry: any) => ({
        id: newBlockId,
        table: 'block',
        path: ['properties', entry.id],
        command: 'set',
        // TODO: Ensure all types are supported
        args: this.formatToNotionTextNode(entry.type, entry.value),
      })),
    }));

    return await this.axios.post('submitTransaction', {
      requestId: uuid(),
      transactions: [
        {
          id: uuid(),
          operations: [
            {
              id: newBlockId,
              table: 'block',
              path: [],
              command: 'set',
              args: {
                type: 'page',
                id: newBlockId,
                version: 1,
              },
            },
            {
              table: 'collection_view',
              id: this.keys.collectionViewId,
              path: ['page_sort'],
              command: 'listAfter',
              args: {
                id: newBlockId,
              },
            },
            {
              id: newBlockId,
              table: 'block',
              path: [],
              command: 'update',
              args: {
                parent_id: this.keys.collectionId,
                parent_table: 'collection',
                alive: true,
              },
            },
            {
              table: 'block',
              id: newBlockId,
              path: ['created_by_id'],
              command: 'set',
              args: this.userId,
            },
            {
              table: 'block',
              id: newBlockId,
              path: ['created_by_table'],
              command: 'set',
              args: 'notion_user',
            },
            {
              table: 'block',
              id: newBlockId,
              path: ['created_time'],
              command: 'set',
              args: now,
            },
            {
              table: 'block',
              id: newBlockId,
              path: ['last_edited_time'],
              command: 'set',
              args: now,
            },
            {
              table: 'block',
              id: newBlockId,
              path: ['last_edited_by_id'],
              command: 'set',
              args: this.userId,
            },
            {
              table: 'block',
              id: newBlockId,
              path: ['last_edited_by_table'],
              command: 'set',
              args: 'notion_user',
            },
          ],
        },
        ...dataToInsert,
      ],
    });
  }
}
