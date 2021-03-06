import { tsUtils } from '@neo-one/ts-utils';
import ts from 'typescript';
import { ScriptBuilder } from '../../../sb';
import { Name } from '../../../scope';
import { VisitOptions } from '../../../types';
import { MemberLikeExpression } from '../../types';
import { SmartContractForBase } from '../SmartContractForBase';

// tslint:disable-next-line export-name
export class SmartContractFor extends SmartContractForBase {
  protected emitInitial(
    sb: ScriptBuilder,
    _func: MemberLikeExpression,
    node: ts.CallExpression,
    addressName: Name,
    options: VisitOptions,
  ): void {
    if (tsUtils.argumented.getArguments(node).length < 1) {
      /* istanbul ignore next */
      return;
    }

    const arg = tsUtils.argumented.getArguments(node)[0];
    // [bufferVal]
    sb.visit(arg, options);
    // []
    sb.scope.set(sb, arg, options, addressName);
  }

  protected emitInvoke(
    sb: ScriptBuilder,
    _func: MemberLikeExpression,
    node: ts.CallExpression,
    prop: ts.Declaration,
    addressName: Name,
    options: VisitOptions,
  ): void {
    if (tsUtils.argumented.getArguments(node).length < 1) {
      /* istanbul ignore next */
      return;
    }

    const arg = tsUtils.argumented.getArguments(node)[0];
    const scriptHash = sb.context.analysis.extractLiteralAddress(arg);
    // TODO: remove this and change how we call smart contracts, including our own
    // [string, params, string]
    sb.emitOp(node, 'TUCK');
    // [2, string, params, string]
    sb.emitPushInt(node, 2);
    // [[string, params], string]
    sb.emitOp(node, 'PACK');
    // [string, [string, params]]
    sb.emitOp(node, 'SWAP');
    if (scriptHash === undefined) {
      // [bufferVal, string, params]
      sb.scope.get(sb, arg, options, addressName);
      // [buffer, string, params]
      sb.emitHelper(prop, options, sb.helpers.unwrapBuffer);
      // [result]
      sb.emitSysCall(node, 'System.Contract.Call');
    } else {
      // [buffer, string, params]
      sb.emitPushBuffer(prop, scriptHash);
      // [result]
      sb.emitSysCall(node, 'System.Contract.Call');
    }
  }
}
