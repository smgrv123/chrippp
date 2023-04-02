import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { Loader, LoadingScreen } from "~/components/loader";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helper/ssg";

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

const ProfilePage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading, isError } = api.post.getPostById.useQuery({
    id,
  });

  if (isLoading) return <LoadingScreen />;
  8;
  if (isError || !data) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()

  const id = context?.params?.id;

  if (typeof id !== "string") throw new Error("no slug");

  await ssg.post.getPostById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
