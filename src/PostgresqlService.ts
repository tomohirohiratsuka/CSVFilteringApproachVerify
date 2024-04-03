import { Client } from 'pg'
import * as Process from "process";
import fs from "fs";
import {parse} from "csv-parse";
require('dotenv').config()
export class PostgresqlService {
    async initClient() {
        const client = new Client({
            user: Process.env.POSTGRES_USER,
            host: Process.env.POSTGRES_HOST,
            database: Process.env.POSTGRES_DB,
            password: Process.env.POSTGRES_PASSWORD,
        })
        await client.connect()
        return client
    }

    async createTableAndIndexes(client: Client) {
        const createTableSql = `
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    contact_id TEXT,
    first_name TEXT,
    last_name TEXT,
    vrm TEXT
);`;

        const indexSqls = [
            `CREATE INDEX IF NOT EXISTS idx_contacts_vrm ON contacts (vrm);`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_first_name ON contacts (first_name);`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON contacts (last_name);`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_contact_id ON contacts (contact_id);`,
        ];

        try {
            await client.query(createTableSql);

            for (const indexSql of indexSqls) {
                await client.query(indexSql);
            }
        } catch (err) {
            console.error('Error executing query', err.stack);
        }
    }

    async insertFromCSV(client: Client, filePath: string): Promise<void> {
        let buffer = [];
        const batchSize = 2000;

        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath).pipe(
                parse({
                    columns: true,
                })
            );

            const insertData = async () => {
                if (buffer.length === 0) {
                    return;
                }
                // PostgreSQLではバルクインサートのためのプレースホルダーを$1, $2, $3...と指定します。
                const placeholders = buffer.map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ');
                const values = buffer.flat();


                const insertSql = `INSERT INTO contacts (contact_id, first_name, last_name, vrm) VALUES ${placeholders}`;

                try {
                    await client.query(insertSql, values);
                } catch (err) {
                    reject(err);
                }

                buffer = []; // Reset buffer after inserting
            };

            stream.on('data', (row) => {
                buffer.push([
                    row['Record ID'],
                    row['First Name'],
                    row['Last Name'],
                    row['VRM'],
                ]);
                if (buffer.length >= batchSize) {
                    stream.pause(); // Pause the stream to prevent memory overflow
                    insertData().then(() => {
                        stream.resume(); // Resume the stream after data is inserted
                    });
                }
            });

            stream.on('end', async () => {
                await insertData(); // Insert any remaining data in the buffer
                resolve();
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });
    }

    async clearTable(client: Client) {
        try {
            await client.query('TRUNCATE TABLE contacts');
        } catch (err) {
            console.error('Error executing query', err.stack);
        }
    }

    async searchDuplicateContacts(client: Client): Promise<string[][]> {
        const query = `
        SELECT
            string_agg(a.contact_id, ',') AS ids,
            a.first_name,
            a.last_name,
            a.vrm
        FROM
            contacts a
        INNER JOIN
            contacts b ON a.first_name = b.first_name
                        AND a.last_name = b.last_name
                        AND a.vrm = b.vrm
                        AND a.contact_id != b.contact_id
        GROUP BY
            a.first_name, a.last_name, a.vrm
        HAVING
            COUNT(DISTINCT a.contact_id) > 1;
    `;

        try {
            const { rows } = await client.query(query);
            // rowsの形式を[{ids: "1,2,3", first_name: "John", ...}, ...]から[[1, 2, 3], ...]へ変換
            return rows.map(row => row.ids.split(',').map(Number));
        } catch (err) {
            console.error('Error executing searchDuplicateContacts query:', err);
            throw err;
        }
    }
}