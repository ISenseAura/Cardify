export type RunOptionNames = 'offline' | 'incrementalBuild' | 'modules' | 'categories' | 'games' | 'gameSeed' | 'mochaRuns' | 'script' |
    'grep' | 'noBuild' | 'noRemote' | 'noSha' | 'regression';
export type RunOptions = PartialKeyedDict<RunOptionNames, string>;

export type InputFolderNames = 'root' | 'Lanette-private' | 'private' | 'src' | 'web';

export type InputFolders = KeyedDict<InputFolderNames, IInputMetadata>;

export interface IInputMetadata {
    buildPath: string;
    inputPath: string;
    tsConfig?: string;
}