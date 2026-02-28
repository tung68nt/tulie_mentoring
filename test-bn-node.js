import { BlockNoteEditor } from "@blocknote/core";

async function test() {
  try {
    const editor = BlockNoteEditor.create();
    editor.replaceBlocks(editor.document, [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Hello ", styles: {} },
          { type: "text", text: "World", styles: { textColor: "red" } }
        ]
      }
    ]);
    const md = await editor.blocksToMarkdownLossy(editor.document);
    console.log("MD Output:");
    console.log(md);
    
    const html = await editor.blocksToHTMLLossy(editor.document);
    console.log("HTML Output:");
    console.log(html);
  } catch(e) { console.error(e) }
}
test();
