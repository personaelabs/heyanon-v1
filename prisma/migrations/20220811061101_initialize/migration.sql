-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "root" INTEGER NOT NULL,
    "group_abbr" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "twitter_account" TEXT NOT NULL,
    "description" TEXT,
    "why_useful" TEXT,
    "how_generated" TEXT NOT NULL,
    "moderation_status" TEXT NOT NULL,
    "last_update" DATE,
    "proof_id" INTEGER NOT NULL,
    "parent_group_id" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaf" (
    "id" SERIAL NOT NULL,
    "path" TEXT[],
    "indicies" INTEGER[],
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "Leaf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "msg" TEXT,
    "msg_hash" TEXT,
    "ipfs_hash" TEXT,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proof" (
    "id" SERIAL NOT NULL,
    "definition" TEXT,
    "vkey" TEXT,
    "zkey_link" TEXT,
    "circuit_link" TEXT,
    "vkey_address" TEXT,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "key" TEXT,
    "reputation" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "API" (
    "id" SERIAL NOT NULL,
    "twit_consumer_key" TEXT,
    "twit_consumer_secret" TEXT,
    "twit_access_token" TEXT,
    "twit_access_secret" TEXT,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "API_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "API_group_id_key" ON "API"("group_id");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_proof_id_fkey" FOREIGN KEY ("proof_id") REFERENCES "Proof"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parent_group_id_fkey" FOREIGN KEY ("parent_group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaf" ADD CONSTRAINT "Leaf_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaf" ADD CONSTRAINT "Leaf_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "API" ADD CONSTRAINT "API_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
