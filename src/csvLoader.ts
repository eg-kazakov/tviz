/* eslint-disable no-console */

import {parse as csvFileParse, ParseError, ParseResult} from 'papaparse';

export interface ICsvData {
    data: Array<{[key: string]: string}>;
    fields: string[];
    fileName: string;
}

interface ICsvDataLoader {
    loadCsv(file: File): Promise<ICsvData>;
}

export const csvLoader: ICsvDataLoader = {
    loadCsv(file: File): Promise<ICsvData> {
        return new Promise((resolve: (value?: ICsvData) => void, reject: (err: Error) => void): void => {
            csvFileParse(file, {
                skipEmptyLines: true,
                header: true,
                complete(results: ParseResult): void {
                    console.log(`Loaded: ${results.data.length} rows.`);
                    return resolve({fields: results.meta.fields, data: results.data, fileName: file.name});
                },
                error: (err: ParseError): void => reject(new Error(`${err.type}: ${err.message} at ln ${err.row}`)),
            });
        });
    },
};
