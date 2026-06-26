import { mergeRouters } from '../../trpc';
import { folderQueryRouter } from './folder.query';
import { folderMutationRouter } from './folder.mutation';

export const folderRouter = mergeRouters(
  folderQueryRouter,
  folderMutationRouter,
);
