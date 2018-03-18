import { createSamplesWithName, SampleManager } from '../../src/';

const context = new AudioContext();
const samples = createSamplesWithName(['kickdrum', 'clap', 'orbit']);

samples[0].fileName = 'kick';
samples[1].path = 'other-path/';
samples[2].extension = 'mp3';

const manager = new SampleManager(context, 'samples/');
manager.addSamples(samples);
manager.loadAllSamples('wav', console.log).then(() => {
  console.log(manager.getSampleByName('kickdrum'));
});
