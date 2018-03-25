import chai, { expect, should } from 'chai';
import { createFakeServer } from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import 'web-audio-test-api';
import SampleManager from '../src/lib/SampleManager';
import { createSamplesFromNames } from '../src';

should();
chai.use(chaiAsPromised);

let context = new AudioContext();
let manager: SampleManager = null;
let server = null;

describe('utils', () => {
  beforeEach(() => {
    manager = new SampleManager(context, '/samples/', 'mp3');
  });
  it('should create samples from names', () => {
    const samples = createSamplesFromNames(['sample1', 'sample2']);
    expect(samples).to.deep.equal([
      {
        name: 'sample1',
      },
      {
        name: 'sample2',
      },
    ]);
  });
});

describe('sample-manager', () => {
  beforeEach(() => {
    manager = new SampleManager(context, '/samples/', 'mp3');
    server = createFakeServer();
    server.respondWith('GET', '/testfile.json', [
      200,
      { 'Content-Type': 'application/json' },
      '[{ "id": 12, "comment": "Hey there" }]',
    ]);

    server.respondWith('GET', '/samples/sample1.mp3', [200, {}, 'whatever']);

    server.respondWith('GET', '/samples/sample2.mp3', [200, {}, 'whatever']);

    server.autoRespond = true;
  });

  it('should construct', () => {
    expect(manager.basePath).to.equal('/samples/');
    manager.extension.should.equal('mp3');
  });

  it('should add samples', () => {
    manager.addSamples(createSamplesFromNames(['sample1', 'sample2']));
    expect(manager.getAllSamples()).to.have.lengthOf(2);
  });
  it('should get a sample by name', () => {
    manager.addSamples(createSamplesFromNames(['sample1']));
    expect(manager.getSampleByName('sample1')).to.deep.equal({
      name: 'sample1',
      fileName: 'sample1',
      extension: null,
      data: null,
      path: null,
      audioBuffer: null,
      fileSize: -1,
    });
  });

  it('should reject loading when a name is not found', () => {
    manager.addSamples(createSamplesFromNames(['sample1']));
    return expect(manager.loadSamplesByName(['nonexistingsample'])).to.be.rejectedWith(
      'Loading samples failed: 1 sample(s) not found in manager: nonexistingsample',
    );
  });

  it('should reject loading when already loading', () => {
    server.autoRespondAfter = 500;
    manager.addSamples(createSamplesFromNames(['sample1']));
    manager.loadAllSamples();
    return expect(manager.loadAllSamples()).to.be.rejectedWith('Already loading');
  });

  it('should not add samples with duplicate names', () => {
    expect(() => {
      manager.addSamples(createSamplesFromNames(['sample1', 'sample1']));
    }).to.throw('Sample with name sample1 already exists');
  });

  it('should load and decode a sample', () => {
    manager.addSamplesFromNames(['sample1']);
    return manager.loadAllSamples().then(() => {
      expect(manager.getSampleByName('sample1').audioBuffer).to.not.equal(null);
    });
  });
  it('should do progress callback', () => {
    manager.addSamplesFromNames(['sample1', 'sample2']);
    let progress = 0;
    return manager
      .loadAllSamples(p => {
        progress = p;
      })
      .then(() => {
        expect(progress).to.equal(1);
      });
  });

  it('should return null when retrieving unknown sample by name', () => {
    manager.addSamplesFromNames(['sample1']);
    expect(manager.getSampleByName('unkown')).to.equal(null);
  });

  it('should load samples by name', () => {
    manager.addSamplesFromNames(['sample1', 'sample2']);
    return manager.loadSamplesByName(['sample1', 'sample2']).then(() => {
      expect(manager.getSampleByName('sample1').audioBuffer).to.not.equal(null);
      expect(manager.getSampleByName('sample2').audioBuffer).to.not.equal(null);
    });
  });

  it('should not load a loaded sample twice', () => {
    let bufferFromFirstLoad;
    manager.addSamplesFromNames(['sample1']);
    return manager
      .loadAllSamples()
      .then(() => {
        bufferFromFirstLoad = manager.getSampleByName('sample1').audioBuffer;
        return manager.loadAllSamples(p => {});
      })
      .then(() => {
        expect(manager.getSampleByName('sample1').audioBuffer).to.equal(bufferFromFirstLoad);
      });
  });
});
