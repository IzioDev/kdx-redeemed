export * from './lib/prisma-client.module';
export * from './lib/prisma-client.service';
export * from '@prisma/client';

type SelectAndInclude = {
  select: any;
  include: any;
};

type SelectAndOmit = {
  select: any;
  omit: any;
};

export type SelectSubset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude
  ? 'Please either choose `select` or `include`.'
  : T extends SelectAndOmit
  ? 'Please either choose `select` or `omit`.'
  : {});
