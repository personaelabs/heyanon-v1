<div align="center">
        <img width="200" alt="heyanon icon." src="https://github.com/personaelabs/heyanon/blob/main/public/logo.svg">
</div>

## What is this site?

heyanon is a way for people who are in cool groups or did cool stuff on Ethereum to broadcast messages anonymously on Twitter. These feeds are curated by the [@heyanonxyz](https://twitter.com/heyanonxyz) account, such as the [Ethereum OGs](https://twitter.com/EthereumOGs). Anyone whose participation in a group or historical moment can be verified and then post to the feed. The magic is that you don’t need to reveal your address when you do.

Not even to the site admins.

## How does it work?

When you send a message with heyanon, you generate a [zero-knowledge proof](http://learn.0xparc.org/) that you are in a specific group or involved with a certain historical event on-chain. This proof hides all information about your address. The proof is all that is sent to the heyanon backend for verification. Upon verification, the proof is posted to ipfs and your message is sent via the specified event feed bot. The message has with it a verify link that twitter readers can use to inspect the proof themselves.

## Development

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-5.33%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-1.23%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-3.96%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-5%25-red.svg?style=flat) |

Run the following

```
yarn
npm run dev
```

Set up a PostgreSQL DB according to the schema in prisma/schema.prisma, and set the `DATABASE_URL` variable in your `.env` file.

Circuits are [here](https://github.com/personaelabs/circuits). Data generation is [here](https://github.com/personaelabs/data). And for further discussion, join our [discord](https://discord.gg/kmKAC5T6sV)!
