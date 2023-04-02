import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import SuperJSON from "superjson";
import { appRouter } from "../api/root";
import { prisma } from "../db";

export const generateSSGHelper = () =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });
