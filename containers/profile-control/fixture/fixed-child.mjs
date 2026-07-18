import process from "node:process";

if (process.argv.length !== 2) {
  process.exitCode = 1;
} else {
  process.stdout.write("m4-fixed-child-v1\n");
}
