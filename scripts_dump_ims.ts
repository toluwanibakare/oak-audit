import { PROCESSES, getQuestionsForProcess } from "./src/data/processAudit";
import { getQuestionsForProcess45001 } from "./src/data/processAudit45001";
import { getQuestionsForProcess14001 } from "./src/data/processAudit14001";
import fs from "fs";
const out: any = {};
for (const p of PROCESSES) {
  out[p.key] = {
    name: p.name, scope: p.scope,
    "9001": getQuestionsForProcess(p.key as any),
    "14001": getQuestionsForProcess14001(p.key as any),
    "45001": getQuestionsForProcess45001(p.key as any),
  };
}
fs.writeFileSync("/tmp/ims_all.json", JSON.stringify(out));
console.log("done", Object.keys(out).length);
