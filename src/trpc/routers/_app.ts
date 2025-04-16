import { createTRPCRouter } from '../init'

import { studioRouter } from '@/modules/studio/server/procedures'
import { videosRouter } from '@/modules/vidoes/server/procedures'
import { categoriesRouter } from '@/modules/categories/server/procedures'

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  categories: categoriesRouter,
  videos: videosRouter
})
// export type definition of API
export type AppRouter = typeof appRouter;