/// <reference types="node" />
/// <reference types="node" />
import { format } from 'node:util';
import { EventEmitter } from 'node:events';
export declare const LogLevels: {
    readonly DEBUG: "DEBUG";
    readonly INFO: "INFO";
    readonly WARN: "WARN";
    readonly ERROR: "ERROR";
    readonly NONE: "NONE";
};
export type LogLevel = keyof typeof LogLevels;
declare const Ansi_Colors: {
    readonly Black: 0;
    readonly Red: 1;
    readonly Green: 2;
    readonly Yellow: 3;
    readonly Blue: 4;
    readonly Magenta: 5;
    readonly Cyan: 6;
    readonly Grey: 7;
    readonly White: 9;
    readonly Default: 9;
};
declare const Node_Color: {
    readonly Black: "Black";
    readonly Red: "IndianRed";
    readonly Green: "LimeGreen";
    readonly Yellow: "Orange";
    readonly Blue: "RoyalBlue";
    readonly Magenta: "Orchid";
    readonly Cyan: "SkyBlue";
    readonly Grey: "DimGrey";
    readonly White: "White";
    readonly Default: "Black";
};
export declare let Colors: typeof Ansi_Colors | typeof Node_Color;
export type Color = keyof typeof Colors;
export type Options = {
    useColors: boolean;
    color: typeof Colors[Color];
    showTimestamp: boolean;
    useLocalTime: boolean;
    showLevel: boolean;
    filename?: string;
    appendFile: boolean;
};
export declare class Logger {
    category: string;
    options: Options;
    fileWriter: any;
    constructor(category: string, options: Options);
    debug(...args: Parameters<typeof format>): void;
    log(...args: Parameters<typeof format>): void;
    info(...args: Parameters<typeof format>): void;
    warn(...args: Parameters<typeof format>): void;
    error(...args: Parameters<typeof format>): void;
    private _write;
    private _format;
    private _createLogMessage;
    private _shouldLog;
}
export declare const setLogLevel: (level: LogLevel) => void;
export declare const setLogfile: (filename: string) => void;
export declare const create: (category: string, options: Options) => Logger;
export declare const forceBrowserMode: (force: boolean) => boolean;
export declare const events: EventEmitter;
export {};
