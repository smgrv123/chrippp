import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { Loader, LoadingScreen } from "~/components/loader";
import toast from "react-hot-toast";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostViewType = RouterOutputs["post"]["getAll"][number];

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setinput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.post.createPost.useMutation({
    onSuccess: () => {
      setinput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const error = e.data?.zodError?.fieldErrors.content;
      if (error && error[0]) {
        return toast.error(error[0]);
      }
      toast.error("Failed to Post! Please try again");
    },
  });

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
        value={input}
        onChange={(e) => setinput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.length > 1) {
            e.preventDefault();
            mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input.length > 1 && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <Loader size={20} />
        </div>
      )}
    </div>
  );
};

const PostView = ({ post, author }: PostViewType) => {
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
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className=" font-thin">
              {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const PostFeed = () => {
  const { data, isLoading: postLoading, isError } = api.post.getAll.useQuery();

  if (postLoading) return <LoadingScreen />;

  if (isError) return <div>Ops! Error</div>;

  if (!data) return <div>No Posts Right now</div>;
  return (
    <div className="flex flex-col">
      {data.map((item, index) => (
        <PostView {...item} key={index} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  api.post.getAll.useQuery();

  const { isSignedIn, isLoaded: userLoaded } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Chirppp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl ">
          <div className=" flex border-b border-slate-400 p-4 ">
            {!isSignedIn && <SignInButton mode="modal" />}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <PostFeed />
        </div>
      </main>
    </>
  );
};

export default Home;
