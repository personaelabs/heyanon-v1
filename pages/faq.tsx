import type { NextPage } from "next";
import Header from "../components/Header";

const FAQ: NextPage = () => {
  return (
    <>
      <div className="h-screen">
        <Header></Header>

        <div className="-mt-24 flex h-full items-center justify-center bg-heyanonred p-20 text-white">
          FAQ
        </div>
      </div>
    </>
  );
};

export default FAQ;
