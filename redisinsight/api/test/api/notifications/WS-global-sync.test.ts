import { describe, it, expect, sleep, _ } from '../deps';
import { createDefaultNotifications, getRepository, repositories } from '../../helpers/local-db';
import { Socket } from 'socket.io-client';
import { getSocket } from '../../helpers/server';
import { constants } from '../../helpers/constants';

const getClient = async (): Promise<Socket> => {
  return getSocket('');
};

let repo;
describe('WS sync', () => {
  beforeEach(async () => {
    repo = await getRepository(repositories.NOTIFICATION);
    await createDefaultNotifications(true);
  });

  it('Should sync notifications and remove not existing in json from local db', async () => {
    const oldNotifications = await repo.createQueryBuilder().where({ type: 'global' }).getMany();
    expect(_.find(oldNotifications, { timestamp: constants.TEST_NOTIFICATION_1.timestamp }))
      .to.not.eq(undefined);
    expect(_.find(oldNotifications, { timestamp: constants.TEST_NOTIFICATION_2.timestamp }))
      .to.not.eq(undefined);
    expect(_.find(oldNotifications, { timestamp: constants.TEST_NOTIFICATION_3.timestamp }))
      .to.not.eq(undefined);

    // Initialize sync by connecting
    await getClient();

    // todo: check new notifications
    // todo: check states of notifications

    await sleep(4000);

    const newNotifications = await repo.createQueryBuilder().where({ type: 'global' }).getMany();
    expect(_.find(newNotifications, { timestamp: constants.TEST_NOTIFICATION_1.timestamp }))
      .to.eq(undefined);
    expect(_.find(newNotifications, { timestamp: constants.TEST_NOTIFICATION_2.timestamp }))
      .to.eq(undefined);
    expect(_.find(newNotifications, { timestamp: constants.TEST_NOTIFICATION_3.timestamp }))
      .to.eq(undefined);
  });
});
