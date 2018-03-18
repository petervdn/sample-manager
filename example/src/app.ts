import { createSamplesWithName } from '../../src/lib/utils';
import SampleManager from "../../src/lib/SampleManager";

const context = new AudioContext();
const samples = createSamplesWithName(['kick', 'clap', 'orbit']);

samples[2].extension = 'mp3';


const manager = new SampleManager(context, 'samples/');
manager.addSamples(samples);
manager.loadAllSamples('wav').then(() => {
  console.log(manager.getSampleByName('kick'));
});
