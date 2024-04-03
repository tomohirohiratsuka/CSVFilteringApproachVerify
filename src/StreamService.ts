import fs from "fs";
import {parse} from "csv-parse";
import {ContactCSVRow, ExtractedDuplicateContacts} from "@src/types";

export class StreamService {

    readCSV(filePath: string) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(parse({columns: true}))
                .on('data', async (data: ContactCSVRow) => {
                    // console.log(data['Record ID']);
                })
                .on('end', () => {
                    resolve(null);
                })
                .on('error', (err) => {
                    reject(err);
                });
        })
    }

    async searchDuplicateContacts(
        filePath: string,
    ): Promise<ExtractedDuplicateContacts> {
        const duplicates: ExtractedDuplicateContacts = await new Promise(
            (resolve, reject) => {
                const duplicateContacts: ExtractedDuplicateContacts = [];

                fs.createReadStream(filePath)
                    .pipe(parse({columns: true}))
                    .on('data', async (data: ContactCSVRow) => {
                        const res = await this.searchContact(filePath, data, this.matchFunction);
                        if (res.length) {
                            res.push(data['Record ID']);
                            duplicateContacts.push(res);
                        }
                    })
                    .on('end', () => {
                        resolve(duplicateContacts);

                    })
                    .on('error', (err) => {
                        reject(err);
                    });
            },
        );
        const uniqueDuplicatesStr = new Set(
            duplicates.map((duplicate) => duplicate.sort().join(',')),
        );
        const uniqueDuplicates = Array.from(uniqueDuplicatesStr).map((duplicate) =>
            duplicate.split(','),
        );
        return uniqueDuplicates;
    }

    async searchContact(
        filePath: string,
        target: ContactCSVRow,
        matchFunction: (target: ContactCSVRow, compare: ContactCSVRow) => boolean,
    ): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const foundContactIds: string[] = [];

            fs.createReadStream(filePath)
                .pipe(parse({columns: true}))
                .on('data', (data: ContactCSVRow) => {
                    if (matchFunction(target, data)) {
                        foundContactIds.push(data['Record ID']);
                    }
                })
                .on('end', () => {
                    resolve(foundContactIds); // 結果を返します
                })
                .on('error', (err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    matchFunction(target: ContactCSVRow, compare: ContactCSVRow) {
        const isSameFullName =
            target['First Name'] === compare['First Name'] &&
            target['Last Name'] === compare['Last Name'];
        if (!isSameFullName) {
            return false;
        }
        return target.VRM === compare.VRM;
    }

}