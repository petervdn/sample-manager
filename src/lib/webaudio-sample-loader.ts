export interface ISample {
  name: string; // filename without extensions
  extension?: string; // forces an extension for this sample
  path?: string; // forces a path
  data?: any; // optional data, for example to put samples in a group
  audioBuffer?: AudioBuffer; // set by the library when loaded
  fileSize?: number; // fileSize of the loaded file (the compressed audio)
}

export function createSamples(names: string[]): ISample[] {
  return names.map(name => createSample(name));
}

export function createSample(name: string, extension?: string, path?: string): ISample {
  return {
    name,
    extension,
    path,
  };
}

interface ILoadAudioBufferResult {
  audioBuffer: AudioBuffer;
  fileSize: number;
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

/**
 * Loads and decodes an audio-file, resulting in an AudioBuffer and the fileSize of the loaded file.
 * @param {AudioContext} context
 * @param {string} url
 * @param {(value: number) => void} onProgress
 * @returns {Promise<ILoadAudioBufferResult>}
 */
function loadAudioBuffer(
  context: AudioContext,
  url: string,
  onProgress: (value: number) => void,
): Promise<ILoadAudioBufferResult> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // listen to onprogress events if onProgress was supplied
    if (onProgress) {
      request.onprogress = event => {
        onProgress(event.loaded / event.total);
      };
    }

    request.onload = () => {
      if (request.status === 200) {
        const fileSize = request.response.byteLength;
        const decodePromise = context.decodeAudioData(
          request.response,
          audioBuffer => {
            resolve({
              audioBuffer,
              fileSize,
            });
          },
          error => {
            reject(error);
          },
        );

        // not all implementations use this promise (was later added to the API). if they do
        // we're catching (and ignoring) errors that may occur through here. these errors are
        // handled by the onError method in the decodeAudioData call (3rd param)
        if (decodePromise) {
          decodePromise.catch(() => {});
        }
      } else {
        reject(`Error loading '${url}' (${request.status})`);
      }
    };

    request.onerror = error => {
      reject(error);
    };

    request.send();
  });
}
