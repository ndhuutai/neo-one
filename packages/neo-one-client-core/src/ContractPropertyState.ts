import { CustomError } from '@neo-one/utils';

export enum ContractPropertyState {
  NoProperty = 0x00,
  HasStorage = 0x01,
  HasDynamicInvoke = 0x02,
  Payable = 0x04,
  HasStorageDynamicInvoke = 0x03,
  HasStoragePayable = 0x05,
  HasDynamicInvokePayable = 0x06,
  HasStorageDynamicInvokePayable = 0x07,
}

export const HasStorage = new Set([
  ContractPropertyState.HasStorage,
  ContractPropertyState.HasStorageDynamicInvoke,
  ContractPropertyState.HasStoragePayable,
  ContractPropertyState.HasStorageDynamicInvokePayable,
]) as Set<ContractPropertyState>;

export const HasDynamicInvoke = new Set([
  ContractPropertyState.HasDynamicInvoke,
  ContractPropertyState.HasStorageDynamicInvoke,
  ContractPropertyState.HasDynamicInvokePayable,
  ContractPropertyState.HasStorageDynamicInvokePayable,
]) as Set<ContractPropertyState>;

export const HasPayable = new Set([
  ContractPropertyState.Payable,
  ContractPropertyState.HasStoragePayable,
  ContractPropertyState.HasDynamicInvokePayable,
  ContractPropertyState.HasStorageDynamicInvokePayable,
]) as Set<ContractPropertyState>;

export class InvalidContractPropertyStateError extends CustomError {
  public readonly code: string;
  public readonly contractParameterType: number;

  constructor(contractParameterType: number) {
    super(
      `Expected contract parameter type, ` +
        `found: ${contractParameterType.toString(16)}`,
    );

    this.contractParameterType = contractParameterType;
    this.code = 'INVALID_ContractPropertyState';
  }
}

const isContractPropertyState = (
  value: number,
): value is ContractPropertyState => ContractPropertyState[value] != null;

export const assertContractPropertyState = (
  value: number,
): ContractPropertyState => {
  if (isContractPropertyState(value)) {
    return value;
  }

  throw new InvalidContractPropertyStateError(value);
};

export const getContractProperties = ({
  hasStorage,
  hasDynamicInvoke,
  payable,
}: {
  hasStorage: boolean;
  hasDynamicInvoke: boolean;
  payable: boolean;
}): ContractPropertyState => {
  if (hasStorage && hasDynamicInvoke && payable) {
    return ContractPropertyState.HasStorageDynamicInvokePayable;
  }

  if (hasStorage && hasDynamicInvoke) {
    return ContractPropertyState.HasStorageDynamicInvoke;
  }

  if (hasStorage && payable) {
    return ContractPropertyState.HasStoragePayable;
  }

  if (hasDynamicInvoke && payable) {
    return ContractPropertyState.HasDynamicInvokePayable;
  }

  if (hasDynamicInvoke) {
    return ContractPropertyState.HasDynamicInvoke;
  }

  if (hasStorage) {
    return ContractPropertyState.HasStorage;
  }

  if (payable) {
    return ContractPropertyState.Payable;
  }

  return ContractPropertyState.NoProperty;
};
