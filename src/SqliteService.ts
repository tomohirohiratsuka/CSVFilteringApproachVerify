import {Database} from "sqlite3";
import path from "path";
import fs from "fs";
import {parse} from "csv-parse";
import {ContactCSVRow} from "@src/types";

export class SqliteService {

    initDatabase(name = 'db'): Promise<Database> {
        return new Promise((resolve, reject) => {
            const database = new Database(
                path.join(__dirname, `tmp/${name}`),
                async (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(database);
                    }
                },
            );
        });
    }

    async createTable(database: Database): Promise<void> {
        const createTableSql = `
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id TEXT,
    first_name TEXT,
    last_name TEXT,
    vrm TEXT
);`;

        const indexSqls = [
            `CREATE INDEX IF NOT EXISTS idx_contacts_vrm ON contacts (vrm)`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_first_name ON contacts (first_name)`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON contacts (last_name)`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_contact_id ON contacts (contact_id)`,
        ];

        await new Promise((resolve, reject) => {
            database.run(createTableSql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(null);
            });
        });

        for (const indexSql of indexSqls) {
            await new Promise((resolve, reject) => {
                database.run(indexSql, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(null);
                    }
                });
            });
        }
    }


    insertFromCSV(database: Database, filePath: string): Promise<void> {
        let buffer = [];
        const batchSize = 2000;

        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath).pipe(
                parse({
                    columns: true,
                }),
            );

            const insertData = () => {
                const placeholders = buffer.map(() => '(?, ?, ?, ?)').join(',');
                const values = buffer.flat();

                database.run(
                    `INSERT INTO contacts (contact_id, first_name, last_name, vrm) VALUES ${placeholders}`,
                    values,
                    (err) => {
                        if (err) {
                            reject(err);
                        }
                        buffer = []; // バッファーをクリア
                    },
                );
            };

            stream.on('data', (row: ContactCSVRow) => {
                buffer.push([
                    row['Record ID'],
                    row['First Name'],
                    row['Last Name'],
                    row['VRM'],
                ]);
                if (buffer.length >= batchSize) {
                    stream.pause();
                    insertData();
                    stream.resume();
                }
            });

            stream.on('end', () => {
                if (buffer.length > 0) {
                    insertData();
                }
                resolve();
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });
    }

    async searchDuplicateContacts(database: Database) {
        const duplicatesByVRM: {ids: string, first_name: string; last_name: string; vrm: string}[] = await new Promise((resolve, reject) => {
            database.all(`
        SELECT
        GROUP_CONCAT(a."contact_id") AS ids,
        a."first_name",
        a."last_name",
        a."vrm"
        FROM contacts a
        INNER JOIN contacts b ON a."first_name" = b."first_name"
                       AND a."last_name" = b."last_name"
                       AND a."vrm" = b."vrm"
                       AND a."contact_id" != b."contact_id"
        GROUP BY a."first_name", a."last_name", a."vrm"
        HAVING COUNT(DISTINCT a."contact_id") > 1;
        `, (err, rows: {ids: string, first_name: string; last_name: string; vrm: string}[]) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            })
        })
        return duplicatesByVRM.map(row => row.ids.split(','));
    }
}