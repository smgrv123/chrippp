import { FC } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { api } from "~/utils/api";
import type {RouterOutputs} from "~/utils/api"

dayjs.extend(relativeTime);

type PostViewType = RouterOutputs["post"]["getAll"][number];

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type Some Emojis!!"
        className=" grow bg-transparent outline-none"
      />
    </div>
  );
};

const PostView: FC<PostViewType> = ({ post, author }) => {
  return (
    <div className="flex flex-row gap-4 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className=" flex flex-col">
        <div className=" flex gap-2 text-slate-400">
          <span>{`@${author.username}`}</span>
          <span className=" font-thin" >{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { data, isLoading, isError } = api.post.getAll.useQuery();

  const user = useUser();

  if (isLoading) return <div>Fetching Data....</div>;

  if (isError) return <div>Ops! Error</div>;

  if (!data) return <div>No Posts Right now</div>;

  return (
    <>
      <Head>
        <title>Testing commit</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl ">
          <div className=" flex border-b border-slate-400 p-4 ">
            {!user.isSignedIn && <SignInButton mode="modal" />}
            {user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col">
            {[...data, ...data]?.map((item, index) => (
              <PostView {...item} key={index} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
