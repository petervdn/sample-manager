import { loadSamples, createSamplesWithName } from '../../src/lib/utils';

const context = new AudioContext();
const samples = createSamplesWithName(['kick', 'clap', 'orbit']);

samples[1].path = 'other-path/';
samples[2].extension = 'mp3';

loadSamples(context, samples, 'wav', 'samples/', (value) => {
  console.log('progress', value);
}).then(result => {
  console.log(result);
});
