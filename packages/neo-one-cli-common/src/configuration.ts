import { UserAccountProvider } from '@neo-one/client-full-core';

export type CodegenFramework = 'none' | 'react' | 'angular' | 'vue';

export interface ContractsConfiguration {
  readonly path: string;
}

export interface CodegenConfiguration {
  readonly path: string;
  readonly framework: CodegenFramework;
  readonly browserify: boolean;
}

export interface NetworkConfiguration {
  readonly path: string;
  readonly port: number;
}

export interface NetworksNetworkConfiguration {
  readonly userAccountProvider: () => Promise<UserAccountProvider>;
}

export interface NetworksConfiguration {
  readonly [name: string]: NetworksNetworkConfiguration;
}

export interface NEOTrackerConfiguration {
  readonly path: string;
  readonly port: number;
}

export interface Configuration {
  readonly contracts: ContractsConfiguration;
  readonly codegen: CodegenConfiguration;
  readonly network: NetworkConfiguration;
  readonly networks: NetworksConfiguration;
  readonly neotracker: NEOTrackerConfiguration;
}