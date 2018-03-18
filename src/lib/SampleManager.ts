import { ICreateSample, ISample } from './interface';
import { createSamplesFromNames, loadSamples } from './utils';

export default class SampleManager {
  public basePath: string = '';

  private samplesMap: { [name: string]: ISample } = {};
  private context: AudioContext;
  private isLoading: boolean = false;

  constructor(audioContext: AudioContext, basePath?: string) {
    this.context = audioContext;
    this.basePath = basePath;
  }

  /**
   * Loads all samples that are currently present.
   * @param {string} extension
   * @param {(value: number) => void} onProgress
   * @returns {Promise<void>}
   */
  public loadAllSamples(extension: string, onProgress?: (value: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isLoading) {
        reject('Already loading');
      } else {
        this.isLoading = true;
        loadSamples(this.context, this.getSamples(), extension, this.basePath, onProgress).then(
          () => {
            this.isLoading = false;
            resolve();
          },
        );
      }
    });
  }

  /**
   * Gets the list of the current samples.
   * @returns {ISample[]}
   */
  public getSamples(): ISample[] {
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
      throw new Error(`Sample with ma,e ${createSample.name} already exists`);
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
