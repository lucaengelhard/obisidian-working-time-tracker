import { readStore, Store } from "@/data/store";

/**
 * Extracts workingtime codeblocks from the provided file
 * contents.
 *
 * @param value The file text contents
 * @returns The extracted workingtime blocks
 */
export function extractWorkingtimeCodeblocks(value: string) {
  const out: Store[] = [];
  const lines = value.replace("\n\r", "\n").split("\n");

  for (let i = 0; i < lines.length; i++) {
    const startLine = lines[i];

    // Skip lines till a workingtime block is found
    if (!startLine.startsWith("```workinghours")) {
      continue;
    }

    // Find end of codeblock
    const endLineIndex = lines.indexOf("```", i);
    if (endLineIndex === -1) {
      continue;
    }

    let content = "";
    for (let lineIndex = i + 1; lineIndex < endLineIndex; lineIndex++) {
      content += lines[lineIndex] + "\n";
    }

    out.push(readStore(content));
  }

  return out;
}

export function replaceTimekeepCodeblock(
  store: Store,
  content: string,
  lineStart: number,
  lineEnd: number
): string {
  const timekeepJSON = JSON.stringify(store);

  // The actual JSON is the line after the code block start
  const contentStart = lineStart + 1;
  const contentLength = lineEnd - contentStart;

  // Split the content into lines
  const lines = content.split("\n");

  // Sanity checks to prevent overriding content
  if (!lines[lineStart].startsWith("```")) {
    throw new Error(
      "Content timekeep out of sync, line number for codeblock start doesn't match: " +
        content[lineStart]
    );
  }

  if (!lines[lineEnd].startsWith("```")) {
    throw new Error(
      "Content timekeep out of sync, line number for codeblock end doesn't match" +
        content[lineEnd]
    );
  }

  // Splice the new JSON content in between the codeblock, removing the old codeblock lines
  lines.splice(contentStart, contentLength, timekeepJSON);

  return lines.join("\n");
}
