import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number]; //[number] means we want an element of the array
export const PostView = (props: PostWithUser ) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 p-4 border-b border-slate-400">
      <Image 
        src={author.profileImageUrl} 
        alt={`@${author.username}'s profile picture`} 
        className="w-14 h-14 rounded-full" 
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          {/* ideally want the whole card clickable - cant have a link within a link so do DOM hierarchy stuff */}
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{`  · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  )
}