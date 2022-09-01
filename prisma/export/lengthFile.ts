import fs from "fs";
import path from "path";

const directoryPath = path.join(__dirname, "../../pages/api/trees");

let files = fs
  .readdirSync(directoryPath)
  .filter((file) => file.endsWith(".json"));

for (const file of files) {
  console.log(file);

  const buffer = fs.readFileSync(directoryPath + "/" + file);
  const data = JSON.parse(buffer.toString());

  console.log(Object.keys(data.leafToPathElements).length);
}
