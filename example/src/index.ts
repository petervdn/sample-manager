import { SampleManager } from '../../src/';

const context = new AudioContext();

const manager = new SampleManager(context, 'samples/');
manager.addSamplesFromNames(['kick', 'clap']);
manager.loadAllSamples('wav').then(() => {
  console.log(manager.getSamples());
});
