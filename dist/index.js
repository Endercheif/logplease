'use strict';
import * as fs from 'node:fs';
import { format } from 'node:util';
import { EventEmitter } from 'node:events';
// @ts-ignore
let isElectronRenderer = process.type && process.type === 'renderer';
let isNodejs = !isElectronRenderer && process.version ? true : false;
export const LogLevels = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    NONE: 'NONE',
};
// Global log level
let GlobalLogLevel = LogLevels.DEBUG;
// Global log file name
let GlobalLogfile;
let GlobalEvents = new EventEmitter();
// ANSI colors
const Ansi_Colors = {
    Black: 0,
    Red: 1,
    Green: 2,
    Yellow: 3,
    Blue: 4,
    Magenta: 5,
    Cyan: 6,
    Grey: 7,
    White: 9,
    Default: 9,
};
const Node_Color = {
    Black: 'Black',
    Red: 'IndianRed',
    Green: 'LimeGreen',
    Yellow: 'Orange',
    Blue: 'RoyalBlue',
    Magenta: 'Orchid',
    Cyan: 'SkyBlue',
    Grey: 'DimGrey',
    White: 'White',
    Default: 'Black',
};
export let Colors = Ansi_Colors;
// CSS colors
if (!isNodejs) {
    Colors = Node_Color;
}
const loglevelColors = [
    Colors.Cyan,
    Colors.Green,
    Colors.Yellow,
    Colors.Red,
    Colors.Default,
];
const defaultOptions = {
    useColors: true,
    color: Colors.Default,
    showTimestamp: true,
    useLocalTime: false,
    showLevel: true,
    filename: GlobalLogfile,
    appendFile: true,
};
export class Logger {
    category;
    options;
    fileWriter;
    constructor(category, options) {
        this.category = category;
        let opts = {};
        Object.assign(opts, defaultOptions);
        Object.assign(opts, options);
        this.options = opts;
        this.debug = this.debug.bind(this);
        this.log = this.log.bind(this);
        this.info = this.info.bind(this);
        this.warn = this.warn.bind(this);
        this.error = this.error.bind(this);
    }
    debug(...args) {
        if (this._shouldLog(LogLevels.DEBUG))
            this._write(LogLevels.DEBUG, format(...args));
    }
    log(...args) {
        if (this._shouldLog(LogLevels.DEBUG))
            this.debug.apply(this, args);
    }
    info(...args) {
        if (this._shouldLog(LogLevels.INFO))
            this._write(LogLevels.INFO, format(...args));
    }
    warn(...args) {
        if (this._shouldLog(LogLevels.WARN))
            this._write(LogLevels.WARN, format(...args));
    }
    error(...args) {
        if (this._shouldLog(LogLevels.ERROR))
            this._write(LogLevels.ERROR, format(...args));
    }
    _write(level, text) {
        if ((this.options.filename || GlobalLogfile) &&
            !this.fileWriter &&
            isNodejs)
            this.fileWriter = fs.openSync(this.options.filename || GlobalLogfile, this.options.appendFile ? 'a+' : 'w+');
        let format = this._format(level);
        let unformattedText = this._createLogMessage(level, text);
        let formattedText = this._createLogMessage(level, text, format.timestamp, format.level, format.category, format.text);
        if (this.fileWriter && isNodejs)
            fs.writeSync(this.fileWriter, unformattedText + '\n', null, 'utf-8');
        if (isNodejs || !this.options.useColors) {
            console.log(formattedText);
            GlobalEvents.emit('data', this.category, level, text);
        }
        else {
            // TODO: clean this up
            if (level === LogLevels.ERROR) {
                if (this.options.showTimestamp && this.options.showLevel) {
                    console.error(formattedText, format.timestamp, format.level, format.category, format.text);
                }
                else if (this.options.showTimestamp && !this.options.showLevel) {
                    console.error(formattedText, format.timestamp, format.category, format.text);
                }
                else if (!this.options.showTimestamp && this.options.showLevel) {
                    console.error(formattedText, format.level, format.category, format.text);
                }
                else {
                    console.error(formattedText, format.category, format.text);
                }
            }
            else {
                if (this.options.showTimestamp && this.options.showLevel) {
                    console.log(formattedText, format.timestamp, format.level, format.category, format.text);
                }
                else if (this.options.showTimestamp && !this.options.showLevel) {
                    console.log(formattedText, format.timestamp, format.category, format.text);
                }
                else if (!this.options.showTimestamp && this.options.showLevel) {
                    console.log(formattedText, format.level, format.category, format.text);
                }
                else {
                    console.log(formattedText, format.category, format.text);
                }
            }
        }
    }
    _format(level) {
        // _text here for backward compatability
        let timestampFormat = '';
        let levelFormat = '';
        let categoryFormat = '';
        let textFormat = ': ';
        if (this.options.useColors) {
            const levelColor = Object.values(LogLevels).indexOf(level);
            const categoryColor = this.options.color;
            if (isNodejs) {
                if (this.options.showTimestamp)
                    timestampFormat = '\u001b[3' + Colors.Grey + 'm';
                if (this.options.showLevel)
                    levelFormat = '\u001b[3' + loglevelColors[levelColor] + ';22m';
                categoryFormat = '\u001b[3' + categoryColor + ';1m';
                textFormat = '\u001b[0m: ';
            }
            else {
                if (this.options.showTimestamp)
                    timestampFormat = 'color:' + Colors.Grey;
                if (this.options.showLevel)
                    levelFormat = 'color:' + loglevelColors[levelColor];
                categoryFormat = 'color:' + categoryColor + '; font-weight: bold';
            }
        }
        return {
            timestamp: timestampFormat,
            level: levelFormat,
            category: categoryFormat,
            text: textFormat,
        };
    }
    _createLogMessage(level, text, timestampFormat = '', levelFormat = '', categoryFormat = '', textFormat = '') {
        if (!isNodejs && this.options.useColors) {
            if (this.options.showTimestamp)
                timestampFormat = '%c';
            if (this.options.showLevel)
                levelFormat = '%c';
            categoryFormat = '%c';
            textFormat = ': %c';
        }
        let result = '';
        if (this.options.showTimestamp && !this.options.useLocalTime)
            result += '' + new Date().toISOString() + ' ';
        if (this.options.showTimestamp && this.options.useLocalTime)
            result += '' + new Date().toLocaleString() + ' ';
        result = timestampFormat + result;
        if (this.options.showLevel)
            result +=
                levelFormat +
                    '[' +
                    level +
                    ']' +
                    (level === LogLevels.INFO || level === LogLevels.WARN ? ' ' : '') +
                    ' ';
        result += categoryFormat + this.category;
        result += textFormat + text;
        return result;
    }
    _shouldLog(level) {
        let envLogLevel = (typeof process !== 'undefined' &&
            process.env !== undefined &&
            process.env.LOG !== undefined
            ? process.env.LOG.toUpperCase()
            : null);
        envLogLevel =
            // @ts-ignore
            typeof window !== 'undefined' && window.LOG
                // @ts-ignore
                ? window.LOG.toUpperCase()
                : envLogLevel;
        const logLevel = envLogLevel || GlobalLogLevel;
        const levels = Object.values(LogLevels);
        const index = levels.indexOf(level);
        const levelIdx = levels.indexOf(logLevel);
        return index >= levelIdx;
    }
}
export const setLogLevel = (level) => {
    GlobalLogLevel = level;
};
export const setLogfile = (filename) => {
    GlobalLogfile = filename;
};
export const create = (category, options) => {
    return new Logger(category, options);
};
export const forceBrowserMode = (force) => (isNodejs = !force); // for testing,
export const events = GlobalEvents;
