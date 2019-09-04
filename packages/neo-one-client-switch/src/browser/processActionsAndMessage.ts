import { processActionsAndMessage as processActionsAndMessageBase, ProcessActionsAndMessageOptions } from '../common';

export const processActionsAndMessage = async (options: ProcessActionsAndMessageOptions): Promise<string> => {
  if (process.env.NODE_ENV === 'production' && process.env.NEO_ONE_DEV !== 'true') {
    return options.message;
  }

  return processActionsAndMessageBase(options);
};
