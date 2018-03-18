export interface ICreateSample {
  name: string; // name (will be used as filename when no filename is supplied)
  fileName?: string; // can be used to use another filename than the name
  extension?: string; // forces an extension for this sample
  path?: string; // appends a path to the main path
  data?: any; // optional data, for example to put samples in a group
}

export interface ISample extends ICreateSample {
  audioBuffer?: AudioBuffer; // set by the library when loaded
  fileSize?: number; // fileSize of the loaded file (the compressed audio)
  fileName: string;
}
