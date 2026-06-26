import { mergeRouters } from '../../trpc';
import { fileQueryRouter } from './file.query';
import { fileMutationRouter } from './file.mutation';

export const fileRouter = mergeRouters(fileQueryRouter, fileMutationRouter);
