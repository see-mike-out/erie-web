(function (exports, tts, d3, aq, vega) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var tts__namespace = /*#__PURE__*/_interopNamespaceDefault(tts);
    var aq__namespace = /*#__PURE__*/_interopNamespaceDefault(aq);
    var vega__namespace = /*#__PURE__*/_interopNamespaceDefault(vega);

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    function normalizeScaleConsistency(config, used_channels) {
        var _a, _b, _c, _d;
        let overlayScaleConsistency = {}, forceOverlayScaleConsistency = {}, sequenceScaleConsistency = {}, forceSequenceScaleConsistency = {};
        for (const chn of used_channels) {
            // overlayScaleConsistency
            if (config.overlayScaleConsistency instanceof Object
                && ((_a = config.overlayScaleConsistency) === null || _a === void 0 ? void 0 : _a[chn]) !== undefined) {
                overlayScaleConsistency[chn] = config.overlayScaleConsistency[chn];
            }
            else if (typeof config.overlayScaleConsistency === 'boolean') {
                overlayScaleConsistency[chn] = config.overlayScaleConsistency;
            }
            else {
                // default 
                overlayScaleConsistency[chn] = true;
            }
            // forceOverlayScaleConsistency
            if (config.forceOverlayScaleConsistency instanceof Object
                && ((_b = config.forceOverlayScaleConsistency) === null || _b === void 0 ? void 0 : _b[chn]) !== undefined) {
                forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency[chn];
            }
            else if (typeof config.forceOverlayScaleConsistency === 'boolean') {
                forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency;
            }
            else {
                // default
                forceOverlayScaleConsistency[chn] = false;
            }
            // sequenceScaleConsistency
            if (config.sequenceScaleConsistency instanceof Object
                && ((_c = config.sequenceScaleConsistency) === null || _c === void 0 ? void 0 : _c[chn]) !== undefined) {
                sequenceScaleConsistency[chn] = config.sequenceScaleConsistency[chn];
            }
            else if (typeof config.sequenceScaleConsistency === 'boolean') {
                sequenceScaleConsistency[chn] = config.sequenceScaleConsistency;
            }
            else {
                // default
                sequenceScaleConsistency[chn] = true;
            }
            // forceOverlayScaleConsistency
            if (config.forceSequenceScaleConsistency instanceof Object
                && ((_d = config.forceSequenceScaleConsistency) === null || _d === void 0 ? void 0 : _d[chn]) !== undefined) {
                forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency[chn];
            }
            else if (typeof config.forceSequenceScaleConsistency === 'boolean') {
                forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency;
            }
            else {
                // default 
                forceSequenceScaleConsistency[chn] = false;
            }
        }
        // reassign values
        config.overlayScaleConsistency = overlayScaleConsistency;
        config.forceOverlayScaleConsistency = forceOverlayScaleConsistency;
        config.sequenceScaleConsistency = sequenceScaleConsistency;
        config.forceSequenceScaleConsistency = forceSequenceScaleConsistency;
    }

    const ForceRepeatScale = 'forceRepeatScale', PlayAt = 'playScaleAt', BeforeAll = 'beforeAll', BeforeThis = 'beforeThis', AfterAll = 'afterAll', AfterThis = 'afterThis';

    // encoding types
    const QUANT = 'quantitative', ORD = 'ordinal', NOM = 'nominal', TMP = 'temporal', STATIC = 'static';
    // ranmping types
    const RampAbrupt = 'abrupt', RampLinear = 'linear', RampExp = 'exponential';
    const RampMethods = [true, false, RampAbrupt, RampLinear, RampExp];
    // SCALE
    // polarity
    const POS = 'positive', NEG = 'negative';
    const SupportedPolarity = [POS, NEG];
    // timing
    const REL = 'relative', ABS = 'absolute', SIM = 'simultaneous';
    const TIMINGS = [REL, ABS, SIM];
    // quant scale types
    const LINEAR = "linear", SQRT = "sqrt", POW = "pow", LOG = "log", SYMLOG = "symlog";
    // single tapping
    const Start = 'start', Middle = 'middle', End = 'end';
    const SingleTapPosOptions = [Start, Middle, End];
    // sacle object
    const KeyDomain = 'domain', KeyDomainMin = 'domainMin', KeyDomainMax = 'domainMax', KeyDomainMid = 'domainMid', KeyRange = 'range', KeyRangeMin = 'rangeMin', KeyRangeMax = 'rangeMax', KeyRangeMid = 'rangeMid', KeyPolarity = 'polarity', KeyMaxDistinct = 'maxDistinct', KeyTimes = 'times', KeyZero = 'zero', KeyDescription = 'description', KeyTitle = 'title', KeyLength = 'length', KeyBand = 'band', KeyTiming = 'timing', KeyOrder = 'order', KeySort = 'sort', KeyType = 'type', KeyBase = 'base', KeyConstant = 'constant', KeyExponent = 'exponent', KeySingleTappingPosition = 'singleTappingPosition', KeyNice = 'nice', KeyPauseRate = 'pauseRate', KeyPauseLength = 'pauseLength', KeyMaxTappingLength = 'maxTappingLength';
    // format
    const NumberFormat = 'number', DateFormat = 'datetime';
    // tick
    const TickKeyName = 'name', TickKeyInterval = 'interval', TickKeyBand = 'band', TickKeyPlayAtTime0 = 'playAtTime0', TickKeyOscType = 'oscType', TickKeyPitch = 'pitch', TickKeyLoudness = 'loudness';
    // Channels
    // Channel names
    const TIME_chn = "time", TIME2_chn = "time2", DUR_chn = "duration", TAPCNT_chn = "tapCount", TAPSPD_chn = "tapSpeed", POST_REVERB_chn = "postReverb", PITCH_chn = "pitch", LOUDNESS_chn = "loudness", PAN_chn = "pan", SPEECH_chn = "speech", SPEECH_BEFORE_chn = "speechBefore", SPEECH_AFTER_chn = "speechAfter", TIMBRE_chn = "timbre", MODULATION_chn = "modulation", HARMONICITY_chn = "harmonicity", DETUNE_chn = "detune", REPEAT_chn = "repeat";
    // channel categories
    const TimeChannels = [
        TIME_chn,
        TIME2_chn
    ];
    const NonTimeChannels = [
        PITCH_chn,
        DETUNE_chn,
        LOUDNESS_chn,
        PAN_chn,
        DUR_chn,
        SPEECH_BEFORE_chn,
        SPEECH_AFTER_chn,
        POST_REVERB_chn,
        TAPCNT_chn,
        TAPSPD_chn,
        MODULATION_chn,
        HARMONICITY_chn
    ];
    const SpeechChannels = [
        SPEECH_chn,
        SPEECH_BEFORE_chn,
        SPEECH_AFTER_chn
    ];
    const TapChannels = [
        TAPCNT_chn,
        TAPSPD_chn
    ];
    const DefaultChannels = [
        TIME_chn,
        TIME2_chn,
        PITCH_chn,
        DETUNE_chn,
        LOUDNESS_chn,
        PAN_chn,
        DUR_chn,
        SPEECH_chn,
        SPEECH_BEFORE_chn,
        SPEECH_AFTER_chn,
        POST_REVERB_chn,
        TAPCNT_chn,
        TAPSPD_chn,
        MODULATION_chn,
        HARMONICITY_chn
    ];
    // Defualt values
    // default caps
    const MIN_TIME = 0, MAX_TIME = 5, MIN_PITCH = 207.65, MAX_PITCH = 1600, MAX_LIMIT_PITCH$1 = 3000, MAX_DETUNE = 1200, MIN_DETUNE = -1200, MIN_LOUD = 0, MAX_LOUD = 10, MIN_PAN = -1, MAX_PAN = 1, MIN_DUR = 0, MAX_DUR = 20, DEF_DUR = 0.5, MIN_POST_REVERB = 0, MAX_POST_REVERB = 4, MIN_TAP_COUNT = 0, MAX_TAP_COUNT = 25, MIN_TAP_SPEED = 0, MAX_TAP_SPEED = 5, MAX_LIMIT_TAP_SPEED$1 = 7, DEF_SPEECH_RATE = 1.75;
    // defaults
    const defaultTapLength = 0.2;
    const ChannelThresholds = {
        [TIME_chn]: { max: null, min: 0 },
        [PITCH_chn]: { max: MAX_PITCH, min: MIN_PITCH },
        [DETUNE_chn]: { max: MAX_DETUNE, min: MIN_DETUNE },
        [LOUDNESS_chn]: { max: MAX_LOUD, min: MIN_LOUD },
        [PAN_chn]: { max: MAX_PAN, min: MIN_PAN },
        [DUR_chn]: { max: MAX_DUR, min: MIN_DUR },
        [POST_REVERB_chn]: { max: MAX_POST_REVERB, min: 0 },
        [TAPCNT_chn]: { max: MAX_TAP_COUNT, min: 0 },
        [TAPSPD_chn]: { max: MAX_TAP_SPEED, min: MIN_TAP_SPEED }
    };
    // cap values if exceeding
    const ChannelCaps = {
        [TIME_chn]: { max: Infinity, min: MIN_TIME },
        [PITCH_chn]: { max: MAX_LIMIT_PITCH$1, min: 0 },
        [DETUNE_chn]: { max: MAX_DETUNE, min: MIN_DETUNE },
        [LOUDNESS_chn]: { max: Infinity, min: -Infinity },
        [PAN_chn]: { max: MAX_PAN, min: MIN_PAN },
        [DUR_chn]: { max: Infinity, min: MIN_DUR },
        [POST_REVERB_chn]: { max: Infinity, min: 0 },
        [TAPCNT_chn]: { max: Infinity, min: 0 },
        [TAPSPD_chn]: { max: MAX_LIMIT_TAP_SPEED$1, min: MIN_TAP_SPEED }
    };
    // tapping
    // TAPPING: each tap sound
    // TAP: entire tappings
    const DEF_TAP_PAUSE_RATE = 0.4, MAX_TAPPING_DUR = 0.3, DEF_TAPPING_DUR = 0.2, DEF_TAPPING_DUR_BEAT = 1, DEF_TAP_DUR = 2, DEF_TAP_DUR_BEAT = 4, SINGLE_TAP_MIDDLE = 'middle', SINGLE_TAP_START = 'start', SINGLE_TAP_END = 'end';
    // description related
    const ScaleDescriptionOrder = [
        REPEAT_chn,
        TIME_chn,
        TIMBRE_chn,
        DUR_chn,
        TAPCNT_chn,
        TAPSPD_chn,
        PITCH_chn,
        DETUNE_chn,
        LOUDNESS_chn,
        PAN_chn,
        MODULATION_chn,
        HARMONICITY_chn,
        POST_REVERB_chn
    ], SKIP = 'skip', NONSKIP = 'nonskip', DEF_LEGEND_DUR = 0.5;

    const SEQUENCE = 'sequence', OVERLAY = 'overlay';

    const FM = 'FM', AM = 'AM';
    const SINE = 'sine', SQUARE = 'square', SAWTOOTH = 'sawtooth', TRIANGLE = 'triangle';
    const SynthTypes = [FM, AM];
    const OscTypes = [SINE, SQUARE, SAWTOOTH, TRIANGLE];
    const DefCarrierPitch = 220, DefModPitch = 440, DefaultModGainAM = 0.5, DefaultModGainFM = 10;

    const TU_SEC = "second", TU_BEAT = "beat";
    const TU_Always = 'always', TU_Start = 'start', TU_Never = 'never';

    /** General: Aggregation names */
    const COUNT = 'count', VALID = 'valid', DISTINCT = 'distinct', MEAN = 'mean', AVG = 'average', MODE = 'mode', MEDIAN = 'median', QUANTILE = 'quantile', STDEV = 'stdev', STDEVP = 'stdevp', VARIANCE = 'variance', VARIANCEP = 'variancep', SUM = 'sum', PRODUCT = 'product', MAX = 'max', MIN = 'min', CORR = 'corr', COVARIANCE = 'covariance', COVARIANCEP = 'covariancep';
    /** General: Aggregation types */
    const ZeroOPs = [
        COUNT
    ];
    const SingleOps = [
        VALID, DISTINCT, MEAN, AVG, MODE, MEDIAN,
        QUANTILE, STDEV, STDEVP, VARIANCE, VARIANCEP,
        SUM, PRODUCT, MAX, MIN
    ];
    const DoubleOps = [
        CORR, COVARIANCE, COVARIANCEP
    ];
    const Auto = "auto";

    function aRange(s, e, incl) {
        let o = [];
        if (incl)
            e = e + 1;
        for (let i = s; i < e; i++) {
            o.push(i);
        }
        return o;
    }
    const timeUnitDomainDefs = {
        monthNumber: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        monthNumber1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        monthShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        monthLong: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        dayNumber: [0, 1, 2, 3, 4, 5, 6],
        dayNumber1: [1, 2, 3, 4, 5, 6, 7],
        dayNumberFromMon: [6, 0, 1, 2, 3, 4, 5],
        dayNumberFromMon1: [7, 1, 2, 3, 4, 5, 6],
        dayLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayShort: ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],
        date: aRange(0, 31, true),
        hour: aRange(0, 24, false),
        hour12: aRange(0, 12, false),
        minute: aRange(0, 60, false),
        second: aRange(0, 60, false),
        millisecond: aRange(0, 100, false)
    };

    class InternalData extends Array {
        constructor(...arr) {
            super(...arr);
        }
    }

    const DefaultGlyphFeatures = [
        'start', 'end', 'duration', 'instrument_type', 'pitch', 'detune', 'loudness', 'pan',
        'postReverb', 'timbre', 'tapCount', 'tapSpeed', 'tap', 'modulation', 'harmonicity', 'speech', 'language'
    ];
    function isDefaultGlyphFeature(key) {
        return DefaultGlyphFeatures.includes(key);
    }
    const TextType = 'text', ToneType = 'tone', SpeechType = 'speech', ToneSeries = 'tone-series', LegendType = 'legend', ToneSpeechSeries = 'tone-speech-series', Pause = 'pause', ToneOverlaySeries = 'tone-overlay-series';
    const QueueItemTypes = [
        TextType, ToneType, ToneSeries, LegendType, ToneSpeechSeries, Pause, ToneOverlaySeries
    ];

    // keywords used in the markup
    const DescKeySound = 'sound', DescKeyList = 'list', DescKeyDomain = 'domain', DescKeyDomainMin = 'domain.min', DescKeyDomainMax = 'domain.max', DescKeyDomainLength = 'domain.length', DescKeyChannel = 'channel', DescKeyField = 'field', DescKeyAggregate = 'aggregate', DescKeyTitle = 'title', DescKeyRange = 'range', DescKeyRangeMin = 'range.min', DescKeyRangeMax = 'range.max', DescKeyRangeLength = 'range.length', DescKeyTimeUnit = 'timeUnit';
    const DescKeyDomainNumberedRegex = /domain\[[0-9]+\]/g;
    const descriptionKeywords = [
        DescKeySound,
        DescKeyList,
        DescKeyDomain,
        DescKeyDomainMin,
        DescKeyDomainMax,
        DescKeyDomainLength,
        DescKeyChannel,
        DescKeyField,
        DescKeyAggregate,
        DescKeyTitle,
        DescKeyRange,
        DescKeyRangeMin,
        DescKeyRangeMax,
        DescKeyRangeLength,
        DescKeyTimeUnit
    ];
    // intermediate format (right after parsed)
    const K_Text = 'text', K_Keyword = 'keyword';
    // output type
    const M_Text = 'text', M_Sound = 'sound';

    const SupportedInstruments = ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"];
    const MultiNoteInstruments = ["piano", "pianoElec", "violin", "metal", "guitar"];
    const SingleNoteInstruments = ["hithat", "snare", "highKick", "lowKick", "clap"];
    const noteFreqRange = [
        {
            octave: 0,
            gf: 23.12 / 2,
            g: 24.5 / 2,
            af: 25.96 / 2,
            a: 27.5 / 2,
            bf: 29.14 / 2,
            b: 30.87 / 2,
            c: 16.35,
            cs: 17.32,
            d: 18.35,
            ds: 19.45,
            e: 20.6,
            f: 21.83,
            fs: 23.12
        },
        {
            octave: 1,
            gf: 23.12,
            g: 24.5,
            af: 25.96,
            a: 27.5,
            bf: 29.14,
            b: 30.87,
            c: 32.7,
            cs: 34.65,
            d: 36.71,
            ds: 38.89,
            e: 41.2,
            f: 43.65,
            fs: 46.25
        },
        {
            octave: 2,
            gf: 46.25,
            g: 49,
            af: 51.91,
            a: 55,
            bf: 58.27,
            b: 61.74,
            c: 65.41,
            cs: 69.3,
            d: 73.42,
            ds: 77.78,
            e: 82.41,
            f: 87.31,
            fs: 92.5
        },
        {
            octave: 3,
            gf: 92.5,
            g: 98,
            af: 103.83,
            a: 110,
            bf: 116.54,
            b: 123.47,
            c: 130.81,
            cs: 138.59,
            d: 146.83,
            ds: 155.56,
            e: 164.81,
            f: 174.61,
            fs: 185
        },
        {
            octave: 4,
            gf: 185,
            g: 196,
            af: 207.65,
            a: 220,
            bf: 233.08,
            b: 246.94,
            c: 261.63,
            cs: 277.18,
            d: 293.66,
            ds: 311.13,
            e: 329.63,
            f: 349.23,
            fs: 369.99
        },
        {
            octave: 5,
            gf: 369.99,
            g: 392,
            af: 415.3,
            a: 440,
            bf: 466.16,
            b: 493.88,
            c: 523.25,
            cs: 554.37,
            d: 587.33,
            ds: 622.25,
            e: 659.25,
            f: 698.46,
            fs: 739.99
        },
        {
            octave: 6,
            gf: 739.99,
            g: 783.99,
            af: 830.61,
            a: 880,
            bf: 932.33,
            b: 987.77,
            c: 1046.5,
            cs: 1108.73,
            d: 1174.66,
            ds: 1244.51,
            e: 1318.51,
            f: 1396.91,
            fs: 1479.98
        },
        {
            octave: 7,
            gf: 1479.98,
            g: 1567.98,
            af: 1661.22,
            a: 1760,
            bf: 1864.66,
            b: 1975.53,
            c: 2093,
            cs: 2217.46,
            d: 2349.32,
            ds: 2489.02,
            e: 2637.02,
            f: 2793.83,
            fs: 2959.96
        }
    ];
    const noteScaleOrder = ['gf', 'g', 'af', 'a', 'bf', 'b', 'c', 'cs', 'd', 'ds', 'e', 'f', 'fs'];
    const detuneAmmount = {
        gf: -600,
        g: -500,
        af: -400,
        a: -300,
        bf: -200,
        b: -100,
        c: 0,
        cs: 100,
        d: 200,
        ds: 300,
        e: 400,
        f: 500,
        fs: 600
    };
    const DefaultFrequency = 523.25;

    function isTextInfo(item) {
        return 'speech' in item;
    }
    function isSoundInfo(item) {
        return 'instrument_type' in item;
    }
    function isPauseInfo(item) {
        return 'duration' in item && Object.keys(item).length == 1;
    }
    function isGlyphInfo(item) {
        return 'start' in item;
    }
    function isToneSeriesInfo(item) {
        return 'sounds' in item;
    }
    function isToneOverlayInfo(item) {
        return 'overlays' in item;
    }

    const bcp47language = [
        "ar-SA",
        "bn-BD",
        "bn-IN",
        "cs-CZ",
        "da-DK",
        "de-AT",
        "de-CH",
        "de-DE",
        "el-GR",
        "en-AU",
        "en-CA",
        "en-GB",
        "en-IE",
        "en-IN",
        "en-NZ",
        "en-US",
        "en-ZA",
        "es-AR",
        "es-CL",
        "es-CO",
        "es-ES",
        "es-MX",
        "es-US",
        "fi-FI",
        "fr-BE",
        "fr-CA",
        "fr-CH",
        "fr-FR",
        "he-IL",
        "hi-IN",
        "hu-HU",
        "id-ID",
        "it-CH",
        "it-IT",
        "ja-JP",
        "ko-KR",
        "nl-BE",
        "nl-NL",
        "no-NO",
        "pl-PL",
        "pt-BR",
        "pt-PT",
        "ro-RO",
        "ru-RU",
        "sk-SK",
        "sv-SE",
        "ta-IN",
        "ta-LK",
        "th-TH",
        "tr-TR",
        "zh-CN",
        "zh-HK",
        "zh-TW"
    ];

    const Stopped = 'stopped', Playing = 'playing', Paused = 'paused', MultiPlaying = 'milti-playing', Finished = 'finished';

    function isTextQueueItem(item) {
        return item.type === TextType;
    }
    function isToneQueueItem(item) {
        return item.type === ToneType;
    }
    function isPauseQueueItem(item) {
        return item.type === Pause;
    }
    function isSeriesQueueItem(item) {
        return item.type === ToneSeries || item.type === ToneSpeechSeries;
    }
    function isToneSeriesQueueItem(item) {
        return item.type === ToneSeries;
    }
    function isToneSpeechSeriesQueueItem(item) {
        return item.type === ToneSpeechSeries;
    }
    function isToneOverlaySeriesQueueItem(item) {
        return item.type === ToneOverlaySeries;
    }

    function isOscType(iType) {
        return OscTypes.includes(iType);
    }

    const SampleRate$1 = 44100, BufferChannels$1 = 2;

    const RamperNames = {
        [RampAbrupt]: 'setValueAtTime',
        [RampLinear]: 'linearRampToValueAtTime',
        [RampExp]: 'exponentialRampToValueAtTime'
    };

    function isBrowserEventPossible() {
        var _a;
        return typeof document === 'object' && ((_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.dispatchEvent);
    }
    function isBrowserWindowPossible() {
        return typeof window === 'object';
    }

    function unique(arr) {
        return Array.from(new Set(arr));
    }
    function deepcopy(i) {
        return JSON.parse(JSON.stringify(i));
    }
    function round(n, d) {
        let e = Math.pow(10, -d);
        return Math.round(n * e) / e;
    }
    function floor(n, d) {
        let e = Math.pow(10, -d);
        return Math.floor(n * e) / e;
    }
    const RidLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const NRidLetters = RidLetters.length - 1;
    function genRid(n) {
        if (!n)
            n = 6;
        let rid = [];
        for (let i = 0; i < n; i++) {
            let k = Math.round(Math.random() * NRidLetters);
            rid.push(RidLetters[k]);
        }
        return rid.join('');
    }
    function getFirstDefined(...args) {
        for (const arg of args) {
            if (arg !== undefined)
                return arg;
        }
        return args[args.length - 1];
    }
    function asc(a, b) {
        if (typeof a === 'number' && typeof b === 'number')
            return a - b;
        else if ((a === null || a === void 0 ? void 0 : a.constructor.name) === Date.name && (b === null || b === void 0 ? void 0 : b.constructor.name) === Date.name)
            return a - b;
        else if (a === null || a === void 0 ? void 0 : a.localeCompare)
            return a.localeCompare(b);
        else
            return a > b ? 1 : a < b ? -1 : 0;
    }
    function desc(a, b) {
        if (typeof a === 'number' && typeof b === 'number')
            return b - a;
        else if ((a === null || a === void 0 ? void 0 : a.constructor.name) === Date.name && (b === null || b === void 0 ? void 0 : b.constructor.name) === Date.name)
            return b - a;
        else if (b === null || b === void 0 ? void 0 : b.localeCompare)
            return b.localeCompare(a);
        else
            return a < b ? 1 : a > b ? -1 : 0;
    }

    function listString(arr, delim, isAnd, _and) {
        if (arr.length == 0)
            return "";
        else if (arr.length == 1)
            return arr[0];
        else if (arr.length == 2 && isAnd)
            return `${arr[0]} ${_and || 'and'} ${arr[1]}`;
        else if (arr.length == 2 && !isAnd)
            return `${arr[0]}${delim || ' '}${arr[1]} `;
        else if (!isAnd) {
            return arr.join(delim);
        }
        else {
            let last = arr[arr.length - 1];
            let rest = arr.slice(0, arr.length - 1);
            let space_before_and = delim.endsWith(' ');
            return rest.join(delim) + delim + `${space_before_and ? '' : ' '}${(_and === null || _and === void 0 ? void 0 : _and.trim()) || 'and'} ` + last;
        }
    }
    function toOrdinalNumbers(n) {
        // upto 23
        return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth",
            "tenth", "eleventh", "twelveth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth",
            "twentieth", "twenty-first", "twenty-second", "twenty-third"][n] || n + "th";
    }
    /**
     * convert an array of objects to an dict-like object of objects
     * @param a
     * @param k
     * @param dp
     * @returns
     */
    function toHashedObject(a, k, dp) {
        let o = {};
        a.forEach((d) => {
            let key = d[k];
            if (dp) {
                o[key] = deepcopy(d);
            }
            else {
                o[key] = d;
            }
        });
        return o;
    }
    function bufferToArrayBuffer(x) {
        let arrayBuffer = new ArrayBuffer(x.length);
        let arr = new Uint8Array(arrayBuffer);
        for (let i = 0; i < x.length; ++i) {
            arr[i] = x[i];
        }
        return arrayBuffer;
    }

    function makeParamFilter(expr) {
        if (typeof expr !== 'string')
            return null;
        let base = expr.includes("datum.") ? "datum" : "d";
        if (base === "datum") {
            return Function('datum', "return (" + expr + ");");
        }
        else {
            return Function('d', "return (" + expr + ");");
        }
    }
    const tapEndBumper = 0.1;
    function makeTapPattern(tapValue, tapType, duration, pause, tappingDur, singleTappingPosition, beat) {
        // tapValue: whatever value computed out of a scale function
        // tapType: 'tapCount' or 'tapSpeed'
        // duration: for 'tapSpeed' channel, it is the total length; for 'tapCount' channel it is each tap's length,
        // pause: pause between tappings (can be rate ({rate: ...}) or length ({length: ...}))
        // tappingDur: for a `tapSpeed` channel, the tapping sound length.
        if (tapValue !== undefined && typeof tapValue === 'number' && tapType === TAPCNT_chn) {
            if (!duration && !beat)
                duration = DEF_TAPPING_DUR;
            else if (!duration && beat && beat.converter !== undefined) {
                duration = DEF_TAPPING_DUR_BEAT;
            }
            let pauseLength;
            duration = round(duration, -2);
            if ((pause === null || pause === void 0 ? void 0 : pause.length) !== undefined)
                pauseLength = pause === null || pause === void 0 ? void 0 : pause.length;
            else if ((pause === null || pause === void 0 ? void 0 : pause.rate) !== undefined)
                pauseLength = duration * (pause === null || pause === void 0 ? void 0 : pause.rate);
            else
                pauseLength = duration * DEF_TAP_PAUSE_RATE;
            pauseLength = round(pauseLength, -2);
            let pattern = [], totalLength = 0, patternString = `[${duration}, ${pauseLength}] x ${tapValue} `;
            for (let i = 0; i < tapValue; i++) {
                pattern.push(duration);
                totalLength += duration;
                if (i < tapValue - 1) {
                    totalLength += pauseLength;
                    pattern.push(pauseLength);
                }
                else {
                    totalLength += tapEndBumper;
                    pattern.push(tapEndBumper);
                }
            }
            if (beat === null || beat === void 0 ? void 0 : beat.converter)
                pattern = pattern.map(beat === null || beat === void 0 ? void 0 : beat.converter);
            return { pattern, totalLength, patternString };
        }
        else if (tapValue !== undefined
            && typeof tapValue === 'number'
            && tapType === TAPSPD_chn
            && tappingDur !== undefined) {
            if (!duration && !beat)
                duration = DEF_TAP_DUR;
            else if (!duration && beat && beat.converter !== undefined) {
                duration = DEF_TAP_DUR_BEAT;
            }
            let count = round(tapValue * duration, 0);
            let tapOnlyDur = count * tappingDur;
            let pauseLength;
            let pattern = [], totalLength = 0;
            if (count == 0) {
                pauseLength = duration;
                pattern = [0, pauseLength];
                totalLength += pauseLength;
            }
            else if (count == 1) {
                if (!singleTappingPosition || singleTappingPosition === SINGLE_TAP_MIDDLE) {
                    pauseLength = (duration - tappingDur) / 2;
                    pauseLength = round(pauseLength, -2);
                    pattern = [0, pauseLength, tappingDur, pauseLength];
                    totalLength += pauseLength + tappingDur + pauseLength;
                }
                else {
                    pauseLength = duration - tappingDur;
                    pauseLength = round(pauseLength, -2);
                    if (singleTappingPosition === SINGLE_TAP_START) {
                        pattern = [tappingDur, pauseLength];
                        totalLength += pauseLength + tappingDur;
                    }
                    else if (singleTappingPosition === SINGLE_TAP_END) {
                        pattern = [0, pauseLength, tappingDur, tapEndBumper];
                        totalLength += pauseLength + tappingDur + tapEndBumper;
                    }
                }
            }
            else {
                pauseLength = (duration - tapOnlyDur) / (count - 1);
                pauseLength = round(pauseLength, -2);
                for (let i = 0; i < count; i++) {
                    pattern.push(tappingDur);
                    totalLength += tappingDur;
                    if (i < count - 1) {
                        totalLength += pauseLength;
                        pattern.push(pauseLength);
                    }
                    else {
                        totalLength += tapEndBumper;
                        pattern.push(tapEndBumper);
                    }
                }
            }
            let patternString = `[${tappingDur}, ${pauseLength}] x ${count}`;
            if (beat === null || beat === void 0 ? void 0 : beat.converter)
                pattern = pattern.map(beat === null || beat === void 0 ? void 0 : beat.converter);
            return { pattern, totalLength, patternString };
        }
        else if (tapValue !== undefined && tapValue instanceof Object && tapType === 'both') {
            let count = round(tapValue.count, 0), speed = tapValue.speed;
            if (!duration && !beat)
                duration = DEF_TAPPING_DUR;
            else if (!duration && beat && beat.converter !== undefined) {
                duration = DEF_TAPPING_DUR_BEAT;
            }
            let tapSection = round(1 / speed, -2);
            if (!beat) {
                if (tapSection < 0.12)
                    tapSection = 0.12;
                if (duration > tapSection)
                    duration = round(tapSection * 0.85, -2);
            }
            let pauseLength = round(tapSection - duration, -2);
            let pattern = [], totalLength = 0, patternString = `[${duration}, ${pauseLength}] x ${count} `;
            for (let i = 0; i < count; i++) {
                pattern.push(duration);
                totalLength += duration;
                if (i < count - 1) {
                    totalLength += pauseLength;
                    pattern.push(pauseLength);
                }
                else {
                    totalLength += tapEndBumper;
                    pattern.push(tapEndBumper);
                }
            }
            if (beat === null || beat === void 0 ? void 0 : beat.converter)
                pattern = pattern.map(beat === null || beat === void 0 ? void 0 : beat.converter);
            return { pattern, totalLength, patternString };
        }
        else {
            return { pattern: [], totalLength: 0, patternString: `[0, 0] x 0` };
        }
    }
    function mergeTapPattern(tapCount, tapSpeed) {
        if (tapCount && tapSpeed) {
            return makeTapPattern({ count: tapCount === null || tapCount === void 0 ? void 0 : tapCount.value, speed: tapSpeed === null || tapSpeed === void 0 ? void 0 : tapSpeed.value }, 'both', tapCount.tapLength, undefined, tapSpeed.tappingUnit, tapSpeed.singleTappingPosition, tapCount.beat);
        }
        else if (tapCount) {
            return makeTapPattern(tapCount === null || tapCount === void 0 ? void 0 : tapCount.value, TAPCNT_chn, tapCount.tapLength, tapCount.pause, undefined, undefined, tapCount.beat);
        }
        else if (tapSpeed) {
            return makeTapPattern(tapSpeed === null || tapSpeed === void 0 ? void 0 : tapSpeed.value, TAPSPD_chn, tapSpeed.tapDuration, undefined, tapSpeed.tappingUnit, tapSpeed.singleTappingPosition, tapSpeed.beat);
        }
        else {
            return undefined;
        }
    }
    const noteScale = [
        {
            c: 16.35,
            cs: 17.32,
            d: 18.35,
            ds: 19.45,
            e: 20.6,
            f: 21.83,
            fs: 23.12,
            g: 24.5,
            gs: 25.96,
            a: 27.5,
            as: 29.14,
            b: 30.87
        }, {
            c: 32.7,
            cs: 34.65,
            d: 36.71,
            ds: 38.89,
            e: 41.2,
            f: 43.65,
            fs: 46.25,
            g: 49,
            gs: 51.91,
            a: 55,
            as: 58.27,
            b: 61.74,
        }, {
            c: 65.41,
            cs: 69.3,
            d: 73.42,
            ds: 77.78,
            e: 82.41,
            f: 87.31,
            fs: 92.5,
            g: 98,
            gs: 103.83,
            a: 110,
            as: 116.54,
            b: 123.47
        },
        {
            c: 130.81,
            cs: 138.59,
            d: 146.83,
            ds: 155.56,
            e: 164.81,
            f: 174.61,
            fs: 185,
            g: 196,
            gs: 207.65,
            a: 220,
            as: 233.08,
            b: 246.94,
        },
        {
            c: 261.63,
            cs: 277.18,
            d: 293.66,
            ds: 311.13,
            e: 329.63,
            f: 349.23,
            fs: 369.99,
            g: 392,
            gs: 415.3,
            a: 440,
            as: 466.16,
            b: 493.88,
        },
        {
            c: 523.25,
            cs: 554.37,
            d: 587.33,
            ds: 622.25,
            e: 659.25,
            f: 698.46,
            fs: 739.99,
            g: 783.99,
            gs: 830.61,
            a: 880,
            as: 932.33,
            b: 987.77,
        },
        {
            c: 1046.5,
            cs: 1108.73,
            d: 1174.66,
            ds: 1244.51,
            e: 1318.51,
            f: 1396.91,
            fs: 1479.98,
            g: 1567.98,
            gs: 1661.22,
            a: 1760,
            as: 1864.66,
            b: 1975.53,
        },
        {
            c: 2093,
            cs: 2217.46,
            d: 2349.32,
            ds: 2489.02,
            e: 2637.02,
            f: 2793.83,
            fs: 2959.96,
            g: 3135.96,
            gs: 3322.44,
            a: 3520.00,
            as: 3729.31,
            b: 3951.07,
        },
        {
            c: 4186.01,
            cs: 4434.92,
            d: 4698.63,
            ds: 4978.03,
            e: 5274.04,
            f: 5587.65,
            fs: 5919.91,
            g: 6271.93,
            gs: 6644.88,
            a: 7040.00,
            as: 7458.62,
            b: 7902.13,
        }
    ];
    const sharpToFlat = {
        bb: 'as',
        ab: 'gs',
        gb: 'fs',
        fb: 'e',
        eb: 'ds',
        db: 'cs',
        cb: 'b'
    };
    function noteToFreq(note) {
        var _a, _b;
        if (typeof note === 'number')
            return note;
        else if (typeof note === 'string') {
            let n = (_a = note[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase(), o = parseInt(note[1]), a = (_b = note[2]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            if (a === "#")
                a = "s";
            else if (a === "♭")
                a = "b";
            if (o > 8)
                return null;
            if (a === "b") {
                let n_a = (n + a);
                let na = sharpToFlat[n_a];
                n = na[0];
                a = na[1];
                if (na == 'b')
                    o = o - 1;
            }
            if (n + a === 'bs') {
                n = 'c';
                a = '';
            }
            else if (n + a === 'es') {
                n = 'f';
                a = '';
            }
            if (o < 0)
                return null;
            let note_key = (n + (a || ''));
            return noteScale[o][note_key];
        }
        else {
            return null;
        }
    }
    function getEndTime1(a) {
        var _a, _b, _c;
        if (a.time === 'after_previous') {
            return ((_a = a.duration) !== null && _a !== void 0 ? _a : 0);
        }
        else {
            return ((_b = a.time) !== null && _b !== void 0 ? _b : 0) + ((_c = a.duration) !== null && _c !== void 0 ? _c : 0);
        }
    }
    function getDuration1(a) {
        var _a, _b;
        return ((_a = a.duration) !== null && _a !== void 0 ? _a : 0) + ((_b = a.postReverb) !== null && _b !== void 0 ? _b : 0);
    }
    function getStartTime1(a) {
        if (typeof a.time === 'number')
            return a.time;
        else
            return 0;
    }
    const glyphSorterByEnd = (a, b) => getEndTime1(a) - getEndTime1(b);
    const glyphSorterByStart = (a, b) => getStartTime1(a) - getStartTime1(b);

    function playSystemSpeech(sound, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var synth = window.speechSynthesis;
                var utterance = new SpeechSynthesisUtterance(sound.speech);
                if ((config === null || config === void 0 ? void 0 : config.speechRate) !== undefined)
                    utterance.rate = config === null || config === void 0 ? void 0 : config.speechRate;
                else if ((sound === null || sound === void 0 ? void 0 : sound.speechRate) !== undefined)
                    utterance.rate = sound === null || sound === void 0 ? void 0 : sound.speechRate;
                synth.speak(utterance);
                utterance.onend = () => {
                    resolve(0);
                };
            });
        });
    }
    function notifyStop(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield playSystemSpeech({ speech: "Stopped.", speechRate: config === null || config === void 0 ? void 0 : config.speechRate });
            return;
        });
    }
    function notifyPause(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield playSystemSpeech({ speech: "Paused.", speechRate: config === null || config === void 0 ? void 0 : config.speechRate });
            return;
        });
    }
    function notifyResume(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield playSystemSpeech({ speech: "Resumeing", speechRate: config === null || config === void 0 ? void 0 : config.speechRate });
            return;
        });
    }

    function isJSON(d) {
        try {
            JSON.parse(d);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    const TSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*(?:\t\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t\'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*)*$/gi;
    function isTSV(d) {
        return d.match(TSV_format);
    }
    const CSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/gi;
    function isCSV(d) {
        return d.match(CSV_format);
    }
    function detectType(values) {
        if (values.every((d) => (d === null || d === void 0 ? void 0 : d.constructor.name) === "Number"))
            return QUANT;
        else
            return ORD;
    }
    function addURLtoDataObject(data, dataBaseUrl) {
        let d = deepcopy(data);
        if (dataBaseUrl && 'url' in d && d.url) {
            let n = URL.parse(d.url, dataBaseUrl);
            if (n)
                d.url = n.href;
        }
        return d;
    }

    const bin_ending = "__bin", bin_end_ending = "__bin_end", count_ending = "__count", Def_tone = "default";
    function normalizeSingleSpec(spec, parent) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (!spec)
            return { normalized: null, scaleDefinitions: null };
        let scaleDefinitions = [];
        let is_part_of_overlay = parent === OVERLAY;
        let title = spec.title, name = spec.name, id = 'stream-' + genRid(), description = spec.description, data = deepcopy(spec.data);
        let tone;
        // tone
        if (typeof spec.tone === "string") {
            tone = { type: spec.tone };
        }
        else if (spec.tone instanceof Object) {
            tone = deepcopy(spec.tone);
        }
        else {
            tone = { type: Def_tone };
        }
        // do anything if needed
        if (tone.type === undefined) {
            tone.type = Def_tone;
        }
        let filter = undefined;
        if (spec.tone && ('filter' in spec.tone) && spec.tone.filter instanceof Array) {
            filter = [...spec.tone.filter];
        }
        // encoding
        let further_transforms = [];
        let encoding_aggregates = [];
        let encoding = {};
        if (((_b = (_a = spec.encoding[TIME_chn]) === null || _a === void 0 ? void 0 : _a.scale) === null || _b === void 0 ? void 0 : _b.timing) === SIM) {
            if (spec.encoding[SPEECH_BEFORE_chn] && spec.encoding[SPEECH_AFTER_chn]) {
                console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_BEFORE_chn} and ${SPEECH_AFTER_chn} are dropped.`);
                delete spec.encoding[SPEECH_BEFORE_chn];
                delete spec.encoding[SPEECH_AFTER_chn];
            }
            else if (spec.encoding[SPEECH_BEFORE_chn]) {
                console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_BEFORE_chn} is dropped.`);
                delete spec.encoding[SPEECH_BEFORE_chn];
            }
            else if (spec.encoding[SPEECH_AFTER_chn]) {
                console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_AFTER_chn} is dropped.`);
                delete spec.encoding[SPEECH_AFTER_chn];
            }
        }
        let has_repeated_overlay = false;
        for (const channel of Object.keys(spec.encoding)) {
            let o_enc = spec.encoding[channel];
            let _field = (_c = o_enc.field) !== null && _c !== void 0 ? _c : undefined;
            let _original_field = undefined;
            let _type = (_d = o_enc.type) !== null && _d !== void 0 ? _d : undefined;
            let _by = undefined;
            if (channel !== REPEAT_chn && _field instanceof Array) {
                console.error("Only a repeat channel can have an array of fields.");
            }
            if ((o_enc.bin || o_enc.aggregate) && _field instanceof Array) {
                console.error("An aggregated/binned channel can't have an array of fields.");
            }
            if (o_enc.by) {
                if (o_enc.by instanceof Array
                    && !o_enc.by.join('X').match(/(^(sequence|sequenceX)*(overlay|overlayX)*$)/gi)) {
                    console.error("Wrong repeat-by form. Overlay cannot preceed sequence!");
                }
                if (o_enc.by instanceof Array)
                    _by = o_enc.by;
                else if (typeof o_enc.by === 'string')
                    _by = [o_enc.by];
                if (_by instanceof Array) {
                    has_repeated_overlay = _by.includes(OVERLAY);
                }
                if (has_repeated_overlay && is_part_of_overlay) {
                    console.error("Overlay composition + overlay repeat is not supported.");
                }
            }
            let _ramp = undefined;
            if (o_enc.ramp && RampMethods.includes(o_enc.ramp)) {
                if (typeof o_enc.ramp === 'string')
                    _ramp = o_enc.ramp;
                else
                    _ramp = o_enc.ramp ? RampLinear : RampAbrupt;
            }
            else {
                _ramp = 'linear';
            }
            let _speech = (_e = o_enc.speech) !== null && _e !== void 0 ? _e : undefined;
            let _value = (_f = o_enc.value) !== null && _f !== void 0 ? _f : undefined;
            let _tick = (channel === TIME_chn && o_enc.tick) ? deepcopy(o_enc.tick) : undefined;
            let _scale = o_enc.scale ? deepcopy(o_enc.scale) : {};
            let _format = (_g = o_enc.format) !== null && _g !== void 0 ? _g : undefined;
            let _formatType = (_h = o_enc.formatType) !== null && _h !== void 0 ? _h : undefined;
            let _bin, _binned;
            if (o_enc.bin) {
                if (!o_enc.field) {
                    console.error("Bin without a field name is not possible.");
                }
                if (o_enc.bin instanceof Object) {
                    further_transforms.push({
                        bin: o_enc.field,
                        step: 'step' in o_enc.bin ? o_enc.bin.step : undefined,
                        maxbins: 'maxbins' in o_enc.bin ? o_enc.bin.maxbins : undefined,
                        nice: 'nice' in o_enc.bin ? o_enc.bin.nice : undefined,
                        as: o_enc.field + bin_ending,
                        exact: 'exact' in o_enc.bin ? o_enc.bin.exact : undefined,
                        end: o_enc.field + bin_end_ending
                    });
                }
                else if (typeof o_enc.bin === "boolean") {
                    further_transforms.push({
                        bin: o_enc.field,
                        auto: true,
                        as: o_enc.field + bin_ending,
                        end: o_enc.field + bin_end_ending
                    });
                }
                _field = o_enc.field + bin_ending;
                _original_field = o_enc.field;
                _type = QUANT;
                if (channel === TIME_chn) {
                    encoding[channel + "2"] = {
                        field: o_enc.field + bin_end_ending,
                    };
                }
                if (!_scale)
                    _scale = {};
                _scale.title = o_enc.field + " (binned)";
                _binned = true;
            }
            else {
                _binned = false;
            }
            let _aggregate = undefined;
            if (o_enc.aggregate) {
                if (!o_enc.field && ZeroOPs.includes(o_enc.aggregate)) {
                    encoding_aggregates.push({
                        op: "count",
                        as: count_ending
                    });
                    _field = count_ending;
                    if (!_scale)
                        _scale = {};
                    _scale.title = "Count";
                    _type = QUANT;
                }
                else {
                    encoding_aggregates.push({
                        op: o_enc.aggregate,
                        field: o_enc.field,
                        as: o_enc.field + "__" + o_enc.aggregate,
                        p: o_enc.p
                    });
                    _field = o_enc.field + "__" + o_enc.aggregate;
                    _original_field = o_enc.field;
                    if (!_scale)
                        _scale = {};
                    _scale.title = o_enc.aggregate + " " + o_enc.field;
                    _type = o_enc.type || QUANT;
                }
                _aggregate = o_enc.aggregate;
            }
            let _condition = o_enc.condition ? deepcopy(o_enc.condition) : undefined;
            let _hasTapSpeed = undefined, _hasTapCount = undefined, _roundToNote = undefined;
            // to indicate whether tap count and speed channels are specified with each other
            // in case of which, it should be considered in computing the tap function
            if (channel === TAPCNT_chn && spec.encoding[TAPSPD_chn]) {
                _hasTapSpeed = true;
            }
            else if (channel === TAPCNT_chn && !spec.encoding[TAPSPD_chn]) {
                _hasTapSpeed = false;
            }
            if (channel === TAPSPD_chn && spec.encoding[TAPCNT_chn]) {
                _hasTapCount = true;
            }
            else if (channel === TAPSPD_chn && !spec.encoding[TAPCNT_chn]) {
                _hasTapCount = false;
            }
            if (channel === PITCH_chn && o_enc.roundToNote) {
                _roundToNote = true;
            }
            else if (channel === PITCH_chn && !o_enc.roundToNote) {
                _roundToNote = false;
            }
            // add to a scale 
            let scaleId = 'scale-' + genRid();
            let scaleDef = {
                id: scaleId,
                channel,
                type: _type,
                dataName: data.name,
                field: _field ? (_field instanceof Array ? _field : [_field]) : [],
                scale: deepcopy(_scale),
                streamID: [id],
                parentType: parent,
                condition: _condition,
                sort: o_enc.sort,
                timeUnit: o_enc.timeUnit
            };
            if (_roundToNote) {
                scaleDef.roundToNote = true;
            }
            _scale.id = scaleId;
            scaleDefinitions.push(scaleDef);
            encoding[channel] = {
                field: _field,
                original_field: _original_field,
                type: _type,
                ramp: _ramp,
                aggregate: _aggregate,
                bin: _bin,
                binned: _binned,
                condition: _condition,
                value: _value,
                scale: _scale,
                format: _format,
                formatType: _formatType,
                speech: _speech,
                tick: _tick,
                roundToNote: _roundToNote,
                hasTapSpeed: _hasTapSpeed,
                hasTapCount: _hasTapCount,
                by: _by,
                sort: o_enc.sort,
                timeUnit: o_enc.timeUnit,
                timeUnitName: o_enc.timeUnitName,
                timeLevel: o_enc.timeLevel
            };
        }
        // if time2 channel is defined, set the scale for it
        if (encoding[TIME2_chn]) {
            encoding[TIME2_chn].scale = { id: (_k = (_j = encoding[TIME_chn]) === null || _j === void 0 ? void 0 : _j.scale) === null || _k === void 0 ? void 0 : _k.id };
            scaleDefinitions.forEach((d) => {
                var _a, _b;
                if (d.channel === TIME_chn && d.id === ((_b = (_a = encoding[TIME_chn]) === null || _a === void 0 ? void 0 : _a.scale) === null || _b === void 0 ? void 0 : _b.id)) {
                    if (!d.hasTime2)
                        d.hasTime2 = [];
                    d.hasTime2.push(id);
                }
            });
        }
        // mark repeat channel in the scale definition
        if (encoding[REPEAT_chn]) {
            scaleDefinitions.forEach((d) => {
                if (!d.isRepeated)
                    d.isRepeated = [];
                d.isRepeated.push(id);
            });
        }
        // makr used channels
        let used_channels = Object.keys(encoding);
        // warn: overlay + repeat => no...
        if (has_repeated_overlay || is_part_of_overlay) {
            if (used_channels.includes(SPEECH_AFTER_chn) || used_channels.includes(SPEECH_BEFORE_chn)) {
                console.warn("Using speechAfter/Before channels for an overlaid stream is not recommended.");
            }
        }
        // transform
        let common_transform = undefined, transform = undefined;
        if (spec.common_transform) {
            common_transform = deepcopy(spec.common_transform);
        }
        if (spec.transform) {
            transform = deepcopy(spec.transform);
        }
        if (further_transforms.length > 0) {
            if (transform == undefined)
                transform = [];
            transform.push(...further_transforms);
        }
        if (encoding_aggregates.length > 0) {
            if (!transform)
                transform = [];
            transform.push({ aggregate: encoding_aggregates, groupby: Auto });
        }
        // [todo]  <- future support
        /** if (transform !== undefined && (transform?.length ?? 0) > 0) {
              transform.forEach((t) => {
                if ((t.boxplot || t.quantile) && !t.groupby) t.groupby = Auto;
              });
            } */
        // config
        let config = undefined;
        if (spec.config) {
            config = {};
            Object.assign(config, spec.config);
            config = config;
        }
        let normalized = {
            title,
            name,
            id,
            description,
            data,
            tone,
            filter,
            encoding,
            config,
            common_transform,
            transform
        };
        return { normalized, scaleDefinitions };
    }

    function isRepeatedStream(spec) {
        var _a;
        if (spec && ('encoding' in spec) && ((_a = spec.encoding) === null || _a === void 0 ? void 0 : _a.repeat)) {
            return true;
        }
        return false;
    }
    function isSingleStream(spec) {
        if (spec && 'encoding' in spec && 'tone' in spec && !(OVERLAY in spec) && !(SEQUENCE in spec)) {
            return true;
        }
        return false;
    }
    function isOverlayStream(spec) {
        if (spec && !('encoding' in spec) && !('tone' in spec) && (OVERLAY in spec) && !(SEQUENCE in spec)) {
            return true;
        }
        return false;
    }
    function isSequenceStream(spec) {
        if (spec && !('encoding' in spec) && !('tone' in spec) && !(OVERLAY in spec) && (SEQUENCE in spec)) {
            return true;
        }
        return false;
    }

    const Globals = {
        ErieGlobalControl: undefined,
        ErieGlobalState: undefined,
        ErieGlobalPlayerEvents: new Map(),
        ErieSampleBaseUrl: 'audio_sample/'
    };
    function setSampleBaseUrl(url) {
        if (isBrowserWindowPossible()) {
            window.ErieSampleBaseUrl = url;
        }
        else {
            Globals.ErieSampleBaseUrl = url;
        }
    }
    function getSampleBaseUrl(url) {
        if (isBrowserWindowPossible()) {
            return window.ErieSampleBaseUrl;
        }
        else {
            return Globals.ErieSampleBaseUrl;
        }
    }

    function normalizeSpecification(_spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _p, _q;
            let spec = deepcopy(_spec);
            // treat options
            let dataBaseUrl = options === null || options === void 0 ? void 0 : options.dataBaseUrl;
            let sampleBaseUrl = options === null || options === void 0 ? void 0 : options.sampleBaseUrl;
            if (sampleBaseUrl) {
                setSampleBaseUrl(sampleBaseUrl);
            }
            let streams = [], datasets = 'datasets' in spec ? deepcopy(spec.datasets || []) : [], synths = deepcopy(spec.synth || []), samplings = deepcopy(spec.sampling || []), tickDefs = deepcopy(spec.tick || []), waves = deepcopy(spec.wave || []), scales = [], config = undefined;
            let used_encodings = [];
            let _partial_datasets = {}, _partial_ticks = {};
            if (isSingleStream(spec)) {
                if ('data' in spec && spec.data) {
                    // moving to datasets
                    if (!('name' in spec.data)) {
                        let new_data_name = "data__" + (datasets.length + 1);
                        datasets.push(Object.assign({ name: new_data_name }, addURLtoDataObject(spec.data, dataBaseUrl)));
                        spec.data = { name: new_data_name };
                    }
                }
                let { normalized, scaleDefinitions } = normalizeSingleSpec(spec, null);
                if (normalized !== null && scaleDefinitions !== null) {
                    streams.push({ stream: normalized });
                    scales.push(...scaleDefinitions);
                    used_encodings.push(...Object.keys(normalized.encoding));
                }
            }
            else {
                let new_data_name = null;
                if ('data' in spec && spec.data
                    && (!('name' in spec.data) || !spec.data.name)
                    && (!('type' in spec.data) || spec.data.type !== "unset")
                    && 'values' in spec.data && spec.data.values) {
                    new_data_name = "data__" + (datasets.length + 1);
                    datasets.push(Object.assign({ name: new_data_name }, addURLtoDataObject(spec.data, dataBaseUrl)));
                }
                if (isOverlayStream(spec) && 'overlay' in spec) {
                    let overlay = [];
                    // sort out the dataset in use
                    let toplevel_data = null, toplevel_data_name = null;
                    // if the spec has a single dataset with values
                    if ('data' in spec && spec.data
                        && (!('name' in spec.data) || !spec.data.name)
                        && (!('type' in spec.data) || spec.data.type !== "unset")) {
                        // assign dataset name 
                        toplevel_data_name = `data__${(((_a = datasets.length) !== null && _a !== void 0 ? _a : 0) + 1)}`;
                        // then pass it as a dataset;
                        toplevel_data = { name: toplevel_data_name };
                        datasets.push(Object.assign({ name: toplevel_data_name }, addURLtoDataObject(spec.data, dataBaseUrl)));
                    }
                    // or if the spec's data has a name
                    else if ('data' in spec && spec.data
                        && ('name' in spec.data && spec.data.name)) {
                        toplevel_data = addURLtoDataObject(spec.data, dataBaseUrl);
                        if (!('dataset' in spec) || !spec.dataset) {
                            console.warn("Dataset name can't be used with a specified dataset");
                        }
                    }
                    for (const _o of spec.overlay) {
                        // eligibility check
                        if (!isSingleStream(_o))
                            console.error("An overlay of multi-stream sequences is not supported!");
                        // deep-copy to not interrupt the original spec.
                        let o = deepcopy(_o);
                        // when the current unit stream of the overlay doesn't dataset
                        // then pass the top-level dataset by its name
                        if (toplevel_data && !o.data) {
                            // if top-level data is on its own (not set as reference name)
                            if (toplevel_data_name) {
                                o.data = { name: toplevel_data_name };
                            }
                            // if top-level data is specified as name
                            else if (!o.data) {
                                o.data = toplevel_data;
                            }
                        }
                        // when the current unit stream has a data object specified
                        else if (o.data) {
                            // if the specified data doesn't have the name
                            // then assign it to the top-level datasets and refer it by name
                            if (!('name' in o.data) || !o.data.name) {
                                let dname = `data__${(datasets.length + 1)}`;
                                datasets.push(Object.assign({ name: dname }, o.data));
                                o.data = { name: dname };
                            }
                        }
                        // if data is not specified, there's toplevel data available, use it
                        if (!o.data && new_data_name)
                            o.data = { name: new_data_name };
                        // transform
                        o.common_transform = deepcopy(spec.transform || []);
                        o.transform = deepcopy(_o.transform || []);
                        // *** Tick ***
                        // when its time encoding has a tick element
                        // making it refer to the corresponding top-level tick object
                        if (((_c = (_b = o.encoding) === null || _b === void 0 ? void 0 : _b.time) === null || _c === void 0 ? void 0 : _c.tick) !== undefined) {
                            // when it is not specified as name
                            // or it is not referring to a top-level tick object
                            if (!((_d = o.encoding) === null || _d === void 0 ? void 0 : _d.time.tick.name)
                                || !tickDefs.filter((d) => { var _a, _b, _c; return d.name === ((_c = (_b = (_a = o.encoding) === null || _a === void 0 ? void 0 : _a.time) === null || _b === void 0 ? void 0 : _b.tick) === null || _c === void 0 ? void 0 : _c.name); })) {
                                // define a new tick object in the top level
                                let new_tick_name = ((_e = o.encoding) === null || _e === void 0 ? void 0 : _e.time.tick.name) || ("tick_" + (tickDefs.length + 1));
                                tickDefs.push(Object.assign(Object.assign({}, (_f = o.encoding) === null || _f === void 0 ? void 0 : _f.time.tick), { name: new_tick_name }));
                                // then replace it by the name
                                o.encoding.time.tick = { name: new_tick_name };
                            }
                        }
                        // normalize a unit overlay stream
                        let n = normalizeSingleSpec(o, OVERLAY);
                        // once done w/o errors
                        if (n.normalized !== null && n.scaleDefinitions !== null) {
                            // update used encodings
                            used_encodings.push(...Object.keys(n.normalized.encoding));
                            // push normalized specs to normalized overaly streams
                            overlay.push(n.normalized);
                            // push scale definitions to the total set
                            scales.push(...n.scaleDefinitions);
                        }
                    }
                    // copy the upper level configurations
                    let config = {};
                    if ('config' in spec.overlay) {
                        Object.assign(config, spec.overlay.config);
                    }
                    Object.assign(config, spec.config);
                    // normalize scales
                    normalizeScaleConsistency(config, unique(used_encodings));
                    // to not cause confusion
                    delete config.sequenceScaleConsistency;
                    delete config.forceSequenceScaleConsistency;
                    // finally pass to the 
                    streams.push({ overlay, name: spec.name, title: spec.title, description: spec.description, config });
                }
                else if (isSequenceStream(spec) && 'sequence' in spec) {
                    let output = [];
                    let introSeq = {};
                    config = {};
                    Object.assign(config, spec.config);
                    // make intro stream
                    if (spec.title)
                        introSeq.title = spec.title;
                    if (spec.description)
                        introSeq.description = spec.description;
                    if (Object.keys(introSeq).length > 0) {
                        output.push({ intro: introSeq });
                    }
                    for (const _o of spec.sequence) {
                        // eligibility check
                        if (isSequenceStream(_o))
                            console.error("A sequence of sequence is not supported!");
                        // deep-copy to not interrupt the original spec
                        let o = deepcopy(_o);
                        // if the current sub-stream is a single stream
                        if (isSingleStream(o)) {
                            // *** Tick ***
                            // if the time channel has tick -> move it to the top level tick def.
                            if ((_h = (_g = o.encoding) === null || _g === void 0 ? void 0 : _g.time) === null || _h === void 0 ? void 0 : _h.tick) {
                                if (!((_k = (_j = o.encoding) === null || _j === void 0 ? void 0 : _j.time) === null || _k === void 0 ? void 0 : _k.tick.name)
                                    || !tickDefs.filter((d) => { var _a, _b, _c; return d.name === ((_c = (_b = (_a = o.encoding) === null || _a === void 0 ? void 0 : _a.time) === null || _b === void 0 ? void 0 : _b.tick) === null || _c === void 0 ? void 0 : _c.name); })) {
                                    let new_tick_name = ((_l = o.encoding) === null || _l === void 0 ? void 0 : _l.time.tick.name) || ("tick_" + (tickDefs.length + 1));
                                    tickDefs.push(Object.assign(Object.assign({}, (_m = o.encoding) === null || _m === void 0 ? void 0 : _m.time.tick), { name: new_tick_name }));
                                    o.encoding.time.tick = { name: new_tick_name };
                                }
                            }
                            // if it has no data set, then assign the top level data
                            if (!o.data && new_data_name)
                                o.data = { name: new_data_name };
                            // or if it has raw data defined
                            else if ('values' in o.data && ((_p = o.data) === null || _p === void 0 ? void 0 : _p.values)) {
                                let new_data_name_2 = "data__" + (datasets.length + 1);
                                datasets.push({
                                    name: new_data_name_2,
                                    values: deepcopy(o.data.values)
                                });
                                o.data = { name: new_data_name_2 };
                            }
                            o.common_transform = deepcopy(spec.transform || []);
                            o.transform = deepcopy(_o.transform || []);
                            // normalize
                            let n = normalizeSingleSpec(o, SEQUENCE);
                            // if okay, update to the full spec
                            if (n.normalized !== null && n.scaleDefinitions !== null) {
                                scales.push(...n.scaleDefinitions);
                                output.push({ stream: n.normalized });
                                used_encodings.push(...Object.keys(n.normalized.encoding));
                            }
                        }
                        // if the current sub-stream is an overlay spec
                        else if (isOverlayStream(o)) {
                            let overlay_id = 'overlay-' + genRid();
                            // run a recursion
                            let n = yield normalizeSpecification(o, options);
                            // as it should generate only a single overlay stream
                            let over = n.normalized[0];
                            // if well-parsed
                            if ('overlay' in over) {
                                // reassign id
                                over.id = overlay_id;
                                output.push(over);
                                // update scales
                                n.scaleDefinitions.forEach((d) => {
                                    d.parentId = overlay_id;
                                });
                                scales.push(...n.scaleDefinitions);
                                (_q = over.overlay) === null || _q === void 0 ? void 0 : _q.forEach((ov) => {
                                    used_encodings.push(...Object.keys(ov.encoding));
                                });
                                // update the datasets and ticks just in case
                                Object.assign(_partial_datasets, n.datasets);
                                Object.assign(_partial_ticks, n.tick);
                            }
                        }
                    }
                    normalizeScaleConsistency(config, unique(used_encodings));
                    delete config.overlayScaleConsistency;
                    delete config.forceOverlayScaleConsistency;
                    streams.push(...output.map((d) => {
                        if ('intro' in d) {
                            return { intro: d.intro };
                        }
                        else if ('overlay' in d) {
                            return {
                                overlay: d.overlay,
                                id: d.id,
                                name: d.name,
                                title: d.title,
                                description: d.description,
                                config: d.config
                            };
                        }
                        else if ('stream' in d) {
                            return { stream: d.stream };
                        }
                    }).filter(d => d !== undefined));
                }
            }
            let dataset_hash = toHashedObject(datasets, 'name', true);
            Object.assign(dataset_hash, _partial_datasets);
            let tick_hash = toHashedObject(tickDefs, 'name', true);
            Object.assign(tick_hash, _partial_ticks);
            if (!config) {
                config = {};
                Object.assign(config, spec.config);
                normalizeScaleConsistency(config, unique(used_encodings));
                delete config.overlayScaleConsistency;
                delete config.forceOverlayScaleConsistency;
            }
            return {
                normalized: streams,
                datasets: dataset_hash,
                tick: tick_hash,
                scaleDefinitions: scales,
                sequenceConfig: config,
                synths,
                samplings,
                waves
            };
        });
    }

    const OmitDesc = ['time2'];
    class UnitStream {
        constructor(instrument_type, stream, scales, opt) {
            this.instrument_type = instrument_type;
            this.stream = stream;
            this.option = opt || {};
            this.scales = scales;
            this.config = {};
            this.name;
            this.ramp = {};
        }
        setTitle(t) {
            this.title = t;
        }
        setDescription(d) {
            this.description = d;
        }
        setName(name) {
            this.name = name;
        }
        setConfig(key, value) {
            this.config[key] = value;
        }
        setFilters(audioFilters) {
            this.audioFilters = audioFilters;
        }
        setRamp(ramp) {
            this.ramp = deepcopy(ramp);
        }
        make_tone_text(i) {
            var _a, _b;
            let text = [];
            let identifier = (i !== undefined ? `The ${toOrdinalNumbers(i + 1)}` : `This`);
            if (this.name)
                text.push({ type: TextType, speech: `${identifier} stream is for ${this.name} layer and has a tone of`, speechRate: (_a = this.config) === null || _a === void 0 ? void 0 : _a.speechRate });
            else
                text.push({ type: TextType, speech: `${identifier} stream has a tone of`, speechRate: (_b = this.config) === null || _b === void 0 ? void 0 : _b.speechRate });
            text.push({ type: ToneType, sound: { pitch: DefaultFrequency, duration: 0.2, start: 0 }, instrument_type: this.instrument_type });
            return text;
        }
        make_scale_text(channel) {
            let scales = this.scales;
            let text = Object.keys(scales)
                .filter((chn) => ((!channel && !OmitDesc.includes(chn)) || chn === channel))
                .map((c) => {
                var _a, _b;
                return {
                    id: (_a = scales[c]) === null || _a === void 0 ? void 0 : _a.scaleId,
                    channel: c,
                    description: (_b = scales[c]) === null || _b === void 0 ? void 0 : _b.description
                };
            });
            return text.flat();
        }
        prerender() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                return {
                    instrument_type: this.instrument_type,
                    sounds: this.stream,
                    continued: (_a = this.option) === null || _a === void 0 ? void 0 : _a.is_continued,
                    relative: (_b = this.option) === null || _b === void 0 ? void 0 : _b.relative,
                    filters: this.audioFilters,
                    ramp: this.ramp,
                    duration: this.duration
                };
            });
        }
    }
    function isUnitStreamObject(o) {
        var _a;
        return ((_a = o === null || o === void 0 ? void 0 : o.constructor) === null || _a === void 0 ? void 0 : _a.name) === UnitStream.name;
    }

    // event-related
    function sendToneStartEvent(detail) {
        if (isBrowserEventPossible()) {
            let playEvent = new CustomEvent("erieOnPlayTone", { detail });
            document.body.dispatchEvent(playEvent);
            let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'tone-started' } });
            document.body.dispatchEvent(chnageEvent);
        }
    }
    function sendToneFinishEvent(detail) {
        if (isBrowserEventPossible()) {
            let playEvent = new CustomEvent("erieOnFinishTone", { detail });
            document.body.dispatchEvent(playEvent);
            let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'tone-finished' } });
            document.body.dispatchEvent(chnageEvent);
        }
    }
    function sendSpeechStartEvent(detail) {
        if (isBrowserEventPossible()) {
            let playEvent = new CustomEvent("erieOnPlaySpeech", { detail });
            document.body.dispatchEvent(playEvent);
            let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'speech-started' } });
            document.body.dispatchEvent(chnageEvent);
        }
    }
    function sendSpeechFinishEvent(detail) {
        if (isBrowserEventPossible()) {
            let playEvent = new CustomEvent("erieOnFinishSpeech", { detail });
            document.body.dispatchEvent(playEvent);
            let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'speech-finished' } });
            document.body.dispatchEvent(chnageEvent);
        }
    }
    function sendQueueStartEvent(detail) {
        if (isBrowserEventPossible()) {
            let playEvent = new CustomEvent("erieOnPlayQueue", { detail });
            document.body.dispatchEvent(playEvent);
            let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'started' } });
            document.body.dispatchEvent(chnageEvent);
        }
    }
    function sendQueueFinishEvent(detail) {
        if (isBrowserEventPossible()) {
            let playEvent = new CustomEvent("erieOnFinishQueue", { detail });
            document.body.dispatchEvent(playEvent);
            let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'finished' } });
            document.body.dispatchEvent(chnageEvent);
        }
    }

    function roundToNote(freq, scales) {
        let min_diff = 5000, min_diff_note;
        for (const noteName of noteScaleOrder) {
            let diff = Math.abs(scales[noteName] - freq);
            if (diff < min_diff) {
                min_diff = diff;
                min_diff_note = noteName;
            }
        }
        return {
            note_name: min_diff_note,
            prev_note: noteScaleOrder[noteScaleOrder.indexOf(min_diff_note) - 1],
            next_note: noteScaleOrder[noteScaleOrder.indexOf(min_diff_note) + 1],
            note_freq: scales[min_diff_note],
            detune: detuneAmmount[min_diff_note]
        };
    }
    function roundToNoteScale(freq) {
        var _a;
        let octave;
        for (const range of noteFreqRange) {
            if (range.octave == 0 && range.c <= freq && freq < range.fs) {
                octave = range;
            }
            else if (range.octave == 7 && range.gf <= freq && freq <= range.fs) {
                octave = range;
            }
            else if (range.gf <= freq && freq < range.fs) {
                octave = range;
            }
        }
        if (octave !== undefined) {
            return (_a = roundToNote(freq, octave)) === null || _a === void 0 ? void 0 : _a.note_freq;
        }
        else {
            console.warn('Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.');
            return null;
        }
    }
    function determineNoteRange(freq, config) {
        var _a, _b;
        let octave;
        for (const range of noteFreqRange) {
            if (range.octave == 0 && range.c <= freq && freq < range.fs) {
                octave = range;
            }
            else if (range.octave == 7 && range.gf <= freq && freq <= range.fs) {
                octave = range;
            }
            else if (range.gf <= freq && freq < range.fs) {
                octave = range;
            }
        }
        if (octave !== undefined) {
            let rounded_note = roundToNote(freq, octave);
            if (config === null || config === void 0 ? void 0 : config.round) {
                return {
                    octave: octave.octave,
                    original_freq: freq,
                    freq: rounded_note.note_freq,
                    note: rounded_note.note_name,
                    detune: rounded_note.detune
                };
            }
            else {
                let detune_base = rounded_note.detune;
                let note_diff = rounded_note.note_freq - freq;
                let detune = 0;
                if (note_diff < 0) {
                    let note_left = octave[rounded_note.prev_note];
                    if (!rounded_note.prev_note) {
                        note_left = (_a = noteFreqRange[octave.octave - 1]) === null || _a === void 0 ? void 0 : _a.f;
                    }
                    detune =
                        Math.round(-100 * Math.abs(note_diff / (note_left - rounded_note.note_freq))) +
                            detune_base;
                    if (!note_left) {
                        detune = detune_base;
                    }
                }
                else if (note_diff > 0) {
                    let note_right = octave[rounded_note.next_note];
                    if (!rounded_note.next_note) {
                        note_right = (_b = noteFreqRange[octave.octave + 1]) === null || _b === void 0 ? void 0 : _b.g;
                    }
                    detune =
                        Math.round(100 * Math.abs(note_diff / (note_right - rounded_note.note_freq))) +
                            detune_base;
                    if (!note_right) {
                        detune = detune_base;
                    }
                }
                else {
                    detune = detune_base;
                }
                return { octave: octave.octave, freq, detune };
            }
        }
        else {
            console.warn('Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.');
            return null;
        }
    }
    function loadSamples(ctx, instrument_name, smaplingDef, baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let samples;
            if (MultiNoteInstruments.includes(instrument_name)) {
                samples = { multiNote: true };
                for (const octave of noteFreqRange) {
                    let sampleRes = yield fetch(`${baseUrl || ''}audio_sample/${instrument_name}_c${octave.octave}.mp3`);
                    let sampleBuffer = yield sampleRes.arrayBuffer();
                    let source = yield ctx.decodeAudioData(sampleBuffer);
                    samples[`C${octave.octave}`] = source;
                }
            }
            else if (SingleNoteInstruments.includes(instrument_name)) {
                samples = yield makeSingleScaleSamplingNode(ctx, `${baseUrl || ''}audio_sample/${instrument_name}.mp3`);
            }
            else if (smaplingDef[instrument_name]) {
                if ((_a = smaplingDef[instrument_name].sample) === null || _a === void 0 ? void 0 : _a.mono) {
                    // single
                    try {
                        samples = yield makeSingleScaleSamplingNode(ctx, smaplingDef[instrument_name].sample.mono);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                else {
                    // multi
                    try {
                        samples = yield makeMultiScaleSamplingNode(ctx, smaplingDef[instrument_name].sample);
                        samples.multiNote = true;
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            else {
                console.warn(`The instrument "${instrument_name}" is not supported or sampled.`);
            }
            return samples;
        });
    }
    function makeMultiScaleSamplingNode(ctx, def) {
        return __awaiter(this, void 0, void 0, function* () {
            let samples = { multiNote: true }, keys = Object.keys(def);
            if (!keys.every(scaleKeyCheck$1)) {
                console.error("A sampling note must be 'C' in octave 0 to 7");
            }
            for (const key of keys) {
                if (def[key]) {
                    let sampleRes = yield fetch(def[key]);
                    let sampleBuffer = yield sampleRes.arrayBuffer();
                    let source = yield ctx.decodeAudioData(sampleBuffer);
                    samples[key] = source;
                }
            }
            return samples;
        });
    }
    function makeSingleScaleSamplingNode(ctx, def) {
        return __awaiter(this, void 0, void 0, function* () {
            let sampleRes = yield fetch(def);
            let sampleBuffer = yield sampleRes.arrayBuffer();
            let source = yield ctx.decodeAudioData(sampleBuffer);
            return {
                mono: source,
                multiNote: false
            };
        });
    }
    function scaleKeyCheck$1(key) {
        return key.match(/^[C][0-7]$/);
    }

    function makeSynth(ctx, definition) {
        let synth = new ErieSynth(ctx, definition.type || FM);
        synth.generate(definition);
        return synth;
    }
    class ErieSynth {
        constructor(ctx, type) {
            this.ctx = ctx;
            this.frequency = new ErieSynthFrequency(this);
            this.onended;
            this.type = type;
        }
        generate(definition) {
            if (this.type === FM) {
                this.generateFM(definition);
            }
            else if (this.type === AM) {
                this.generateAM(definition);
            }
        }
        generateFM(definition) {
            this.initDef = definition;
            // carrier
            this.carrier = this.ctx.createOscillator();
            this.carrierPitch = definition.carrierPitch !== undefined ? definition.carrierPitch : DefCarrierPitch;
            this.carrier.frequency.value = this.carrierPitch;
            this.carrier.type = definition.carrierType || 'sine';
            this.carrierType = definition.carrierType || 'sine';
            if (definition.carrierDetune) {
                this.carrierDetune = definition.carrierDetune;
                this.carrier.detune.value = definition.carrierDetune;
            }
            // modulator
            this.modulator = this.ctx.createOscillator();
            this.modulator.type = definition.modulatorType || 'sine';
            this.modulatorType = definition.modulatorType || 'sine';
            // modulator gain
            this.modulatorGain = this.ctx.createGain();
            this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGainFM;
            this.modulatorGain.gain.value = this.modulatorVolume;
            // modulator pitch > modulation index > harmonicity > carrier's pitch > default pitch
            if (definition.modulatorPitch !== undefined) {
                this.modulatorPitch = definition.modulatorPitch;
            }
            else if (definition.modulation !== undefined) {
                this.modulation = definition.modulation;
                this.modulatorPitch = this.modulatorVolume / this.modulation;
            }
            else if (definition.harmonicity !== undefined) {
                this.modulatorPitch = definition.harmonicity * this.carrierPitch;
            }
            else if (this.carrierPitch !== undefined) {
                this.modulatorPitch = this.carrierPitch;
            }
            else {
                this.modulatorPitch = DefModPitch;
            }
            this.modulator.frequency.value = this.modulatorPitch;
            // envelope
            this.envelope = this.ctx.createGain();
            this.attackTime = definition.attackTime || 0.1;
            this.releaseTime = definition.releaseTime || 0.1;
            this.sustain = definition.sustain || 0.8;
            this.decayTime = definition.decayTime || 0.2;
            // Connect the nodes
            this.modulator.connect(this.modulatorGain);
            this.modulatorGain.connect(this.carrier.frequency);
            this.carrier.connect(this.envelope);
        }
        generateAM(definition) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            this.initDef = definition;
            // carrier
            this.carrier = this.ctx.createOscillator();
            this.carrierPitch = definition.carrierPitch !== undefined ? definition.carrierPitch : DefCarrierPitch;
            this.carrier.frequency.value = this.carrierPitch;
            this.carrier.type = definition.carrierType || 'sine';
            this.carrierType = definition.carrierType || 'sine';
            if (definition.carrierDetune) {
                this.carrierDetune = definition.carrierDetune;
                this.carrier.detune.value = definition.carrierDetune;
            }
            this.carrierVolume = (_a = definition.carrierVolume) !== null && _a !== void 0 ? _a : 1;
            // modulator
            this.modulator = this.ctx.createOscillator();
            this.modulator.type = (_b = definition.modulatorType) !== null && _b !== void 0 ? _b : 'sine';
            this.modulatorType = (_c = definition.modulatorType) !== null && _c !== void 0 ? _c : 'sine';
            // modulator gain
            this.modulatorGain = this.ctx.createGain();
            if (definition.modulation !== undefined) {
                this.modulation = definition.modulation;
                this.modulatorVolume = ((_d = this.carrierVolume) !== null && _d !== void 0 ? _d : 1) * this.modulation;
            }
            else {
                this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGainAM;
            }
            this.modulatorGain.gain.value = this.modulatorVolume;
            // modulator pitch 
            if (definition.modulatorPitch !== undefined) {
                this.modulatorPitch = definition.modulatorPitch;
            }
            else if (definition.harmonicity !== undefined) {
                this.modulatorPitch = definition.harmonicity * this.carrierPitch;
            }
            else if (this.carrierPitch !== undefined) {
                this.modulatorPitch = this.carrierPitch;
            }
            else {
                this.modulatorPitch = DefModPitch;
            }
            this.modulator.frequency.value = this.modulatorPitch;
            // envelope
            this.envelope = this.ctx.createGain();
            this.attackTime = (_e = definition.attackTime) !== null && _e !== void 0 ? _e : 0.1;
            this.releaseTime = (_f = definition.releaseTime) !== null && _f !== void 0 ? _f : 0.05;
            this.sustain = (_g = definition.sustain) !== null && _g !== void 0 ? _g : 0.8;
            this.decayTime = (_h = definition.decayTime) !== null && _h !== void 0 ? _h : 0.1;
            // Connect the nodes
            this.modulator.connect(this.modulatorGain.gain);
            this.carrier.connect(this.modulatorGain);
            this.modulatorGain.connect(this.envelope);
        }
        connect(node) {
            this.envelope.connect(node);
        }
        start(time) {
            this.carrier.start(time);
            this.modulator.start(time);
        }
        stop(time) {
            this.carrier.onended = this.onended;
            this.carrier.stop(time + this.attackTime + this.releaseTime);
            this.modulator.stop(time + this.attackTime + this.releaseTime);
        }
        get adTime() {
            var _a, _b;
            return ((_a = this.attackTime) !== null && _a !== void 0 ? _a : 0) + ((_b = this.decayTime) !== null && _b !== void 0 ? _b : 0);
        }
    }
    class ErieSynthFrequency {
        constructor(synther) {
            this.value = DefModPitch;
            this.automationRate = 'a-rate';
            this.maxValue = 22050;
            this.minValue = -22055;
            this.synther = synther;
        }
        setValueAtTime(value, time) {
            this.synther.carrier.frequency.setValueAtTime(value, time);
        }
        setTargetAtTime(value, time, timeConstant) {
            this.synther.carrier.frequency.setTargetAtTime(value, time, timeConstant);
        }
        linearRampToValueAtTime(value, endTime) {
            this.synther.carrier.frequency.linearRampToValueAtTime(value, endTime);
        }
        exponentialRampToValueAtTime(value, endTime) {
            this.synther.carrier.frequency.exponentialRampToValueAtTime(value, endTime);
        }
        setValueCurveAtTime(values, startTime, duration) {
            this.synther.carrier.frequency.setValueCurveAtTime(values, startTime, duration);
        }
    }
    // inspired by https://github.com/Tonejs/Tone.js/blob/dev/Tone/signal/AudioToGain.ts#L10
    const AMMppaer = (amount) => (amount + 1) / 2;

    const WhiteNoise = 'whiteNoise', PinkNoise = 'pinkNoise', BrownNoise = 'brownNoise';
    const NoiseTypes = [WhiteNoise, PinkNoise, BrownNoise];
    // inspired by : https://noisehack.com/generate-noise-web-audio-api/ (but it's not using audioscriptprocess, which is deprecated)
    // and https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
    function makeNoiseNode(ctx, type, duration) {
        // here, duration is the noise node's duration, for continuous tone it's the entire length;
        const bufferSize = ctx.sampleRate * duration;
        // Create an empty buffer
        const noiseBuffer = new AudioBuffer({
            length: bufferSize,
            sampleRate: ctx.sampleRate,
            numberOfChannels: 2
        });
        // Fill the buffer with noise
        const data0 = noiseBuffer.getChannelData(0);
        const data1 = noiseBuffer.getChannelData(0);
        // for pink
        let coeffs = { p0: 0.0, p1: 0.0, p2: 0.0, p3: 0.0, p4: 0.0, p5: 0.0, p6: 0.0, o: 0 };
        for (let i = 0; i < bufferSize; i++) {
            if (type === PinkNoise) {
                PinkNoiseFunction(coeffs);
                data0[i] = coeffs.o;
            }
            else if (type === BrownNoise) {
                BrownNoiseFunction(coeffs);
                data0[i] = coeffs.o;
            }
            else {
                data0[i] = WhiteNoiseFunction();
            }
            data1[i] = data0[i];
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        return noise;
    }
    function WhiteNoiseFunction() {
        return Math.random() * 2 - 1;
    }
    function PinkNoiseFunction(c) {
        let w = WhiteNoiseFunction();
        c.p0 = 0.99886 * c.p0 + w * 0.0555179;
        c.p1 = 0.99332 * c.p1 + w * 0.0750759;
        c.p2 = 0.96900 * c.p2 + w * 0.1538520;
        c.p3 = 0.86650 * c.p3 + w * 0.3104856;
        c.p4 = 0.55000 * c.p4 + w * 0.5329522;
        c.p5 = -0.7616 * c.p5 - w * 0.0168980;
        c.o = c.p0 + c.p1 + c.p2 + c.p3 + c.p4 + c.p5 + c.p6 + w * 0.5362;
        c.o *= 0.11;
        c.p6 = w * 0.115926; // gain compensation
    }
    function BrownNoiseFunction(c) {
        let w = WhiteNoiseFunction();
        c.o = (c.p0 + (0.02 * w)) / 1.02;
        c.p0 = c.o;
        c.o *= 3.5; // gain compensation
    }

    function makeContext() {
        return new AudioContext();
    }
    function makeOfflineContext(length) {
        return new OfflineAudioContext(BufferChannels$1, SampleRate$1 * length, SampleRate$1);
    }
    function makeInstrument(ctx, iType, instSamples, synthDefs, waveDefs, sound, contEndTime) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (iType === "default") {
            return ctx.createOscillator();
        }
        else if (isOscType(iType)) {
            let osc = ctx.createOscillator();
            osc.type = iType;
            return osc;
        }
        else if (typeof iType === 'string' && NoiseTypes.includes(iType)) {
            let dur = (_a = contEndTime !== null && contEndTime !== void 0 ? contEndTime : sound === null || sound === void 0 ? void 0 : sound.duration) !== null && _a !== void 0 ? _a : 0;
            if (sound && 'detune' in sound && (sound === null || sound === void 0 ? void 0 : sound.detune) !== undefined && (sound === null || sound === void 0 ? void 0 : sound.detune) > 0)
                dur += dur * ((sound === null || sound === void 0 ? void 0 : sound.detune) / 600);
            return makeNoiseNode(ctx, iType, dur * 1.1);
        }
        else if (typeof iType === 'string' && MultiNoteInstruments.includes(iType)) {
            let note = determineNoteRange((_b = sound === null || sound === void 0 ? void 0 : sound.pitch) !== null && _b !== void 0 ? _b : DefaultFrequency, {});
            let sample = (_c = instSamples === null || instSamples === void 0 ? void 0 : instSamples[iType]) === null || _c === void 0 ? void 0 : _c[('C' + note.octave)];
            let source = ctx.createBufferSource();
            source.buffer = sample;
            source.detune.value = note.detune;
            return source;
        }
        else if (typeof iType === 'string' && SingleNoteInstruments.includes(iType) && instSamples) {
            let sample = instSamples[iType].mono;
            let source = ctx.createBufferSource();
            source.buffer = sample;
            return source;
        }
        else if (typeof iType === 'string' && ((_d = Object.keys(waveDefs || {})) === null || _d === void 0 ? void 0 : _d.includes(iType)) && waveDefs) {
            let real_parsed = new Float32Array(waveDefs[iType].real);
            let imag_parsed = new Float32Array(waveDefs[iType].imag);
            const wave = ctx.createPeriodicWave(real_parsed, imag_parsed, { disableNormalization: waveDefs[iType].disableNormalization || false });
            let osc = ctx.createOscillator();
            osc.setPeriodicWave(wave);
            return osc;
        }
        else if (typeof iType === 'string' && ((_e = Object.keys(instSamples || {})) === null || _e === void 0 ? void 0 : _e.includes(iType)) && instSamples) {
            let sample;
            let note = determineNoteRange((_f = sound === null || sound === void 0 ? void 0 : sound.pitch) !== null && _f !== void 0 ? _f : DefaultFrequency, {});
            if (instSamples[iType].multiNote) {
                sample = (_g = instSamples === null || instSamples === void 0 ? void 0 : instSamples[iType]) === null || _g === void 0 ? void 0 : _g[('C' + note.octave)];
            }
            else {
                sample = instSamples[iType].mono;
            }
            let source = ctx.createBufferSource();
            source.buffer = sample;
            if (instSamples[iType].multiNote) {
                source.detune.value = note.detune;
            }
            return source;
        }
        else if (typeof iType === 'string' && ((_h = Object.keys(synthDefs || {})) === null || _h === void 0 ? void 0 : _h.includes(iType)) && synthDefs) {
            let synth = makeSynth(ctx, synthDefs[iType]);
            return synth;
        }
        else {
            return ctx.createOscillator();
        }
    }

    function setCurrentTime(ctx) {
        return ctx.currentTime;
    }
    // export let ErieGlobalControl: GlobalControl, ErieGlobalState: GlobalState;
    function setErieGlobalControl(ctrl) {
        if (isBrowserWindowPossible()) {
            if (!('ErieGlobalControl' in window))
                window.ErieGlobalControl = undefined;
            window.ErieGlobalControl = ctrl;
        }
        else {
            Globals.ErieGlobalControl = ctrl;
        }
    }
    function isErieGlobalControlType(t) {
        var _a, _b;
        if (isBrowserWindowPossible()) {
            return ((_a = window.ErieGlobalControl) === null || _a === void 0 ? void 0 : _a.type) === t;
        }
        else {
            return ((_b = Globals.ErieGlobalControl) === null || _b === void 0 ? void 0 : _b.type) === t;
        }
    }
    function isErieGlobalControlAudioContext() {
        var _a, _b, _c, _d;
        if (isBrowserWindowPossible()) {
            return (((_a = window.ErieGlobalControl) === null || _a === void 0 ? void 0 : _a.player) instanceof AudioContext) || (((_b = window.ErieGlobalControl) === null || _b === void 0 ? void 0 : _b.player) instanceof OfflineAudioContext);
        }
        else {
            return (((_c = Globals.ErieGlobalControl) === null || _c === void 0 ? void 0 : _c.player) instanceof AudioContext) || (((_d = Globals.ErieGlobalControl) === null || _d === void 0 ? void 0 : _d.player) instanceof OfflineAudioContext);
        }
    }
    function isErieGlobalControlSpeechSynthesis() {
        var _a, _b;
        if (isBrowserWindowPossible()) {
            return (((_a = window.ErieGlobalControl) === null || _a === void 0 ? void 0 : _a.player) instanceof SpeechSynthesis);
        }
        else {
            return (((_b = Globals.ErieGlobalControl) === null || _b === void 0 ? void 0 : _b.player) instanceof SpeechSynthesis);
        }
    }
    function closeErieGlobalControl() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (isBrowserWindowPossible()) {
            if (((_a = window.ErieGlobalControl) === null || _a === void 0 ? void 0 : _a.player) && 'cancel' in ((_b = window.ErieGlobalControl) === null || _b === void 0 ? void 0 : _b.player)) {
                (_c = window.ErieGlobalControl) === null || _c === void 0 ? void 0 : _c.player.cancel();
            }
            else if (((_d = window.ErieGlobalControl) === null || _d === void 0 ? void 0 : _d.player) && 'close' in ((_e = window.ErieGlobalControl) === null || _e === void 0 ? void 0 : _e.player)) {
                (_f = window.ErieGlobalControl) === null || _f === void 0 ? void 0 : _f.player.close();
            }
        }
        else {
            if (((_g = Globals.ErieGlobalControl) === null || _g === void 0 ? void 0 : _g.player) && 'cancel' in ((_h = Globals.ErieGlobalControl) === null || _h === void 0 ? void 0 : _h.player)) {
                (_j = Globals.ErieGlobalControl) === null || _j === void 0 ? void 0 : _j.player.cancel();
            }
            else if (((_k = Globals.ErieGlobalControl) === null || _k === void 0 ? void 0 : _k.player) && 'close' in ((_l = Globals.ErieGlobalControl) === null || _l === void 0 ? void 0 : _l.player)) {
                (_m = Globals.ErieGlobalControl) === null || _m === void 0 ? void 0 : _m.player.close();
            }
        }
    }
    function setErieGlobalState(state) {
        if (isBrowserWindowPossible()) {
            if (!('ErieGlobalState' in window))
                window.ErieGlobalState = undefined;
            window.ErieGlobalState = state;
        }
        else {
            Globals.ErieGlobalState = state;
        }
    }
    function isErieGlobalState(state) {
        if (isBrowserWindowPossible()) {
            return window.ErieGlobalState === state;
        }
        else {
            return Globals.ErieGlobalState === state;
        }
    }
    function setPlayerEvents(queue, config) {
        if (typeof window !== 'undefined') {
            const stop = function (event) {
                if ('key' in event && event.key == 'x') {
                    setErieGlobalState(Stopped);
                    queue.state = Stopped;
                    closeErieGlobalControl();
                    notifyStop(config);
                }
            };
            if (isBrowserWindowPossible()) {
                window.addEventListener('keypress', stop);
                if (!window.ErieGlobalPlayerEvents)
                    window.ErieGlobalPlayerEvents = new Map();
                window.ErieGlobalPlayerEvents.set('stop-event', stop);
            }
            else {
                Globals.ErieGlobalPlayerEvents.set('stop-event', stop);
            }
        }
    }
    function clearPlayerEvents() {
        if (typeof window !== 'undefined') {
            if (isBrowserWindowPossible()) {
                if (!window.ErieGlobalPlayerEvents)
                    window.ErieGlobalPlayerEvents = new Map();
                let stop = window.ErieGlobalPlayerEvents.get('stop-event');
                if (stop)
                    window.removeEventListener('keypress', stop);
                window.ErieGlobalPlayerEvents.delete('stop-event');
            }
            else {
                Globals.ErieGlobalPlayerEvents.delete('stop-event');
            }
        }
    }

    class AudioFilterPrototype {
        constructor(ctx) {
            this.ctx = ctx;
            this.filter = ctx.createGain();
            this.destination = this.filter;
        }
        initialize(...args) {
        }
        connect(node) {
            this.filter.connect(node);
        }
        disconnect(node) {
            this.filter.disconnect(node);
        }
    }

    function rampBy(ramperType, // default -> linear
    param, // any audio parameter that has ramping methods
    value, // the value to set
    time_at, // when to set the value
    speed) {
        switch (ramperType) {
            case 'exponentialRampToValueAtTime':
                // exponential ramping does not allow value 0
                param.exponentialRampToValueAtTime(value == 0 ? 0.0000000001 : value, time_at);
                break;
            case 'linearRampToValueAtTime':
                param.linearRampToValueAtTime(value, time_at);
                break;
            case 'setValueAtTime':
                param.setValueAtTime(value, time_at);
                break;
            case 'setTargetAtTime':
                if (speed !== undefined)
                    param.setTargetAtTime(value, time_at, speed);
                else
                    console.error("Speed paramemter must be defined for setTargetAtTime method.");
                break;
            default:
                param.linearRampToValueAtTime(value, time_at);
                break;
        }
    }
    // note: how rampers are processed
    /*
    Precondition: A ramping method can only defined for a continuous tone.
    1. A ramping method is first defined in a spec under a channel.
    2. It is collected and passed along to a unit stream (only a unit stream) to aovid any potential collision.
    3. When a unit stream is played, it is passed as configuration information and the proper ramping function is selected using the rampBy function.
    */

    // extra channels => biquadDetune, biquadPitch, biquadGain, biquadQ
    class BiquadFilter extends AudioFilterPrototype {
        constructor(ctx) {
            super(ctx);
            this.ctx = ctx;
            this.filter = ctx.createBiquadFilter();
            this.destination = this.filter;
            this.useGain = false;
        }
        initialize(time) {
            this.filter.gain.setValueAtTime(1, time);
        }
        connect(node) {
            this.filter.connect(node);
        }
        disconnect(node) {
            this.filter.disconnect(node);
        }
    }
    class LowpassBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'lowpass';
            this.destination = this.filter;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class HighpassBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'highpass';
            this.destination = this.filter;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class BandpassBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'bandpass';
            this.destination = this.filter;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class LowshelfBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'lowshelf';
            this.destination = this.filter;
            this.useGain = true;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class HighshelfBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'highshelf';
            this.destination = this.filter;
            this.useGain = true;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class PeakingBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'peaking';
            this.destination = this.filter;
            this.useGain = true;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class NotchBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'notch';
            this.destination = this.filter;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    class AllpassBiquadFilter extends BiquadFilter {
        constructor(ctx) {
            super(ctx);
            this.filter.type = 'allpass';
            this.destination = this.filter;
        }
        connect(node) {
            this.destination.connect(node);
        }
        disconnect(node) {
            this.destination.disconnect(node);
        }
    }
    const BiquadEncoder = function (filter, sound, startTime, rampers) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (filter.useGain) {
            rampBy(startTime == 0 ? 'setValueAtTime' : rampers === null || rampers === void 0 ? void 0 : rampers.biquadGain, filter.filter.gain, ((_b = (_a = sound === null || sound === void 0 ? void 0 : sound.others) === null || _a === void 0 ? void 0 : _a.biquadGain) !== null && _b !== void 0 ? _b : 1), startTime);
        }
        if (((_c = sound === null || sound === void 0 ? void 0 : sound.others) === null || _c === void 0 ? void 0 : _c.biquadPitch) !== undefined) {
            rampBy(startTime == 0 ? 'setValueAtTime' : rampers === null || rampers === void 0 ? void 0 : rampers.biquadPitch, filter.filter.frequency, ((_d = sound.others.biquadPitch) !== null && _d !== void 0 ? _d : 1), startTime);
        }
        if (((_e = sound === null || sound === void 0 ? void 0 : sound.others) === null || _e === void 0 ? void 0 : _e.biquadQ) !== undefined) {
            rampBy(startTime == 0 ? 'setValueAtTime' : rampers === null || rampers === void 0 ? void 0 : rampers.biquadQ, filter.filter.Q, ((_f = sound.others.biquadQ) !== null && _f !== void 0 ? _f : 1), startTime);
        }
        if (((_g = sound === null || sound === void 0 ? void 0 : sound.others) === null || _g === void 0 ? void 0 : _g.biquadDetune) !== undefined) {
            rampBy(startTime == 0 ? 'setValueAtTime' : rampers === null || rampers === void 0 ? void 0 : rampers.biquadDetune, filter.filter.detune, ((_h = sound.others.biquadDetune) !== null && _h !== void 0 ? _h : 1), startTime);
        }
    };
    const BiquadFinisher = function (filter, sound, startTime, duration, rampers) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (filter.useGain) {
            filter.filter.gain.setValueAtTime(((_b = (_a = sound === null || sound === void 0 ? void 0 : sound.others) === null || _a === void 0 ? void 0 : _a.biquadGain) !== null && _b !== void 0 ? _b : 1), startTime + duration);
        }
        if (((_c = sound === null || sound === void 0 ? void 0 : sound.others) === null || _c === void 0 ? void 0 : _c.biquadPitch) !== undefined) {
            filter.filter.frequency.setValueAtTime(((_d = sound.others.biquadPitch) !== null && _d !== void 0 ? _d : 1), startTime + duration);
        }
        if (((_e = sound === null || sound === void 0 ? void 0 : sound.others) === null || _e === void 0 ? void 0 : _e.biquadQ) !== undefined) {
            filter.filter.Q.setValueAtTime(((_f = sound.others.biquadQ) !== null && _f !== void 0 ? _f : 1), startTime + duration);
        }
        if (((_g = sound === null || sound === void 0 ? void 0 : sound.others) === null || _g === void 0 ? void 0 : _g.biquadDetune) !== undefined) {
            filter.filter.detune.setValueAtTime(((_h = sound.others.biquadDetune) !== null && _h !== void 0 ? _h : 1), startTime + duration);
        }
    };

    class DefaultDynamicCompressor extends AudioFilterPrototype {
        constructor(ctx) {
            super(ctx);
            this.ctx = ctx;
            this.filter = ctx.createDynamicsCompressor();
            this.destination = this.filter;
        }
        initialize() {
            this.filter.attack.value = 20;
            this.filter.knee.value = 40;
            this.filter.ratio.value = 18;
            this.filter.release.value = 0.25;
            this.filter.threshold.value = -50;
        }
        connect(node) {
            this.filter.connect(node);
        }
        disconnect(node) {
            this.filter.disconnect(node);
        }
    }
    const CompressorEncoder = function (filter, sound, startTime, rampers) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (((_a = sound.others) === null || _a === void 0 ? void 0 : _a.dcAttack) !== undefined)
            rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.dcAttack, filter.filter.attack, (_b = sound.others.dcAttack) !== null && _b !== void 0 ? _b : 1, startTime);
        if (((_c = sound.others) === null || _c === void 0 ? void 0 : _c.dcKnee) !== undefined)
            rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.dcKnee, filter.filter.knee, (_d = sound.others.dcKnee) !== null && _d !== void 0 ? _d : 1, startTime);
        if (((_e = sound.others) === null || _e === void 0 ? void 0 : _e.dcRatio) !== undefined)
            rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.dcRatio, filter.filter.ratio, (_f = sound.others.dcRatio) !== null && _f !== void 0 ? _f : 1, startTime);
        if (((_g = sound.others) === null || _g === void 0 ? void 0 : _g.dcReduction) !== undefined)
            rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.dcReduction, filter.filter.release, (_h = sound.others.dcReduction) !== null && _h !== void 0 ? _h : 1, startTime);
        if (((_j = sound.others) === null || _j === void 0 ? void 0 : _j.dcThreshold) !== undefined)
            rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.dcThreshold, filter.filter.threshold, (_k = sound.others.dcThreshold) !== null && _k !== void 0 ? _k : 1, startTime);
    };
    const CompressorFinisher = function (filter, sound, startTime, duration, rampers) {
    };

    class DistortionFilter extends AudioFilterPrototype {
        constructor(ctx) {
            super(ctx);
            this.ctx = ctx;
            this.filter = ctx.createWaveShaper();
            this.destination = this.filter;
        }
        initialize(s, e) {
            // s: starting time is not important but for formatting
            this.filter.curve = makeDistortionCurve(e);
        }
        connect(node) {
            this.filter.connect(node);
        }
        disconnect(node) {
            this.filter.disconnect(node);
        }
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper#examples
    function makeDistortionCurve(amount) {
        const k = amount !== null && amount !== void 0 ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; i++) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 10 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
    const DistortionEncoder = function (filter, sound, startTime, rampers) {
        var _a;
        if (((_a = sound.others) === null || _a === void 0 ? void 0 : _a.distortion) !== undefined) {
            filter.filter.curve = makeDistortionCurve(sound.others.distortion);
        }
        else {
            filter.filter.curve = makeDistortionCurve(100);
        }
    };
    const DistortionFinisher = function (filter, sound, startTime, duration, rampers) {
        filter.filter.curve = makeDistortionCurve(50);
    };

    // This is a basic sample for how to define a custom filter
    class GainerFilter extends AudioFilterPrototype {
        constructor(ctx) {
            super(ctx);
            // always needs an (offline) audio context
            this.ctx = ctx;
            // static parameters
            this.attackTime = 0.1;
            this.releaseTime = 0.1;
            // always needs a `filter` property for dynamic parameters to be used by the encoder and finisher
            // the name can change but... just stick to this
            this.filter = ctx.createGain();
            // always needs a desitnation that is connectable; sometimes it can be something other than the filter object.
            // the name can never be changed because this is the property that other interfaces gonna access to this node.
            this.destination = this.filter;
        }
        // [required] this is ran when the filter is applied for the first time
        initialize(time) {
            this.filter.gain.cancelScheduledValues(time);
            this.filter.gain.setValueAtTime(0, time);
        }
        // the follwoing methods are required to satisfiy the basic audio node structure
        // [required] this defines how this filter connects itself to another node
        connect(node) {
            this.filter.connect(node);
        }
        // [required] this defines how this filter *dis*connects itself to another node
        disconnect(node) {
            this.filter.disconnect(node);
        }
    }
    // an encoder changes values at a time
    // must use `rampBy` function as a standard interface for ramping functions
    const GainerEncoder = function (filter, sound, startTime, rampers) {
        var _a, _b;
        rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.gain2, // ramper methods (if provided, otherwise, 'linear')
        filter.filter.gain, // actual node to set the value
        (_b = (_a = sound.others) === null || _a === void 0 ? void 0 : _a.gain2) !== null && _b !== void 0 ? _b : 1, // the gain value
        startTime + filter.attackTime // when the gain value kicks in
        );
    };
    // a finisher sets the final values when the sound is done.
    // must use `rampBy` function as a standard interface for ramping functions
    const GainerFinisher = function (filter, sound, startTime, duration, rampers) {
        rampBy(rampers === null || rampers === void 0 ? void 0 : rampers.gain2, filter.filter.gain, 0, (startTime || 0) + (duration || 1) - filter.releaseTime);
    };

    const PresetFilters = {
        'gainer': { filter: GainerFilter, encoder: GainerEncoder, finisher: GainerFinisher },
        'lowpass': { filter: LowpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'highpass': { filter: HighpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'bandpass': { filter: BandpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'lowshelf': { filter: LowshelfBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'highshelf': { filter: HighshelfBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'peaking': { filter: PeakingBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'notch': { filter: NotchBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'allpass': { filter: AllpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
        'defaultCompressor': { filter: DefaultDynamicCompressor, encoder: CompressorEncoder, finisher: CompressorFinisher },
        'distortion': { filter: DistortionFilter, encoder: DistortionEncoder, finisher: DistortionFinisher }
    };
    const FilterExtraChannelTypes = {
        gain2: { type: LOUDNESS_chn },
        biquadDetune: { type: DETUNE_chn },
        biquadPitch: { type: PITCH_chn }
    };

    function emitNotePlayEvent(type, note) {
        if (isBrowserEventPossible()) {
            document.body.dispatchEvent(new CustomEvent("erieOnNotePlay", {
                detail: {
                    type,
                    note
                }
            }));
        }
    }
    function emitNoteStopEvent(type, note) {
        if (isBrowserEventPossible()) {
            document.body.dispatchEvent(new CustomEvent("erieOnNoteStop", {
                detail: {
                    type,
                    note
                }
            }));
        }
    }

    function playPause(ms, config) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    let ErieFilters = {};
    function registerFilter(name, filter, encoder, finisher) {
        ErieFilters[name] = { filter, encoder, finisher };
    }

    class Tick {
        constructor(name) {
            if (name)
                this._name = name;
            else {
                throw new Error('A tick definition must have a name.');
            }
            this._interval = 0.5;
            this._playAtTime0 = true;
            this._oscType = 'sine';
            this._pitch = 150;
            this._loudness = 0.4;
        }
        setName(n) {
            this._name = n;
            return this;
        }
        interval(t) {
            if (t > 0) {
                this._interval = t;
            }
            else {
                throw new TypeError('A tick interval must be greater than 0.');
            }
            return this;
        }
        playAtTime0(t) {
            this._playAtTime0 = t;
            return this;
        }
        oscType(t) {
            this._oscType = t;
            return this;
        }
        pitch(t) {
            if (t > 0) {
                this._pitch = t;
            }
            else {
                throw new TypeError('A tick pitch must be greater than 0.');
            }
            return this;
        }
        loudness(t) {
            if (t >= 0 && t <= 1) {
                this._loudness = t;
            }
            else {
                throw new TypeError('A tick loudness must be between 0 and 1.');
            }
            return this;
        }
        get() {
            return {
                name: this._name,
                interval: this._interval,
                playAtTime0: this._playAtTime0,
                oscType: this._oscType,
                pitch: this._pitch,
                loudness: this._loudness
            };
        }
        clone() {
            let _c = new Tick(this._name);
            _c.interval(this._interval);
            _c.pitch(this._pitch);
            _c.oscType(this._oscType);
            _c.pitch(this._pitch);
            _c.loudness(this._loudness);
            return _c;
        }
    }
    class TickList {
        constructor() {
            this.tick = [];
        }
        add(a) {
            this.tick.push(a);
            return this;
        }
        get() {
            return this.tick.map((d) => d.get());
        }
        clone() {
            let _c = new TickList();
            _c.tick = this.tick.map((d) => d.clone());
            return _c;
        }
    }

    function isInstanceOf(o, c) {
        return (o === null || o === void 0 ? void 0 : o.constructor) == c;
    }
    function isInstanceOfByName(o, c) {
        var _a;
        return ((_a = o === null || o === void 0 ? void 0 : o.constructor) === null || _a === void 0 ? void 0 : _a.name) === c;
    }
    function isArrayOf(o, c) {
        if (isInstanceOf(o, Array)) {
            if (isInstanceOf(c, Array)) {
                return o.every((d) => c.includes(d.constructor));
            }
            else {
                return o.every((d) => isInstanceOf(d, c));
            }
        }
        else {
            return false;
        }
    }

    class Channel {
        constructor(f, t) {
            this.defined = false;
            this._channel = undefined;
            this._field;
            this._type;
            if (f) {
                this.field(f, t);
            }
            this._ramp = 'linear';
            this._aggregate;
            this._bin;
            this._scale = {};
            this._condition;
            this._value;
            this._format;
            this._formatType;
        }
        set(c) {
            if (isInstanceOfByName(c, `TimeChannel`) ||
                isInstanceOfByName(c, `Time2Channel`) ||
                isInstanceOfByName(c, `DurationChannel`) ||
                isInstanceOfByName(c, `TapSpeedChannel`) ||
                isInstanceOfByName(c, `TapCountChannel`) ||
                isInstanceOfByName(c, `PitchChannel`) ||
                isInstanceOfByName(c, `DetuneChannel`) ||
                isInstanceOfByName(c, `LoudnessChannel`) ||
                isInstanceOfByName(c, `PanChannel`) ||
                isInstanceOfByName(c, `PostReverbChannel`) ||
                isInstanceOfByName(c, `SpeechBeforeChannel`) ||
                isInstanceOfByName(c, `SpeechAfterChannel`) ||
                isInstanceOfByName(c, `RepeatChannel`) ||
                isInstanceOfByName(c, `ModulationChannel`) ||
                isInstanceOfByName(c, `HarmonicityChannel`) ||
                isInstanceOfByName(c, `Channel`)) {
                let g = c.get();
                Object.assign(this, g);
            }
        }
        field(f, t) {
            if (f === undefined) {
                this._field = undefined;
            }
            else if (isInstanceOf(f, String)) {
                this._field = f;
            }
            else if (this._channel === REPEAT_chn && isArrayOf(f, String)) {
                this._field = f;
            }
            else {
                throw new TypeError('A field for an encoding channel must be a String.');
            }
            if (t)
                this.type(t);
            this.defined = true;
            return this;
        }
        type(t) {
            this._type = t;
            return this;
        }
        ramp(r) {
            if (isInstanceOf(r, String)) {
                this._ramp = r;
            }
            else {
                this._ramp = r ? 'linear' : 'abrupt';
            }
        }
        aggregate(op) {
            switch (op) {
                case COUNT:
                    if (this._field) {
                        console.warn('A count aggregate will drop the existing field.');
                    }
                    this._aggregate = op;
                    this._type = QUANT;
                    this.defined = true;
                    break;
                case VALID:
                case DISTINCT:
                case MEAN:
                case AVG:
                case MODE:
                case MEDIAN:
                case QUANTILE:
                case STDEV:
                case STDEVP:
                case VARIANCE:
                case VARIANCEP:
                case SUM:
                case PRODUCT:
                case MAX:
                case MIN:
                    this._aggregate = op;
                    this._type = QUANT;
                    this.defined = true;
                    break;
                case CORR:
                case COVARIANCE:
                case COVARIANCEP:
                    throw new TypeError('An aggregate operation for two fields cannot be declared here.');
            }
            return this;
        }
        bin(...args) {
            // polymorph
            let is_bin, nice, maxbins, step, exact;
            if (args.length == 1) {
                if (isInstanceOf(args[0], Boolean)) {
                    is_bin = args[0];
                }
                else if (isArrayOf(args[0], Number)) {
                    is_bin = true;
                    exact = args[0];
                }
            }
            else if (args.length >= 2 && args.length <= 3) {
                is_bin = true;
                [maxbins, nice, step] = args;
            }
            else {
                throw new TypeError(`Wrong argument is provided for a channel's bin.`);
            }
            this._bin = is_bin;
            if (maxbins || nice || step) {
                this._bin = {
                    maxbins, nice, step
                };
            }
            else if (exact) {
                this._bin = { exact };
            }
            this.defined = true;
            return this;
        }
        scale(p, v) {
            if (p === KeyDomain && v instanceof Array) {
                this._scale.domain = [...v];
            }
            else if (p === KeyRange && v instanceof Object && v.field) {
                this._scale.range = deepcopy(v);
            }
            else if (p === KeyRange && isInstanceOf(v, Array)) {
                if (v.every(this.validator)) {
                    this._scale.range = [...v];
                    if (this._scale.times !== undefined ||
                        this._scale.maxDistinct !== undefined) {
                        console.warn('Existing scale settings will be ignored.');
                        this._scale.times = undefined;
                        this._scale.maxDistinct = undefined;
                    }
                }
                else {
                    throw new TypeError('Unsupported value type');
                }
            }
            else if (p === KeyOrder && isInstanceOf(v, Array)) {
                this._scale.order = v;
            }
            else if (p === KeyPolarity && SupportedPolarity.includes(v)) {
                this._scale.polarity = v;
            }
            else if (p === KeyMaxDistinct && isInstanceOf(v, Boolean)) {
                this._scale.maxDistinct = v;
                if (this._scale.range !== undefined ||
                    this._scale.times !== undefined) {
                    console.warn('Existing scale settings will be ignored.');
                    this._scale.range = undefined;
                    this._scale.times = undefined;
                }
            }
            else if (p === KeyTimes && isInstanceOf(v, Number)) {
                this._scale.times = v;
                if (this._scale.range !== undefined ||
                    this._scale.maxDistinct !== undefined) {
                    console.warn('Existing scale settings will be ignored.');
                    this._scale.range = undefined;
                    this._scale.maxDistinct = undefined;
                }
            }
            else if (p === KeyZero && isInstanceOf(v, Boolean)) {
                this._scale.zero = v;
            }
            else if (p === KeyDescription && (isInstanceOf(v, String) || v == null)) {
                this._scale.description = v;
            }
            else if (p === KeyTitle && (isInstanceOf(v, String) || v == null)) {
                this._scale.title = v;
            }
            else if (this._channel === TIME_chn && p === KeyLength && isInstanceOf(v, Number)) {
                this._scale.length = v;
            }
            else if ([TIME_chn, TAPCNT_chn, TAPSPD_chn].includes(this._channel) && p === KeyBand && isInstanceOf(v, Number)) {
                this._scale.band = v;
            }
            else if (this._channel === TIME_chn && p === KeyTiming && TIMINGS.includes(v)) {
                this._scale.timing = v;
            }
            else if (this._channel === TAPSPD_chn && p === KeySingleTappingPosition && SingleTapPosOptions.includes(v)) {
                this._scale.timing = v;
            }
            else {
                throw new Error('The provide key and value is not a supported scale option.');
            }
            this.defined = true;
            return this;
        }
        addCondition(c, o) {
            if ((isInstanceOf(c, String)
                || c instanceof Array
                || (!(c instanceof Array) && c instanceof Object && c.not !== undefined))
                && o !== undefined) {
                if (!this._condition)
                    this._condition = [];
                this._condition.push({
                    test: c,
                    value: o
                });
                if (this._type !== STATIC) {
                    console.warn('The type of this channel is changed to static, and the scales will be droped.');
                    this._type = STATIC;
                    this._scale = {};
                }
            }
            else {
                throw new Error('The provide condition and value is not a supported condition.');
            }
            this.defined = true;
            return this;
        }
        addConditions(c) {
            for (const cond of c) {
                if (cond.test && cond.value)
                    this.addCondition(cond.test, cond.value);
            }
            this.defined = true;
            return this;
        }
        getConditions() {
            return this._condition ? deepcopy(this._condition) : this._condition;
        }
        removeCondition(i) {
            if (this._condition instanceof Array) {
                this._condition.splice(i, 1);
            }
        }
        resetCondition() {
            return this._condition = undefined;
        }
        value(v) {
            if (this.validator(v)) {
                this._value = v;
                if (this._type !== STATIC) {
                    console.warn('The type of this channel is changed to static, and the scales will be droped.');
                    this._type = STATIC;
                    this._scale = {};
                    this._field = undefined;
                    this._aggregate = undefined;
                    this._bin = undefined;
                }
            }
            else {
                throw new TypeError('Unsupported value type');
            }
            this.defined = true;
            return this;
        }
        speech(v) {
            if (this._channel === REPEAT_chn) {
                this._speech = v;
            }
            else {
                throw new Error('Speech option is only for a repeat channel.');
            }
            this.defined = true;
            return this;
        }
        tick(k, v) {
            if (this._channel === TIME_chn) {
                if (isInstanceOf(k, String)) {
                    if (!this._tick)
                        this._tick = {};
                    if (k === TickKeyName && isInstanceOf(v, String)) {
                        this._tick.name = v;
                    }
                    else if (k === TickKeyInterval && isInstanceOf(v, Number)) {
                        this._tick.interval = v;
                    }
                    else if (k === TickKeyPlayAtTime0 && isInstanceOf(v, Boolean)) {
                        this._tick.playAtTime0 = v;
                    }
                    else if (k === TickKeyOscType && OscTypes.includes(v)) {
                        this._tick.playAtTime0 = v;
                    }
                    else if (k === TickKeyPitch && isInstanceOf(v, Number)) {
                        this._tick.pitch = v;
                    }
                    else if (k === TickKeyLoudness && isInstanceOf(v, Number) && 0 <= v && v <= 1) {
                        this._tick.loudness = v;
                    }
                }
                else if (isInstanceOf(k, Tick)) {
                    this._tick = { name: k._name };
                }
                else {
                    throw new TypeError('The "speech" option for a channel must be Boolean.');
                }
            }
            else {
                throw new Error('Speech option is only for a time channel.');
            }
            this.defined = true;
            return this;
        }
        format(f, t) {
            if (f && t && isInstanceOf(f, String)) {
                this._format = f;
                this._formatType = t;
            }
            else if (f && isInstanceOf(f, String)) {
                this._format = f;
            }
        }
        formatType(t) {
            this._formatType = t;
        }
        get() {
            let o = {
                type: this._type,
                field: this._field,
                channel: this._channel,
                aggregate: this._aggregate,
                bin: this._bin ? deepcopy(this._bin) : this._bin,
                scale: this._scale ? deepcopy(this._scale) : this._scale,
                value: this._value,
                condition: this._condition ? deepcopy(this._condition) : this._condition,
                ramp: this._ramp,
                defined: this.defined,
                roundToNote: this._roundToNote
            };
            if (this._channel === TIME_chn) {
                o.tick = this._tick ? deepcopy(this._tick) : this._tick;
            }
            if (this._channel === REPEAT_chn) {
                o.speech = this._speech;
            }
            return o;
        }
        validator(v) {
            return true;
        }
        clone() {
            let _c = new Channel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }

    class TimeChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = TIME_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= 0;
        }
        clone() {
            let _c = new TimeChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class Time2Channel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = TIME2_chn;
        }
        clone() {
            let _c = new Time2Channel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class DurationChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = DUR_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= 0;
        }
        clone() {
            let _c = new DurationChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    const MAX_LIMIT_TAP_SPEED = 7;
    class TapSpeedChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = TAPSPD_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_TAP_SPEED;
        }
        clone() {
            let _c = new TapSpeedChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class TapCountChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = TAPCNT_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= 0;
        }
        clone() {
            let _c = new TapCountChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    const MAX_LIMIT_PITCH = 3000;
    class PitchChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = PITCH_chn;
            this._roundToNote = false;
        }
        roundToNote(v) {
            this._roundToNote = v;
            return this;
        }
        validator(v) {
            return (isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_PITCH) || (isInstanceOf(v, String) && v.match(/^[A-F][0-9]$/gi));
        }
        clone() {
            let _c = new PitchChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class DetuneChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = DETUNE_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= -1200 && v <= 1200;
        }
        clone() {
            let _c = new DetuneChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class LoudnessChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = LOUDNESS_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number);
        }
        clone() {
            let _c = new LoudnessChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class PanChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = PAN_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= -1 && v <= 1;
        }
        clone() {
            let _c = new PanChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class PostReverbChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = POST_REVERB_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v >= 0;
        }
        clone() {
            let _c = new PostReverbChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class SpeechBeforeChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = SPEECH_BEFORE_chn;
        }
        clone() {
            let _c = new SpeechBeforeChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class SpeechAfterChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = SPEECH_AFTER_chn;
        }
        clone() {
            let _c = new SpeechAfterChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class RepeatChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = REPEAT_chn;
        }
        clone() {
            let _c = new RepeatChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class ModulationChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = MODULATION_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v > 0;
        }
        clone() {
            let _c = new ModulationChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class HarmonicityChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = HARMONICITY_chn;
        }
        validator(v) {
            return isInstanceOf(v, Number) && v > 0;
        }
        clone() {
            let _c = new HarmonicityChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }
    class TimbreChannel extends Channel {
        constructor(f, t) {
            super(f, t);
            this._channel = TIMBRE_chn;
        }
        validator(v) {
            return isInstanceOf(v, String);
        }
        clone() {
            let _c = new TimbreChannel(undefined, undefined);
            let _g = this.get();
            Object.keys(_g).forEach(k => {
                let ck = k === "defined" ? k : "_" + k;
                _c[ck] = _g[k];
            });
            return _c;
        }
    }

    class Config {
        constructor() {
            this._config = {};
            this._config = {
                speechRate: 1.75,
                skipScaleSpeech: false,
                skipDescription: false,
                skipTitle: false,
                overlayScaleConsistency: true,
                forceOverlayScaleConsistency: false,
                sequenceScaleConsistency: true,
                forceSequenceScaleConsistency: false
            };
        }
        set(k, v) {
            if (configValidator(k, v)) {
                this._config[k] = v;
            }
            else {
                throw TypeError(`Wrong value type for ${k}.`);
            }
            return this;
        }
        get() {
            return deepcopy(this._config);
        }
        clone() {
            let _c = new Config();
            let g = this.get();
            Object.keys(g).forEach((k) => {
                _c.set(k, g[k]);
            });
            return _c;
        }
    }
    function configValidator(k, v) {
        if (k === 'speechRate')
            return isInstanceOf(v, Number) && v > 0;
        else if (k === 'skipScaleSpeech')
            return isInstanceOf(v, Boolean);
        else if (k === 'skipDescription')
            return isInstanceOf(v, Boolean);
        else if (k === 'skipTitle')
            return isInstanceOf(v, Boolean);
        else if (k === 'overlayScaleConsistency')
            return isInstanceOf(v, Boolean);
        else if (k === 'forceOverlayScaleConsistency')
            return isInstanceOf(v, Boolean);
        else if (k === 'sequenceScaleConsistency')
            return isInstanceOf(v, Boolean);
        else if (k === 'forceSequenceScaleConsistency')
            return isInstanceOf(v, Boolean);
        else
            return true;
    }

    // import { Dataset } from "./erie-datasets";
    const Values = 'values', Url = 'url', Name = 'name', Unset = 'unset';
    const AllowedDataTypes = [Values, Url, Name];
    class Data {
        constructor() {
            this.type = 'unset';
            this.values = null;
            this.url = null;
            this.name = null;
        }
        set(type, e) {
            if (isInstanceOf(type, Dataset)) {
                this.type = Name;
                this.name = type._name;
            }
            else if (!AllowedDataTypes.includes(type)) {
                throw new TypeError(`Unspported data type ${type}}. It must be either one of ${AllowedDataTypes.join(", ")}.`);
            }
            else {
                if (type === Values) {
                    this.type = Values;
                    this.values = e;
                }
                else if (type === Url) {
                    this.type = Url;
                    this.url = e;
                }
                else if (type === Name) {
                    this.type = Name;
                    this.name = e;
                }
            }
            return this;
        }
        get() {
            return {
                type: this.type,
                values: deepcopy(this.values),
                url: this.url,
                name: this.name
            };
        }
        clone() {
            let _c = new Data();
            _c.type = this.type;
            if (this.type === Values) {
                _c.values = deepcopy(this.values);
            }
            else if (this.type === Url) {
                _c.url = this.url;
            }
            else if (this.type === Name) {
                _c.name = this.name;
            }
            return _c;
        }
    }
    class Datasets {
        constructor() {
            this.datasets = [];
        }
        add(ds) {
            this.datasets.push(ds.clone());
            return this;
        }
        get(name) {
            var _a, _b, _d;
            if (name) {
                return (_b = (_a = this.datasets) === null || _a === void 0 ? void 0 : _a.filter(d => d._name === name)) === null || _b === void 0 ? void 0 : _b[0].get();
            }
            else {
                return (_d = this.datasets) === null || _d === void 0 ? void 0 : _d.map((d) => d.get());
            }
        }
        clone() {
            var _a;
            let _c = new Datasets();
            _c.datasets = (_a = this.datasets) === null || _a === void 0 ? void 0 : _a.map((d) => d.clone());
            return _c;
        }
    }
    class Dataset {
        constructor(n) {
            this._name = n;
            this.data = new Data();
        }
        name(n) {
            this._name = n;
            return this;
        }
        set(t, v) {
            this.data.set(t, v);
            return this;
        }
        get() {
            return {
                name: this._name,
                data: this.data.get()
            };
        }
        clone() {
            let _c = new Dataset(this._name);
            if (_c)
                _c.data = this.data.clone();
            return _c;
        }
    }

    class SynthTone {
        constructor(name) {
            this._name = name;
            this._type = 'FM';
            this._carrierType = 'sine';
            this._carrierPitch = 220;
            this._carrierDetune = 0;
            this._carrierVolume = 1;
            this._modulatorType = 'sine';
            this._modulatorPitch = 440;
            this._modulatorVolume = 0.2;
            this._modulation = 1;
            this._harmonicity = 1;
            this._attackTime = 0;
            this._releaseTime = 0;
            this._sustain = 0.8;
            this._decayTime = 0.1;
        }
        name(n) {
            this._name = n;
            return this;
        }
        type(t) {
            this._type = t;
            return this;
        }
        carrierType(t) {
            this._carrierType = t;
            return this;
        }
        carrierPitch(p) {
            if (p >= 0) {
                this._carrierPitch = p;
            }
            else {
                throw new TypeError(`The carrier pitch of a synth tone must be equal to or greater than 0.`);
            }
            return this;
        }
        carrierDetune(p) {
            if (p >= -1200 && p <= 1200) {
                this._carrierDetune = p;
            }
            else {
                throw new TypeError(`The carreir detune of a synth tone must be between -1200 and 1200.`);
            }
            return this;
        }
        modulatorType(t) {
            this._modulatorType = t;
            return this;
        }
        modulatorPitch(p) {
            if (p >= 0) {
                this._modulatorPitch = p;
            }
            else {
                throw new TypeError(`The modulator volume of a synth tone must be equal to or greater than 0.`);
            }
            return this;
        }
        modulatorVolume(p) {
            if (p >= 0) {
                this._modulatorVolume = p;
            }
            else {
                throw new TypeError(`The modulator volume of a synth tone must be equal to or greater than 0.`);
            }
            return this;
        }
        modulation(p) {
            if (this._type === AM) {
                console.warn('Moudlation index for an AM synth will be ignored.');
            }
            if (p > 0) {
                this._modulation = p;
            }
            else {
                throw new TypeError(`The moudlation index of a synth tone must be Number and greater than 0.`);
            }
            return this;
        }
        harmonicity(p) {
            if (this._type === FM) {
                console.warn('Harmonicity for an FM synth will be ignored.');
            }
            if (p > 0) {
                this._harmonicity = p;
            }
            else {
                throw new TypeError(`The harmonicity of a synth tone must be Number and greater than 0.`);
            }
            return this;
        }
        attackTime(p) {
            if (p > 0) {
                this._attackTime = p;
            }
            else {
                throw new TypeError(`The attack time of a synth tone must be Number and greater than 0.`);
            }
            return this;
        }
        releaseTime(p) {
            if (p >= 0) {
                this._releaseTime = p;
            }
            else {
                throw new TypeError(`The release time of a synth tone must be equal to or greater than 0.`);
            }
            return this;
        }
        get() {
            return {
                name: this._name,
                type: this._type,
                carrierType: this._carrierType,
                carrierPitch: this._carrierPitch,
                carrierDetune: this._carrierDetune,
                carrierVolume: this._carrierVolume,
                modulatorType: this._modulatorType,
                modulatorPitch: this._modulatorPitch,
                modulatorVolume: this._modulatorVolume,
                modulation: this._modulation,
                harmonicity: this._harmonicity,
                attackTime: this._attackTime,
                releaseTime: this._releaseTime,
                sustain: this._sustain,
                decayTime: this._decayTime
            };
        }
        clone() {
            let _c = new SynthTone(this._name);
            _c._type = this._type;
            _c._carrierType = this._carrierType;
            _c._carrierPitch = this._carrierPitch;
            _c._carrierDetune = this._carrierDetune;
            _c._carrierVolume = this._carrierVolume;
            _c._modulatorType = this._modulatorType;
            _c._modulatorPitch = this._modulatorPitch;
            _c._modulatorVolume = this._modulatorVolume;
            _c._modulation = this._modulation;
            _c._harmonicity = this._harmonicity;
            _c._attackTime = this._attackTime;
            _c._releaseTime = this._releaseTime;
            _c._sustain = this._sustain;
            _c._decayTime = this._decayTime;
            return _c;
        }
    }
    class Synth {
        constructor() {
            this.synth = [];
        }
        add(a) {
            this.synth.push(a);
            return this;
        }
        get() {
            return this.synth.map((d) => d.get());
        }
        clone() {
            let _c = new Synth();
            _c.synth = this.synth.map((d) => d.clone());
            return _c;
        }
    }

    function scaleKeyCheck(key) {
        return key.match(/^[C][0-7]$/);
    }
    class SampledTone {
        constructor(name, s) {
            this._name = name;
            this._sample;
            this.setName(name);
            this.setSample(s);
        }
        setName(n) {
            this._name = n;
            return this;
        }
        setSample(s) {
            Object.keys(s).forEach((k) => {
                if (!scaleKeyCheck(k) || k === undefined) {
                    throw new TypeError('The key of a sampling object should be "C" + "0-7".');
                }
                else if (k === "mono") {
                    this._sample = { mono: s[k] };
                }
                else {
                    this._sample = {};
                    let ck = k;
                    this._sample[ck] = s[ck];
                }
            });
            return this;
        }
        get() {
            return {
                name: this._name,
                sample: deepcopy(this._sample || {})
            };
        }
        clone() {
            let _c = new SampledTone(this._name, deepcopy(this._sample || {}));
            return _c;
        }
    }
    class Sampling {
        constructor() {
            this.sampling = [];
        }
        add(a) {
            this.sampling.push(a);
            return this;
        }
        get() {
            return this.sampling.map((d) => d.get());
        }
        clone() {
            let _c = new Sampling();
            _c.sampling = this.sampling.map((d) => d.clone());
            return _c;
        }
    }

    class Tone {
        constructor(type, c) {
            this._type = 'default';
            if (type)
                this.set(type);
            this._continued = false;
            if (c !== undefined)
                this.continued(c);
            this._filter = [];
        }
        set(t) {
            if (typeof t === 'string') {
                this.type(t);
            }
            else {
                this._type = t._name;
            }
        }
        type(t) {
            this._type = t;
            return this;
        }
        continued(c) {
            this._continued = c;
            return this;
        }
        addFilter(t) {
            if (isInstanceOf(t, String)) {
                this._filter.push(t);
            }
            else if (isArrayOf(t, String)) {
                this._filter.push(...t);
            }
            return this;
        }
        get() {
            return {
                type: this._type,
                continued: this._continued,
                filter: [...this._filter]
            };
        }
        clone() {
            let _c = new Tone(this._type, this._continued);
            _c.addFilter(this._filter);
            return _c;
        }
    }

    class Transform {
        constructor() {
            this.transform = [];
        }
        add(tf) {
            this.transform.push(tf);
            return this;
        }
        get() {
            return this.transform.map((tf) => tf.get());
        }
        clone() {
            let c = new Transform();
            this.transform.forEach((tf) => c.add(tf.clone()));
            return c;
        }
    }

    class WaveTone {
        constructor(name, defs) {
            this._name = name;
            if (!name) {
                throw new Error('A sampled tone must have a name.');
            }
            this._disableNormalization = false;
            this._real = [];
            this._imag = [];
            if (defs) {
                this.wave(defs);
            }
        }
        setName(n) {
            this._name = n;
            return this;
        }
        real(r) {
            this._real = r;
            return this;
        }
        imag(a) {
            this._imag = a;
            return this;
        }
        wave(w) {
            if (w.real && w.imag) {
                this.real(w.real);
                this.imag(w.imag);
            }
            else {
                throw new TypeError('The definition a periodic wave must consist of "real" (sine terms) and "imag" (cosine terms) properties.');
            }
            return this;
        }
        disableNormalization(v) {
            this._disableNormalization = v;
            return this;
        }
        get() {
            return {
                name: this._name,
                real: [...this._real],
                imag: [...this._imag],
                disableNormalization: this._disableNormalization
            };
        }
        clone() {
            let _c = new WaveTone(this._name);
            _c._real = [...this._real];
            _c._imag = [...this._imag];
            _c._disableNormalization = this._disableNormalization;
            return _c;
        }
    }
    class Wave {
        constructor() {
            this.wave = [];
        }
        add(a) {
            this.wave.push(a);
            return this;
        }
        get() {
            return this.wave.map((d) => d.get());
        }
        clone() {
            let _c = new Wave();
            _c.wave = this.wave.map((d) => d.clone());
            return _c;
        }
    }

    class Stream {
        constructor() {
            this.data = new Data();
            this.datasets = new Datasets();
            this.transform = new Transform();
            this.synth = new Synth();
            this.sampling = new Sampling();
            this.wave = new Wave();
            this.tone = new Tone();
            this.tick = new TickList();
            this.encoding = {
                [TIME_chn]: new TimeChannel(),
                [TIME2_chn]: new Time2Channel(),
                [DUR_chn]: new DurationChannel(),
                [TAPCNT_chn]: new TapCountChannel(),
                [TAPSPD_chn]: new TapSpeedChannel(),
                [POST_REVERB_chn]: new PostReverbChannel(),
                [PITCH_chn]: new PitchChannel(),
                [DETUNE_chn]: new DetuneChannel(),
                [LOUDNESS_chn]: new LoudnessChannel(),
                [PAN_chn]: new PanChannel(),
                [SPEECH_BEFORE_chn]: new SpeechBeforeChannel(),
                [SPEECH_AFTER_chn]: new SpeechAfterChannel(),
                [TIMBRE_chn]: new TimbreChannel(),
                [REPEAT_chn]: new RepeatChannel(),
                [MODULATION_chn]: new ModulationChannel(),
                [HARMONICITY_chn]: new HarmonicityChannel()
            };
            this.config = new Config();
        }
        name(n) {
            this._name = n;
            return this;
        }
        title(n) {
            this._title = n;
            return this;
        }
        description(n) {
            this._description = n;
            return this;
        }
        get() {
            var _a, _b, _d, _e, _f, _g, _h, _j, _k;
            let g = {
                name: this._name,
                title: this._title,
                description: this._description,
                data: (_a = this.data) === null || _a === void 0 ? void 0 : _a.get(),
                datasets: (_b = this.datasets) === null || _b === void 0 ? void 0 : _b.get(),
                transform: (_d = this.transform) === null || _d === void 0 ? void 0 : _d.get(),
                tick: (_e = this.tick) === null || _e === void 0 ? void 0 : _e.get(),
                synth: (_f = this.synth) === null || _f === void 0 ? void 0 : _f.get(),
                sampling: (_g = this.sampling) === null || _g === void 0 ? void 0 : _g.get(),
                wave: (_h = this.wave) === null || _h === void 0 ? void 0 : _h.get(),
                tone: (_j = this.tone) === null || _j === void 0 ? void 0 : _j.get(),
                encoding: {},
                config: (_k = this.config) === null || _k === void 0 ? void 0 : _k.get()
            };
            Object.keys(this.encoding).forEach((chn) => {
                if (this.encoding[chn].defined) {
                    g.encoding[chn] = this.encoding[chn].get();
                }
            });
            return g;
        }
        clone() {
            var _a, _b, _d, _e, _f, _g;
            let _c = new Stream();
            _c._name = this._name;
            _c._title = this._title;
            _c._description = this._description;
            _c.data = this.data.clone();
            _c.datasets = (_a = this.datasets) === null || _a === void 0 ? void 0 : _a.clone();
            _c.transform = (_b = this.transform) === null || _b === void 0 ? void 0 : _b.clone();
            _c.synth = (_d = this.synth) === null || _d === void 0 ? void 0 : _d.clone();
            _c.sampling = (_e = this.sampling) === null || _e === void 0 ? void 0 : _e.clone();
            _c.wave = (_f = this.wave) === null || _f === void 0 ? void 0 : _f.clone();
            _c.tone = this.tone.clone();
            _c.encoding = {};
            Object.keys(this.encoding).forEach((chn) => {
                if (this.encoding[chn].defined) {
                    _c.encoding[chn] = this.encoding[chn].clone();
                }
            });
            _c.config = (_g = this.config) === null || _g === void 0 ? void 0 : _g.clone();
            return _c;
        }
    }

    class Overlay {
        constructor(...a) {
            let args = [...a];
            if (isInstanceOf(args[0], String)) {
                this._name = args[0];
                args.splice(0, 1);
            }
            this.overlay = [];
            if (isArrayOf(args[0], Stream)) {
                this.addStreams(args[0]);
            }
            else if (isArrayOf(args, Stream)) {
                this.addStreams(args);
            }
            this.datasets = new Datasets();
            this.transform = new Transform();
            this.data = new Data();
            this.sampling = new Sampling();
            this.synth = new Synth();
            this.wave = new Wave();
            this.tick = new TickList();
            this.config = new Config();
        }
        name(n) {
            this._name = n;
            return this;
        }
        title(n) {
            this._title = n;
            return this;
        }
        description(n) {
            this._description = n;
            return this;
        }
        stream(i) {
            return this.overlay[i];
        }
        remove(i) {
            this.overlay.splice(i, 1);
            return this;
        }
        add(s) {
            var _a, _b, _d, _e, _f;
            if (isInstanceOf(s, Stream)) {
                let clone = s.clone();
                // datasets
                let cloned_datasets = clone.datasets;
                if (cloned_datasets && cloned_datasets.datasets.length > 0) {
                    for (const ds of cloned_datasets.datasets) {
                        (_a = this.datasets) === null || _a === void 0 ? void 0 : _a.add(ds);
                    }
                }
                delete clone.datasets;
                // tick
                let cloned_ticks = clone.tick;
                if (cloned_ticks && cloned_ticks.tick.length > 0) {
                    for (const ds of cloned_ticks.tick) {
                        (_b = this.tick) === null || _b === void 0 ? void 0 : _b.add(ds);
                    }
                }
                delete clone.tick;
                // sampling
                let cloned_samples = clone.sampling;
                if (cloned_samples && cloned_samples.sampling.length > 0) {
                    for (const ds of cloned_samples.sampling) {
                        (_d = this.sampling) === null || _d === void 0 ? void 0 : _d.add(ds);
                    }
                }
                delete clone.sampling;
                // synth
                let cloned_synths = clone.synth;
                if (cloned_synths && cloned_synths.synth.length > 0) {
                    for (const ds of cloned_synths.synth) {
                        (_e = this.synth) === null || _e === void 0 ? void 0 : _e.add(ds);
                    }
                }
                delete clone.synth;
                // wave
                let cloned_waves = clone.wave;
                if (cloned_waves && cloned_waves.wave.length > 0) {
                    for (const ds of cloned_waves.wave) {
                        (_f = this.wave) === null || _f === void 0 ? void 0 : _f.add(ds);
                    }
                }
                delete clone.wave;
                this.overlay.push(clone);
            }
            return this;
        }
        addStreams(ss) {
            for (const s of ss) {
                this.add(s);
            }
            return this;
        }
        get() {
            var _a, _b, _d, _e, _f, _g, _h, _j;
            let g = {
                name: this._name,
                title: this._title,
                description: this._description,
                data: (_a = this.data) === null || _a === void 0 ? void 0 : _a.get(),
                datasets: (_b = this.datasets) === null || _b === void 0 ? void 0 : _b.get(),
                transform: (_d = this.transform) === null || _d === void 0 ? void 0 : _d.get(),
                tick: (_e = this.tick) === null || _e === void 0 ? void 0 : _e.get(),
                synth: (_f = this.synth) === null || _f === void 0 ? void 0 : _f.get(),
                sampling: (_g = this.sampling) === null || _g === void 0 ? void 0 : _g.get(),
                wave: (_h = this.wave) === null || _h === void 0 ? void 0 : _h.get(),
                overlay: this.overlay.map((d) => d.get()),
                config: (_j = this.config) === null || _j === void 0 ? void 0 : _j.get()
            };
            return g;
        }
        clone() {
            var _a, _b, _d, _e, _f, _g, _h;
            let _c = new Overlay();
            _c._name = this._name;
            _c._title = this._title;
            _c._description = this._description;
            _c.data = (_a = this.data) === null || _a === void 0 ? void 0 : _a.clone();
            _c.datasets = (_b = this.datasets) === null || _b === void 0 ? void 0 : _b.clone();
            _c.transform = (_d = this.transform) === null || _d === void 0 ? void 0 : _d.clone();
            _c.synth = (_e = this.synth) === null || _e === void 0 ? void 0 : _e.clone();
            _c.sampling = (_f = this.sampling) === null || _f === void 0 ? void 0 : _f.clone();
            _c.wave = (_g = this.wave) === null || _g === void 0 ? void 0 : _g.clone();
            _c.overlay = this.overlay.map((d) => d.clone());
            _c.config = (_h = this.config) === null || _h === void 0 ? void 0 : _h.clone();
            return _c;
        }
    }

    class Sequence {
        constructor(...a) {
            let args = [...a];
            if (isInstanceOf(args[0], String)) {
                this._name = args[0];
                args.splice(0, 1);
            }
            this.sequence = [];
            if (isArrayOf(args[0], [Stream, Overlay])) {
                this.addStreams(args[0]);
            }
            else if (isArrayOf(args, [Stream, Overlay])) {
                this.addStreams(args);
            }
            this.datasets = new Datasets();
            this.transform = new Transform();
            this.data = new Data();
            this.sampling = new Sampling();
            this.synth = new Synth();
            this.wave = new Wave();
            this.tick = new TickList();
            this.config = new Config();
        }
        name(n) {
            this._name = n;
            return this;
        }
        title(n) {
            this._title = n;
            return this;
        }
        description(n) {
            this._description = n;
            return this;
        }
        stream(i) {
            return this.sequence[i];
        }
        remove(i) {
            this.sequence.splice(i, 1);
            return this;
        }
        add(s) {
            var _a, _b, _d, _e, _f;
            if (isInstanceOf(s, Stream) || isInstanceOf(s, Overlay)) {
                let clone = s.clone();
                // datasets
                let cloned_datasets = clone.datasets;
                if (cloned_datasets && cloned_datasets.datasets.length > 0) {
                    for (const ds of cloned_datasets.datasets) {
                        (_a = this.datasets) === null || _a === void 0 ? void 0 : _a.add(ds);
                    }
                }
                delete clone.datasets;
                // tick
                let cloned_ticks = clone.tick;
                if (cloned_ticks && cloned_ticks.tick.length > 0) {
                    for (const ds of cloned_ticks.tick) {
                        (_b = this.tick) === null || _b === void 0 ? void 0 : _b.add(ds);
                    }
                }
                delete clone.tick;
                // sampling
                let cloned_samples = clone.sampling;
                if (cloned_samples && cloned_samples.sampling.length > 0) {
                    for (const ds of cloned_samples.sampling) {
                        (_d = this.sampling) === null || _d === void 0 ? void 0 : _d.add(ds);
                    }
                }
                delete clone.sampling;
                // synth
                let cloned_synths = clone.synth;
                if (cloned_synths && cloned_synths.synth.length > 0) {
                    for (const ds of cloned_synths.synth) {
                        (_e = this.synth) === null || _e === void 0 ? void 0 : _e.add(ds);
                    }
                }
                delete clone.synth;
                // wave
                let cloned_waves = clone.wave;
                if (cloned_waves && cloned_waves.wave.length > 0) {
                    for (const ds of cloned_waves.wave) {
                        (_f = this.wave) === null || _f === void 0 ? void 0 : _f.add(ds);
                    }
                }
                delete clone.wave;
                this.sequence.push(clone);
            }
            return this;
        }
        addStreams(ss) {
            for (const s of ss) {
                this.add(s);
            }
            return this;
        }
        get() {
            var _a, _b, _d, _e, _f, _g, _h, _j;
            let g = {
                name: this._name,
                title: this._title,
                description: this._description,
                data: (_a = this.data) === null || _a === void 0 ? void 0 : _a.get(),
                datasets: (_b = this.datasets) === null || _b === void 0 ? void 0 : _b.get(),
                transform: (_d = this.transform) === null || _d === void 0 ? void 0 : _d.get(),
                tick: (_e = this.tick) === null || _e === void 0 ? void 0 : _e.get(),
                synth: (_f = this.synth) === null || _f === void 0 ? void 0 : _f.get(),
                sampling: (_g = this.sampling) === null || _g === void 0 ? void 0 : _g.get(),
                wave: (_h = this.wave) === null || _h === void 0 ? void 0 : _h.get(),
                sequence: this.sequence.map((d) => d.get()),
                config: (_j = this.config) === null || _j === void 0 ? void 0 : _j.get()
            };
            return g;
        }
        clone() {
            var _a, _b, _d, _e, _f, _g, _h;
            let _c = new Sequence();
            _c._name = this._name;
            _c._title = this._title;
            _c._description = this._description;
            _c.data = (_a = this.data) === null || _a === void 0 ? void 0 : _a.clone();
            _c.datasets = (_b = this.datasets) === null || _b === void 0 ? void 0 : _b.clone();
            _c.transform = (_d = this.transform) === null || _d === void 0 ? void 0 : _d.clone();
            _c.synth = (_e = this.synth) === null || _e === void 0 ? void 0 : _e.clone();
            _c.sampling = (_f = this.sampling) === null || _f === void 0 ? void 0 : _f.clone();
            _c.wave = (_g = this.wave) === null || _g === void 0 ? void 0 : _g.clone();
            _c.sequence = this.sequence.map((d) => d.clone());
            _c.config = (_h = this.config) === null || _h === void 0 ? void 0 : _h.clone();
        }
    }

    class Aggregate {
        constructor() {
            this.aggregate = [];
            this._groupby = [];
        }
        add(op, field, as, p) {
            if (ZeroOPs.includes(op)) {
                if ((field === null || field === void 0 ? void 0 : field.constructor.name) !== 'String') {
                    throw new Error('"as" is not provided.');
                }
                this.aggregate.push({
                    op, as: field
                });
            }
            else if (SingleOps.includes(op)) {
                if (field === undefined || (field === null || field === void 0 ? void 0 : field.constructor.name) !== 'String') {
                    throw new Error('"field" is not properly provided.');
                }
                if (as === undefined || (as === null || as === void 0 ? void 0 : as.constructor.name) !== 'String') {
                    throw new Error('"as" is not properly provided.');
                }
                if (op === QUANTILE) {
                    if (p === undefined) {
                        console.warn('p is not provided, so is set as 0.5.');
                        p = 0.5;
                    }
                    this.aggregate.push({
                        op, field, as, p
                    });
                }
                else {
                    this.aggregate.push({
                        op, field, as
                    });
                }
            }
            else if (DoubleOps.includes(op)) {
                if (field === undefined ||
                    (field === null || field === void 0 ? void 0 : field.constructor.name) !== 'Array' ||
                    (field === null || field === void 0 ? void 0 : field.length) != 2 ||
                    !field.every(f => (f === null || f === void 0 ? void 0 : f.constructor.name) !== 'String')) {
                    throw new Error('"field" is not properly provided.');
                }
                if (as === undefined || (as === null || as === void 0 ? void 0 : as.constructor.name) !== 'String') {
                    throw new Error('"as" is not properly provided.');
                }
                this.aggregate.push({
                    op, field: [...field], as
                });
            }
            else {
                throw new Error(`Unsupported operation type: ${op}`);
            }
            return this;
        }
        groupby(...args) {
            // this function resets groupby
            if (args.length == 1 &&
                args[0].constructor.name === 'Array' &&
                args[0].every((a) => a.constructor.name === 'String')) {
                this._groupby = [...args[0]];
            }
            else if (args.length >= 1 &&
                args.every((a) => a.constructor.name === 'String')) {
                this._groupby = [...args];
            }
            return this;
        }
        get() {
            return {
                aggregate: deepcopy(this.aggregate),
                groupby: deepcopy(this._groupby)
            };
        }
        clone() {
            let _c = new Aggregate();
            _c.aggregate = deepcopy(this.aggregate);
            _c._groupby = deepcopy(this._groupby);
            return _c;
        }
    }

    class Bin {
        constructor(bin) {
            this._bin = bin;
            this._as = bin + "__bin";
            this._end = bin + "__bin_end";
            this._nice = true;
            this._maxbins = 10;
            this._step;
            this._exact;
        }
        as(start, end) {
            this._as = start;
            this._end = end;
            return this;
        }
        nice(v) {
            this._nice = v;
            return this;
        }
        maxbins(v) {
            if (Math.round(v) == v) {
                this._maxbins = v;
            }
            else {
                throw new TypeError("Bin 'maxbins' should be an integer.");
            }
            return this;
        }
        step(v) {
            this._step = v;
            return this;
        }
        exact(v) {
            this._exact = v;
            return this;
        }
        get() {
            return {
                bin: this._bin,
                as: this._as,
                end: this._end,
                nice: this._nice,
                maxbins: this._maxbins,
                step: this._step,
                exact: deepcopy(this._exact)
            };
        }
        clone() {
            let _c = new Bin(this._bin);
            _c._as = this._as;
            _c._end = this._end;
            _c._nice = this._nice;
            _c._maxbins = this._maxbins;
            _c._step = this._step;
            _c._exact = this._exact ? [...this._exact] : undefined;
            return _c;
        }
    }

    class Calculate {
        constructor(c, a) {
            this._calculate = c;
            this._as = a;
        }
        calculate(c) {
            this._calculate = c;
            return this;
        }
        as(c) {
            this._as = c;
            return this;
        }
        get() {
            return {
                calculate: this._calculate,
                as: this._as
            };
        }
        clone() {
            let _c = new Calculate(this._calculate, this._as);
            return _c;
        }
    }

    class Density {
        constructor(field) {
            this._density = field;
            this._cumulative = false;
            this._counts = false;
            this._bandwidth;
            this._extent;
            this._minsteps = 25;
            this._maxsteps = 200;
            this._steps;
            this._as = ['value', 'density'];
        }
        field(f) {
            this._density = f;
            return this;
        }
        extent(a) {
            if (a.length == 2) {
                this._extent = [...a];
            }
            else {
                throw new TypeError("Density 'extent' should be an Array of two Numbers.");
            }
            return this;
        }
        groupby(g) {
            this._groupby = [...g];
            return this;
        }
        cumulative(v) {
            this._cumulative = v;
            return this;
        }
        counts(v) {
            this._counts = v;
            return this;
        }
        bandwidth(v) {
            this._bandwidth = v;
            return this;
        }
        minsteps(v) {
            this._minsteps = v;
            return this;
        }
        maxsteps(v) {
            this._maxsteps = v;
            return this;
        }
        steps(v) {
            this._steps = v;
            return this;
        }
        as(a) {
            if (a.length == 2) {
                this._as = [a[0], a[1]];
            }
            else {
                throw new TypeError("Density 'as' should be an Array of two Strings.");
            }
            return this;
        }
        get() {
            return {
                density: this._density,
                extent: this._extent ? [...this._extent] : undefined,
                groupby: this._groupby ? [...this._groupby] : undefined,
                cumulative: this._cumulative,
                counts: this._counts,
                bandwidth: this._bandwidth,
                minsteps: this._minsteps,
                maxsteps: this._maxsteps,
                steps: this._steps,
                as: [...this._as]
            };
        }
        clone() {
            let _c = new Density(this._density);
            _c._density = this._density;
            _c._extent = this._extent ? [...this._extent] : undefined;
            _c._groupby = this._groupby ? [...this._groupby] : undefined;
            _c._cumulative = this._cumulative;
            _c._counts = this._counts;
            _c._bandwidth = this._bandwidth;
            _c._minsteps = this._minsteps;
            _c._maxsteps = this._maxsteps;
            _c._steps = this._steps;
            _c._as = [...this._as];
            return _c;
        }
    }

    class Filter {
        constructor(filter) {
            this._filter = filter;
        }
        filter(f) {
            this._filter = f;
            return this;
        }
        get() {
            return {
                filter: this._filter
            };
        }
        clone() {
            let _c = new Filter(this._filter);
            return _c;
        }
    }

    class Fold {
        constructor(f, b) {
            this._fold = f;
            this._by = b;
            this._exclude = false;
            this._as = ['key', 'value'];
        }
        fold(f) {
            this._fold = [...f];
            return this;
        }
        by(b) {
            this._by = b;
            return this;
        }
        exclude(e) {
            this._exclude = e;
            return this;
        }
        as(a) {
            if (a.length == 2) {
                this._as = [a[0], a[1]];
            }
            else {
                throw new TypeError("Fold 'fold' should be an Array of two Strings.");
            }
            return this;
        }
        get() {
            return {
                fold: this._fold,
                by: this._by,
                exclude: this._exclude,
                as: this._as
            };
        }
        clone() {
            let _c = new Fold(this._fold, this._by);
            _c._exclude = this._exclude;
            if (this._as)
                _c._as = deepcopy(this._as);
            return _c;
        }
    }

    // The below code is adopted from: https://russellgood.com/how-to-convert-audiowaveBuffer-to-audio-file/
    function makeWaveFromBuffer(buffer, ext) {
        return __awaiter(this, void 0, void 0, function* () {
            let nChannels = buffer.numberOfChannels, samples = buffer.length, sampleRate = buffer.sampleRate, waveLength = samples * nChannels * 2 + 44, waveBuffer = new ArrayBuffer(waveLength), view = new DataView(waveBuffer), channelData = [];
            let offset = 0, viewPos = 0;
            // write WAVE header
            viewPos = setUint32(view, 0x46464952, viewPos); // "RIFF"
            viewPos = setUint32(view, waveLength - 8, viewPos); // file waveLength - 8
            viewPos = setUint32(view, 0x45564157, viewPos); // "WAVE"
            viewPos = setUint32(view, 0x20746d66, viewPos); // "fmt " chunk
            viewPos = setUint32(view, 16, viewPos); // waveLength = 16
            viewPos = setUint16(view, 1, viewPos); // PCM (uncompressed)
            viewPos = setUint16(view, nChannels, viewPos);
            viewPos = setUint32(view, sampleRate, viewPos);
            viewPos = setUint32(view, sampleRate * 2 * nChannels, viewPos); // avg. bytes/sec
            viewPos = setUint16(view, nChannels * 2, viewPos); // block-align
            viewPos = setUint16(view, 16, viewPos); // 16-bit (hardcoded in this demo)
            viewPos = setUint32(view, 0x61746164, viewPos); // "data" - chunk
            viewPos = setUint32(view, waveLength - viewPos - 4, viewPos); // chunk waveLength
            // write interleaved data
            for (let i = 0; i < nChannels; i++) {
                channelData.push(buffer.getChannelData(i));
            }
            while (viewPos < waveLength) {
                for (let i = 0; i < nChannels; i++) {
                    // interleave channelData
                    let sample = Math.max(-1, Math.min(1, channelData[i][offset])); // clamp
                    sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                    view.setInt16(viewPos, sample, true); // write 16-bit sample
                    viewPos += 2;
                }
                offset++; // next source sample
            }
            // create Blob
            // @ts-ignore
            let waveBlob = new Blob([waveBuffer], { type: "audio/wav" });
            if (ext === '$raw') {
                return waveBuffer;
            }
            else if (ext) {
                return new Blob([waveBlob], { type: "audio/" + (ext || "wav") });
            }
            else
                return waveBlob;
        });
    }
    function setUint16(view, data, viewPos) {
        view.setUint16(viewPos, data, true);
        viewPos += 2;
        return viewPos;
    }
    function setUint32(view, data, viewPos) {
        view.setUint32(viewPos, data, true);
        viewPos += 4;
        return viewPos;
    }

    const SampleRate = 44100, BufferChannels = 2;
    class AudioPrimitiveBuffer {
        constructor(length, sampleRate) {
            // in seconds
            this.length = length;
            this.sampleRate = sampleRate || SampleRate;
            this.compiled = false;
            this.compiledBuffer;
            this.primitive = [];
        }
        add(at, data) {
            this.primitive.push({ at, data });
        }
        compile() {
            return __awaiter(this, void 0, void 0, function* () {
                let maxChannels = Math.max(...this.primitive.map((p) => p.data.numberOfChannels || BufferChannels)) || BufferChannels;
                if (maxChannels < 1)
                    maxChannels = BufferChannels;
                else if (maxChannels > 32)
                    maxChannels = 32;
                let bufferLength = this.length ? this.length * this.sampleRate : this.primitive.map((p) => p.data.length).reduce((a, c) => a + c, 0);
                if (bufferLength == 0)
                    bufferLength = this.sampleRate * 0.1;
                let temp_ctx = new AudioContext();
                this.compiledBuffer = temp_ctx.createBuffer(maxChannels, bufferLength, this.sampleRate);
                let lastAt;
                for (const p of this.primitive) {
                    let at = p.at === "next" ? (lastAt || 0) : Math.round((p.at || 0) * 44100);
                    for (let i = 0; i < maxChannels; i++) {
                        let channelData = this.compiledBuffer.getChannelData(i);
                        let currChannelData = p.data.getChannelData(i % p.data.numberOfChannels);
                        currChannelData.forEach((q, k) => {
                            channelData[at + k] += q;
                        });
                    }
                    lastAt = at + p.data.length;
                }
                this.compiled = true;
                return this.compiledBuffer;
            });
        }
    }
    function concatenateBuffers(buffers) {
        let totalLength = buffers.map((d) => (d === null || d === void 0 ? void 0 : d.length) || 0).reduce((a, c) => a + c, 0);
        let ctx = new AudioContext();
        let totalBuffer = ctx.createBuffer(2, totalLength, ctx.sampleRate);
        let view = 0;
        for (const buffer of buffers) {
            for (let i = 0; i < 2; i++) {
                let channelData = totalBuffer.getChannelData(i);
                let currChannelData = buffer.numberOfChannels == 1 ? buffer.getChannelData(0) : buffer.getChannelData(i);
                for (let j = 0; j < buffer.length; j++) {
                    channelData[view + j] = currChannelData[j];
                }
            }
            view += buffer.length;
        }
        return totalBuffer;
    }

    const channels = 2;
    // TODO
    function generatePCMCode(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            // currently only support sine wave
            // this is an experimental feature. currently only works for non-overlaid tone-series queues.
            // queue: a discrete or continous queue data
            // supported channels: time, pitch, loudness, pan
            let ctx = new AudioContext();
            let sampleRate = ctx.sampleRate;
            let queues = [];
            if (isToneSeriesQueueItem(queue)) {
                queues.push(queue);
            }
            else if (isToneOverlaySeriesQueueItem(queue)) {
                queues.push(...queue.overlays);
            }
            let queue_lengths = queues.map((q) => Math.max(...q.sounds.map((d) => getEndTime1(d) + (d.postReverb || 0))));
            let length = Math.max(...queue_lengths);
            let frameCount = sampleRate * length;
            let buffer = ctx.createBuffer(channels, frameCount, sampleRate);
            let channel0 = buffer.getChannelData(0);
            let channel1 = buffer.getChannelData(1);
            for (let i = 0; i < frameCount; i++) {
                channel0[i] = 0;
                channel1[i] = 0;
            }
            for (const queue of queues) {
                let sounds = queue.sounds;
                if (!queue.continued) {
                    // discrete sounds
                    for (const sound of sounds) {
                        let f = getStartTime1(sound) * sampleRate, t = (getEndTime1(sound) + ((_a = sound.postReverb) !== null && _a !== void 0 ? _a : 0)) * sampleRate;
                        let length = t - f;
                        let data = populatePCMforFreq(((_b = sound.pitch) !== null && _b !== void 0 ? _b : DefaultFrequency), length, sampleRate);
                        let gain = sound.loudness;
                        if (gain === undefined)
                            gain = 1;
                        let pan = sound.pan;
                        if (pan === undefined)
                            pan = 0;
                        let LRgain = getLRgain(pan);
                        for (let i = 0; i < length; i++) {
                            channel0[f + i] += data[i] * gain * LRgain[0];
                            channel1[f + i] += data[i] * gain * LRgain[1];
                        }
                    }
                }
                else {
                    // continous sound
                    let ramp_pan = getRampFunction((_c = queue.ramp) === null || _c === void 0 ? void 0 : _c.pan), ramp_gain = getRampFunction((_d = queue.ramp) === null || _d === void 0 ? void 0 : _d.loudness);
                    if (ramp_pan instanceof Function && ramp_gain instanceof Function) {
                        sounds.sort((a, b) => getStartTime1(a) - getStartTime1(b));
                        let acc_prev = 0;
                        for (let i = 0; i < sounds.length - 1; i++) {
                            let sound = sounds[i], next_sound = sounds[i + 1];
                            let f = Math.round(getStartTime1(sound) * sampleRate), t = Math.round(getStartTime1(next_sound) * sampleRate);
                            let length = t - f;
                            let pcm_pop = populatePCMforFreqRamp(((_e = sound.pitch) !== null && _e !== void 0 ? _e : DefaultFrequency), ((_f = next_sound.pitch) !== null && _f !== void 0 ? _f : DefaultFrequency), (_g = queue.ramp) === null || _g === void 0 ? void 0 : _g.pitch, acc_prev, length, sampleRate);
                            if (pcm_pop) {
                                let data = pcm_pop === null || pcm_pop === void 0 ? void 0 : pcm_pop.data, acc = pcm_pop === null || pcm_pop === void 0 ? void 0 : pcm_pop.acc;
                                acc_prev = acc;
                                let f_gain = sound.loudness;
                                if (f_gain === undefined)
                                    f_gain = 1;
                                let f_pan = sound.pan;
                                if (f_pan === undefined)
                                    f_pan = 0;
                                let t_gain = sound.loudness;
                                if (t_gain === undefined)
                                    t_gain = 1;
                                let t_pan = sound.pan;
                                if (t_pan === undefined)
                                    t_pan = 0;
                                for (let j = 0; j < length; j++) {
                                    let rpi = data[j];
                                    let rga = ramp_gain(f_gain, t_gain, j / length);
                                    let rpa = ramp_pan(f_pan, t_pan, j / length);
                                    let LRgain = getLRgain(rpa);
                                    channel0[f + j] += rpi * rga * LRgain[0];
                                    channel1[f + j] += rpi * rga * LRgain[1];
                                }
                            }
                        }
                    }
                }
            }
            return buffer;
        });
    }
    function populatePCMforFreq(pitch, frameCount, sampleRate) {
        let data = new Float32Array(frameCount);
        let cycle = pitch == 0 ? 0 : sampleRate / pitch;
        for (let i = 0; i < frameCount; i++) {
            data[i] = Math.sin(2 * Math.PI / cycle * i);
        }
        return data;
    }
    function populatePCMforFreqRamp(pitch_from, pitch_to, ramp, acc, frameCount, sampleRate) {
        if (ramp === "abrupt" || ramp === false) {
            return { data: populatePCMforFreq(pitch_from, frameCount, sampleRate), acc: 0 };
        }
        else if (ramp === "linear" || ramp === true || ramp === undefined) {
            let data = new Float32Array(frameCount);
            let cycle_from = pitch_from == 0 ? 0 : sampleRate / pitch_from, cycle_to = pitch_to == 0 ? 0 : sampleRate / pitch_to;
            let cycles = Array(frameCount).fill(cycle_from).map((_, i) => {
                return cycle_from + ((cycle_to - cycle_from) / (frameCount - 1) * i);
            });
            for (let i = 0; i < frameCount; i++) {
                acc += 2 * Math.PI / cycles[i];
                if (Math.sin(acc) == 0)
                    acc = 0;
                data[i] = Math.sin(acc);
            }
            return { data, acc };
        }
        else if (ramp === "exponential") {
            let data = new Float32Array(frameCount);
            let cycle_from = sampleRate / pitch_from, cycle_to = sampleRate / pitch_to;
            let cycles = Array(frameCount).fill(cycle_from).map((_, i) => {
                return (cycle_to - cycle_from) * Math.exp(i / frameCount) + cycle_from;
            });
            for (let i = 0; i < frameCount; i++) {
                acc += 2 * Math.PI / cycles[i];
                if (Math.sin(acc) == 0)
                    acc = 0;
                data[i] = Math.sin(acc);
            }
            return { data, acc };
        }
    }
    function getLRgain(pan) {
        let panp = Math.PI * (pan + 1) / 4;
        return [Math.cos(panp), Math.sin(panp)];
    }
    function getRampFunction(ramp) {
        if (ramp === "linear" || ramp === true || ramp === undefined) {
            return (a, b, r) => { return a * (1 - r) + b * r; };
        }
        else if (ramp === "abrupt" || ramp === false) {
            return (a, _, __) => { return a; };
        }
        else if (ramp === "exponential") {
            return (a, b, r) => {
                return (b - a) * Math.exp(r) + a;
            };
        }
        else {
            console.error("Unsupported Ramp Method.");
        }
    }

    function playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // if it is from a discrete series and being stopped, then do nothing
            if ((config === null || config === void 0 ? void 0 : config.subpart) && isErieGlobalState(Stopped))
                return;
            // if it is an individual play (not from a discrete series)
            if (!(config === null || config === void 0 ? void 0 : config.subpart))
                setErieGlobalState(undefined);
            // clear previous state
            setErieGlobalState(undefined);
            // set audio context controls
            setErieGlobalControl({ type: ToneType, player: ctx });
            let sid;
            // if it is an individual play (not from a discrete series), fire a new tone start event
            if (!config.subpart) {
                sid = genRid();
                sendToneStartEvent({ sid });
            }
            if (sound.tap !== undefined && ((_b = (_a = sound.tap) === null || _a === void 0 ? void 0 : _a.pattern) === null || _b === void 0 ? void 0 : _b.constructor.name) === "Array") {
                let ct = (config === null || config === void 0 ? void 0 : config.context_time) !== undefined ? config.context_time : setCurrentTime(ctx);
                let tapSound = deepcopy(sound);
                let t = 1, acc = 0, i = 0; // d
                if (sound.tap.pattern.length == 0) {
                    yield playPause((sound.duration || 0.2) * 1000);
                    sendToneFinishEvent({ sid });
                }
                emitNotePlayEvent('tone', sound);
                for (const s of sound.tap.pattern) {
                    if (t === 1) {
                        tapSound.duration = s;
                        if (s > 0) {
                            yield __playSingleTone(ctx, ct + acc, tapSound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
                        }
                        t = 0;
                    }
                    else {
                        yield playPause(s * 1000);
                        t = 1;
                    }
                    acc += s;
                    i++;
                    if (i == sound.tap.pattern.length) {
                        if (!config.subpart) {
                            sendToneFinishEvent({ sid });
                        }
                    }
                }
                emitNoteStopEvent('tone', sound);
                return;
            }
            else {
                let ct = (config === null || config === void 0 ? void 0 : config.context_time) !== undefined ? config.context_time : setCurrentTime(ctx);
                emitNotePlayEvent('tone', sound);
                yield __playSingleTone(ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
                emitNoteStopEvent('tone', sound);
                if (!config.subpart) {
                    sendToneFinishEvent({ sid });
                }
                return;
            }
        });
    }
    function __playSingleTone(_ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            // filters
            let ctx = _ctx, offline = false;
            if (((_a = bufferPrimitve === null || bufferPrimitve === void 0 ? void 0 : bufferPrimitve.constructor) === null || _a === void 0 ? void 0 : _a.name) === AudioPrimitiveBuffer.name) {
                offline = true;
                ctx = makeOfflineContext((_b = sound.duration) !== null && _b !== void 0 ? _b : 0);
                ct = 0;
            }
            let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
            for (const filterName of filters) {
                if (PresetFilters[filterName]) {
                    filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
                    filterEncoders[filterName] = PresetFilters[filterName].encoder;
                    filterFinishers[filterName] = PresetFilters[filterName].finisher;
                }
                else if (ErieFilters[filterName]) {
                    filterNodes[filterName] = new ErieFilters[filterName].filter(ctx);
                    filterEncoders[filterName] = ErieFilters[filterName].encoder;
                    filterFinishers[filterName] = ErieFilters[filterName].finisher;
                }
            }
            let destination = ctx.destination;
            for (const filterName of filters) {
                let filter = filterNodes[filterName];
                if (filter) {
                    filter.connect(destination);
                    filter.initialize(ct, sound.duration);
                    destination = filter.destination;
                }
            }
            // gain == loudness
            const gain = ctx.createGain();
            gain.connect(destination);
            // streo panner == pan
            const panner = ctx.createStereoPanner();
            panner.connect(gain);
            // play as async promise
            // get the current time
            // get discrete oscillator
            let iType = sound.timbre || (config === null || config === void 0 ? void 0 : config.instrument_type);
            const inst = makeInstrument(ctx, iType, instSamples, synthDefs, waveDefs, sound);
            inst.connect(panner);
            // set auditory values
            if (inst instanceof OscillatorNode) {
                rampBy('setValueAtTime', inst.frequency, (_c = sound.pitch) !== null && _c !== void 0 ? _c : DefaultFrequency, ct);
            }
            else if (inst instanceof ErieSynth) {
                rampBy('setValueAtTime', inst.frequency, (_e = (_d = sound.pitch) !== null && _d !== void 0 ? _d : inst.carrierPitch) !== null && _e !== void 0 ? _e : DefaultFrequency, ct);
                if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
                    rampBy('setValueAtTime', inst.modulator.frequency, (inst.modulatorVolume / sound.modulation), ct);
                }
                else if (inst.type === AM && sound.modulation !== undefined && sound.modulation > 0) {
                    rampBy('setValueAtTime', inst.modulatorGain.gain, (sound.loudness || 1) * sound.modulation, ct);
                }
                if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
                    inst.modulator.frequency.cancelScheduledValues(ct);
                    rampBy('setValueAtTime', inst.modulator.frequency, ((_g = (_f = sound.pitch) !== null && _f !== void 0 ? _f : inst.carrierPitch) !== null && _g !== void 0 ? _g : DefaultFrequency) * sound.harmonicity, ct);
                }
                else if (sound.harmonicity === undefined) {
                    inst.modulator.frequency.cancelScheduledValues(ct);
                    rampBy('setValueAtTime', inst.modulator.frequency, sound.pitch, ct);
                }
                inst.envelope.gain.cancelScheduledValues(ct);
                rampBy('setValueAtTime', inst.envelope.gain, 0, ct);
                rampBy('linearRampToValueAtTime', inst.envelope.gain, 1, ct + (inst.attackTime || 0));
                if (inst.decayTime) {
                    // rampBy('linearRampToValueAtTime', inst.envelope.gain, inst.sustain || 1, ct + getStartTime1(sound) + inst.adTime);
                    rampBy('linearRampToValueAtTime', inst.envelope.gain, inst.sustain || 1, ct + inst.adTime);
                }
                rampBy('setValueAtTime', inst.envelope.gain, inst.sustain || 1, ct + ((_h = sound.duration) !== null && _h !== void 0 ? _h : 0));
                rampBy('linearRampToValueAtTime', inst.envelope.gain, 0, ct + ((_j = sound.duration) !== null && _j !== void 0 ? _j : 0) + inst.adTime);
            }
            if (sound.detune && 'detune' in inst && inst.detune) {
                rampBy('setValueAtTime', inst.detune, (_k = sound.detune) !== null && _k !== void 0 ? _k : 0, ct);
            }
            if (sound.loudness !== undefined) {
                rampBy('setValueAtTime', gain.gain, (_l = sound.loudness) !== null && _l !== void 0 ? _l : 1, ct);
            }
            if (sound.postReverb) {
                rampBy('setTargetAtTime', gain.gain, 0, ct + ((_m = sound.duration) !== null && _m !== void 0 ? _m : 0) * 0.95, 0.015);
                rampBy('setTargetAtTime', gain.gain, 0.45, ct + ((_o = sound.duration) !== null && _o !== void 0 ? _o : 0), 0.015);
                rampBy('exponentialRampToValueAtTime', gain.gain, 0.02, ct + (getDuration1(sound)) * 0.95);
            }
            else {
                sound.postReverb = 0;
            }
            let et = ct + ((_p = sound.duration) !== null && _p !== void 0 ? _p : 0) + ((_q = sound.postReverb) !== null && _q !== void 0 ? _q : 0);
            if (inst instanceof ErieSynth) {
                et += ((_r = inst.attackTime) !== null && _r !== void 0 ? _r : 0) + ((_s = inst.releaseTime) !== null && _s !== void 0 ? _s : 0);
            }
            for (const filterName of filters) {
                let encoder = filterEncoders[filterName];
                let finisher = filterFinishers[filterName];
                if (encoder) {
                    encoder(filterNodes[filterName], sound, ct);
                }
                if (finisher) {
                    // finisher(filterNodes[filterName], sound, ct + getStartTime1(sound), et);
                    finisher(filterNodes[filterName], sound, ct, et);
                }
            }
            rampBy('setTargetAtTime', gain.gain, 0, ct + (et - ct) * 0.95, 0.015);
            if (sound.pan !== undefined) {
                panner.pan.setValueAtTime(sound.pan, ct);
            }
            // play & stop
            if (offline && bufferPrimitve && ctx instanceof OfflineAudioContext) {
                inst.start(0);
                inst.stop(getDuration1(sound));
                let rb = yield ctx.startRendering();
                if (sound.time !== 'after_previous')
                    bufferPrimitve.add((_t = sound.time) !== null && _t !== void 0 ? _t : 0, rb);
                else
                    bufferPrimitve.add('next', rb);
            }
            else {
                return new Promise((resolve, reject) => {
                    inst.start(ct);
                    inst.onended = (_) => {
                        resolve();
                    };
                    inst.stop(ct + getDuration1(sound));
                });
            }
            return;
        });
    }

    const Def_Tick_Interval = 0.5, Def_Tick_Interval_Beat = 2, Def_Tick_Duration = 0.1, Def_Tick_Duration_Beat = 0.5, Def_Tick_Loudness = 0.4;
    function makeTick(ctx, def, duration) {
        // ticker definition;
        if (!def)
            return null;
        else if (duration) {
            let tickPattern = [];
            let interval = round(def.interval, -2);
            let tickDur = def.band;
            tickDur = round(tickDur, -2);
            let pause = interval - tickDur;
            let count = Math.floor(duration / interval);
            let totalTime = 0;
            if (def.playAtTime0 === undefined)
                def.playAtTime0 = true;
            if (def.playAtTime0) {
                tickPattern.push({ tick: tickDur });
                totalTime += tickDur;
            }
            for (let i = 0; i < count; i++) {
                tickPattern.push({ pause });
                tickPattern.push({ tick: tickDur });
                totalTime += pause + tickDur;
            }
            if (duration > totalTime) {
                tickPattern.push({ pause: duration - totalTime });
            }
            let tickInst = makeInstrument(ctx, 'default');
            if ('frequency' in tickInst)
                tickInst.frequency.value = 150;
            if (def.pitch && 'frequency' in tickInst)
                tickInst.frequency.value = def.pitch;
            if (def.oscType && 'type' in tickInst)
                tickInst.type = def.oscType;
            let gain = ctx.createGain();
            tickInst.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            let acc = 0;
            for (const p of tickPattern) {
                if (p.tick) {
                    gain.gain.setTargetAtTime(def.loudness || Def_Tick_Loudness, ctx.currentTime + acc, 0.015);
                    acc += p.tick;
                }
                else if (p.pause) {
                    gain.gain.setTargetAtTime(0, ctx.currentTime + acc, 0.015);
                    acc += p.pause;
                }
            }
            return tickInst;
        }
        return null;
    }
    function playTick(_ctx, def, duration, start, end, bufferPrimitve) {
        return __awaiter(this, void 0, void 0, function* () {
            let ctx = _ctx;
            if (bufferPrimitve)
                ctx = makeOfflineContext(duration);
            let tick = makeTick(ctx, def, duration);
            if (tick) {
                tick.start(start);
                tick.stop(end);
            }
            if (bufferPrimitve && ctx instanceof OfflineAudioContext) {
                let rb = yield ctx.startRendering();
                bufferPrimitve.add(start, rb);
            }
            return;
        });
    }

    function playAbsoluteDiscreteTonesAlt(ctx, queue, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
        return __awaiter(this, void 0, void 0, function* () {
            // clear previous state
            setErieGlobalState(undefined);
            // playing a series of discrete tones with an aboslute schedule
            // set audio context controls
            setErieGlobalControl({ type: ToneType, player: ctx });
            // sort queue to mark the last node for sequence end check
            let q0 = queue.toSorted(glyphSorterByStart);
            q0[0].isFirst = true;
            let q = q0.toSorted(glyphSorterByEnd);
            q[q.length - 1].isLast = true;
            config.subpart = true;
            let endTime = getEndTime1(q[q.length - 1]);
            // play as async promise
            let sid = genRid();
            sendToneStartEvent({ sid });
            // gain == loudness
            // for timing
            // let timingCtx = bufferPrimitve ? makeOfflineContext(endTime) : new AudioContext();
            let timingCtx = new AudioContext();
            const gain = timingCtx.createGain();
            gain.connect(timingCtx.destination);
            gain.gain.value = 0;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                // get the current time
                let ct = (config === null || config === void 0 ? void 0 : config.context_time) !== undefined ? config.context_time : setCurrentTime(ctx);
                // set and play sounds
                for (let sound of q) {
                    if (isErieGlobalState(Stopped)) {
                        // resolve();
                        break;
                    }
                    // get discrete oscillator
                    const inst = makeInstrument(timingCtx);
                    inst.connect(gain);
                    // play & stop
                    inst.start(ct + sound.time);
                    inst.stop(ct + sound.time + 0.01);
                    inst.onended = () => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        if ((config === null || config === void 0 ? void 0 : config.falseTiming) && isErieGlobalControlType(SpeechType)) {
                            (_b = (_a = window.ErieGlobalControl) === null || _a === void 0 ? void 0 : _a.player) === null || _b === void 0 ? void 0 : _b.cancel();
                        }
                        yield playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
                        if (sound.isLast) {
                            sendToneFinishEvent({ sid });
                            resolve();
                        }
                    });
                }
                if (config.tick) {
                    playTick(ctx, config.tick, endTime, ct + 0.01, ct + endTime + 0.01, bufferPrimitve);
                }
            }));
        });
    }

    function playAbsoluteContinuousTones(_ctx, queue, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            // clear previous state
            setErieGlobalState(undefined);
            // sort queue to mark the first and last node for sequence end check
            let q0 = queue.toSorted(glyphSorterByStart);
            q0[0].isFirst = true;
            let q = q0.toSorted(glyphSorterByEnd);
            q[q.length - 1].isLast = true;
            // get the last tone's finish time
            let endTime = getEndTime1(q[q.length - 1]);
            // get the context
            let ctx = _ctx, offline = false;
            if (((_a = bufferPrimitve === null || bufferPrimitve === void 0 ? void 0 : bufferPrimitve.constructor) === null || _a === void 0 ? void 0 : _a.name) === AudioPrimitiveBuffer.name) {
                offline = true;
                ctx = makeOfflineContext(endTime);
                bufferPrimitve.length = endTime;
            }
            // set audio context controls
            setErieGlobalControl({ type: ToneType, player: ctx });
            // rampers 
            let rampers = {};
            if (config.ramp) {
                Object.keys(config.ramp || {}).forEach((chn) => {
                    let name = config.ramp[chn] in RamperNames ? RamperNames[config.ramp[chn]] : undefined;
                    if (chn === TAPCNT_chn || chn === TAPSPD_chn) {
                        rampers.tap = name;
                    }
                    else {
                        rampers[chn] = name;
                    }
                });
            }
            // filters
            let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
            for (const filterName of filters) {
                if (filterName in PresetFilters && PresetFilters[filterName]) {
                    filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
                    filterEncoders[filterName] = PresetFilters[filterName].encoder;
                    filterFinishers[filterName] = PresetFilters[filterName].finisher;
                }
                else if ('filterName' in ErieFilters[filterName]) {
                    filterNodes[filterName] = new ErieFilters[filterName].filter(ctx);
                    filterEncoders[filterName] = ErieFilters[filterName].encoder;
                    filterFinishers[filterName] = ErieFilters[filterName].finisher;
                }
            }
            let destination = ctx.destination;
            for (const filterName of filters) {
                let filter = filterNodes[filterName];
                if (filter) {
                    filter.connect(destination);
                    filter.initialize(ctx.currentTime, endTime);
                    destination = filter.destination;
                }
            }
            // gain == loudness
            const gain = ctx.createGain();
            gain.connect(destination);
            // streo panner == pan
            const panner = ctx.createStereoPanner();
            panner.connect(gain);
            let sid = genRid();
            sendToneStartEvent({ sid });
            // play as async promise
            // get instrument
            const inst = makeInstrument(ctx, config === null || config === void 0 ? void 0 : config.instrument_type, instSamples, synthDefs, waveDefs, q[0], endTime);
            inst.connect(panner);
            let startTime;
            // get the current time
            let ct = (config === null || config === void 0 ? void 0 : config.context_time) !== undefined ? config.context_time : setCurrentTime(ctx);
            for (let sound of q) {
                let st = ct + getStartTime1(sound), base_et = ct + getEndTime1(sound);
                // sampled tone pitch is already set when the instrument was created + they can't compose a continuous tone.
                if (inst instanceof OscillatorNode) {
                    // osc pitch
                    rampBy(sound.isFirst ? 'setValueAtTime' : rampers.pitch, inst.frequency, (_b = sound.pitch) !== null && _b !== void 0 ? _b : DefaultFrequency, st);
                }
                else if (inst instanceof ErieSynth) {
                    // synth pitch
                    rampBy(sound.isFirst ? 'setValueAtTime' : rampers.pitch, inst.frequency, (_c = sound.pitch) !== null && _c !== void 0 ? _c : DefaultFrequency, st);
                    // modulation
                    if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
                        rampBy(sound.isFirst ? 'setValueAtTime' : rampers.modulation, inst.modulator.frequency, (inst.modulatorVolume / sound.modulation), st);
                    }
                    else if (inst.type === AM && sound.modulation !== undefined) {
                        rampBy(sound.isFirst ? 'setValueAtTime' : rampers.modulation, inst.modulatorGain.gain, ((_d = sound.loudness) !== null && _d !== void 0 ? _d : 1) * sound.modulation, st);
                    }
                    // hamonicity
                    if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
                        rampBy(sound.isFirst ? 'setValueAtTime' : rampers.harmonicity, inst.modulator.frequency, ((_f = (_e = sound.pitch) !== null && _e !== void 0 ? _e : inst.carrierPitch) !== null && _f !== void 0 ? _f : DefaultFrequency) * sound.harmonicity, st);
                    }
                    // initialize the envelope
                    inst.envelope.gain.cancelScheduledValues(st);
                    // before attack
                    rampBy('setValueAtTime', inst.envelope.gain, 0, st);
                    // attack + sustain
                    rampBy('linearRampToValueAtTime', inst.envelope.gain, 1, st + ((_g = inst.attackTime) !== null && _g !== void 0 ? _g : 0));
                    if (inst.decayTime) {
                        // sustain + decay
                        rampBy('linearRampToValueAtTime', inst.envelope.gain, (_h = inst.sustain) !== null && _h !== void 0 ? _h : 1, st + inst.adTime);
                    }
                }
                // detune
                if (sound.detune && 'detune' in inst && inst.detune) {
                    rampBy(sound.isFirst ? 'setValueAtTime' : rampers.detune, inst.detune, sound.detune || 0, st);
                }
                // loudness/gain
                if (sound.loudness !== undefined) {
                    rampBy(sound.isFirst ? 'setValueAtTime' : rampers.loudness, gain.gain, sound.loudness, st);
                }
                // panner node
                if (sound.pan !== undefined) {
                    // [check output:] panner.pan.setTargetAtTime(sound.pan, st, 0.35);
                    // rampBy(sound.isFirst ? 'setValueAtTime' : rampers.pan, panner.pan, sound.pan, st);
                    rampBy(sound.isFirst ? 'setTargetAtTime' : rampers.pan, panner.pan, sound.pan, st, 0.35);
                }
                if (sound.isFirst) {
                    // play the first
                    startTime = st;
                }
                if (sound.isLast) {
                    // smooth ending
                    rampBy('linearRampToValueAtTime', gain.gain, ((_j = sound.loudness) !== null && _j !== void 0 ? _j : 1), st + 0.05);
                    rampBy('linearRampToValueAtTime', gain.gain, 0, st + 0.15);
                    if (inst instanceof ErieSynth) {
                        inst.envelope.gain.cancelScheduledValues(st);
                        rampBy('setValueAtTime', inst.envelope.gain, 1, base_et);
                        rampBy('linearRampToValueAtTime', inst.envelope.gain, 0, base_et + inst.adTime);
                    }
                }
                for (const filterName of filters) {
                    let encoder = filterEncoders[filterName];
                    let finisher = filterFinishers[filterName];
                    if (encoder) {
                        encoder(filterNodes[filterName], sound, st, rampers);
                    }
                    if (finisher) {
                        finisher(filterNodes[filterName], sound, st, base_et + (inst instanceof ErieSynth ? inst.adTime : 0), rampers);
                    }
                }
            }
            const tick = makeTick(ctx, config.tick, endTime);
            emitNotePlayEvent('tone', q[0]);
            if (offline && bufferPrimitve && ctx instanceof OfflineAudioContext) {
                if (tick) {
                    tick.start(0);
                    tick.stop(endTime);
                }
                inst.start(0);
                inst.stop(endTime);
                let rb = yield ctx.startRendering();
                bufferPrimitve.add(0, rb);
                inst.onended = (e) => {
                    setErieGlobalControl(undefined);
                    setErieGlobalState(undefined);
                    emitNoteStopEvent('tone', q[0]);
                    sendToneFinishEvent({ sid });
                };
            }
            else {
                return new Promise((resolve, reject) => {
                    if (tick) {
                        tick.start(startTime);
                        tick.stop(ct + endTime);
                    }
                    inst.start(startTime);
                    inst.stop(ct + endTime);
                    inst.onended = (e) => {
                        setErieGlobalControl(undefined);
                        setErieGlobalState(undefined);
                        emitNoteStopEvent('tone', q[0]);
                        sendToneFinishEvent({ sid });
                        resolve();
                    };
                });
            }
        });
    }

    let ErieGlobalSynth;
    function WebSpeechGenerator(sound, config, onstart, onend, resolve) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!ErieGlobalSynth)
                ErieGlobalSynth = window.speechSynthesis;
            var utterance = new SpeechSynthesisUtterance('speech' in sound ? sound.speech : sound.text);
            if ((config === null || config === void 0 ? void 0 : config.speechRate) !== undefined)
                utterance.rate = config === null || config === void 0 ? void 0 : config.speechRate;
            else if ((sound === null || sound === void 0 ? void 0 : sound.speechRate) !== undefined)
                utterance.rate = sound === null || sound === void 0 ? void 0 : sound.speechRate;
            if ((sound === null || sound === void 0 ? void 0 : sound.pitch) !== undefined)
                utterance.pitch = sound.pitch;
            if ((sound === null || sound === void 0 ? void 0 : sound.loudness) !== undefined)
                utterance.volume = sound.loudness;
            if (sound === null || sound === void 0 ? void 0 : sound.language)
                utterance.lang = (bcp47language.includes(sound.language) ? sound.language : (_a = (typeof document !== undefined ? document : {}).documentElement) === null || _a === void 0 ? void 0 : _a.lang);
            else
                utterance.lang = ((_b = (typeof document !== undefined ? document : {}).documentElement) === null || _b === void 0 ? void 0 : _b.lang);
            onstart();
            ErieGlobalSynth.speak(utterance);
            setErieGlobalControl({ type: SpeechType, player: ErieGlobalSynth });
            utterance.onend = () => {
                onend();
                if (resolve)
                    resolve();
            };
        });
    }

    const SSMLGENDERS = [`NEUTRAL`, `FEMALE`, `MALE`];
    function GoogleCloudTTSGenerator(sound, config
    // @ts-ignore (this is typescript bug, works okay)
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof window === 'undefined') {
                // node
                let text = 'speech' in sound ? sound.speech : sound.text;
                let lang = sound.language || config.language;
                let languageCode = bcp47language.includes(lang) ? lang : 'en-US';
                let ssmlGender = SSMLGENDERS.includes(config.ssmlGender) ? config.ssmlGender : 'NEUTRAL';
                let pitch = sound.pitch, speakingRate = sound.speechRate || config.speechRate || 1;
                const request = {
                    input: { text: text },
                    voice: { languageCode, ssmlGender },
                    audioConfig: { audioEncoding: (config === null || config === void 0 ? void 0 : config.audioEncoding) || 'MULAW', speakingRate, pitch },
                };
                const client = new tts__namespace.TextToSpeechClient();
                // Performs the text-to-speech request
                const [response] = yield client.synthesizeSpeech(request);
                return response.audioContent;
            }
            else {
                console.warn("This function can only be run on node server environment");
                return null;
            }
        });
    }

    function playSingleSpeech(sound, config, bufferPrimitve, ttsFetchFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            // if it is from a discrete series and being stopped, then do nothing
            if ((config === null || config === void 0 ? void 0 : config.subpart) && isErieGlobalState(Stopped))
                return;
            // if it is an individual play (not from a discrete series)
            if (!(config === null || config === void 0 ? void 0 : config.subpart))
                setErieGlobalState(undefined);
            let sid = genRid();
            if (!config.subpart) {
                sendSpeechStartEvent({ sound, sid });
            }
            let onstart = () => {
                emitNotePlayEvent(SpeechType, sound);
            };
            let onend = () => {
                clearPlayerEvents();
                setErieGlobalControl(undefined);
                setErieGlobalState(undefined);
                emitNoteStopEvent(SpeechType, sound);
                if (!config.subpart) {
                    sendSpeechFinishEvent({ sid });
                }
            };
            if (typeof window !== 'undefined' && bufferPrimitve && typeof ttsFetchFunction === 'function') {
                let speechRendered = yield ttsFetchFunction({ text: sound, config });
                let ctx = new AudioContext();
                bufferPrimitve.add('next', yield ctx.decodeAudioData(speechRendered));
            }
            else if (typeof window === 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
                yield GoogleCloudTTSGenerator(sound, config);
            }
            else {
                if (typeof window !== 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
                    console.warn("Google Cloud TTS API can only be used on Node.js Server environment.");
                }
                return new Promise((resolve, reject) => {
                    WebSpeechGenerator(sound, config, onstart, onend, resolve);
                });
            }
            return;
        });
    }

    function playRelativeDiscreteTonesAndSpeeches(ctx, queue, _config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve, ttsFetchFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            // clear previous state
            setErieGlobalState(undefined);
            let config = deepcopy(_config);
            config.subpart = true;
            for (const sound of queue) {
                if (isErieGlobalState(Stopped))
                    break;
                let sid = genRid();
                if (sound.speech) {
                    sendSpeechStartEvent({ sound, sid });
                    yield playSingleSpeech(sound, config, bufferPrimitve, ttsFetchFunction);
                    sendSpeechFinishEvent({ sid });
                }
                else {
                    sendToneStartEvent({ sid });
                    yield playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
                    sendToneFinishEvent({ sid });
                }
            }
            setErieGlobalState(undefined);
            return;
        });
    }

    function playAbsoluteSpeeches(ctx, queue, config, ttsFetchFunction, bufferPrimitve) {
        return __awaiter(this, void 0, void 0, function* () {
            // clear previous state
            setErieGlobalState(undefined);
            // playing a series of discrete tones with an aboslute schedule
            // set audio context controls
            setErieGlobalControl({ type: ToneType, player: ctx });
            // gain == loudness
            const gain = ctx.createGain();
            gain.connect(ctx.destination);
            gain.gain.value = 0;
            // sort queue to mark the last node for sequence end check
            let q0 = queue.toSorted(glyphSorterByStart);
            q0[0].isFirst = true;
            let q = q0.toSorted(glyphSorterByEnd);
            q[q.length - 1].isLast = true;
            config.subpart = true;
            // play as async promise
            return new Promise((resolve, reject) => {
                // get the current time
                let ct = (config === null || config === void 0 ? void 0 : config.context_time) !== undefined ? config.context_time : setCurrentTime(ctx);
                // set and play sounds
                let prev;
                for (let sound of q) {
                    if (isErieGlobalState(Stopped)) {
                        resolve();
                        break;
                    }
                    if (prev) {
                        getStartTime1(q) - getEndTime1(prev);
                    }
                    // get discrete oscillator
                    const inst = makeInstrument(ctx);
                    inst.connect(gain);
                    // play & stop
                    inst.start(ct + sound.time - 0.02);
                    inst.stop(ct + sound.time);
                    // play the sound
                    inst.onended = () => {
                        if ((config === null || config === void 0 ? void 0 : config.falseTiming) && isErieGlobalControlType(SpeechType)) {
                            closeErieGlobalControl();
                        }
                        playSingleSpeech(sound, config, bufferPrimitve, ttsFetchFunction);
                        if (sound.isLast) {
                            resolve();
                        }
                    };
                    prev = q;
                }
            });
        });
    }

    class AudioGraphQueue {
        constructor() {
            this.queue = [];
            this.state = Finished;
            this.playAt;
            this.config = {};
            this.sampledInstruments = [];
            this.sampledInstrumentSources = {};
            this.samplings = {};
            this.synths = {};
            this.waves = {};
            this.playId;
            this.buffers = [];
        }
        // set
        setConfig(key, value) {
            this.config[key] = value;
        }
        setSampling(samplings) {
            this.samplings = deepcopy(samplings);
        }
        setSynths(synths) {
            this.synths = deepcopy(synths);
        }
        setWaves(waves) {
            this.waves = deepcopy(waves);
        }
        // checks
        isSupportedInst(k) {
            return SupportedInstruments.includes(k);
        }
        isSampling(k) {
            var _a;
            return ((_a = this.samplings) === null || _a === void 0 ? void 0 : _a[k]) !== undefined;
        }
        isSynth(k) {
            var _a;
            return ((_a = this.synths) === null || _a === void 0 ? void 0 : _a[k]) !== undefined;
        }
        isWave(k) {
            var _a;
            return ((_a = this.waves) === null || _a === void 0 ? void 0 : _a[k]) !== undefined;
        }
        add(type, info, lineConfig, at) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
            let checkInstrumentSampling = new Set(), userSampledInstruments = new Set();
            if (QueueItemTypes.includes(type)) {
                let item = {
                    type,
                    config: lineConfig,
                };
                if (type === TextType && isTextQueueItem(item) && isTextInfo(info)) {
                    item.text = (_a = info === null || info === void 0 ? void 0 : info.speech) !== null && _a !== void 0 ? _a : '';
                    if (info === null || info === void 0 ? void 0 : info.speechRate)
                        item.speechRate = info === null || info === void 0 ? void 0 : info.speechRate;
                    item.language = info.language;
                    item.pitch = info.pitch;
                    item.loudness = info.loudness;
                }
                else if (type === ToneType && isToneQueueItem(item) && isSoundInfo(info)) {
                    item.instrument_type = info.instrument_type;
                    if (this.isSupportedInst(item.instrument_type))
                        checkInstrumentSampling.add(item.instrument_type);
                    else if (this.isSampling(item.instrument_type))
                        userSampledInstruments.add(item.instrument_type);
                    item.time = (_d = (_c = (_b = info.sound) === null || _b === void 0 ? void 0 : _b.start) !== null && _c !== void 0 ? _c : info.start) !== null && _d !== void 0 ? _d : 0;
                    item.end = (_f = (_e = info.sound) === null || _e === void 0 ? void 0 : _e.end) !== null && _f !== void 0 ? _f : (getStartTime1(item) + ((_h = (_g = info.sound) === null || _g === void 0 ? void 0 : _g.duration) !== null && _h !== void 0 ? _h : 0.2));
                    item.duration = (_l = (_k = (_j = info.sound) === null || _j === void 0 ? void 0 : _j.duration) !== null && _k !== void 0 ? _k : (item.end - getStartTime1(item))) !== null && _l !== void 0 ? _l : 0.2; // in seconds
                    item.pitch = (_o = (_m = info.sound) === null || _m === void 0 ? void 0 : _m.pitch) !== null && _o !== void 0 ? _o : DefaultFrequency;
                    item.detune = (_p = info.sound) === null || _p === void 0 ? void 0 : _p.detune;
                    item.loudness = (_r = (_q = info.sound) === null || _q === void 0 ? void 0 : _q.loudness) !== null && _r !== void 0 ? _r : 1;
                    item.pan = (_s = info.sound) === null || _s === void 0 ? void 0 : _s.pan;
                    item.postReverb = (_u = (_t = info.sound) === null || _t === void 0 ? void 0 : _t.postReverb) !== null && _u !== void 0 ? _u : 0;
                    item.timbre = (_w = (_v = info.sound) === null || _v === void 0 ? void 0 : _v.timbre) !== null && _w !== void 0 ? _w : info.instrument_type;
                    let tapCount = (_x = info.sound) === null || _x === void 0 ? void 0 : _x.tapCount, tapSpeed = (_y = info.sound) === null || _y === void 0 ? void 0 : _y.tapSpeed;
                    if (tapCount || tapSpeed) {
                        item.tap = mergeTapPattern(tapCount, tapSpeed);
                        item.duration = (_z = item.tap) === null || _z === void 0 ? void 0 : _z.totalLength;
                    }
                    item.modulation = (_1 = (_0 = info.sound) === null || _0 === void 0 ? void 0 : _0.modulation) !== null && _1 !== void 0 ? _1 : 0;
                    item.harmonicity = (_3 = (_2 = info.sound) === null || _2 === void 0 ? void 0 : _2.harmonicity) !== null && _3 !== void 0 ? _3 : 0;
                    item.others = {};
                    // custom channels;
                    Object.keys((_4 = info.sound) !== null && _4 !== void 0 ? _4 : {}).forEach((chn) => {
                        var _a;
                        if (item.others && !DefaultChannels.includes(chn)) {
                            item.others[chn] = (_a = info.sound) === null || _a === void 0 ? void 0 : _a[chn];
                        }
                    });
                    if (item.others && info.sound.others) {
                        Object.assign(item.others, info.sound.others);
                    }
                    // filters
                    item.filters = (_5 = info.filters) !== null && _5 !== void 0 ? _5 : [];
                    if (this.isSupportedInst(item.timbre))
                        checkInstrumentSampling.add(item.timbre);
                    else if (this.isSampling(item.timbre))
                        userSampledInstruments.add(item.timbre);
                }
                else if (type === ToneSeries && isSeriesQueueItem(item) && isToneSeriesInfo(info)) {
                    item.duration = info.duration;
                    item.instrument_type = info.instrument_type;
                    if (this.isSupportedInst(item.instrument_type))
                        checkInstrumentSampling.add(item.instrument_type);
                    else if (this.isSampling(item.instrument_type))
                        userSampledInstruments.add(item.instrument_type);
                    item.sounds = makeSingleStreamQueueValues(info.sounds);
                    if (item.sounds.hasSpeech)
                        item.type = ToneSpeechSeries;
                    item.sounds[item.sounds.length - 1].isLast = true;
                    item.continued = info.continued;
                    item.relative = info.relative;
                    // filters
                    item.filters = info.filters || [];
                    if (this.isSupportedInst(item.instrument_type))
                        checkInstrumentSampling.add(item.instrument_type);
                    else if (this.isSampling(item.instrument_type))
                        userSampledInstruments.add(item.instrument_type);
                    item.sounds.forEach((sound) => {
                        if (sound.timbre && this.isSupportedInst(sound.timbre))
                            checkInstrumentSampling.add(sound.timbre);
                        else if (sound.timbre && this.isSampling(sound.timbre))
                            userSampledInstruments.add(sound.timbre);
                    });
                    if (info.ramp) {
                        item.ramp = deepcopy(info.ramp);
                    }
                }
                else if (type === ToneOverlaySeries && isToneOverlaySeriesQueueItem(item) && isToneOverlayInfo(info)) {
                    item.duration = info.duration;
                    if (info.overlays.length > 0) {
                        item.overlays = info.overlays.map((d) => {
                            let o = {
                                instrument_type: d.instrument_type,
                                sounds: makeSingleStreamQueueValues(d.sounds),
                                continued: d.continued,
                                relative: d.relative,
                                filters: d.filters || []
                            };
                            o.sounds[o.sounds.length - 1].isLast = true;
                            if (this.isSupportedInst(o.instrument_type))
                                checkInstrumentSampling.add(o.instrument_type);
                            else if (this.isSampling(o.instrument_type))
                                userSampledInstruments.add(o.instrument_type);
                            o.sounds.forEach((sound) => {
                                if (sound.timbre && this.isSupportedInst(sound.timbre))
                                    checkInstrumentSampling.add(sound.timbre);
                                else if (sound.timbre && this.isSampling(sound.timbre))
                                    userSampledInstruments.add(sound.timbre);
                            });
                            if (d.ramp) {
                                o.ramp = deepcopy(d.ramp);
                            }
                            return o;
                        });
                    }
                    else {
                        item.overlays = info.overlays;
                    }
                }
                else if (type === Pause && isPauseQueueItem(item) && isPauseInfo(info)) {
                    item.duration = info.duration; // in seconds
                }
                //  else if (type === LegendType) {
                //   Object.assign(item, info);
                // }
                Array.from(checkInstrumentSampling).forEach((inst) => {
                    if (!this.sampledInstruments.includes(inst)) {
                        this.sampledInstruments.push(inst);
                    }
                });
                Array.from(userSampledInstruments).forEach((inst) => {
                    if (!this.sampledInstruments.includes(inst)) {
                        this.sampledInstruments.push(inst);
                    }
                });
                if (at !== undefined) {
                    this.queue.splice(at, 0, item);
                }
                else {
                    this.queue.push(item);
                }
            }
        }
        addMulti(multiples, lineConfig, pos) {
            let at = pos;
            for (const mul of multiples) {
                if (mul === null || mul === void 0 ? void 0 : mul.type) {
                    this.add(mul.type, mul, lineConfig, at);
                    if (at !== undefined) {
                        at += 1;
                    }
                }
            }
        }
        addQueue(queue, pos) {
            if (pos !== undefined) {
                this.queue.splice(pos, 0, ...queue.queue);
            }
            else {
                this.queue.push(...queue.queue);
            }
        }
        play(i, j, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.state !== Playing) {
                    setPlayerEvents(this, this.config);
                    let queue = this.queue;
                    this.playAt = i || 0;
                    let outputs = Array((j || queue.length) - (i || 0)).fill({});
                    // for pause & resume
                    if (i !== undefined && j !== undefined) {
                        queue = this.queue.slice(i, j);
                    }
                    else if (i !== undefined) {
                        queue = this.queue.slice(i, this.queue.length);
                    }
                    else if (j !== undefined) {
                        queue = this.queue.slice(0, j);
                    }
                    this.state = Playing;
                    this.fireStartEvent();
                    let k = 0;
                    for (const item of queue) {
                        console.log(item, this.state, options);
                        // @ts-ignore
                        // why? the below condition can change over time
                        if (this.state === Stopped || this.state === Paused)
                            break;
                        outputs[k] = yield this.playLine(item, options);
                        this.playAt += 1;
                        k++;
                    }
                    this.fireStopEvent();
                    clearPlayerEvents();
                    this.state = Stopped;
                    this.playAt = undefined;
                    return outputs;
                }
            });
        }
        playLine(item, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                let config = deepcopy(this.config);
                if ('config' in item && item.config)
                    Object.assign(config, item.config);
                if ('ramp' in item && item.ramp)
                    config.ramp = item.ramp;
                let bufferPrimitve;
                if (options === null || options === void 0 ? void 0 : options.pcm) {
                    if (item.duration === undefined) {
                        console.error("For PCM generation, duration must be specified!", item);
                    }
                    else {
                        bufferPrimitve = new AudioPrimitiveBuffer(item.duration);
                    }
                }
                let ttsFetchFunction = options === null || options === void 0 ? void 0 : options.ttsFetchFunction;
                if (isTextQueueItem(item)) {
                    yield playSingleSpeech(item, config, bufferPrimitve, ttsFetchFunction);
                }
                else if (isToneQueueItem(item)) {
                    let ctx = makeContext();
                    for (const inst of this.sampledInstruments) {
                        if (inst && !this.sampledInstrumentSources[inst]) {
                            this.sampledInstrumentSources[inst] = yield loadSamples(ctx, inst, this.samplings, (_a = this.config.options) === null || _a === void 0 ? void 0 : _a.baseUrl);
                        }
                    }
                    yield playSingleTone(ctx, item, config, this.sampledInstrumentSources, this.synths, this.waves, (_b = item.filters) !== null && _b !== void 0 ? _b : [], bufferPrimitve);
                    ctx.close();
                }
                else if (isPauseQueueItem(item)) {
                    yield playPause(item.duration * 1000);
                }
                else if (isToneSeriesQueueItem(item)) {
                    let ctx = makeContext();
                    for (const inst of this.sampledInstruments) {
                        if (inst && !this.sampledInstrumentSources[inst]) {
                            this.sampledInstrumentSources[inst] = yield loadSamples(ctx, inst, this.samplings, (_c = this.config.options) === null || _c === void 0 ? void 0 : _c.baseUrl);
                        }
                    }
                    if (item.continued) {
                        config.instrument_type = item.instrument_type;
                        yield playAbsoluteContinuousTones(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
                    }
                    else if (!item.relative) {
                        yield playAbsoluteDiscreteTonesAlt(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
                    }
                    else {
                        yield playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve, ttsFetchFunction);
                    }
                    ctx.close();
                }
                else if (isToneSpeechSeriesQueueItem(item)) {
                    let ctx = makeContext();
                    for (const inst of this.sampledInstruments) {
                        if (inst && !this.sampledInstrumentSources[inst]) {
                            this.sampledInstrumentSources[inst] = yield loadSamples(ctx, inst, this.samplings, (_d = this.config.options) === null || _d === void 0 ? void 0 : _d.baseUrl);
                        }
                    }
                    yield playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve, ttsFetchFunction);
                    ctx.close();
                }
                else if (isToneOverlaySeriesQueueItem(item)) {
                    let promises = [];
                    let ctx = makeContext();
                    for (const inst of this.sampledInstruments) {
                        if (inst && !this.sampledInstrumentSources[inst]) {
                            this.sampledInstrumentSources[inst] = yield loadSamples(ctx, inst, this.samplings, (_e = this.config.options) === null || _e === void 0 ? void 0 : _e.baseUrl);
                        }
                    }
                    for (let stream of item.overlays) {
                        if (stream.continued) {
                            config.instrument_type = stream.instrument_type;
                            promises.push(playAbsoluteContinuousTones(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
                        }
                        else if (!stream.relative) {
                            promises.push(playAbsoluteDiscreteTonesAlt(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
                        }
                        else {
                            promises.push(playRelativeDiscreteTonesAndSpeeches(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve, ttsFetchFunction));
                        }
                    }
                    yield Promise.all(promises);
                    ctx.close();
                }
                if (bufferPrimitve) {
                    let currBuffer = yield (bufferPrimitve === null || bufferPrimitve === void 0 ? void 0 : bufferPrimitve.compile());
                    this.buffers.push(currBuffer);
                    return bufferPrimitve;
                }
                return;
            });
        }
        stop() {
            // button-based stop
            // for event stop ==> audio-graph-player-proto.js
            if (this.state === Playing) {
                closeErieGlobalControl();
                // @ts-ignore
                // this can be changed over time!
                if (this.state !== Stopped) {
                    this.state = Stopped;
                    notifyStop(this.config);
                    this.fireStopEvent();
                    clearPlayerEvents();
                    this.playAt = undefined;
                }
            }
        }
        pause() {
            this.state = Paused;
            notifyPause(this.config);
        }
        resume() {
            return __awaiter(this, void 0, void 0, function* () {
                yield notifyResume(this.config);
                return this.play(this.playAt);
            });
        }
        fireStartEvent() {
            this.playId = genRid();
            sendQueueStartEvent({ pid: this.playId });
        }
        fireStopEvent() {
            sendQueueFinishEvent({ pid: this.playId });
        }
        destroy() {
            this.state = Finished;
            this.queue = [];
            clearPlayerEvents();
        }
        getFullAudio(ttsFetchFunction) {
            return __awaiter(this, void 0, void 0, function* () {
                let output = [];
                let ctx = new AudioContext();
                let options = { pcm: true, ttsFetchFunction };
                for (let i = 0; i < this.queue.length; i++) {
                    let buffers = yield this.play(i, i + 1, options);
                    if (buffers) {
                        for (const b of buffers) {
                            if ((b === null || b === void 0 ? void 0 : b.constructor.name) === (AudioPrimitiveBuffer === null || AudioPrimitiveBuffer === void 0 ? void 0 : AudioPrimitiveBuffer.name)) {
                                output.push(b.compiledBuffer);
                            }
                            else {
                                output.push(yield ctx.decodeAudioData(b));
                            }
                        }
                    }
                }
                let merged = concatenateBuffers(output);
                let blob = yield makeWaveFromBuffer(merged, "mp3");
                // @ts-ignore
                return window.URL.createObjectURL(blob);
            });
        }
    }
    function makeSingleStreamQueueValues(sounds) {
        var _a, _b;
        let queue_values = [];
        for (const sound of sounds) {
            let time = sound.start !== undefined ? sound.start : sound.time;
            let dur = sound.duration !== undefined ? sound.duration : (((_a = sound.end) !== null && _a !== void 0 ? _a : 0) - getStartTime1({ time }));
            let tap = mergeTapPattern(sound.tapCount, sound.tapSpeed);
            if (sound.tapCount || sound.tapSpeed) {
                if ((tap === null || tap === void 0 ? void 0 : tap.totalLength) !== undefined)
                    dur = tap.totalLength;
            }
            let ith_q = {
                pitch: sound.pitch,
                detune: sound.detune,
                loudness: sound.loudness,
                time,
                duration: dur,
                pan: sound.pan,
                speech: sound.speech,
                language: sound.language,
                postReverb: (Math.round(((_b = sound.postReverb) !== null && _b !== void 0 ? _b : 0) * 100) / 100),
                timbre: sound.timbre,
                tap,
                modulation: sound.modulation || 0,
                harmonicity: sound.harmonicity || 0,
                __datum: sound.__datum,
                others: {}
            };
            if (sound.speech) {
                ith_q.duration = undefined;
                queue_values.hasSpeech = true;
            }
            // custom channels;
            Object.keys(sound || {}).forEach((chn) => {
                if (ith_q.others && !DefaultChannels.includes(chn) && chn !== '__datum') {
                    ith_q.others[chn] = sound[chn];
                }
            });
            if (ith_q.others && sound.others) {
                Object.assign(ith_q.others, sound.others);
            }
            queue_values.push(ith_q);
        }
        queue_values = queue_values.sort((a, b) => (getStartTime1(a) - getStartTime1(b)));
        return queue_values;
    }
    function isAudioGraphQueue(o) {
        var _a;
        return ((_a = o === null || o === void 0 ? void 0 : o.constructor) === null || _a === void 0 ? void 0 : _a.name) === AudioGraphQueue.name;
    }

    class OverlayStream {
        constructor() {
            this.overlays = [];
            this.playing = false;
            this.prerendered = false;
            this.config = {};
            this.name;
        }
        setName(name) {
            this.name = name;
        }
        setTitle(title) {
            this.title = title;
        }
        setDescription(desc) {
            this.description = desc;
        }
        addStream(stream) {
            this.overlays.push(stream);
        }
        addStreams(streams) {
            this.overlays.push(...streams);
        }
        setConfig(key, value) {
            this.config[key] = value;
        }
        setFilters(audioFilters) {
            this.overlays.forEach((s) => {
                s.setFilters(audioFilters);
            });
        }
        prerender(subpart) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                this.queue = new AudioGraphQueue();
                // order: scale > title--repeated
                // main title & description
                if (!subpart) {
                    if (this.title && !this.config.skipTitle) {
                        this.queue.add(TextType, { speech: this.title, speechRate: (_a = this.config) === null || _a === void 0 ? void 0 : _a.speechRate }, this.config);
                    }
                    else if (this.name && !this.config.skipTitle) {
                        this.queue.add(TextType, { speech: this.name, speechRate: (_b = this.config) === null || _b === void 0 ? void 0 : _b.speechRate }, this.config);
                    }
                    if (this.description && !this.config.skipDescription) {
                        this.queue.add(TextType, { speech: this.description, speechRate: (_c = this.config) === null || _c === void 0 ? void 0 : _c.speechRate }, this.config);
                    }
                }
                // overlay descriptions
                if (this.overlays.length > 1) {
                    if (!subpart && !this.config.skipStartSpeech) {
                        this.queue.add(TextType, { speech: `This sonification has ${this.overlays.length} overlaid streams.`, speechRate: (_d = this.config) === null || _d === void 0 ? void 0 : _d.speechRate });
                        let oi = 1;
                        let titles_queues = [], scales_queues = [], scale_count = 0;
                        for (const stream of this.overlays) {
                            let title_queue = new AudioGraphQueue();
                            if ((stream.title || stream.name) && !stream.config.skipTitle) {
                                title_queue.add(TextType, { speech: `The ${toOrdinalNumbers(oi)} overlay stream is about ${(stream.title || stream.name)}. `, speechRate: (_e = this.config) === null || _e === void 0 ? void 0 : _e.speechRate }, stream.config);
                            }
                            if (stream.description && !stream.config.skipDescription) {
                                title_queue.add(TextType, { speech: stream.description, speechRate: (_f = this.config) === null || _f === void 0 ? void 0 : _f.speechRate }, stream.config);
                            }
                            titles_queues.push(title_queue);
                            let scale_text = stream.make_scale_text().filter((d) => d).map(d => d.description);
                            if (!stream.config.skipScaleSpeech && scale_text.length > 0) {
                                let scales_queue = new AudioGraphQueue();
                                scales_queue.add(TextType, { speech: `This stream has the following sound mappings. `, speechRate: (_g = this.config) === null || _g === void 0 ? void 0 : _g.speechRate }, stream.config);
                                scales_queue.addMulti(scale_text, Object.assign(Object.assign({}, stream.config), { tick: null }));
                                scale_count++;
                                scales_queues.push(scales_queue);
                            }
                            oi++;
                        }
                        if (scale_count > 1) {
                            for (let i = 0; i < oi - 1; i++) {
                                if (titles_queues[i])
                                    this.queue.addQueue(titles_queues[i]);
                                if (scales_queues[i])
                                    this.queue.addQueue(scales_queues[i]);
                            }
                        }
                        else {
                            for (let i = 0; i < oi - 1; i++) {
                                if (titles_queues[i])
                                    this.queue.addQueue(titles_queues[i]);
                            }
                            for (let i = 0; i < oi - 1; i++) {
                                if (scales_queues[i])
                                    this.queue.addQueue(scales_queues[i]);
                            }
                        }
                    }
                }
                let overlays = [];
                this.overlays.forEach((stream) => __awaiter(this, void 0, void 0, function* () {
                    overlays.push(yield stream.prerender());
                }));
                this.queue.add(ToneOverlaySeries, { overlays });
                this.prerendered = true;
                return this.queue;
            });
        }
        make_scale_text(channel, i) {
            if (i !== undefined) {
                let stream = this.overlays[i];
                if (stream && !stream.config.skipScaleSpeech)
                    return stream.make_scale_text(channel);
                else
                    return [];
            }
            else {
                return this.overlays.map((stream) => {
                    if (!stream.config.skipScaleSpeech)
                        return stream.make_scale_text(channel);
                    else
                        return [];
                }).flat();
            }
        }
        playQueue() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (!this.prerendered)
                    yield this.prerender();
                (_a = this.queue) === null || _a === void 0 ? void 0 : _a.play();
            });
        }
        stopQueue() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = this.queue) === null || _a === void 0 ? void 0 : _a.stop();
            });
        }
    }
    function isOverlayStreamObject(o) {
        var _a;
        return ((_a = o === null || o === void 0 ? void 0 : o.constructor) === null || _a === void 0 ? void 0 : _a.name) === OverlayStream.name;
    }

    function makeRepeatStreamTree(level, values, directions) {
        if (level === undefined)
            level = 0;
        if (directions.length <= level)
            return { direction: 'leaf', nodes: [] };
        let memberships = values.map((v) => v.membership[level]);
        let curr_value_list = [];
        let dir = directions[level];
        let direction = dir;
        let nodes = [];
        let tree = {
            direction,
            field: memberships[0].key,
            nodes
        };
        let membership_checked = [];
        for (const member of memberships) {
            if (!membership_checked.includes(member.value)) {
                membership_checked.push(member.value);
                if (!curr_value_list.includes(member.value)) {
                    let subValues = values.filter((d) => d.value_keys[level] === member.value);
                    if (subValues.length > 0) {
                        let subtree = makeRepeatStreamTree(level + 1, subValues, directions);
                        subtree.parent_value = member.value;
                        tree.nodes.push(subtree);
                        curr_value_list.push(member.value);
                    }
                }
            }
        }
        return tree;
    }
    function postprocessRepeatStreams(tree) {
        let flat_streams = postprocessRstreamTree(tree);
        return flat_streams.nodes.map((s) => {
            if (isUnitStreamObject(s))
                return s;
            else if (s instanceof Array && s.length == 1)
                return s[0];
            else if (s instanceof Array && s.length > 1) {
                let overlay = new OverlayStream();
                overlay.addStreams(s);
                return overlay;
            }
            else
                return undefined;
        }).filter((d) => d !== undefined);
    }
    function postprocessRstreamTree(tree) {
        if (tree.direction === 'leaf')
            return { nodes: tree.nodes, dir: 'leaf' };
        else if (tree.direction === OVERLAY) {
            let flat_overlay = [];
            tree.nodes.forEach((node) => {
                let { nodes, dir } = postprocessRstreamTree(node);
                flat_overlay.push(...nodes);
            });
            return { nodes: [flat_overlay.filter(d => d !== undefined)], dir: OVERLAY };
        }
        else { // tree.direction === SEQUENCE
            let flat_seq = [];
            tree.nodes.forEach((node) => {
                let { nodes, dir } = postprocessRstreamTree(node);
                if (dir === OVERLAY) {
                    flat_seq.push(nodes);
                }
                else {
                    flat_seq.push(...nodes);
                }
            });
            return { nodes: flat_seq.filter(d => d !== undefined), dir: SEQUENCE };
        }
    }

    function makeIndexSortFn(key, order) {
        return (a, b) => {
            let det = order.indexOf(a[key]) - order.indexOf(b[key]);
            if (det != 0)
                return det;
            return 0;
        };
    }
    function makeAscSortFn(key) {
        return (a, b) => {
            return asc(a[key], b[key]);
        };
    }
    function makeDescSortFn(key) {
        return (a, b) => {
            return desc(a[key], b[key]);
        };
    }

    function createBin(col, transform) {
        var _a, _b;
        let is_nice = transform.nice;
        if (is_nice === undefined)
            is_nice = true;
        let maxbins = transform.maxbins || 10;
        let step = transform.step;
        let exact = transform.exact;
        let binFunction = d3.bin(), buckets = [], binAssigner, equiBin = true;
        if (is_nice && maxbins && !step) {
            binFunction = binFunction.thresholds(maxbins);
            buckets = binFunction(col);
            equiBin = true;
        }
        else if (step) {
            maxbins = Math.ceil((((_a = d3.max(col)) !== null && _a !== void 0 ? _a : 0) - ((_b = d3.min(col)) !== null && _b !== void 0 ? _b : 0)) / step);
            binFunction = binFunction.thresholds(maxbins);
            buckets = binFunction(col);
            equiBin = true;
        }
        else if (exact) {
            binFunction = binFunction.thresholds(exact);
            buckets = binFunction(col);
            equiBin = false;
        }
        binAssigner = (d) => {
            var _a;
            let ib = (_a = buckets.map(b => (b.includes(d) ? { x0: b.x0, x1: b.x1 } : undefined)).filter(b => b != undefined)) === null || _a === void 0 ? void 0 : _a[0];
            return { start: ib === null || ib === void 0 ? void 0 : ib.x0, end: ib === null || ib === void 0 ? void 0 : ib.x1 };
        };
        let binned = col.map(binAssigner);
        let start = binned.map(d => d.start), end = binned.map(d => d.end);
        return { start, end, nBuckets: buckets.length, equiBin };
    }

    function doAggregate(table, aggregates, groupby) {
        let rollups = getRollUps(aggregates);
        return table.groupby(groupby).rollup(rollups);
    }
    function getRollUps(aggregates) {
        let rollups = {};
        for (const agg of aggregates) {
            let name_as = agg.as, field = agg.field, method = agg.op;
            if ((method === "mean" || method === "average") && typeof field === 'string') {
                rollups[name_as] = `d => op.mean(d['${field}'])`;
            }
            else if (method === "valid" && typeof field === 'string') {
                rollups[name_as] = `d => op.valid(d['${field}'])`;
            }
            else if (method === "invalid" && typeof field === 'string') {
                rollups[name_as] = `d => op.invalid(d['${field}'])`;
            }
            else if (method === "max" && typeof field === 'string') {
                rollups[name_as] = `d => op.max(d['${field}'])`;
            }
            else if (method === "min" && typeof field === 'string') {
                rollups[name_as] = `d => op.min(d['${field}'])`;
            }
            else if (method === "distinct" && typeof field === 'string') {
                rollups[name_as] = `d => op.distinct(d['${field}'])`;
            }
            else if (method === "sum" && typeof field === 'string') {
                rollups[name_as] = `d => op.sum(d['${field}'])`;
            }
            else if (method === "product" && typeof field === 'string') {
                rollups[name_as] = `d => op.product(d['${field}'])`;
            }
            else if (method === "mode" && typeof field === 'string') {
                rollups[name_as] = `d => op.mode(d['${field}'])`;
            }
            else if (method === "median" && typeof field === 'string') {
                rollups[name_as] = `d => op.median(d['${field}'])`;
            }
            else if (method === "quantile" && typeof field === 'string') {
                let p = agg.p || 0.5;
                rollups[name_as] = `d => op.quantile(d['${field}'], ${p})`;
            }
            else if (method === "stdev" && typeof field === 'string') {
                rollups[name_as] = `d => op.stdev(d['${field}'])`;
            }
            else if (method === "stdevp" && typeof field === 'string') {
                rollups[name_as] = `d => op.stdevp(d['${field}'])`;
            }
            else if (method === "variance" && typeof field === 'string') {
                rollups[name_as] = `d => op.variance(d['${field}'])`;
            }
            else if (method === "variancep" && typeof field === 'string') {
                rollups[name_as] = `d => op.variancep(d['${field}'])`;
            }
            else if (method === "count") {
                rollups[name_as] = `d => op.count()`;
            }
            else if (method === "corr" && field instanceof Array) {
                rollups[name_as] = `d => op.corr(d['${field[0]}'], d['${field[1]}'])`;
            }
            else if (method === "covariance" && field instanceof Array) {
                rollups[name_as] = `d => op.covariance(d['${field[0]}'], d['${field[1]}'])`;
            }
            else if (method === "covariancep" && field instanceof Array) {
                rollups[name_as] = `d => op.covariancep(d['${field[0]}'], d['${field[1]}'])`;
            }
        }
        return rollups;
    }

    const fromTidy$3 = aq__namespace.from;
    function makeBoxPlotTable(_table, field, _extent, _invalid, groupby) {
        if (field) {
            let extent = _extent, invalid = _invalid;
            if (extent === undefined)
                extent = 1.5;
            if (invalid === undefined)
                invalid = 'filter';
            let table = _table.reify();
            // 1. get basic stats: min, max, 1Q, median, 3Q;
            if (invalid === 'filter') {
                table = table.filter(`d => !op.is_nan(d['${field}'])`);
            }
            else {
                table = table.impute({ [field]: () => 0 });
            }
            if (groupby && groupby.length > 0) {
                table = table.groupby(...groupby);
            }
            if (extent === "min-max") {
                let rollup1 = {
                    median: `d => op.median(d['${field}'])`,
                    q1: `d => op.quantile(d['${field}'], 0.25)`,
                    q3: `d => op.quantile(d['${field}'], 0.75)`,
                    whisker_lower: `d => op.min(d['${field}'])`,
                    whisker_upper: `d => op.max(d['${field}'])`
                }, rollup8 = {
                    outlier_lower: `d => d['${field}'] < d.whisker_lower ? d['${field}'] : null`,
                    outlier_upper: `d => d['${field}'] > d.whisker_upper ? d['${field}'] : null`,
                    outlier: `d => (d['${field}'] < d.whisker_lower || d['${field}'] > d.whisker_upper) ? d['${field}'] : null`
                };
                // operate the values
                table = table.derive(rollup1)
                    .derive(rollup8)
                    .select(...(groupby || []), field, 'median', 'q1', 'q3', 'whisker_lower', 'whisker_upper', 'outlier_lower', 'outlier_upper', 'outlier');
            }
            else if (typeof extent == 'number') {
                let rollup1 = {
                    median: `d => op.median(d['${field}'])`,
                    q1: `d => op.quantile(d['${field}'], 0.25)`,
                    q3: `d => op.quantile(d['${field}'], 0.75)`
                }, rollup2 = {
                    whisker_lower_boundary: `d => d.q1 - op.abs(d.q3 - d.q1) * ${extent}`,
                    whisker_upper_boundary: `d => d.q3 + op.abs(d.q3 - d.q1) * ${extent}`
                }, rollup3 = {
                    whisker_lower_diff: `d => d['${field}'] > d.whisker_lower_boundary ? op.abs(d['${field}'] - d.whisker_lower_boundary) : op.abs(op.max(d['${field}']))`,
                    whisker_upper_diff: `d => d['${field}'] < d.whisker_upper_boundary ? op.abs(d.whisker_upper_boundary - d['${field}']) : op.abs(op.max(d['${field}']))`
                }, rollup4 = {
                    whisker_lower_value_check: `d => op.min(d.whisker_lower_diff)`,
                    whisker_upper_value_check: `d => op.min(d.whisker_upper_diff)`
                }, rollup5 = {
                    is_whisker_lower: `d => d.whisker_lower_value_check == d.whisker_lower_diff`,
                    is_whisker_upper: `d => d.whisker_upper_value_check == d.whisker_upper_diff`
                }, rollup6 = {
                    whisker_lower_propa: `d => d.is_whisker_lower ? d['${field}'] : - Math.Infinity`,
                    whisker_upper_propa: `d => d.is_whisker_upper ? d['${field}'] : Math.Infinity`
                }, rollup7 = {
                    whisker_lower: `d => op.max(d.whisker_lower_propa)`,
                    whisker_upper: `d => op.min(d.whisker_upper_propa)`
                }, rollup8 = {
                    outlier_lower: `d => d['${field}'] < d.whisker_lower ? d['${field}'] : null`,
                    outlier_upper: `d => d['${field}'] > d.whisker_upper ? d['${field}'] : null`,
                    outlier: `d => (d['${field}'] < d.whisker_lower || d['${field}'] > d.whisker_upper) ? d['${field}'] : null`
                };
                // operate the values
                table = table.derive(rollup1)
                    .derive(rollup2)
                    .derive(rollup3)
                    .derive(rollup4)
                    .derive(rollup5)
                    .derive(rollup6)
                    .derive(rollup7)
                    .derive(rollup8)
                    .select(...(groupby || []), field, 'median', 'q1', 'q3', 'whisker_lower', 'whisker_upper', 'outlier_lower', 'outlier_upper', 'outlier');
            }
            // clear the output - statistics
            let output_columns = ['whisker_lower', 'q1', 'median', 'q3', 'whisker_upper'];
            let rollup_clear = {};
            output_columns.forEach((c) => {
                if (!c.startsWith('outlier')) {
                    rollup_clear[c] = `d => op.mean(d['${c}'])`;
                }
            });
            let role_assigner = `(d) => 'point'`;
            let order_assigner = `(d) => op.indexof(${JSON.stringify(output_columns)}, d.key)`;
            let group_name_assigner = `(d) => ${(groupby || []).map(k => `d['${k}']`).join(` + '_' + `)}`;
            let table_stats = table
                .rollup(rollup_clear)
                .fold([...output_columns])
                .derive({ role: role_assigner, order: order_assigner, group_name: group_name_assigner });
            let records_stats = table_stats.objects();
            // clear the output - outliers
            let rank_assigner = `(d) => op.rank()`;
            let table_outliers = table.filter((d) => d.outlier != null)
                .orderby('outlier')
                .derive({ rank: rank_assigner, group_name: group_name_assigner });
            let records_outliers = table_outliers.objects();
            let outlier_counter_lower = {}, outlier_counter_upper = {};
            for (const outlier of records_outliers) {
                let o = {};
                for (const gkey of (groupby || [])) {
                    o[gkey] = outlier[gkey];
                }
                o.key = 'outlier';
                o.group_name = outlier.group_name;
                o.role = 'outlier';
                o.value = outlier.outlier;
                if (outlier.outlier_lower) {
                    if (outlier_counter_lower[outlier.group_name] === undefined)
                        outlier_counter_lower[outlier.group_name] = 0;
                    outlier_counter_lower[outlier.group_name] += 1;
                    o.order = -outlier_counter_lower[outlier.group_name];
                }
                if (outlier.outlier_upper) {
                    if (outlier_counter_upper[outlier.group_name] === undefined)
                        outlier_counter_upper[outlier.group_name] = 0;
                    outlier_counter_upper[outlier.group_name] += 1;
                    o.order = output_columns.length + outlier_counter_upper[outlier.group_name];
                }
                records_stats.push(o);
            }
            // match the data type
            table = fromTidy$3(records_stats).orderby([...(groupby || []), 'order']).groupby(groupby || []);
            return table.reify();
        }
        else {
            console.warn("No field was provided for the box plot.");
            return _table;
        }
    }

    function doCalculate(table, cal, groupby) {
        let eq = cal.calculate, name_as = cal.as;
        eq = eq.replace(/datum\./gi, 'd.');
        return table.groupby(groupby).derive({
            [name_as]: eq
        });
    }

    function filterTable(table, filter) {
        return table.ungroup().filter(`d => ${filter.replace(/datum\./gi, 'd.')}`).reify();
    }

    function foldTable(table, fold_fields, by, exclude, new_names) {
        let f = table.fold(fold_fields);
        if (exclude) {
            f = f.select(by, 'key', 'value');
        }
        if (new_names) {
            let key = new_names[0] || "key";
            let value = new_names[1] || "value";
            f = f.rename({ key, value });
        }
        return f;
    }

    const fromTidy$2 = aq__namespace.from;
    function generateQuantiles(_table, field, _n, _step, groupby, _as) {
        var _a, _b;
        if (field) {
            let table = _table.reify();
            let n = 25, step = 1 / 25;
            if (_n !== undefined) {
                n = _n;
                step = 1 / n;
            }
            else if (_step !== undefined && 0 < _step && _step < 1) {
                n = Math.round(1 / _step);
                step = 1 / n;
            }
            let asName = _as ? [(_a = _as[0]) !== null && _a !== void 0 ? _a : 'probability', (_b = _as[1]) !== null && _b !== void 0 ? _b : 'value'] : ['probability', 'value'];
            let p_names = [];
            let quantile_rollups = {};
            let bumper = step / 2;
            for (let i = 0; i < n; i++) {
                let q = round((bumper + i * step), -5);
                p_names.push('q_' + (q).toString());
                quantile_rollups['q_' + (q).toString()] = `d => op.quantile(d['${field}'], ${q})`;
            }
            for (const g of groupby) {
                quantile_rollups[g] = `d => op.mode(d['${g}'])`;
            }
            if (groupby && groupby.length > 0)
                table = table.groupby(groupby);
            table = table.rollup(quantile_rollups);
            table = table.fold(p_names);
            // cleaning
            let records = table.objects();
            let new_records = records.map((d) => {
                let o = {};
                for (const g of groupby) {
                    o[g] = d[g];
                }
                o[asName[0]] = parseFloat(d.key.split("_")[1]);
                o[asName[1]] = round(d.value, -5);
                return o;
            });
            return fromTidy$2(new_records);
        }
        else {
            return _table;
        }
    }

    const fromTidy$1 = aq__namespace.from;
    // this is from custom typing
    const randomKDE = vega__namespace.randomKDE, sampleCurve = vega__namespace.sampleCurve;
    // Manipulation of Vega to work with AQ;
    function getKernelDensity(table, field, groupby, cumulative, counts, _bandwidth, _extent, _minsteps, _maxsteps, steps, _as) {
        var _a, _b;
        let method = cumulative ? 'cdf' : 'pdf';
        let asName = _as ? [(_a = _as[0]) !== null && _a !== void 0 ? _a : 'value', (_b = _as[1]) !== null && _b !== void 0 ? _b : 'density'] : ['value', 'density'];
        let bandwidth = _bandwidth;
        let values = [];
        let domain = _extent;
        let minsteps = steps || _minsteps || 25;
        let maxsteps = steps || _maxsteps || 200;
        if (groupby && (groupby === null || groupby === void 0 ? void 0 : groupby.length) > 0) {
            let { groups, names } = aqPartition(table, groupby);
            groups.forEach((group, i) => {
                let g = group.array(field);
                const density = randomKDE(g, bandwidth)[method];
                const scale = counts ? g.length : 1;
                const local = domain || d3.extent(g);
                let curve = sampleCurve(density, local, minsteps, maxsteps);
                curve.forEach((v) => {
                    const t = {
                        [asName[0]]: v[0],
                        [asName[1]]: v[1] * scale,
                    };
                    if (groupby) {
                        for (let j = 0; j < groupby.length; ++j) {
                            t[groupby[j]] = names[i][j];
                        }
                    }
                    values.push(t);
                });
            });
            return fromTidy$1(values).groupby(groupby);
        }
        else {
            let g = table.array(field);
            const density = randomKDE(g, bandwidth)[method];
            const scale = counts ? g.length : 1;
            const local = domain || d3.extent(g);
            let curve = sampleCurve(density, local, minsteps, maxsteps);
            curve.forEach((v) => {
                const t = {
                    [asName[0]]: v[0],
                    [asName[1]]: v[1] * scale,
                };
                values.push(t);
            });
            return fromTidy$1(values);
        }
    }
    function aqPartition(table, groupby) {
        let grouped_table = table.groupby(groupby);
        let group_defs = grouped_table.groups();
        let n_parts = group_defs.size;
        let part_start = group_defs.rows;
        let part_end = part_start.slice(1, n_parts);
        part_end.push(table.numRows());
        let partitions = grouped_table.partitions();
        let tab_re = grouped_table.objects();
        let groups = [], names = [];
        partitions.forEach((p) => {
            let g = fromTidy$1(tab_re.filter((d, i) => p.includes(i)));
            groups.push(g);
            names.push(groupby.map((gb) => g.get(gb)));
        });
        return { groups, names };
    }

    const fromTidy = aq__namespace.from, escape = aq__namespace.escape, aqTable = aq__namespace.table;
    function transformData(data, transforms, dimensions) {
        var _a, _b, _c, _d;
        let table = fromTidy(data);
        let tableInfo = {};
        if ((transforms === null || transforms === void 0 ? void 0 : transforms.constructor.name) === "Array" && transforms.length > 0) {
            for (const transform of transforms) {
                // bin
                if ('bin' in transform && transform.bin) {
                    let old_field_name = transform.bin;
                    let new_field_name = transform.as || old_field_name + "__bin";
                    if (table.column(new_field_name)) {
                        // duplicate binning
                        continue;
                    }
                    let new_field_name2 = transform.end || old_field_name + "__bin_end";
                    if (!dimensions.includes(new_field_name))
                        dimensions.push(new_field_name);
                    if (!dimensions.includes(new_field_name2))
                        dimensions.push(new_field_name2);
                    let { start, end, nBuckets, equiBin } = createBin(((_a = table.column(old_field_name)) !== null && _a !== void 0 ? _a : []), transform);
                    let binned = aqTable({ [new_field_name]: start, [new_field_name2]: end });
                    table = table.assign(binned);
                    // drop na
                    table = table.filter(escape((d) => d[new_field_name] !== undefined && d[new_field_name2] !== undefined));
                    if (!('bin' in tableInfo) || !tableInfo.bin)
                        tableInfo.bin = {};
                    tableInfo.bin[old_field_name] = { nBuckets, equiBin };
                }
                // aggregate
                else if ('aggregate' in transform && transform.aggregate) {
                    let aggregates = transform.aggregate;
                    let groupby = transform.groupby || [];
                    if (groupby === Auto) {
                        groupby = dimensions.filter((d) => table.columnNames().includes(d));
                    }
                    table = doAggregate(table, aggregates, groupby);
                    if (!tableInfo.aggregate)
                        tableInfo.aggregate = {};
                    for (const agg of aggregates) {
                        let field = agg.field, method = agg.op;
                        if (method === "count") {
                            tableInfo.aggregate['__count'] = { method, groupby };
                        }
                        else if (typeof field === 'string') {
                            tableInfo.aggregate[field] = { method, groupby };
                        }
                    }
                }
                // calculate
                else if ('calculate' in transform && transform.calculate) {
                    let groupby = ('groupby' in transform) ? (_b = transform.groupby) !== null && _b !== void 0 ? _b : [] : [];
                    if (groupby === Auto) {
                        groupby = dimensions;
                    }
                    table = doCalculate(table, transform, groupby);
                }
                // fold
                else if ('fold' in transform && transform.fold) {
                    table = foldTable(table, transform.fold, transform.by, transform.exclude, transform.as);
                }
                // density
                else if ('density' in transform && transform.density) {
                    table = getKernelDensity(table, transform.density, transform.groupby, transform.cumulative, transform.counts, transform.bandwidth, transform.extent, transform.minsteps, transform.maxsteps, transform.steps, transform.as);
                }
                // filter
                else if ('filter' in transform && transform.filter) {
                    table = filterTable(table, transform.filter);
                }
                // boxplot
                else if ('boxplot' in transform && transform.boxplot) {
                    let groupby = ('groupby' in transform) ? (_c = transform.groupby) !== null && _c !== void 0 ? _c : [] : [];
                    if (groupby === Auto) {
                        groupby = dimensions.filter((d) => table.columnNames().includes(d));
                    }
                    table = makeBoxPlotTable(table, transform.boxplot, transform.extent, transform.invalid, groupby);
                }
                // quantiles
                else if ('quantile' in transform && transform.quantile) {
                    let groupby = ('groupby' in transform) ? (_d = transform.groupby) !== null && _d !== void 0 ? _d : [] : [];
                    if (groupby === Auto) {
                        groupby = dimensions.filter((d) => table.columnNames().includes(d));
                    }
                    table = generateQuantiles(table, transform.quantile, transform.n, transform.step, groupby, transform.as);
                }
            }
        }
        let output = InternalData.from(table.objects());
        output.tableInfo = tableInfo;
        return output;
    }
    function orderArray(data, orders) {
        let outcome, sortFunctions = [];
        for (const ord of orders) {
            let key = ord.key;
            if ('order' in ord && ord.order) {
                let sortFn = makeIndexSortFn(key, ord.order);
                sortFunctions.push(sortFn);
            }
            else if ('sort' in ord && (ord.sort === "ascending" || ord.sort === true || ord.sort === "asc")) {
                let sortFn = makeAscSortFn(key);
                sortFunctions.push(sortFn);
            }
            else if ('sort' in ord && (ord.sort === "descending" || ord.sort === "desc")) {
                let sortFn = makeDescSortFn(key);
                sortFunctions.push(sortFn);
            }
        }
        sortFunctions.reverse();
        if (sortFunctions.length > 0) {
            outcome = data.toSorted((a, b) => {
                for (const fn of sortFunctions) {
                    if (fn(a, b) > 0)
                        return 1;
                    else if (fn(a, b) < 0)
                        return -1;
                }
                return 1;
            });
        }
        return outcome || data;
    }

    function applyTransforms(data, spec) {
        // transformations
        let forced_dimensions = Object.keys(spec.encoding).map((d) => {
            let enc = spec.encoding[d];
            if ('type' in enc && enc.type && [NOM, ORD, TMP].includes(enc.type)) {
                return enc.field;
            }
            else if (d === REPEAT_chn) {
                return enc.field;
            }
        }).filter((d) => d);
        data = transformData(data, [...(spec.common_transform || []), ...(spec.transform || [])], unique(forced_dimensions));
        return data;
    }

    function getData(dataDef, loaded_datasets, datasets) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            if ('values' in dataDef && dataDef.values) {
                return deepcopy(dataDef.values);
            }
            else if ('name' in dataDef && dataDef.name) {
                if (!loaded_datasets[dataDef.name]) {
                    loaded_datasets[dataDef.name] = yield _getData(datasets[dataDef.name]);
                }
                data = deepcopy(loaded_datasets[dataDef.name]);
            }
            else {
                data = yield _getData(dataDef);
            }
            return data;
        });
    }
    function _getData(data_spec) {
        return __awaiter(this, void 0, void 0, function* () {
            if ('values' in data_spec && (data_spec === null || data_spec === void 0 ? void 0 : data_spec.values)) {
                return data_spec.values;
            }
            else if ('url' in data_spec && (data_spec === null || data_spec === void 0 ? void 0 : data_spec.url)) {
                let read = yield (yield fetch(data_spec.url)).text();
                if (isJSON(read)) {
                    return JSON.parse(read);
                }
                else if (isCSV(read)) {
                    return d3.csvParse(read);
                }
                else if (isTSV(read)) {
                    return d3.tsvParse(read);
                }
            }
            else {
                console.error("wrong data format provided");
                return [];
            }
        });
    }
    // not understanding this
    // else if (data_spec?.data?.values) {
    //   return data_spec.data.values;
    // } else if (data_spec?.csv) {
    //   return csvParse(data_spec?.csv);
    // } else if (data_spec?.tsv) {
    //   return tsvParse(data_spec.tsv);
    // }

    // todo: check DescriptionMarkupQueueItem complies with a QueueItem
    // WORKFLOW
    // input "markup expression" (string)
    // -> compiler 
    // |  -> parser (format check, parse into interpretable formats)
    // |  |  -> Determine literal (free string) / keyword (<...>)
    // |  |  &  Parse keyword item
    // |  |  => return KeyedDescItem[]
    // |  => return ParsedDescMarkup[]
    // => return DescriptionMarkupQueueItem[] (playable Queue)
    // regex for parsing
    // overall formatting to determine parsability of a markup expression
    const exprRegex = /(\<[^\<\>]+\>|[^\<\>]+)/g;
    // parsing each semgent of a markup element <...>
    const descSegmentRegex = /(([a-zA-Z0-9\.]+=\"[^\"]+\")|[a-zA-Z\.0-9\[\]]+)/g;
    // markup compiler (generating queue items)
    // note: what is scale?
    function compileDescriptionMarkup(expression, channel, scale, speechRate, timeUnit) {
        var _a, _b, _c, _d, _e;
        if (expression.length == 0 || !expression)
            return [];
        let exprParsed = parseDescriptionMarkup(expression);
        if (exprParsed != null) {
            let scaleProps = (_a = scale.properties) !== null && _a !== void 0 ? _a : {};
            let preQueue = [];
            for (const seg of exprParsed) {
                if (seg.type === M_Text) {
                    let item = {
                        type: M_Text,
                        text: seg.text,
                        speechRate
                    };
                    preQueue.push(item);
                }
                else {
                    // implicit: seg.type === "keyword"
                    if (seg.key === M_Sound) {
                        let item = {
                            type: M_Sound,
                            continuous: false,
                            value: undefined,
                            duration: 0
                        };
                        if (seg.value instanceof Array) {
                            // <sound v0="X0" vN="XN" duration="D">
                            item.continuous = true;
                            item.value = (_b = seg.value) === null || _b === void 0 ? void 0 : _b.map((v) => getLKvalues(v, channel, scaleProps, timeUnit));
                        }
                        else {
                            // <sound value="X" duration="D">
                            item.continuous = false;
                            item.value = getLKvalues(seg.value, channel, scaleProps, timeUnit);
                        }
                        if (seg.duration) {
                            item.duration = seg.duration;
                        }
                        else {
                            // computing duration for underspeicifed or discrete items
                            if (item.continuous && item.value instanceof Array)
                                item.duration = (timeUnit === 'beat' ? 1 : 0.5) * (((_c = item.value) === null || _c === void 0 ? void 0 : _c.length) || 0);
                            else
                                item.duration = (timeUnit === 'beat' ? 1 : 0.5);
                        }
                        preQueue.push(item);
                    }
                    else if (seg.key === "list") {
                        // <list item="P,Q,..." first="F" last="L" join="J" and="A">
                        let items = seg.item;
                        let elements = undefined;
                        if (!items) {
                            elements = [getKeywordValues('domain', channel, scaleProps, timeUnit)];
                        }
                        else if (items != undefined && items instanceof Array) {
                            elements = items === null || items === void 0 ? void 0 : items.map((d) => {
                                if (d.keyword)
                                    getKeywordValues(d.keyword, channel, scaleProps, timeUnit);
                                else
                                    return d.literal;
                            }).flat();
                        }
                        let formatter = (d) => d;
                        if (scaleProps === null || scaleProps === void 0 ? void 0 : scaleProps.format) {
                            if (scaleProps.formatType === "number")
                                formatter = d3.format(scaleProps.format);
                            else if (scaleProps.formatType === "datetime")
                                formatter = d3.timeFormat(scaleProps.format);
                        }
                        if (elements instanceof Array) {
                            elements = elements.map((d) => typeof d === 'number' ? formatter(d) : d);
                            let first = seg.first;
                            let last = seg.last;
                            let item = { type: 'text' };
                            let textItems = [];
                            if (first)
                                textItems.push(...elements.slice(0, first));
                            if (last)
                                textItems.push(...elements.slice(elements.length - last, elements.length));
                            let join = ((_d = seg.join) === null || _d === void 0 ? void 0 : _d.literal) || ", ", and = (_e = seg.and) === null || _e === void 0 ? void 0 : _e.literal;
                            item.text = listString(textItems, join, and ? true : false, and);
                            item.speechRate = speechRate;
                            preQueue.push(item);
                        }
                    }
                    else {
                        if (seg.key) {
                            let text = getKeywordValues(seg.key, channel, scaleProps, timeUnit);
                            let formatter = (d) => ((d === null || d === void 0 ? void 0 : d.toString()) || '');
                            if (scaleProps.format) {
                                if (scaleProps.formatType === "number")
                                    formatter = d3.format(scaleProps.format);
                                else if (scaleProps.formatType === "datetime")
                                    formatter = d3.timeFormat(scaleProps.format);
                            }
                            if (text && typeof text === 'number')
                                text = formatter(text);
                            else if (typeof text !== 'string')
                                text = formatter(text);
                            else
                                text = '';
                            preQueue.push({
                                type: 'text',
                                text: text,
                                speechRate
                            });
                        }
                    }
                }
            }
            // flatten (merging text outputs)
            let queue = [];
            for (const item of preQueue) {
                if (queue.length > 0
                    && queue[queue.length - 1].type === M_Text
                    && item.type === M_Text && item.text) {
                    queue[queue.length - 1].text += (item.text.startsWith(".") ? "" : " ") + item.text.trim();
                }
                else {
                    queue.push(item);
                }
            }
            return queue;
        }
        return [];
    }
    function getLKvalues(item, channel, scaleProps, timeUnit) {
        if (item === null || item === void 0 ? void 0 : item.literal)
            return item.literal;
        else if (item === null || item === void 0 ? void 0 : item.keyword)
            return getKeywordValues(item.keyword, channel, scaleProps, timeUnit);
        else
            return undefined;
    }
    function getKeywordValues(keyword, channel, scaleProps, timeUnit) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        if (keyword === DescKeyDomain) {
            return (_b = (_a = scaleProps.domain) === null || _a === void 0 ? void 0 : _a.join(", ")) !== null && _b !== void 0 ? _b : "";
        }
        else if (keyword === DescKeyDomainMin) {
            return Math.min(...((_c = scaleProps.domain) !== null && _c !== void 0 ? _c : []));
        }
        else if (keyword === DescKeyDomainMax) {
            return Math.max(...((_d = scaleProps.domain) !== null && _d !== void 0 ? _d : []));
        }
        else if (keyword.match(DescKeyDomainNumberedRegex) != null) {
            let i = parseInt(keyword.match(DescKeyDomainNumberedRegex)[0]);
            return (_f = (_e = scaleProps.domain) === null || _e === void 0 ? void 0 : _e[i]) !== null && _f !== void 0 ? _f : "";
        }
        else if (keyword === DescKeyDomainLength) {
            return (_h = (_g = scaleProps.domain) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0;
        }
        if (keyword === DescKeyRange) {
            return (_k = (_j = scaleProps.range) === null || _j === void 0 ? void 0 : _j.join(", ")) !== null && _k !== void 0 ? _k : "";
        }
        else if (keyword === DescKeyRangeLength) {
            if (channel === TIME_chn)
                return scaleProps.length;
            else
                return Math.max(...((_l = scaleProps.range) !== null && _l !== void 0 ? _l : [])) - Math.min(...((_m = scaleProps.range) !== null && _m !== void 0 ? _m : []));
        }
        else if (keyword === DescKeyChannel) {
            return channel;
        }
        else if (keyword === DescKeyField) {
            return (_p = (_o = scaleProps.field) === null || _o === void 0 ? void 0 : _o.join(", ")) !== null && _p !== void 0 ? _p : "";
        }
        else if (keyword === DescKeyTitle) {
            return (_q = scaleProps.title) !== null && _q !== void 0 ? _q : "";
        }
        else if (keyword === DescKeyAggregate) {
            return (_r = scaleProps.aggregate) !== null && _r !== void 0 ? _r : "";
        }
        else if (keyword === DescKeyTimeUnit) {
            return timeUnit !== null && timeUnit !== void 0 ? timeUnit : "";
        }
    }
    // markup parser
    function parseDescriptionMarkup(expression) {
        // for each chunk of an expression;
        let expr = expression.trim(), hasPeriodAtTheEnd = false;
        if (expr.endsWith(".")) {
            expr = expr.substring(0, expr.length - 1);
            hasPeriodAtTheEnd = true;
        }
        let exprGroups = expr.match(exprRegex);
        if (exprGroups == null) {
            console.error(`Wrong description expression (not parsable): ${expression}.`);
            return null;
        }
        else {
            let parsed = [];
            for (const exprSeg of exprGroups) {
                if (exprSeg.startsWith("<")) {
                    // sound item or other item should be replaced
                    let segParsed = parseDescriptionKeywords(exprSeg);
                    if (segParsed != null) {
                        parsed.push(segParsed);
                    }
                }
                else {
                    // pure text
                    parsed.push({
                        type: 'text',
                        text: exprSeg
                    });
                }
            }
            if (parsed[parsed.length - 1].type === "text" && hasPeriodAtTheEnd) {
                parsed[parsed.length - 1].text += ".";
            }
            return parsed;
        }
    }
    // keyword parser (atomic)
    function parseDescriptionKeywords(exprSeg) {
        // for keyworded expressions <...>
        // match if it fits the format
        let parsed = exprSeg.match(descSegmentRegex);
        if (parsed == null) {
            console.error(`Wrong description keyword expression: ${exprSeg}.`);
            return null;
        }
        else {
            // all are keyworded items
            let output = {
                type: 'keyword'
            };
            parsed.forEach((p, i) => {
                var _a;
                if (i == 0) {
                    // determining the initial keywords from descriptionKeywords
                    if (descriptionKeywords.includes(p))
                        output.key = p;
                    else if (p.match(/domain\[[0-9]+\]/g))
                        output.key = p;
                    else
                        console.error(`Unidentifiable keyword: ${p}.`);
                }
                else {
                    // rest values taking form of `{index}="{value}"`;
                    let ps = p.split("=");
                    let value = ps[1].trim().replace(/\"/gi, '');
                    let index = ps[0].trim();
                    if (index === "duration") {
                        // duration="0.3", how long it should be if it is a sound
                        output.duration = parseFloat(value);
                    }
                    else if (index === "first") {
                        // first="N(number)": first N items to readout
                        output.first = parseInt(value);
                    }
                    else if (index === "last") {
                        // last="N(number)": last N items to readout
                        output.last = parseInt(value);
                    }
                    else if (index === "item") {
                        // item="A,B,C,...,Z": a list of items to readout no brackets 
                        let valueItems = value.split(",").map(d => d.trim());
                        output.item = [];
                        valueItems.forEach(item => {
                            var _a;
                            // for each value
                            (_a = output.item) === null || _a === void 0 ? void 0 : _a.push(determineKLValue(item));
                        });
                    }
                    else if (index === "value") {
                        // value="X": a data value to map to a sound
                        output.value = determineKLValue(value);
                    }
                    else if (index === "values") {
                        // values="A,B,...,Z"
                        // when values are provided as a list
                        let valueItems = value.split(",").map(d => d.trim());
                        output.value = [];
                        valueItems.forEach(item => {
                            var _a;
                            // for each value
                            (_a = output.value) === null || _a === void 0 ? void 0 : _a.push(determineKLValue(item));
                        });
                    }
                    else if (((_a = index.match(/v[0-9]+/g)) === null || _a === void 0 ? void 0 : _a.length) == 1) {
                        // when provided as indexed values
                        // v0="33" v1="22"...
                        if (!output.value)
                            output.value = [];
                        let vi = parseInt(ps[0].substring(1));
                        output.value[vi] = determineKLValue(value);
                    }
                    else if (index === "join") {
                        // join=", "; joining list elements
                        output.join = { literal: value };
                    }
                    else if (index === "and") {
                        // join=", "; joining list elements
                        output.and = { literal: value };
                    }
                    else if (index === "speechRate") {
                        output.speechRate = parseFloat(value);
                    }
                }
            });
            return output;
        }
    }
    // sort out literal and keyworded values
    function determineKLValue(value) {
        if (descriptionKeywords.includes(value)) {
            // the value is a keyword
            return { keyword: value };
        }
        else if (value.match(DescKeyDomainNumberedRegex)) {
            // the value is a keyword for domain indexing
            return { keyword: value };
        }
        else {
            // the value is literal list
            return { literal: value };
        }
    }

    function makeScaleDescription(scale, encoding, dataInfo, tickDef, tone_spec, config, beat) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        let properties = scale.properties;
        let channel = properties.channel; properties.field; let encodingType = properties.encodingType;
        let timeUnit = beat ? 'beat' : (((_a = config === null || config === void 0 ? void 0 : config.timeUnit) === null || _a === void 0 ? void 0 : _a.unit) || TU_SEC);
        if ((properties === null || properties === void 0 ? void 0 : properties.descriptionDetail) === SKIP || (properties === null || properties === void 0 ? void 0 : properties.descriptionDetail) === null) {
            return null;
        }
        let expression = '', customExpression = false;
        let speechRate = config.speechRate || DEF_SPEECH_RATE;
        if (typeof (properties === null || properties === void 0 ? void 0 : properties.descriptionDetail) === 'string' && (properties === null || properties === void 0 ? void 0 : properties.descriptionDetail) !== NONSKIP) {
            expression = properties === null || properties === void 0 ? void 0 : properties.descriptionDetail;
            customExpression = true;
            return [{
                    type: TextType, speech: properties === null || properties === void 0 ? void 0 : properties.descriptionDetail, speechRate
                }];
        }
        let title = ((_b = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _b === void 0 ? void 0 : _b.title) || listString(unique((_c = properties.field) !== null && _c !== void 0 ? _c : []), ", ", false);
        if (channel === TIME_chn) {
            if (!customExpression)
                expression = `The <title> is mapped to <channel>. `;
            let length = properties.range ? Math.max(...properties.range) : null;
            if (length) {
                if (!customExpression)
                    expression += `The duration of the stream is <range.length> <timeUnit>. `;
            }
            if (properties.binned) {
                if ((dataInfo === null || dataInfo === void 0 ? void 0 : dataInfo.bin) && encoding.field && typeof encoding.field === 'string' && encoding.field in (dataInfo === null || dataInfo === void 0 ? void 0 : dataInfo.bin) && ((_e = (_d = dataInfo === null || dataInfo === void 0 ? void 0 : dataInfo.bin) === null || _d === void 0 ? void 0 : _d[encoding.field]) === null || _e === void 0 ? void 0 : _e.equiBin)) {
                    if (!customExpression)
                        expression += `Each sound represents a equally sized bin bucket. `;
                }
                else {
                    if (!customExpression)
                        expression += `The length of each sound represents the corresponding bin bucket size. `;
                }
            }
            if ((tickDef === null || tickDef === void 0 ? void 0 : tickDef.interval) && (tickDef === null || tickDef === void 0 ? void 0 : tickDef.description) !== SKIP) {
                if (!customExpression)
                    expression += `A tick sound is played every ${tickDef.interval} ${timeUnit}. `;
            }
        }
        else {
            if (encodingType === QUANT) {
                if (title && properties.aggregate && properties.aggregate !== 'count') {
                    if (!customExpression)
                        expression += `The <title> is mapped to <channel> and aggregated by <aggregate>. `;
                }
                else if (properties.aggregate === 'count') {
                    if (!customExpression)
                        expression = `The count of data points is mapped to <channel>. `;
                }
                else {
                    if (!customExpression)
                        expression = `The <title> is mapped to <channel>. `;
                }
                if (tone_spec.continued) {
                    if (((_f = properties === null || properties === void 0 ? void 0 : properties.domain) === null || _f === void 0 ? void 0 : _f.length) == 2) {
                        if (!customExpression)
                            expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.6">`;
                    }
                    else if (((_h = (_g = properties === null || properties === void 0 ? void 0 : properties.domain) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0) > 2) {
                        if (!customExpression)
                            expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound values="${(_j = properties.domain) === null || _j === void 0 ? void 0 : _j.map((_, i) => 'domain[' + i + ']')}" duration="${((_l = (_k = properties.domain) === null || _k === void 0 ? void 0 : _k.length) !== null && _l !== void 0 ? _l : 0) * 0.3}">`;
                    }
                }
                else {
                    if (((_m = properties === null || properties === void 0 ? void 0 : properties.domain) === null || _m === void 0 ? void 0 : _m.length) == 2) {
                        if (!customExpression)
                            expression += `The minimum value <domain.min> is mapped to <sound value="domain.min" duration="0.3">, and `;
                        if (!customExpression)
                            expression += `the maximum value <domain.max> is mapped to <sound value="domain.max" duration="0.3">.`;
                    }
                    else if (((_p = (_o = properties === null || properties === void 0 ? void 0 : properties.domain) === null || _o === void 0 ? void 0 : _o.length) !== null && _p !== void 0 ? _p : 0) > 2) {
                        if (!customExpression) {
                            expression += `<title> values are mapped as`;
                            for (let i = 0; i < ((_r = (_q = properties.domain) === null || _q === void 0 ? void 0 : _q.length) !== null && _r !== void 0 ? _r : 0); i++) {
                                expression += `<domain[${i}]> <sound value="domain[${i}]" duration="0.3">`;
                            }
                        }
                    }
                }
            }
            else if (encodingType === TMP) {
                if (title && properties.aggregate && properties.aggregate !== 'count') {
                    if (!customExpression)
                        expression += `The <title> is mapped to <channel> and aggregated by <aggregate>. `;
                }
                else if (properties.aggregate === 'count') {
                    if (!customExpression)
                        expression += `The count of data points is mapped to <channel>. `;
                }
                else {
                    if (!customExpression)
                        expression += `The <title> is mapped to <channel>. `;
                }
                if (tone_spec.continued) {
                    if (!customExpression)
                        expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.6">. `;
                }
                else {
                    if (!customExpression)
                        expression += `The minimum value <domain.min> is mapped to <sound value="domain.min" duration="0.5">, and `;
                    if (!customExpression)
                        expression += `the maximum value <domain.max> is mapped to <sound value="domain.max" duration="0.5">. `;
                }
            }
            else if (encodingType === ORD || encodingType === NOM) {
                if (!customExpression)
                    expression += `The <title> is mapped to <channel>. `;
                let domainCount = (_t = (_s = properties.domain) === null || _s === void 0 ? void 0 : _s.length) !== null && _t !== void 0 ? _t : 0;
                if (domainCount <= 6 || properties.playAllDescription) {
                    for (let i = 0; i < domainCount; i++) {
                        if (!customExpression)
                            expression += `The value <domain[${i}]> is <sound value="domain[${i}]" duration="0.3">. `;
                    }
                }
                else {
                    if (!customExpression)
                        expression += `The first value <domain[${0}]> is <sound value="domain[${0}]" duration="0.3">. `;
                    if (!customExpression)
                        expression += `The second value <domain[${1}]> is <sound value="domain[${1}]" duration="0.3">. `;
                    if (!customExpression)
                        expression += `The second last value <domain[${domainCount - 2}]> is <sound value="domain[${domainCount - 2}]" duration="0.3">. `;
                    if (!customExpression)
                        expression += `The last value <domain[${domainCount - 1}]> is <sound value="domain[${domainCount - 1}]" duration="0.3">. `;
                }
            }
            else if (encodingType === STATIC) {
                if (properties.conditions) {
                    for (const cond of properties.conditions) {
                        if (cond.test && cond.name) {
                            let d;
                            if (cond.test instanceof Array) {
                                d = cond.test[0];
                            }
                            else if (cond.test instanceof Object && ((_u = cond.test) === null || _u === void 0 ? void 0 : _u.not) && cond.test.not instanceof Array) {
                                (_v = cond.test.not) === null || _v === void 0 ? void 0 : _v[0];
                            }
                            if (!customExpression && d !== undefined)
                                expression += `${cond.name} values are mapped to <sound value="${d}" duration="0.3>. `;
                        }
                        else if (cond.test instanceof Array) {
                            if (!customExpression)
                                expression += `The values of <list item="${cond.test.join(',')}" join=", "> are mapped to <sound value="${cond.test[0]}" duration="0.3>. `;
                        }
                        else if (cond.test instanceof Object && ((_w = cond.test) === null || _w === void 0 ? void 0 : _w.not) && cond.test.not instanceof Array) {
                            if (!customExpression)
                                expression += `The values that are not <list item="${cond.test.not.join(',')}" join=", "> are mapped to <sound value="${cond.test.not[0]}" duration="0.3>. `;
                        }
                    }
                }
            }
        }
        let parsedExprDesc = compileDescriptionMarkup(expression, channel, scale, speechRate, timeUnit);
        let descList = [];
        for (const pDesc of parsedExprDesc) {
            if (pDesc.type === M_Text) {
                descList.push({
                    type: TextType,
                    channel,
                    speech: pDesc.text,
                    speechRate: pDesc.speechRate || speechRate
                });
            }
            else if (pDesc.type === M_Sound) {
                if (pDesc.continuous) {
                    let sounds = makeConinuousAudioLegend(channel, pDesc.value, scale, pDesc.duration);
                    descList.push({
                        type: ToneSeries, channel, sounds, instrument_type: (tone_spec === null || tone_spec === void 0 ? void 0 : tone_spec.type) || "default", continued: true
                    });
                }
                else {
                    let sound = makeSingleDiscAudioLegend(channel, pDesc.value, scale, pDesc.duration);
                    descList.push({
                        type: ToneType,
                        channel,
                        sound,
                        instrument_type: (tone_spec === null || tone_spec === void 0 ? void 0 : tone_spec.type) || "default"
                    });
                }
            }
        }
        return descList;
    }
    function makeConinuousAudioLegend(channel, domain, scale, duration) {
        let min = Math.min(...domain), max = Math.max(...domain);
        let normalizer = (d) => (d - min) / (max - min) * duration;
        let timing = d3.scaleLinear().domain(domain).range(domain.map(normalizer));
        let sounds = [];
        let i = 0;
        for (const d of domain) {
            if (isDefaultGlyphFeature(channel)) {
                sounds.push({
                    start: timing(d),
                    [channel]: scale(d),
                    duration: (i == domain.length - 1 ? 0.15 : 0)
                });
            }
            else {
                sounds.push({
                    start: timing(d),
                    others: { [channel]: scale(d) },
                    duration: (i == domain.length - 1 ? 0.15 : 0)
                });
            }
            i++;
        }
        return sounds;
    }
    function makeSingleDiscAudioLegend(channel, value, scale, duration) {
        let sound = isDefaultGlyphFeature(channel) ? {
            start: 0,
            [channel]: scale(value),
        } : {
            start: 0,
            others: { [channel]: scale(value) },
        };
        if (sound.duration == undefined) {
            sound.duration = duration || 0.2;
        }
        return sound;
    }

    function makeBeatFunction(tempo) {
        return (beat) => {
            return beat * 60 / tempo;
        };
    }
    function makeBeatRounder(tempo, r) {
        return (sec) => {
            if (typeof sec !== 'number')
                return sec;
            let beats = sec / tempo * 60;
            return Math.round(beats / r) * r;
        };
    }

    function makeFieldedScaleFunction(channel, encoding, values, // for the shape
    info, // for the shape
    data) {
        let scaleProperties = {
            channel,
            encodingType: encoding.type
        };
        let mapper = {};
        let findKey = encoding.scale.range.field;
        let encKey = encoding.field[0];
        for (const datum of data) {
            let r = datum[findKey];
            if ((channel === PITCH_chn) && typeof r !== 'number') {
                r = noteToFreq(r);
            }
            mapper[datum[encKey]] = r;
        }
        scaleProperties.rangeProvided = true;
        scaleProperties.domain = Object.keys(mapper);
        scaleProperties.range = Object.values(mapper);
        // make the scale function
        // @ts-ignore
        let scaleFunction = (k) => {
            return mapper[k];
        };
        scaleFunction.properties = scaleProperties;
        return scaleFunction;
    }

    const QuantPreferredRange = {
        [TIME_chn]: [0, 5],
        [PITCH_chn]: [200, 1000],
        [LOUDNESS_chn]: [0, 1],
        [PAN_chn]: [-1, 1],
        [DUR_chn]: [0, 1.5],
        [POST_REVERB_chn]: [0, 2],
        [TAPCNT_chn]: [0, 20],
        [TAPSPD_chn]: [0, 5]
    };
    const NomPalletes = {
        [PITCH_chn]: [
            'C3', 'C4', 'C5', 'C6',
            'G3', 'G4', 'G5', 'G6',
            'D3', 'D4', 'D5', 'D6',
            'A3', 'A4', 'A5', 'A6',
            'E3', 'E4', 'E5', 'E6',
            'B3', 'B4', 'B5', 'B6',
            'F3', 'F4', 'F5', 'F6'
        ].map(noteToFreq),
        [LOUDNESS_chn]: [
            1, 0.8, 0.6, 0.4, 0.2, 0.9, 0.7, 0.5, 0.1
        ],
        [DUR_chn]: [1, 0.5, 1.5, 2, 1.3, 0.8, 0.3],
        [POST_REVERB_chn]: [1, 0.5, 1.5, 2, 1.3, 0.8, 0.3],
        [TAPCNT_chn]: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
        [TAPSPD_chn]: [1, 2, 3, 4],
        [TIMBRE_chn]: ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"]
    };
    function repeatPallete(pallete, len) {
        let pLen = pallete === null || pallete === void 0 ? void 0 : pallete.length;
        if (pLen >= len) {
            return pallete.slice(0, len);
        }
        else {
            let repeats = Math.floor(pLen / len);
            let remains = len - repeats * pLen;
            let output = [];
            for (let i = 0; i < repeats; i++) {
                output.push(...pallete);
            }
            output.push(...pallete.slice(0, remains));
            return output;
        }
    }

    function getChannelThresholds(channel, extraChannelType) {
        var _a, _b, _c, _d;
        let min = ((_a = ChannelThresholds[channel]) === null || _a === void 0 ? void 0 : _a.max)
            || ((_b = ChannelThresholds[extraChannelType]) === null || _b === void 0 ? void 0 : _b.max), max = ((_c = ChannelThresholds[channel]) === null || _c === void 0 ? void 0 : _c.min)
            || ((_d = ChannelThresholds[extraChannelType]) === null || _d === void 0 ? void 0 : _d.min);
        return [min, max];
    }
    function getChannelCaps(channel, extraChannelType) {
        var _a, _b, _c, _d;
        let min = ((_a = ChannelCaps[channel]) === null || _a === void 0 ? void 0 : _a.max)
            || ((_b = ChannelCaps[extraChannelType]) === null || _b === void 0 ? void 0 : _b.max), max = ((_c = ChannelCaps[channel]) === null || _c === void 0 ? void 0 : _c.min)
            || ((_d = ChannelCaps[extraChannelType]) === null || _d === void 0 ? void 0 : _d.min);
        return [min, max];
    }

    function makeNominalScaleFunction(channel, encoding, values, info) {
        var _a;
        let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
        let extraChannelType = (_a = FilterExtraChannelTypes[channel]) === null || _a === void 0 ? void 0 : _a.type;
        // thresholds
        const [CHN_CAP_MAX, CHN_CAP_MIN] = getChannelCaps(channel, extraChannelType);
        let scaleDef = encoding === null || encoding === void 0 ? void 0 : encoding.scale;
        let scaleProperties = {
            channel,
            encodingType: encoding.type
        };
        // domain
        let domain = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain) || null);
        if (!domain) {
            domain = unique(values);
        }
        scaleProperties.domain = domain;
        // range (fielded range is already treated)
        let range = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) || null);
        let rangeProvided = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) !== undefined;
        if (times && !rangeProvided) {
            range = domain.map(d => d * times);
            scaleProperties.times = times;
        }
        if (!rangeProvided && channel !== REPEAT_chn) {
            let init_pallet = NomPalletes[channel] || NomPalletes[extraChannelType];
            if (!init_pallet)
                console.error("No initial pallete provided");
            else
                range = repeatPallete(init_pallet, domain.length);
        }
        else if (channel === REPEAT_chn) {
            range = domain.map((d, i) => i);
        }
        else {
            scaleProperties.rangeProvided = rangeProvided;
        }
        // note for pitch  -> freq 
        if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every((d) => typeof d === "number")) {
            range = range === null || range === void 0 ? void 0 : range.map(noteToFreq);
        }
        range = range === null || range === void 0 ? void 0 : range.map((d) => {
            if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
                return d;
            }
            else {
                if (d < CHN_CAP_MIN) {
                    console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
                    return CHN_CAP_MIN;
                }
                else if (d > CHN_CAP_MAX) {
                    console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
                    return CHN_CAP_MAX;
                }
                else {
                    return d;
                }
            }
        });
        scaleProperties.range = range;
        // make the scale function
        // @ts-ignore
        let scaleFunction = d3.scaleOrdinal().domain(domain).range(range);
        scaleFunction.properties = scaleProperties;
        return scaleFunction;
    }

    function makeOrdinalScaleFunction(channel, encoding, values, info) {
        var _a;
        let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
        let extraChannelType = (_a = FilterExtraChannelTypes[channel]) === null || _a === void 0 ? void 0 : _a.type;
        // thresholds
        const [CHN_MAX, CHN_MIN] = getChannelThresholds(channel, extraChannelType);
        const [CHN_CAP_MAX, CHN_CAP_MIN] = getChannelCaps(channel, extraChannelType);
        let scaleDef = encoding === null || encoding === void 0 ? void 0 : encoding.scale;
        let scaleProperties = {
            channel,
            encodingType: encoding.type,
            polarity,
        };
        let sort = encoding.sort;
        let sortFunction;
        if (sort === "descending" || sort === "desc") {
            sortFunction = d3.descending;
            scaleProperties.sort = "descending";
        }
        else {
            sortFunction = d3.ascending;
            scaleProperties.sort = "ascending";
        }
        // domain
        let domain = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain) || null);
        if (!domain) {
            domain = unique(values).toSorted(sortFunction);
        }
        scaleProperties.domain = domain;
        // range (fielded range is already treated)
        let range = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) || null);
        let rangeProvided = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) !== undefined;
        if (times && !rangeProvided) {
            range = domain.map(d => d * times);
            rangeProvided = true;
            scaleProperties.times = times;
        } // to skip the below changes when `times` is present while range is not.
        let rangeMin = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.rangeMin, rangeMax = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.rangeMax;
        // for timbre (not recommnded), skips the below transformations
        if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
            range = repeatPallete(NomPalletes[TIMBRE_chn], domain.length);
            rangeProvided = true;
        }
        let scaleOutRange;
        if (!rangeProvided && maxDistinct) {
            scaleOutRange = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
        }
        else if (!rangeProvided && !maxDistinct) {
            let p = QuantPreferredRange[channel];
            if (p)
                scaleOutRange = [getFirstDefined(rangeMin, p[0], CHN_MIN), getFirstDefined(rangeMax, p[1], CHN_MAX)];
        }
        // match the count
        if (scaleOutRange && !rangeProvided) {
            range = divideOrdScale(scaleOutRange, domain.length);
        }
        // note for pitch  -> freq 
        if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every((d) => typeof d === "number")) {
            range = range.map(noteToFreq);
        }
        range = range.map((d, i) => {
            if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
                return d;
            }
            else {
                if (d < CHN_CAP_MIN) {
                    console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
                    return CHN_CAP_MIN;
                }
                else if (d > CHN_CAP_MAX) {
                    console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
                    return CHN_CAP_MAX;
                }
                else {
                    return d;
                }
            }
        });
        // polarity (only works when a range is not provided)
        if (!rangeProvided) {
            if (domain[0] < domain[1] && polarity === NEG) {
                range = range.reverse();
            }
            else if (domain[0] > domain[1] && polarity === POS) {
                range = range.reverse();
            }
        }
        scaleProperties.range = range;
        // make the scale function
        //@ts-ignore
        let scaleFunction = d3.scaleOrdinal().domain(domain).range(range);
        scaleFunction.properties = scaleProperties;
        return scaleFunction;
    }
    function divideOrdScale(biRange, len) {
        if (len < 1)
            return [];
        else if (len == 1)
            return [(biRange[0] + biRange[1]) / 2];
        let rLen = len;
        let max = biRange[1];
        let min = biRange[0];
        if (min != 0)
            rLen = len - 1;
        let gap = (max - min) / rLen;
        let o = [];
        for (let j = min; j <= max; j += gap) {
            o.push(j);
        }
        return o.slice(len == rLen ? 1 : 0, rLen + 1);
    }

    function makeQuantitativeScaleFunction(channel, encoding, values, info) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
        let extraChannelType = (_a = FilterExtraChannelTypes[channel]) === null || _a === void 0 ? void 0 : _a.type;
        // thresholds
        const [CHN_MAX, CHN_MIN] = getChannelThresholds(channel, extraChannelType);
        const [CHN_CAP_MAX, CHN_CAP_MIN] = getChannelCaps(channel, extraChannelType);
        let scaleDef = encoding === null || encoding === void 0 ? void 0 : encoding.scale;
        let scaleProperties = {
            channel,
            encodingType: encoding.type,
            polarity,
        };
        if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
            console.error("Timber channel can't be quantitatively scaled.");
        }
        // domain
        let domain = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain) || null), domainSpecified = false;
        if (((_b = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _b === void 0 ? void 0 : _b.domainMin) !== undefined || ((_c = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _c === void 0 ? void 0 : _c.domainMax) !== undefined || ((_d = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _d === void 0 ? void 0 : _d.domainMid) !== undefined) {
            domain = [
                ((_e = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _e === void 0 ? void 0 : _e.domainMin) !== undefined ? (_f = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _f === void 0 ? void 0 : _f.domainMin : domainMin,
                ((_g = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _g === void 0 ? void 0 : _g.domainMax) !== undefined ? (_h = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _h === void 0 ? void 0 : _h.domainMax : domainMax
            ];
            if (channel === PAN_chn && (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domainMid) !== undefined) {
                domain.splice(1, 0, scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domainMid);
                domainSpecified = [((_j = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _j === void 0 ? void 0 : _j.domainMin) !== undefined, ((_k = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _k === void 0 ? void 0 : _k.domainMid) !== undefined, ((_l = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _l === void 0 ? void 0 : _l.domainMax) !== undefined];
            }
            else {
                domainSpecified = [((_m = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _m === void 0 ? void 0 : _m.domainMin) !== undefined, ((_o = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _o === void 0 ? void 0 : _o.domainMax) !== undefined];
            }
        }
        else if (!domain) {
            domain = [domainMin, domainMax];
            if (zero)
                domain = [0, domainMax];
            domainSpecified = false;
        }
        else {
            domainSpecified = true;
        }
        scaleProperties.domain = domain;
        scaleProperties.domainSpecified = domainSpecified;
        // range
        let range = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) || null);
        let rangeProvided = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) !== undefined;
        if (times && !rangeProvided) {
            range = domain.map(d => d * times);
            rangeProvided = true;
        } // to skip the below changes when `times` is present while range is not.
        let rangeMin = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.rangeMin, rangeMax = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.rangeMax;
        if (!rangeProvided && maxDistinct) {
            range = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
        }
        else if (!rangeProvided && !maxDistinct) {
            let p = QuantPreferredRange[channel] || QuantPreferredRange[extraChannelType];
            if (p)
                range = [getFirstDefined(rangeMin, p[0], CHN_MIN), getFirstDefined(rangeMax, p[1], CHN_MAX)];
        }
        if ((channel === PAN_chn || extraChannelType === PAN_chn) && !rangeProvided && domain.length == 3) {
            range.splice(1, 0, 0);
        }
        if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => typeof d === 'number')) {
            range = range.map(noteToFreq);
        }
        range = range.map((d) => {
            if (d < CHN_CAP_MIN) {
                console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
                return CHN_CAP_MIN;
            }
            else if (d > CHN_CAP_MAX) {
                console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
                return CHN_CAP_MAX;
            }
            else {
                return d;
            }
        });
        // polarity
        if (domain[0] < domain[1] && polarity === NEG) {
            range = range.reverse();
        }
        else if (domain[0] > domain[1] && polarity === POS) {
            range = range.reverse();
        }
        scaleProperties.range = range;
        // domain fix when the range is more divided than the domain (linear mapping)
        if (!((_p = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _p === void 0 ? void 0 : _p.domain) && domain.length == 2 && rangeProvided && domain.length < range.length) {
            console.warn(`The domain is not provided while the range is provided. Erie fixed domain to match with the range. This fix is linear, so if you are using other scale types, make sure to provide the specific domain cuts.`);
            domain = range.map((d, i) => {
                if (i == 0)
                    return domainMin;
                else if (i == range.length - 1)
                    return domainMax;
                else {
                    return domainMin + (domainMax - domainMin) * (i / (range.length - 1));
                }
            });
        }
        // transform
        let scaleFunction;
        let scaleTransformType = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.type;
        if (scaleTransformType === LOG) {
            if ((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.base) == 0) {
                console.warn(`The log base can't be 0. It is converted to 10.`);
            }
            let base = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.base) || 10;
            // @ts-ignore
            scaleFunction = d3.scaleLog().base(base);
        }
        else if (scaleTransformType === SYMLOG) {
            let constant = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.constant) || 1;
            // @ts-ignore
            scaleFunction = d3.scaleSymlog().constant(constant);
        }
        else if (scaleTransformType === SQRT) {
            // @ts-ignore
            scaleFunction = d3.scaleSqrt();
        }
        else if (scaleTransformType === POW) {
            let exp = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.exponent) !== undefined ? scaleDef.exponent : 2;
            // @ts-ignore
            scaleFunction = d3.scalePow().exponent(exp);
        }
        else {
            // @ts-ignore
            scaleFunction = d3.scaleLinear();
        }
        scaleProperties.scaleType = scaleTransformType || "linear";
        // enter domain & range (d3-related)
        // @ts-ignore
        scaleFunction = scaleFunction.domain(domain);
        // @ts-ignore
        if (nice)
            scaleFunction = scaleFunction.nice();
        // @ts-ignore
        scaleFunction = scaleFunction.range(range);
        scaleFunction.properties = scaleProperties;
        return scaleFunction;
    }

    function makeStaticScaleFunction(channel, encoding, values, info) {
        var _a;
        let value = encoding.value;
        let condition = deepcopy(encoding.condition || []);
        let scaleProperties = {
            channel,
            encodingType: encoding.type
        };
        if (condition) {
            let conditions = [];
            if (condition instanceof Object && 'test' in condition && 'value' in condition) {
                conditions.push(condition);
            }
            else {
                conditions.push(...condition);
            }
            conditions = conditions.filter((cond) => cond.test !== undefined);
            let finalConditions = [];
            scaleProperties.conditions = [];
            for (const cond of conditions) {
                let fTest;
                if (cond.test !== undefined) {
                    let test = cond.test;
                    if (test instanceof Array) {
                        fTest = (d) => { return test.includes(d); };
                    }
                    else if (test instanceof Object && 'not' in test && (test === null || test === void 0 ? void 0 : test.not) instanceof Array) {
                        fTest = (d) => { return !test.not.includes(d); };
                    }
                    else {
                        fTest = (_a = makeParamFilter(test)) !== null && _a !== void 0 ? _a : ((d) => false);
                    }
                }
                if (fTest !== undefined) {
                    let fCond = { test: fTest, value: cond.value };
                    finalConditions.push(fCond);
                }
                scaleProperties.conditions.push({ test: cond.test, value: cond.value });
            }
            // @ts-ignore
            let scale = (d) => {
                let output;
                for (const fCond of finalConditions) {
                    output = fCond.test(d) ? fCond.value : output;
                }
                if (output === undefined)
                    output = value;
                return output;
            };
            scale.properties = scaleProperties;
            return scale;
        }
        else {
            // @ts-ignore
            let scale = (d) => { return value; };
            scale.properties = scaleProperties;
            return scale;
        }
    }

    function makeSpeechChannelScale(channel, encoding, values, info) {
        // consider details
        // format?
        let scale, scaleProperties = {
            channel,
            encodingType: encoding.type
        };
        if (encoding.format) {
            let formatFun = d3.format(encoding.format);
            if (formatFun) {
                // 
                scale = (d) => formatFun(d);
            }
            else {
                scale = (d) => nullToNull(d);
            }
        }
        else {
            scale = (d) => nullToNull(d);
        }
        scale = scale;
        scale.properties = scaleProperties;
        return scale;
    }
    function nullToNull(d) {
        if (d === null || d === undefined)
            return 'null';
        else
            return d;
    }

    function makeTemporalScaleFunction(channel, encoding, values, info) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
        let extraChannelType = (_a = FilterExtraChannelTypes[channel]) === null || _a === void 0 ? void 0 : _a.type;
        // thresholds
        const [CHN_MAX, CHN_MIN] = getChannelThresholds(channel, extraChannelType);
        const [CHN_CAP_MAX, CHN_CAP_MIN] = getChannelCaps(channel, extraChannelType);
        let scaleDef = encoding === null || encoding === void 0 ? void 0 : encoding.scale;
        let scaleProperties = {
            channel,
            encodingType: encoding.type,
            polarity,
        };
        if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
            console.error("Timber channel can't be scaled for a temporal encoding.");
        }
        // has Time unit
        let newScaleDef = deepcopy(encoding);
        // [todo: check stability]
        if (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain) {
            newScaleDef.scale.domain = timeUnitDomain(scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain, (_b = encoding === null || encoding === void 0 ? void 0 : encoding.timeUnit) !== null && _b !== void 0 ? _b : "date", encoding === null || encoding === void 0 ? void 0 : encoding.timeUnitName);
        }
        if (encoding === null || encoding === void 0 ? void 0 : encoding.timeUnit) {
            let ordScale = makeOrdinalScaleFunction(channel, newScaleDef, values, info);
            let timeUnitFunction = makeTimeUnitFunction(encoding === null || encoding === void 0 ? void 0 : encoding.timeUnit, encoding === null || encoding === void 0 ? void 0 : encoding.timeUnitName);
            Object.assign(scaleProperties, ordScale.properties);
            scaleProperties.timeUnit = encoding === null || encoding === void 0 ? void 0 : encoding.timeUnit;
            scaleProperties.timeUnitName = deepcopy(encoding === null || encoding === void 0 ? void 0 : encoding.timeUnitName);
            // @ts-ignore
            let scaleFunction = (d) => {
                return ordScale(timeUnitFunction(d));
            };
            scaleFunction.properties = scaleProperties;
            return scaleFunction;
        }
        // time level 
        let timeLevelFunction = makeTimeLevelFunction(encoding === null || encoding === void 0 ? void 0 : encoding.timeLevel);
        scaleProperties.timeLevel = encoding === null || encoding === void 0 ? void 0 : encoding.timeLevel;
        // domain
        let domain, domainSpecified;
        if (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain) {
            domain = deepcopy(scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domain).map((d) => {
                return timeLevelFunction(d);
            });
        }
        if (((_c = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _c === void 0 ? void 0 : _c.domainMin) !== undefined || ((_d = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _d === void 0 ? void 0 : _d.domainMax) !== undefined || ((_e = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _e === void 0 ? void 0 : _e.domainMid) !== undefined) {
            domain = [
                timeLevelFunction(((_f = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _f === void 0 ? void 0 : _f.domainMin) !== undefined ? (_g = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _g === void 0 ? void 0 : _g.domainMin : domainMin),
                timeLevelFunction(((_h = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _h === void 0 ? void 0 : _h.domainMax) !== undefined ? (_j = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _j === void 0 ? void 0 : _j.domainMax : domainMax)
            ];
            if ((channel === PAN_chn || extraChannelType === PAN_chn) && (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domainMid) !== undefined) {
                domain.splice(1, 0, timeLevelFunction(scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.domainMid));
                domainSpecified = [((_k = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _k === void 0 ? void 0 : _k.domainMin) !== undefined, ((_l = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _l === void 0 ? void 0 : _l.domainMid) !== undefined, ((_m = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _m === void 0 ? void 0 : _m.domainMax) !== undefined];
            }
            else {
                domainSpecified = [((_o = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _o === void 0 ? void 0 : _o.domainMin) !== undefined, ((_p = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _p === void 0 ? void 0 : _p.domainMax) !== undefined];
            }
        }
        else if (!domain) {
            domain = [timeLevelFunction(domainMin), timeLevelFunction(domainMax)];
            domainSpecified = false;
        }
        else {
            domainSpecified = true;
        }
        scaleProperties.domain = encoding === null || encoding === void 0 ? void 0 : encoding.scale.domain;
        scaleProperties.domainSpecified = domainSpecified;
        // range
        let range = deepcopy((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) || null);
        let rangeProvided = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.range) !== undefined;
        if (times && !rangeProvided) {
            range = domain.map((d) => d * times);
            rangeProvided = true;
        } // to skip the below changes when `times` is present while range is not.
        let rangeMin = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.rangeMin, rangeMax = scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.rangeMax;
        if (!rangeProvided && maxDistinct) {
            range = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
        }
        else if (!rangeProvided && !maxDistinct) {
            let p = QuantPreferredRange[channel] || QuantPreferredRange[extraChannelType];
            if (p)
                range = [getFirstDefined(rangeMin, p[0], CHN_MIN), getFirstDefined(rangeMax, p[1], CHN_MAX)];
        }
        if ((channel === PAN_chn || extraChannelType === PAN_chn) && !rangeProvided && domain.length == 3) {
            range.splice(1, 0, 0);
        }
        if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => typeof d === 'number')) {
            range = range.map(noteToFreq);
        }
        range = range.map((d) => {
            if (d < CHN_CAP_MIN) {
                console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
                return CHN_CAP_MIN;
            }
            else if (d > CHN_CAP_MAX) {
                console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
                return CHN_CAP_MAX;
            }
            else {
                return d;
            }
        });
        // polarity (only works when a range is not provided)
        if (!rangeProvided) {
            if (domain[0] < domain[1] && polarity === NEG) {
                range = range.reverse();
            }
            else if (domain[0] > domain[1] && polarity === POS) {
                range = range.reverse();
            }
        }
        // type guard (already cleared)
        if (((_q = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _q === void 0 ? void 0 : _q.range) instanceof Array) {
            scaleProperties.range = (_r = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _r === void 0 ? void 0 : _r.range;
        }
        // make function;
        let scaleFunction = d3.scaleTime().domain(domain).range(range);
        //@ts-ignore
        let finalScaleFunction = (d) => {
            return scaleFunction(timeLevelFunction(d));
        };
        finalScaleFunction.properties = scaleProperties;
        return finalScaleFunction;
    }
    function makeTimeLevelFunction(timeLevel) {
        if (!timeLevel)
            return (d) => { return new Date(d); };
        else {
            if (timeLevel === 'year') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), 0, 0, 0, 0, 0, 0);
                };
            }
            else if (timeLevel === 'month') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), dt.getMonth(), 0, 0, 0, 0, 0);
                };
            }
            else if (timeLevel === 'date') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
                };
            }
            else if (timeLevel === 'hour') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0, 0);
                };
            }
            else if (timeLevel === 'minute') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), 0, 0);
                };
            }
            else if (timeLevel === 'second') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), 0);
                };
            }
            else if (timeLevel === 'millisecond') {
                return (d) => {
                    let dt = new Date(d);
                    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
                };
            }
            else {
                return (d) => { return new Date(d); };
            }
        }
    }
    function makeTimeUnitFunction(timeUnit, _names) {
        let names;
        if (!timeUnit)
            return (d) => { return new Date(d); };
        else {
            if (timeUnit === 'year') {
                return (d) => {
                    return new Date(d).getFullYear();
                };
            }
            else if (timeUnit === 'month') {
                names = _names || 'number';
                if (names == "number")
                    names = timeUnitDomainDefs.monthNumber;
                else if (names == "number1")
                    names = timeUnitDomainDefs.monthNumber1;
                else if (names == "short")
                    names = timeUnitDomainDefs.monthShort;
                else if (names == "long")
                    names = timeUnitDomainDefs.monthLong;
                else if (typeof names === 'string')
                    names = timeUnitDomainDefs.monthLong;
                return (d) => {
                    return names[new Date(d).getMonth()];
                };
            }
            else if (timeUnit === 'day') {
                names = _names || timeUnitDomainDefs.dayLong;
                if (names == "number")
                    names = timeUnitDomainDefs.dayNumber;
                else if (names == "number1")
                    names = timeUnitDomainDefs.dayNumber1;
                else if (names == "numberFromMon")
                    names = timeUnitDomainDefs.dayNumberFromMon;
                else if (names == "numberFromMon1")
                    names = timeUnitDomainDefs.dayNumberFromMon1;
                else if (names == "short")
                    names = timeUnitDomainDefs.dayShort;
                else if (typeof names === 'string')
                    names = timeUnitDomainDefs.dayLong;
                return (d) => {
                    return names[new Date(d).getDay()];
                };
            }
            else if (timeUnit === 'date') {
                return (d) => {
                    return new Date(d).getDate();
                };
            }
            else if (timeUnit === 'hour') {
                return (d) => {
                    return new Date(d).getHours();
                };
            }
            else if (timeUnit === 'hour12') {
                return (d) => {
                    return new Date(d).getHours() % 12;
                };
            }
            else if (timeUnit === 'minute') {
                return (d) => {
                    return new Date(d).getMinutes();
                };
            }
            else if (timeUnit === 'second') {
                return (d) => {
                    return new Date(d).getSeconds();
                };
            }
            else if (timeUnit === 'millisecond') {
                return (d) => {
                    return new Date(d).getMilliseconds();
                };
            }
            else {
                return (d) => { return new Date(d); };
            }
        }
    }
    function timeUnitDomain(orgDomain, timeUnit, _names) {
        let names;
        if (timeUnit === 'year') {
            return [new Date(orgDomain[0]).getDay(), new Date(orgDomain[1]).getDay()];
        }
        else if (timeUnit === 'month') {
            names = _names || 'number';
            if (names == "number")
                names = timeUnitDomainDefs.monthNumber;
            else if (names == "number1")
                names = timeUnitDomainDefs.monthNumber1;
            else if (names == "short")
                names = timeUnitDomainDefs.monthShort;
            else if (names == "long")
                names = timeUnitDomainDefs.monthLong;
            else if (typeof names === 'string')
                names = timeUnitDomainDefs.monthLong;
            return names;
        }
        else if (timeUnit === 'day') {
            names = _names || timeUnitDomainDefs.dayLong;
            if (names == "number")
                names = timeUnitDomainDefs.dayNumber;
            else if (names == "number1")
                names = timeUnitDomainDefs.dayNumber1;
            else if (names == "numberFromMon")
                names = timeUnitDomainDefs.dayNumberFromMon;
            else if (names == "numberFromMon1")
                names = timeUnitDomainDefs.dayNumberFromMon1;
            else if (names == "short")
                names = timeUnitDomainDefs.dayShort;
            else if (typeof names === 'string')
                names = timeUnitDomainDefs.dayLong;
            return names;
        }
        else if (timeUnit === 'date') {
            return timeUnitDomainDefs.date;
        }
        else if (timeUnit === 'hour') {
            return timeUnitDomainDefs.hour;
        }
        else if (timeUnit === 'hour12') {
            return timeUnitDomainDefs.hour;
        }
        else if (timeUnit === 'minute') {
            return timeUnitDomainDefs.minute;
        }
        else if (timeUnit === 'second') {
            return timeUnitDomainDefs.second;
        }
        else if (timeUnit === 'millisecond') {
            return timeUnitDomainDefs.millisecond;
        }
    }

    // only for the time scale
    function makeTimeChannelScale(channel, _encoding, values, info, scaleType, beat) {
        var _a, _b;
        let encoding = deepcopy(_encoding);
        let scaleDef = encoding === null || encoding === void 0 ? void 0 : encoding.scale;
        if (encoding.type === NOM && !scaleDef.timing) {
            scaleDef.timing = REL;
        }
        let isRelative = scaleDef.timing === REL, isSimultaneous = scaleDef.timing === SIM, band = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.band) || DEF_DUR, length = (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.length) || 5;
        if (beat === null || beat === void 0 ? void 0 : beat.converter) {
            band = beat.converter((scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.band) || 1), length = beat.converter(length);
        }
        if (((_a = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _a === void 0 ? void 0 : _a.range) === undefined && (scaleDef === null || scaleDef === void 0 ? void 0 : scaleDef.band) !== undefined) {
            encoding.scale.range = [0, length - band];
        }
        else if (((_b = encoding === null || encoding === void 0 ? void 0 : encoding.scale) === null || _b === void 0 ? void 0 : _b.range) === undefined) {
            encoding.scale.range = [0, length];
        }
        let scale1;
        // single-time channel
        if (isRelative) {
            // @ts-ignore
            scale1 = (t1) => {
                return 'after_previous';
            };
            scale1.properties = {
                channel,
                encodingType: encoding.type,
                timing: REL,
            };
        }
        else if (isSimultaneous) {
            // @ts-ignore
            scale1 = (t1) => {
                return 0;
            };
            scale1.properties = {
                channel,
                encodingType: encoding.type,
                timing: SIM,
            };
        }
        else if ((scaleType === null || scaleType === void 0 ? void 0 : scaleType.encodingType) === QUANT) {
            scale1 = makeQuantitativeScaleFunction(TIME_chn, encoding, values, info);
        }
        else if ((scaleType === null || scaleType === void 0 ? void 0 : scaleType.encodingType) === TMP) {
            scale1 = makeTemporalScaleFunction(TIME_chn, encoding, values, info);
        }
        else if ((scaleType === null || scaleType === void 0 ? void 0 : scaleType.encodingType) === ORD) {
            scale1 = makeOrdinalScaleFunction(TIME_chn, encoding, values, info);
        }
        else if ((scaleType === null || scaleType === void 0 ? void 0 : scaleType.encodingType) === NOM) {
            scale1 = makeNominalScaleFunction(TIME_chn, encoding, values, info);
        }
        else if ((scaleType === null || scaleType === void 0 ? void 0 : scaleType.encodingType) === STATIC) {
            scale1 = makeStaticScaleFunction(TIME_chn, encoding);
        }
        if (!scale1) {
            console.error("Wrong scale definition for the time channel", scaleDef);
        }
        // @ts-ignore
        let scaleFunction = (t1, t2) => {
            if (t2 !== undefined) {
                return {
                    start: ((beat === null || beat === void 0 ? void 0 : beat.roundStart) ? beat === null || beat === void 0 ? void 0 : beat.roundStart(scale1(t1)) : scale1(t1)),
                    end: ((beat === null || beat === void 0 ? void 0 : beat.roundDuration) ? beat === null || beat === void 0 ? void 0 : beat.roundDuration(scale1(t2)) : scale1(t2))
                };
            }
            else {
                return {
                    start: ((beat === null || beat === void 0 ? void 0 : beat.roundStart) ? beat === null || beat === void 0 ? void 0 : beat.roundStart(scale1(t1)) : scale1(t1)),
                    duration: ((beat === null || beat === void 0 ? void 0 : beat.roundDuration) ? beat === null || beat === void 0 ? void 0 : beat.roundDuration(band) : band)
                };
            }
        };
        scaleFunction.properties = scale1.properties;
        scaleFunction.properties.length = length;
        return scaleFunction;
    }

    function getAudioScales(channel, encoding, values, beat, data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        // extract default information
        let polarity = ((_a = encoding.scale) === null || _a === void 0 ? void 0 : _a.polarity) || POS;
        let maxDistinct = (_b = encoding.scale) === null || _b === void 0 ? void 0 : _b.maxDistinct;
        if (maxDistinct === undefined)
            maxDistinct = true;
        let scaleId = encoding.id;
        let times = (_c = encoding.scale) === null || _c === void 0 ? void 0 : _c.times;
        let zero = ((_d = encoding.scale) === null || _d === void 0 ? void 0 : _d.zero) !== undefined ? (_e = encoding.scale) === null || _e === void 0 ? void 0 : _e.zero : false;
        let domainMax, domainMin;
        // check on this
        // if (channel instanceof Array && values) {
        //   let domainSorted = values.toSorted(asc);
        //   domainMax = domainSorted[domainSorted.length - 1];
        //   domainMin = domainSorted[0];
        // } else
        if (values && values.length == 2 && values[0] instanceof Array && values[1] instanceof Array) {
            let domainSorted = values[0].concat(values[1]).toSorted(asc);
            domainMax = domainSorted[domainSorted.length - 1];
            domainMin = domainSorted[0];
        }
        else if (values && values.length == 1 && values[0] instanceof Array) {
            let domainSorted = values[0].toSorted(asc);
            domainMax = domainSorted[domainSorted.length - 1];
            domainMin = domainSorted[0];
        }
        else if (values instanceof Array) {
            let domainSorted = values.toSorted(asc);
            domainMax = domainSorted[domainSorted.length - 1];
            domainMin = domainSorted[0];
        }
        let nice = (_f = encoding.scale) === null || _f === void 0 ? void 0 : _f.nice;
        let info = { polarity, maxDistinct, times, zero, domainMax, domainMin, nice };
        // outcome scale function
        let _scale;
        let scaleType = getScaleType(channel, encoding, values);
        // get scale functions
        if (scaleType.fieldRange) {
            _scale = makeFieldedScaleFunction(channel, encoding, values, info, data);
        }
        else if (scaleType.isTime) {
            // time scales
            _scale = makeTimeChannelScale(channel, encoding, values, info, scaleType, beat);
        }
        else if (scaleType.isSpeech) {
            _scale = makeSpeechChannelScale(channel, encoding);
        }
        else {
            if (scaleType.encodingType === QUANT) {
                _scale = makeQuantitativeScaleFunction(channel, encoding, values, info);
            }
            else if (scaleType.encodingType === TMP) {
                _scale = makeTemporalScaleFunction(channel, encoding, values, info);
            }
            else if (scaleType.encodingType === ORD) {
                _scale = makeOrdinalScaleFunction(channel, encoding, values, info);
            }
            else if (scaleType.encodingType === NOM) {
                _scale = makeNominalScaleFunction(channel, encoding, values, info);
            }
            else if (scaleType.encodingType === STATIC) {
                _scale = makeStaticScaleFunction(channel, encoding);
            }
        }
        // once got the initial scale function;
        // do some custom edits depending on the channel types
        if (_scale) {
            let scale;
            if (channel === PITCH_chn && encoding.roundToNote) {
                // 1. pitch channel with round-to-note feature
                // @ts-ignore
                scale = (d) => { return roundToNoteScale(_scale(d)); };
            }
            else if (TapChannels.includes(channel)) {
                // 2. if it is a tapping channel, convert it to actual tapping patterns
                let pause = { rate: ((_g = encoding.scale) === null || _g === void 0 ? void 0 : _g.pauseRate) !== undefined ? (_h = encoding.scale) === null || _h === void 0 ? void 0 : _h.pauseRate : DEF_TAP_PAUSE_RATE };
                if ((_j = encoding.scale) === null || _j === void 0 ? void 0 : _j.pauseLength)
                    pause = { length: (_k = encoding.scale) === null || _k === void 0 ? void 0 : _k.pauseLength };
                if (channel === TAPCNT_chn) {
                    // tapping count
                    // @ts-ignore
                    scale = (d) => {
                        var _a;
                        return ({
                            value: _scale(d),
                            tapLength: (_a = encoding.scale) === null || _a === void 0 ? void 0 : _a.band,
                            pause,
                            beat
                        });
                    };
                }
                else if (channel === TAPSPD_chn) {
                    // tapping speed
                    let tapSpeedValues = values.map((d) => _scale(d));
                    let tapBand = ((_l = encoding.scale) === null || _l === void 0 ? void 0 : _l.band) || (beat ? DEF_TAP_DUR_BEAT : DEF_TAP_DUR);
                    let maxTapSpeed = round(Math.max(...tapSpeedValues) * tapBand, 0);
                    let tappingUnit = tapBand / (maxTapSpeed + (maxTapSpeed - 1) * (pause.rate !== undefined ? pause.rate : DEF_TAP_PAUSE_RATE));
                    // physical limit for maximum tapping per unit
                    let maxTappingLength = ((_m = encoding.scale) === null || _m === void 0 ? void 0 : _m.maxTappingLength) !== undefined ? (_o = encoding.scale) === null || _o === void 0 ? void 0 : _o.maxTappingLength : (beat ? DEF_TAPPING_DUR_BEAT : MAX_TAPPING_DUR);
                    if (tappingUnit > maxTappingLength)
                        tappingUnit = maxTappingLength;
                    tappingUnit = round(tappingUnit, -2);
                    // @ts-ignore
                    scale = (d) => {
                        var _a, _b;
                        return ({
                            value: _scale(d),
                            tapDuration: (_a = encoding.scale) === null || _a === void 0 ? void 0 : _a.band,
                            tappingUnit,
                            singleTappingPosition: ((_b = encoding.scale) === null || _b === void 0 ? void 0 : _b.singleTappingPosition) || SINGLE_TAP_MIDDLE,
                            beat
                        });
                    };
                }
            }
            else if (channel === DUR_chn && beat) {
                // 3. if it is duration channel and "beat" unit was used --> convert to the beats
                // note: time channel is separate converted, so no further edit is needed here.
                // @ts-ignore
                scale = (d) => beat.converter(_scale(d));
            }
            else {
                // 4. default cases (no edits)
                scale = _scale;
            }
            // assign scale properties
            if (scale.properties) {
                Object.assign(scale.properties, scaleType);
            }
            else if (_scale.properties) {
                scale.properties = deepcopy(_scale.properties);
                Object.assign(scale.properties, scaleType);
            }
            if (((_p = encoding.scale) === null || _p === void 0 ? void 0 : _p.description) || ((_q = encoding.scale) === null || _q === void 0 ? void 0 : _q.description) === undefined) {
                scale.properties.descriptionDetail = (_r = encoding.scale) === null || _r === void 0 ? void 0 : _r.description;
            }
            else {
                scale.properties.descriptionDetail = null;
            }
            if ((_s = encoding.scale) === null || _s === void 0 ? void 0 : _s.title) {
                scale.properties.title = (_t = encoding.scale) === null || _t === void 0 ? void 0 : _t.title;
            }
            else {
                scale.properties.title = listString(unique(scale.properties.field || []), ", ", false);
            }
            if (encoding.format) {
                scale.properties.format = encoding.format;
            }
            if (encoding.formatType) {
                scale.properties.formatType = encoding.formatType;
            }
            else if (encoding.format) {
                scale.properties.formatType = "number";
            }
            if (scaleId) {
                scale.scaleId = scaleId;
            }
            return scale;
        }
        else {
            console.error(`The encoding definition for ${channel} channel is illegal:`, encoding);
            return null;
        }
        // add scale description
    }
    function getScaleType(channel, encoding, values) {
        var _a, _b, _c, _d, _e, _f;
        let isTime = TimeChannels.includes(channel) || TimeChannels.includes(channel[0]);
        let isSpeech = SpeechChannels.includes(channel);
        let encodingType = encoding.type;
        if (!encodingType) {
            if (encoding.value)
                encodingType = STATIC;
            else
                encodingType = detectType(values);
        }
        let field = encoding.original_field || encoding.field;
        let binned = encoding.binned;
        let aggregate = encoding.aggregate;
        let fieldRange = null;
        if (((_a = encoding.scale) === null || _a === void 0 ? void 0 : _a.range) instanceof Object && 'field' in ((_b = encoding.scale) === null || _b === void 0 ? void 0 : _b.range) && ((_d = (_c = encoding.scale) === null || _c === void 0 ? void 0 : _c.range) === null || _d === void 0 ? void 0 : _d.field)) {
            fieldRange = (_f = (_e = encoding.scale) === null || _e === void 0 ? void 0 : _e.range) === null || _f === void 0 ? void 0 : _f.field;
        }
        return { isTime, isSpeech, encodingType, field, binned, aggregate, fieldRange };
    }

    function compileSingleLayerAuidoGraph(audio_spec, _data, config, tickDef, common_scales) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            let layer_spec = {
                name: audio_spec.name,
                encoding: audio_spec.encoding,
                tone: audio_spec.tone || { type: Def_tone }
            };
            let audioFilters = ((_a = audio_spec.tone) === null || _a === void 0 ? void 0 : _a.filter) || null;
            if (audioFilters)
                audioFilters = [...audioFilters];
            if (!_data || !layer_spec.encoding) {
                console.warn("No proper layer spec provided.");
                return undefined;
            }
            // transformations
            let forced_dimensions = Object.keys(layer_spec.encoding).map((d) => {
                let enc = layer_spec.encoding[d];
                if (enc.type && [NOM, ORD, TMP].includes(enc.type)) {
                    return enc.field;
                }
                else if (d === REPEAT_chn) {
                    return enc.field;
                }
            }).filter((d) => d !== undefined).flat();
            let data = _data;
            if (audio_spec.common_transform) {
                data = transformData(_data, [...(audio_spec.common_transform || []), ...(audio_spec.transform || [])], forced_dimensions);
            }
            else {
                data = transformData(_data, audio_spec.transform || [], forced_dimensions);
            }
            let dataInfo = deepcopy(data.tableInfo);
            // encoding properties
            let encoding = layer_spec.encoding;
            let tone_spec = layer_spec.tone;
            if (tone_spec.type === "default") {
                tone_spec = {
                    type: Def_tone,
                    continued: tone_spec.continued
                };
            }
            let channels = Object.keys(encoding).filter((c) => ![TIME_chn, TIME2_chn, TIMBRE_chn].includes(c));
            let hasTime2 = (encoding[TIME_chn] && encoding[TIME2_chn]);
            let is_repeated = encoding[REPEAT_chn] !== undefined;
            let has_repeat_speech = is_repeated && encoding[REPEAT_chn].speech;
            if (has_repeat_speech === undefined)
                has_repeat_speech = true;
            if (is_repeated && ((_b = encoding[REPEAT_chn]) === null || _b === void 0 ? void 0 : _b.field) === undefined) {
                console.error("Repeat field must be provided.");
            }
            let _rf = 'REPEAT_chn' in encoding ? encoding[REPEAT_chn].field : undefined;
            if (typeof _rf === 'string')
                _rf = [_rf];
            let repeat_field = _rf;
            let _rd = (_c = encoding[REPEAT_chn]) === null || _c === void 0 ? void 0 : _c.by;
            let repeat_direction = [];
            if (is_repeated && repeat_field) {
                if (_rd === undefined)
                    _rd = [SEQUENCE];
                else if (typeof _rd === 'string')
                    _rd = [_rd];
                repeat_direction = _rd;
                if ((repeat_field === null || repeat_field === void 0 ? void 0 : repeat_field.length) !== repeat_direction.length) {
                    if (repeat_direction.length == 1) {
                        repeat_direction = repeat_field.map(() => repeat_direction[0]);
                    }
                    else {
                        console.error("The repeat direction is not matched with the repeat field(s)");
                    }
                }
            }
            // data sort
            // tiem channel can only have a string field
            let data_order = [];
            if (TIME_chn in encoding && encoding[TIME_chn].field && ((_d = encoding[TIME_chn].scale) === null || _d === void 0 ? void 0 : _d.order)) {
                data_order.push({
                    key: encoding[TIME_chn].field, order: [(_e = encoding[TIME_chn].scale) === null || _e === void 0 ? void 0 : _e.order]
                });
            }
            else if (TIME_chn in encoding && encoding[TIME_chn].field && 'sort' in ((_g = (_f = encoding[TIME_chn]) === null || _f === void 0 ? void 0 : _f.scale) !== null && _g !== void 0 ? _g : {}) && ((_h = encoding[TIME_chn].scale) === null || _h === void 0 ? void 0 : _h.sort)) {
                data_order.push({
                    key: encoding[TIME_chn].field, sort: (_j = encoding[TIME_chn].scale) === null || _j === void 0 ? void 0 : _j.sort
                });
            }
            else if (TIME_chn in encoding && encoding[TIME_chn].field) {
                let f = encoding[TIME_chn].field;
                data_order.push({
                    key: f, order: unique(data.map(d => d[f])).toSorted(asc)
                });
            }
            if (is_repeated && repeat_field && repeat_field.length == 1 && ((_k = encoding[REPEAT_chn].scale) === null || _k === void 0 ? void 0 : _k.order)) {
                data_order.push({
                    key: repeat_field[0], order: (_l = encoding[REPEAT_chn].scale) === null || _l === void 0 ? void 0 : _l.order
                });
            }
            else if (is_repeated && repeat_field && repeat_field.length == 1 && ((_m = encoding[REPEAT_chn].scale) === null || _m === void 0 ? void 0 : _m.sort)) {
                data_order.push({
                    key: repeat_field[0], sort: (_o = encoding[REPEAT_chn].scale) === null || _o === void 0 ? void 0 : _o.sort
                });
            }
            else if (is_repeated && (repeat_field instanceof Array)) {
                repeat_field.toReversed().forEach((key) => {
                    let order = unique(data.map(d => d[key])).toSorted(asc);
                    data_order.push({
                        key, order
                    });
                });
            }
            data = orderArray(data, data_order);
            delete data.tableInfo;
            // treat repeat
            let audio_graph = [], repeated_graph = [], repeated_graph_map = {}, repeat_values, repeat_level = 0;
            if (is_repeated && repeat_field) {
                repeat_level = repeat_field.length;
                repeat_values = unique(data.map((d) => repeat_field.map((k) => d[k]).join("_$_")))
                    .map((d) => ({
                    value_keys: d.split("_$_"),
                    membership: []
                }));
                repeat_values.forEach((d) => {
                    let g = {
                        name: listString(d.value_keys, ", ", true),
                        membership: [],
                        glyphs: []
                    };
                    repeat_field.forEach((f, i) => {
                        g.membership.push({ key: f, value: d.value_keys[i] });
                    });
                    d.membership = g.membership;
                    repeated_graph.push(g);
                    repeated_graph_map[d.value_keys.join("&")] = repeated_graph.length - 1;
                });
            }
            // get scales
            let scales = {};
            for (const channel in encoding) {
                let enc = encoding[channel];
                if ((_p = enc.scale) === null || _p === void 0 ? void 0 : _p.id) {
                    scales[channel] = common_scales[enc.scale.id];
                }
            }
            // relativity
            let relative_stream = ((_q = encoding[TIME_chn].scale) === null || _q === void 0 ? void 0 : _q.timing) === REL || ((_s = (_r = scales.time) === null || _r === void 0 ? void 0 : _r.properties) === null || _s === void 0 ? void 0 : _s.timing) === REL;
            // ramping
            let ramp = {};
            for (const channel in encoding) {
                ramp[channel] = encoding[channel].ramp;
            }
            // tick
            let hasTick = encoding[TIME_chn].tick !== undefined, tick;
            if (hasTick) {
                let tickItem = encoding[TIME_chn].tick;
                if ((tickItem === null || tickItem === void 0 ? void 0 : tickItem.name) && tickDef[tickItem.name]) {
                    tick = tickDef[tickItem.name];
                }
                else if (tickItem) {
                    tick = tickItem;
                }
                tick = deepcopy(tick);
                // time unit conversion
                if (common_scales.__beat) {
                    tick.interval = tick.interval ? common_scales.__beat.converter(tick.interval) : Def_Tick_Interval_Beat;
                    tick.band = tick.band ? common_scales.__beat.converter(tick.band) : Def_Tick_Duration_Beat;
                }
                else {
                    if (!tick.interval)
                        tick.interval = Def_Tick_Interval;
                    if (!tick.band)
                        tick.band = Def_Tick_Duration;
                }
            }
            if (common_scales) {
                // generate scale text
                let scaleDescOrder = (config === null || config === void 0 ? void 0 : config.scaleDescriptionOrder) || ScaleDescriptionOrder;
                let __config = deepcopy(config || {});
                __config.isRepeated = is_repeated;
                __config.repeatField = repeat_field;
                for (const chn of scaleDescOrder) {
                    if (scales[chn]) {
                        __config.aggregated = encoding[chn].aggregate ? true : false;
                        __config.binned = encoding[chn].binned;
                        scales[chn].description = makeScaleDescription(scales[chn], encoding[chn], dataInfo, tick, tone_spec, __config, common_scales.__beat);
                    }
                }
            }
            // generate audio graphs
            let total_duration = 0, repeat_total_duration = Array(repeated_graph.length).fill(0);
            for (const i in data) {
                if (i === 'tableInfo')
                    continue;
                let datum = data[i];
                // if (datum[encoding[TIME_chn].field] !== undefined) continue;
                let repeat_index = is_repeated && repeat_field ? repeated_graph_map[repeat_field.map(k => datum[k]).join("&")] : -1;
                let glyph = scales.time((datum[encoding[TIME_chn].field] !== undefined ? datum[encoding[TIME_chn].field] : parseInt(i)), (hasTime2 ?
                    (datum[encoding[TIME2_chn].field] !== undefined ? datum[encoding[TIME2_chn].field] : (parseInt(i) + 1))
                    : undefined));
                if (tone_spec.continued && !hasTime2) {
                    delete glyph.end;
                    glyph.duration = 0;
                }
                if (glyph.start === undefined)
                    continue;
                glyph.timbre = scales.timbre ? scales.timbre(datum[encoding[TIMBRE_chn].field]) : tone_spec.type;
                let speechBefore, speechAfter;
                for (const channel of channels) {
                    if (scales[channel]) {
                        glyph[channel] = scales[channel](datum[encoding[channel].field]);
                    }
                    // adjust for tapcount
                    if (TapChannels.includes(channel)) {
                        glyph.duration = glyph[channel].totalLength;
                    }
                }
                if (glyph[SPEECH_BEFORE_chn]) {
                    speechBefore = {
                        speech: glyph[SPEECH_BEFORE_chn],
                        start: glyph.start,
                        end: glyph.end,
                        language: ((_t = encoding[SPEECH_BEFORE_chn]) === null || _t === void 0 ? void 0 : _t.language) ? (_u = encoding[SPEECH_BEFORE_chn]) === null || _u === void 0 ? void 0 : _u.language : (_v = document === null || document === void 0 ? void 0 : document.documentElement) === null || _v === void 0 ? void 0 : _v.lang
                    };
                }
                if (glyph[SPEECH_AFTER_chn]) {
                    speechAfter = {
                        speech: glyph[SPEECH_AFTER_chn],
                        start: glyph.start,
                        end: glyph.end,
                        language: ((_w = encoding[SPEECH_BEFORE_chn]) === null || _w === void 0 ? void 0 : _w.language) ? (_x = encoding[SPEECH_BEFORE_chn]) === null || _x === void 0 ? void 0 : _x.language : (_y = document === null || document === void 0 ? void 0 : document.documentElement) === null || _y === void 0 ? void 0 : _y.lang
                    };
                }
                if (speechBefore) {
                    if (is_repeated && repeated_graph[repeat_index])
                        repeated_graph[repeat_index].glyphs.push(speechBefore);
                    else
                        audio_graph.push(speechBefore);
                }
                glyph.__datum = datum;
                let endTime = 0;
                if (glyph.end) {
                    endTime = glyph.end + (glyph.postReverb || 0);
                }
                else if (glyph.duration) {
                    endTime = (glyph.start || 0) + glyph.duration + (glyph.postReverb || 0);
                }
                if (is_repeated && repeated_graph[repeat_index]) {
                    repeated_graph[repeat_index].glyphs.push(glyph);
                    repeat_total_duration[repeat_index] = Math.max(repeat_total_duration[repeat_index], endTime);
                }
                else {
                    audio_graph.push(glyph);
                    total_duration = Math.max(total_duration, endTime);
                }
                if (speechAfter && repeated_graph[repeat_index]) {
                    if (is_repeated)
                        repeated_graph[repeat_index].glyphs.push(speechAfter);
                    else
                        audio_graph.push(speechAfter);
                }
            }
            let is_continued = tone_spec.continued === undefined ? false : tone_spec.continued;
            let instrument_type = tone_spec.type || 'default';
            // repetition control
            let stream;
            if (is_repeated) {
                let repeat_streams = makeRepeatStreamTree(0, repeat_values, repeat_direction);
                repeated_graph.forEach((g, i) => {
                    let r_stream = new UnitStream(instrument_type, g.glyphs, scales, { is_continued, relative: relative_stream });
                    r_stream.duration = repeat_total_duration[i];
                    Object.keys(config || {}).forEach(key => {
                        r_stream.setConfig(key, config === null || config === void 0 ? void 0 : config[key]);
                    });
                    if (g.name)
                        r_stream.setName(g.name);
                    if (has_repeat_speech)
                        r_stream.setConfig("playRepeatSequenceName", true);
                    if (i > 0) {
                        r_stream.setConfig("skipScaleSpeech", true);
                        r_stream.setConfig("skipStartSpeech", true);
                    }
                    if (i < repeated_graph.length - 1) {
                        r_stream.setConfig("skipFinishSpeech", true);
                    }
                    if (hasTick) {
                        r_stream.setConfig("tick", tick);
                    }
                    r_stream.setRamp(ramp);
                    let rs_accessor = repeat_streams;
                    for (let i = 0; i < repeat_level; i++) {
                        rs_accessor = rs_accessor.nodes;
                        let member = g.membership[i];
                        for (let j = 0; j < rs_accessor.length; j++) {
                            if (rs_accessor[j].parent_value == member.value) {
                                rs_accessor = rs_accessor[j];
                                break;
                            }
                        }
                    }
                    rs_accessor.nodes.push(r_stream);
                });
                // post_processing
                let processed_repeat_stremas = postprocessRepeatStreams(repeat_streams);
                processed_repeat_stremas.forEach((s, i) => {
                    if (!s) {
                        console.warn("empty repeat stream", s);
                    }
                    if (has_repeat_speech && s.setConfig)
                        s.setConfig("playRepeatSequenceName", true);
                    if (i > 0) {
                        s.setConfig("skipScaleSpeech", true);
                        s.setConfig("skipStartSpeech", true);
                    }
                    else {
                        s.setConfig(PlayAt, BeforeAll);
                    }
                    if (i < processed_repeat_stremas.length - 1) {
                        s.setConfig("skipFinishSpeech", true);
                    }
                    if (hasTick) {
                        s.setConfig("tick", tick);
                    }
                    if ('overlays' in s && isOverlayStreamObject(s)) {
                        Object.assign(s.config, s.overlays[0].config);
                        s.duration = Math.max(...s.overlays.map((d) => d.duration));
                        s.overlays.forEach((o, i) => {
                            if (o.setConfig) {
                                o.setConfig("playRepeatSequenceName", false);
                                if (i == 0) {
                                    o.setConfig("skipScaleSpeech", false);
                                    o.setConfig("skipStartSpeech", false);
                                }
                                else {
                                    o.setConfig("skipScaleSpeech", true);
                                    o.setConfig("skipStartSpeech", true);
                                }
                                o.setConfig("skipFinishSpeech", true);
                            }
                        });
                        if (s.setConfig) {
                            s.setConfig("skipScaleSpeech", true);
                            s.setConfig("skipTitle", true);
                            s.setConfig("skipStartSpeech", true);
                            s.setConfig("playRepeatSequenceName", true);
                        }
                        s.setName(listString(s.overlays.map((d) => d.name), ", ", true));
                    }
                    if (audioFilters)
                        s.setFilters(audioFilters);
                });
                stream = processed_repeat_stremas;
            }
            // if not repeated
            else {
                stream = new UnitStream(instrument_type, audio_graph, scales, { is_continued, relative: relative_stream });
                stream.duration = total_duration;
                Object.keys(config || {}).forEach(key => {
                    stream.setConfig(key, config === null || config === void 0 ? void 0 : config[key]);
                });
                if (hasTick) {
                    stream.setConfig("tick", tick);
                }
                if (layer_spec.name)
                    stream.setName(layer_spec.name);
                if (audioFilters)
                    stream.setFilters(audioFilters);
                stream.setRamp(ramp);
                if (audio_spec.description)
                    stream.setDescription(audio_spec.description);
            }
            return { stream, scales };
        });
    }

    function tidyUpScaleDefinitions(scaleDefinitions, normalizedSpecs, sequenceConfig) {
        var _a, _b, _c, _d;
        // directly updates the scale definitions, and returns the ids of scales to be removed, which can be later handled.
        let sequenceScaleConsistency = (_a = sequenceConfig === null || sequenceConfig === void 0 ? void 0 : sequenceConfig.sequenceScaleConsistency) !== null && _a !== void 0 ? _a : {};
        let forceSequenceScaleConsistency = (_b = sequenceConfig === null || sequenceConfig === void 0 ? void 0 : sequenceConfig.forceSequenceScaleConsistency) !== null && _b !== void 0 ? _b : {};
        let removals = [];
        for (const stream of normalizedSpecs) {
            if ('stream' in stream && stream.stream) {
                Object.keys(stream.stream.encoding).forEach((channel) => {
                    var _a, _b, _c, _d, _e, _f;
                    let match;
                    if (sequenceScaleConsistency[channel]
                        && !forceSequenceScaleConsistency[channel]) {
                        match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, !forceSequenceScaleConsistency[channel]);
                    }
                    else if (forceSequenceScaleConsistency[channel]) {
                        match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, forceSequenceScaleConsistency[channel]);
                    }
                    if (match) {
                        if (((_c = (_b = (_a = stream.stream.encoding) === null || _a === void 0 ? void 0 : _a[channel]) === null || _b === void 0 ? void 0 : _b.scale) === null || _c === void 0 ? void 0 : _c.id)
                            && match.id !== ((_f = (_e = (_d = stream.stream.encoding) === null || _d === void 0 ? void 0 : _d[channel]) === null || _e === void 0 ? void 0 : _e.scale) === null || _f === void 0 ? void 0 : _f.id)) {
                            // once normalized, even "aggregate: count" should have a field name instead
                            if (stream.stream.encoding[channel].field) {
                                if (typeof stream.stream.encoding[channel].field === 'string') {
                                    match.field.push(stream.stream.encoding[channel].field);
                                }
                                else if (stream.stream.encoding[channel].field instanceof Array) {
                                    match.field.push(...stream.stream.encoding[channel].field);
                                }
                            }
                            removals.push(stream.stream.encoding[channel].scale.id);
                            Object.keys(stream.stream.encoding[channel].scale).forEach((prop) => {
                                var _a, _b, _c;
                                if (!match.scale[prop]) {
                                    match.scale[prop] = (_c = (_b = (_a = stream.stream.encoding) === null || _a === void 0 ? void 0 : _a[channel]) === null || _b === void 0 ? void 0 : _b.scale) === null || _c === void 0 ? void 0 : _c[prop];
                                }
                            });
                            stream.stream.encoding[channel].scale.id = match.id;
                        }
                    }
                });
            }
            else if ('overlay' in stream && stream.overlay) {
                for (const overlayStream of stream.overlay) {
                    let overlayScaleConsistency = ((_c = stream === null || stream === void 0 ? void 0 : stream.config) === null || _c === void 0 ? void 0 : _c.overlayScaleConsistency)
                        || (sequenceConfig === null || sequenceConfig === void 0 ? void 0 : sequenceConfig.overlayScaleConsistency)
                        || {};
                    let forceOverlayScaleConsistency = ((_d = stream === null || stream === void 0 ? void 0 : stream.config) === null || _d === void 0 ? void 0 : _d.forceOverlayScaleConsistency)
                        || (sequenceConfig === null || sequenceConfig === void 0 ? void 0 : sequenceConfig.forceOverlayScaleConsistency)
                        || {};
                    Object.keys(overlayStream.encoding).forEach((channel) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                        let match;
                        if (sequenceScaleConsistency[channel] && !forceSequenceScaleConsistency[channel]) {
                            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, !forceSequenceScaleConsistency[channel]);
                        }
                        else if (forceSequenceScaleConsistency[channel]) {
                            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, forceSequenceScaleConsistency[channel]);
                        }
                        else if (overlayScaleConsistency[channel] && !forceOverlayScaleConsistency[channel]) {
                            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, !forceOverlayScaleConsistency[channel]);
                        }
                        else if (forceOverlayScaleConsistency[channel]) {
                            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, forceOverlayScaleConsistency[channel]);
                        }
                        if (match) {
                            if (((_c = (_b = (_a = overlayStream.encoding) === null || _a === void 0 ? void 0 : _a[channel]) === null || _b === void 0 ? void 0 : _b.scale) === null || _c === void 0 ? void 0 : _c.id)
                                && match.id !== ((_f = (_e = (_d = overlayStream.encoding) === null || _d === void 0 ? void 0 : _d[channel]) === null || _e === void 0 ? void 0 : _e.scale) === null || _f === void 0 ? void 0 : _f.id)) {
                                // once normalized, even "aggregate: count" should have a field name instead
                                if (overlayStream.encoding[channel].field) {
                                    if (typeof overlayStream.encoding[channel].field === 'string') {
                                        match.field.push(overlayStream.encoding[channel].field);
                                    }
                                    else if (overlayStream.encoding[channel].field instanceof Array) {
                                        match.field.push(...overlayStream.encoding[channel].field);
                                    }
                                }
                                removals.push((_j = (_h = (_g = overlayStream.encoding) === null || _g === void 0 ? void 0 : _g[channel]) === null || _h === void 0 ? void 0 : _h.scale) === null || _j === void 0 ? void 0 : _j.id);
                                Object.keys(overlayStream.encoding[channel].scale).forEach(prop => {
                                    var _a, _b, _c;
                                    if (!match.scale[prop])
                                        match.scale[prop] = (_c = (_b = (_a = overlayStream.encoding) === null || _a === void 0 ? void 0 : _a[channel]) === null || _b === void 0 ? void 0 : _b.scale) === null || _c === void 0 ? void 0 : _c[prop];
                                });
                                overlayStream.encoding[channel].scale.id = match.id;
                            }
                        }
                    });
                }
            }
        }
        return removals;
    }
    function findScaleMatch(scaleDefinitions, encoding, matchParent, matchData) {
        var _a, _b;
        // matchParent (whether overlay's scales are consistent to those of parent sequence)
        // matchData (whether to force scale consistency even if data is different)
        let thisDef;
        for (const def of scaleDefinitions) {
            if (def.id === ((_a = encoding.scale) === null || _a === void 0 ? void 0 : _a.id))
                thisDef = def;
        }
        if (thisDef) {
            for (const def of scaleDefinitions) {
                if (def.channel === thisDef.channel && def.type === thisDef.type) {
                    if (def.channel === TIME_chn && def.scale.timing !== thisDef.scale.timing)
                        continue;
                    if (matchData && matchParent) {
                        if (def.dataName === thisDef.dataName && def.parentId === thisDef.parentId)
                            return def;
                    }
                    else if (!matchData && matchParent) {
                        if (def.parentId === thisDef.parentId)
                            return def;
                    }
                    else if (matchData && !matchParent) {
                        if (def.dataName === thisDef.dataName)
                            return def;
                    }
                    else {
                        return def;
                    }
                }
                if (def.id === ((_b = encoding.scale) === null || _b === void 0 ? void 0 : _b.id))
                    return def;
            }
        }
        return null;
    }
    function getChannelType(loaded_datasets, spec, untyped_channels) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = loaded_datasets[spec.data.name];
            if (!data || !spec.encoding) {
                console.error("No proper layer spec provided.");
                return undefined;
            }
            // before transforms
            for (const channel of Object.keys(spec.encoding)) {
                if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
                    spec.encoding[channel].type = STATIC;
                }
                else if (!spec.encoding[channel].type) {
                    let f = spec.encoding[channel].field instanceof Array ? spec.encoding[channel].field[0] : spec.encoding[channel].field;
                    spec.encoding[channel].type = detectType(data.map((d) => f ? d[f] : undefined)
                        .filter(d => d !== undefined));
                }
            }
            data = applyTransforms(data, spec);
            // after transforms
            for (const channel of Object.keys(spec.encoding)) {
                if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
                    spec.encoding[channel].type = STATIC;
                }
                else if (!spec.encoding[channel].type) {
                    let f = spec.encoding[channel].field instanceof Array ? spec.encoding[channel].field[0] : spec.encoding[channel].field;
                    spec.encoding[channel].type = detectType(data.map((d) => f ? d[f] : undefined)
                        .filter(d => d !== undefined));
                }
            }
        });
    }
    function makeScales(scaleHash, normalized, loaded_datasets, config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let scaleInfo = deepcopy(scaleHash);
            Object.keys(scaleInfo).forEach((scaleId) => {
                scaleInfo[scaleId].collected = [];
            });
            let beat;
            if (config === null || config === void 0 ? void 0 : config.timeUnit) {
                if (config.timeUnit.unit === 'beat') {
                    beat = {
                        converter: makeBeatFunction(config.timeUnit.tempo || 100)
                    };
                    let roundStart = true, roundDuration = false;
                    if (config.timeUnit.rounding) {
                        roundStart = (config.timeUnit.rounding !== 'never');
                        roundDuration = (config.timeUnit.rounding === 'always');
                    }
                    if (roundStart) {
                        beat.roundStart = makeBeatRounder(config.timeUnit.tempo || 100, config.timeUnit.roundingBy || 1);
                    }
                    if (roundDuration) {
                        beat.roundDuration = makeBeatRounder(config.timeUnit.tempo || 100, config.timeUnit.roundingBy || 1);
                    }
                }
            }
            // 1. update scale information
            for (const stream of normalized) {
                if ('stream' in stream && stream.stream) {
                    let data = loaded_datasets[stream.stream.data.name];
                    data = applyTransforms(data, stream.stream);
                    let encoding = stream.stream.encoding;
                    for (const cname of Object.keys(encoding)) {
                        let scaleId = (_b = (_a = encoding[cname]) === null || _a === void 0 ? void 0 : _a.scale) === null || _b === void 0 ? void 0 : _b.id;
                        if (scaleId) {
                            scaleInfo[scaleId].data = data;
                            if (encoding[cname].field) {
                                let collectionKey = stream.stream.data.name + "_" + (encoding[cname].field instanceof Array ? encoding[cname].field.join("_") : encoding[cname].field);
                                if (scaleInfo[scaleId].collected
                                    && !scaleInfo[scaleId].collected.includes(collectionKey)) {
                                    scaleInfoUpdater(encoding[cname], scaleInfo, data);
                                    scaleInfo[scaleId].collected.push(collectionKey);
                                }
                            }
                            else if (encoding[cname].value !== undefined) {
                                scaleInfo[scaleId].type = STATIC;
                                scaleInfo[scaleId].value = encoding[cname].value;
                            }
                            if (encoding[cname].format) {
                                scaleInfo[scaleId].format = encoding[cname].format;
                            }
                            if (encoding[cname].formatType) {
                                scaleInfo[scaleId].formatType = encoding[cname].formatType;
                            }
                            if (encoding[cname].roundToNote) {
                                scaleInfo[scaleId].roundToNote = encoding[cname].roundToNote;
                            }
                        }
                    }
                }
                else if ('overlay' in stream && stream.overlay) {
                    for (const overlay of stream.overlay) {
                        let data = loaded_datasets[overlay.data.name];
                        data = applyTransforms(data, overlay);
                        let encoding = overlay.encoding;
                        for (const cname of Object.keys(encoding)) {
                            let scaleId = (_d = (_c = encoding[cname]) === null || _c === void 0 ? void 0 : _c.scale) === null || _d === void 0 ? void 0 : _d.id;
                            if (scaleId) {
                                scaleInfo[scaleId].data = data;
                                if (encoding[cname].field) {
                                    let collectionKey = overlay.data.name + "_" + encoding[cname].field;
                                    if (scaleInfo[scaleId].collected
                                        && !scaleInfo[scaleId].collected.includes(collectionKey)) {
                                        scaleInfoUpdater(encoding[cname], scaleInfo, data);
                                        scaleInfo[scaleId].collected.push(collectionKey);
                                    }
                                }
                                else if (encoding[cname].value !== undefined) {
                                    scaleInfo[scaleId].type = STATIC;
                                    scaleInfo[scaleId].value = encoding[cname].value;
                                }
                                if (encoding[cname].format) {
                                    scaleInfo[scaleId].format = encoding[cname].format;
                                }
                                if (encoding[cname].formatType) {
                                    scaleInfo[scaleId].formatType = encoding[cname].formatType;
                                }
                            }
                        }
                    }
                }
            }
            // 2. make scale functions
            let scaleFunctions = {};
            for (const scaleId of Object.keys(scaleInfo)) {
                let scaleDef = scaleInfo[scaleId];
                let channel = scaleDef.channel;
                let o = deepcopy(scaleDef);
                if (scaleDef.values === undefined || scaleDef.data === undefined) {
                    console.error("Value not assigned", scaleDef);
                }
                else {
                    let s = getAudioScales(channel, o, scaleDef.values, beat, scaleDef.data);
                    if (s)
                        scaleFunctions[scaleId] = s;
                    else {
                        console.error("Couldn't get the scale function", channel, o, scaleDef.values, beat, scaleDef.data);
                    }
                }
            }
            if (beat)
                scaleFunctions.__beat = beat;
            return scaleFunctions;
        });
    }
    function scaleInfoUpdater(channel, scaleInfo, data) {
        var _a;
        let field = channel.field;
        let scaleId = (_a = channel === null || channel === void 0 ? void 0 : channel.scale) === null || _a === void 0 ? void 0 : _a.id;
        if (scaleId && scaleInfo[scaleId]) {
            if (!scaleInfo[scaleId].values)
                scaleInfo[scaleId].values = [];
            let datums = [];
            if (field instanceof Array) {
                field.forEach((f) => {
                    datums.push(...data.map((d, i) => d[f]));
                });
            }
            else {
                datums.push(...data.map((d, i) => d[field]));
            }
            if (scaleInfo[scaleId].type === TMP) {
                datums = datums.map((d) => new Date(d));
            }
            scaleInfo[scaleId].values.push(...datums);
        }
    }

    class SequenceStream {
        constructor() {
            this.streams = [];
            this.playing = false;
            this.prerendered = false;
            this.config = {};
            this.synths = {};
            this.samplings = {};
            this.waves = {};
        }
        setName(n) {
            this.name = n;
        }
        setTitle(t) {
            this.title = t;
        }
        setDescription(d) {
            this.description = d;
        }
        addStream(stream) {
            this.streams.push(stream);
        }
        addStreams(streams) {
            this.streams.push(...streams);
        }
        setSampling(samplings) {
            this.samplings = samplings;
        }
        setSynths(synths) {
            this.synths = synths;
        }
        setWaves(waves) {
            this.waves = waves;
        }
        setConfig(key, value) {
            this.config[key] = value;
        }
        setIntroStream(stream) {
            this.introStream = stream;
        }
        prerender() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _d, _e, _f, _g;
                this.queue = new AudioGraphQueue();
                if (this.config) {
                    Object.keys(this.config).forEach((key) => {
                        var _a;
                        (_a = this.queue) === null || _a === void 0 ? void 0 : _a.setConfig(key, this.config[key]);
                    });
                }
                this.queue.setSampling(this.samplings);
                this.queue.setSynths(this.synths);
                this.queue.setWaves(this.waves);
                if (!this.config.skipStartSpeech) {
                    this.queue.add(TextType, { speech: `To stop playing the sonification, press the X key. `, speechRate: (_a = this.config) === null || _a === void 0 ? void 0 : _a.speechRate }, this.config);
                }
                // 1. main title && description
                // in case of a separate intro stream
                if (this.introStream) {
                    this.introStream.stream.forEach((d) => {
                        var _a, _b;
                        (_a = this.queue) === null || _a === void 0 ? void 0 : _a.add(TextType, { speech: d.speech, speechRate: (_b = this.config) === null || _b === void 0 ? void 0 : _b.speechRate }, this.config);
                    });
                }
                else {
                    if (this.title && !this.config.skipTitle) {
                        this.queue.add(TextType, { speech: `${this.title}. `, speechRate: (_b = this.config) === null || _b === void 0 ? void 0 : _b.speechRate }, this.config);
                    }
                    else if (this.name && !this.config.skipTitle) {
                        this.queue.add(TextType, { speech: `This sonification is about ${this.name}. `, speechRate: (_d = this.config) === null || _d === void 0 ? void 0 : _d.speechRate }, this.config);
                    }
                    if (this.description && !this.config.skipDescription) {
                        this.queue.add(TextType, { speech: this.description, speechRate: (_e = this.config) === null || _e === void 0 ? void 0 : _e.speechRate }, this.config);
                    }
                }
                // 2. making queues
                let titles_queues = [], scales_queues = [], audio_queues = [], announced_scales = [];
                let multiSeq = this.streams.length > 1;
                if (multiSeq && !this.config.skipSquenceIntro) {
                    this.queue.add(TextType, { speech: `This sonification sequence consists of ${this.streams.length} parts. `, speechRate: (_f = this.config) === null || _f === void 0 ? void 0 : _f.speechRate }, this.config);
                }
                let oi = 0;
                for (const stream of this.streams) {
                    let _c = deepcopy(this.config || {});
                    Object.assign(_c, stream.config || {});
                    let speechRate = _c.speechRate;
                    if (multiSeq) {
                        let title_queue = new AudioGraphQueue();
                        if ((stream.title || stream.name) && !stream.config.skipSequenceTitle) {
                            title_queue.add(TextType, { speech: `Stream ${oi + 1}. ${(stream.title || stream.name)}. `, speechRate }, _c);
                        }
                        else if (!stream.config.skipSequenceTitle) {
                            title_queue.add(TextType, { speech: `Stream ${oi + 1}. `, speechRate }, _c);
                        }
                        if (stream.description && !stream.config.skipSequenceDescription) {
                            title_queue.add(TextType, { speech: stream.description, speechRate }, _c);
                        }
                        titles_queues.push(title_queue);
                    }
                    else {
                        titles_queues.push(new AudioGraphQueue());
                    }
                    let determiner = 'This';
                    if (multiSeq)
                        determiner = "The " + toOrdinalNumbers(oi + 1);
                    if (!('overlays' in stream) && !_c.skipScaleSpeech) {
                        let scale_text = stream.make_scale_text().filter((d) => d);
                        let scales_to_announce = [];
                        let forceRepeat = _c[ForceRepeatScale];
                        if (!forceRepeat)
                            forceRepeat = false;
                        for (const item of scale_text) {
                            if (item.description) {
                                if (item.id && !announced_scales.includes(item.id)) {
                                    scales_to_announce.push(...item.description);
                                    announced_scales.push(item.id);
                                }
                                else if (forceRepeat === true || (forceRepeat === null || forceRepeat === void 0 ? void 0 : forceRepeat[item.channel]) === true) {
                                    scales_to_announce.push(...item.description);
                                }
                            }
                        }
                        if (scales_to_announce.length > 0) {
                            let scales_queue = new AudioGraphQueue();
                            scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, _c);
                            scales_queue.addMulti(scales_to_announce, Object.assign(Object.assign({}, _c), { tick: null }));
                            scales_queues.push(scales_queue);
                        }
                    }
                    else if ('overlays' in stream) {
                        // each overlay title
                        if (!_c.skipTitle)
                            titles_queues[oi].add(TextType, { speech: `${determiner} stream has ${stream.overlays.length} overlaid sounds. `, speechRate }, _c);
                        let forceRepeat = _c[ForceRepeatScale];
                        if (!forceRepeat)
                            forceRepeat = false;
                        let scale_init_text_added = false;
                        let scales_queue = new AudioGraphQueue();
                        stream.overlays.forEach((overlay, li) => {
                            let __c = deepcopy(_c || {});
                            Object.assign(__c, overlay.config || {});
                            let speechRate = __c.speechRate;
                            if (__c.playRepeatSequenceName !== false && overlay.title && !__c.skipOverlayTitle) {
                                titles_queues[oi].add(TextType, { speech: `Overlay ${li + 1}. ${overlay.title}. `, speechRate }, __c);
                            }
                            else if (__c.playRepeatSequenceName !== false && overlay.name && !__c.skipOverlayTitle) {
                                titles_queues[oi].add(TextType, { speech: `Overlay ${li + 1}. ${overlay.name}. `, speechRate }, __c);
                            }
                            if (overlay.description && !__c.skipOverlayDescription) {
                                titles_queues[oi].add(TextType, { speech: overlay.description, speechRate }, __c);
                            }
                            let scale_text = stream.make_scale_text(undefined, li).filter((d) => d);
                            let scales_to_announce = [];
                            for (const item of scale_text) {
                                if (item.description) {
                                    if (item.id && !announced_scales.includes(item.id)) {
                                        scales_to_announce.push(...item.description);
                                        announced_scales.push(item.id);
                                    }
                                    else if (forceRepeat === true || (forceRepeat === null || forceRepeat === void 0 ? void 0 : forceRepeat[item.channel]) === true) {
                                        scales_to_announce.push(...item.description);
                                    }
                                }
                            }
                            if (scales_to_announce.length > 0) {
                                if (!forceRepeat && !scale_init_text_added) {
                                    scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, __c);
                                    scale_init_text_added = true;
                                }
                                else {
                                    let determiner2 = 'This';
                                    if (multiSeq && li > 1)
                                        determiner2 = "The " + toOrdinalNumbers(li);
                                    scales_queue.add(TextType, { speech: `${determiner2} overlay has the following sound mappings. `, speechRate }, __c);
                                }
                                scales_queue.addMulti(scales_to_announce, Object.assign(Object.assign({}, __c), { tick: null }));
                            }
                        });
                        if (scales_queue.queue.length > 0) {
                            scales_queues.push(scales_queue);
                        }
                    }
                    oi++;
                }
                // 3. Prerender subqueues
                for (const stream of this.streams) {
                    let prerender_series = yield stream.prerender(true);
                    audio_queues.push(prerender_series);
                }
                // 4. queueing
                let streamIndex = 0;
                let preaddPos = this.queue.queue.length || 0;
                let preadd = [], postadd = [];
                for (const stream of this.streams) {
                    let _c = deepcopy(this.config || {});
                    Object.assign(_c, stream.config || {});
                    let speechRate = _c.speechRate;
                    if (titles_queues[streamIndex])
                        this.queue.addQueue(titles_queues[streamIndex]);
                    let scalePlayAt = _c[PlayAt];
                    if (scalePlayAt === BeforeAll) {
                        if (scales_queues[streamIndex])
                            preadd.push(scales_queues[streamIndex]);
                    }
                    else if (scalePlayAt === BeforeThis || !scalePlayAt) {
                        if (scales_queues[streamIndex])
                            this.queue.addQueue(scales_queues[streamIndex]);
                    }
                    let prerender_series = audio_queues[streamIndex];
                    if (!_c.skipStartPlaySpeech) {
                        this.queue.add(TextType, { speech: `Start playing. `, speechRate }, _c);
                    }
                    if (isAudioGraphQueue(prerender_series)) {
                        this.queue.addQueue(prerender_series);
                    }
                    else {
                        this.queue.add(ToneSeries, prerender_series, _c);
                    }
                    if (scalePlayAt === AfterAll) {
                        if (scales_queues[streamIndex])
                            postadd.push(scales_queues[streamIndex]);
                    }
                    else if (scalePlayAt === AfterThis) {
                        if (scales_queues[streamIndex])
                            this.queue.addQueue(scales_queues[streamIndex]);
                    }
                    streamIndex++;
                }
                if (preadd.length > 0) {
                    for (const pq of preadd) {
                        this.queue.addQueue(pq, preaddPos);
                        preaddPos += 1;
                    }
                }
                if (postadd.length > 0) {
                    for (const pq of postadd) {
                        this.queue.addQueue(pq);
                    }
                }
                if (!this.config.skipFinishSpeech) {
                    this.queue.add(TextType, { speech: "Finished.", speechRate: (_g = this.config) === null || _g === void 0 ? void 0 : _g.speechRate }, this.config);
                }
                this.prerendered = true;
                this.queue.setConfig('options', this.config.options);
                return this.queue;
            });
        }
        make_scale_text(channel, i) {
            var _a;
            if (i === undefined) {
                return this.streams.map((stream) => {
                    return stream.make_scale_text(channel);
                }).flat();
            }
            else {
                return (_a = this.streams[i]) === null || _a === void 0 ? void 0 : _a.make_scale_text(channel);
            }
        }
        // needs test
        prerenderScale(channel, i) {
            return __awaiter(this, void 0, void 0, function* () {
                let scaleQueue = (this.make_scale_text(channel, i) || []).map((d) => d.description).flat();
                this.scaleQueue = new AudioGraphQueue();
                this.scaleQueue.addMulti(scaleQueue, Object.assign(Object.assign({}, this.config), { tick: null }));
                return this.scaleQueue;
            });
        }
        playScaleDescription(i, channel) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                yield this.prerenderScale(channel, i);
                yield ((_a = this.scaleQueue) === null || _a === void 0 ? void 0 : _a.play());
            });
        }
        stopScaleDescription() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = this.scaleQueue) === null || _a === void 0 ? void 0 : _a.stop();
            });
        }
        playQueue() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (!this.prerendered)
                    yield this.prerender();
                yield ((_a = this.queue) === null || _a === void 0 ? void 0 : _a.play());
            });
        }
        stopQueue() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = this.queue) === null || _a === void 0 ? void 0 : _a.stop();
            });
        }
        destroy() {
            var _a;
            this.queue = (_a = this.queue) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }

    class SpeechStream {
        constructor(stream) {
            this.stream = stream;
            this.config = {};
        }
        setConfig(key, value) {
            this.config[key] = value;
        }
        make_scale_text() {
            return [];
        }
        prerender() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                let text = [];
                for (const stream of this.stream) {
                    if (stream.speech) {
                        text.push({
                            speech: stream.speech,
                            speechRate: (_a = stream.speechRate) !== null && _a !== void 0 ? _a : (_b = this.config) === null || _b === void 0 ? void 0 : _b.speechRate,
                            language: stream.language,
                            pitch: stream.pitch,
                            loudness: stream.loudness
                        });
                    }
                }
                return text;
            });
        }
    }

    // global event
    let isRecorded = false;
    function readyRecording() {
        var _a;
        (_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.addEventListener("erieOnRecorderReady", (e) => {
            isRecorded = true;
        });
    }
    function compileAudioGraph(audio_spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let { normalized, datasets, tick, scaleDefinitions, sequenceConfig, synths, samplings, waves } = yield normalizeSpecification(audio_spec, options);
            // 1. load datasets first! && filling missing data type
            let loaded_datasets = {};
            let scalesToRemove = [];
            for (const stream of normalized) {
                if ('stream' in stream && stream.stream) {
                    yield getData(stream.stream.data, loaded_datasets, datasets);
                    let untyped_channels = [];
                    Object.keys(stream.stream.encoding).forEach((channel) => {
                        if (!stream.stream.encoding[channel].type)
                            untyped_channels.push(channel);
                    });
                    if (untyped_channels.length > 0) {
                        yield getChannelType(loaded_datasets, stream.stream);
                    }
                    scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, sequenceConfig));
                }
                else if ('overlay' in stream && stream.overlay) {
                    for (const overlay of stream.overlay) {
                        yield getData(overlay.data, loaded_datasets, datasets);
                        let untyped_channels = [];
                        Object.keys(overlay.encoding).forEach((channel) => {
                            if (!overlay.encoding[channel].type)
                                untyped_channels.push(channel);
                        });
                        if (untyped_channels.length > 0) {
                            yield getChannelType(loaded_datasets, overlay);
                        }
                    }
                    let c = {};
                    Object.assign(c, sequenceConfig);
                    Object.assign(c, stream.config || {});
                    scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, c));
                }
            }
            // 2. tidy up scales
            let scaleHash = toHashedObject(scaleDefinitions, 'id');
            for (const sid of scalesToRemove) {
                delete scaleHash[sid];
            }
            // 3. make scales
            let scales = yield makeScales(scaleHash, normalized, loaded_datasets, sequenceConfig);
            // 4. make streams
            let sequence = new SequenceStream();
            if ((_a = audio_spec === null || audio_spec === void 0 ? void 0 : audio_spec.config) === null || _a === void 0 ? void 0 : _a.recording) {
                sequence.setConfig("recording", true);
            }
            // 4a. regiester stuff
            sequence.setSampling(toHashedObject(samplings, 'name'));
            sequence.setSynths(toHashedObject(synths, 'name'));
            sequence.setWaves(toHashedObject(waves, 'name'));
            for (const stream of normalized) {
                if ('intro' in stream && stream.intro) {
                    let speeches = [stream.intro.title, stream.intro.description].filter(d => d !== undefined);
                    let sStream = new SpeechStream(speeches.map((d) => ({ speech: d })));
                    if ('config' in audio_spec && audio_spec.config) {
                        Object.keys(audio_spec.config).forEach((key) => {
                            var _a;
                            if ((_a = audio_spec.config) === null || _a === void 0 ? void 0 : _a[key]) {
                                sStream.setConfig(key, audio_spec.config[key]);
                            }
                        });
                    }
                    sequence.setIntroStream(sStream);
                }
                else if ('stream' in stream && stream.stream) {
                    let is_repeated = isRepeatedStream(stream.stream);
                    let data = deepcopy(loaded_datasets[stream.stream.data.name]);
                    // slag = single layer audio graph
                    let slag = yield compileSingleLayerAuidoGraph(stream.stream, data, audio_spec.config, tick, scales);
                    if (!is_repeated && (slag === null || slag === void 0 ? void 0 : slag.stream)) {
                        sequence.addStream(slag === null || slag === void 0 ? void 0 : slag.stream);
                    }
                    else if (slag === null || slag === void 0 ? void 0 : slag.stream) {
                        sequence.addStreams(slag === null || slag === void 0 ? void 0 : slag.stream);
                    }
                    if (audio_spec.config) {
                        Object.keys(audio_spec.config).forEach((key) => {
                            var _a;
                            if ((_a = audio_spec.config) === null || _a === void 0 ? void 0 : _a[key]) {
                                sequence.setConfig(key, audio_spec.config[key]);
                            }
                        });
                    }
                    if (stream.stream.config) {
                        Object.keys(stream.stream.config).forEach((key) => {
                            if (stream.stream.config)
                                sequence.setConfig(key, stream.stream.config[key]);
                        });
                    }
                    if (stream.stream.title)
                        sequence.setTitle(stream.stream.title);
                    if (stream.stream.description)
                        sequence.setDescription(stream.stream.description);
                }
                else if ('overlay' in stream && stream.overlay) {
                    let overlays = new OverlayStream();
                    for (const overlay of stream.overlay) {
                        let data = deepcopy(loaded_datasets[overlay.data.name]);
                        let config = deepcopy(audio_spec.config);
                        Object.assign(config, overlay.config);
                        let overlayStrm = yield compileSingleLayerAuidoGraph(overlay, data, config, tick, scales);
                        if (overlayStrm) {
                            if (overlay.name)
                                overlayStrm.stream.setName(overlay.name);
                            if (overlay.title)
                                overlayStrm.stream.setTitle(overlay.title);
                            if (overlay.description)
                                overlayStrm.stream.setDescription(overlay.description);
                            overlays.addStream(overlayStrm.stream);
                        }
                    }
                    if (stream.name)
                        overlays.setName(stream.name);
                    if (stream.title)
                        overlays.setTitle(stream.title);
                    if (stream.description)
                        overlays.setDescription(stream.description);
                    if (audio_spec.config) {
                        Object.keys(audio_spec.config).forEach((key) => {
                            var _a;
                            if ((_a = audio_spec.config) === null || _a === void 0 ? void 0 : _a[key]) {
                                overlays.setConfig(key, audio_spec.config[key]);
                            }
                        });
                    }
                    if (stream.config) {
                        Object.keys(stream.config).forEach((key) => {
                            overlays.setConfig(key, stream.config[key]);
                        });
                    }
                    sequence.addStream(overlays);
                }
            }
            if (audio_spec.config) {
                Object.keys(audio_spec.config).forEach((key) => {
                    var _a;
                    if ((_a = audio_spec.config) === null || _a === void 0 ? void 0 : _a[key]) {
                        sequence.setConfig(key, audio_spec.config[key]);
                    }
                });
            }
            if (typeof window !== 'undefined'
                && 'erieRecorderReady' in window
                && (window === null || window === void 0 ? void 0 : window.erieRecorderReady)) {
                isRecorded = true;
            }
            sequence.setConfig('isRecorded', isRecorded);
            sequence.setConfig('options', options);
            return sequence;
        });
    }

    exports.ABS = ABS;
    exports.AM = AM;
    exports.AMMppaer = AMMppaer;
    exports.AVG = AVG;
    exports.AfterAll = AfterAll;
    exports.AfterThis = AfterThis;
    exports.Aggregate = Aggregate;
    exports.AllowedDataTypes = AllowedDataTypes;
    exports.AllpassBiquadFilter = AllpassBiquadFilter;
    exports.AudioFilterPrototype = AudioFilterPrototype;
    exports.AudioGraphQueue = AudioGraphQueue;
    exports.AudioPrimitiveBuffer = AudioPrimitiveBuffer;
    exports.Auto = Auto;
    exports.BandpassBiquadFilter = BandpassBiquadFilter;
    exports.BeforeAll = BeforeAll;
    exports.BeforeThis = BeforeThis;
    exports.Bin = Bin;
    exports.BiquadEncoder = BiquadEncoder;
    exports.BiquadFilter = BiquadFilter;
    exports.BiquadFinisher = BiquadFinisher;
    exports.BrownNoise = BrownNoise;
    exports.BufferChannels = BufferChannels$1;
    exports.CORR = CORR;
    exports.COUNT = COUNT;
    exports.COVARIANCE = COVARIANCE;
    exports.COVARIANCEP = COVARIANCEP;
    exports.Calculate = Calculate;
    exports.Channel = Channel;
    exports.ChannelCaps = ChannelCaps;
    exports.ChannelThresholds = ChannelThresholds;
    exports.CompressorEncoder = CompressorEncoder;
    exports.CompressorFinisher = CompressorFinisher;
    exports.Config = Config;
    exports.DEF_DUR = DEF_DUR;
    exports.DEF_LEGEND_DUR = DEF_LEGEND_DUR;
    exports.DEF_SPEECH_RATE = DEF_SPEECH_RATE;
    exports.DEF_TAPPING_DUR = DEF_TAPPING_DUR;
    exports.DEF_TAPPING_DUR_BEAT = DEF_TAPPING_DUR_BEAT;
    exports.DEF_TAP_DUR = DEF_TAP_DUR;
    exports.DEF_TAP_DUR_BEAT = DEF_TAP_DUR_BEAT;
    exports.DEF_TAP_PAUSE_RATE = DEF_TAP_PAUSE_RATE;
    exports.DETUNE_chn = DETUNE_chn;
    exports.DISTINCT = DISTINCT;
    exports.DUR_chn = DUR_chn;
    exports.Data = Data;
    exports.Dataset = Dataset;
    exports.Datasets = Datasets;
    exports.DateFormat = DateFormat;
    exports.DefCarrierPitch = DefCarrierPitch;
    exports.DefModPitch = DefModPitch;
    exports.Def_Tick_Duration = Def_Tick_Duration;
    exports.Def_Tick_Duration_Beat = Def_Tick_Duration_Beat;
    exports.Def_Tick_Interval = Def_Tick_Interval;
    exports.Def_Tick_Interval_Beat = Def_Tick_Interval_Beat;
    exports.Def_Tick_Loudness = Def_Tick_Loudness;
    exports.Def_tone = Def_tone;
    exports.DefaultChannels = DefaultChannels;
    exports.DefaultDynamicCompressor = DefaultDynamicCompressor;
    exports.DefaultFrequency = DefaultFrequency;
    exports.DefaultGlyphFeatures = DefaultGlyphFeatures;
    exports.DefaultModGainAM = DefaultModGainAM;
    exports.DefaultModGainFM = DefaultModGainFM;
    exports.Density = Density;
    exports.DescKeyAggregate = DescKeyAggregate;
    exports.DescKeyChannel = DescKeyChannel;
    exports.DescKeyDomain = DescKeyDomain;
    exports.DescKeyDomainLength = DescKeyDomainLength;
    exports.DescKeyDomainMax = DescKeyDomainMax;
    exports.DescKeyDomainMin = DescKeyDomainMin;
    exports.DescKeyDomainNumberedRegex = DescKeyDomainNumberedRegex;
    exports.DescKeyField = DescKeyField;
    exports.DescKeyList = DescKeyList;
    exports.DescKeyRange = DescKeyRange;
    exports.DescKeyRangeLength = DescKeyRangeLength;
    exports.DescKeyRangeMax = DescKeyRangeMax;
    exports.DescKeyRangeMin = DescKeyRangeMin;
    exports.DescKeySound = DescKeySound;
    exports.DescKeyTimeUnit = DescKeyTimeUnit;
    exports.DescKeyTitle = DescKeyTitle;
    exports.DetuneChannel = DetuneChannel;
    exports.DistortionEncoder = DistortionEncoder;
    exports.DistortionFilter = DistortionFilter;
    exports.DistortionFinisher = DistortionFinisher;
    exports.DoubleOps = DoubleOps;
    exports.DurationChannel = DurationChannel;
    exports.End = End;
    exports.ErieFilters = ErieFilters;
    exports.ErieSynth = ErieSynth;
    exports.ErieSynthFrequency = ErieSynthFrequency;
    exports.FM = FM;
    exports.Filter = Filter;
    exports.FilterExtraChannelTypes = FilterExtraChannelTypes;
    exports.Finished = Finished;
    exports.Fold = Fold;
    exports.ForceRepeatScale = ForceRepeatScale;
    exports.GainerEncoder = GainerEncoder;
    exports.GainerFilter = GainerFilter;
    exports.GainerFinisher = GainerFinisher;
    exports.Globals = Globals;
    exports.GoogleCloudTTSGenerator = GoogleCloudTTSGenerator;
    exports.HARMONICITY_chn = HARMONICITY_chn;
    exports.HarmonicityChannel = HarmonicityChannel;
    exports.HighpassBiquadFilter = HighpassBiquadFilter;
    exports.HighshelfBiquadFilter = HighshelfBiquadFilter;
    exports.InternalData = InternalData;
    exports.K_Keyword = K_Keyword;
    exports.K_Text = K_Text;
    exports.KeyBand = KeyBand;
    exports.KeyBase = KeyBase;
    exports.KeyConstant = KeyConstant;
    exports.KeyDescription = KeyDescription;
    exports.KeyDomain = KeyDomain;
    exports.KeyDomainMax = KeyDomainMax;
    exports.KeyDomainMid = KeyDomainMid;
    exports.KeyDomainMin = KeyDomainMin;
    exports.KeyExponent = KeyExponent;
    exports.KeyLength = KeyLength;
    exports.KeyMaxDistinct = KeyMaxDistinct;
    exports.KeyMaxTappingLength = KeyMaxTappingLength;
    exports.KeyNice = KeyNice;
    exports.KeyOrder = KeyOrder;
    exports.KeyPauseLength = KeyPauseLength;
    exports.KeyPauseRate = KeyPauseRate;
    exports.KeyPolarity = KeyPolarity;
    exports.KeyRange = KeyRange;
    exports.KeyRangeMax = KeyRangeMax;
    exports.KeyRangeMid = KeyRangeMid;
    exports.KeyRangeMin = KeyRangeMin;
    exports.KeySingleTappingPosition = KeySingleTappingPosition;
    exports.KeySort = KeySort;
    exports.KeyTimes = KeyTimes;
    exports.KeyTiming = KeyTiming;
    exports.KeyTitle = KeyTitle;
    exports.KeyType = KeyType;
    exports.KeyZero = KeyZero;
    exports.LINEAR = LINEAR;
    exports.LOG = LOG;
    exports.LOUDNESS_chn = LOUDNESS_chn;
    exports.LegendType = LegendType;
    exports.LoudnessChannel = LoudnessChannel;
    exports.LowpassBiquadFilter = LowpassBiquadFilter;
    exports.LowshelfBiquadFilter = LowshelfBiquadFilter;
    exports.MAX = MAX;
    exports.MAX_DETUNE = MAX_DETUNE;
    exports.MAX_DUR = MAX_DUR;
    exports.MAX_LIMIT_PITCH = MAX_LIMIT_PITCH$1;
    exports.MAX_LIMIT_TAP_SPEED = MAX_LIMIT_TAP_SPEED$1;
    exports.MAX_LOUD = MAX_LOUD;
    exports.MAX_PAN = MAX_PAN;
    exports.MAX_PITCH = MAX_PITCH;
    exports.MAX_POST_REVERB = MAX_POST_REVERB;
    exports.MAX_TAPPING_DUR = MAX_TAPPING_DUR;
    exports.MAX_TAP_COUNT = MAX_TAP_COUNT;
    exports.MAX_TAP_SPEED = MAX_TAP_SPEED;
    exports.MAX_TIME = MAX_TIME;
    exports.MEAN = MEAN;
    exports.MEDIAN = MEDIAN;
    exports.MIN = MIN;
    exports.MIN_DETUNE = MIN_DETUNE;
    exports.MIN_DUR = MIN_DUR;
    exports.MIN_LOUD = MIN_LOUD;
    exports.MIN_PAN = MIN_PAN;
    exports.MIN_PITCH = MIN_PITCH;
    exports.MIN_POST_REVERB = MIN_POST_REVERB;
    exports.MIN_TAP_COUNT = MIN_TAP_COUNT;
    exports.MIN_TAP_SPEED = MIN_TAP_SPEED;
    exports.MIN_TIME = MIN_TIME;
    exports.MODE = MODE;
    exports.MODULATION_chn = MODULATION_chn;
    exports.M_Sound = M_Sound;
    exports.M_Text = M_Text;
    exports.Middle = Middle;
    exports.ModulationChannel = ModulationChannel;
    exports.MultiNoteInstruments = MultiNoteInstruments;
    exports.MultiPlaying = MultiPlaying;
    exports.NEG = NEG;
    exports.NOM = NOM;
    exports.NONSKIP = NONSKIP;
    exports.Name = Name;
    exports.NoiseTypes = NoiseTypes;
    exports.NomPalletes = NomPalletes;
    exports.NonTimeChannels = NonTimeChannels;
    exports.NotchBiquadFilter = NotchBiquadFilter;
    exports.NumberFormat = NumberFormat;
    exports.ORD = ORD;
    exports.OVERLAY = OVERLAY;
    exports.OscTypes = OscTypes;
    exports.Overlay = Overlay;
    exports.OverlayStream = OverlayStream;
    exports.PAN_chn = PAN_chn;
    exports.PITCH_chn = PITCH_chn;
    exports.POS = POS;
    exports.POST_REVERB_chn = POST_REVERB_chn;
    exports.POW = POW;
    exports.PRODUCT = PRODUCT;
    exports.PanChannel = PanChannel;
    exports.Pause = Pause;
    exports.Paused = Paused;
    exports.PeakingBiquadFilter = PeakingBiquadFilter;
    exports.PinkNoise = PinkNoise;
    exports.PitchChannel = PitchChannel;
    exports.PlayAt = PlayAt;
    exports.Playing = Playing;
    exports.PostReverbChannel = PostReverbChannel;
    exports.PresetFilters = PresetFilters;
    exports.QUANT = QUANT;
    exports.QUANTILE = QUANTILE;
    exports.QuantPreferredRange = QuantPreferredRange;
    exports.QueueItemTypes = QueueItemTypes;
    exports.REL = REL;
    exports.REPEAT_chn = REPEAT_chn;
    exports.RampAbrupt = RampAbrupt;
    exports.RampExp = RampExp;
    exports.RampLinear = RampLinear;
    exports.RampMethods = RampMethods;
    exports.RamperNames = RamperNames;
    exports.RepeatChannel = RepeatChannel;
    exports.SAWTOOTH = SAWTOOTH;
    exports.SEQUENCE = SEQUENCE;
    exports.SIM = SIM;
    exports.SINE = SINE;
    exports.SINGLE_TAP_END = SINGLE_TAP_END;
    exports.SINGLE_TAP_MIDDLE = SINGLE_TAP_MIDDLE;
    exports.SINGLE_TAP_START = SINGLE_TAP_START;
    exports.SKIP = SKIP;
    exports.SPEECH_AFTER_chn = SPEECH_AFTER_chn;
    exports.SPEECH_BEFORE_chn = SPEECH_BEFORE_chn;
    exports.SPEECH_chn = SPEECH_chn;
    exports.SQRT = SQRT;
    exports.SQUARE = SQUARE;
    exports.STATIC = STATIC;
    exports.STDEV = STDEV;
    exports.STDEVP = STDEVP;
    exports.SUM = SUM;
    exports.SYMLOG = SYMLOG;
    exports.SampleRate = SampleRate$1;
    exports.SampledTone = SampledTone;
    exports.Sampling = Sampling;
    exports.ScaleDescriptionOrder = ScaleDescriptionOrder;
    exports.Sequence = Sequence;
    exports.SequenceStream = SequenceStream;
    exports.SingleNoteInstruments = SingleNoteInstruments;
    exports.SingleOps = SingleOps;
    exports.SingleTapPosOptions = SingleTapPosOptions;
    exports.SpeechAfterChannel = SpeechAfterChannel;
    exports.SpeechBeforeChannel = SpeechBeforeChannel;
    exports.SpeechChannels = SpeechChannels;
    exports.SpeechStream = SpeechStream;
    exports.SpeechType = SpeechType;
    exports.Start = Start;
    exports.Stopped = Stopped;
    exports.Stream = Stream;
    exports.SupportedInstruments = SupportedInstruments;
    exports.SupportedPolarity = SupportedPolarity;
    exports.Synth = Synth;
    exports.SynthTone = SynthTone;
    exports.SynthTypes = SynthTypes;
    exports.TAPCNT_chn = TAPCNT_chn;
    exports.TAPSPD_chn = TAPSPD_chn;
    exports.TIMBRE_chn = TIMBRE_chn;
    exports.TIME2_chn = TIME2_chn;
    exports.TIME_chn = TIME_chn;
    exports.TIMINGS = TIMINGS;
    exports.TMP = TMP;
    exports.TRIANGLE = TRIANGLE;
    exports.TU_Always = TU_Always;
    exports.TU_BEAT = TU_BEAT;
    exports.TU_Never = TU_Never;
    exports.TU_SEC = TU_SEC;
    exports.TU_Start = TU_Start;
    exports.TapChannels = TapChannels;
    exports.TapCountChannel = TapCountChannel;
    exports.TapSpeedChannel = TapSpeedChannel;
    exports.TextType = TextType;
    exports.Tick = Tick;
    exports.TickKeyBand = TickKeyBand;
    exports.TickKeyInterval = TickKeyInterval;
    exports.TickKeyLoudness = TickKeyLoudness;
    exports.TickKeyName = TickKeyName;
    exports.TickKeyOscType = TickKeyOscType;
    exports.TickKeyPitch = TickKeyPitch;
    exports.TickKeyPlayAtTime0 = TickKeyPlayAtTime0;
    exports.TickList = TickList;
    exports.TimbreChannel = TimbreChannel;
    exports.Time2Channel = Time2Channel;
    exports.TimeChannel = TimeChannel;
    exports.TimeChannels = TimeChannels;
    exports.Tone = Tone;
    exports.ToneOverlaySeries = ToneOverlaySeries;
    exports.ToneSeries = ToneSeries;
    exports.ToneSpeechSeries = ToneSpeechSeries;
    exports.ToneType = ToneType;
    exports.Transform = Transform;
    exports.UnitStream = UnitStream;
    exports.Unset = Unset;
    exports.Url = Url;
    exports.VALID = VALID;
    exports.VARIANCE = VARIANCE;
    exports.VARIANCEP = VARIANCEP;
    exports.Values = Values;
    exports.Wave = Wave;
    exports.WaveTone = WaveTone;
    exports.WebSpeechGenerator = WebSpeechGenerator;
    exports.WhiteNoise = WhiteNoise;
    exports.ZeroOPs = ZeroOPs;
    exports._getData = _getData;
    exports.addURLtoDataObject = addURLtoDataObject;
    exports.applyTransforms = applyTransforms;
    exports.asc = asc;
    exports.bcp47language = bcp47language;
    exports.bin_end_ending = bin_end_ending;
    exports.bin_ending = bin_ending;
    exports.bufferToArrayBuffer = bufferToArrayBuffer;
    exports.clearPlayerEvents = clearPlayerEvents;
    exports.closeErieGlobalControl = closeErieGlobalControl;
    exports.compileAudioGraph = compileAudioGraph;
    exports.compileDescriptionMarkup = compileDescriptionMarkup;
    exports.compileSingleLayerAuidoGraph = compileSingleLayerAuidoGraph;
    exports.concatenateBuffers = concatenateBuffers;
    exports.count_ending = count_ending;
    exports.createBin = createBin;
    exports.deepcopy = deepcopy;
    exports.defaultTapLength = defaultTapLength;
    exports.desc = desc;
    exports.descriptionKeywords = descriptionKeywords;
    exports.detectType = detectType;
    exports.determineNoteRange = determineNoteRange;
    exports.detuneAmmount = detuneAmmount;
    exports.doAggregate = doAggregate;
    exports.doCalculate = doCalculate;
    exports.emitNotePlayEvent = emitNotePlayEvent;
    exports.emitNoteStopEvent = emitNoteStopEvent;
    exports.filterTable = filterTable;
    exports.floor = floor;
    exports.foldTable = foldTable;
    exports.genRid = genRid;
    exports.generatePCMCode = generatePCMCode;
    exports.generateQuantiles = generateQuantiles;
    exports.getAudioScales = getAudioScales;
    exports.getChannelCaps = getChannelCaps;
    exports.getChannelThresholds = getChannelThresholds;
    exports.getChannelType = getChannelType;
    exports.getData = getData;
    exports.getDuration1 = getDuration1;
    exports.getEndTime1 = getEndTime1;
    exports.getFirstDefined = getFirstDefined;
    exports.getKernelDensity = getKernelDensity;
    exports.getSampleBaseUrl = getSampleBaseUrl;
    exports.getStartTime1 = getStartTime1;
    exports.glyphSorterByEnd = glyphSorterByEnd;
    exports.glyphSorterByStart = glyphSorterByStart;
    exports.isArrayOf = isArrayOf;
    exports.isAudioGraphQueue = isAudioGraphQueue;
    exports.isBrowserEventPossible = isBrowserEventPossible;
    exports.isBrowserWindowPossible = isBrowserWindowPossible;
    exports.isCSV = isCSV;
    exports.isDefaultGlyphFeature = isDefaultGlyphFeature;
    exports.isErieGlobalControlAudioContext = isErieGlobalControlAudioContext;
    exports.isErieGlobalControlSpeechSynthesis = isErieGlobalControlSpeechSynthesis;
    exports.isErieGlobalControlType = isErieGlobalControlType;
    exports.isErieGlobalState = isErieGlobalState;
    exports.isGlyphInfo = isGlyphInfo;
    exports.isInstanceOf = isInstanceOf;
    exports.isInstanceOfByName = isInstanceOfByName;
    exports.isJSON = isJSON;
    exports.isOscType = isOscType;
    exports.isOverlayStream = isOverlayStream;
    exports.isOverlayStreamObject = isOverlayStreamObject;
    exports.isPauseInfo = isPauseInfo;
    exports.isPauseQueueItem = isPauseQueueItem;
    exports.isRepeatedStream = isRepeatedStream;
    exports.isSequenceStream = isSequenceStream;
    exports.isSeriesQueueItem = isSeriesQueueItem;
    exports.isSingleStream = isSingleStream;
    exports.isSoundInfo = isSoundInfo;
    exports.isTSV = isTSV;
    exports.isTextInfo = isTextInfo;
    exports.isTextQueueItem = isTextQueueItem;
    exports.isToneOverlayInfo = isToneOverlayInfo;
    exports.isToneOverlaySeriesQueueItem = isToneOverlaySeriesQueueItem;
    exports.isToneQueueItem = isToneQueueItem;
    exports.isToneSeriesInfo = isToneSeriesInfo;
    exports.isToneSeriesQueueItem = isToneSeriesQueueItem;
    exports.isToneSpeechSeriesQueueItem = isToneSpeechSeriesQueueItem;
    exports.isUnitStreamObject = isUnitStreamObject;
    exports.listString = listString;
    exports.loadSamples = loadSamples;
    exports.makeAscSortFn = makeAscSortFn;
    exports.makeBeatFunction = makeBeatFunction;
    exports.makeBeatRounder = makeBeatRounder;
    exports.makeBoxPlotTable = makeBoxPlotTable;
    exports.makeContext = makeContext;
    exports.makeDescSortFn = makeDescSortFn;
    exports.makeFieldedScaleFunction = makeFieldedScaleFunction;
    exports.makeIndexSortFn = makeIndexSortFn;
    exports.makeInstrument = makeInstrument;
    exports.makeMultiScaleSamplingNode = makeMultiScaleSamplingNode;
    exports.makeNoiseNode = makeNoiseNode;
    exports.makeNominalScaleFunction = makeNominalScaleFunction;
    exports.makeOfflineContext = makeOfflineContext;
    exports.makeOrdinalScaleFunction = makeOrdinalScaleFunction;
    exports.makeParamFilter = makeParamFilter;
    exports.makeQuantitativeScaleFunction = makeQuantitativeScaleFunction;
    exports.makeRepeatStreamTree = makeRepeatStreamTree;
    exports.makeScaleDescription = makeScaleDescription;
    exports.makeScales = makeScales;
    exports.makeSingleScaleSamplingNode = makeSingleScaleSamplingNode;
    exports.makeSpeechChannelScale = makeSpeechChannelScale;
    exports.makeStaticScaleFunction = makeStaticScaleFunction;
    exports.makeSynth = makeSynth;
    exports.makeTapPattern = makeTapPattern;
    exports.makeTemporalScaleFunction = makeTemporalScaleFunction;
    exports.makeTick = makeTick;
    exports.makeTimeChannelScale = makeTimeChannelScale;
    exports.makeTimeLevelFunction = makeTimeLevelFunction;
    exports.makeTimeUnitFunction = makeTimeUnitFunction;
    exports.makeWaveFromBuffer = makeWaveFromBuffer;
    exports.mergeTapPattern = mergeTapPattern;
    exports.normalizeScaleConsistency = normalizeScaleConsistency;
    exports.normalizeSingleSpec = normalizeSingleSpec;
    exports.normalizeSpecification = normalizeSpecification;
    exports.noteFreqRange = noteFreqRange;
    exports.noteScale = noteScale;
    exports.noteScaleOrder = noteScaleOrder;
    exports.noteToFreq = noteToFreq;
    exports.notifyPause = notifyPause;
    exports.notifyResume = notifyResume;
    exports.notifyStop = notifyStop;
    exports.orderArray = orderArray;
    exports.parseDescriptionMarkup = parseDescriptionMarkup;
    exports.playAbsoluteContinuousTones = playAbsoluteContinuousTones;
    exports.playAbsoluteDiscreteTonesAlt = playAbsoluteDiscreteTonesAlt;
    exports.playAbsoluteSpeeches = playAbsoluteSpeeches;
    exports.playPause = playPause;
    exports.playRelativeDiscreteTonesAndSpeeches = playRelativeDiscreteTonesAndSpeeches;
    exports.playSingleSpeech = playSingleSpeech;
    exports.playSingleTone = playSingleTone;
    exports.playSystemSpeech = playSystemSpeech;
    exports.playTick = playTick;
    exports.postprocessRepeatStreams = postprocessRepeatStreams;
    exports.rampBy = rampBy;
    exports.readyRecording = readyRecording;
    exports.registerFilter = registerFilter;
    exports.repeatPallete = repeatPallete;
    exports.round = round;
    exports.roundToNote = roundToNote;
    exports.roundToNoteScale = roundToNoteScale;
    exports.sendQueueFinishEvent = sendQueueFinishEvent;
    exports.sendQueueStartEvent = sendQueueStartEvent;
    exports.sendSpeechFinishEvent = sendSpeechFinishEvent;
    exports.sendSpeechStartEvent = sendSpeechStartEvent;
    exports.sendToneFinishEvent = sendToneFinishEvent;
    exports.sendToneStartEvent = sendToneStartEvent;
    exports.setCurrentTime = setCurrentTime;
    exports.setErieGlobalControl = setErieGlobalControl;
    exports.setErieGlobalState = setErieGlobalState;
    exports.setPlayerEvents = setPlayerEvents;
    exports.setSampleBaseUrl = setSampleBaseUrl;
    exports.tidyUpScaleDefinitions = tidyUpScaleDefinitions;
    exports.timeUnitDomain = timeUnitDomain;
    exports.timeUnitDomainDefs = timeUnitDomainDefs;
    exports.toHashedObject = toHashedObject;
    exports.toOrdinalNumbers = toOrdinalNumbers;
    exports.transformData = transformData;
    exports.unique = unique;

    return exports;

})({}, tts, d3, aq, vega);
