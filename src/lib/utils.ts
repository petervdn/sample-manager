import { loadAudioBuffer } from 'audiobuffer-loader';
import { ICreateSample, ISample } from './interface';

/**
 * Creates a list of ICreateSample instances with only the name-field set.
 * @param {string[]} names
 * @returns {ISample[]}
 */
export function createSamplesWithName(names: string[]): ICreateSample[] {
  return names.map(name => createSample({ name }));
}

/**
 * Creates an ICreateSample instance.
 * @param {ICreateSample} data
 * @returns {ICreateSample}
 */
export function createSample(data: ICreateSample): ICreateSample {
  return {
    name: data.name,
    extension: data.extension,
    path: data.path,
  };
}

/**
 * Loads a list of samples.
 * @param {AudioContext} context
 * @param {ISample[]} samples
 * @param {string} extension
 * @param {string} path
 * @param {(value: number) => void} onProgress
 * @returns {Promise<AudioBuffer[]>}
 */
export function loadSamples(
  context: AudioContext,
  samples: ISample[],
  extension: string,
  path: string,
  onProgress?: (value: number) => void,
): Promise<ISample[]> {
  // if there is an onProgress supplied, we need to keep track of every samples' (load) progress
  let callback;
  if (onProgress) {
    // create list of progress-values for all samples (set to 1 if they're loaded aldready)
    const progressValues = samples.map(sample => (sample.audioBuffer ? 1 : 0));

    // create the callback-method that is passed to every load action
    callback = (index, value) => {
      // set the correct progressValue for the sample that called it
      progressValues[index] = value;

      // calculate the full progress to give back to the onProgress
      onProgress(progressValues.reduce((acc, curr) => acc + curr, 0) / progressValues.length);
    };
  }

  // create a list of promises for each load-action
  const loadPromises: Promise<void>[] = samples.map((sample, sampleIndex) => {
    if (sample.audioBuffer) {
      return Promise.resolve();
    }

    const url = `${path}${sample.path || ''}${sample.name}.${sample.extension || extension}`;
    return loadAudioBuffer(context, url, value => {
      callback(sampleIndex, value);
    }).then(result => {
      sample.audioBuffer = result.audioBuffer;
      sample.fileSize = result.fileSize;
    });
  });
  return Promise.all(loadPromises).then(() => samples);
}
