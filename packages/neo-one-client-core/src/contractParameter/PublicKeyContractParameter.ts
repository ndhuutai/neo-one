import { ContractParameterType } from './ContractParameterType';
import { ContractParameterBase } from './ContractParameterBase';
import {
  DeserializeWireBaseOptions,
  SerializeJSONContext,
} from '../Serializable';
import { common, ECPoint } from '../common';
import { utils, BinaryWriter, IOHelper, JSONHelper } from '../utils';

export interface PublicKeyContractParameterJSON {
  type: 'PublicKey';
  value: string;
}

export class PublicKeyContractParameter extends ContractParameterBase<
  PublicKeyContractParameter,
  PublicKeyContractParameterJSON,
  ContractParameterType.PublicKey
> {
  public static deserializeWireBase(
    options: DeserializeWireBaseOptions,
  ): PublicKeyContractParameter {
    const { reader } = options;
    super.deserializeContractParameterBaseWireBase(options);
    const value = reader.readECPoint();

    return new this(value);
  }

  public readonly type = ContractParameterType.PublicKey;
  public readonly value: ECPoint;
  private readonly sizeInternal: () => number;

  constructor(value: ECPoint) {
    super();
    this.value = value;
    this.sizeInternal = utils.lazy(() => IOHelper.sizeOfECPoint(this.value));
  }

  public get size(): number {
    return this.sizeInternal();
  }

  public asBuffer(): Buffer {
    return common.ecPointToBuffer(this.value);
  }

  public serializeWireBase(writer: BinaryWriter): void {
    super.serializeWireBase(writer);
    writer.writeECPoint(this.value);
  }

  public serializeJSON(
    context: SerializeJSONContext,
  ): PublicKeyContractParameterJSON {
    return {
      type: 'PublicKey',
      value: JSONHelper.writeECPoint(this.value),
    };
  }
}
