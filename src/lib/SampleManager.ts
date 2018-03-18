import { ISample } from './interface';

export default class SampleManager {
  private samples: ISample[] = [];
  private context: AudioContext;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;

    this.samples;
    this.context;
  }
}
