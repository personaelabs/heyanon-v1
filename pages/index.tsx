import type { NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { Title } from "../components/Base";

const Home: NextPage = () => {
  return (
    <>
      <div className="scroll-smooth">
        <Head>
          <title>heyanon!</title>
          <link rel="icon" href="/heyanon.ico" />
          {/* <script async src="snarkjs.min.js"></script> */}
        </Head>

        <div className="flex h-full justify-center bg-heyanonred text-white">
          <div className="items-center justify-center self-center prose max-w-prose">
            <div className="flex justify-center pt-10">
              <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
            </div>

            <div className="grid">
              <div className="flex justify-center pb-5">
                <Title>
                  Post from{" "}
                  <a
                    href="https://twitter.com/heyanonxyz"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    @heyanonxyz
                  </a>
                  !
                </Title>
              </div>
              <div className="mb-8">
                <strong>
                  <u>What is this site?</u>
                </strong>
                <div>
                  <a href="https://heyanon.xyz">heyanon </a>
                  is a way for people who are <i>in cool groups</i> or{" "}
                  <i>did cool stuff</i> on Ethereum to broadcast messages
                  anonymously on Twitter. These feeds are curated by the
                  <a href="https://twitter.com/heyanonxyz"> @heyanonxyz </a>
                  account, such as the{" "}
                  <a href="https://twitter.com/DAOHackGossip">DAO hack</a> feed.
                  Anyone whose participation in a group or historical moment can
                  be verified and then post to the feed. The magic is that you
                  don’t need to reveal your address when you do.
                  <br />
                  <br />
                  <em>Not even to the site admins.</em>
                </div>
              </div>

              <div className="mb-8">
                <strong>
                  <u>How does it work?</u>
                </strong>
                <div>
                  When you send a message with heyanon, you generate a
                  <a href="http://learn.0xparc.org/"> zero-knowledge proof </a>
                  that you are in a specific group or involved with a certain
                  historical event on-chain. This proof hides all information
                  about your address. The proof is all that is sent to the{" "}
                  <a href="https://heyanon.xyz">heyanon</a> backend for
                  verification. Upon verification, the proof is posted to{" "}
                  <a href="https://ipfs.io/">ipfs</a> and your message is sent
                  via the specified event feed bot. The message has with it a
                  verify link that twitter readers can use to inspect the proof
                  themselves. For more, check out our circuits and code at
                  <a href="https://github.com/dizkus"> github</a>.
                </div>
              </div>

              <div className="mb-8">
                <strong>
                  <u>Why does it only work on Google Chrome?</u>
                </strong>
                <div>
                  The zero-knowledge proofs we’re working with are *really* big.
                  Perhaps the biggest proofs anyone’s tried to create on an
                  end-user device. As such, we’re entering into new territory
                  with heyanon and have only been successful with Google Chrome
                  so far. We’re working on making things work in other web
                  browsers and mobile wallets though!
                  <br />
                  <br />
                  We could run these proofs on another machine that is more
                  powerful. However, that would come at the cost of user
                  privacy; the server computing the proofs would need to know
                  your address and thus could dox you. Doing everything on your
                  local machine avoids this risk!
                </div>
              </div>

              <div className="mb-8">
                <strong>
                  <u>How can you contribute or follow along?</u>
                </strong>
                <div>
                  Follow{" "}
                  <a href="https://twitter.com/heyanonxyz">@heyanonxyz</a> for
                  updates and new message feeds. Join our{" "}
                  <a href="https://discord.gg/4J3XzZJf">discord</a> for misc.
                  discussion.
                </div>
              </div>

              <div className="flex justify-center mt-8 mb-8">
                With &lt;3, the heyanon team. Powered by&nbsp;
                <a href="https://0xparc.org/"> 0xPARC</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
