import Nexus from 'https://cdn.skypack.dev/nexusui';
import {
  optionsFromArguments,
  OmniOscillator,
  Synth,
} from 'https://cdn.skypack.dev/tone';
const { Piano } = Nexus;

/**
 * Utilities
 */

export const clamp = (min, max) => (value) => {
  return Math.max(min, Math.min(max, value));
};

export const linearScale =
  ([dMin, dMax], [rMin, rMax]) =>
  (value) => {
    return rMin + (rMax - rMin) * ((value - dMin) / (dMax - dMin));
  };

/**
 * Tone components
 */

export class MultiSynth extends Synth {
  static getDefaults() {
    return {
      ...Synth.getDefaults(),
      suboscillators: [],
    };
  }

  constructor() {
    super(optionsFromArguments(MultiSynth.getDefaults(), arguments));
    const options = optionsFromArguments(MultiSynth.getDefaults(), arguments);

    this.suboscillators = options.suboscillators.map((oscOptions) => {
      return new OmniOscillator(oscOptions);
    });

    this.suboscillators.forEach((oscillator) => {
      oscillator.chain(this.envelope);
    });
  }

  _triggerEnvelopeAttack(time, velocity) {
    super._triggerEnvelopeAttack(time, velocity);

    this.suboscillators.forEach((osc) => {
      osc.start(time);

      if (this.envelope.sustain === 0) {
        osc.stop(time + this.envelope.attack + this.envelope.decay);
      }
    });

    return this;
  }

  _triggerEnvelopeRelease(time) {
    super._triggerEnvelopeRelease(time);
    time = this.toSeconds(time);

    this.suboscillators.forEach((osc) => {
      osc.stop(time + this.envelope.release);
    });

    return this;
  }

  setNote(note, time) {
    super.setNote(note, time);

    this.suboscillators.forEach((osc) => {
      osc.frequency.setValueAtTime(note, time);
    });

    return this;
  }

  get() {
    return {
      ...super.get(),
      suboscillators: this.suboscillators.map((osc) => {
        return osc.get();
      }),
    };
  }

  set(obj) {
    Object.keys(obj).forEach((key) => {
      if (key === 'suboscillators') {
        Object.keys(obj[key]).forEach((i) => {
          this.suboscillators[i].set(obj[key][i]);
        });
      } else {
        super.set(obj);
      }
    });

    return this;
  }
}

/**
 * UI components
 */

function createDetunes(selector, onChange) {
  const octaveDetune = document.querySelector(`${selector}-octave`);
  const coarseDetune = document.querySelector(`${selector}-coarse`);
  const fineDetune = document.querySelector(`${selector}-fine`);

  octaveDetune.addEventListener('change', (e) => {
    onChange({
      detune: +e.target.value + +coarseDetune.value + +fineDetune.value,
    });
  });

  coarseDetune.addEventListener('change', (e) => {
    onChange({
      detune: +octaveDetune.value + +e.target.value + +fineDetune.value,
    });
  });

  fineDetune.addEventListener('change', (e) => {
    onChange({
      detune: +octaveDetune.value + +coarseDetune.value + +e.targetvalue,
    });
  });
}

function createEnvelope(selector, onChange) {
  document
    .querySelector(`${selector}-attack`)
    .addEventListener('change', (e) => {
      onChange({ attack: +e.target.value });
    });

  document
    .querySelector(`${selector}-decay`)
    .addEventListener('change', (e) => {
      onChange({ decay: +e.target.value });
    });

  document
    .querySelector(`${selector}-sustain`)
    .addEventListener('change', (e) => {
      onChange({ sustain: +e.target.value });
    });

  document
    .querySelector(`${selector}-release`)
    .addEventListener('change', (e) => {
      onChange({ release: +e.target.value });
    });
}

export const createAmplitudeEnvelope = (selector, onChange) => {
  createEnvelope(`${selector}-envelope`, onChange);
};

export const createAutoFilter = (selector, onChange) => {
  document
    .querySelector(`${selector}-frequency`)
    .addEventListener('change', (e) => {
      onChange({ frequency: e.target.value });
    });

  document.querySelector(`${selector}-type`).addEventListener('change', (e) => {
    onChange({ type: e.target.value });
  });

  document
    .querySelector(`${selector}-base-frequency`)
    .addEventListener('change', (e) => {
      onChange({ baseFrequency: +e.target.value });
    });

  document
    .querySelector(`${selector}-octaves`)
    .addEventListener('change', (e) => {
      onChange({ octaves: +e.target.value });
    });

  document
    .querySelector(`${selector}-filter-type`)
    .addEventListener('change', (e) => {
      onChange({ filter: { type: e.target.value } });
    });

  document
    .querySelector(`${selector}-filter-rolloff`)
    .addEventListener('change', (e) => {
      onChange({ filter: { rolloff: e.target.value } });
    });

  document
    .querySelector(`${selector}-filter-q`)
    .addEventListener('change', (e) => {
      onChange({ filter: { Q: +e.target.value } });
    });
};

export const createChorus = (selector, onChange) => {
  document
    .querySelector(`${selector}-frequency`)
    .addEventListener('change', (e) => {
      onChange({ frequency: +e.target.value });
    });

  document
    .querySelector(`${selector}-delay-time`)
    .addEventListener('change', (e) => {
      onChange({ delayTime: +e.target.value });
    });

  document
    .querySelector(`${selector}-depth`)
    .addEventListener('change', (e) => {
      onChange({ depth: +e.target.value });
    });
};

