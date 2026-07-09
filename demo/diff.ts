/* Line-level diff (LCS) producing side-by-side rows; same visual contract as
   the real app's DiffView. Fine for demo-sized documents. */

export interface DiffRow {
  left: { no: number | null; text: string; kind: "same" | "del" | "empty" };
  right: { no: number | null; text: string; kind: "same" | "add" | "empty" };
}

interface Op {
  type: "same" | "del" | "add";
  text: string;
}

function lcsOps(a: string[], b: string[]): Op[] {
  const m = a.length;
  const n = b.length;
  // classic DP table; demo content is small enough that O(m*n) is fine
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", text: a[i] });
      i++;
    } else {
      ops.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < m) ops.push({ type: "del", text: a[i++] });
  while (j < n) ops.push({ type: "add", text: b[j++] });
  return ops;
}

export function sideBySide(oldText: string, newText: string): DiffRow[] {
  const ops = lcsOps(oldText.split("\n"), newText.split("\n"));
  const rows: DiffRow[] = [];
  let leftNo = 1;
  let rightNo = 1;
  let k = 0;
  while (k < ops.length) {
    const op = ops[k];
    if (op.type === "same") {
      rows.push({
        left: { no: leftNo++, text: op.text, kind: "same" },
        right: { no: rightNo++, text: op.text, kind: "same" },
      });
      k++;
      continue;
    }
    // gather a change block and pair deletions with additions line-by-line
    const dels: string[] = [];
    const adds: string[] = [];
    while (k < ops.length && ops[k].type !== "same") {
      if (ops[k].type === "del") dels.push(ops[k].text);
      else adds.push(ops[k].text);
      k++;
    }
    const len = Math.max(dels.length, adds.length);
    for (let r = 0; r < len; r++) {
      rows.push({
        left:
          r < dels.length
            ? { no: leftNo++, text: dels[r], kind: "del" }
            : { no: null, text: "", kind: "empty" },
        right:
          r < adds.length
            ? { no: rightNo++, text: adds[r], kind: "add" }
            : { no: null, text: "", kind: "empty" },
      });
    }
  }
  return rows;
}

export function changedLineCount(rows: DiffRow[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const row of rows) {
    if (row.left.kind === "del") removed++;
    if (row.right.kind === "add") added++;
  }
  return { added, removed };
}
