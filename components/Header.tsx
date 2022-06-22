import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div>
      <Head>
        <title>heyanon!</title>
        <link rel="icon" href="/heyanon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap"
          rel="stylesheet"
        ></link>
        <script async src="snarkjs.min.js"></script>
      </Head>

      <div className="flex p-5">
        <Image src="/heyanon.png" alt="cabal" width="64" height="64" />
        <div className="flex items-center justify-center px-5 text-lg text-white">
          <Link href="/" className="hover:text-gray-400">
            heyanon.xyz
          </Link>
        </div>
      </div>
    </div>
  );
}