export const createCompressor = (selector, onChange) => {
  document
    .querySelector(`${selector}-threshold`)
    .addEventListener('change', (e) => {
      onChange({ threshold: +e.target.value });
    });

  document
    .querySelector(`${selector}-ratio`)
    .addEventListener('change', (e) => {
      onChange({ ratio: +e.target.value });
    });
};

export const createDelay = (selector, onChange) => {
  document
    .querySelector(`${selector}-delay-time`)
    .addEventListener('change', (e) => {
      onChange({ delayTime: +e.target.value });
    });
};

export const createFeedbackDelay = (selector, onChange) => {
  document
    .querySelector(`${selector}-delay-time`)
    .addEventListener('change', (e) => {
      onChange({ delayTime: e.target.value });
    });

  document
    .querySelector(`${selector}-feedback`)
    .addEventListener('change', (e) => {
      onChange({ feedback: +e.target.value });
    });
};

export const createFilter = (selector, onChange) => {
  document.querySelector(`${selector}-type`).addEventListener('change', (e) => {
    onChange({ type: e.target.value });
  });

  document
    .querySelector(`${selector}-rolloff`)
    .addEventListener('change', (e) => {
      onChange({ rolloff: +e.target.value });
    });

  document
    .querySelector(`${selector}-frequency`)
    .addEventListener('change', (e) => {
      onChange({ frequency: +e.target.value });
    });

  document.querySelector(`${selector}-q`).addEventListener('change', (e) => {
    onChange({ Q: +e.target.value });
  });
};

export const createFreeverb = (selector, onChange) => {
  document
    .querySelector(`${selector}-room-size`)
    .addEventListener('change', (e) => {
      onChange({ roomSize: +e.target.value });
    });

  document
    .querySelector(`${selector}-dampening`)
    .addEventListener('change', (e) => {
      onChange({ dampening: +e.target.value });
    });
};

export const createFrequencyEnvelope = (selector, onChange) => {
  createEnvelope(`${selector}-envelope`, onChange);

  document
    .querySelector(`${selector}-base-frequency`)
    .addEventListener('change', (e) => {
      onChange({ baseFrequency: +e.target.value });
    });

  document
    .querySelector(`${selector}-octaves`)
    .addEventListener('change', (e) => {
      onChange({ octaves: +e.target.value });
    });

  document
    .querySelector(`${selector}-exponent`)
    .addEventListener('change', (e) => {
      onChange({ exponent: +e.target.value });
    });
};

export const createGain = (selector, onChange) => {
  document.querySelector(`${selector}-gain`).addEventListener('change', (e) => {
    onChange({ gain: +e.target.value });
  });
};

export const createLfo = (selector, onChange) => {
  document
    .querySelector(`${selector}-frequency`)
    .addEventListener('change', (e) => {
      onChange({ frequency: e.target.value });
    });

  document.querySelector(`${selector}-type`).addEventListener('change', (e) => {
    onChange({ type: e.target.value });
  });

  document.querySelector(`${selector}-min`).addEventListener('change', (e) => {
    onChange({ min: +e.target.value });
  });

  document.querySelector(`${selector}-max`).addEventListener('change', (e) => {
    onChange({ max: +e.target.value });
  });
};

export const createLoop = (selector, onChange) => {
  document
    .querySelector(`${selector}-interval`)
    .addEventListener('change', (e) => {
      onChange({ interval: e.target.value });
    });
};

export const createNoise = (selector, onChange) => {
  document.querySelector(`${selector}-type`).addEventListener('change', (e) => {
    onChange({ type: e.target.value });
  });
};

export const createOmniOscillator = (selector, onChange) => {
  document.querySelector(`${selector}-type`).addEventListener('change', (e) => {
    onChange({ type: e.target.value });
  });

  createDetunes(`${selector}-detune`, onChange);

  document
    .querySelector(`${selector}-phase`)
    .addEventListener('change', (e) => {
      onChange({ phase: +e.target.value });
    });
};

export const createPattern = (selector, onChange) => {
  document
    .querySelector(`${selector}-pattern`)
    .addEventListener('change', (e) => {
      onChange({ pattern: e.target.value });
    });

  document
    .querySelector(`${selector}-interval`)
    .addEventListener('change', (e) => {
      onChange({ interval: e.target.value });
    });
};

export const createPiano = (selector, onChange) => {
  const modeEl = document.querySelector(`${selector}-mode`);

  const piano = new Piano(`${selector}-piano`, {
    size: [1000, 125],
    mode: modeEl.value,
    lowNote: 21,
    highNote: 108,
  });

  modeEl.addEventListener('change', (e) => {
    const value = e.target.value;

    piano.mode = value;

    piano.keys.forEach((key) => {
      key.mode = value;
    });
  });

  piano.on('change', ({ note, state }) => {
    onChange(Uint8Array.of(state ? 144 : 128, note, 127));
  });
};

export const createTransport = (selector, onChange) => {
  document.querySelector(`${selector}-bpm`).addEventListener('change', (e) => {
    onChange({ bpm: +e.target.value });
  });

  document
    .querySelector(`${selector}-state`)
    .addEventListener('change', (e) => {
      onChange({ state: e.target.checked });
    });
};
