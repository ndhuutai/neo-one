import * as path from 'path';
import { normalizePath } from './normalizePath';

const ensureDot = (value: string) => (value.startsWith('.') ? value : `./${value}`);

const stripTS = (value: string) => path.join(path.dirname(value), path.basename(value, '.ts'));

export const getRelativeImport = (from: string, to: string) =>
  ensureDot(normalizePath(stripTS(path.relative(path.dirname(from), to))));
