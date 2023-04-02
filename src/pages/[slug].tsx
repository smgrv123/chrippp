import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { Loader, LoadingScreen } from "~/components/loader";
import { api } from "~/utils/api";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import SuperJSON from "superjson";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { PostView } from "~/components/postView";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostByUserID.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <Loader />;
  if (!data || data.length === 0) return <div>Not post to show</div>;

  return (
    <div className="flex flex-col">
      {data.map((item, index) => (
        <PostView key={index} {...item} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <LoadingScreen />;
  8;
  if (isError || !data) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`!@${data.username ?? ""}'s profile picture`}
            height={128}
            width={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });

  const slug = context?.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
