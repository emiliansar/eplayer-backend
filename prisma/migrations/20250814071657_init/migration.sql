-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_musicId_fkey";

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music"("id") ON DELETE CASCADE ON UPDATE CASCADE;
