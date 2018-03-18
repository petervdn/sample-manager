import { createSamplesFromNames, SampleManager } from '../../src/';

const context = new AudioContext();
// const samples = createSamplesFromNames(['kickdrum', 'clap', 'orbit']);
//
// samples[0].fileName = 'kick';
// samples[1].path = 'other-path/';
// samples[2].extension = 'mp3';

const manager = new SampleManager(context, 'samples/');
manager.addSamplesFromNames(['kick', 'clap']);
manager.loadAllSamples('wav', console.log).then(() => {
  console.log(manager.getSamples());
});
