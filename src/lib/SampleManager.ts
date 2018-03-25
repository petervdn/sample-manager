import { ICreateSample, ISample } from './interface';
import { createSamplesFromNames, loadSamples } from './utils';

export default class SampleManager {
  public context: AudioContext;
  public basePath: string;
  public extension: string;

  private samplesMap: { [name: string]: ISample } = {};
  private isLoading: boolean = false;

  constructor(context: AudioContext, basePath: string, extension: string) {
    this.context = context;
    this.basePath = basePath;
    this.extension = extension;
  }

  /**
   * Loads all samples that are currently present. Returns a promise.
   * @param {(value: number) => void} onProgress
   * @returns {Promise<void>}
   */
  public loadAllSamples(onProgress?: (value: number) => void): Promise<void> {
    return this.loadSamples(this.getAllSamples(), onProgress);
  }

  /**
   * Loads a list of samples, returns a promise.
   * @param {ISample[]} samples
   * @param {(value: number) => void} onProgress
   * @returns {Promise<void>}
   */
  public loadSamples(samples: ISample[], onProgress?: (value: number) => void): Promise<void> {
    // todo check if sample exists in this manager?
    return new Promise((resolve, reject) => {
      if (this.isLoading) {
        reject('Already loading');
      } else {
        this.isLoading = true;
        loadSamples(this.context, samples, this.extension, this.basePath, onProgress).then(() => {
          this.isLoading = false;
          resolve();
        });
      }
    });
  }

  /**
   * Loads a list of samples by their names. Returned promise will be rejected if one or more
   * samples can not be found (nothing will be loaded).
   * @param {string[]} names
   * @param {(value: number) => void} onProgress
   * @returns {Promise<void>}
   */
  public loadSamplesByName(names: string[], onProgress?: (value: number) => void): Promise<void> {
    // check if all samples exist in the manager
    const results = {
      foundSamples: [],
      notFoundNames: [],
    };
    names.forEach(name => {
      if (this.samplesMap[name]) {
        results.foundSamples.push(this.samplesMap[name]);
      } else {
        results.notFoundNames.push(name);
      }
    });

    if (results.notFoundNames.length > 0) {
      return Promise.reject(
        `Loading samples failed: ${
          results.notFoundNames.length
        } sample(s) not found in manager: ${results.notFoundNames.join(', ')}`,
      );
    }

    return this.loadSamples(results.foundSamples, onProgress);
  }

  /**
   * Gets the list of the current samples.
   * @returns {ISample[]}
   */
  public getAllSamples(): ISample[] {
    return Object.keys(this.samplesMap).map(key => this.samplesMap[key]);
  }

  /**
   * Adds a sample to the manager. Throws an error when a sample with the same name already exists.
   * @param {ICreateSample} createSample
   */
  public addSample(createSample: ICreateSample): void {
    if (!this.samplesMap[createSample.name]) {
      // create actual sample object
      const sample: ISample = {
        name: createSample.name,
        fileName: createSample.fileName || createSample.name,
        path: createSample.path || null,
        extension: createSample.extension || null,
        data: createSample.data || null,
        audioBuffer: null,
        fileSize: -1,
      };

      // add to hashmap
      this.samplesMap[sample.name] = sample;
    } else {
      throw new Error(`Sample with name ${createSample.name} already exists`);
    }
  }

  /**
   * Adds multiple samples to the manager. Throws an error when a sample with the same name already exists.
   * @param {ICreateSample[]} samples
   */
  public addSamples(samples: ICreateSample[]): void {
    samples.forEach(createSample => this.addSample(createSample));
  }

  /**
   * Creates and adds samples from a list of names.
   * @param {string[]} names
   */
  public addSamplesFromNames(names: string[]): void {
    this.addSamples(createSamplesFromNames(names));
  }

  /**
   * Retrieves a sample by supplying a name.
   * @param {string} name
   * @returns {ISample}
   */
  public getSampleByName(name: string): ISample {
    return this.samplesMap[name] || null;
  }
}
