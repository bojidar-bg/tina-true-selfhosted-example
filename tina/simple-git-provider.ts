import { GitProvider } from '@tinacms/datalayer'
import { mkdir, outputFile, remove } from 'fs-extra'
import path from 'node:path'
import { CloneOptions, SimpleGit, SimpleGitOptions, simpleGit } from 'simple-git'

export interface SimpleGitProviderOptions {
  /// Directory to a local clone of the repository, dedicated for editing. Required.
  repoDir: string
  
  /// If set, configures how to clone the repository
  cloneRepo?: {
    remote: string,
    options?: CloneOptions,
  }
  /// whether to pull the repository _upon initialization_. Defaults to true.
  pullRepo?: boolean
  /// whether to push the repository after committing. Defaults to true.
  pushRepo?: boolean
  /// commit message for the created commits. Defaults to "Edited with TinaCMS".
  commitMessage?: string | ((path: string) => string)
  /// Encoding to use for files; defaults to "utf8"
  encoding?: BufferEncoding
  /// Options to pass to simpleGit
  simpleGit?: Omit<SimpleGitOptions, 'baseDir'>
}

export class SimpleGitProvider implements GitProvider {
  private gitClient: SimpleGit;
  public options: SimpleGitProviderOptions;
  private initPromise: Promise<void>;
  private commitMessage: ((path: string) => string);
  private encoding: BufferEncoding;
  
  constructor(options: SimpleGitProviderOptions) {
    this.options = options;
    this.initPromise = this.init();
    this.commitMessage = typeof options.commitMessage == 'function' ?
      options.commitMessage :
      () => (options.commitMessage || 'Edited with TinaCMS') + '';
    this.encoding = options.encoding || 'utf8'
  }
  
  private async init(): Promise<void> {
    let simpleGitOptions = Object.assign({
      baseDir: this.options.repoDir
    }, this.options.simpleGit)
    
    await mkdir(this.options.repoDir, {recursive: true})
    
    this.gitClient = simpleGit(simpleGitOptions);
    // Ensure we have a repository
    if (!await this.gitClient.checkIsRepo()) {
      if (this.options.cloneRepo) {
        await this.gitClient.clone(
          this.options.cloneRepo.remote,
          this.options.cloneRepo.options)
      } else {
        throw new Error(`Not a git repository: ${this.options.repoDir}`);
      }
    }
    // Pull the repository if we need to
    if (this.options.pullRepo ?? true) {
      this.gitClient.pull();
    }
  }
  
  async onPut(key: string, value: string): Promise<void> {
    // Make sure init() completed
    await this.initPromise
    // Modify file locally
    let filePath = path.join(this.options.repoDir, key)
    await outputFile(filePath, value, this.encoding)
    // Commit the changed file
    await this.makeCommit(key)
  }
  
  async onDelete(key: string): Promise<void> {
    // Make sure init() completed
    await this.initPromise
    // Modify file locally
    let filePath = path.join(this.options.repoDir, key)
    await remove(filePath)
    // Commit the changed file
    await this.makeCommit(key)
  }
  
  async makeCommit(file: string): Promise<void> {
    await this.gitClient.add([file])
    await this.gitClient.commit(this.commitMessage(file), [file])
    if (this.options.pushRepo ?? true) {
      await this.gitClient.push()
    }
  }
}
