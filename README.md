# sample-manager

Create, load and keep track of samples

### install
```sh
npm install sample-manager
```

### creating the manager

To create the SampleManager, you need an `AudioContext` instance and a basepath where the actual sample-files are located. 

```typescript
import { SampleManager } from 'sample-manager';

const context = new AudioContext();
const manager = new SampleManager(context, 'path/to/samples');
```

### adding samples
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
    name: 'sample1'
  },
  {
    name: 'sample2',
    extension: 'mp3' // will always load as mp3
  },
  {
      name: 'sample3',
      fileName: 'sample3.v11.final2' // will not use the name to load the file 
    },
  {
    name: 'car',
    path: 'car-sounds/' // will be appended to the path when loading 
  },
]
```
__Extensions (.mp3, .wav) should never be added to the name (when using name as filename) or filename, this needs to be supplied when actually loading the samples__

When you have a list of these objects, you can add them to the SampleManager instance:

```typescript
manager.addSamples(samples);
```

When you don't have any special exceptions regarding path, filename or extension, and only want to use the `name` field, you can use the `createSamplesFromNames` function like so:

```typescript
import { createSamplesFromNames } from 'sample-maanger';

const samples = createSamplesFromNames(['sample1', 'sample2']);
```

Or even quicker: add them directly to the manager:

```typescript
manager.addSamplesFromNames(['sample1', 'sample2']);
```

### sample objects
After adding, all objects will be converted to the `ISample` interface, which extends `ICreateSample` and adds two properties: `audioBuffer` and `fileSize` (which default to `null` and `-1` but will have proper data once the sample is loaded). It also makes the `fileName` property no longer optional (will be either the `name` or `fileName` from the original object).   

```typescript
interface ISample extends ICreateSample {
  audioBuffer: AudioBuffer;
  fileSize: number;
  fileName: string;
}

```

### loading samples
 When samples have been added, you can load them using the `loadAllSamples` method (returns a promise), which requires an extension (this way you can easily swap everything you load from wav to mp3). Samples that have been added with their own `extension` property will ignore the parameter you give to the `loadAllSamples` method.
 
 ```typescript
manager.loadAllSamples('mp3')
  .then(() => {
    // done
  })
```

Optionally, you can add a callback that will track the overall loadprogress.

```typescript
manager.loadAllSamples(
  'mp3',
  progress => {
    progressBar.width = progress * 100;   
  },
 )
```
Note that this callback will not be fired at all during decoding (which happens after a file is loaded). This may not be noticable for smaller files, but when you have files containing many minutes of audio the progress will not change for a while. 


### retrieving samples
```typescript
const sample = manager.getSampleByName('kickdrum');
const samples = manager.getSamples();
```
