# sample-manager

Create, load and keep track of samples

## install
```sh
npm install sample-manager
```

## creating the manager

To create the SampleManager, you need an `AudioContext` instance, a basepath where the sample-files are located and a default file extension (without the dot).

```typescript
import SampleManager from 'sample-manager';

const context = new AudioContext();
const manager = new SampleManager(context, 'path/to/samples', 'mp3');
```

## adding samples
After this, you can add samples to the manager by using the `addSample` or `addSamples` method, which both need objects that adhere to the `ICreateSample` interface.

```typescript
interface ICreateSample {
  name: string; // name (will be used as filename when no filename is supplied)
  fileName?: string; // can be used to use another filename than the name
  extension?: string; // forces an extension for this sample
  path?: string; // appends a path to the basepath
  data?: any; // optional data, for example to put samples in a group
}
```
Only the `name` property is mandatory, all others are optional. The `name` can be anything but will be used as filename when the `fileName` property is not set.

```typescript
const samples = [
  {
    name: 'sample1' // when extension is 'mp3', this will load sample1.mp3
  },
  {
    name: 'sample2',
    extension: 'mp3' // will always load as mp3, and ignore the extension in the constructor
  },
  {
    name: 'sample3',
    fileName: 'sample3.v11.final2' // will not use the name to load the file
  },
  {
    name: 'car',
    path: 'car-sounds/' // will be appended to the basepath when loading
  },
]
```
__Extensions (.mp3, .wav) should never be added to the name (when using name as filename) or filename, since the extension supplied in the manager's contructor will always be appended when loading.__

When you have a list of these objects, you can add them to the SampleManager instance:

```typescript
manager.addSamples(samples);
```

So when you don't have any special exceptions regarding path, filename or extension, you can just use the `name` field. Samples can then be quickly added like so:

```typescript
const list = ['sample1', 'sample2'].map(name => ({name}));
manager.addSamples(list);
```

__Sample names should be unique, adding a name that already exists will throw an error.__

## sample objects
After adding, all objects will be converted to the `ISample` interface, which extends `ICreateSample` and adds two properties: `audioBuffer` and `fileSize` (which default to `null` and `-1` but will have proper data once the sample is loaded). It also makes the `fileName` property no longer optional (will be either the `name` or `fileName` from the original object).

```typescript
interface ISample extends ICreateSample {
  audioBuffer: AudioBuffer;
  fileSize: number;
  fileName: string;
}

```

## loading samples
 When samples have been added, you can load them using the `loadAllSamples` method, which returns a promise.

 ```typescript
manager.loadAllSamples().then(() => {
    // done
  })
```

If you want to load only a subset, you can refer to them by their name:
```typescript
manager.loadSamplesByName(['bird', 'car']);
```

Both the `loadAllSamples` and `loadSamplesByName` method accept an optional callback to track the overall load progress.

```typescript
manager.loadAllSamples(progress => {});

manager.loadSamplesByName(['bird', 'car'], progress => {});
```
Note that this callback will not be fired at all during decoding (which happens after a file is loaded). This may not be noticable for smaller files, but when you have files containing many minutes of audio the progress will not change for a while.


## retrieving samples
```typescript
const sample = manager.getSampleByName('kickdrum');
const samples = manager.getSamples();
```
