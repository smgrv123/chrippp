import { privateProcedure } from "./../trpc";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy:[{createdAt:'desc'}]
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((item) => item.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.username) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found for post",
        });
      }

      return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      };
    });
  }),

  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const createPost = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return createPost;
    }),
});
