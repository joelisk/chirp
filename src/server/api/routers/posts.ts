import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  // only return the fields we want the client to see
  return {id: user.id, username: user.username, profileImageUrl: user.profileImageUrl}
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc"}]
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient)

    //console.log(users)

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId)

      if (!author || !author.username) throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR", 
        message: "Author for post not found"
      })
      
      return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      };
    });

  }),

  create: privateProcedure
    .input(z.object({ // zod validates the shape of the data in post.content
      content: z.string().emoji().min(1).max(280),
    }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId; // we have info from current user because we already asserted they exist in the middleware(privateProcedure)
      const post = await ctx.prisma.post.create({ 
        data: {
          authorId,
          content: input.content,
        }
      });

      return post;
    }),

});
