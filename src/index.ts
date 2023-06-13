/*
MIT License

Copyright (c) Zach Gotsch 2023

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export function reinterpret(brokenUtfInput: string): string {
  // sequences like "\u00e2\u0080\u0099"
  // as a heuristic, look for sequences of 3 or more -- this is probably a broken sequence
  const codepointSequences = brokenUtfInput.matchAll(/(?:\\u00[\dA-F]{2}){3,}/dgi);
  if (!codepointSequences) {
    return brokenUtfInput;
  }

  let outputString = "";
  let nextStart = 0;
  for (const seq of codepointSequences) {
    outputString += brokenUtfInput.slice(nextStart, seq.index);
    nextStart = seq.index! + seq[0].length;

    const codepoints = seq[0].matchAll(/\\u00([\dA-F]{2})/gi)!;
    const bytes = Array.from(codepoints).map((codepoint: any) => {
      return parseInt(codepoint[1], 16);
    });

    const reinterpreted = new TextDecoder().decode(new Uint8Array(bytes));
    const codepoint = reinterpreted.codePointAt(0)!;
    if (codepoint < 0x10000) {
      outputString += `\\u${codepoint.toString(16).padStart(4, "0")}`;
    } else {
      outputString += `\\u{${codepoint.toString(16)}}`;
    }
  }
  outputString += brokenUtfInput.slice(nextStart);

  return outputString;
}

export function unescape(brokenUtfInput: string): string {
  return reinterpret(brokenUtfInput)
    .replace(/\\u([\dA-F]{4})/gi, (_, codepoint) => {
      return String.fromCodePoint(parseInt(codepoint, 16));
    })
    .replace(/\\u\{([\dA-F]+)\}/gi, (_, codepoint) => {
      return String.fromCodePoint(parseInt(codepoint, 16));
    });
}
