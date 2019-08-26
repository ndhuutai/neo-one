import _ from 'lodash';
import { ContractPaths } from '../type';
import { getMigrationSmartContractName, getSmartContractName } from '../types';
import { getRelativeImport, lowerCaseFirst } from '../utils';

export const genCommonTypes = ({
  contractsPaths,
  commonTypesPath,
}: {
  readonly contractsPaths: ReadonlyArray<ContractPaths>;
  readonly commonTypesPath: string;
}) => {
  const sortedPaths = _.sortBy(contractsPaths, [({ name }: ContractPaths) => name]);

  return {
    ts: `
${sortedPaths
  .map(
    ({ name, typesPath }) =>
      `import { ${getSmartContractName(name)}, ${getMigrationSmartContractName(name)} } from '${getRelativeImport(
        commonTypesPath,
        typesPath,
      )}'`,
  )
  .join('\n')}

export interface Contracts {
  ${sortedPaths.map(({ name }) => `readonly ${lowerCaseFirst(name)}: ${getSmartContractName(name)};`).join('\n  ')}
}

export interface MigrationContracts {
  ${sortedPaths
    .map(({ name }) => `readonly ${lowerCaseFirst(name)}: ${getMigrationSmartContractName(name)};`)
    .join('\n  ')}
}
`,
  };
};
