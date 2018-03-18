import { createSamplesWithName } from '../../src/lib/utils';
import SampleManager from "../../src/lib/SampleManager";

const context = new AudioContext();
const samples = createSamplesWithName(['kickdrum', 'clap', 'orbit']);

samples[0].filename = 'kick';
samples[2].extension = 'mp3';

const manager = new SampleManager(context, 'samples/');
manager.addSamples(samples);
manager.loadAllSamples('wav', value => {console.log(value)}).then(() => {
  console.log(manager.getSampleByName('kickdrum'));
});
