import { DefaultMonitor, Monitor } from '@neo-one/monitor';
import { createLogger, format, transports } from 'winston';

export const createMonitor = (): Monitor => {
  const formats = format.combine(format.timestamp(), format.json());
  const logger = createLogger({
    transports: [
      new transports.Console({
        level: 'verbose',
        format: formats,
      }),
    ],
  });

  logger.on('error', (error) => {
    // tslint:disable-next-line:no-console
    console.error(error);
  });

  return DefaultMonitor.create({
    service: 'node',
    logger: {
      log: (logMessage) => {
        const { error, ...rest } = logMessage;

        let message: typeof rest & { stack?: string | undefined } = { ...rest };
        if (error !== undefined) {
          message = {
            ...message,
            stack: error.stack,
          };
        }

        if (logger.transports.length > 0) {
          // tslint:disable-next-line no-any
          logger.log(message as any);
        }
      },
      close: (callback) => {
        let exited = false;
        const doExit = () => {
          if (!exited) {
            exited = true;
            callback();
          }
        };
        const numFlushes = logger.transports.length;
        let numFlushed = 0;
        logger.transports.forEach((transport) => {
          transport.once('finish', () => {
            numFlushed += 1;
            if (numFlushes === numFlushed) {
              setTimeout(doExit, 30);
            }
          });

          transport.end();
        });

        // Force an exit
        setTimeout(doExit, 250);
      },
    },
  });
};
