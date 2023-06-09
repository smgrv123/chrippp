import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostViewType = RouterOutputs["post"]["getAll"][number];

export const PostView = ({ post, author }: PostViewType) => {
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
