import { type NextPage } from "next";
import Head from "next/head";

//[id].tsx - when we use Nextjs router, will have access to the id

const SinglePostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center h-screen">
      <div>
       Single Post Page
      </div>
      </main>
    </>
  );
};

export default SinglePostPage;
