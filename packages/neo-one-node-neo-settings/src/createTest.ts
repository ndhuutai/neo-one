import { common as clientCommon, crypto } from '@neo-one/client-common';
import { Settings } from '@neo-one/node-core';
import { common } from './common';

const testNetMessageMagic = 5195086;
// From Postman: 827601742
// From ProtocolSettings: 5195086

const DEFAULT_VALIDATORS: readonly string[] = [
  '03009b7540e10f2562e5fd8fac9eaec25166a58b26e412348ff5a86927bfac22a2',
  '023e9b32ea89b94d066e649b124fd50e396ee91369e8e2a6ae1b11c170d022256d',
  '03408dcd416396f64783ac587ea1e1593c57d9fea880c8a6a1920e92a259477806',
  '02a7834be9b32e2981d157cb5bbd3acb42cfd11ea5c3b10224d7a44e98c5910f1b',
  '02ba2c70f5996f357a43198705859fae2cfea13e1172962800772b3d588a9d4abd',
  '03daca45da7acf52602c630e58af4f45a894a427fa274544cadac5335a9a293d4e',
  '02f889ecd43c5126ff1932d75fa87dea34fc95325fb724db93c8f79fe32cc3f180',
];

export const createTest = ({
  privateNet,
  standbyValidators: standbyValidatorsIn = DEFAULT_VALIDATORS,
  extraCommitteeMembers: extraCommitteeMembersIn = [],
  millisecondsPerBlock,
}: {
  readonly privateNet?: boolean;
  readonly standbyValidators?: readonly string[];
  readonly extraCommitteeMembers?: readonly string[];
  readonly millisecondsPerBlock?: number;
} = {}): Settings => {
  const standbyValidators = standbyValidatorsIn.map((value) => clientCommon.stringToECPoint(value));
  const standbyMembers = extraCommitteeMembersIn.map((value) => clientCommon.stringToECPoint(value));
  const standbyCommittee = standbyValidators.concat(standbyMembers);

  const consensusAddress = crypto.getBFTAddress(standbyValidators);

  const commonSettings = common({
    privateNet,
    consensusAddress,
    messageMagic: testNetMessageMagic,
  });

  return {
    genesisBlock: commonSettings.genesisBlock,
    decrementInterval: commonSettings.decrementInterval,
    generationAmount: commonSettings.generationAmount,
    millisecondsPerBlock:
      millisecondsPerBlock === undefined ? commonSettings.millisecondsPerBlock : millisecondsPerBlock,
    standbyCommittee,
    committeeMembersCount: standbyCommittee.length,
    memoryPoolMaxTransactions: commonSettings.memoryPoolMaxTransactions,
    validatorsCount: standbyValidators.length,
    messageMagic: testNetMessageMagic,
    addressVersion: clientCommon.NEO_ADDRESS_VERSION,
    privateKeyVersion: clientCommon.NEO_PRIVATE_KEY_VERSION,
    standbyValidators,
    maxBlockSize: commonSettings.maxBlockSize,
    maxBlockSystemFee: commonSettings.maxBlockSystemFee,
    nativeUpdateHistory: commonSettings.nativeUpdateHistory,
    maxTransactionsPerBlock: commonSettings.maxTransactionsPerBlock,
    maxTraceableBlocks: commonSettings.maxTraceableBlocks,
  };
};
