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
          <script async src="snarkjs.min.js"></script>
        </Head>

        <div className="flex h-full justify-center bg-heyanonred text-white">
          <div className="items-center justify-center self-center prose max-w-prose">
            <div className="flex justify-center pt-10">
              <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
            </div>

            <Title>FAQ</Title>

            <div className="grid">
              <div className="mb-8">
                <strong>What is this site?</strong>
                <div>
                  <a href="https://heyanon.xyz">heyanon </a>
                  is a way for people who did cool stuff on Ethereum to
                  broadcast messages anonymously on Twitter. Historic moment
                  feeds are curated by the
                  <a href="https://twitter.com/heyanonxyz"> @heyanonxyz </a>
                  account, such as the{" "}
                  <a href="https://twitter.com/DAOHackGossip">DAO hack</a>
                  feed. Anyone whose participation in the moment can be verified
                  on-chain can post to the feed. The magic is that you don’t
                  need to reveal your address when you do.
                  <br />
                  <em>Not even to the site admins.</em>
                </div>
              </div>

              <div className="mb-8">
                <strong>How does it work?</strong>
                <div>
                  When you send a message with heyanon, you generate a
                  <a href="https://en.wikipedia.org/wiki/Zero-knowledge_proof">
                    {" "}
                    zero-knowledge proof{" "}
                  </a>
                  that you were involved with a certain event on-chain. This
                  proof hides all information about your address. The proof is
                  all that is sent to the{" "}
                  <a href="https://heyanon.xyz">heyanon</a> backend for
                  verification. Upon verification, the proof is posted to
                  <a href="https://ipfs.io/">ipfs</a>
                  and your message is sent via the specified event feed bot. The
                  message has with it a verify link twitter readers can use to
                  the proof located on ipfs themselves. For more, check out our
                  <a href="https://github.com/dizkus"> github</a>.
                </div>
              </div>

              <div className="mb-8">
                <strong>Why does it only work on Google Chrome?</strong>
                <div>
                  The zero-knowledge proofs we're working with are *really* big.
                  Perhaps the biggest proofs anyone's tried to create on an
                  end-user device. As such, we're entering into new territory
                  with heyanon and have only been successful with Google Chrome
                  so far. We're working on making things work in other web
                  browsers and mobile wallets though!
                </div>
              </div>

              <div className="mb-8">
                <strong>How can you contribute or follow along?</strong>
                <div>
                  Follow{" "}
                  <a href="https://twitter.com/heyanonxyz">@heyanonxyz</a> for
                  updates and new message feeds. Join our{" "}
                  <a href="https://discord.gg/4J3XzZJf">discord</a> for misc.
                  discussion.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
