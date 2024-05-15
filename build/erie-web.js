(function (exports, standardizedAudioContext, tts, d3, aq, vega) {
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

  function deepcopy$1(o) {
    return JSON.parse(JSON.stringify(o || null));
  }

  function isInstanceOf(o, c) {
    return o?.constructor == c;
  }

  function isInstanceOfByName(o, c) {
    return o?.constructor?.name === c;
  }

  function isArrayOf(o, c) {
    if (isInstanceOf(o, Array)) {
      if (isInstanceOf(c, Array)) {
        return o.every((d) => c.includes(d.constructor));
      } else {
        return o.every((d) => isInstanceOf(d, c));
      }
    } else {
      return false;
    }
  }

  class Datasets {
    constructor() {
      this.datsets = [];
    }
    add(ds) {
      if (!ds.constructor == Dataset) {
        throw new Error(`Wrong dataset object ${ds.constructor.name}}`);
      }
      this.datsets.push(ds.clone());

      return this;
    }

    get(name) {
      if (name) {
        return this.datasets?.filter(d => d.name === name)?.[0];
      } else {
        return this.datasets?.map((d) => d.get());
      }
    }

    clone() {
      return this.datasets?.map((d) => d.clone());
    }
  }

  class Dataset {
    constructor(name) {
      this.name(name);
      this.data = new Data();
      if (!name) {
        throw new Error('A Dataset must be created with a name.')
      }
    }

    name(n) {
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError('A name for a Dataset must be String.');
      }
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
      }
    }

    clone() {
      let _c = new Dataset(this._name);
      if (_c) _c.data = this.data.clone();
      return _c;
    }
  }

  const Values = 'values', Url = 'url', Name = 'name';
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
      } else if (!AllowedDataTypes.includes(type)) {
        throw new TypeError(`Unspported data type ${type}}. It must be either one of ${AllowedDataTypes.join(", ")}.`);
      } else {
        if (type === Values) {
          this.type = Values;
          this.values = e;
        } else if (type === Url) {
          this.type = Url;
          this.url = e;
        } else if (type === Name) {
          this.type = Name;
          this.name = e;
        }
      }
      return this;
    }

    get() {
      return {
        type: this.type,
        values: deepcopy$1(this.values),
        url: this.url,
        name: this.name
      }
    }

    clone() {
      let _c = new Data();
      _c.type = this.type;
      if (this.type === Values) {
        _c.values = deepcopy$1(this.values);
      } else if (this.type === Url) {
        _c.url = this.url;
      } else if (this.type === Name) {
        _c.name = this.name;
      }
      return _c;
    }
  }

  const
    COUNT = 'count',
    VALID = 'valid', DISTINCT = 'distinct',
    MEAN = 'mean', AVG = 'average', MODE = 'mode', MEDIAN = 'median',
    QUANTILE = 'quantile', STDEV = 'stdev', STDEVP = 'stdevp',
    VARIANCE = 'variance', VARIANCEP = 'variancep',
    SUM = 'sum', PRODUCT = 'product', MAX = 'max', MIN = 'min',
    CORR = 'corr', COVARIANCE = 'covariance', COVARIANCEP = 'covariancep';
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

  class Aggregate {
    constructor() {
      this.aggregate = [];
      this._groupby = [];
    }

    add(op, field, as, p) {
      if (ZeroOPs.includes(op)) {
        if (field?.constructor.name !== 'String') {
          throw new Error('"as" is not provided.')
        }
        this.aggregate.push({
          op, as: field
        });
      } else if (SingleOps.includes(op)) {
        if (field === undefined || field?.constructor.name !== 'String') {
          throw new Error('"field" is not properly provided.')
        }
        if (as === undefined || as?.constructor.name !== 'String') {
          throw new Error('"as" is not properly provided.')
        }
        if (op === QUANTILE) {
          if (p === undefined) {
            console.warn('p is not provided, so is set as 0.5.');
            p = 0.5;
          }
          this.aggregate.push({
            op, field, as, p
          });
        } else {
          this.aggregate.push({
            op, field, as
          });
        }
      } else if (DoubleOps.includes(op)) {
        if (field === undefined ||
          field?.constructor.name !== 'Array' ||
          field?.length != 2 ||
          !field.every(f => f?.constructor.name !== 'String')) {
          throw new Error('"field" is not properly provided.')
        }
        if (as === undefined || as?.constructor.name !== 'String') {
          throw new Error('"as" is not properly provided.')
        }
        this.aggregate.push({
          op, field: [...field], as
        });
      } else {
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
      } else if (args.length >= 1 &&
        args.every((a) => a.constructor.name === 'String')) {
        this._groupby = [...args];
      }

      return this;
    }

    get() {
      return {
        aggregate: deepcopy$1(this.aggregate),
        groupby: deepcopy$1(this._groupby)
      };
    }

    clone() {
      let _c = new Aggregate();
      _c.aggregate = deepcopy$1(this.aggregate);
      _c._groupby = deepcopy$1(this._groupby);
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
      if (start?.constructor.name === 'String' && end?.constructor.name === 'String') {
        this._as = start;
        this._end = end;
      } else {
        throw new TypeError("Bin 'as' (start, end) value should be Strings")
      }

      return this;
    }

    nice(v) {
      if (v?.constructor.name === 'Boolean') {
        this._nice = v;
      } else {
        throw new TypeError("Bin 'nice' value should be Boolean");
      }

      return this;
    }

    maxbins(v) {
      if (v?.constructor.name === 'Number' && Math.round(v) == v) {
        this._maxbins = v;
      } else {
        throw new TypeError("Bin 'maxbins' should be an integer.");
      }

      return this;
    }

    step(v) {
      if (v?.constructor.name === 'Number') {
        this._step = v;
      } else {
        throw new TypeError("Bin 'step' value should be a Number");
      }

      return this;
    }

    exact(v) {
      if (v?.constructor.name === 'Array' && v.every((d) => d.constructor.name === 'Number')) {
        this._exact = v;
      } else {
        throw new TypeError("Bin 'exact; value should be an array of Numbers.");
      }

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
        exact: deepcopy$1(this._exact)
      };
    }

    clone() {
      let _c = new Bin(this._bin);
      _c._as = this._as;
      _c._end = this._end;
      _c._nice = this._nice;
      _c._maxbins = this._maxbins;
      _c._step = this._step;
      _c._exact = [...this._exact];
      return _c;
    }
  }

  class Calculate {
    constructor(c, a) {
      this._calculate = '';
      this._as;
      if (c) this.calculate(c);
      if (a) this.as(a);
    }

    calculate(c) {
      if (isInstanceOf(c, String)) {
        this._calculate = c;
      } else {
        throw new TypeError("Calculate 'calculate' should be a String.");
      }

      return this;
    }

    as(c) {
      if (isInstanceOf(c, String)) {
        this._as = c;
      } else {
        throw new TypeError("Calculate 'as' should be a String.");
      }

      return this;
    }

    get() {
      return {
        calculate: this._calculate,
        as: this._as
      };
    }

    clone() {
      let _c = new Calculate();
      if (this._calculate) _c.calculate(this._calculate);
      if (this._as) _c.as(this._as);
      return _c;
    }
  }

  class Density {
    constructor(field) {
      this._density;
      this._groupby = [];
      this._cumulative = false;
      this._counts = false;
      this._bandwidth;
      this._extent;
      this._minsteps = 25;
      this._maxsteps = 200;
      this._steps;
      this._as = ['value', 'density'];
      if (field) this.field(field);
    }

    field(f) {
      if (isInstanceOf(f, String)) {
        this._density = f;
      } else {
        throw new TypeError("Density 'field' (density) value should be a String.");
      }

      return this;
    }

    extent(a) {
      if (isInstanceOf(a, Array) &&
        a.length == 2 &&
        a.every((d) => isInstanceOf(d, Number))) {
        this._extent = [...a];
      } else {
        throw new TypeError("Density 'extent' should be an Array of two Numbers.");
      }

      return this;
    }
    groupby(g) {
      if (isInstanceOf(g, Array) && g.every((d) => isInstanceOf(d, String))) {
        this._groupby = [...g];
      } else {
        throw new TypeError("Density 'groupby' should be an Array of Strings.");
      }
      return this;
    }

    cumulative(v) {
      if (isInstanceOf(v, Boolean)) {
        this._cumulative = v;
      } else {
        throw new TypeError("Density 'cumulative' must be Boolean.");
      }
      return this;
    }

    counts(v) {
      if (isInstanceOf(v, Boolean)) {
        this._counts = v;
      } else {
        throw new TypeError("Density 'counts' must be Boolean.");
      }

      return this;
    }

    bandwidth(v) {
      if (isInstanceOf(v, Number)) {
        this._bandwidth = v;
      } else {
        throw new TypeError("Density 'bandwidth' should be a Number.");
      }

      return this;
    }

    minsteps(v) {
      if (isInstanceOf(v, Number)) {
        this._minsteps = v;
      } else {
        throw new TypeError("Density 'minsteps' should be a Number.");
      }

      return this;
    }

    maxsteps(v) {
      if (isInstanceOf(v, Number)) {
        this._maxsteps = v;
      } else {
        throw new TypeError("Density 'maxsteps' should be a Number.");
      }

      return this;
    }

    steps(v) {
      if (isInstanceOf(v, Number)) {
        this._steps = v;
      } else {
        throw new TypeError("Density 'steps' should be a Number.");
      }

      return this;
    }

    as(a) {
      if (isInstanceOf(a, Array) &&
        a.length == 2 &&
        a.every((d) => isInstanceOf(d, String))) {
        this._as = [...a];
      } else {
        throw new TypeError("Density 'as' should be an Array of two Strings.");
      }

      return this;
    }

    get() {
      return {
        density: this._density,
        extent: [...this._extent],
        groupby: [...this._groupby],
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
      _c._extent = [...this._extent];
      if (this._groupby) _c._groupby = [...this._groupby];
      _c._cumulative = this._cumulative;
      _c._counts = this._counts;
      _c._bandwidth = this._bandwidth;
      _c._minsteps = this._minsteps;
      _c._maxsteps = this._maxsteps;
      _c._steps = this._steps;
      if (this._as) _c._as = [...this._as];
      return _c;
    }
  }

  class Filter {
    constructor(filter) {
      this._filter = '';
      this.filter(filter);
    }

    filter(f) {
      if (isInstanceOf(f, String)) {
        this._filter = f;
      } else {
        throw new TypeError("Filter 'filter' should be a String.");
      }

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
      this._fold = [];
      this._by;
      this._exclude = false;
      this._as = ['key', 'value'];
      if (f) this.fold(f);
      if (b) this.by(b);
    }

    fold(f) {
      if (isInstanceOf(f, Array) && f.every((d) => isInstanceOf(d, String))) {
        this._fold = [...f];
      } else {
        throw new TypeError("Fold 'fold' should be an Array of Strings.");
      }

      return this;
    }

    by(b) {
      if (isInstanceOf(b, String)) {
        this._by = b;
      } else {
        throw new TypeError("Fold 'by' should be a String.");
      }

      return this;
    }

    exclude(e) {
      if (isInstanceOf(e, Boolean)) {
        this._exclude = e;
      } else {
        throw new TypeError("Fold 'exclude' should be Boolean.");
      }

      return this;
    }

    as(a) {
      if (isInstanceOf(a, Array) &&
        a.length == 2 &&
        a.every((d) => isInstanceOf(d, String))) {
        this._as = [...a];
      } else {
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
      let _c = new Fold();
      if (this._fold) _c._fold = deepcopy$1(this._fold);
      if (this._by) _c._by = deepcopy$1(this._by);
      if (this._exclude) _c._exclude = deepcopy$1(this._exclude);
      if (this._as) _c._as = deepcopy$1(this._as);
      return _c;
    }
  }

  const SupportedTransforms = [
    Aggregate.name,
    Bin.name,
    Calculate.name,
    Density.name,
    Filter.name,
    Fold.name,
  ];

  class Transform {
    constructor() {
      this.transform = [];
    }
    add(tf) {
      if (isInstanceOf(tf, Aggregate) ||
        isInstanceOf(tf, Bin) ||
        isInstanceOf(tf, Filter) ||
        isInstanceOf(tf, Calculate) ||
        isInstanceOf(tf, Density) ||
        isInstanceOf(tf, Fold)) {
        this.transform.push(tf);
      } else {
        throw new TypeError(`A transform item must be created using a proper Erie's Transform classes: ${SupportedTransforms.join(", ")}.`);
      }

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

  const FM$1 = 'FM', AM$1 = 'AM';
  const SINE = 'sine', SQUARE = 'square', SAWTOOTH = 'sawtooth', TRIANGLE = 'triangle';

  const SynthTypes = [FM$1, AM$1];
  const OscTypes$1 = [SINE, SQUARE, SAWTOOTH, TRIANGLE];

  let SynthTone$1 = class SynthTone {
    constructor(name) {
      this._name;
      if (!name) {
        throw new Error('A sampled tone must have a name.')
      }
      this.name(name);
      this._type = 'FM';
      this._carrierType = 'sine';
      this._carrierPitch = 220;
      this._carrierDetune = 0;
      this._modulatorType = 'sine';
      this._modulatorPitch = 440;
      this._modulatorVolume = 0.2;
      this._modulation = 1;
      this._harmonicity = 1;
      this._attackTime = 0;
      this._releaseTime = 0;
    }

    name(n) {
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError('The name of a synth tone must be String.');
      }

      return this;
    }

    type(t) {
      if (SynthTypes.includes(t)) {
        this._type = t;
      } else {
        throw new TypeError(`The type of a synth tone must be either one of ${SynthTypes.join(', ')}.`);
      }

      return this;
    }

    carrierType(t) {
      if (OscTypes$1.includes(t)) {
        this._carrierType = t;
      } else {
        throw new TypeError(`The type of a synth carrier must be either one of ${OscTypes$1.join(', ')}.`);
      }

      return this;
    }

    carrierPitch(p) {
      if (isInstanceOf(p, Number)) {
        this._carrierPitch = p;
      } else {
        throw new TypeError(`The pitch of a synth carrier must be Number.`);
      }

      return this;
    }

    carrierDetune(p) {
      if (isInstanceOf(p, Number) && p >= -1200 && p <= 1200) {
        this._carrierDetune = p;
      } else {
        throw new TypeError(`The detune of a synth carrier must be Number and within [-1200, 1200].`);
      }

      return this;
    }

    modulatorType(t) {
      if (OscTypes$1.includes(t)) {
        this._modulatorType = t;
      } else {
        throw new TypeError(`The type of a synth modulator must be either one of ${OscTypes$1.join(', ')}.`);
      }

      return this;
    }

    modulatorPitch(p) {
      if (isInstanceOf(p, Number)) {
        this._modulatorPitch = p;
      } else {
        throw new TypeError(`The pitch of a synth modulator must be Number.`);
      }

      return this;
    }

    modulatorVolume(p) {
      if (isInstanceOf(p, Number) && p >= 0 && p <= 1) {
        this.modulatorVolume = p;
      } else {
        throw new TypeError(`The volume of a synth modulator must be Number and within [0, 1].`);
      }

      return this;
    }

    modulation(p) {
      if (this._type === AM$1) {
        console.warn('Moudlation index for an AM synth will be ignored.');
      }
      if (isInstanceOf(p, Number) && p > 0) {
        this._modulation = p;
      } else {
        throw new TypeError(`The moudlation index of a synth tone must be Number and greater than 0.`);
      }

      return this;
    }

    harmonicity(p) {
      if (this._type === FM$1) {
        console.warn('Harmonicity for an FM synth will be ignored.');
      }
      if (isInstanceOf(p, Number) && p > 0) {
        this._harmonicity = p;
      } else {
        throw new TypeError(`The harmonicity of a synth tone must be Number and greater than 0.`);
      }

      return this;
    }

    attackTime(p) {
      if (isInstanceOf(p, Number) && p > 0) {
        this._attackTime = p;
      } else {
        throw new TypeError(`The attack time of a synth tone must be Number and greater than -.`);
      }

      return this;
    }

    releaseTime(p) {
      if (isInstanceOf(p, Number) && p > 0) {
        this._releaseTime = p;
      } else {
        throw new TypeError(`The release time of a synth tone must be Number and greater than -.`);
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
        modulatorType: this._modulatorType,
        modulatorPitch: this._modulatorPitch,
        modulatorVolume: this._modulatorVolume,
        modulation: this._modulation,
        harmonicity: this._harmonicity,
        attackTime: this._attackTime,
        releaseTime: this._releaseTime
      }
    }

    clone() {
      let _c = new SynthTone(this._name);
      _c._type = this._type;
      _c._carrierType = this._carrierType;
      _c._carrierPitch = this._carrierPitch;
      _c._carrierDetune = this._carrierDetune;
      _c._modulatorType = this._modulatorType;
      _c._modulatorPitch = this._modulatorPitch;
      _c._modulatorVolume = this._modulatorVolume;
      _c._modulation = this._modulation;
      _c._harmonicity = this._harmonicity;
      _c._attackTime = this._attackTime;
      _c._releaseTime = this._releaseTime;

      return _c;
    }
  };

  class Synth {
    constructor() {
      this.synth = [];
    }

    add(a) {
      if (isInstanceOf(a, SynthTone$1)) {
        this.synth.push(a);
      } else {
        throw new TypeError('A synth tone must be created using SynthTone class.');
      }

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

  function scaleKeyCheck$1(key) {
    return key.match(/^[C][0-7]$/);
  }

  class SampledTone {
    constructor(name, s) {
      this._name;
      this._sample = {};
      if (!name) {
        throw new Error('A sampled tone must have a name.')
      }
      if (!s) {
        throw new Error('A sampled tone must have a sampling object.')
      }
      this.setName(name);
      this.setSample(s);
    }

    setName(n) {
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError('The name of a sampled tone must be String.');
      }

      return this;
    }

    setSample(s) {
      Object.keys(s).forEach((k) => {
        if (k === "mono") {
          this._sample.mono = s[k];
        } else if (!scaleKeyCheck$1(k)) {
          throw new TypeError('The key of a sampling object should be "C" + "0-7".');
        } else {
          this._sample[k] = s[k];
        }
      });

      return this;
    }

    get() {
      return {
        name: this._name,
        sample: deepcopy$1(this._sample || {})
      }
    }

    clone() {
      let _c = new SampledTone(this._name, deepcopy$1(this._sample || {}));

      return _c;
    }
  }

  class Sampling {
    constructor() {
      this.sampling = [];
    }

    add(a) {
      if (isInstanceOf(a, SampledTone)) {
        this.sampling.push(a);
      } else {
        throw new TypeError('A sampled tone must be created using SampledTone class.');
      }

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

  class WaveTone {
    constructor(name, defs) {
      this._name;
      if (!name) {
        throw new Error('A sampled tone must have a name.')
      }
      this.setName(name);
      this._disableNormalization = false;
      this._real = [];
      this._imag = [];
      if (defs) {
        this.wave(defs);
      }
    }

    setName(n) {
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError('The name of a synth tone must be String.');
      }

      return this;
    }

    real(r) {
      if (isArrayOf(r, Number)) {
        this._real = r;
      } else {
        throw new TypeError('The "real" property (sine terms) of a periodic wave must be an Array of Numbers.');
      }

      return this;
    }

    imag(a) {
      if (isArrayOf(a, Number)) {
        this._imag = a;
      } else {
        throw new TypeError('The "imag" property (cosine terms) of a periodic wave must be an Array of Numbers.');
      }

      return this;
    }

    wave(w) {
      if (isInstanceOf(w, Object) && w.real && w.imag) {
        this.real(w.real);
        this.imag(w.imag);
      } else {
        throw new TypeError('The definition a periodic wave must consist of "real" (sine terms) and "imag" (cosine terms) properties.');
      }

      return this;
    }

    disableNormalization(v) {
      if (isInstanceOf(v, Boolean)) {
        this._disableNormalization = v;
      } else {
        throw new TypeError(`The 'disableNormalization' value should be a Boolean.`);
      }

      return this;
    }

    get() {
      return {
        name: this._name,
        real: [...this._real],
        imag: [...this._imag],
        disableNormalization: this._disableNormalization
      }
    }

    clone() {
      let _c = new SynthTone(this._name);
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
      if (isInstanceOf(a, WaveTone)) {
        this.wave.push(a);
      } else {
        throw new TypeError('A wave tone must be created using WaveTone class.');
      }

      return this;
    }

    get() {
      return this.wave.map((d) => d.get());
    }

    clone() {
      let _c = new Wave();
      _c.wave = this.wave.map((d) => d.clone());
      return _c
    }
  }

  let Tone$1 = class Tone {
    constructor(type, c) {
      this._type = 'default';
      this._continued = false;
      if (type) this.set(type);
      else this.set("default");
      if (c !== undefined) this.continued(c);
      this._filter = [];
    }

    set(t) {
      if (isInstanceOf(t, SampledTone)) {
        this._type = t._name;
      } else if (isInstanceOf(t, SynthTone$1)) {
        this._type = t._name;
      } else if (isInstanceOf(t, WaveTone)) {
        this._type = t._name;
      } else if (isInstanceOf(t, String)) {
        this.type(t);
      }
    }

    type(t) {
      if (isInstanceOf(t, String)) {
        this._type = t;
      } else {
        throw new TypeError("Tone type should be a String.");
      }

      return this;
    }

    continued(c) {
      if (isInstanceOf(c, Boolean)) {
        this._continued = c;
      } else {
        throw new TypeError("Tone 'continued' should be Boolean.");
      }

      return this;
    }

    addFilter(t) {
      if (isInstanceOf(t, String)) {
        this._filter.push(t);
      } else if (isArrayOf(t, String)) {
        this._filter.push(...t);
      } else {
        throw new TypeError("Tone filter should be a String or String Array.");
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
  };

  class Tick {
    constructor(name) {
      if (name) this.setName(name);
      else {
        throw new Error('A tick definition must have a name.')
      }
      this._interval = 0.5;
      this._playAtTime0 = true;
      this._oscType = 'sine';
      this._pitch = 150;
      this._loudness = 0.4;
    }

    setName(n) {
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError('The name of a synth tone must be String.');
      }

      return this;
    }

    interval(t) {
      if (isInstanceOf(n, Number) && n > 0) {
        this._interval = t;
      } else {
        throw new TypeError('A tick interval must be a Number and greater than 0.');
      }

      return this;
    }


    playAtTime0(t) {
      if (isInstanceOf(n, Boolean)) {
        this._playAtTime0 = t;
      } else {
        throw new TypeError('A tick "playAtTime0" must be Boolean.');
      }

      return this;
    }

    oscType(t) {
      if (OscTypes$1.includes(t)) {
        this._oscType = t;
      } else {
        throw new TypeError(`A tick oscillator type must be either one of ${OscTypes$1.join(', ')}.`);
      }

      return this;
    }

    pitch(t) {
      if (isInstanceOf(n, Number) && n > 0) {
        this._pitch = t;
      } else {
        throw new TypeError('A tick pitch must be a Number and greater than 0.');
      }

      return this;
    }

    loudness(t) {
      if (isInstanceOf(n, Number) && n >= 0 && n <= 1) {
        this._loudness = t;
      } else {
        throw new TypeError('A tick loudness must be a Number and between 0 and 1.');
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
      }
    }

    clone() {
      let _c = new Tick(this._name);
      _c.interval(this._interval);
      _c.pitch(this._playAtTime0);
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
      if (isInstanceOf(a, Tick)) {
        this.tick.push(a);
      } else {
        throw new TypeError('A tick definition must be created using Tick class.');
      }

      return this;
    }

    get() {
      return this.tick.map((d) => d.get());
    }

    clone() {
      let _c = new Tick();
      _c.tick = this.tick.map((d) => d.clone());

      return _c;
    }
  }

  const TIME_chn$1 = "time",
    TIME2_chn$1 = "time2",
    DUR_chn$1 = "duration",
    TAPCNT_chn$1 = "tapCount",
    TAPSPD_chn$1 = "tapSpeed",
    POST_REVERB_chn$1 = "postReverb",
    PITCH_chn$1 = "pitch",
    LOUDNESS_chn$1 = "loudness",
    PAN_chn$1 = "pan",
    SPEECH_BEFORE_chn$1 = "speechBefore",
    SPEECH_AFTER_chn$1 = "speechAfter",
    TIMBRE_chn$1 = "timbre",
    MODULATION_chn$1 = "modulation",
    HARMONICITY_chn$1 = "harmonicity",
    DETUNE_chn$1 = "detune",
    REPEAT_chn$1 = "repeat";

  const QUANT$1 = 'quantitative', ORD$1 = 'ordinal', NOM$1 = 'nominal', TMP$1 = 'temporal', STATIC$1 = 'static';
  const SupportedEncodingTypes = [QUANT$1, ORD$1, NOM$1, TMP$1, STATIC$1];
  const POS$2 = 'positive', NEG$1 = 'negative';
  const SupportedPolarity = [POS$2, NEG$1];
  const RampMethods$1 = [true, false, 'abrupt', 'linear', 'exponential'];
  const SingleTapPosOptions = ['start', 'middle', 'end'];

  const REL = 'relative', ABS = 'absolute', SIM = 'simultaneous';
  const TIMINGS = [REL, ABS, SIM];
  const FormatTypes = ['number', 'datetime'];

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
        isInstanceOfByName(c, `Channel`)
      ) {
        let g = c.get();
        Object.assign(this, g);
      }
    }

    field(f, t) {
      if (f === undefined) {
        this._field = undefined;
      } else if (isInstanceOf(f, String)) {
        this._field = f;
      } else if (this._channel === REPEAT_chn$1 && isArrayOf(f, String)) {
        this._field = f;
      } else {
        throw new TypeError('A field for an encoding channel must be a String.');
      }
      if (t) this.type(t);
      this.defined = true;
      return this;
    }

    type(t) {
      if (isInstanceOf(t, String) && SupportedEncodingTypes.includes(t)) {
        this._type = t;
      } else {
        throw new TypeError(`A type for an encoding channel must be a String and either one of ${SupportedEncodingTypes.join(', ')}.`);
      }

      return this;
    }

    ramp(r) {
      if (RampMethods$1.includes(r)) {
        if (isInstanceOf(r, String)) {
          this._ramp = r;
        } else {
          this._ramp = r ? 'linear' : 'abrupt';
        }
      } else {
        throw new TypeError(`A ramping method for an encoding channel must be either one of ${RampMethods$1.join(', ')}.`);
      }
    }

    aggregate(op) {
      if (ZeroOPs.includes(op)) {
        if (this._field) {
          console.warn('A count aggregate will drop the existing field.');
        }
        this._aggregate = op;
        this._type = QUANT$1;
        this.defined = true;
      } else if (SingleOps.includes(op)) {
        this._aggregate = op;
        this._type = QUANT$1;
        this.defined = true;
      } else if (DoubleOps.includes(op)) {
        throw new TypeError('An aggregate operation for two fields cannot be declared here.');
      } else {
        throw new TypeError(`The provided operation ${op} is not supported.`);
      }

      return this;
    }

    bin(...args) {
      // polymorph
      let is_bin, nice, maxbins, step;
      if (args.length == 1) {
        if (isInstanceOf(args[0], Boolean)) {
          is_bin = args[0];
        } else if (isArrayOf(args[0], Number)) {
          is_bin = true;
          args[0];
        }
      } else if (args.length >= 2 && args.length <= 3) {
        is_bin = true;
        [maxbins, nice, step] = args;
      } else {
        throw new TypeError(`Wrong argumetn is provided for a channel's bin.`);
      }

      this._bin = is_bin;
      if (maxbins || nice || step) {
        this._bin = {
          maxbins, nice, step
        };
      }
      this.defined = true;

      return this;
    }

    scale(p, v) {
      if (p === 'domain' && isInstanceOf(v, Array)) {
        this._scale.domain = [...v];
      } else if (p === 'range' && isInstanceOf(v, Object) && v.field) {
        this._scale.range = deepcopy$1(v);
      } else if (p === 'range' && isInstanceOf(v, Array)) {
        if (v.every(this.validator)) {
          this._scale.range = [...v];
          if (this._scale.times !== undefined ||
            this._scale.maxDistinct !== undefined) {
            console.warn('Existing scale settings will be ignored.');
            this._scale.times = undefined;
            this._scale.maxDistinct = undefined;
          }
        } else {
          throw new TypeError('Unsupported value type');
        }
      } else if (p === 'order' && isInstanceOf(v, Array)) {
        this._scale.order = v;
      } else if (p === 'polarity' && SupportedPolarity.includes(v)) {
        this._scale.polarity = v;
      } else if (p === 'maxDistinct' && isInstanceOf(v, Boolean)) {
        this._scale.maxDistinct = v;
        if (this._scale.range !== undefined ||
          this._scale.times !== undefined) {
          console.warn('Existing scale settings will be ignored.');
          this._scale.range = undefined;
          this._scale.times = undefined;
        }
      } else if (p === 'times' && isInstanceOf(v, Number)) {
        this._scale.times = v;
        if (this._scale.range !== undefined ||
          this._scale.maxDistinct !== undefined) {
          console.warn('Existing scale settings will be ignored.');
          this._scale.range = undefined;
          this._scale.maxDistinct = undefined;
        }
      } else if (p === 'zero' && isInstanceOf(v, Boolean)) {
        this._scale.zero = v;
      } else if (p === 'description' && (isInstanceOf(v, String) || v == null)) {
        this._scale.description = v;
      } else if (p === 'title' && (isInstanceOf(v, String) || v == null)) {
        this._scale.title = v;
      } else if (this._channel === TIME_chn$1 && p === 'length' && isInstanceOf(v, Number)) {
        this._scale.length = v;
      } else if ([TIME_chn$1, TAPCNT_chn$1, TAPSPD_chn$1].includes(this._channel) && p === 'band' && isInstanceOf(v, Number)) {
        this._scale.band = v;
      } else if (this._channel === TIME_chn$1 && p === 'timing' && TIMINGS.includes(v)) {
        this._scale.timing = v;
      } else if (this._channel === TAPSPD_chn$1 && p === 'singleTappingPosition' && SingleTapPosOptions.includes(v)) {
        this._scale.timing = v;
      } else {
        throw new Error('The provide key and value is not a supported scale option.')
      }
      this.defined = true;

      return this;
    }

    addCondition(c, o) {
      if (isInstanceOf(c, String) && o !== undefined) {
        if (!this._condition) this._condition = [];
        this._condition.push({
          test: c,
          value: o
        });
        if (this._type !== STATIC$1) {
          console.warn('The type of this channel is changed to static, and the scales will be droped.');
          this._type = STATIC$1;
          this._scale = {};
        }
      } else {
        throw new Error('The provide condition and value is not a supported condition.')
      }
      this.defined = true;

      return this;
    }

    addConditions(c) {
      for (const cond of c) {
        if (cond.test && cond.value) this.addCondition(cond.test, cond.value);
      }
      this.defined = true;

      return this;
    }

    getConditions() {
      return this._condition ? deepcopy$1(this._condition) : this._condition;
    }

    removeCondition(i) {
      if (isInstanceOf(this._condition, Array)) {
        this._condition.splice(i, 1);
      }
    }

    resetCondition() {
      return this._condition = undefined;
    }

    value(v) {
      if (this.validator(v)) {
        this._value = v;
        if (this._type !== STATIC$1) {
          console.warn('The type of this channel is changed to static, and the scales will be droped.');
          this._type = STATIC$1;
          this._scale = {};
          this._field = undefined;
          this._aggregate = undefined;
          this._bin = undefined;
        }
      } else {
        throw new TypeError('Unsupported value type');
      }
      this.defined = true;

      return this;
    }

    speech(v) {
      if (this._channel === REPEAT_chn$1) {
        if (isInstanceOf(v, Boolean)) {
          this._speech = v;
        } else {
          throw new TypeError('The "speech" option for a channel must be Boolean.')
        }
      } else {
        throw new Error('Speech option is only for a repeat channel.')
      }
      this.defined = true;

      return this;
    }

    tick(k, v) {
      if (this._channel === TIME_chn$1) {
        if (isInstanceOf(k, String)) {
          if (!this._tick) this._tick = {};
          if (k === 'name' && isInstanceOf(v, String)) {
            this._tick.name = v;
          } else if (k === 'interval' && isInstanceOf(v, Number)) {
            this._tick.interval = v;
          } else if (k === 'playAtTime0' && isInstanceOf(v, Boolean)) {
            this._tick.playAtTime0 = v;
          } else if (k === 'oscType' && OscTypes$1.includes(v)) {
            this._tick.playAtTime0 = v;
          } else if (k === 'pitch' && isInstanceOf(v, Number)) {
            this._tick.pitch = v;
          } else if (k === 'loudness' && isInstanceOf(v, Number) && 0 <= v && v <= 1) {
            this._tick.loudness = v;
          }
        } else if (isInstanceOf(k, Tick)) {
          this._tick = { name: k._name };
        } else {
          throw new TypeError('The "speech" option for a channel must be Boolean.')
        }
      } else {
        throw new Error('Speech option is only for a time channel.')
      }
      this.defined = true;

      return this;
    }

    format(f, t) {
      if (f && t && isInstanceOf(f, String) && FormatTypes.includes(t)) {
        this._format = f;
        this._formatType = t;
      } else if (f && isInstanceOf(f, String)) {
        this._format = f;
      } else {
        throw new TypeError(`The "format" should be a String and "formatType" should be either ${FormatTypes.join(", ")}.`)
      }
    }

    formatType(t) {
      if (FormatTypes.includes(t)) {
        this._formatType = t;
      } else {
        throw new TypeError(`The "formatType" should be either ${FormatTypes.join(", ")}.`)
      }
    }

    get() {
      let o = {
        type: this._type,
        field: this._field,
        channel: this._channel,
        aggregate: this._aggregate,
        bin: this._bin ? deepcopy$1(this._bin) : this._bin,
        scale: this._scale ? deepcopy$1(this._scale) : this._scale,
        value: this._value,
        condition: this._condition ? deepcopy$1(this._condition) : this._condition,
        ramp: this._ramp,
        defined: this.defined
      };
      if (this._channel === TIME_chn$1) {
        o.tick = this._tick ? deepcopy$1(this._tick) : this._tick;
      }
      if (this._channel === REPEAT_chn$1) {
        o.tick = this._speech;
      }

      return o;
    }

    validator(v) {
      return true;
    }

    clone() {
      let _c = new this.constructor();
      let _g = this.get();
      Object.keys(_g).forEach(k => {
        if (k !== 'defined') {
          _c['_' + k] = _g[k];
        } else {
          _c.defined = _g[k];
        }
      });

      return _c;
    }
  }

  class Config {
    constructor() {
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
      } else {
        throw TypeError(`Wrong value type for ${k}.`);
      }

      return this;
    }

    get() {
      return deepcopy$1(this._config);
    }

    clone() {
      let _c = new Config();
      let g = this.get();
      Object.keys(g).forEach((k) => {
        _c.set(k, g[k]);
      });
    }
  }

  function configValidator(k, v) {
    if (k === 'speechRate') return isInstanceOf(v, Number) && v > 0;
    else if (k === 'skipScaleSpeech') return isInstanceOf(v, Boolean);
    else if (k === 'skipDescription') return isInstanceOf(v, Boolean);
    else if (k === 'skipTitle') return isInstanceOf(v, Boolean);
    else if (k === 'overlayScaleConsistency') return isInstanceOf(v, Boolean);
    else if (k === 'forceOverlayScaleConsistency') return isInstanceOf(v, Boolean);
    else if (k === 'sequenceScaleConsistency') return isInstanceOf(v, Boolean);
    else if (k === 'forceSequenceScaleConsistency') return isInstanceOf(v, Boolean)
    else return true;
  }

  class TimeChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = TIME_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= 0;
    }
  }

  class Time2Channel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = TIME2_chn$1;
    }
  }

  class DurationChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = DUR_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= 0;
    }
  }

  const MAX_LIMIT_TAP_SPEED$1 = 7;
  class TapSpeedChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = TAPSPD_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_TAP_SPEED$1;
    }
  }

  class TapCountChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = TAPCNT_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= 0;
    }
  }

  const MAX_LIMIT_PITCH$1 = 3000;
  class PitchChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = PITCH_chn$1;
      this.roundToNote = false;
    }

    roundToNote(v) {
      if (isInstanceOf(v, Boolean)) {
        this.roundToNote = v;
      } else {
        throw new TypeError('Round-to-note for a pitch channel must be Boolean');
      }
      return this;
    }

    validator(v) {
      return (isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_PITCH$1) || (isInstanceOf(v, String) && v.match(/^[A-F][0-9]$/gi));
    }
  }

  class DetuneChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = DETUNE_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= -1200 && v <= 1200;
    }
  }

  class LoudnessChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = LOUDNESS_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number);
    }
  }

  class PanChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = PAN_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= -1 && v <= 1;
    }
  }

  class PostReverbChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = POST_REVERB_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v >= 0;
    }
  }

  class SpeechBeforeChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = SPEECH_BEFORE_chn$1;
    }
  }

  class SpeechAfterChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = SPEECH_AFTER_chn$1;
    }
  }

  class RepeatChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = REPEAT_chn$1;
    }
  }

  class ModulationChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = MODULATION_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v > 0;
    }
  }

  class HarmonicityChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = HARMONICITY_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, Number) && v > 0
    }
  }

  class TimbreChannel extends Channel {
    constructor(f, t) {
      super(f, t);
      this._channel = TIMBRE_chn$1;
    }

    validator(v) {
      return isInstanceOf(v, String);
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
      this.tone = new Tone$1();
      this.tick = new TickList();
      this.encoding = {
        [TIME_chn$1]: new TimeChannel(),
        [TIME2_chn$1]: new Time2Channel(),
        [DUR_chn$1]: new DurationChannel(),
        [TAPCNT_chn$1]: new TapCountChannel(),
        [TAPSPD_chn$1]: new TapSpeedChannel(),
        [POST_REVERB_chn$1]: new PostReverbChannel(),
        [PITCH_chn$1]: new PitchChannel(),
        [DETUNE_chn$1]: new DetuneChannel(),
        [LOUDNESS_chn$1]: new LoudnessChannel(),
        [PAN_chn$1]: new PanChannel(),
        [SPEECH_BEFORE_chn$1]: new SpeechBeforeChannel(),
        [SPEECH_AFTER_chn$1]: new SpeechAfterChannel(),
        [TIMBRE_chn$1]: new TimbreChannel(),
        [REPEAT_chn$1]: new RepeatChannel(),
        [MODULATION_chn$1]: new ModulationChannel(),
        [HARMONICITY_chn$1]: new HarmonicityChannel()
      };
      this.config = new Config();
    }

    name(n) {
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError("An stream name must be a String.");
      }

      return this;
    }

    title(n) {
      if (isInstanceOf(n, String)) {
        this._title = n;
      } else {
        throw new TypeError("An stream title must be a String.");
      }

      return this;
    }

    description(n) {
      if (isInstanceOf(n, String)) {
        this._description = n;
      } else {
        throw new TypeError("An stream description must be a String.");
      }

      return this;
    }

    get() {
      let g = {
        name: this._name,
        title: this._title,
        description: this._description,
        data: this.data?.get(),
        datasets: this.datasets?.get(),
        transform: this.transform.get(),
        tick: this.tick?.get(),
        synth: this.synth?.get(),
        sampling: this.sampling?.get(),
        wave: this.wave?.get(),
        tone: this.tone?.get(),
        encoding: {},
        config: this.config?.get()
      };
      Object.keys(this.encoding).forEach((chn) => {
        if (this.encoding[chn].defined) {
          g.encoding[chn] = this.encoding[chn].get();
        }
      });

      return g;
    }

    clone() {
      let _c = new Stream();
      _c._name = this._name;
      _c._title = this._title;
      _c._description = this._description;
      _c.data = this.data.clone();
      _c.datasets = this.datasets.clone();
      _c.transform = this.transform.clone();
      _c.synth = this.synth.clone();
      _c.sampling = this.sampling.clone();
      _c.wave = this.wave.clone();
      _c.tone = this.tone.clone();
      _c.encoding = {};
      Object.keys(this.encoding).forEach((chn) => {
        if (this.encoding[chn].defined) {
          _c.encoding[chn] = this.encoding[chn].clone();
        }
      });
      _c.config = this.config.clone();

      return _c;
    }
  }

  class Overlay {
    constructor(...a) {
      let args = [...a];
      if (isInstanceOf(args[0], String)) {
        this.name(args[0]);
        args.splice(0, 1);
      }
      this.overlay = [];
      if (isArrayOf(args[0], Stream)) {
        this.addStreams(args[0]);
      } else if (isArrayOf(args, Stream)) {
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
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError("An overlay name must be a String.");
      }

      return this;
    }

    title(n) {
      if (isInstanceOf(n, String)) {
        this._title = n;
      } else {
        throw new TypeError("An overlay title must be a String.");
      }

      return this;
    }

    description(n) {
      if (isInstanceOf(n, String)) {
        this._description = n;
      } else {
        throw new TypeError("An overlay description must be a String.");
      }

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
      if (isInstanceOf(s, Stream)) {
        let clone = s.clone();
        // datasets
        let cloned_datasets = clone.datasets;
        if (cloned_datasets && cloned_datasets.length > 0) {
          for (const ds of cloned_datasets) {
            this.datasets.add(ds);
          }
        }
        clone.datasets = null;
        // tick
        let cloned_ticks = clone.tick;
        if (cloned_ticks && cloned_ticks.length > 0) {
          for (const ds of cloned_ticks) {
            this.tick.add(ds);
          }
        }
        clone.tick = null;
        // sampling
        let cloned_samples = clone.sampling;
        if (cloned_samples && cloned_samples.length > 0) {
          for (const ds of cloned_samples) {
            this.sampling.add(ds);
          }
        }
        clone.sampling = null;
        // synth
        let cloned_synths = clone.synth;
        if (cloned_synths && cloned_synths.length > 0) {
          for (const ds of cloned_synths) {
            this.synth.add(ds);
          }
        }
        clone.synth = null;
        // wave
        let cloned_waves = clone.wave;
        if (cloned_waves && cloned_waves.length > 0) {
          for (const ds of cloned_waves) {
            this.wave.add(ds);
          }
        }
        clone.wave = null;
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
      let g = {
        name: this._name,
        title: this._title,
        description: this._description,
        data: this.data.get(),
        datasets: this.datasets.get(),
        transform: this.transform.get(),
        tick: this.tick.get(),
        synth: this.synth.get(),
        sampling: this.sampling.get(),
        wave: this.wave.get(),
        overlay: this.overlay.map((d) => d.get()),
        config: this.config.get()
      };

      return g;
    }

    clone() {
      let _c = new Sequence();
      _c._name = this._name;
      _c._title = this._title;
      _c._description = this._description;
      _c.data = this.data.clone();
      _c.datasets = this.datasets.clone();
      _c.transform = this.transform.clone();
      _c.synth = this.synth.clone();
      _c.sampling = this.sampling.clone();
      _c.wave = this.wave.clone();
      _c.overlay = this.overlay.map((d) => d.clone());
      _c.config = this.config.clone();
    }
  }

  let Sequence$1 = class Sequence {
    constructor(...a) {
      let args = [...a];
      if (isInstanceOf(args[0], String)) {
        this.setName(args[0]);
        args.splice(0, 1);
      }
      this.sequence = [];
      if (isArrayOf(args[0], [Stream, Overlay])) {
        this.addStreams(args[0]);
      } else if (isArrayOf(args, [Stream, Overlay])) {
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
      if (isInstanceOf(n, String)) {
        this._name = n;
      } else {
        throw new TypeError("A stream name must be a String.");
      }

      return this;
    }

    title(n) {
      if (isInstanceOf(n, String)) {
        this._title = n;
      } else {
        throw new TypeError("A stream title must be a String.");
      }

      return this;
    }

    description(n) {
      if (isInstanceOf(n, String)) {
        this._description = n;
      } else {
        throw new TypeError("A stream description must be a String.");
      }

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
      if (isInstanceOf(s, Stream) || isInstanceOf(s, Overlay)) {
        let clone = s.clone();
        // datasets
        let cloned_datasets = clone.datasets;
        if (cloned_datasets && cloned_datasets.length > 0) {
          for (const ds of cloned_datasets) {
            this.datasets.add(ds);
          }
        }
        clone.datasets = null;
        // tick
        let cloned_ticks = clone.tick;
        if (cloned_ticks && cloned_ticks.length > 0) {
          for (const ds of cloned_ticks) {
            this.tick.add(ds);
          }
        }
        clone.tick = null;
        // sampling
        let cloned_samples = clone.sampling;
        if (cloned_samples && cloned_samples.length > 0) {
          for (const ds of cloned_samples) {
            this.sampling.add(ds);
          }
        }
        clone.sampling = null;
        // synth
        let cloned_synths = clone.synth;
        if (cloned_synths && cloned_synths.length > 0) {
          for (const ds of cloned_synths) {
            this.synth.add(ds);
          }
        }
        clone.synth = null;
        // wave
        let cloned_waves = clone.wave;
        if (cloned_waves && cloned_waves.length > 0) {
          for (const ds of cloned_waves) {
            this.wave.add(ds);
          }
        }
        clone.wave = null;
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
      let g = {
        name: this._name,
        title: this._title,
        description: this._description,
        data: this.data.get(),
        datasets: this.datasets.get(),
        transform: this.transform.get(),
        tick: this.tick.get(),
        synth: this.synth.get(),
        sampling: this.sampling.get(),
        wave: this.wave.get(),
        sequence: this.sequence.map((d) => d.get()),
        config: this.config.get()
      };

      return g;
    }

    clone() {
      let _c = new Sequence();
      _c._name = this._name;
      _c._title = this._title;
      _c._description = this._description;
      _c.data = this.data.clone();
      _c.datasets = this.datasets.clone();
      _c.transform = this.transform.clone();
      _c.synth = this.synth.clone();
      _c.sampling = this.sampling.clone();
      _c.wave = this.wave.clone();
      _c.sequence = this.sequence.map((d) => d.clone());
      _c.config = this.config.clone();
    }
  };

  let ErieFilters = {};
  function registerFilter(name, filter, encoder, finisher) {
    ErieFilters[name] = { filter, encoder, finisher };
  }

  async function playSystemSpeech(sound, config) {
    return new Promise((resolve, reject) => {
      var synth = window.speechSynthesis;
      var utterance = new SpeechSynthesisUtterance(sound.speech);
      if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
      else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
      synth.speak(utterance);
      utterance.onend = () => {
        resolve();
      };
    });
  }
  async function notifyStop(config) {
    await playSystemSpeech({ speech: "Stopped.", speechRate: config?.speechRate });
    return;
  }

  async function notifyPause(config) {
    await playSystemSpeech({ speech: "Paused.", speechRate: config?.speechRate });
    return;
  }

  async function notifyResume(config) {
    await playSystemSpeech({ speech: "Resumeing", speechRate: config?.speechRate });
    return;
  }

  const SupportedInstruments = ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"];
  const MultiNoteInstruments = ["piano", "pianoElec", "violin", "metal", "guitar"];
  const SingleNoteInstruments = ["hithat", "snare", "highKick", "lowKick", "clap"];
  // below is for detuning
  const noteFreqRange = [
    {
      octave: 0,
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

  function roundToNote(freq, scales) {
    let min_diff = 5000,
      min_diff_note;
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
    let octave;
    for (const range of noteFreqRange) {
      if (range.octave == 0 && range.c <= freq && freq < range.fs) {
        octave = range;
      } else if (range.octave == 7 && range.gf <= freq && freq <= range.fs) {
        octave = range;
      } else if (range.gf <= freq && freq < range.fs) {
        octave = range;
      }
    }
    if (octave !== undefined) {
      return roundToNote(freq, octave).note_freq;
    } else {
      console.warn(
        'Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.'
      );
      return null;
    }
  }

  function determineNoteRange(freq, config) {
    let octave;
    for (const range of noteFreqRange) {
      if (range.octave == 0 && range.c <= freq && freq < range.fs) {
        octave = range;
      } else if (range.octave == 7 && range.gf <= freq && freq <= range.fs) {
        octave = range;
      } else if (range.gf <= freq && freq < range.fs) {
        octave = range;
      }
    }
    if (octave !== undefined) {
      let rounded_note = roundToNote(freq, octave);
      if (config?.round) {
        return {
          octave: octave.octave,
          original_freq: freq,
          freq: rounded_note.note_freq,
          note: rounded_note.note_name,
          detune: rounded_note.detune
        };
      } else {
        let detune_base = rounded_note.detune;
        let note_diff = rounded_note.note_freq - freq;
        let detune = 0;
        if (note_diff < 0) {
          let note_left = octave[rounded_note.prev_note];
          if (!rounded_note.prev_note) {
            note_left = noteFreqRange[octave.octave - 1]?.f;
          }
          detune =
            Math.round(-100 * Math.abs(note_diff / (note_left - rounded_note.note_freq))) +
            detune_base;
          if (!note_left) {
            detune = detune_base;
          }
        } else if (note_diff > 0) {
          let note_right = octave[rounded_note.next_note];
          if (!rounded_note.next_note) {
            note_right = noteFreqRange[octave.octave + 1]?.g;
          }
          detune =
            Math.round(100 * Math.abs(note_diff / (note_right - rounded_note.note_freq))) +
            detune_base;
          if (!note_right) {
            detune = detune_base;
          }
        } else {
          detune = detune_base;
        }
        return { octave: octave.octave, freq, detune };
      }
    } else {
      console.warn(
        'Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.'
      );
      return null;
    }
  }

  async function loadSamples(ctx, instrument_name, smaplingDef, baseUrl) {
    let samples = {};
    if (MultiNoteInstruments.includes(instrument_name)) {
      for (const octave of noteFreqRange) {
        let sampleRes = await fetch(`${baseUrl || ''}audio_sample/${instrument_name}_c${octave.octave}.mp3`);
        let sampleBuffer = await sampleRes.arrayBuffer();
        let source = await ctx.decodeAudioData(sampleBuffer);
        samples[`C${octave.octave}`] = source;
      }
      samples.multiNote = true;
    } else if (SingleNoteInstruments.includes(instrument_name)) {
      samples = await makeSingleScaleSamplingNode(ctx, `${baseUrl || ''}audio_sample/${instrument_name}.mp3`);
      samples.multiNote = false;
    } else if (smaplingDef[instrument_name]) {
      if (smaplingDef[instrument_name].sample?.mono) {
        // single
        try {
          samples = await makeSingleScaleSamplingNode(ctx, smaplingDef[instrument_name].sample.mono);
          samples.multiNote = false;
        } catch (e) {
          console.error(e);
        }
      } else {
        // multi
        try {
          samples = await makeMultiScaleSamplingNode(ctx, smaplingDef[instrument_name].sample);
          samples.multiNote = true;
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      console.warn(`The instrument "${instrument_name}" is not supported or sampled.`);
    }
    return samples;
  }

  async function makeMultiScaleSamplingNode(ctx, def) {
    let samples = {}, keys = Object.keys(def);
    if (!keys.every(scaleKeyCheck)) {
      console.error("A sampling note must be 'C' in octave 0 to 7");
    }
    for (const key of keys) {
      let sampleRes = await fetch(def[key]);
      let sampleBuffer = await sampleRes.arrayBuffer();
      let source = await ctx.decodeAudioData(sampleBuffer);
      samples[key] = source;
    }
    return samples;
  }

  async function makeSingleScaleSamplingNode(ctx, def) {
    let samples = {};
    let sampleRes = await fetch(def);
    let sampleBuffer = await sampleRes.arrayBuffer();
    let source = await ctx.decodeAudioData(sampleBuffer);
    samples.mono = source;
    return samples;
  }

  function scaleKeyCheck(key) {
    return key.match(/^[C][0-7]$/);
  }

  function unique(arr) {
    return Array.from(new Set(arr));
  }

  function deepcopy(i) {
    return JSON.parse(JSON.stringify(i));
  }

  function firstDefined(...vs) {
    for (let v of vs) {
      if (v !== undefined) return v;
    }
    return vs[vs.length - 1];
  }

  function aRange(s, e, incl) {
    let o = [];
    if (incl) e = e + 1;
    for (let i = s; i < e; i++) {
      o.push(i);
    }
    return o;
  }

  function round(n, d) {
    let e = Math.pow(10, -d);
    return Math.round(n * e) / e;
  }


  const RidLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  const NRidLetters = RidLetters.length - 1;
  function genRid(n) {
    if (!n) n = 6;
    let rid = [];
    for (let i = 0; i < n; i++) {
      let k = Math.round(Math.random() * NRidLetters);
      rid.push(RidLetters[k]);
    }
    return rid.join('');
  }

  function getFirstDefined(...args) {
    for (const arg of args) {
      if (arg !== undefined) return arg;
    }
    return args[args.length - 1];
  }

  function asc(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    else if (a?.constructor.name === Date.name && b?.constructor.name === Date.name) return a - b;
    else if (a?.localeCompare) return a.localeCompare(b);
    else return a > b || 0;
  }
  function desc(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return b - a;
    else if (a?.constructor.name === Date.name && b?.constructor.name === Date.name) return b - a;
    else if (b?.localeCompare) return b.localeCompare(a);
    else return b > a || 0;
  }

  const Def_Tick_Interval = 0.5, Def_Tick_Interval_Beat = 2, Def_Tick_Duration = 0.1, Def_Tick_Duration_Beat = 0.5, Def_Tick_Loudness = 0.4;
  function makeTick(ctx, def, duration, bufferPrimitve) {
    // ticker definition;
    if (!def) return;
    else if (duration) {
      let tickPattern = [];
      let interval = round(def.interval, -2);
      let tickDur = def.band;
      tickDur = round(tickDur, -2);
      let pause = interval - tickDur;
      let count = Math.floor(duration / interval);
      let totalTime = 0;
      if (def.playAtTime0 === undefined) def.playAtTime0 = true;
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
      tickInst.frequency.value = 150;
      if (def.pitch) tickInst.frequency.value = def.pitch;
      if (def.oscType) tickInst.type = def.oscType;
      let gain = ctx.createGain();
      tickInst.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      let acc = 0;
      for (const p of tickPattern) {
        if (p.tick) {
          gain.gain.setTargetAtTime(def.loudness || Def_Tick_Loudness, ctx.currentTime + acc, 0.015);
          acc += p.tick;
        } else if (p.pause) {
          gain.gain.setTargetAtTime(0, ctx.currentTime + acc, 0.015);
          acc += p.pause;
        }
      }
      return tickInst;
    }
  }


  async function playTick(_ctx, def, duration, start, end, bufferPrimitve) {
    let ctx = _ctx;
    if (bufferPrimitve) ctx = makeOfflineContext(duration);
    let tick = makeTick(ctx, def, duration);
    tick.start(start);
    tick.stop(end);
    if (bufferPrimitve) {
      let rb = await ctx.startRendering();
      bufferPrimitve.add(start, rb);
    }
    return;
  }

  const FM = 'FM', AM = 'AM', DefCarrierPitch = 220, DefModPitch = 440, DefaultModGainAM = 0.5, DefaultModGainFM = 10;

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
      } else if (this.type === AM) {
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
      } else if (definition.modulation !== undefined) {
        this.modulation = definition.modulation;
        this.modulatorPitch = this.modulatorVolume / this.modulation;
      } else if (definition.harmonicity !== undefined) {
        this.modulatorPitch = definition.harmonicity * this.carrierPitch;
      } else if (this.carrierPitch !== undefined) {
        this.modulatorPitch = this.carrierPitch;
      } else {
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
      this.carrierVolume = definition.carrierVolume || 1;

      // modulator
      this.modulator = this.ctx.createOscillator();
      this.modulator.type = definition.modulatorType || 'sine';
      this.modulatorType = definition.modulatorType || 'sine';

      // modulator gain
      this.modulatorGain = this.ctx.createGain();
      if (definition.modulation !== undefined) {
        this.modulation = definition.modulation;
        this.modulatorVolume = (this.carrierVolume || 1) * this.modulation;
      } else {
        this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGainAM;
      }
      this.modulatorGain.gain.value = this.modulatorVolume;

      // modulator pitch 
      if (definition.modulatorPitch !== undefined) {
        this.modulatorPitch = definition.modulatorPitch;
      } else if (definition.harmonicity !== undefined) {
        this.modulatorPitch = definition.harmonicity * this.carrierPitch;
      } else if (this.carrierPitch !== undefined) {
        this.modulatorPitch = this.carrierPitch;
      } else {
        this.modulatorPitch = DefModPitch;
      }
      this.modulator.frequency.value = this.modulatorPitch;

      // envelope
      this.envelope = this.ctx.createGain();
      this.attackTime = definition.attackTime || 0.1;
      this.releaseTime = definition.releaseTime || 0.05;
      this.sustain = definition.sustain || 0.8;
      this.decayTime = definition.decayTime || 0.1;

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
    setTargetAtTime(value, time) {
      this.synther.carrier.frequency.setTargetAtTime(value, time);
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

  const WhiteNoise = 'whiteNoise', PinkNoise = 'pinkNoise', BrownNoise = 'brownNoise';
  const NoiseTypes = [WhiteNoise, PinkNoise, BrownNoise];

  // inspired by : https://noisehack.com/generate-noise-web-audio-api/ (but it's not using audioscriptprocess, which is deprecated)
  // and https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques

  function makeNoiseNode(ctx, type, duration, sound) {
    // here, duration is the noise node's duration, for continuous tone it's the entire length;
    const bufferSize = ctx.sampleRate * duration;
    // Create an empty buffer
    const noiseBuffer = new standardizedAudioContext.AudioBuffer({
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
      } else if (type === BrownNoise) {
        BrownNoiseFunction(coeffs);
        data0[i] = coeffs.o;
      } else {
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

  // extra channels => biquadDetune, biquadPitch, biquadGain, biquadQ

  class BiquadFilter {
    constructor(ctx) {
      this.ctx = ctx;
      this.filter = ctx.createBiquadFilter();
      this.destination = this.filter;
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

  function BiquadEncoder(filter, sound, startTime) {
    if (filter.useGain) {
      if (startTime > 0) filter.filter.gain.linearRampToValueAtTime((sound?.others?.biquadGain || 1), startTime);
      else filter.filter.gain.setValueAtTime((sound?.others?.biquadGain || 1), startTime);
    }
    if (sound?.others?.biquadPitch !== undefined) {
      if (startTime > 0) filter.filter.frequency.linearRampToValueAtTime((sound.others.biquadPitch || 1), startTime);
      else filter.filter.frequency.setValueAtTime((sound.others.biquadPitch || 1), startTime);
    }
    if (sound?.others?.biquadQ !== undefined) {
      if (startTime > 0) filter.filter.Q.linearRampToValueAtTime((sound.others.biquadQ || 1), startTime);
      else filter.filter.Q.setValueAtTime((sound.others.biquadQ || 1), startTime);
    }
    if (sound?.others?.biquadDetune !== undefined) {
      if (startTime > 0) filter.filter.detune.linearRampToValueAtTime((sound.others.biquadDetune || 1), startTime);
      else filter.filter.detune.setValueAtTime((sound.others.biquadDetune || 1), startTime);
    }
  }

  function BiquadFinisher(filter, sound, startTime, duration) {
    if (filter.useGain) {
      filter.filter.gain.setValueAtTime((sound?.others.biquadGain || 1), startTime + duration);
    }
    if (sound?.others?.biquadPitch !== undefined) {
      filter.filter.frequency.setValueAtTime((sound.others.biquadPitch || 1), startTime + duration);
    }
    if (sound?.others?.biquadQ !== undefined) {
      filter.filter.Q.setValueAtTime((sound.others.biquadQ || 1), startTime + duration);
    }
    if (sound?.others?.biquadDetune !== undefined) {
      filter.filter.detune.setValueAtTime((sound.others.biquadDetune || 1), startTime + duration);
    }
  }

  class DefaultDynamicCompressor {
    constructor(ctx) {
      this.ctx = ctx;
      this.compressor = ctx.createDynamicsCompressor();
      this.destination = this.compressor;
    }
    initialize() {
      this.compressor.attack.value = 20;
      this.compressor.knee.value = 40;
      this.compressor.ratio.value = 18;
      this.compressor.release.value = 0.25;
      this.compressor.threshold.value = -50;
    }
    finisher() {
    }
    connect(node) {
      this.compressor.connect(node);
    }
    disconnect(node) {
      this.compressor.disconnect(node);
    }
  }

  function CompressorEncoder(filter, sound, startTime) {
    if (sound.others.dcAttack !== undefined) filter.compressor.attack.linearRampToValueAtTime(sound.others.dcAttack || 1, startTime);
    if (sound.others.dcKnee !== undefined) filter.compressor.knee.linearRampToValueAtTime(sound.others.dcKnee || 1, startTime);
    if (sound.others.dcRatio !== undefined) filter.compressor.ratio.linearRampToValueAtTime(sound.others.dcRatio || 1, startTime);
    if (sound.others.dcReduction !== undefined) filter.compressor.release.linearRampToValueAtTime(sound.others.dcReduction || 1, startTime);
    if (sound.others.dcThreshold !== undefined) filter.compressor.threshold.linearRampToValueAtTime(sound.others.dcThreshold || 1, startTime);
  }

  function CompressorFinisher(filter, sound, startTime, duration) {

  }

  class DistortionFilter {
    constructor(ctx) {
      this.ctx = ctx;
      this.distortion = ctx.createWaveShaper();
      this.destination = this.distortion;
    }
    initialize(s, e) {
      this.distortion.curve = makeDistortionCurve(e);
    }
    finisher() {
    }
    connect(node) {
      this.distortion.connect(node);
    }
    disconnect(node) {
      this.distortion.disconnect(node);
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper#examples
  function makeDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 10 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function DistortionEncoder(filter, sound, startTime) {
    if (sound.others.distortion !== undefined) {
      filter.distortion.curve = makeDistortionCurve(sound.others.distortion);
    } else {
      filter.distortion.curve = makeDistortionCurve(100);
    }
  }

  function DistortionFinisher(filter, sound, startTime, duration) {
    filter.distortion.curve = makeDistortionCurve(50);
  }

  class GainerFilter {
    constructor(ctx) {
      this.ctx = ctx;
      this.attackTime = 0.1;
      this.releaseTime = 0.1;
      this.gainer = ctx.createGain();
      this.destination = this.gainer;
    }
    initialize(time) {
      this.gainer.gain.cancelScheduledValues(time);
      this.gainer.gain.setValueAtTime(0, time);
    }
    finisher(time, duration) {
      this.gainer.gain.linearRampToValueAtTime(0, (time || 0) + (duration || 1) - this.releaseTime);
    }
    connect(node) {
      this.gainer.connect(node);
    }
    disconnect(node) {
      this.gainer.disconnect(node);
    }
  }

  function GainerEncoder(filter, sound, startTime) {
    filter.gainer.gain.linearRampToValueAtTime(sound.others?.gain2 || 1, startTime + filter.attackTime);
  }

  function GainerFinisher(filter, sound, startTime, duration) {
    filter.gainer.gain.linearRampToValueAtTime(0, (startTime || 0) + (duration || 1) - filter.releaseTime);
  }

  // types
  const NOM = "nominal", ORD = "ordinal", QUANT = "quantitative", TMP = "temporal", STATIC = "static";
  // polarity
  const POS$1 = "positive", NEG = 'negative';
  // channels
  const TIME_chn = "time",
    TIME2_chn = "time2",
    DUR_chn = "duration",
    TAPCNT_chn = "tapCount",
    TAPSPD_chn = "tapSpeed",
    POST_REVERB_chn = "postReverb",
    PITCH_chn = "pitch",
    DETUNE_chn = "detune",
    LOUDNESS_chn = "loudness",
    PAN_chn = "pan",
    SPEECH_chn = "speech",
    SPEECH_BEFORE_chn = "speechBefore",
    SPEECH_AFTER_chn = "speechAfter",
    TIMBRE_chn = "timbre",
    REPEAT_chn = "repeat",
    MODULATION_chn = 'modulation',
    HARMONICITY_chn = 'harmonicity';

  // default caps
  const MIN_TIME = 0, MIN_PITCH = 207.65, MAX_PITCH = 1600, MAX_LIMIT_PITCH = 3000,
    MAX_DETUNE = 1200, MIN_DETUNE = -1200,
    MIN_LOUD = 0, MAX_LOUD = 10,
    MIN_PAN = -1, MAX_PAN = 1,
    MIN_DUR = 0, MAX_DUR = 20, DEF_DUR = 0.5,
    MAX_POST_REVERB = 4,
    MAX_TAP_COUNT = 25,
    MIN_TAP_SPEED = 0, MAX_TAP_SPEED = 5, MAX_LIMIT_TAP_SPEED = 7,
    DEF_SPEECH_RATE = 1.75;

  const ChannelThresholds = {
    [TIME_chn]: { min: 0 },
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
    [PITCH_chn]: { max: MAX_LIMIT_PITCH, min: 0 },
    [DETUNE_chn]: { max: MAX_DETUNE, min: MIN_DETUNE },
    [LOUDNESS_chn]: { max: Infinity, min: -Infinity },
    [PAN_chn]: { max: MAX_PAN, min: MIN_PAN },
    [DUR_chn]: { max: Infinity, min: MIN_DUR },
    [POST_REVERB_chn]: { max: Infinity, min: 0 },
    [TAPCNT_chn]: { max: Infinity, min: 0 },
    [TAPSPD_chn]: { max: MAX_LIMIT_TAP_SPEED, min: MIN_TAP_SPEED }
  };

  // channel categories
  const TimeChannels = [
    TIME_chn,
    TIME2_chn
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

  // quant scale types
  const SQRT = "sqrt", POW = "pow", LOG = "log", SYMLOG = "symlog";

  // tminig
  const REL_TIMING = 'relative', SIM_TIMING = 'simultaneous';

  // tapping
  // TAPPING: each tap sound
  // TAP: entire tappings
  const DEF_TAP_PAUSE_RATE = 0.4,
    MAX_TAPPING_DUR = 0.3,
    DEF_TAPPING_DUR = 0.2,
    DEF_TAPPING_DUR_BEAT = 1,
    DEF_TAP_DUR = 2,
    DEF_TAP_DUR_BEAT = 4,
    SINGLE_TAP_MIDDLE = 'middle',
    SINGLE_TAP_START = 'start';

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
  ], SKIP = 'skip', NONSKIP = 'nonskip';

  // composition

  const SEQUENCE = 'sequence', OVERLAY = 'overlay';

  // ramping
  const RampMethods = [true, false, 'abrupt', 'linear', 'exponential'];

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

  function isBrowserEventPossible() {
    return typeof document === 'object' && document?.body?.dispatchEvent
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

  let ErieGlobalSynth;

  async function WebSpeechGenerator(sound, config, onstart, onend, resolve) {
    if (!ErieGlobalSynth) ErieGlobalSynth = window.speechSynthesis;
    var utterance = new SpeechSynthesisUtterance(sound.speech);
    if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
    else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
    if (sound?.pitch !== undefined) utterance.pitch = sound.pitch;
    if (sound?.loudness !== undefined) utterance.volume = sound.loudness;
    if (sound?.language) utterance.lang = bcp47language.includes(sound.language) ? sound.language : (typeof document !== undefined ? document : {}).documentElement?.lang;
    else utterance.lang = (typeof document !== undefined ? document : {}).documentElement?.lang;
    onstart();
    ErieGlobalSynth.speak(utterance);
    setErieGlobalControl({ type: Speech, player: ErieGlobalSynth });
    utterance.onend = () => {
      onend();
      if (resolve) resolve();
    };
  }

  const SSMLGENDERS = [`NEUTRAL`, `FEMALE`, `MALE`];

  async function GoogleCloudTTSGenerator(sound, config) {
    if (typeof window === 'undefined') {
      // node
      let text = sound.speech;
      let lang = sound.language || config.language;
      let languageCode = bcp47language.includes(lang) ? lang : 'en-US';
      let ssmlGender = SSMLGENDERS.includes(config.ssmlGender) ? config.ssmlGender : 'NEUTRAL';
      let pitch = sound.pitch, speakingRate = sound.speechRate || config.speechRate || 1;
      const request = {
        input: { text: text },
        voice: { languageCode, ssmlGender },
        audioConfig: { audioEncoding: config?.audioEncoding || 'MULAW', speakingRate, pitch },
      };
      const client = new tts__namespace.TextToSpeechClient();
      // Performs the text-to-speech request
      const [response] = await client.synthesizeSpeech(request);
      return response.audioContent;
    } else {
      console.warn("This function can only be run on node server environment");
      return null;
    }
  }

  const SampleRate$1 = 44100, BufferChannels$1 = 2;

  class AudioPrimitiveBuffer {
    constructor(length, sampleRate) {
      // in seconds
      this.length = length;
      this.sampleRate = sampleRate || SampleRate$1;
      this.compiled = false;
      this.compiledBuffer;
      this.primitive = [];
    }

    add(at, data) {
      this.primitive.push({ at, data });
    }

    async compile() {
      let maxChannels = Math.max(...this.primitive.map((p) => p.data.numberOfChannels || BufferChannels$1)) || BufferChannels$1;
      if (maxChannels < 1) maxChannels = BufferChannels$1;
      else if (maxChannels > 32) maxChannels = 32;
      let bufferLength = this.length ? this.length * this.sampleRate : this.primitive.map((p) => p.data.length).reduce((a, c) => a + c, 0);
      if (bufferLength == 0) bufferLength = this.sampleRate * 0.1;
      let temp_ctx = new standardizedAudioContext.AudioContext();
      this.compiledBuffer = temp_ctx.createBuffer(
        maxChannels,
        bufferLength,
        this.sampleRate,
      );
      let lastAt;
      for (const p of this.primitive) {
        let at = Math.round((p.at || 0) * 44100);
        if (p.at === "next") {
          at = lastAt || 0;
        }
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
    }
  }


  function concatenateBuffers(buffers) {
    let totalLength = buffers.map((d) => d?.length || 0).reduce((a, c) => a + c, 0);
    let ctx = new standardizedAudioContext.AudioContext();
    let totalBuffer = ctx.createBuffer(2, totalLength, ctx.sampleRate);
    let view = 0;
    for (const buffer of buffers) {
      for (let i = 0; i < 2; i++) {
        let channelData = totalBuffer.getChannelData(i);
        let currChannelData;
        if (buffer.numberOfChannels == 1) currChannelData = buffer.getChannelData(0);
        else if (buffer.numberOfChannels == 2) currChannelData = buffer.getChannelData(1);
        for (let j = 0; j < buffer.length; j++) {
          channelData[view + j] = currChannelData[j];
        }
      }
      view += buffer.length;
    }
    return totalBuffer;
  }

  function makeContext() {
    return new AudioContext();
  }
  const SampleRate = 44100, BufferChannels = 2;
  function makeOfflineContext(length) {
    return new OfflineAudioContext(BufferChannels, SampleRate * length, SampleRate);
  }

  function setCurrentTime(ctx) {
    return ctx.currentTime;
  }


  const OscTypes = ['sine', 'sawtooth', 'square', 'triangle'];

  function makeInstrument(ctx, detail, instSamples, synthDefs, waveDefs, sound, contEndTime) {
    if (!detail || detail === "default") {
      return ctx.createOscillator();
    } else if (OscTypes.includes(detail)) {
      let osc = ctx.createOscillator();
      osc.type = detail;
      return osc;
    } else if (NoiseTypes.includes(detail)) {
      let dur = contEndTime || sound.duration;
      if (sound?.detune > 0) dur += dur * (sound?.detune / 600);
      return makeNoiseNode(ctx, detail, dur * 1.1);
    } else if (MultiNoteInstruments.includes(detail)) {
      let note = determineNoteRange(sound.pitch || DefaultFrequency, {});
      let sample = instSamples[detail]['C' + note.octave];
      let source = ctx.createBufferSource();
      source.buffer = sample;
      source.detune.value = note.detune;
      return source;
    } else if (SingleNoteInstruments.includes(detail)) {
      let sample = instSamples[detail].mono;
      let source = ctx.createBufferSource();
      source.buffer = sample;
      return source;
    } else if (Object.keys(waveDefs || {})?.includes(detail)) {
      let real_parsed = new Float32Array(waveDefs[detail].real);
      let imag_parsed = new Float32Array(waveDefs[detail].imag);
      const wave = ctx.createPeriodicWave(
        real_parsed,
        imag_parsed,
        { disableNormalization: waveDefs[detail].disableNormalization || false });
      let osc = ctx.createOscillator();
      osc.setPeriodicWave(wave);
      return osc;
    } else if (Object.keys(instSamples || {})?.includes(detail)) {
      let sample;
      if (instSamples[detail].multiNote) {
        let note = determineNoteRange(sound.pitch, {});
        sample = instSamples[detail]['C' + note?.octave];
      } else {
        sample = instSamples[detail].mono;
      }
      let source = ctx.createBufferSource();
      source.buffer = sample;
      if (instSamples[detail].multiNote) {
        source.detune.value = note.detune;
      }
      return source;
    } else if (Object.keys(synthDefs || {})?.includes(detail)) {
      let synth = makeSynth(ctx, synthDefs[detail]);
      return synth;
    }
  }

  const DefaultFrequency = 523.25;
  const Stopped$1 = 'stopped',
    Tone = 'tone',
    Speech = 'speech';
  let ErieGlobalControl, ErieGlobalState;

  function setErieGlobalControl(ctrl) {
    ErieGlobalControl = ctrl;
  }

  const RamperNames = {
    abrupt: 'setValueAtTime',
    linear: 'linearRampToValueAtTime',
    linear: 'exponentialRampToValueAtTime'
  };

  async function playAbsoluteDiscreteTonesAlt(ctx, queue, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
    // clear previous state
    ErieGlobalState = undefined;

    // playing a series of discrete tones with an aboslute schedule
    // set audio context controls
    setErieGlobalControl({ type: Tone, player: ctx });

    // sort queue to mark the last node for sequence end check
    let q = queue.sort((a, b) => a.time + a.duration - (b.time + b.duration));
    q[0].isFirst = true;
    q[q.length - 1].isLast = true;
    config.subpart = true;
    let endTime = q[q.length - 1].time + q[q.length - 1].duration;
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

    return new Promise(async (resolve, reject) => {
      // get the current time
      let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
      // set and play sounds
      for (let sound of q) {
        if (ErieGlobalState === Stopped$1) {
          // resolve();
          break;
        }
        // get discrete oscillator
        const inst = makeInstrument(timingCtx);
        inst.connect(gain);

        // play & stop
        inst.start(ct + sound.time);
        inst.stop(ct + sound.time + 0.01);

        inst.onended = async () => {
          if (config?.falseTiming && ErieGlobalControl?.type === Speech) {
            ErieGlobalControl?.player?.cancel();
          }
          await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
          if (sound.isLast) {
            sendToneFinishEvent({ sid });
            resolve();
          }
        };
      }
      if (config.tick) {
        playTick(ctx, config.tick, endTime, ct + 0.01, ct + endTime + 0.01, bufferPrimitve);
      }
    });
  }

  async function playAbsoluteContinuousTones(_ctx, queue, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
    // clear previous state
    ErieGlobalState = undefined;

    // sort queue to mark the last node for sequence end check
    let q = queue.sort((a, b) => a.time + a.duration - (b.time + b.duration));
    q[0].isFirst = true;
    q[q.length - 1].isLast = true;

    // get the last tone's finish time
    let endTime = q[q.length - 1].time + q[q.length - 1].duration;

    // get the context
    let ctx = _ctx, offline = false;
    if (bufferPrimitve?.constructor?.name === AudioPrimitiveBuffer.name) {
      offline = true;
      ctx = makeOfflineContext(endTime);
      bufferPrimitve.length = endTime;
    }

    // set audio context controls
    setErieGlobalControl({ type: Tone, player: ctx });

    // rampers 
    let rampers = {};
    if (config.ramp) {
      Object.keys(config.ramp || {}).forEach((chn) => {
        let name = RamperNames[config.ramp[chn]];
        if (chn === TAPCNT_chn || chn === TAPSPD_chn) {
          rampers.tap = name;
        } else {
          rampers[chn] = name;
        }
      });
    }

    // filters
    let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
    for (const filterName of filters) {
      if (PresetFilters[filterName]) {
        filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
        filterEncoders[filterName] = PresetFilters[filterName].encoder;
        filterFinishers[filterName] = PresetFilters[filterName].finisher;
      } else if (ErieFilters[filterName]) {
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
    const inst = makeInstrument(ctx, config?.instrument_type, instSamples, synthDefs, waveDefs, q[0], endTime);
    inst.connect(panner);
    let startTime;
    // get the current time
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    for (let sound of q) {
      if (sound.isFirst) {
        // set for the first value
        if (inst?.constructor.name === OscillatorNode.name) {
          inst.frequency.setValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
        } else if (inst?.constructor.name === ErieSynth.name) {
          inst.frequency.setValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
            inst.modulator.frequency.setValueAtTime((inst.modulatorVolume / sound.modulation), ct + sound.time);
          } else if (inst.type === AM && sound.modulation !== undefined) {
            inst.modulatorGain.gain.setValueAtTime((sound.loudness || 1) * sound.modulation, ct + sound.time);
          }
          if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
            inst.modulator.frequency.setValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct + sound.time);
          }
          inst.envelope.gain.cancelScheduledValues(ct + sound.time);
          inst.envelope.gain.setValueAtTime(0, ct + sound.time);
          inst.envelope.gain.linearRampToValueAtTime(1, ct + sound.time + (inst.attackTime || 0));
          if (inst.decayTime) {
            inst.envelope.gain.linearRampToValueAtTime(inst.sustain || 1, ct + sound.time + (inst.attackTime || 0) + (inst.decayTime || 0));
          }
        }

        if (sound.detune && inst.detune) {
          inst.detune.setValueAtTime(sound.detune || 0, ct + sound.time);
        }

        if (sound.loudness !== undefined) {
          gain.gain.setValueAtTime(sound.loudness, ct + sound.time);
        }
        if (sound.pan !== undefined) {
          panner.pan.setTargetAtTime(sound.pan, ct + sound.time, 0.35);
        }
        // play the first
        startTime = ct + sound.time;
      } else {
        if (inst?.constructor.name === OscillatorNode.name) {
          if (rampers.pitch) {
            inst.frequency[rampers.pitch](sound.pitch || DefaultFrequency, ct + sound.time);
          } else {
            inst.frequency.linearRampToValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          }
        } else if (inst?.constructor.name === ErieSynth.name) {
          if (rampers.pitch) {
            inst.frequency[rampers.pitch](sound.pitch || DefaultFrequency, ct + sound.time);
          } else {
            inst.frequency.linearRampToValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          }
          if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
            if (rampers.modulation) {
              inst.modulator.frequency[rampers.modulation]((inst.modulatorVolume / sound.modulation), ct + sound.time);
            } else {
              inst.modulator.frequency.linearRampToValueAtTime((inst.modulatorVolume / sound.modulation), ct + sound.time);
            }
          } else if (inst.type === AM && sound.modulation !== undefined) {
            if (rampers.modulation) {
              inst.modulatorGain.gain[rampers.modulation]((sound.loudness || 1) * sound.modulation, ct + sound.time);
            } else {
              inst.modulatorGain.gain.linearRampToValueAtTime((sound.loudness || 1) * sound.modulation, ct + sound.time);
            }
          }
          if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
            if (rampers.harmonicity) {
              inst.modulator.frequency[rampers.harmonicity]((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct + sound.time);
            } else {
              inst.modulator.frequency.linearRampToValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct + sound.time);
            }
          }
        }

        if (sound.loudness !== undefined) {
          if (rampers.loudness) {
            gain.gain[rampers.loudness](
              sound.loudness <= 0 ? 0.0000000001 : sound.loudness,
              ct + sound.time
            );
          } else {
            gain.gain.linearRampToValueAtTime(
              sound.loudness,
              ct + sound.time
            );
          }
        }
        if (sound.pan !== undefined) {
          panner.pan.linearRampToValueAtTime(sound.pan, ct + sound.time);
        }
        if (sound.isLast) {
          gain.gain.linearRampToValueAtTime((sound.loudness !== undefined ? sound.loudness : 1), ct + sound.time + 0.05);
          gain.gain.linearRampToValueAtTime(0, ct + sound.time + 0.15);
          if (inst?.constructor.name === ErieSynth.name) {
            inst.envelope.gain.cancelScheduledValues(ct + sound.time);
            inst.envelope.gain.setValueAtTime(1, ct + sound.time + (sound.duration));
            inst.envelope.gain.linearRampToValueAtTime(
              0,
              ct + sound.time + (sound.duration || 0) + (inst.attackTime || 0) + (inst.releaseTime || 0)
            );
          }
        }

        if (sound.detune && inst.detune) {
          if (rampers.detune) {
            inst.detune[rampers.detune](sound.detune || 0, ct + sound.time);
          } else {
            inst.detune.linearRampToValueAtTime(sound.detune || 0, ct + sound.time);
          }
        }
      }

      for (const filterName of filters) {
        let encoder = filterEncoders[filterName];
        let finisher = filterFinishers[filterName];
        if (encoder) {
          encoder(filterNodes[filterName], sound, ct + sound.time, rampers);
        }
        if (finisher) {
          finisher(filterNodes[filterName], sound, ct + sound.time, (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)), rampers);
        }
      }
    }

    const tick = makeTick(ctx, config.tick, endTime);


    emitNotePlayEvent('tone', q[0]);
    if (offline && bufferPrimitve) {
      if (tick) {
        tick.start();
        tick.stop(endTime);
      }
      inst.start();
      inst.stop(endTime);
      let rb = await ctx.startRendering();
      bufferPrimitve.add(0, rb);
      inst.onended = (e) => {
        setErieGlobalControl(undefined);
        ErieGlobalState = undefined;
        emitNoteStopEvent('tone', q[0]);
        sendToneFinishEvent({ sid });
      };
    } else {
      return new Promise((resolve, reject) => {
        if (tick) {
          tick.start(startTime);
          tick.stop(ct + endTime);
        }
        inst.start(startTime);
        inst.stop(ct + endTime);
        inst.onended = (e) => {
          setErieGlobalControl(undefined);
          ErieGlobalState = undefined;
          emitNoteStopEvent('tone', q[0]);
          sendToneFinishEvent({ sid });
          resolve();
        };
      });
    }
  }

  async function playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
    if (config?.subpart && ErieGlobalState === Stopped$1) return;
    if (!config?.subpart) ErieGlobalState = undefined;

    // clear previous state
    ErieGlobalState = undefined;

    // set audio context controls
    setErieGlobalControl({ type: Tone, player: ctx });

    let sid;
    if (!config.subpart) {
      sid = genRid();
      sendToneStartEvent({ sid });

    }

    if (sound.tap !== undefined && sound.tap?.pattern?.constructor.name === "Array") {
      let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
      let tapSound = deepcopy(sound);
      let t = 1, acc = 0, i = 0; // d
      if (sound.tap.pattern.length == 0) {
        await playPause((sound.duration || 0.2) * 1000);

        sendToneFinishEvent({ sid });
      }

      emitNotePlayEvent('tone', sound);
      for (const s of sound.tap.pattern) {
        if (t === 1) {
          tapSound.duration = s;
          if (s > 0) {
            await __playSingleTone(ctx, ct + acc, tapSound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
          }
          t = 0;
        } else {
          await playPause(s * 1000);
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
    } else {
      let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
      emitNotePlayEvent('tone', sound);
      await __playSingleTone(ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
      emitNoteStopEvent('tone', sound);
      if (!config.subpart) {
        sendToneFinishEvent({ sid });
      }
      return;
    }
  }

  async function __playSingleTone(_ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve) {
    // filters
    let ctx = _ctx, offline = false;
    if (bufferPrimitve?.constructor?.name === AudioPrimitiveBuffer.name) {
      offline = true;
      ctx = makeOfflineContext(sound.duration);
      ct = 0;
    }
    let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
    for (const filterName of filters) {
      if (PresetFilters[filterName]) {
        filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
        filterEncoders[filterName] = PresetFilters[filterName].encoder;
        filterFinishers[filterName] = PresetFilters[filterName].finisher;
      } else if (ErieFilters[filterName]) {
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
    let iType = sound.timbre || config?.instrument_type;
    const inst = makeInstrument(ctx, iType, instSamples, synthDefs, waveDefs, sound);

    inst.connect(panner);

    // set auditory values
    if (inst?.constructor.name === OscillatorNode.name) {
      inst.frequency.setValueAtTime(sound.pitch || inst.carrierPitch || DefaultFrequency, ct);
    } else if (inst?.constructor.name === ErieSynth.name) {
      inst.frequency.setValueAtTime(sound.pitch || inst.carrierPitch || DefaultFrequency, ct);
      if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
        inst.modulator.frequency.setValueAtTime((inst.modulatorVolume / sound.modulation), ct);
      } else if (inst.type === AM && sound.modulation !== undefined && sound.modulation > 0) {
        inst.modulatorGain.gain.setValueAtTime((sound.loudness || 1) * sound.modulation, ct);
      }
      if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
        inst.modulator.frequency.cancelScheduledValues(ct);
        inst.modulator.frequency.setValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct);
      } else if (sound.harmonicity === undefined) {
        inst.modulator.frequency.cancelScheduledValues(ct);
        inst.modulator.frequency.setValueAtTime(sound.pitch, ct);
      }

      inst.envelope.gain.cancelScheduledValues(ct);
      inst.envelope.gain.setValueAtTime(0, ct);
      inst.envelope.gain.linearRampToValueAtTime(1, ct + (inst.attackTime || 0));
      if (inst.decayTime) {
        inst.envelope.gain.linearRampToValueAtTime(inst.sustain || 1, ct + sound.time + (inst.attackTime || 0) + (inst.decayTime || 0));
      }
      inst.envelope.gain.setValueAtTime(inst.sustain || 1, ct + (sound.duration));
      inst.envelope.gain.linearRampToValueAtTime(
        0,
        ct + (sound.duration) + (inst.attackTime || 0) + (inst.releaseTime || 0)
      );
    }

    if (sound.detune && inst.detune) {
      inst.detune.setValueAtTime(sound.detune || 0, ct);
    }

    if (sound.loudness !== undefined) {
      gain.gain.setValueAtTime(sound.loudness, ct);
    }
    if (sound.postReverb) {
      gain.gain.setTargetAtTime(0, ct + (sound.duration) * 0.95, 0.015);
      gain.gain.setTargetAtTime(0.45, ct + (sound.duration), 0.015);
      gain.gain.exponentialRampToValueAtTime(0.02, ct + (sound.duration + sound.postReverb) * 0.95);
    } else {
      sound.postReverb = 0;
    }

    for (const filterName of filters) {
      let encoder = filterEncoders[filterName];
      let finisher = filterFinishers[filterName];
      if (encoder) {
        encoder(filterNodes[filterName], sound, ct);
      }
      if (finisher) {
        finisher(filterNodes[filterName], sound, ct + sound.time, ct + (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)));
      }
    }

    gain.gain.setTargetAtTime(0, ct + (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)) * 0.95, 0.015);

    if (sound.pan !== undefined) {
      panner.pan.setValueAtTime(sound.pan, ct);
    }

    // play & stop
    if (offline && bufferPrimitve) {
      inst.start();
      inst.stop(sound.duration + (sound.postReverb || 0));
      let rb = await ctx.startRendering();
      if (sound.time !== 'after_previous') bufferPrimitve.add(sound.time, rb);
      else bufferPrimitve.add('next', rb);
    } else {
      return new Promise((resolve, reject) => {
        inst.start(ct);
        inst.onended = (_) => {
          resolve();
        };
        inst.stop(ct + sound.duration + sound.postReverb);
      });
    }
    return;
  }


  async function playSingleSpeech(sound, config, bufferPrimitve, ttsFetchFunction) {
    // clear previous state
    if (config?.subpart && ErieGlobalState === Stopped$1) return;
    if (!config?.subpart) ErieGlobalState = undefined;


    let sid = genRid();
    if (!config.subpart) {
      sendSpeechStartEvent({ sound, sid });
    }

    let onstart = () => {
      emitNotePlayEvent('speech', sound);
    };
    let onend = () => {
      window.removeEventListener('keypress', stop);
      setErieGlobalControl(undefined);
      ErieGlobalState = undefined;
      emitNoteStopEvent('speech', sound);
      if (!config.subpart) {
        sendSpeechFinishEvent({ sid });
      }
    };

    if (typeof window !== 'undefined' && bufferPrimitve && typeof ttsFetchFunction === 'function') {
      let speechRendered = await ttsFetchFunction({ text: sound, config });
      let ctx = new AudioContext();
      bufferPrimitve.add('next', await ctx.decodeAudioData(speechRendered));
    } else if (typeof window === 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
      await GoogleCloudTTSGenerator(sound, config);
    } else {
      if (typeof window !== 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
        console.warn("Google Cloud TTS API can only be used on Node.js Server environment.");
      }
      return new Promise((resolve, reject) => {
        WebSpeechGenerator(sound, config, onstart, onend, resolve);
      });
    }
    return;
  }

  async function playRelativeDiscreteTonesAndSpeeches(ctx, queue, _config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve, ttsFetchFunction) {
    // clear previous state
    ErieGlobalState = undefined;

    let config = deepcopy(_config);
    config.subpart = true;
    for (const sound of queue) {
      if (ErieGlobalState === Stopped$1) break;
      let sid = genRid();
      if (sound.speech) {
        sendSpeechStartEvent({ sound, sid });
        await playSingleSpeech(sound, config, bufferPrimitve, ttsFetchFunction);
        sendSpeechFinishEvent({ sid });
      } else {
        sendToneStartEvent({ sid });

        await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);

        sendToneFinishEvent({ sid });
      }
    }
    ErieGlobalState = undefined;
    return;
  }

  let ErieGlobalPlayerEvents = new Map();
  function setPlayerEvents(queue, config) {
    if (typeof window !== 'undefined') {
      function stop(event) {
        if (event.key == 'x') {
          ErieGlobalState = Stopped$1;
          queue.state = Stopped$1;
          if (ErieGlobalControl?.type === Tone) {
            ErieGlobalControl.player.close();
          } else if (ErieGlobalControl?.type === Speech) {
            ErieGlobalControl.player.cancel();
          }
          notifyStop(config);
        }
      }
      window.addEventListener('keypress', stop);
      ErieGlobalPlayerEvents.set('stop-event', stop);
    }
  }

  function clearPlayerEvents() {
    if (typeof window !== 'undefined') {
      let stop = ErieGlobalPlayerEvents.get('stop-event');
      window.removeEventListener('keypress', stop);
      ErieGlobalPlayerEvents.delete('stop-event');
    }
  }

  function playPause(ms, config) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    })
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

  function isJSON(d) {
    try {
      JSON.parse(d);
      return true;
    } catch {
      return false
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

  function jType(v) {
    return v?.constructor.name;
  }

  function detectType(values) {
    if (values.every((d) => d?.constructor.name === "Number")) return QUANT;
    else return ORD;
  }

  function makeParamFilter(expr) {
    if (jType(expr) !== "String") return null;
    let base = expr.includes("datum.") ? "datum" : "d";
    if (base === "datum") {
      return Function('datum', "return (" + expr + ");");
    } else {
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
    if (tapValue !== undefined && tapType === TAPCNT_chn) {
      if (!duration && !beat) duration = DEF_TAPPING_DUR;
      else if (!duration && beat && beat.converter) {
        duration = DEF_TAPPING_DUR_BEAT;
      }
      let pauseLength;
      duration = round(duration, -2);
      if (pause?.length !== undefined) pauseLength = pause?.length;
      else if (pause?.rate !== undefined) pauseLength = duration * pause?.rate;
      else pauseLength = duration * DEF_TAP_PAUSE_RATE;
      pauseLength = round(pauseLength, -2);
      let pattern = [], totalLength = 0, patternString = `[${duration}, ${pauseLength}] x ${tapValue} `;
      for (let i = 0; i < tapValue; i++) {
        pattern.push(duration);
        totalLength += duration;
        if (i < tapValue - 1) {
          totalLength += pauseLength;
          pattern.push(pauseLength);
        } else {
          totalLength += tapEndBumper;
          pattern.push(tapEndBumper);
        }
      }
      if (beat?.converter) pattern = pattern.map(beat?.converter);
      return { pattern, totalLength, patternString };
    } else if (tapValue !== undefined && tapType === TAPSPD_chn) {
      if (!duration && !beat) duration = DEF_TAP_DUR;
      else if (!duration && beat && beat.converter) {
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
      } else if (count == 1) {
        if (!singleTappingPosition || singleTappingPosition === SINGLE_TAP_MIDDLE) {
          pauseLength = (duration - tappingDur) / 2;
          pauseLength = round(pauseLength, -2);
          pattern = [0, pauseLength, tappingDur, pauseLength];
          totalLength += pauseLength + tappingDur + pauseLength;
        } else {
          pauseLength = duration - tappingDur;
          pauseLength = round(pauseLength, -2);
          if (singleTappingPosition === SINGLE_TAP_START) {
            pattern = [tappingDur, pauseLength];
            totalLength += pauseLength + tappingDur;
          } else if (singleTappingPosition === SINGLE_TAP_START) {
            pattern = [0, pauseLength, tappingDur, tapEndBumper];
            totalLength += pauseLength + tappingDur + tapEndBumper;
          }
        }
      } else {
        pauseLength = (duration - tapOnlyDur) / (count - 1);
        pauseLength = round(pauseLength, -2);
        for (let i = 0; i < count; i++) {
          pattern.push(tappingDur);
          totalLength += tappingDur;
          if (i < count - 1) {
            totalLength += pauseLength;
            pattern.push(pauseLength);
          } else {
            totalLength += tapEndBumper;
            pattern.push(tapEndBumper);
          }
        }
      }
      let patternString = `[${tappingDur}, ${pauseLength}] x ${count}`;
      if (beat?.converter) pattern = pattern.map(beat?.converter);
      return { pattern, totalLength, patternString };
    } else if (tapValue !== undefined && tapType === 'both') {
      let count = round(tapValue.count, 0), speed = tapValue.speed;
      if (!duration && !beat) duration = DEF_TAPPING_DUR;
      else if (!duration && beat && beat.converter) {
        duration = DEF_TAPPING_DUR_BEAT;
      }
      let tapSection = round(1 / speed, -2);
      if (!beat) {
        if (tapSection < 0.12) tapSection = 0.12;
        if (duration > tapSection) duration = round(tapSection * 0.85, -2);
      }
      let pauseLength = round(tapSection - duration, -2);
      let pattern = [], totalLength = 0, patternString = `[${duration}, ${pauseLength}] x ${count} `;
      for (let i = 0; i < count; i++) {
        pattern.push(duration);
        totalLength += duration;
        if (i < count - 1) {
          totalLength += pauseLength;
          pattern.push(pauseLength);
        } else {
          totalLength += tapEndBumper;
          pattern.push(tapEndBumper);
        }
      }
      if (beat?.converter) pattern = pattern.map(beat?.converter);
      return { pattern, totalLength, patternString }
    } else {
      return { pattern: [], totalLength: 0, patternString: `[0, 0] x 0` };
    }
  }

  function mergeTapPattern(tapCount, tapSpeed) {
    if (tapCount && tapSpeed) {
      return makeTapPattern({ count: tapCount?.value, speed: tapSpeed?.value }, 'both', tapCount.tapLength, undefined, tapSpeed.tappingUnit, tapSpeed.singleTappingPosition, tapCount.beat);
    } else if (tapCount) {
      return makeTapPattern(tapCount?.value, TAPCNT_chn, tapCount.tapLength, tapCount.pause, undefined, undefined, tapCount.beat);
    } else if (tapSpeed) {
      return makeTapPattern(tapSpeed?.value, TAPSPD_chn, tapSpeed.tapDuration, undefined, tapSpeed.tappingUnit, tapSpeed.singleTappingPosition, tapSpeed.beat);
    }
    else { return undefined }}

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

  function noteToFreq$1(note) {
    if (jType(note) === "Number") return note;
    if (jType(note) !== "String") return null;
    let n = note[0]?.toLowerCase(), o = note[1], a = note[2]?.toLowerCase();
    if (a === "#") a = "s";
    else if (a === "♭") a = "b";
    if (o > 8) return null;
    if (a === "b") {
      let na = sharpToFlat[n + a];
      n = na[0];
      a = na[1];
      if (na == 'b') o = o - 1;
    }
    if (n + a === 'bs') {
      n = 'c';
      a = undefined;
    } else if (n + a === 'es') {
      n = 'f';
      a = undefined;
    }
    if (o < 0) return null;
    return noteScale[o][n + (a || '')];
  }

  // The below code is adopted from: https://russellgood.com/how-to-convert-audiowaveBuffer-to-audio-file/

  async function makeWaveFromBuffer(buffer, ext) {
    let nChannels = buffer.numberOfChannels,
      samples = buffer.length,
      sampleRate = buffer.sampleRate,
      waveLength = samples * nChannels * 2 + 44,
      waveBuffer = new ArrayBuffer(waveLength),
      view = new DataView(waveBuffer),
      channelData = [];

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
    let waveBlob = new Blob([waveBuffer], { type: "audio/wav" });
    if (ext === '$raw') {
      return waveBuffer;
    } else if (ext) {
      return new Blob([waveBlob], { type: "audio/" + (ext || "wav") });
    }
    else return waveBlob;
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

  const TextType = 'text',
    ToneType = 'tone',
    ToneSeries = 'tone-series',
    LegendType = 'legend',
    ToneSpeechSeries = 'tone-speech-series',
    Pause = 'pause',
    ToneOverlaySeries = 'tone-overlay-series';
  const Stopped = 'stopped',
    Paused = 'paused',
    Playing = 'playing',
    Finished = 'finished';

  const Types = [TextType, ToneType, ToneSeries, ToneOverlaySeries, Pause, ToneSpeechSeries, LegendType];

  class AudioGraphQueue {
    constructor() {
      this.queue = [];
      this.state = Finished;
      this.playAt;
      this.config = {};
      this.stopEvents = {};
      this.sampledInstruments = [];
      this.sampledInstrumentSources = {};
      this.chunks;
      this.export = [];
      this.samplings = {};
      this.synths = {};
      this.waves = {};
      this.playId;
      this.buffers = [];
    }

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

    isSupportedInst(k) {
      return SupportedInstruments.includes(k);
    }
    isSampling(k) {
      return this.samplings?.[k] !== undefined;
    }
    isSynth(k) {
      return this.synths?.[k] !== undefined;
    }
    isWave(k) {
      return this.waves?.[k] !== undefined;
    }

    add(type, info, lineConfig, at) {
      let checkInstrumentSampling = new Set(), userSampledInstruments = new Set();
      if (Types.includes(type)) {
        let item = {
          type,
          config: lineConfig,
          duration: info.duration
        };
        if (type === TextType) {
          item.text = info?.text || info || '';
          if (info?.speechRate) item.speechRate = info?.speechRate;
        } else if (type === ToneType) {
          item.instrument_type = info.instrument_type;
          if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
          else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
          item.time = info.sound?.start || info.start || 0;
          item.end = info.sound?.end || (item.time + (item.sound?.duration || 0.2));
          item.duration = info.sound?.duration || (item.end - item.time) || 0.2; // in seconds
          item.pitch = info.sound?.pitch || info.pitch || DefaultFrequency;
          item.detune = info.sound?.detune || info.detune;
          item.loudness = getFirstDefined(info.sound?.loudness, info.loudness, 1);
          item.pan = info.sound?.pan || info.pan;
          item.postReverb = info.sound?.postReverb || info.postReverb || 0;
          item.timbre = info.sound?.timbre || info.timbre || info.instrument_type;
          let tapCount = info.sound?.tapCount || info.tapCount,
            tapSpeed = info.sound?.tapSpeed || info.tapSpeed;
          if (tapCount || tapSpeed) {
            item.tap = mergeTapPattern(tapCount, tapSpeed);
            item.duration = item.tap.totalLength;
          }
          item.modulation = info.sound?.modulation || info.modulation || 0;
          item.harmonicity = info.sound?.harmonicity || info.harmonicity || 0;
          item.others = {};
          // custom channels;
          Object.keys(info.sound || info || {}).forEach((chn) => {
            if (!DefaultChannels.includes(chn)) {
              item.others[chn] = info.sound?.[chn] || info[chn];
            }
          });
          // filters
          item.filters = info.filters || [];
          if (this.isSupportedInst(item.timbre)) checkInstrumentSampling.add(item.timbre);
          else if (this.isSampling(item.timbre)) userSampledInstruments.add(item.timbre);
        } else if (type === ToneSeries) {
          item.instrument_type = info.instrument_type;
          if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
          else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
          item.sounds = makeSingleStreamQueueValues(info.sounds);
          if (item.sounds.hasSpeech) item.type = ToneSpeechSeries;
          item.sounds[item.sounds.length - 1].isLast = true;
          item.continued = info.continued;
          item.relative = info.relative;
          // filters
          item.filters = info.filters || [];
          if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
          else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
          item.sounds.forEach((sound) => {
            if (this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
            else if (this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
          });
        } else if (type === ToneOverlaySeries) {
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
              if (this.isSupportedInst(o.instrument_type)) checkInstrumentSampling.add(o.instrument_type);
              else if (this.isSampling(o.instrument_type)) userSampledInstruments.add(o.instrument_type);
              o.sounds.forEach((sound) => {
                if (this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
                else if (this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
              });
              return o;
            });
          } else {
            item.overlays = info.overlays;
          }
        } else if (type === Pause) {
          item.duration = info.duration; // in seconds
        } else if (type === LegendType) {
          Object.assign(item, info);
        }
        if (info.ramp) {
          item.ramp = deepcopy(info.ramp);
        }
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
        } else {
          this.queue.push(item);
        }
      }
    }

    addMulti(multiples, lineConfig, pos) {
      let at = pos;
      for (const mul of multiples) {
        if (mul?.type) {
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
      } else {
        this.queue.push(...queue.queue);
      }
    }

    async play(i, j, options) {
      if (this.state !== Playing) {
        setPlayerEvents(this, this.config);
        let queue = this.queue;
        this.playAt = i || 0;
        let outputs = Array((j || queue.length) - (i || 0)).fill({});
        // for pause & resume
        if (i !== undefined && j !== undefined) {
          queue = this.queue.slice(i, j);
        } else if (i !== undefined) {
          queue = this.queue.slice(i, this.queue.length);
        } else if (j !== undefined) {
          queue = this.queue.slice(0, j);
        }
        this.state = Playing;
        this.fireStartEvent();
        let k = 0;
        for (const item of queue) {
          console.log(item, this.state, options);
          if (this.state === Stopped || this.state === Paused) break;
          outputs[k] = await this.playLine(item, options);
          this.playAt += 1;
          k++;
        }
        this.fireStopEvent();
        clearPlayerEvents();
        this.state = Stopped;
        this.playAt = undefined;
        return outputs;
      }
    }

    async playLine(item, options) {
      let config = deepcopy(this.config);
      Object.assign(config, item.config);
      config.ramp = item.ramp;
      let bufferPrimitve;
      if (options?.pcm) bufferPrimitve = new AudioPrimitiveBuffer(item.duration);
      let ttsFetchFunction = options?.ttsFetchFunction;
      if (item?.type === TextType) {
        await playSingleSpeech(item.text, config, bufferPrimitve, ttsFetchFunction);
      } else if (item?.type === ToneType) {
        let ctx = makeContext();
        for (const inst of this.sampledInstruments) {
          if (inst && !this.sampledInstrumentSources[inst]) {
            this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl);
          }
        }
        await playSingleTone(ctx, item, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
        ctx.close();
      } else if (item?.type === Pause) {
        await playPause(item.duration * 1000);
      } else if (item?.type === ToneSeries) {
        let ctx = makeContext();
        for (const inst of this.sampledInstruments) {
          if (inst && !this.sampledInstrumentSources[inst]) {
            this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl);
          }
        }
        if (item.continued) {
          config.instrument_type = item.instrument_type;
          await playAbsoluteContinuousTones(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
        } else if (!item.relative) {
          await playAbsoluteDiscreteTonesAlt(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
        } else {
          await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve, ttsFetchFunction);
        }
        ctx.close();
      } else if (item?.type === ToneSpeechSeries) {
        let ctx = makeContext();
        for (const inst of this.sampledInstruments) {
          if (inst && !this.sampledInstrumentSources[inst]) {
            this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl);
          }
        }
        await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve, ttsFetchFunction);
        ctx.close();
      } else if (item?.type === ToneOverlaySeries) {
        let promises = [];
        let ctx = makeContext();
        for (const inst of this.sampledInstruments) {
          if (inst && !this.sampledInstrumentSources[inst]) {
            this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl);
          }
        }
        for (let stream of item.overlays) {
          if (stream.continued) {
            config.instrument_type = stream.instrument_type;
            promises.push(playAbsoluteContinuousTones(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
          } else if (!stream.relative) {
            promises.push(playAbsoluteDiscreteTonesAlt(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
          } else {
            promises.push(playRelativeDiscreteTonesAndSpeeches(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
          }
        }
        await Promise.all(promises);
        ctx.close();
      }
      if (bufferPrimitve) {
        let currBuffer = await bufferPrimitve?.compile();
        this.buffers.push(currBuffer);
        return bufferPrimitve;
      }
      return;
    }

    stop() {
      // button-based stop
      // for event stop ==> audio-graph-player-proto.js
      if (this.state === Playing) {
        if (ErieGlobalControl?.type === Tone || ErieGlobalControl?.player?.close) {
          ErieGlobalControl.player.close();
        } else if (ErieGlobalControl?.type === Speech || ErieGlobalControl?.player?.cancel) {
          ErieGlobalControl.player.cancel();
        }
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
      self.state = Paused;
      notifyPause(this.config);
    }

    // todo
    async resume() {
      await notifyResume(this.config);
      return this.play(this.playAt);
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

    async getFullAudio(ttsFetchFunction) {
      let output = [];
      let ctx = new AudioContext();

      let options = { pcm: true, ttsFetchFunction };
      for (let i = 0; i < this.queue.length; i++) {
        let buffers = await this.play(i, i + 1, options);
        for (const b of buffers) {
          if (b?.constructor.name === AudioPrimitiveBuffer?.name) {
            output.push(b.compiledBuffer);
          } else {
            output.push(await ctx.decodeAudioData(b));
          }
        }
      }

      let merged = concatenateBuffers(output);
      let blob = await makeWaveFromBuffer(merged, "mp3");
      return window.URL.createObjectURL(blob);
    }
  }


  function makeSingleStreamQueueValues(sounds) {
    let queue_values = [];
    for (const sound of sounds) {
      let time = sound.start !== undefined ? sound.start : sound.time;
      let dur = sound.duration !== undefined ? sound.duration : (sound.end - time);
      let tap = mergeTapPattern(sound.tapCount, sound.tapSpeed);
      if (sound.tapCount || sound.tapSpeed) {
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
        postReverb: (Math.round(sound.postReverb * 100) / 100) || 0,
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
        if (!DefaultChannels.includes(chn) && chn !== '__datum') {
          ith_q.others[chn] = sound[chn];
        }
      });
      queue_values.push(ith_q);
    }
    queue_values = queue_values.sort((a, b) => (a.time + a.duration) - (b.time + b.duration));

    return queue_values;
  }

  function listString(arr, delim, isAnd, _and) {
    if (arr.length == 0) return "";
    else if (arr.length == 1) return arr[0];
    else if (arr.length == 2 && isAnd) return `${arr[0]} ${_and || 'and'} ${arr[1]}`;
    else if (arr.length == 2 && !isAnd) return `${arr[0]}${delim || ' '}${arr[1]} `;
    else if (!isAnd) {
      return arr.join(delim);
    } else {
      let last = arr[arr.length - 1];
      let rest = arr.slice(0, arr.length - 1);
      return rest.join(delim) + delim + `${_and || 'and'}` + last;
    }
  }

  function toOrdinalNumbers(n) {
    // upto 23
    return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth",
      "tenth", "eleventh", "twelveth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth",
      "twentieth", "twenty-first", "twenty-second", "twenty-third"][n] || n + "th"
  }

  function toHashedObject(a, k, dp) {
    let o = {};
    a.forEach((d) => {
      let t = {};
      if (dp) {
        t = deepcopy(d);
      } else {
        Object.assign(t, d);
      }
      o[d[k]] = t;
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

  const descriptionKeywords = [
    'sound', 'list', 'domain', 'domain.min', 'domain.max', 'domain.length',
    'channel', 'field', 'aggregate', 'title', 'range.length', 'range', 'timeUnit'
  ];

  function compileDescriptionMarkup(expression, channel, scale, speechRate, timeUnit) {
    if (expression.length == 0 || !expression) return [];
    let exprParsed = parseDescriptionMarkup(expression);
    let scaleProps = scale.properties;
    let preQueue = [];
    for (const seg of exprParsed) {
      if (seg.type === "text") {
        seg.speechRate = speechRate;
        preQueue.push(seg);
      } else {
        if (seg.key === "sound") {
          let item = { type: 'sound' };
          if (jType(seg.value) === "Array") {
            item.continuous = true;
            item.value = seg.value.map((v) => getLKvalues(v, channel, scaleProps, timeUnit));
          } else {
            item.continuous = false;
            item.value = getLKvalues(seg.value, channel, scaleProps, timeUnit);
          }
          if (seg.duration) {
            item.duration = seg.duration;
          } else {
            if (item.continuous) item.duration = (timeUnit === 'beat' ? 1 : 0.5) * item.value.length;
            else item.duration = (timeUnit === 'beat' ? 1 : 0.5);
          }
          preQueue.push(item);
        } else if (seg.key === "list") {
          let elements = seg.item;
          if (!elements) elements = getKeywordValues('domain', channel, scaleProps, timeUnit);
          let formatter = (d) => d;
          if (scaleProps.format) {
            if (scaleProps.formatType === "number") formatter = d3.format(scaleProps.format);
            else if (scaleProps.formatType === "datetime") formatter = d3.timeFormat(scaleProps.format);
          }
          if (elements) elements = elements.map((d) => jType(d) === 'Number' ? formatter(d) : d);

          let first = seg.first;
          let last = seg.last;
          let item = { type: 'text' };
          let textItems = [];
          if (first) textItems.push(...elements.slice(0, first));
          if (last) textItems.push(...elements.slice(elements.length - last, elements.length));
          let join = seg.join || ", ", and = seg.and;
          item.text = listString(textItems, join, and ? true : false, and);
          item.speechRate = speechRate;
          preQueue.push(item);
        } else {
          let text = getKeywordValues(seg.key, channel, scaleProps, timeUnit);
          let formatter = (d) => (d?.toString() || '');
          if (scaleProps.format) {
            if (scaleProps.formatType === "number") formatter = d3.format(scaleProps.format);
            else if (scaleProps.formatType === "datetime") formatter = d3.timeFormat(scaleProps.format);
          }
          if (jType(text) === 'Array') text = text.map((d) => jType(d) === 'Number' ? formatter(d) : d);
          else if (jType(text) !== 'String') text = formatter(text);
          preQueue.push({
            type: 'text',
            text: text,
            speechRate
          });
        }
      }
    }

    // flatten (merging text outputs)
    let queue = [];
    for (const item of preQueue) {
      if (queue.length > 0 && queue[queue.length - 1].type === 'text' && item.type === 'text') {
        queue[queue.length - 1].text += (item.text.startsWith(".") ? "" : " ") + item.text.trim();
      } else {
        queue.push(item);
      }
    }
    return queue;
  }

  function getLKvalues(item, channel, scaleProps, timeUnit) {
    if (item?.literal) return item.literal;
    else if (item?.keyword) return getKeywordValues(item.keyword, channel, scaleProps, timeUnit);
    else return undefined;
  }

  function getKeywordValues(keyword, channel, scaleProps, timeUnit) {
    if (keyword === 'domain') {
      return scaleProps.domain.join(", ");
    } else if (keyword === 'domain.min') {
      return Math.min(...scaleProps.domain);
    } else if (keyword === 'domain.max') {
      return Math.max(...scaleProps.domain);
    } else if (keyword.match(/domain\[[0-9]+\]/g)) {
      let i = parseInt(keyword.match(/[0-9]+/g)[0]);
      return scaleProps.domain[i];
    } else if (keyword === 'domain.length') {
      return scaleProps.domain.length;
    } if (keyword === 'range') {
      return scaleProps.range.join(", ");
    } else if (keyword === 'range.length') {
      if (channel === TIME_chn) return scaleProps.length;
      else return Math.max(...scaleProps.range) - Math.min(...scaleProps.range);
    } else if (keyword === 'channel') {
      return channel;
    } else if (keyword === 'field') {
      return scaleProps.field.join(", ");
    } else if (keyword === 'title') {
      return scaleProps.title;
    } else if (keyword === 'aggregate') {
      return scaleProps.aggregate;
    } else if (keyword === 'timeUnit') {
      return timeUnit;
    }
  }

  const exprRegex = /(\<[^\<\>]+\>|[^\<\>]+)/g;

  function parseDescriptionMarkup(expression) {
    if (jType(expression) !== 'String') {
      console.error("Wrong description expression type.");
    }
    let expr = expression.trim(), hasPeriodAtTheEnd = false;
    if (expr.endsWith(".")) {
      expr = expr.substring(0, expr.length - 1);
      hasPeriodAtTheEnd = true;
    }
    let exprGroups = expr.match(exprRegex);
    if (!exprGroups) {
      console.error(`Wrong description expression (not parsable): ${expression}.`);
    }
    let parsed = [];
    for (const exprSeg of exprGroups) {
      if (exprSeg.startsWith("<")) {
        // sound item or other item should be replaced
        let segParsed = parseDescriptionKeywords(exprSeg);
        parsed.push(segParsed);
      } else {
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

  const descSegmentReges = /(([a-zA-Z0-9\.]+=\"[^\"]+\")|[a-zA-Z\.0-9\[\]]+)/g;

  function parseDescriptionKeywords(exprSeg) {
    let output = {};
    let parsed = exprSeg.match(descSegmentReges);
    if (!parsed) {
      console.error(`Wrong description keyword expression: ${exprSeg}.`);
    }
    parsed.forEach((p, i) => {
      output.type = 'keyword';
      if (i == 0) {
        if (descriptionKeywords.includes(p)) output.key = p;
        else if (p.match(/domain\[[0-9]+\]/g)) output.key = p;
        else console.error(`Unidentifiable keyword: ${p}.`);
      } else {
        let ps = p.split("=");
        let value = ps[1].replace(/\"/gi, '');
        if (ps[0] === "duration") {
          output.duration = parseFloat(value);
        } else if (ps[0] === "first") {
          output.first = parseInt(value);
        } else if (ps[0] === "last") {
          output.last = parseInt(value);
        } else if (ps[0] === "item") {
          if (descriptionKeywords.includes(value)) {
            output.item = { keyword: value };
          } else if (value.match(/domain\[[0-9]+\]/g)) {
            output.item = { keyword: value };
          } else {
            output.item = { literal: value.split(",").map(d => d.trim()) };
          }
        } else if (ps[0] === "value") {
          if (descriptionKeywords.includes(value)) {
            output.value = { keyword: value };
          } else if (value.match(/domain\[[0-9]+\]/g)) {
            output.value = { keyword: value };
          } else {
            output.value = { literal: value };
          }
        } else if (ps[0] === "values") {
          let valueItems = value.split(",").map(d => d.trim());
          output.value = [];
          valueItems.forEach(item => {
            if (descriptionKeywords.includes(item)) {
              output.value.push({ keyword: item });
            } else if (item.match(/domain\[[0-9]+\]/g)) {
              output.value.push({ keyword: item });
            } else {
              output.value.push({ literal: item });
            }
          });
        } else if (ps[0].match(/v[0-9]+/g)?.length == 1) {
          if (!output.value) output.value = [];
          let vi = parseInt(ps[0].substring(1));
          if (descriptionKeywords.includes(value)) {
            output.value[vi] = { keyword: value };
          } else if (value.match(/domain\[[0-9]+\]/g)) {
            output.value[vi] = { keyword: value };
          } else {
            output.value[vi] = { literal: value };
          }
        } else {
          if (descriptionKeywords.includes(value)) {
            output[ps[0]] = { keyword: value };
          } else if (value.match(/domain\[[0-9]+\]/g)) {
            output[ps[0]] = { keyword: value };
          } else {
            output[ps[0]] = { literal: value };
          }
        }
      }
    });
    return output;
  }

  function makeScaleDescription(scale, encoding, dataInfo, tickDef, tone_spec, config, beat) {
    let properties = scale.properties;
    let channel = properties.channel; properties.field; let encodingType = properties.encodingType;
    let timeUnit = config?.timeUnit?.unit || 'seconds';

    if (properties?.descriptionDetail === SKIP || properties?.descriptionDetail === null) {
      return null;
    }

    let expression = '', customExpression = false;

    if (jType(properties?.descriptionDetail) === 'String' && properties?.descriptionDetail !== NONSKIP) {
      expression = properties?.descriptionDetail;
      customExpression = true;
      return [{
        type: TextType, speech: properties?.descriptionDetail, speechRate
      }]
    }

    let speechRate = config.speechRate || DEF_SPEECH_RATE;
    let title = encoding?.scale.title || listString(unique(properties.field), ", ", false);

    if (channel === TIME_chn) {
      if (!customExpression) expression = `The <title> is mapped to <channel>. `;
      let length = properties.range ? Math.max(...properties.range) : null;
      if (length) {
        if (!customExpression) expression += `The duration of the stream is <range.length> <timeUnit>. `;
      }
      if (properties.binned) {
        let binInfo = encoding.binned;
        if (binInfo.equiBin) {
          if (!customExpression) expression += `Each sound represents a equally sized bin bucket. `;
        } else {
          if (!customExpression) expression += `The length of each sound represents the corresponding bin bucket size. `;
        }
      }
      if (tickDef?.interval && tickDef?.description !== SKIP) {
        if (!customExpression) expression += `A tick sound is played every ${tickDef.interval} ${timeUnit}. `;
      }
    } else {
      if (encodingType === QUANT) {
        if (title && properties.aggregate && properties.aggregate !== 'count') {
          if (!customExpression) expression += `The <title> is mapped to <channel> and aggregated by <aggregate>. `;
        } else if (properties.aggregate === 'count') {
          if (!customExpression) expression = `The count of data points is mapped to <channel>. `;
        } else {
          if (!customExpression) expression = `The <title> is mapped to <channel>. `;
        }
        if (tone_spec.continued) {
          if (properties?.domain?.length == 2) {
            if (!customExpression) expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.6">`;
          } else if (properties?.domain?.length > 2) {
            if (!customExpression) expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound values="${properties.domain.map((_, i) => 'domain[' + i + ']')}" duration="${properties.domain.length * 0.3}">`;
          }
        } else {
          if (properties?.domain?.length == 2) {
            if (!customExpression) expression += `The minimum value <domain.min> is mapped to <sound value="domain.min" duration="0.3">, and `;
            if (!customExpression) expression += `the maximum value <domain.max> is mapped to <sound value="domain.max" duration="0.3">.`;
          } else if (properties?.domain?.length > 2) {
            if (!customExpression) {
              expression += `<title> values are mapped as`;
              for (let i = 0; i < properties.domain.length; i++) {
                expression += `<domain[${i}]> <sound value="domain[${i}]" duration="0.3">`;
              }
            }
          }
        }
      } else if (encodingType === TMP) {
        if (title && properties.aggregate && properties.aggregate !== 'count') {
          if (!customExpression) expression += `The <title> is mapped to <channel> and aggregated by <aggregate>. `;
        } else if (properties.aggregate === 'count') {
          if (!customExpression) expression += `The count of data points is mapped to <channel>. `;
        } else {
          if (!customExpression) expression += `The <title> is mapped to <channel>. `;
        }
        if (tone_spec.continued) {
          if (!customExpression) expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.6">. `;
        } else {
          if (!customExpression) expression += `The minimum value <domain.min> is mapped to <sound value="domain.min" duration="0.5">, and `;
          if (!customExpression) expression += `the maximum value <domain.max> is mapped to <sound value="domain.max" duration="0.5">. `;
        }
      } else if (encodingType === ORD || encodingType === NOM) {
        if (!customExpression) expression += `The <title> is mapped to <channel>. `;
        let domainCount = properties.domain.length;
        if (domainCount <= 6 || properties.playAllDescription) {
          for (let i = 0; i < domainCount; i++) {
            if (!customExpression) expression += `The value <domain[${i}]> is <sound value="domain[${i}]" duration="0.3">. `;
          }
        } else {
          if (!customExpression) expression += `The first value <domain[${0}]> is <sound value="domain[${0}]" duration="0.3">. `;
          if (!customExpression) expression += `The second value <domain[${1}]> is <sound value="domain[${1}]" duration="0.3">. `;
          if (!customExpression) expression += `The second last value <domain[${domainCount - 2}]> is <sound value="domain[${domainCount - 2}]" duration="0.3">. `;
          if (!customExpression) expression += `The last value <domain[${domainCount - 1}]> is <sound value="domain[${domainCount - 1}]" duration="0.3">. `;
        }
      } else if (encodingType === STATIC) {
        if (properties.conditions) {
          for (const cond of properties.conditions) {
            if (jType(cond.test) === 'Array') {
              if (!customExpression) expression += `The values of <list item="${cond.test.join(',')}" join=", "> are mapped to <sound value="${cond.test[0]}" duration="0.3>. `;
            } else if (cond.test?.not && jType(cond.test.not) === 'Array') {
              if (!customExpression) expression += `The values that are not <list item="${cond.test.not.join(',')}" join=", "> are mapped to <sound value="${cond.test.not[0]}" duration="0.3>. `;
            } else if (cond.test && cond.name) {
              let d = cond.test[0] || cond.test.not?.[0];
              if (!customExpression && d !== undefined) expression += `${cond.name} values are mapped to <sound value="${d}" duration="0.3>. `;
            }
          }
        }
      }
    }

    let parsedExprDesc = compileDescriptionMarkup(expression, channel, scale, speechRate, timeUnit);
    let descList = [];
    for (const pDesc of parsedExprDesc) {
      if (pDesc.type === TextType) {
        descList.push({
          type: TextType,
          speech: pDesc.text,
          speechRate: pDesc.speechRate || speechRate
        });
      } else if (pDesc.type === 'sound') {
        if (pDesc.continuous) {
          let sounds = makeConinuousAudioLegend(channel, pDesc.value, scale, pDesc.duration);
          descList.push({
            type: ToneSeries, channel, sounds, instrument_type: tone_spec?.type || "default", continued: true
          });
        } else {
          let sound = makeSingleDiscAudioLegend(channel, pDesc.value, scale, pDesc.duration);
          descList.push({
            type: ToneType,
            sound,
            instrument_type: tone_spec?.type || "default"
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
      sounds.push({
        start: timing(d),
        [channel]: scale(d),
        duration: (i == domain.length - 1 ? 0.15 : 0)
      });
      i++;
    }
    return sounds;
  }

  function makeSingleDiscAudioLegend(channel, value, scale, duration) {
    let sound = {
      start: 0,
      [channel]: scale(value),
    };
    if (sound.duration == undefined) {
      sound.duration = duration || 0.2;
    }

    return sound;
  }

  const ForceRepeatScale = 'forceRepeatScale',
    PlayAt = 'playScaleAt',
    BeforeAll = 'beforeAll',
    BeforeThis = 'beforeThis',
    AfterAll = 'afterAll',
    AfterThis = 'afterThis';

  class SequenceStream {
    constructor() {
      this.streams = [];
      this.playing = false;
      this.status = undefined;
      this.prerendered = false;
      this.config = {};
      this.synths = [];
      this.samplings = [];
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

    async prerender() {
      this.queue = new AudioGraphQueue();
      if (this.config) {
        Object.keys(this.config).forEach((key) => {
          this.queue.setConfig(key, this.config[key]);
        });
      }
      this.queue.setSampling(this.samplings);
      this.queue.setSynths(this.synths);
      this.queue.setWaves(this.waves);

      if (!this.config.skipStartSpeech) {
        this.queue.add(TextType, { speech: `To stop playing the sonification, press the X key. `, speechRate: this.config?.speechRate }, this.config);
      }

      // 1. main title && description
      // in case of a separate intro stream
      if (this.introStream) {
        this.introStream.stream.forEach((d) => {
          this.queue.add(TextType, { speech: d.speech, speechRate: this.config?.speechRate }, this.config);
        });
      } else {
        if (this.title && !this.config.skipTitle) {
          this.queue.add(TextType, { speech: `${this.title}. `, speechRate: this.config?.speechRate }, this.config);
        } else if (this.name && !this.config.skipTitle) {
          this.queue.add(TextType, { speech: `This sonification is about ${this.name}. `, speechRate: this.config?.speechRate }, this.config);
        }
        if (this.description && !this.config.skipDescription) {
          this.queue.add(TextType, { speech: this.description, speechRate: this.config?.speechRate }, this.config);
        }
      }

      // 2. making queues
      let titles_queues = [], scales_queues = [], audio_queues = [], announced_scales = [];

      let multiSeq = this.streams.length > 1;
      if (multiSeq && !this.config.skipSquenceIntro) {
        this.queue.add(TextType, { speech: `This sonification sequence consists of ${this.streams.length} parts. `, speechRate: this.config?.speechRate }, this.config);
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
          } else if (!stream.config.skipSequenceTitle) {
            title_queue.add(TextType, { speech: `Stream ${oi + 1}. `, speechRate }, _c);
          }
          if (stream.description && !stream.config.skipSequenceDescription) {
            title_queue.add(TextType, { speech: stream.description, speechRate }, _c);
          }
          titles_queues.push(title_queue);
        } else {
          titles_queues.push(new AudioGraphQueue());
        }

        let determiner = 'This';
        if (multiSeq) determiner = "The " + toOrdinalNumbers(oi + 1);

        if (jType(stream) !== OverlayStream.name && !_c.skipScaleSpeech) {
          let scale_text = stream.make_scale_text().filter((d) => d);
          let scales_to_announce = [];
          let forceRepeat = _c[ForceRepeatScale];
          if (!forceRepeat) forceRepeat = false;
          for (const item of scale_text) {
            if (item.description) {
              if (!announced_scales.includes(item.id)) {
                scales_to_announce.push(...item.description);
                announced_scales.push(item.id);
              } else if (forceRepeat === true || forceRepeat?.[item.channel] === true) {
                scales_to_announce.push(...item.description);
              }
            }
          }

          if (scales_to_announce.length > 0) {
            let scales_queue = new AudioGraphQueue();
            scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, _c);
            scales_queue.addMulti(scales_to_announce, { ..._c, tick: null });
            scales_queues.push(scales_queue);
          } else {
            scales_queues.push(null);
          }
        } else if (jType(stream) === OverlayStream.name) {
          // each overlay title
          if (!_c.skipTitle) titles_queues[oi].add(TextType, { speech: `${determiner} stream has ${stream.overlays.length} overlaid sounds. `, speechRate }, _c);

          let forceRepeat = _c[ForceRepeatScale];
          if (!forceRepeat) forceRepeat = false;
          let scale_init_text_added = false;
          let scales_queue = new AudioGraphQueue();

          stream.overlays.forEach((overlay, li) => {
            let __c = deepcopy(_c || {});
            Object.assign(__c, overlay.config || {});
            let speechRate = __c.speechRate;
            if (__c.playRepeatSequenceName !== false && overlay.title && !__c.skipOverlayTitle) {
              titles_queues[oi].add(TextType, { speech: `Overlay ${li + 1}. ${overlay.title}. `, speechRate }, __c);
            } else if (__c.playRepeatSequenceName !== false && overlay.name && !__c.skipOverlayTitle) {
              titles_queues[oi].add(TextType, { speech: `Overlay ${li + 1}. ${overlay.name}. `, speechRate }, __c);
            }
            if (overlay.description && !__c.skipOverlayDescription) {
              titles_queues[oi].add(TextType, { speech: overlay.description, speechRate }, __c);
            }

            let scale_text = stream.make_scale_text(li).filter((d) => d);
            let scales_to_announce = [];
            for (const item of scale_text) {
              if (item.description) {
                if (!announced_scales.includes(item.id)) {
                  scales_to_announce.push(...item.description);
                  announced_scales.push(item.id);
                } else if (forceRepeat === true || forceRepeat?.[item.channel] === true) {
                  scales_to_announce.push(...item.description);
                }
              }
            }

            if (scales_to_announce.length > 0) {
              if (!forceRepeat && !scale_init_text_added) {
                scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, __c);
                scale_init_text_added = true;
              } else {
                let determiner2 = 'This';
                if (multiSeq && li > 1) determiner2 = "The " + toOrdinalNumbers(li);
                scales_queue.add(TextType, { speech: `${determiner2} overlay has the following sound mappings. `, speechRate }, __c);
              }
              scales_queue.addMulti(scales_to_announce, { ...__c, tick: null });
            }
          });
          if (scales_queue.queue.length > 0) {
            scales_queues.push(scales_queue);
          } else {
            scales_queues.push(null);
          }
        }
        oi++;
      }

      // 3. Prerender subqueues
      for (const stream of this.streams) {
        let prerender_series = await stream.prerender(true);
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

        if (titles_queues[streamIndex]) this.queue.addQueue(titles_queues[streamIndex]);

        let scalePlayAt = _c[PlayAt];
        if (scalePlayAt === BeforeAll) {
          if (scales_queues[streamIndex]) preadd.push(scales_queues[streamIndex]);
        } else if (scalePlayAt === BeforeThis || !scalePlayAt) {
          if (scales_queues[streamIndex]) this.queue.addQueue(scales_queues[streamIndex]);
        }


        let prerender_series = audio_queues[streamIndex];
        if (!_c.skipStartPlaySpeech) {
          this.queue.add(TextType, { speech: `Start playing. `, speechRate }, _c);
        }
        if (jType(prerender_series) === AudioGraphQueue.name) {
          this.queue.addMulti(prerender_series.queue, _c);
        } else {
          this.queue.add(ToneSeries, prerender_series, _c);
        }

        if (scalePlayAt === AfterAll) {
          if (scales_queues[streamIndex]) postadd.push(scales_queues[streamIndex]);
        } else if (scalePlayAt === AfterThis) {
          if (scales_queues[streamIndex]) this.queue.addQueue(scales_queues[streamIndex]);
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
        for (const pq of preadd) {
          this.queue.addQueue(pq);
        }
      }

      if (!this.config.skipFinishSpeech) {
        this.queue.add(TextType, { speech: "Finished.", speechRate: this.config?.speechRate }, this.config);
      }

      this.prerendered = true;
      this.queue.setConfig('options', this.config.options);
      return this.queue;
    }

    make_scale_text(i, channel) {
      if (i === undefined) {
        return this.streams.map((stream) => {
          return stream.make_scale_text(channel)
        }).flat();
      } else {
        return this.streams[i]?.make_scale_text(channel);
      }
    }

    // needs test
    async prerenderScale(i, channel) {
      let scaleQueue = (this.make_scale_text(i, channel) || []).map((d) => d.description).flat();
      this.scaleQueue = new AudioGraphQueue();
      this.scaleQueue.addMulti(scaleQueue, { ...this.config, tick: null });
      return this.scaleQueue;
    }

    async playScaleDescription(i, channel) {
      await this.prerenderScale(i, channel);
      await this.scaleQueue?.play();
    }
    async stopScaleDescription() {
      this.scaleQueue?.stop();
    }

    async playQueue() {
      if (!this.prerendered) await this.prerender();
      await this.queue?.play();
    }

    async stopQueue() {
      this.queue?.stop();
    }

    destroy() {
      this.queue = this.queue.destroy();
    }
  }

  class OverlayStream {
    // todoL change to queue format
    constructor() {
      this.overlays = [];
      this.playing = false;
      this.status = undefined;
      this.prerendered = false;
      this.individual_playing = [];
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

    async prerender(subpart) {
      this.queue = new AudioGraphQueue();
      // order: scale > title--repeated

      // main title & description
      if (!subpart) {
        if (this.title && !this.config.skipTitle) {
          this.queue.add(TextType, { speech: this.title, speechRate: this.config?.speechRate }, this.config);
        } else if (this.name && !this.config.skipTitle) {
          this.queue.add(TextType, { speech: this.name, speechRate: this.config?.speechRate }, this.config);
        }
        if (this.description && !this.config.skipDescription) {
          this.queue.add(TextType, { speech: this.description, speechRate: this.config?.speechRate }, this.config);
        }
      }


      // overlay descriptions
      if (this.overlays.length > 1) {
        if (!subpart && !this.config.skipStartSpeech) {
          this.queue.add(TextType, { speech: `This sonification has ${this.overlays.length} overlaid streams.`, speechRate: this.config?.speechRate });

          let oi = 1;
          let titles_queues = [], scales_queues = [], scale_count = 0;
          for (const stream of this.overlays) {

            let title_queue = new AudioGraphQueue();

            if ((stream.title || stream.name) && !stream.config.skipTitle) {
              title_queue.add(TextType, { speech: `The ${toOrdinalNumbers(oi)} overlay stream is about ${(stream.title || stream.name)}. `, speechRate: this.config?.speechRate }, stream.config);
            }
            if (stream.description && !stream.config.skipDescription) {
              title_queue.add(TextType, { speech: stream.description, speechRate: this.config?.speechRate }, stream.config);
            }
            titles_queues.push(title_queue);

            let scale_text = stream.make_scale_text().filter((d) => d);
            if (!stream.config.skipScaleSpeech && scale_text.length > 0) {
              let scales_queue = new AudioGraphQueue();
              scales_queue.add(TextType, { speech: `This stream has the following sound mappings. `, speechRate: this.config?.speechRate }, stream.config);
              scales_queue.addMulti(scale_text, { ...stream.config, tick: null });
              scale_count++;
              scales_queues.push(scales_queue);
            }
            oi++;
          }
          if (scale_count > 1) {
            for (let i = 0; i < oi - 1; i++) {
              if (titles_queues[i]) this.queue.addQueue(titles_queues[i]);
              if (scales_queues[i]) this.queue.addQueue(scales_queues[i]);
            }
          } else {
            for (let i = 0; i < oi - 1; i++) {
              if (titles_queues[i]) this.queue.addQueue(titles_queues[i]);
            }
            for (let i = 0; i < oi - 1; i++) {
              if (scales_queues[i]) this.queue.addQueue(scales_queues[i]);
            }
          }
        }
      }

      let overlays = [];
      this.overlays.forEach(async (stream, i) => {
        overlays.push(await stream.prerender());
      });

      this.queue.add(ToneOverlaySeries,
        { overlays }
      );

      this.prerendered = true;

      return this.queue;
    }


    make_scale_text(i, channel) {
      if (i !== undefined) {
        let stream = this.overlays[i];
        if (stream && !stream.config.skipScaleSpeech) return stream.make_scale_text(channel);
        else return [];
      } else {
        return this.overlays.map((stream) => {
          if (!stream.config.skipScaleSpeech) return stream.make_scale_text(channel);
          else return [];
        }).flat();
      }
    }

    async playQueue() {
      if (!this.prerendered) await this.prerender();
      this.queue?.play();
    }

    async stopQueue() {
      this.queue?.stop();
    }
  }

  class UnitStream {
    constructor(instrument_type, stream, scales, opt) {
      this.instrument_type = instrument_type;
      this.stream = stream;
      this.option = opt || {};
      this.instrument;
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
      let text = [];
      let identifier = (i !== undefined ? `The ${toOrdinalNumbers(i + 1)}` : `This`);
      if (this.name) text.push({ type: TextType, speech: `${identifier} stream is for ${this.name} layer and has a tone of`, speechRate: this.config?.speechRate });
      else text.push({ type: TextType, speech: `${identifier} stream has a tone of`, speechRate: this.config?.speechRate });
      text.push({ type: ToneType, sound: { pitch: DefaultFrequency, duration: 0.2, start: 0 }, instrument_type: this.instrument_type });
      return text;
    }

    make_scale_text(channel) {
      let scales = this.scales;
      let text = Object.keys(scales)
        .filter((chn) => ((!channel && !OmitDesc.includes(chn)) || chn === channel))
        .map((channel) => {
          return {
            id: scales[channel]?.scaleId,
            channel,
            description: scales[channel]?.description
          };
        });
      return text.flat();
    }

    async prerender() {
      return {
        instrument_type: this.instrument_type, sounds: this.stream, continued: this.option?.is_continued, relative: this.option?.relative,
        filters: this.audioFilters,
        ramp: this.ramp,
        duration: this.duration
      };
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

    async prerender() {
      let text = [];
      for (const stream of this.stream) {
        if (stream.speech) {
          text.push({ type: TextType, speech: stream.speech, speechRate: this.config?.speechRate });
        }
      }
      return text;
    }
  }

  const OmitDesc = ['time2'];

  function makeRepeatStreamTree(level, values, directions) {
    let tree = {};
    if (level === undefined) level = 0;
    if (directions.length <= level) return { direction: 'leaf', node: [] };
    let memberships = values.map((v) => v.membership[level]);
    let curr_value_list = [];
    let dir = directions[level];
    tree.direction = dir;
    tree.nodes = [];
    tree.field = memberships[0].key;
    let membership_checked = [];
    for (const member of memberships) {
      if (!membership_checked.includes(member.value)) {
        membership_checked.push(member.value);
        if (!curr_value_list.includes(member.value)) {
          let subValues = values.filter((d) => d[level] === member.value);
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
    flat_streams = flat_streams.nodes.map((s) => {
      if (jType(s) === UnitStream.name) return s;
      else if (s.length == 1) return s[0];
      else if (s.length > 1) {
        let overlay = new OverlayStream();
        overlay.addStreams(s);
        return overlay;
      }
    });
    return flat_streams;
  }

  function postprocessRstreamTree(tree) {
    if (tree.direction === 'leaf') return { nodes: tree.node, dir: 'leaf' };
    else {
      if (tree.direction === OVERLAY) {
        let flat_overlay = [];
        tree.nodes.forEach((node) => {
          let { nodes, dir } = postprocessRstreamTree(node);
          flat_overlay.push(...nodes);
        });
        return { nodes: [flat_overlay.filter(d => d !== undefined)] };
      } else if (tree.direction === SEQUENCE) {
        let flat_seq = [];
        tree.nodes.forEach((node) => {
          let { nodes, dir } = postprocessRstreamTree(node);
          if (dir === OVERLAY) {
            flat_seq.push(nodes);
          } else {
            flat_seq.push(...nodes);
          }
        });
        return { nodes: flat_seq.filter(d => d !== undefined), dir: SEQUENCE };
      }
    }
  }

  async function normalizeSpecification(_spec) {
    let spec = deepcopy(_spec);
    let streams = [],
      datasets = deepcopy(spec.datasets || []),
      synths = deepcopy(spec.synth || []),
      samplings = deepcopy(spec.sampling || []),
      tickDefs = deepcopy(spec.tick || []),
      waves = deepcopy(spec.wave || []),
      scales = [],
      config;
    let used_encodings = [];
    if (isSingleStream(spec)) {
      if (spec.data) {
        let new_data_name = "data__" + (datasets.length + 1);
        datasets.push({
          name: new_data_name,
          ...deepcopy(spec.data)
        });
        spec.data = { name: new_data_name };
      }
      let { normalized, scaleDefinitions } = normalizeSingleSpec(spec, null);
      streams.push({ stream: normalized });
      scales.push(...scaleDefinitions);
      used_encodings.push(...Object.keys(normalized.encoding));
    } else {
      let new_data_name;
      if (spec.data && !spec.data.name) {
        new_data_name = "data__" + (datasets.length + 1);
        datasets.push({
          name: new_data_name,
          ...deepcopy(spec.data)
        });
      }
      if (isOverlayStream(spec)) {
        // (needs verification)
        let overlay = [];
        let h_data, h_data_name;
        if (spec.data && !spec.data.name) {
          h_data = deepcopy(spec.data);
          h_data_name = `data__${(datasets.length + 1)}`;
          datasets.push({ name: h_data_name, ...h_data });
        } else if (spec.data?.name) {
          h_data = deepcopy(spec.data);
        }
        for (const _o of spec.overlay) {
          let o = deepcopy(_o);
          if (h_data && !o.data) {
            if (h_data_name) {
              o.data = { name: h_data_name };
            } else if (!o.data) {
              o.data = h_data;
            }
          } else if (o.data) {
            if (!o.data.name) {
              let dname = `data__${(datasets.length + 1)}`;
              datasets.push({ name: dname, ...o.data });
              o.data = { name: dname };
            }
          }
          if (o.encoding?.time.tick) {
            if (!o.encoding?.time.tick.name || !tickDefs.filter((d) => d.name === o.encoding?.time.tick.name)) {
              let new_tick_name = o.encoding?.time.tick.name || ("tick_" + (tickDefs.length + 1));
              tickDefs.push({
                ...o.encoding?.time.tick,
                name: new_tick_name,
              });
              o.encoding.time.tick = { name: new_tick_name };
            }
          }
          if (!o.data) o.data = { name: new_data_name };
          o.common_transform = deepcopy(spec.transform || []);
          o.transform = deepcopy(_o.transform || []);
          if (!isSingleStream(_o)) console.error("An overlay of multi-stream sequences is not supported!");
          let n = normalizeSingleSpec(o, OVERLAY);
          used_encodings.push(...Object.keys(n.normalized.encoding));
          overlay.push(n.normalized);
          scales.push(...n.scaleDefinitions);
        }
        let config = {};
        Object.assign(config, spec.config);
        normalizeScaleConsistency(config, unique(used_encodings));
        delete config.sequenceScaleConsistency;
        delete config.forceSequenceScaleConsistency;
        streams.push({ overlay, name: spec.name, title: spec.title, description: spec.description, config });
      } else if (isSequenceStream(spec)) {
        let output = [];
        let introSeq = {};
        config = {};
        Object.assign(config, spec.config);
        if (spec.title) {
          introSeq.title = spec.title;
        }
        if (spec.description) {
          introSeq.description = spec.description;
        }
        if (Object.keys(introSeq).length > 0) {
          output.push({ intro: introSeq });
        }
        for (const _o of spec.sequence) {
          let o = deepcopy(_o);
          if (isSequenceStream(_o)) console.error("A sequence of sequence is not supported!");
          if (isSingleStream(o)) {
            if (o.encoding?.time.tick) {
              if (!o.encoding?.time.tick.name || !tickDefs.filter((d) => d.name === o.encoding?.time.tick.name)) {
                let new_tick_name = o.encoding?.time.tick.name || ("tick_" + (tickDefs.length + 1));
                tickDefs.push({
                  ...o.encoding?.time.tick,
                  name: new_tick_name,
                });
                o.encoding.time.tick = { name: new_tick_name };
              }
            }
            if (!o.data) o.data = { name: new_data_name };
            else if (o.data?.values) {
              let new_data_name_2 = "data__" + (datasets.length + 1);
              datasets.push({
                name: new_data_name_2,
                values: deepcopy(o.data.values)
              });
              o.data = { name: new_data_name_2 };
            }
            o.common_transform = deepcopy(spec.transform || []);
            o.transform = deepcopy(_o.transform || []);
            let n = normalizeSingleSpec(o, SEQUENCE);
            scales.push(...n.scaleDefinitions);
            output.push(n.normalized);
            used_encodings.push(...Object.keys(n.normalized.encoding));
          } else if (isOverlayStream(o)) {
            o.id = 'overlay-' + genRid();
            let n = await normalizeSpecification(o);
            let over = n.normalized[0];
            over.id = o.id;
            output.push(over);
            n.scaleDefinitions.forEach((d) => {
              d.parentId = over.id;
            });
            n.normalized[0].overlay.forEach((ov) => {
              used_encodings.push(...Object.keys(ov.encoding));
            });
            scales.push(...n.scaleDefinitions);
            Object.assign(datasets, n.datasets);
            Object.assign(tickDefs, n.tick);
          }
        }
        normalizeScaleConsistency(config, unique(used_encodings));
        delete config.overlayScaleConsistency;
        delete config.forceOverlayScaleConsistency;
        streams.push(...output.map((d) => {
          if (d.intro) {
            return { intro: d.intro }
          } else if (d.overlay) {
            return {
              overlay: d.overlay || d,
              id: d.overlay.id || d.id,
              name: d.overlay.name || d.name,
              title: d.overlay.title || d.title,
              description: d.overlay.description || d.description,
              config: d.config
            }
          } else {
            return { stream: d }
          }
        }));
      }
    }
    let dataset_hash = toHashedObject(datasets, 'name', true);
    let tick_hash = toHashedObject(tickDefs, 'name', true);
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
  }

  function isRepeatedStream(spec) {
    if (spec && spec.encoding && spec.encoding?.repeat) {
      return true;
    }
    return false;
  }

  function isSingleStream(spec) {
    if (spec && spec.encoding && spec.tone && !spec.overlay && !spec.sequence) {
      return true;
    }
    return false;
  }

  function isOverlayStream(spec) {
    if (spec && !spec.encoding && !spec.tone && spec.overlay && !spec.sequence) {
      return true;
    }
    return false;
  }

  function isSequenceStream(spec) {
    if (spec && !spec.encoding && !spec.tone && !spec.overlay && spec.sequence) {
      return true;
    }
    return false;
  }

  const bin_ending = "__bin", bin_end_ending = "__bin_end", count_ending = "__count", Def_tone = "default", Auto = "auto";

  function normalizeSingleSpec(spec, parent) {
    let scaleDefinitions = [];
    if (!spec) return null;
    let is_part_of_overlay = parent === OVERLAY;
    let normalized = {};
    if (spec.title) {
      normalized.title = spec.title;
    }
    if (spec.name) {
      normalized.name = spec.name;
    }
    normalized.id = 'stream-' + genRid();
    if (spec.description) {
      normalized.description = spec.description;
    }
    // data
    if (spec.data) {
      normalized.data = deepcopy(spec.data);
    }
    // tone
    if (spec.tone) {
      normalized.tone = {};
      if (jType(spec.tone) === "String") {
        normalized.tone.type = spec.tone;
      } else if (jType(spec.tone) === "Object") {
        normalized.tone = deepcopy(spec.tone);
        // do anything if needed
        if (normalized.tone.type === undefined) {
          normalized.tone.type = Def_tone;
        }
      }
      if (jType(spec.tone?.filter) === "Array") {
        normalized.filter = [...spec.tone.filter];
      }
    }
    // encoding
    let further_transforms = [];
    let encoding_aggregates = [];
    if (spec.encoding) {
      normalized.encoding = {};
      if (spec.encoding[TIME_chn]?.scale?.timing === SIM_TIMING) {
        if (spec.encoding[SPEECH_BEFORE_chn] && spec.encoding[SPEECH_AFTER_chn]) {
          console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_BEFORE_chn} and ${SPEECH_AFTER_chn} are dropped.`);
          delete spec.encoding[SPEECH_BEFORE_chn];
          delete spec.encoding[SPEECH_AFTER_chn];
        } else if (spec.encoding[SPEECH_BEFORE_chn]) {
          console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_BEFORE_chn} is dropped.`);
          delete spec.encoding[SPEECH_BEFORE_chn];
        } else if (spec.encoding[SPEECH_AFTER_chn]) {
          console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_AFTER_chn} is dropped.`);
          delete spec.encoding[SPEECH_AFTER_chn];
        }
      }
      let has_repeated_overlay = false;
      for (const channel of Object.keys(spec.encoding)) {
        let o_enc = spec.encoding[channel], enc = {};
        if (o_enc.field) enc.field = o_enc.field;
        if (o_enc.type) enc.type = o_enc.type;
        if (o_enc.by) {
          if (jType(o_enc.by) === 'Array' && !o_enc.by.join('X').match(/(^(sequence|sequenceX)*(overlay|overlayX)*$)/gi)) {
            console.error("Wrong repeat-by form. Overlay cannot preceed sequence!");
          }
          enc.by = o_enc.by;
          has_repeated_overlay = enc.by.includes(OVERLAY);
          if (has_repeated_overlay && is_part_of_overlay) {
            console.error("Overlay composition + overlay repet is not supported.");
          }
        }      if (o_enc.ramp && RampMethods.includes(o_enc.ramp)) {
          if (o_enc.ramp.constructor.name === 'String') enc.ramp = o_enc.ramp;
          else enc.ramp = o_enc.ramp ? 'linear' : 'exponential';
        } else {
          enc.ramp = 'linear';
        }
        if (o_enc.speech) enc.speech = o_enc.speech;
        if (o_enc.value !== undefined) enc.value = o_enc.value;
        if (channel === TIME_chn && o_enc.tick) enc.tick = deepcopy(o_enc.tick);
        if (o_enc.scale) {
          enc.scale = deepcopy(o_enc.scale);
        } else {
          enc.scale = {};
        }
        if (o_enc.format) enc.format = o_enc.format;
        if (o_enc.formatType) enc.formatType = o_enc.formatType;
        if (o_enc.bin) {
          if (jType(o_enc.bin) === "Object") {
            further_transforms.push({
              bin: o_enc.field,
              step: o_enc.bin.step,
              maxbins: o_enc.bin.maxbins,
              nice: o_enc.bin.nice,
              as: o_enc.field + bin_ending,
              exact: o_enc.bin.exact,
              end: o_enc.field + bin_end_ending
            });
          } else if (jType(o_enc.bin) === "Boolean") {
            further_transforms.push({
              bin: o_enc.field,
              auto: true,
              as: o_enc.field + bin_ending,
              end: o_enc.field + bin_end_ending
            });
          }
          enc.field = o_enc.field + bin_ending;
          enc.original_field = o_enc.field;
          enc.type = QUANT;
          if (channel === TIME_chn) {
            normalized.encoding[channel + "2"] = {
              field: o_enc.field + bin_end_ending,
            };
          }
          if (!enc.scale) enc.scale = {};
          enc.scale.title = o_enc.field + " (binned)";
          enc.binned = true;
        }
        if (o_enc.aggregate) {
          if (!o_enc.field && o_enc.aggregate === "count") {
            encoding_aggregates.push({
              op: "count",
              as: count_ending
            });
            enc.field = count_ending;
            if (!enc.scale) enc.scale = {};
            enc.scale.title = "Count";
            enc.type = QUANT;
          } else {
            encoding_aggregates.push({
              op: o_enc.aggregate,
              field: o_enc.field,
              as: o_enc.field + "__" + o_enc.aggregate,
              p: o_enc.p
            });
            enc.field = o_enc.field + "__" + o_enc.aggregate;
            enc.original_field = o_enc.field;
            if (!enc.scale) enc.scale = {};
            enc.scale.title = o_enc.aggregate + " " + o_enc.field;
            enc.type = o_enc.type || QUANT;
          }
          enc.aggregate = o_enc.aggregate;
        }
        if (o_enc.condition) {
          enc.condtion = deepcopy(o_enc.condition);
        }
        if (channel === TAPCNT_chn && spec.encoding[TAPSPD_chn]) {
          enc.hasTapSpeed = true;
        } else if (channel === TAPSPD_chn && spec.encoding[TAPCNT_chn]) {
          enc.hasTapCount = true;
        } else if (channel === PITCH_chn && o_enc.roundToNote) {
          enc.roundToNote = true;
        }
        // add to a scale 
        let scaleId = 'scale-' + genRid();
        let scaleDef = {
          id: scaleId,
          channel,
          type: enc.type,
          dataName: normalized.data.name,
          field: [enc.field],
          scale: deepcopy(enc.scale),
          streamID: [normalized.id],
          parentType: parent,
        };
        if (enc.roundToNote) {
          scaleDef.roundToNote = true;
        }
        enc.scale.id = scaleId;
        scaleDefinitions.push(scaleDef);
        normalized.encoding[channel] = enc;
      }
      if (normalized.encoding[TIME2_chn]) {
        normalized.encoding[TIME2_chn].scale = { id: normalized.encoding[TIME_chn]?.scale?.id };
        scaleDefinitions.forEach((d) => {
          if (d.channel === TIME_chn && d.id === normalized.encoding[TIME_chn]?.scale?.id) {
            if (!d.hasTime2) d.hasTime2 = [];
            d.hasTime2.push(normalized.id);
          }
        });
      }
      if (normalized.encoding[REPEAT_chn]) {
        scaleDefinitions.forEach((d) => {
          if (!d.isRepeated) d.isRepeated = [];
          d.isRepeated.push(normalized.id);
        });
      }
      let used_channels = Object.keys(normalized.encoding);
      if (has_repeated_overlay || is_part_of_overlay) {
        if (used_channels.includes(SPEECH_AFTER_chn) || used_channels.includes(SPEECH_BEFORE_chn)) {
          console.warn("Using speechAfter/Before channels for an overlaid stream is not recommended.");
        }
      }
    }
    // transform
    if (spec.common_transform) {
      normalized.common_transform = deepcopy(spec.common_transform);
    }
    if (spec.transform) {
      normalized.transform = deepcopy(spec.transform);
    }
    if (further_transforms.length > 0) {
      if (!normalized.transform) normalized.transform = [];
      normalized.transform.push(...further_transforms);
    }
    if (encoding_aggregates.length > 0) {
      normalized.encoding_aggregates = encoding_aggregates;
      if (!normalized.transform) normalized.transform = [];
      normalized.transform.push({ aggregate: encoding_aggregates, groupby: Auto });
    }
    if (normalized.transform?.length > 0) {
      normalized.transform.forEach((t) => {
        if ((t.boxplot || t.quantile) && !t.groupby) t.groupby = Auto;
      });
    }
    // config
    if (spec.config) {
      let config = {};
      Object.assign(config, spec.config);
      normalized.config = config;

    }
    return { normalized, scaleDefinitions };
  }

  function normalizeScaleConsistency(config, used_channels) {
    let overlayScaleConsistency = {}, forceOverlayScaleConsistency = {}, sequenceScaleConsistency = {}, forceSequenceScaleConsistency = {};
    for (const chn of used_channels) {
      // overlayScaleConsistency
      if (config.overlayScaleConsistency?.[chn] !== undefined) {
        overlayScaleConsistency[chn] = config.overlayScaleConsistency[chn];
      } else if (jType(config.overlayScaleConsistency) === 'Boolean') {
        overlayScaleConsistency[chn] = config.overlayScaleConsistency;
      } else {
        overlayScaleConsistency[chn] = true;
      }
      // forceOverlayScaleConsistency
      if (config.forceOverlayScaleConsistency?.[chn] !== undefined) {
        forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency[chn];
      } else if (jType(config.overlayScaleConsistency) === 'Boolean') {
        forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency;
      } else {
        forceOverlayScaleConsistency[chn] = false;
      }
      // sequenceScaleConsistency
      if (config.sequenceScaleConsistency?.[chn] !== undefined) {
        sequenceScaleConsistency[chn] = config.sequenceScaleConsistency[chn];
      } else if (jType(config.sequenceScaleConsistency) === 'Boolean') {
        sequenceScaleConsistency[chn] = config.sequenceScaleConsistency;
      } else {
        sequenceScaleConsistency[chn] = true;
      }
      // forceOverlayScaleConsistency
      if (config.forceSequenceScaleConsistency?.[chn] !== undefined) {
        forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency[chn];
      } else if (jType(config.overlayScaleConsistency) === 'Boolean') {
        forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency;
      } else {
        forceSequenceScaleConsistency[chn] = false;
      }
    }
    config.overlayScaleConsistency = overlayScaleConsistency;
    config.forceOverlayScaleConsistency = forceOverlayScaleConsistency;
    config.sequenceScaleConsistency = sequenceScaleConsistency;
    config.forceSequenceScaleConsistency = forceSequenceScaleConsistency;
  }

  function filterTable(table, filter) {
    return table.ungroup().filter(`d => ${filter.replace(/datum\./gi, 'd.')}`).reify();
  }

  function makeIndexSortFn(key, order) {
    return (a, b) => {
      let det = order.indexOf(a[key]) - order.indexOf(b[key]);
      if (det != 0) return det;
      return 0;
    }
  }

  function makeAscSortFn(key) {
    return (a, b) => {
      return asc(a[key], b[key]);
    }
  }

  function makeDescSortFn(key) {
    return (a, b) => {
      return desc(a[key], b[key]);
    }
  }

  const fromTidy$3 = aq__namespace.from;

  // Manipulation of Vega to work with AQ;
  function getKernelDensity(table, field, groupby, cumulative, counts, _bandwidth, _extent, _minsteps, _maxsteps, steps, _as) {
    let method = cumulative ? 'cdf' : 'pdf';
    _as = _as || ['value', 'density'];
    let bandwidth = _bandwidth;
    let values = [];
    let domain = _extent;
    let minsteps = steps || _minsteps || 25;
    let maxsteps = steps || _maxsteps || 200;

    if (groupby || groupby?.length > 0) {
      let { groups, names } = aqPartition(table, groupby);
      groups.forEach((group, i) => {
        let g = group.array(field);
        const density = vega.randomKDE(g, bandwidth)[method];
        const scale = counts ? g.length : 1;
        const local = domain || d3.extent(g);
        let curve = vega.sampleCurve(density, local, minsteps, maxsteps);
        curve.forEach(v => {
          const t = {
            [_as[0]]: v[0],
            [_as[1]]: v[1] * scale,
          };
          if (groupby) {
            for (let j = 0; j < groupby.length; ++j) {
              t[groupby[j]] = names[i][j];
            }
          }
          values.push(t);
        });
      });
      return fromTidy$3(values).groupby(groupby);
    } else {
      let g = table.array(field);
      const density = vega.randomKDE(g, bandwidth)[method];
      const scale = counts ? g.length : 1;
      const local = domain || d3.extent(g);
      let curve = vega.sampleCurve(density, local, minsteps, maxsteps);
      curve.forEach(v => {
        const t = {
          [_as[0]]: v[0],
          [_as[1]]: v[1] * scale,
        };
        if (groupby) {
          for (let j = 0; j < groupby.length; ++j) {
            t[groupby[j]] = names[i][j];
          }
        }
        values.push(t);
      });
      return fromTidy$3(values);
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
      let g = fromTidy$3(tab_re.filter((d, i) => p.includes(i)));
      groups.push(g);
      names.push(groupby.map(gb => g.get(gb)));
    });
    return { groups, names };
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

  function doCalculate(table, cal, groupby) {
    let eq = cal.calculate, name_as = cal.as;
    eq = eq.replace(/datum\./gi, 'd.');
    return table.groupby(groupby).derive({
      [name_as]: eq
    });
  }

  function doAggregate(table, aggregates, groupby) {
    let rollups = getRollUps(aggregates);
    return table.groupby(groupby).rollup(rollups);
  }

  function getRollUps(aggregates) {
    let rollups = {};
    for (const agg of aggregates) {
      let name_as = agg.as, field = agg.field, method = agg.op;
      if (method === "mean" || method === "average") {
        rollups[name_as] = `d => op.mean(d['${field}'])`;
      } else if (method === "valid") {
        rollups[name_as] = `d => op.valid(d['${field}'])`;
      } else if (method === "invalid") {
        rollups[name_as] = `d => op.invalid(d['${field}'])`;
      } else if (method === "max") {
        rollups[name_as] = `d => op.max(d['${field}'])`;
      } else if (method === "min") {
        rollups[name_as] = `d => op.min(d['${field}'])`;
      } else if (method === "distinct") {
        rollups[name_as] = `d => op.distinct(d['${field}'])`;
      } else if (method === "sum") {
        rollups[name_as] = `d => op.sum(d['${field}'])`;
      } else if (method === "product") {
        rollups[name_as] = `d => op.product(d['${field}'])`;
      } else if (method === "mode") {
        rollups[name_as] = `d => op.mode(d['${field}'])`;
      } else if (method === "median") {
        rollups[name_as] = `d => op.median(d['${field}'])`;
      } else if (method === "quantile") {
        let p = agg.p || 0.5;
        rollups[name_as] = `d => op.quantile(d['${field}'], ${p})`;
      } else if (method === "stdev") {
        rollups[name_as] = `d => op.stdev(d['${field}'])`;
      } else if (method === "stdevp") {
        rollups[name_as] = `d => op.stdevp(d['${field}'])`;
      } else if (method === "variance") {
        rollups[name_as] = `d => op.variance(d['${field}'])`;
      } else if (method === "variancep") {
        rollups[name_as] = `d => op.variancep(d['${field}'])`;
      } else if (method === "count") {
        rollups[name_as] = `d => op.count()`;
      } else if (method === "corr") {
        rollups[name_as] = `d => op.corr(d['${field[0]}'], d['${field[1]}'])`;
      } else if (method === "covariance") {
        rollups[name_as] = `d => op.covariance(d['${field[0]}'], d['${field[1]}'])`;
      } else if (method === "covariancep") {
        rollups[name_as] = `d => op.covariancep(d['${field[0]}'], d['${field[1]}'])`;
      }
    }
    return rollups;
  }

  function createBin(col, transform) {
    let is_nice = transform.nice;
    if (is_nice === undefined) is_nice = true;
    let maxbins = transform.maxbins || 10;
    let step = transform.step;
    let exact = transform.exact;
    let binFunction = d3.bin(), buckets, binAssigner, equiBin;
    if (is_nice && maxbins && !step) {
      binFunction = binFunction.thresholds(maxbins);
      buckets = binFunction(col);
      equiBin = true;
    } else if (step) {
      maxbins = Math.ceil(d3.extent(col) / step);
      binFunction = binFunction.thresholds(maxbins);
      buckets = binFunction(col);
      equiBin = true;
    } else if (exact) {
      binFunction = binFunction.thresholds(exact);
      buckets = binFunction(col);
      equiBin = false;
    }
    binAssigner = (d) => {
      let ib = buckets.map(b => (b.includes(d) ? { x0: b.x0, x1: b.x1 } : undefined)).filter(b => b != undefined)?.[0];
      return { start: ib?.x0, end: ib?.x1 };
    };
    let binned = col.map(binAssigner);
    let start = binned.map(d => d.start), end = binned.map(d => d.end);
    return { start, end, nBukcets: buckets.length, equiBin };
  }

  const fromTidy$2 = aq__namespace.from;

  function makeBoxPlotTable(_table, field, _extent, _invalid, groupby) {
    if (field) {
      let extent = _extent, invalid = _invalid;
      if (extent === undefined) extent = 1.5;
      if (invalid === undefined) invalid = 'filter';
      let table = _table.reify();
      // 1. get basic stats: min, max, 1Q, median, 3Q;
      if (invalid === 'filter') {
        table = table.filter(`d => !op.is_nan(d['${field}'])`);
      } else {
        table = table.impute({ [field]: () => 0 });
      }
      if (groupby && groupby.length > 0) {
        table = table.groupby(...groupby);
      }
      if (extent === "min-max") {
        let rollup1 = { // median, q1, q3
          median: `d => op.median(d['${field}'])`,
          q1: `d => op.quantile(d['${field}'], 0.25)`,
          q3: `d => op.quantile(d['${field}'], 0.75)`,
          whisker_lower: `d => op.min(d['${field}'])`,
          whisker_upper: `d => op.max(d['${field}'])`
        }, rollup8 = { // get outliers
          outlier_lower: `d => d['${field}'] < d.whisker_lower ? d['${field}'] : null`,
          outlier_upper: `d => d['${field}'] > d.whisker_upper ? d['${field}'] : null`,
          outlier: `d => (d['${field}'] < d.whisker_lower || d['${field}'] > d.whisker_upper) ? d['${field}'] : null`
        };

        // operate the values
        table = table.derive(rollup1)
          .derive(rollup8)
          .select(...groupby, field, 'median', 'q1', 'q3', 'whisker_lower', 'whisker_upper', 'outlier_lower', 'outlier_upper', 'outlier');

      } else if (typeof extent == 'number') {
        let rollup1 = { // median, q1, q3
          median: `d => op.median(d['${field}'])`,
          q1: `d => op.quantile(d['${field}'], 0.25)`,
          q3: `d => op.quantile(d['${field}'], 0.75)`
        }, rollup2 = { // whisker boundary
          whisker_lower_boundary: `d => d.q1 - op.abs(d.q3 - d.q1) * ${extent}`,
          whisker_upper_boundary: `d => d.q3 + op.abs(d.q3 - d.q1) * ${extent}`
        }, rollup3 = { // whisker operation 1
          whisker_lower_diff: `d => d['${field}'] > d.whisker_lower_boundary ? op.abs(d['${field}'] - d.whisker_lower_boundary) : op.abs(op.max(d['${field}']))`,
          whisker_upper_diff: `d => d['${field}'] < d.whisker_upper_boundary ? op.abs(d.whisker_upper_boundary - d['${field}']) : op.abs(op.max(d['${field}']))`
        }, rollup4 = { // whisker operation 2
          whisker_lower_value_check: `d => op.min(d.whisker_lower_diff)`,
          whisker_upper_value_check: `d => op.min(d.whisker_upper_diff)`
        }, rollup5 = { // whisker value marking
          is_whisker_lower: `d => d.whisker_lower_value_check == d.whisker_lower_diff`,
          is_whisker_upper: `d => d.whisker_upper_value_check == d.whisker_upper_diff`
        }, rollup6 = { // get whisker value 1
          whisker_lower_propa: `d => d.is_whisker_lower ? d['${field}'] : - Math.Infinity`,
          whisker_upper_propa: `d => d.is_whisker_upper ? d['${field}'] : Math.Infinity`
        }, rollup7 = { // get whisker value (propagation to all the fields)
          whisker_lower: `d => op.max(d.whisker_lower_propa)`,
          whisker_upper: `d => op.min(d.whisker_upper_propa)`
        }, rollup8 = { // get outliers
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
          .select(...groupby, field, 'median', 'q1', 'q3', 'whisker_lower', 'whisker_upper', 'outlier_lower', 'outlier_upper', 'outlier');
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
      let group_name_assigner = `(d) => ${groupby.map(k => `d['${k}']`).join(` + '_' + `)}`;
      let table_stats = table
        .rollup(rollup_clear)
        .fold([...output_columns])
        .derive({ role: role_assigner, order: order_assigner, group_name: group_name_assigner });
      let records_stats = table_stats.objects();

      // clear the output - outliers
      let rank_assigner = `(d) => op.rank()`;
      let table_outliers = table.filter(d => d.outlier != null)
        .orderby('outlier')
        .derive({ rank: rank_assigner, group_name: group_name_assigner });
      let records_outliers = table_outliers.objects();
      let outlier_counter_lower = {}, outlier_counter_upper = {};
      for (const outlier of records_outliers) {
        let o = {};
        for (const gkey of groupby) {
          o[gkey] = outlier[gkey];
        }
        o.key = 'outlier';
        o.group_name = outlier.group_name;
        o.role = 'outlier';
        o.value = outlier.outlier;
        if (outlier.outlier_lower) {
          if (outlier_counter_lower[outlier.group_name] === undefined) outlier_counter_lower[outlier.group_name] = 0;
          outlier_counter_lower[outlier.group_name] += 1;
          o.order = - outlier_counter_lower[outlier.group_name];
        }
        if (outlier.outlier_upper) {
          if (outlier_counter_upper[outlier.group_name] === undefined) outlier_counter_upper[outlier.group_name] = 0;
          outlier_counter_upper[outlier.group_name] += 1;
          o.order = output_columns.length + outlier_counter_upper[outlier.group_name];
        }      records_stats.push(o);
      }

      // match the data type
      table = fromTidy$2(records_stats).orderby([...groupby, 'order']).groupby(groupby);

      return table.reify();
    } else {
      console.warn("No field was provided for the box plot.");
      return _table;
    }
  }

  const fromTidy$1 = aq__namespace.from;

  function generateQuantiles(_table, field, _n, _step, groupby, _as) {
    if (field) {
      let table = _table.reify();
      let n, step;
      if (_n !== undefined) {
        n = _n;
        step = 1 / n;
      } else if (_step !== undefined && 0 < _step && _step < 1) {
        n = Math.round(1 / _step);
        step = 1 / n;
      }
      if (!n) {
        n = 25;
        step = 1 / 25;
      }
      let asName = [];
      if (_as) {
        asName = _as;
      }
      if (!asName[0]) {
        asName[0] = 'probability';
      }
      if (!asName[1]) {
        asName[1] = 'value';
      }
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
      if (groupby && groupby.length > 0) table = table.groupby(groupby);
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
      return fromTidy$1(new_records);
    } else {
      return _table;
    }
  }

  const fromTidy = aq__namespace.from, escape = aq__namespace.escape, aqTable = aq__namespace.table;

  function transformData(data, transforms, dimensions) {
    let table = fromTidy(data);
    let tableInfo = {};
    if (transforms?.constructor.name === "Array" && transforms.length > 0) {
      for (const transform of transforms) {
        // bin
        if (transform.bin) {
          let old_field_name = transform.bin;
          let new_field_name = transform.as || old_field_name + "__bin";
          if (table.column(new_field_name)) {
            // duplicate binning
            continue;
          }
          let new_field_name2 = transform.end || old_field_name + "__bin_end";
          if (!dimensions.includes(new_field_name)) dimensions.push(new_field_name);
          if (!dimensions.includes(new_field_name2)) dimensions.push(new_field_name2);
          let { start, end, nBuckets, equiBin } = createBin(table.column(old_field_name).data, transform);
          let binned = aqTable({ [new_field_name]: start, [new_field_name2]: end });
          table = table.assign(binned);
          // drop na
          table = table.filter(escape(d => d[new_field_name] !== undefined && d[new_field_name2] !== undefined));
          if (!tableInfo.bin) tableInfo.bin = {};
          tableInfo.bin[old_field_name] = { nBuckets, equiBin };
        }
        // aggregate
        else if (transform.aggregate) {
          let aggregates = transform.aggregate;
          let groupby = transform.groupby || [];
          if (groupby === Auto) {
            groupby = dimensions.filter((d) => table.columnNames().includes(d));
          }
          table = doAggregate(table, aggregates, groupby);
          if (!tableInfo.aggregate) tableInfo.aggregate = {};
          for (const agg of aggregates) {
            let field = agg.field, method = agg.op;
            if (method === "count") {
              tableInfo.aggregate['__count'] = { method, groupby };
            } else {
              tableInfo.aggregate[field] = { method, groupby };
            }
          }
        }
        // calculate
        else if (transform.calculate) {
          // todo
          let groupby = transform.groupby || {};
          if (groupby === Auto) {
            groupby = dimensions;
          }
          table = doCalculate(table, transform, groupby);
        }
        // fold
        else if (transform.fold) {
          table = foldTable(table, transform.fold, transform.by, transform.exclude, transform.as);
        }
        // density
        else if (transform.density) {
          table = getKernelDensity(table,
            transform.density,
            transform.groupby,
            transform.cumulative,
            transform.counts,
            transform.bandwidth,
            transform.extent,
            transform.minsteps,
            transform.maxsteps,
            transform.steps,
            transform.as);
        }
        // filter
        else if (transform.filter) {
          table = filterTable(table, transform.filter);
        }
        // boxplot
        else if (transform.boxplot) {
          let groupby = transform.groupby || [];
          if (groupby === Auto) {
            groupby = dimensions.filter((d) => table.columnNames().includes(d));
          }
          table = makeBoxPlotTable(table, transform.boxplot, transform.extent, transform.invalid, groupby);
        }
        // quantiles
        else if (transform.quantile) {
          let groupby = transform.groupby || [];
          if (groupby === Auto) {
            groupby = dimensions.filter((d) => table.columnNames().includes(d));
          }
          table = generateQuantiles(table, transform.quantile, transform.n, transform.step, groupby, transform.as);
        }
      }
    }
    let output = table.objects();
    output.tableInfo = tableInfo;
    return output;
  }


  function orderArray(data, orders) {
    let outcome, sortFunctions = [];
    for (const ord of orders) {
      let key = ord.key, order = ord.order;
      if (ord.order) {
        let sortFn = makeIndexSortFn(key, order);
        sortFunctions.push(sortFn);
      } else if (ord.sort === "ascending" || ord.sort === true || ord.sort === "asc") {
        let sortFn = makeAscSortFn(key);
        sortFunctions.push(sortFn);
      } else if (ord.sort === "descending" || ord.sort === "desc") {
        let sortFn = makeDescSortFn(key);
        sortFunctions.push(sortFn);
      }
    }
    sortFunctions.reverse();
    if (sortFunctions.length > 0) {
      outcome = data.toSorted((a, b) => {
        for (const fn of sortFunctions) {
          if (fn(a, b) > 0) return 1;
          else if (fn(a, b) < 0) return - 1;
        }
        return 1;
      });
    }
    return outcome || data;
  }

  async function compileSingleLayerAuidoGraph(audio_spec, _data, config, tickDef, common_scales) {
    let layer_spec = {
      name: audio_spec.name,
      encoding: audio_spec.encoding,
      tone: audio_spec.tone || { type: Def_tone }
    };

    let audioFilters = audio_spec.tone?.filter || null;
    if (audioFilters) audioFilters = [...audioFilters];

    if (!_data || !layer_spec.encoding) {
      console.warn("No proper layer spec provided.");
      return undefined;
    }

    // transformations
    let forced_dimensions = Object.keys(layer_spec.encoding).map((d) => {
      let enc = layer_spec.encoding[d];
      if ([NOM, ORD, TMP].includes(enc.type)) {
        return enc.field;
      } else if (d === REPEAT_chn) {
        return enc.field;
      }
    }).filter((d) => d).flat();

    let data;
    if (audio_spec.common_transform) {
      data = transformData(_data, [...(audio_spec.common_transform || []), ...(audio_spec.transform || [])], forced_dimensions);
    } else {
      data = transformData(_data, audio_spec.transform || [], forced_dimensions);
    }
    let dataInfo = deepcopy(data.tableInfo);

    // encoding properties
    let encoding = layer_spec.encoding;
    let tone_spec = layer_spec.tone;
    if (tone_spec.type === "default") {
      tone_spec = {
        type: 'default',
        continued: tone_spec.continued
      };
    }
    let channels = Object.keys(encoding).filter((c) => ![TIME_chn, TIME2_chn, TIMBRE_chn].includes(c));
    let hasTime2 = (encoding[TIME_chn] && encoding[TIME2_chn]);
    let is_repeated = encoding[REPEAT_chn] !== undefined;
    let has_repeat_speech = is_repeated && encoding[REPEAT_chn].speech;
    if (has_repeat_speech === undefined) has_repeat_speech = true;
    let repeat_field = is_repeated ? encoding[REPEAT_chn].field : undefined;
    if (repeat_field && jType(repeat_field) !== 'Array') repeat_field = [repeat_field];
    let repeat_direction = encoding[REPEAT_chn]?.by;
    if (is_repeated) {
      if (repeat_direction === undefined) repeat_direction = SEQUENCE;
      if (jType(repeat_direction) !== 'Array') repeat_direction = [repeat_direction];
      if (repeat_field.length !== repeat_direction.length) {
        if (repeat_direction.length == 1) {
          repeat_direction = repeat_field.map(() => repeat_direction[0]);
        } else {
          console.error("The repeat direction is not matched with the repeat field(s)");
        }
      }
    }

    // data sort
    let data_order = [];
    if (TIME_chn in encoding && encoding[TIME_chn].scale?.order) {
      data_order.push({
        key: encoding[TIME_chn].field, order: [encoding[TIME_chn].scale?.order]
      });
    } else if (TIME_chn in encoding && encoding[TIME_chn].scale?.sort) {
      data_order.push({
        key: encoding[TIME_chn].field, sort: encoding[TIME_chn].scale?.sort
      });
    } else if (TIME_chn in encoding) {
      data_order.push({
        key: encoding[TIME_chn].field, order: unique(data.map(d => d[encoding[TIME_chn].field])).toSorted(asc)
      });
    }

    if (is_repeated && encoding[REPEAT_chn].scale?.order) {
      data_order.push({
        key: repeat_field, order: encoding[REPEAT_chn].scale?.order
      });
    } else if (is_repeated && encoding[REPEAT_chn].scale?.sort) {
      data_order.push({
        key: repeat_field, sort: encoding[REPEAT_chn].scale?.sort
      });
    } else if (is_repeated) {
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

    if (is_repeated) {
      repeat_level = repeat_field.length;
      repeat_values = unique(data.map((d) => repeat_field.map((k) => d[k]).join("_$_"))).map((d) => d.split("_$_"));
      repeat_values.forEach((d) => {
        let g = [];
        g.name = listString(d, ", ", true);
        g.membership = [];
        repeat_field.forEach((f, i) => {
          g.membership.push({ key: f, value: d[i] });
        });
        d.membership = g.membership;
        repeated_graph.push(g);
        repeated_graph_map[d.join("&")] = repeated_graph.length - 1;
      });
    }

    // get scales
    let scales = {};
    for (const channel in encoding) {
      let enc = encoding[channel];
      scales[channel] = common_scales[enc.scale.id];
    }

    // relativity
    let relative_stream = encoding[TIME_chn].scale.timing === REL_TIMING || scales.time?.properties?.timing === REL_TIMING;

    // ramping
    let ramp = {};
    for (const channel in encoding) {
      ramp[channel] = encoding[channel].ramp;
    }

    // tick
    let hasTick = encoding[TIME_chn].tick !== undefined, tick;
    if (hasTick) {
      let tickItem = encoding[TIME_chn].tick;
      if (tickItem.name && tickDef[tickItem.name]) {
        tick = tickDef[tickItem.name];
      } else {
        tick = tickItem;
      }
      tick = deepcopy(tick);

      // time unit conversion
      if (common_scales.__beat) {
        tick.interval = tick.interval ? common_scales.__beat.converter(tick.interval) : Def_Tick_Interval_Beat;
        tick.band = tick.band ? common_scales.__beat.converter(tick.band) : Def_Tick_Duration_Beat;
      } else {
        if (!tick.interval) tick.interval = Def_Tick_Interval;
        if (!tick.band) tick.band = Def_Tick_Duration;
      }
    }

    if (common_scales) {
      // generate scale text
      let scaleDescOrder = config?.scaleDescriptionOrder || ScaleDescriptionOrder;
      let __config = deepcopy(config);
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
      if (i === 'tableInfo') continue;
      let datum = data[i];
      // if (datum[encoding[TIME_chn].field] !== undefined) continue;
      let repeat_index = is_repeated && repeated_graph_map[repeat_field.map(k => datum[k]).join("&")];
      let glyph = scales.time(
        (datum[encoding[TIME_chn].field] !== undefined ? datum[encoding[TIME_chn].field] : parseInt(i)),
        (hasTime2 ?
          (datum[encoding[TIME2_chn].field] !== undefined ? datum[encoding[TIME2_chn].field] : (parseInt(i) + 1))
          : undefined)
      );
      if (tone_spec.continued && !hasTime2) {
        delete glyph.end;
        glyph.duration = 0;
      }
      if (glyph.start === undefined) continue;
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
          language: encoding[SPEECH_BEFORE_chn]?.language ? encoding[SPEECH_BEFORE_chn]?.language : document?.documentElement?.lang
        };
      }
      if (glyph[SPEECH_AFTER_chn]) {
        speechAfter = {
          speech: glyph[SPEECH_AFTER_chn],
          start: glyph.start,
          end: glyph.end,
          language: encoding[SPEECH_BEFORE_chn]?.language ? encoding[SPEECH_BEFORE_chn]?.language : document?.documentElement?.lang
        };
      }
      if (speechBefore) {
        if (is_repeated) repeated_graph[repeat_index].push(speechBefore);
        else audio_graph.push(speechBefore);
      }
      glyph.__datum = datum;
      let endTime = 0;
      if (glyph.end) {
        endTime = glyph.end + (glyph.postReverb || 0);
      } else if (glyph.duration) {
        endTime = (glyph.start || 0) + glyph.duration + (glyph.postReverb || 0);
      }
      if (is_repeated) {
        repeated_graph[repeat_index].push(glyph);
        repeat_total_duration[repeat_index] = Math.max(repeat_total_duration[repeat_index], endTime);
      } else {
        audio_graph.push(glyph);
        total_duration = Math.max(total_duration, endTime);
      }
      if (speechAfter) {
        if (is_repeated) repeated_graph[repeat_index].push(speechAfter);
        else audio_graph.push(speechAfter);
      }
    }
    let is_continued = tone_spec.continued === undefined ? false : tone_spec.continued;
    let instrument_type = tone_spec.type || 'default';

    // repetition control
    let stream;
    if (is_repeated) {
      let repeat_streams = makeRepeatStreamTree(0, repeat_values, repeat_direction);
      repeated_graph.forEach((g, i) => {
        let r_stream = new UnitStream(instrument_type, g, scales, { is_continued, relative: relative_stream });
        r_stream.duration = repeat_total_duration[i];
        Object.keys(config || {}).forEach(key => {
          r_stream.setConfig(key, config?.[key]);
        });
        if (g.name) r_stream.setName(g.name);
        if (has_repeat_speech) r_stream.setConfig("playRepeatSequenceName", true);
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
        rs_accessor.node.push(r_stream);
      });
      // post_processing
      let processed_repeat_stremas = postprocessRepeatStreams(repeat_streams);
      processed_repeat_stremas.forEach((s, i) => {
        if (!s) { console.warn("empty repeat stream", s); }
        if (has_repeat_speech && s.setConfig) s.setConfig("playRepeatSequenceName", true);
        if (i > 0) {
          s.setConfig("skipScaleSpeech", true);
          s.setConfig("skipStartSpeech", true);
        } else {
          s.setConfig(PlayAt, BeforeAll);
        }
        if (i < processed_repeat_stremas.length - 1) {
          s.setConfig("skipFinishSpeech", true);
        }
        if (hasTick) {
          s.setConfig("tick", tick);
        }
        if (jType(s) === OverlayStream.name) {
          Object.assign(s.config, s.overlays[0].config);
          s.duration = Math.max(...s.overlays.map((d) => d.duration));
          s.overlays.forEach((o, i) => {
            if (o.setConfig) {
              o.setConfig("playRepeatSequenceName", false);
              if (i == 0) {
                o.setConfig("skipScaleSpeech", false);
                o.setConfig("skipStartSpeech", false);
              } else {
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
        if (audioFilters) s.setFilters(audioFilters);
      });
      stream = processed_repeat_stremas;
    }
    // if not repeated
    else {
      stream = new UnitStream(instrument_type, audio_graph, scales, { is_continued, relative: relative_stream });
      stream.duration = total_duration;
      Object.keys(config || {}).forEach(key => {
        stream.setConfig(key, config?.[key]);
      });
      if (hasTick) {
        stream.setConfig("tick", tick);
      }
      if (layer_spec.name) stream.setName(layer_spec.name);
      if (audioFilters) stream.setFilters(audioFilters);
      stream.setRamp(ramp);
      if (audio_spec.description) stream.setDescription(audio_spec.description);
    }
    return { stream, scales };
  }

  async function getDataWrap(dataDef, loaded_datasets, datasets) {
    let data;
    if (dataDef.values) {
      return deepcopy(dataDef.values);
    } else if (dataDef.name) {
      if (!loaded_datasets[dataDef.name]) {
        loaded_datasets[dataDef.name] = await getData(datasets[dataDef.name]);
      }
      data = deepcopy(loaded_datasets[dataDef.name]);
    } else {
      data = await getData(dataDef.name);
    }
    return data;
  }

  async function getData(data_spec) {
    if (data_spec?.values) {
      return data_spec.values;
    } else if (data_spec?.csv) {
      return d3.csvParse(data_spec?.csv);
    } else if (data_spec?.tsv) {
      return d3.tsvParse(data_spec.tsv);
    } else if (data_spec?.url) {
      let read = await (await fetch(data_spec.url)).text();
      if (isJSON(read)) {
        return JSON.parse(read);
      } else if (isCSV(read)) {
        return d3.csvParse(read);
      } else if (isTSV(read)) {
        return d3.tsvParse(read);
      }
    } else {
      console.error("wrong data format provided");
      return []
    }
  }

  function applyTransforms(data, spec) {
    // transformations
    let forced_dimensions = Object.keys(spec.encoding).map((d) => {
      let enc = spec.encoding[d];
      if ([NOM, ORD, TMP].includes(enc.type)) {
        return enc.field;
      } else if (d === REPEAT_chn) {
        return enc.field;
      }
    }).filter((d) => d);

    data = transformData(data, [...(spec.common_transform || []), ...(spec.transform || [])], unique(forced_dimensions));
    return data;
  }

  const QuantPreferredRange$1 = {
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
      'F3', 'F4', 'F5', 'F6'].map(noteToFreq$1),
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
    let pLen = pallete?.length;
    if (pLen >= len) {
      return pallete.slice(0, len);
    } else {
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

  function makeNominalScaleFunction(channel, encoding, values, info) {
    let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
    let extraChannelType = FilterExtraChannelTypes[channel]?.type;
    const CHN_CAP_MAX = ChannelCaps[channel]?.max || ChannelCaps[extraChannelType]?.max,
      CHN_CAP_MIN = ChannelCaps[channel]?.min || ChannelCaps[extraChannelType]?.min;
    let scaleDef = encoding?.scale;
    let scaleProperties = {
      channel,
    };

    // domain
    let domain = deepcopy(scaleDef?.domain || null);
    if (!domain) {
      domain = unique(values);
    }

    scaleProperties.domain = domain;
    // range
    let range = deepcopy(scaleDef?.range || null);
    let rangeProvided = scaleDef?.range !== undefined;
    if (times && !rangeProvided) {
      range = domain.map(d => d * times);
      scale.properties.times = times;
    }
    if (!rangeProvided && channel !== REPEAT_chn) {
      range = repeatPallete(NomPalletes[channel] || NomPalletes[extraChannelType], domain.length);
    } else if (channel === REPEAT_chn) {
      range = domain.map((d, i) => i);
    } else {
      scaleProperties.rangeProvided = rangeProvided;
    }
    // note for pitch  -> freq 
    if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => jType(d) === "Number")) {
      range = range.map(noteToFreq$1);
    }
    range = range.map((d, i) => {
      if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
        return d;
      } else {
        if (d < CHN_CAP_MIN) {
          console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
          return CHN_CAP_MIN;
        } else if (d > CHN_CAP_MAX) {
          console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
          return CHN_CAP_MAX;
        } else {
          return d;
        }
      }
    });

    scaleProperties.range = range;
    // make the scale function
    let scaleFunction = d3.scaleOrdinal().domain(domain).range(range);
    scaleFunction.properties = scaleProperties;
    return scaleFunction;
  }

  function makeOrdinalScaleFunction(channel, encoding, values, info) {
    let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
    let extraChannelType = FilterExtraChannelTypes[channel]?.type;
    const CHN_MAX = ChannelThresholds[channel]?.max || ChannelThresholds[extraChannelType]?.max,
      CHN_MIN = ChannelThresholds[channel]?.min || ChannelThresholds[extraChannelType]?.min;
    const CHN_CAP_MAX = ChannelCaps[channel]?.max || ChannelCaps[extraChannelType]?.max,
      CHN_CAP_MIN = ChannelCaps[channel]?.min || ChannelCaps[extraChannelType]?.min;
    let scaleDef = encoding?.scale;
    let scaleProperties = {
      channel,
      polarity,
    };

    let sort = encoding.sort;
    let sortFunction;
    if (sort === "descending" || sort === "desc") {
      sortFunction = d3.descending;
      scaleProperties.sort = "descending";
    } else {
      sortFunction = d3.ascending;
      scaleProperties.sort = "ascending";
    }
    // domain
    let domain = deepcopy(scaleDef?.domain || null);
    if (!domain) {
      domain = unique(values).toSorted(sortFunction);
    }
    scaleProperties.domain = domain;

    // range
    let range = deepcopy(scaleDef?.range || null);
    let rangeProvided = scaleDef?.range !== undefined;
    if (times && !rangeProvided) {
      range = domain.map(d => d * times);
      rangeProvided = true;
      scaleProperties.times = times;
    }// to skip the below changes when `times` is present while range is not.
    let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
    // for timbre (not recommnded), skips the below transformations
    if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
      range = repeatPallete(NomPalletes[TIMBRE_chn], domain.length);
      rangeProvided = true;
    }
    let scaleOutRange;
    if (!rangeProvided && maxDistinct) {
      scaleOutRange = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
    } else if (!rangeProvided && !maxDistinct) {
      let p = QuantPreferredRange[channel];
      scaleOutRange = [firstDefined(rangeMin, p[0], CHN_MIN), firstDefined(rangeMax, p[1], CHN_MAX)];
    }
    // match the count
    if (scaleOutRange && !rangeProvided) {
      range = divideOrdScale(scaleOutRange, domain.length);
    }
    // note for pitch  -> freq 
    if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => jType(d) === "Number")) {
      range = range.map(noteToFreq);
    }
    range = range.map((d, i) => {
      if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
        return d;
      } else {
        if (d < CHN_CAP_MIN) {
          console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
          return CHN_CAP_MIN;
        } else if (d > CHN_CAP_MAX) {
          console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
          return CHN_CAP_MAX;
        } else {
          return d;
        }
      }
    });

    // polarity (only works when a range is not provided)
    if (!rangeProvided) {
      if (domain[0] < domain[1] && polarity === NEG) {
        range = range.reverse();
      } else if (domain[0] > domain[1] && polarity === POS) {
        range = range.reverse();
      }
    }
    scaleProperties.range = range;

    // make the scale function
    let scaleFunction = d3.scaleOrdinal().domain(domain).range(range);
    scaleFunction.properties = scaleProperties;
    return scaleFunction;
  }

  function divideOrdScale(biRange, len) {
    if (len < 1) return [];
    else if (len == 1) return (biRange[0] + biRange[1]) / 2
    let rLen = len;
    let max = biRange[1];
    let min = biRange[0];
    if (min != 0) rLen = len - 1;
    let gap = (max - min) / rLen;
    let o = [];
    for (let j = min; j <= max; j += gap) {
      o.push(j);
    }
    return o.slice(len == rLen ? 1 : 0, rLen + 1);
  }

  function makeQuantitativeScaleFunction(channel, encoding, values, info) {
    let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
    let extraChannelType = FilterExtraChannelTypes[channel]?.type;
    const CHN_MAX = ChannelThresholds[channel]?.max || ChannelThresholds[extraChannelType]?.max,
      CHN_MIN = ChannelThresholds[channel]?.min || ChannelThresholds[extraChannelType]?.min;
    const CHN_CAP_MAX = ChannelCaps[channel]?.max || ChannelCaps[extraChannelType]?.max,
      CHN_CAP_MIN = ChannelCaps[channel]?.min || ChannelCaps[extraChannelType]?.min;
    let scaleDef = encoding?.scale;
    let scaleProperties = {
      channel,
      polarity,
    };
    if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
      console.error("Timber channel can't be quantitatively scaled.");
      return;
    }

    // domain
    let domain = deepcopy(scaleDef?.domain || null), domainSpecified = false;
    if (encoding?.domainMin !== undefined || encoding?.domainMax !== undefined || encoding?.domainMid !== undefined) {
      domain = [
        encoding?.domainMin !== undefined ? encoding?.domainMin : domainMin,
        encoding?.domainMax !== undefined ? encoding?.domainMax : domainMax
      ];
      if (channel === "pan" && scaleDef?.domainMid !== undefined) {
        domain.splice(1, 0, scaleDef?.domainMid);
        domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMid !== undefined, encoding?.domainMax !== undefined];
      } else {
        domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMax !== undefined];
      }
    } else if (!domain) {
      domain = [domainMin, domainMax];
      if (zero) domain = [0, domainMax];
      domainSpecified = false;
    } else {
      domainSpecified = true;
    }
    scaleProperties.domain = domain;
    scaleProperties.domainSpecified = domainSpecified;

    // range
    let range = deepcopy(scaleDef?.range || null);
    let rangeProvided = scaleDef?.range !== undefined;
    if (times && !rangeProvided) {
      range = domain.map(d => d * times);
      rangeProvided = true;
    } // to skip the below changes when `times` is present while range is not.

    let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
    if (!rangeProvided && maxDistinct) {
      range = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
    } else if (!rangeProvided && !maxDistinct) {
      let p = QuantPreferredRange$1[channel] || QuantPreferredRange$1[extraChannelType];
      range = [firstDefined(rangeMin, p[0], CHN_MIN), firstDefined(rangeMax, p[1], CHN_MAX)];
    }
    if ((channel === PAN_chn || extraChannelType === PAN_chn) && !rangeProvided && domain.length == 3) {
      range.splice(1, 0, 0);
    }
    if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => jType(d) === "Number")) {
      range = range.map(noteToFreq$1);
    }
    range = range.map((d) => {
      if (d < CHN_CAP_MIN) {
        console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
        return CHN_CAP_MIN;
      } else if (d > CHN_CAP_MAX) {
        console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
        return CHN_CAP_MAX;
      } else {
        return d;
      }
    });

    // polarity
    if (domain[0] < domain[1] && polarity === NEG) {
      range = range.reverse();
    } else if (domain[0] > domain[1] && polarity === POS$1) {
      range = range.reverse();
    }

    scaleProperties.range = range;

    // domain fix when the range is more divided than the domain (linear mapping)
    if (!encoding?.scale?.domain && domain.length == 2 && rangeProvided && domain.length < range.length) {
      console.warn(`The domain is not provided while the range is provided. Erie fixed domain to match with the range. This fix is linear, so if you are using other scale types, make sure to provide the specific domain cuts.`);
      domain = range.map((d, i) => {
        if (i == 0) return domainMin;
        else if (i == range.length - 1) return domainMax;
        else {
          return domainMin + (domainMax - domainMin) * (i / (range.length - 1));
        }
      });
    }

    // transform
    let scaleFunction;
    let scaleTransformType = scaleDef?.type;
    if (scaleTransformType === LOG) {
      if (scaleDef?.base == 0) {
        console.warn(`The log base can't be 0. It is converted to 10.`);
      }
      let base = scaleDef?.base || 10;
      scaleFunction = d3.scaleLog().base(base);
    } else if (scaleTransformType === SYMLOG) {
      let constant = scaleDef?.constant || 1;
      scaleFunction = d3.scaleSymlog().constant(constant);
    } else if (scaleTransformType === SQRT) {
      scaleFunction = d3.scaleSqrt();
    } else if (scaleTransformType === POW) {
      let exp = scaleDef?.exponent !== undefined ? scaleDef.exponent : 2;
      scaleFunction = d3.scalePow().exponent(exp);
    } else {
      scaleFunction = d3.scaleLinear();
    }
    scaleProperties.scaleType = scaleTransformType || "linear";

    // enter domain & range
    scaleFunction = scaleFunction.domain(domain);
    if (nice) scaleFunction = scaleFunction.nice();
    scaleFunction = scaleFunction.range(range);
    scaleFunction.properties = scaleProperties;
    // window['scale_'+channel] = scaleFunction;
    return scaleFunction;
  }

  function makeSpeechChannelScale(channel, encoding, values, info) {
    // consider details
    // format?
    let scale, scaleProperties = {
      channel
    };
    if (encoding.format) {
      let formatFun = d3.format(encoding.format);
      if (formatFun) {
        scale = (d) => formatFun(d);
      } else {
        scale = (d) => nullToNull(d);
      }
    } else {
      scale = (d) => nullToNull(d);
    }
    scale.properties = scaleProperties;
    return scale;
  }

  function nullToNull(d) {
    if (d === null || d === undefined) return 'null';
    else return d;
  }

  function makeStaticScaleFunction(channel, encoding, values, info) {
    let value = encoding.value;
    let condition = deepcopy(encoding.condition || []);
    let scaleProperties = {
      channel,
    };
    if (condition) {
      let conditions = [];
      if (condition.constructor.name === "Object") {
        conditions.push(condition);
      } else {
        conditions.push(...condition);
      }
      conditions = conditions.filter((cond) => cond.test !== undefined);
      let finalConditions = [];
      scaleProperties.conditions = [];
      for (const cond of conditions) {
        let fCond;
        if (cond.test !== undefined) {
          let test = cond.test;
          fCond = {};
          if (test?.constructor.name === "Array") {
            fCond.test = (d) => { return test.includes(d) };

          } else if (test?.not?.constructor.name === "Array") {
            fCond.test = (d) => { return !test.not.includes(d) };
          } else {
            fCond.test = makeParamFilter(test);
          }
        }
        if (fCond !== undefined) {
          fCond.value = cond.value;
          finalConditions.push(fCond);
        }
        scaleProperties.conditions.push([test, cond.value]);
      }
      let scale = (d) => {
        let output;
        for (const fCond of finalConditions) {
          output = fCond.test(d) ? fCond.value : output;
        }
        if (output === undefined) output = value;
        return output;
      };
      scale.properties = scaleProperties;
      return scale
    } else {
      let scale = (d) => { return value };
      scale.properties = scaleProperties;
      return scale;
    }
  }

  function makeTemporalScaleFunction(channel, encoding, _values, info) {
    let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
    let extraChannelType = FilterExtraChannelTypes[channel]?.type;
    const CHN_MAX = ChannelThresholds[channel]?.max || ChannelThresholds[extraChannelType]?.max,
      CHN_MIN = ChannelThresholds[channel]?.min || ChannelThresholds[extraChannelType]?.min;
    const CHN_CAP_MAX = ChannelCaps[channel]?.max || ChannelCaps[extraChannelType]?.max,
      CHN_CAP_MIN = ChannelCaps[channel]?.min || ChannelCaps[extraChannelType]?.min;
    let scaleDef = encoding?.scale;
    let scaleProperties = {
      channel,
      polarity,
    };

    if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
      console.error("Timber channel can't be scaled for a temporal encoding.");
      return;
    }

    // has Time unit
    if (encoding?.timeUnit) {
      let ordScale = makeOrdinalScaleFunction(channel, {
        domain: timeUnitDomain(scaleDef?.domain, encoding?.timeUnit, encoding?.dayName),
        range: scaleDef.range,
        polarity,
        maxDistinct,
        nice
      }, _values, info);
      let timeUnitFunction = makeTimeUnitFunction(encoding?.timeUnit, encoding?.dayName);
      Object.assign(scaleProperties, ordScale.properties);
      scaleProperties.timeUnit = encoding?.timeUnit;
      scaleProperties.dayName = deepcopy(encoding?.dayName);
      let scaleFunction = (d) => {
        return ordScale(timeUnitFunction(d));
      };
      scaleFunction.properties = scaleProperties;
      return scaleFunction
    }

    // time level 
    let timeLevelFunction = makeTimeLevelFunction(encoding?.timeLevel);
    scaleProperties.timeLevel = encoding?.timeLevel;

    // domain
    let domain, domainSpecified;
    if (scaleDef?.domain) {
      domain = deepcopy(scaleDef?.domain).map((d) => {
        return timeLevelFunction(d);
      });
    }
    if (encoding?.domainMin !== undefined || encoding?.domainMax !== undefined || encoding?.domainMid !== undefined) {
      domain = [
        timeLevelFunction(encoding?.domainMin !== undefined ? encoding?.domainMin : domainMin),
        timeLevelFunction(encoding?.domainMax !== undefined ? encoding?.domainMax : domainMax)
      ];
      if ((channel === PAN_chn || extraChannelType === PAN_chn) && scaleDef?.domainMid !== undefined) {
        domain.splice(1, 0, timeLevelFunction(scaleDef?.domainMid));
        domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMid !== undefined, encoding?.domainMax !== undefined];
      } else {
        domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMax !== undefined];
      }
    } else if (!domain) {
      domain = [timeLevelFunction(domainMin), timeLevelFunction(domainMax)];
      domainSpecified = false;
    } else {
      domainSpecified = true;
    }

    scaleProperties.domain = encoding?.domain;
    scaleProperties.domainSpecified = domainSpecified;

    // range
    let range = deepcopy(scaleDef?.range || null);
    let rangeProvided = scaleDef?.range !== undefined;
    if (times && !rangeProvided) {
      range = domain.map(d => d * times);
      rangeProvided = true;
    }// to skip the below changes when `times` is present while range is not.

    let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
    if (!rangeProvided && maxDistinct) {
      range = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
    } else if (!rangeProvided && !maxDistinct) {
      let p = QuantPreferredRange$1[channel] || QuantPreferredRange$1[extraChannelType];
      range = [firstDefined(rangeMin, p[0], CHN_MIN), firstDefined(rangeMax, p[1], CHN_MAX)];
    }
    if ((channel === PAN_chn || extraChannelType === PAN_chn) && !rangeProvided && domain.length == 3) {
      range.splice(1, 0, 0);
    }
    if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => jType(d) === "Number")) {
      range = range.map(noteToFreq$1);
    }
    range = range.map((d) => {
      if (d < CHN_CAP_MIN) {
        console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
        return CHN_CAP_MIN;
      } else if (d > CHN_CAP_MAX) {
        console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
        return CHN_CAP_MAX;
      } else {
        return d;
      }
    });

    // polarity (only works when a range is not provided)
    if (!rangeProvided) {
      if (domain[0] < domain[1] && polarity === NEG) {
        range = range.reverse();
      } else if (domain[0] > domain[1] && polarity === POS$1) {
        range = range.reverse();
      }
    }
    scaleProperties.range = encoding?.range;

    // make function;
    let scaleFunction = d3.scaleTime().domain(domain).range(range);
    let finalScaleFunction = (d) => {
      return scaleFunction(timeLevelFunction(d))
    };
    finalScaleFunction.properties = scaleProperties;
    return finalScaleFunction;
  }

  function makeTimeLevelFunction(timeLevel) {
    if (!timeLevel) return (d) => { return new Date(d) };
    else {
      if (timeLevel === 'year') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), 0, 0, 0, 0, 0, 0);
        }
      } else if (timeLevel === 'month') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), dt.getMonth(), 0, 0, 0, 0, 0);
        }
      } else if (timeLevel === 'date') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
        }
      } else if (timeLevel === 'hour') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0, 0);
        }
      } else if (timeLevel === 'minute') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), 0, 0);
        }
      } else if (timeLevel === 'second') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), 0);
        }
      } else if (timeLevel === 'millisecond') {
        return (d) => {
          let dt = new Date(d);
          return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
        }
      } else {
        return (d) => { return new Date(d) };
      }
    }
  }
  function makeTimeUnitFunction(timeUnit, names) {
    if (!timeUnit) return (d) => { return new Date(d) };
    else {
      if (timeUnit === 'year') {
        return (d) => {
          return new Date(d).getFullYear();
        }
      } else if (timeUnit === 'month') {
        names = names || 'number';
        if (names == "number") names = timeUnitDomainDefs.monthNumber;
        else if (names == "number1") names = timeUnitDomainDefs.monthNumber1;
        else if (names == "short") names = timeUnitDomainDefs.monthShort;
        else if (names == "long") names = timeUnitDomainDefs.month;
        return (d) => {
          return names[new Date(d).getMonth()];
        }
      } else if (timeUnit === 'day') {
        names = names || timeUnitDomainDefs.dayLong;
        if (names == "number") names = timeUnitDomainDefs.dayNumber;
        else if (names == "number1") names = timeUnitDomainDefs.dayNumber1;
        else if (names == "numberFromMon") names = timeUnitDomainDefs.dayNumberFromMon;
        else if (names == "numberFromMon1") names = timeUnitDomainDefs.dayNumberFromMon1;
        else if (names == "short") names = timeUnitDomainDefs.dayShort;
        return (d) => {
          return names[new Date(d).getDay()];
        }
      } else if (timeUnit === 'date') {
        return (d) => {
          return new Date(d).getDate();
        }
      } else if (timeUnit === 'hour') {
        return (d) => {
          return new Date(d).getHours();
        }
      } else if (timeUnit === 'hour12') {
        return (d) => {
          return new Date(d).getHours() % 12;
        }
      } else if (timeUnit === 'minute') {
        return (d) => {
          return new Date(d).getMinutes();
        }
      } else if (timeUnit === 'second') {
        return (d) => {
          return new Date(d).getSeconds();
        }
      } else if (timeUnit === 'millisecond') {
        return (d) => {
          return new Date(d).getMilliseconds();
        }
      } else {
        return (d) => { return new Date(d) };
      }
    }
  }

  function timeUnitDomain(orgDomain, timeUnit, names) {
    if (timeUnit === 'year') {
      return [new Date(orgDomain[0]).getDay(), new Date(orgDomain[1]).getDay()]
    } else if (timeUnit === 'month') {
      names = names || 'number';
      if (names == "number") names = timeUnitDomainDefs.monthNumber;
      else if (names == "number1") names = timeUnitDomainDefs.monthNumber1;
      else if (names == "short") names = timeUnitDomainDefs.monthShort;
      else if (names == "long") names = timeUnitDomainDefs.month;
      return names;
    } else if (timeUnit === 'day') {
      names = names || timeUnitDomainDefs.dayLong;
      if (names == "number") names = timeUnitDomainDefs.dayNumber;
      else if (names == "number1") names = timeUnitDomainDefs.dayNumber1;
      else if (names == "numberFromMon") names = timeUnitDomainDefs.dayNumberFromMon;
      else if (names == "numberFromMon1") names = timeUnitDomainDefs.dayNumberFromMon1;
      else if (names == "short") names = timeUnitDomainDefs.dayShort;
      return names;
    } else if (timeUnit === 'date') {
      return timeUnitDomainDefs.date;
    } else if (timeUnit === 'hour') {
      return timeUnitDomainDefs.hour;
    } else if (timeUnit === 'hour12') {
      return timeUnitDomainDefs.hour;
    } else if (timeUnit === 'minute') {
      return timeUnitDomainDefs.minute;
    } else if (timeUnit === 'second') {
      return timeUnitDomainDefs.second;
    } else if (timeUnit === 'millisecond') {
      return timeUnitDomainDefs.millisecond;
    }
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

  // only for the time scale
  function makeTimeChannelScale(channel, _encoding, values, info, scaleType, beat) {
    let encoding = deepcopy(_encoding);
    let scaleDef = encoding?.scale;
    if (encoding.type === NOM && !scaleDef.timing) {
      scaleDef.timing = REL_TIMING;
    }
    let isRelative = scaleDef.timing === REL_TIMING,
      isSimultaneous = scaleDef.timing === SIM_TIMING,
      band = scaleDef?.band || DEF_DUR, length = scaleDef?.length || 5;
    if (beat?.converter) {
      band = beat.converter(scaleDef?.band || 1), length = beat.converter(length);
    }
    if (encoding?.scale?.range === undefined && scaleDef?.band !== undefined) {
      encoding.scale.range = [0, length - band];
    } else if (encoding?.scale?.range === undefined) {
      encoding.scale.range = [0, length];
    }
    let scale1;
    // single-time channel
    if (isRelative) {
      scale1 = (t1) => {
        return 'after_previous';
      };
      scale1.properties = {
        channel,
        timing: REL_TIMING,
      };
    } else if (isSimultaneous) {
      scale1 = (t1) => {
        return 0;
      };
      scale1.properties = {
        channel,
        timing: SIM_TIMING,
      };
    } else if (scaleType?.encodingType === QUANT) {
      scale1 = makeQuantitativeScaleFunction(TIME_chn, encoding, values, info);
    } else if (scaleType?.encodingType === TMP) {
      scale1 = makeTemporalScaleFunction(TIME_chn, encoding, values, info);
    } else if (scaleType?.encodingType === ORD) {
      scale1 = makeOrdinalScaleFunction(TIME_chn, encoding, values, info);
    } else if (scaleType?.encodingType === NOM) {
      scale1 = makeNominalScaleFunction(TIME_chn, encoding, values, info);
    } else if (scaleType?.encodingType === STATIC) {
      scale1 = makeStaticScaleFunction(TIME_chn, encoding);
    }
    if (!scale1) {
      console.error("Wrong scale definition for the time channel", scaleDef);
    }
    let scaleFunction = (t1, t2) => {
      if (t2 !== undefined) {
        return {
          start: (beat?.roundStart ? beat?.roundStart(scale1(t1)) : scale1(t1)),
          end: (beat?.roundDuration ? beat?.roundDuration(scale1(t2)) : scale1(t2))
        };
      } else {
        return {
          start: (beat?.roundStart ? beat?.roundStart(scale1(t1)) : scale1(t1)),
          duration: (beat?.roundDuration ? beat?.roundDuration(band) : band)
        };
      }
    };
    scaleFunction.properties = scale1.properties;
    scaleFunction.properties.length = length;
    return scaleFunction;
  }

  function makeFieldedScaleFunction(channel, encoding, values, info, data) {
    let scaleProperties = {
      channel,
    };
    let mapper = {};
    let findKey = encoding.scale.range.field;
    let encKey = encoding.field[0];
    for (const datum of data) {
      let r = datum[findKey];
      if ((channel === PITCH_chn) && jType(r) !== "Number") {
        r = noteToFreq$1(r);
      }
      mapper[datum[encKey]] = r;
    }
    scaleProperties.rangeProvided = true;
    scaleProperties.domain = Object.keys(mapper);
    scaleProperties.range = Object.values(mapper);
    // make the scale function
    let scaleFunction = (k) => {
      return mapper[k];
    };
    scaleFunction.properties = scaleProperties;
    return scaleFunction;
  }

  function getAudioScales(channel, encoding, values, beat, data) {
    // extract default information
    let polarity = encoding.scale?.polarity || POS$1;
    let maxDistinct = encoding.scale?.maxDistinct;
    if (maxDistinct === undefined) maxDistinct = true;
    let scaleId = encoding.id;
    let times = encoding.scale?.times;
    let zero = encoding.scale?.zero !== undefined ? encoding.scale?.zero : false;
    let domainMax, domainMin;
    // check on this
    if (jType(channel) !== "Array" && values) {
      let domainSorted = values.toSorted(asc);
      domainMax = domainSorted[domainSorted.length - 1];
      domainMin = domainSorted[0];
    } else if (values) {
      let domainSorted = values[0].concat(values[1]).toSorted(asc);
      domainMax = domainSorted[domainSorted.length - 1];
      domainMin = domainSorted[0];
      // legacy (keep until stable)
      // domainMax = Math.max(Math.max(...values[0]), Math.max(...values[1]));
      // domainMin = Math.min(Math.min(...values[0]), Math.min(...values[1]));
    }

    let nice = encoding.scale?.nice;
    let info = { polarity, maxDistinct, times, zero, domainMax, domainMin, nice };
    // outcome scale function
    let _scale;
    let scaleType = getScaleType(channel, encoding, values);

    // get scale functions
    if (scaleType.fieldRange) {
      _scale = makeFieldedScaleFunction(channel, encoding, values, info, data);
    } else if (scaleType.isTime) {
      // time scales
      _scale = makeTimeChannelScale(channel, encoding, values, info, scaleType, beat);
    } else if (scaleType.isSpeech) {
      _scale = makeSpeechChannelScale(channel, encoding);
    } else {
      if (scaleType.encodingType === QUANT) {
        _scale = makeQuantitativeScaleFunction(channel, encoding, values, info);
      } else if (scaleType.encodingType === TMP) {
        _scale = makeTemporalScaleFunction(channel, encoding, values, info);
      } else if (scaleType.encodingType === ORD) {
        _scale = makeOrdinalScaleFunction(channel, encoding, values, info);
      } else if (scaleType.encodingType === NOM) {
        _scale = makeNominalScaleFunction(channel, encoding, values, info);
      } else if (scaleType.encodingType === STATIC) {
        _scale = makeStaticScaleFunction(channel, encoding);
      }
    }
    if (_scale) {
      let scale;
      if (channel === PITCH_chn && encoding.roundToNote) {
        scale = (d) => { return roundToNoteScale(_scale(d)); };
      } else if (TapChannels.includes(channel)) {
        let pause = { rate: encoding.scale?.pauseRate !== undefined ? encoding.scale?.pauseRate : DEF_TAP_PAUSE_RATE };
        if (encoding.scale?.pauseLength) pause = { length: encoding.scale?.pauseLength };
        if (channel === TAPCNT_chn) {
          scale = (d) => ({
            value: _scale(d),
            tapLength: encoding.scale?.band,
            pause,
            beat
          });
        } else if (channel === TAPSPD_chn) {
          let tapSpeedValues = values.map((d) => _scale(d));
          let tapBand = encoding.scale?.band || (beat ? DEF_TAP_DUR_BEAT : DEF_TAP_DUR);
          let maxTapSpeed = round(Math.max(...tapSpeedValues) * tapBand, 0);
          let tappingUnit = tapBand / (maxTapSpeed + (maxTapSpeed - 1) * (pause.rate !== undefined ? pause.rate : DEF_TAP_PAUSE_RATE));
          let maxTappingLength = encoding.scale?.maxTappingLength !== undefined ? encoding.scale?.maxTappingLength : (beat ? DEF_TAPPING_DUR_BEAT : MAX_TAPPING_DUR);
          if (tappingUnit > maxTappingLength) tappingUnit = maxTappingLength;
          tappingUnit = round(tappingUnit, -2);
          scale = (d) => ({
            value: _scale(d),
            tapDuration: encoding.scale?.band,
            tappingUnit,
            singleTappingPosition: encoding.scale?.singleTappingPosition || SINGLE_TAP_MIDDLE,
            beat
          });
        }
      } else if (channel === DUR_chn && beat) {
        scale = (d) => beat.converter(_scale(d));
      } else {
        scale = _scale;
      }
      if (scale.properties) {
        Object.assign(scale.properties, scaleType);
      } else if (_scale.properties) {
        scale.properties = {};
        Object.assign(scale.properties, _scale.properties);
        Object.assign(scale.properties, scaleType);
      }
      if (encoding.scale?.description || encoding.scale?.description === undefined) {
        scale.properties.descriptionDetail = encoding.scale?.description;
      } else {
        scale.properties.descriptionDetail = null;
      }
      if (encoding.scale?.title) {
        scale.properties.title = encoding.scale?.title;
      } else {
        scale.properties.title = listString(unique(scale.properties.field), ", ", false);
      }

      if (encoding.format) {
        scale.properties.format = encoding.format;
      }
      if (encoding.formatType) {
        scale.properties.formatType = encoding.formatType;
      } else if (encoding.format) {
        scale.properties.formatType = "number";
      }

      if (scaleId) {
        scale.scaleId = scaleId;
      }
      return scale;
    } else {
      console.error(`The encoding definition for ${channel} channel is illegal:`, encoding);
      return null;
    }
    // add scale description
  }

  function getScaleType(channel, encoding, values) {
    let isTime = TimeChannels.includes(channel) || TimeChannels.includes(channel[0]);
    let isSpeech = SpeechChannels.includes(channel);
    let encodingType = encoding.type;
    if (!encodingType) {
      if (encoding.value) encodingType = STATIC;
      else encodingType = detectType(values);
    }
    let field = encoding.original_field || encoding.field;
    let binned = encoding.binned;
    let aggregate = encoding.aggregate;
    let fieldRange = encoding.scale?.range?.field || null;
    return { isTime, isSpeech, encodingType, field, binned, aggregate, fieldRange };
  }

  function makeBeatFunction(tempo) {
    return (beat) => {
      return beat * 60 / tempo;
    }
  }

  function makeBeatRounder(tempo, r) {
    return (sec) => {
      if (sec.constructor.name !== 'Number') return sec;
      let beats = sec / tempo * 60;
      return Math.round(beats / r) * r;
    }
  }

  function tidyUpScaleDefinitions(scaleDefinitions, normalizedSpecs, sequenceConfig) {
    // directly updates the scale definitions, and returns the ids of scales to be removed, which can be later handled.
    let sequenceScaleConsistency = sequenceConfig?.sequenceScaleConsistency || {};
    let forceSequenceScaleConsistency = sequenceConfig?.forceSequenceScaleConsistency || {};
    let removals = [];
    for (const stream of normalizedSpecs) {
      if (stream.stream) {
        Object.keys(stream.stream.encoding).forEach((channel) => {
          let match;
          if (sequenceScaleConsistency[channel] && !forceSequenceScaleConsistency[channel]) {
            match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, !forceSequenceScaleConsistency[channel]);
          } else if (forceSequenceScaleConsistency[channel]) {
            match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, forceSequenceScaleConsistency[channel]);
          }
          if (match) {
            if (match.id !== stream.stream.encoding[channel].scale.id) {
              match.field.push(stream.stream.encoding[channel].field);
              removals.push(stream.stream.encoding[channel].scale.id);
              Object.keys(stream.stream.encoding[channel].scale).forEach(prop => {
                if (!match.scale[prop]) match.scale[prop] = stream.stream.encoding[channel].scale[prop];
              });
              stream.stream.encoding[channel].scale.id = match.id;
            }
          }
        });
      } else if (stream.overlay) {
        for (const overlayStream of stream.overlay) {
          let overlayScaleConsistency = stream?.config?.overlayScaleConsistency || sequenceConfig?.overlayScaleConsistency || {};
          let forceOverlayScaleConsistency = stream?.config?.forceOverlayScaleConsistency || sequenceConfig?.forceOverlayScaleConsistency || {};
          Object.keys(overlayStream.encoding).forEach((channel) => {
            let match;
            if (sequenceScaleConsistency[channel] && !forceSequenceScaleConsistency[channel]) {
              match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, !forceSequenceScaleConsistency[channel]);
            } else if (forceSequenceScaleConsistency[channel]) {
              match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, forceSequenceScaleConsistency[channel]);
            } else if (overlayScaleConsistency[channel] && !forceOverlayScaleConsistency[channel]) {
              match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, !forceOverlayScaleConsistency[channel]);
            } else if (forceOverlayScaleConsistency[channel]) {
              match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, forceOverlayScaleConsistency[channel]);
            }
            if (match) {
              if (match.id !== overlayStream.encoding[channel].scale.id) {
                match.field.push(overlayStream.encoding[channel].field);
                removals.push(overlayStream.encoding[channel].scale.id);
                Object.keys(overlayStream.encoding[channel].scale).forEach(prop => {
                  if (!match.scale[prop]) match.scale[prop] = overlayStream.encoding[channel].scale[prop];
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
    // matchParent (whether overlay's scales are consistent to those of parent sequence)
    // matchData (whether to force scale consistency even if data is different)
    let thisDef;
    for (const def of scaleDefinitions) {
      if (def.id === encoding.scale.id) thisDef = def;
    }
    for (const def of scaleDefinitions) {
      if (def.channel === thisDef.channel && def.type === thisDef.type) {
        if (def.channel === TIME_chn && def.scale.timing !== thisDef.scale.timing) continue;
        if (matchData && matchParent) {
          if (def.dataName === thisDef.dataName && def.parentID === thisDef.parentID) return def;
        } else if (!matchData && matchParent) {
          if (def.parentID === thisDef.parentID) return def;
        } else if (matchData && !matchParent) {
          if (def.dataName === thisDef.dataName) return def;
        } else {
          return def;
        }
      }
      if (def.id === encoding.scale.id) return def;
    }

    return null;
  }

  async function getChannelType(loaded_datasets, spec, untyped_channels) {
    let data = loaded_datasets[spec.data.name];

    if (!data || !spec.encoding) {
      console.error("No proper layer spec provided.");
      return undefined;
    }

    // before transforms
    for (const channel of Object.keys(spec.encoding)) {
      if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
        spec.encoding[channel].type = STATIC;
      } else if (!spec.encoding[channel].type) {
        spec.encoding[channel].type = detectType(data.map((d) => d[spec.encoding[channel].field]));
      }
    }

    data = applyTransforms(data, spec);

    // after transforms
    for (const channel of Object.keys(spec.encoding)) {
      if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
        spec.encoding[channel].type = STATIC;
      } else if (!spec.encoding[channel].type) {
        spec.encoding[channel].type = detectType(data.map((d) => d[spec.encoding[channel].field]));
      }
    }
  }

  async function makeScales(scaleHash, normalized, loaded_datasets, config) {
    let scaleInfo = deepcopy(scaleHash);
    Object.keys(scaleInfo).forEach((scaleId) => {
      scaleInfo[scaleId].collected = [];
    });
    let beat;
    if (config?.timeUnit) {
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
      if (stream.stream) {
        let data = loaded_datasets[stream.stream.data.name];
        data = applyTransforms(data, stream.stream);
        let encoding = stream.stream.encoding;
        for (const cname of Object.keys(encoding)) {
          let scaleId = encoding[cname].scale.id;
          scaleInfo[scaleId].data = data;
          if (encoding[cname].field) {
            let collectionKey = stream.stream.data.name + "_" + encoding[cname].field;
            if (!scaleInfo[scaleId].collected.includes(collectionKey)) {
              scaleInfoUpdater(encoding[cname], scaleInfo, data);
              scaleInfo[scaleId].collected.push(collectionKey);
            }
          } else if (encoding[cname].value !== undefined) {
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
      } else if (stream.overlay) {
        for (const overlay of stream.overlay) {
          let data = loaded_datasets[overlay.data.name];
          data = applyTransforms(data, overlay);
          let encoding = overlay.encoding;
          for (const cname of Object.keys(encoding)) {
            let scaleId = encoding[cname].scale.id;
            scaleInfo[scaleId].data = data;
            if (encoding[cname].field) {
              let collectionKey = overlay.data.name + "_" + encoding[cname].field;
              if (!scaleInfo[scaleId].collected.includes(collectionKey)) {
                scaleInfoUpdater(encoding[cname], scaleInfo, data);
                scaleInfo[scaleId].collected.push(collectionKey);
              }
            } else if (encoding[cname].value !== undefined) {
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
    // 2. make scale functions
    let scaleFunctions = {};
    for (const scaleId of Object.keys(scaleInfo)) {
      let scaleDef = scaleInfo[scaleId];
      let channel = scaleDef.channel;

      let o = {};
      Object.assign(o, scaleDef);
      scaleFunctions[scaleId] = getAudioScales(channel, o, scaleDef.values, beat, scaleDef.data);
    }
    if (beat) scaleFunctions.__beat = beat;
    return scaleFunctions;
  }


  function scaleInfoUpdater(channel, scaleInfo, data) {
    let field = channel.field;
    let scaleId = channel.scale.id;
    if (scaleInfo[scaleId]) {
      if (!scaleInfo[scaleId].values) scaleInfo[scaleId].values = [];
      let datums = [];
      if (jType(field) === 'Array') {
        field.forEach((f) => {
          datums.push(...data.map((d, i) => d[f]));
        });
      } else {
        datums.push(...data.map((d, i) => d[field]));
      }
      if (scaleInfo[scaleId].type === TMP) {
        datums = datums.map((d) => new Date(d));
      }
      scaleInfo[scaleId].values.push(...datums);
    }
  }

  // global event
  let isRecorded = false;
  function readyRecording() {
    document?.body?.addEventListener("erieOnRecorderReady", (e) => {
      isRecorded = true;
    });
  }

  async function compileAudioGraph(audio_spec, options) {
    let { normalized, datasets, tick, scaleDefinitions, sequenceConfig, synths, samplings, waves } = await normalizeSpecification(audio_spec);
    // 1. load datasets first! && filling missing data type
    let loaded_datasets = {};
    let scalesToRemove = [];
    for (const stream of normalized) {
      if (stream.stream) {
        await getDataWrap(stream.stream.data, loaded_datasets, datasets);

        let untyped_channels = [];
        Object.keys(stream.stream.encoding).forEach((channel) => {
          if (!stream.stream.encoding[channel].type) untyped_channels.push(channel);
        });
        if (untyped_channels.length > 0) {
          await getChannelType(loaded_datasets, stream.stream);
        }
        scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, sequenceConfig));
      } else if (stream.overlay) {
        for (const overlay of stream.overlay) {
          await getDataWrap(overlay.data, loaded_datasets, datasets);
          let untyped_channels = [];
          Object.keys(overlay.encoding).forEach((channel) => {
            if (!overlay.encoding[channel].type) untyped_channels.push(channel);
          });
          if (untyped_channels.length > 0) {
            await getChannelType(loaded_datasets, overlay);
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
    let scales = await makeScales(scaleHash, normalized, loaded_datasets, sequenceConfig);

    // 4. make streams
    let sequence = new SequenceStream();
    if (audio_spec?.config?.recording) {
      sequence.setConfig("recording", true);
    }

    // 4a. regiester stuff
    sequence.setSampling(toHashedObject(samplings, 'name'));
    sequence.setSynths(toHashedObject(synths, 'name'));
    sequence.setWaves(toHashedObject(waves, 'name'));

    // 4b. make streams
    normalized?.length > 1;
    for (const stream of normalized) {
      if (stream.intro) {
        let speeches = [stream.intro.title, stream.intro.description].filter(d => d !== undefined);
        let sStream = new SpeechStream(speeches.map((d) => ({ speech: d })));
        if (audio_spec.config) {
          Object.keys(audio_spec.config).forEach((key) => {
            sStream.setConfig(key, audio_spec.config[key]);
          });
        }
        sequence.setIntroStream(sStream);
      } else if (stream.stream) {
        let is_repeated = isRepeatedStream(stream.stream);
        let data = deepcopy(loaded_datasets[stream.stream.data.name]);
        let slag = await compileSingleLayerAuidoGraph(stream.stream, data, audio_spec.config, tick, scales);

        if (!is_repeated) {
          sequence.addStream(slag.stream);
        } else {
          sequence.addStreams(slag.stream);
        }
        if (audio_spec.config) {
          Object.keys(audio_spec.config).forEach((key) => {
            sequence.setConfig(key, audio_spec.config[key]);
          });
        }
        if (stream.stream.config) {
          Object.keys(stream.stream.config).forEach((key) => {
            sequence.setConfig(key, stream.stream.config[key]);
          });
        }
        if (stream.stream.title) sequence.setTitle(stream.stream.title);
        if (stream.stream.description) sequence.setDescription(stream.stream.description);
      } else if (stream.overlay) {
        let overlays = new OverlayStream();
        for (const overlay of stream.overlay) {
          let data = deepcopy(loaded_datasets[overlay.data.name]);

          let config = deepcopy(audio_spec.config);
          Object.assign(config, overlay.config);

          let overlayStrm = await compileSingleLayerAuidoGraph(overlay, data, config, tick, scales);

          if (overlay.name) overlayStrm.stream.setName(overlay.name);
          if (overlay.title) overlayStrm.stream.setTitle(overlay.title);
          if (overlay.description) overlayStrm.stream.setDescription(overlay.description);

          overlays.addStream(overlayStrm.stream);
        }
        overlays.setName(stream.name);
        overlays.setTitle(stream.title);
        overlays.setDescription(stream.description);
        if (audio_spec.config) {
          Object.keys(audio_spec.config).forEach((key) => {
            overlays.setConfig(key, audio_spec.config[key]);
          });
        }
        if (stream.overlay.config) {
          Object.keys(stream.overlay.config).forEach((key) => {
            overlays.setConfig(key, stream.overlay.config[key]);
          });
        }
        sequence.addStream(overlays);
      }
    }
    if (audio_spec.config) {
      Object.keys(audio_spec.config).forEach((key) => {
        sequence.setConfig(key, audio_spec.config[key]);
      });
    }
    if (typeof window !== 'undefined' && window?.erieRecorderReady) {
      isRecorded = true;
    }
    sequence.setConfig('isRecorded', isRecorded);
    sequence.setConfig('options', options);
    return sequence;
  }

  exports.ErieSampleBaseUrl = 'audio_sample/';

  function setSampleBaseUrl(url) {
    exports.ErieSampleBaseUrl = url;
  }

  const channels = 2;
  async function generatePCMCode(queue) {
    // currently only support sine wave
    // this is an experimental feature. currently only works for non-overlaid tone-series queues.
    // queue: a discrete or continous queue data
    // supported channels: time, pitch, loudness, pan
    let ctx = new standardizedAudioContext.AudioContext();
    let sampleRate = ctx.sampleRate;
    let queues = [];
    if (queue.type === ToneSeries) {
      queues.push(queue);
    } else if (queue.type === ToneOverlaySeries) {
      queues.push(...queue.overlays);
    }
    let queue_lengths = queues.map((q) => Math.max(...q.sounds.map((d) => d.time + d.duration + (d.postReverb || 0))));
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
          let f = sound.time * sampleRate,
            t = (sound.time + sound.duration + sound.postReverb) * sampleRate;
          let length = t - f;
          let data = populatePCMforFreq(sound.pitch, length, sampleRate);
          let gain = sound.loudness;
          if (gain === undefined) gain = 1;
          let pan = sound.pan;
          if (pan === undefined) pan = 0;
          let LRgain = getLRgain(pan);
          for (let i = 0; i < length; i++) {
            channel0[f + i] += data[i] * gain * LRgain[0];
            channel1[f + i] += data[i] * gain * LRgain[1];
          }
        }
      } else {
        // continous sound
        let ramp_pan = getRampFunction(queue.ramp?.pan),
          ramp_gain = getRampFunction(queue.ramp?.loudness);
        sounds.sort((a, b) => a.time - b.time);
        let acc_prev = 0;
        for (let i = 0; i < sounds.length - 1; i++) {
          let sound = sounds[i], next_sound = sounds[i + 1];
          let f = Math.round(sound.time * sampleRate),
            t = Math.round(next_sound.time * sampleRate);
          let length = t - f;

          let { data, acc } = populatePCMforFreqRamp(sound.pitch, next_sound.pitch, queue.ramp?.pitch, acc_prev, length, sampleRate);
          acc_prev = acc;

          let f_gain = sound.loudness;
          if (f_gain === undefined) f_gain = 1;
          let f_pan = sound.pan;
          if (f_pan === undefined) f_pan = 0;

          let t_gain = sound.loudness;
          if (t_gain === undefined) t_gain = 1;
          let t_pan = sound.pan;
          if (t_pan === undefined) t_pan = 0;

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
    return buffer;
  }

  function populatePCMforFreq(pitch, frameCount, sampleRate) {
    let data = new Float32Array(frameCount);
    let cycle = pitch == 0 ? 0 : sampleRate / pitch;
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.sin(2 * Math.PI / cycle * i);
    }
    return data
  }

  function populatePCMforFreqRamp(pitch_from, pitch_to, ramp, acc, frameCount, sampleRate) {
    if (ramp === "abrupt" || ramp === false) {
      return { data: populatePCMforFreq(pitch_from, frameCount, sampleRate), acc: 0 };
    } else if (ramp === "linear" || ramp === true || ramp === undefined) {
      let data = new Float32Array(frameCount);
      let cycle_from = pitch_from == 0 ? 0 : sampleRate / pitch_from, cycle_to = pitch_to == 0 ? 0 : sampleRate / pitch_to;
      let cycles = Array(frameCount).fill(cycle_from).map((_, i) => {
        return cycle_from + ((cycle_to - cycle_from) / (frameCount - 1) * i);
      });
      for (let i = 0; i < frameCount; i++) {
        acc += 2 * Math.PI / cycles[i];
        if (Math.sin(acc) == 0) acc = 0;
        data[i] = Math.sin(acc);
      }
      return { data, acc };
    } else if (ramp === "exponential") {
      let data = new Float32Array(frameCount);
      let cycle_from = sampleRate / pitch_from, cycle_to = sampleRate / pitch_to;
      let cycles = Array(frameCount).fill(cycle_from).map((_, i) => {
        return (cycle_to - cycle_from) * Math.exp(i / frameCount) + cycle_from
      });
      for (let i = 0; i < frameCount; i++) {
        acc += 2 * Math.PI / cycles[i];
        if (Math.sin(acc) == 0) acc = 0;
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
      return (a, b, r) => { return a * (1 - r) + b * r };
    } else if (ramp === "abrupt" || ramp === false) {
      return (a, _, __) => { return a };
    } else if (ramp === "exponential") {
      return (a, b, r) => {
        return (b - a) * Math.exp(r) + a
      };
    }
  }

  exports.Aggregate = Aggregate;
  exports.AudioPrimitiveBuffer = AudioPrimitiveBuffer;
  exports.Bin = Bin;
  exports.Calculate = Calculate;
  exports.Channel = Channel;
  exports.Config = Config;
  exports.Data = Data;
  exports.Dataset = Dataset;
  exports.Datasets = Datasets;
  exports.Density = Density;
  exports.DurationChannel = DurationChannel;
  exports.ErieFilters = ErieFilters;
  exports.Filter = Filter;
  exports.Fold = Fold;
  exports.GoogleCloudTTSGenerator = GoogleCloudTTSGenerator;
  exports.LoudnessChannel = LoudnessChannel;
  exports.ModulationChannel = ModulationChannel;
  exports.Overlay = Overlay;
  exports.PanChannel = PanChannel;
  exports.PitchChannel = PitchChannel;
  exports.PostReverbChannel = PostReverbChannel;
  exports.RepeatChannel = RepeatChannel;
  exports.SampledTone = SampledTone;
  exports.Sampling = Sampling;
  exports.Sequence = Sequence$1;
  exports.SpeechAfterChannel = SpeechAfterChannel;
  exports.SpeechBeforeChannel = SpeechBeforeChannel;
  exports.Stream = Stream;
  exports.Synth = Synth;
  exports.SynthTone = SynthTone$1;
  exports.TapCountChannel = TapCountChannel;
  exports.TapSpeedChannel = TapSpeedChannel;
  exports.Tick = Tick;
  exports.Time2Channel = Time2Channel;
  exports.TimeChannel = TimeChannel;
  exports.Tone = Tone$1;
  exports.Transform = Transform;
  exports.Wave = Wave;
  exports.WaveTone = WaveTone;
  exports.WebSpeechGenerator = WebSpeechGenerator;
  exports.bufferToArrayBuffer = bufferToArrayBuffer;
  exports.compileAudioGraph = compileAudioGraph;
  exports.concatenateBuffers = concatenateBuffers;
  exports.generatePCMCode = generatePCMCode;
  exports.makeWaveFromBuffer = makeWaveFromBuffer;
  exports.readyRecording = readyRecording;
  exports.registerFilter = registerFilter;
  exports.setSampleBaseUrl = setSampleBaseUrl;

  return exports;

})({}, standardizedAudioContext, tts, d3, aq, vega);
