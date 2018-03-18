import { loadAudioBuffer, loadSamples, createSamples, createSample } from '../../src/lib/webaudio-sample-loader';

const context = new AudioContext();
const samples = createSamples(['kick', 'clap', 'orbit']);

samples[1].path = 'other-path/';
samples[2].extension = 'mp3';

loadSamples(context, samples, 'wav', 'samples/', (value) => {
  console.log('progress', value);
}).then(result => {
  console.log(result);
});
