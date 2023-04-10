import { type NextPage } from "next";
import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

const CreatePostWizard = () => { 
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate(); // we don't care what's going on with the Promise
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content; 
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Pleast try again later.");
      }
    }
  });

  // DONT do useState for this. use react-hook-form instead
  // can share the validation logic between the client and the server

  // also in the future - would be nice to have the database synchronized with Clerk
  // ideally map user to post with a relation not by an authorID string

  // Vercel open graph (OG) image generation
  const [input, setInput] = useState("");

  if (!user) return null;

  return <div className="flex gap-3 w-full">
    <Image 
      src={user.profileImageUrl} 
      alt="Profile Image"
      className="w-14 h-14 rounded-full" 
      width={56}
      height={56}
    />
    <input 
      placeholder="Type some emojis!" 
      className="bg-transparent grow outline-none"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input !== "") {
            mutate({ content: input });
          }
        }
      }}
      disabled={isPosting}
    />
    { input !== "" && !isPosting && (
      <button onClick={() => mutate({ content: input })}>
        Post
      </button>
    )}
    { isPosting && (
    <div className="flex justify-center items-center">
      <LoadingSpinner size={20} />
    </div> )}
  </div>
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching ASAP - react-query will cache the result
  api.posts.getAll.useQuery();

  // return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
