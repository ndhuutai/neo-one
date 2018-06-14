export type BlockchainInterfaceName =
  | 'AccountBase'
  | 'AssetBase'
  | 'AttributeBase'
  | 'BlockBase'
  | 'ContractBase'
  | 'HeaderBase'
  | 'InputBase'
  | 'OutputBase'
  | 'TransactionBase'
  | 'ValidatorBase'
  | 'StorageContextBase'
  | 'StorageIteratorBase';

export enum InternalBlockchainInterfaceProperties {
  BlockchainInterface = 'BlockchainInterface',
}
