# webaudio-sample-loader

Promise-based loader for samples using the Web Audio API.

### install
```sh
npm install webaudio-sample-loader
```

### sample objects

This library works with objects that adhere to the *ISample* interface.

```typescript
export interface ISample {
  name: string;                // filename without extension
  extension?: string;          // forces an extension for this sample
  path?: string;               // appends a path when loading
  data?: any;                  // optional data for adding custom props 
  audioBuffer?: AudioBuffer;   // set by the library when loaded
  fileSize?: number;           // fileSize of the loaded file (the compressed audio)
}
```

Only the *name* property is mandatory, all others are optional. *audioBuffer* and *fileSize* should not be added, that's done by the library after loading the sample.

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
    name: 'car',
    path: 'car-sounds/' // will be appended to the path when loading 
  },
]
```
When you only want to use the *name* field, you can use the *createSamples* function like so:

```typescript
import { createSamples } from 'webaudio-sample-loader';

const samples = createSamples('sample1', 'sample2');
```

### loading samples
 When you have created a list of samples, you can load them using the *loadSamples* function (which needs an *AudioContext* instance). 
 
 ```typescript
import { loadSamples } from 'webaudio-sample-loader';

const context = new AudioContext();

loadSamples(context, samples, 'mp3', 'path/to/samples')
  .then(loadedSamples => {
    // samples === loadedSamples
  })
```

Optionally, you can add a callback that will give you the loadprogress.

```typescript
loadSamples(
  context,
  samples,
  'mp3',
  'path/to/samples',
  progress => {
    progressBar.width = progress * 100;   
  },
 )
```
Note that this callback will not be fired at all during decoding (which happens after a file is loaded). This may not be noticable for smaller files, but when you have files containing many minutes of audio the progress will not change for a while. 
