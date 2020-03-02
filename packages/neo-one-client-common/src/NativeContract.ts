import { BN } from 'bn.js';
import { common, UInt160 } from './common';
import { crypto } from './crypto';
import { sha256 } from './models';
import { ScriptBuilder } from './ScriptBuilder';

export type NativeContractServiceName = 'Neo.Native.Policy' | 'Neo.Native.Tokens.GAS' | 'Neo.Native.Tokens.NEO';

class NativeContract {
  public readonly serviceName: NativeContractServiceName;
  public readonly script: Buffer;
  public readonly scriptHex: string;
  public readonly hash: UInt160;
  public readonly scriptHash: string;

  public constructor(serviceName: NativeContractServiceName) {
    this.serviceName = serviceName;
    this.script = new ScriptBuilder()
      .emitOp('SYSCALL', new BN(sha256(Buffer.from(serviceName, 'ascii')).readUInt32LE(0)).toBuffer('le'))
      .build();
    this.scriptHex = this.script.toString('hex');
    this.hash = crypto.toScriptHash(this.script);
    this.scriptHash = common.uInt160ToHex(this.hash);
  }
}

export const NativeContracts = {
  NEO: new NativeContract('Neo.Native.Tokens.NEO'),
  GAS: new NativeContract('Neo.Native.Tokens.GAS'),
  Policy: new NativeContract('Neo.Native.Policy'),
};
