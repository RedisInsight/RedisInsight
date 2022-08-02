import { join } from 'path';
import * as os from 'os';
import { NotificationParameters } from '../pageObjects/notification-page';

const workingDirectory = process.env.APP_FOLDER_ABSOLUTE_PATH
    || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-v2'));
// const dbPath = `${workingDirectory}/redisinsight.db`;
const dbPath = 'E:\\Redis\\RedisInsight\\tests\\e2e\\.redisinsight-v2\\redisinsight.db';
console.log(`dbPath: ${dbPath}`);

const sqlite3 = require('sqlite3').verbose();

export function deleteAllNotificationsFromDB(): void {
    const db = new sqlite3.Database(dbPath);
    db.run('DELETE from notification', function(err: { message: string }) {
        if (err) {
            return console.log(`error during notification deletion: ${err.message}`);
        }
    });
    db.close();
}

export function insertNotificationInDB(notifications: NotificationParameters[]): void {
    const db = new sqlite3.Database(dbPath);
    let query = 'insert into notification ("type", "timestamp", "title", "body", "read") values';
    for (let i = 0; i < notifications.length; i++) {
        const messageWithQuotes = `${notifications[i].notificationType}, ${notifications[i].notificationTimestamp},
        ${notifications[i].notificationTitle}, ${notifications[i].notificationBody}, ${notifications[i].isNotificationRead}`;
        console.log(`messageWithQuotes: ${messageWithQuotes}`);
        if (i === notifications.length - 1) {
            query = `${query} (${messageWithQuotes})`;
        }
        else {
            query = `${query} (${messageWithQuotes}),`;
        }
    }
    console.log(`query: ${query}`);
    db.run(query, function(err: { message: string }) {
        if (err) {
            return console.log(`error during notification creation: ${err.message}`);
        }
    });
    db.close();
}
