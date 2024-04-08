import { Editor, MarkdownView, Plugin } from 'obsidian';

class Markdown2Text {
  private removeHeadingTags: boolean;
  private removeMathCode: boolean;

  constructor(
    removeHeadingTags = false,
    removeMathCode = true
  ) {
    this.removeHeadingTags = removeHeadingTags;
    this.removeMathCode = removeMathCode;
  }

  public convertToText(markdownContent: string): string | null {
    return this.stripMarkdownElements(markdownContent);
  }

  private stripMarkdownElements(markdownContent: string): string | null {
    if (!markdownContent.trim()) {
      return null;
    }

	const removedPatterns = [
		/---(.*?)---/gs, // Front matter
		/(\|[^|\r\n]*)+\|(\r?\n|\r)?/g, // Table wrappers & headers
		/(>)|(\!\[(.*?)[-+ ]\s)/g, // Callout flags
		/^#.*\s/gm, // Tags only
		/\^.*?\s/g, // Block identifiers e.g. ^eg006
		/(\[\[)|(\]\])|(\!\[\[)/g, // Backlink wrappers
		/(\[(.*?)\]\((.*?)\))|(\(\[(.*?)\]\((.*?)\)\))/g, // Links
		/\!\[(.*?)\]\((.*?)\)/g, // Images
		/[\*~^=_>]|(\s-)/g, // Markdown formatting
		///[\u{1F600}-\u{1F6FF}]/gu, // Emojis
	];

	
    if (this.removeHeadingTags) {
      removedPatterns.push(/#/g);
    }
	
    if (this.removeMathCode) {
      removedPatterns.splice(1, 0, /\$\$(.*?)\$\$/gs);
      removedPatterns.splice(2, 0, /\$(.*?)\$/g);
      removedPatterns.splice(3, 0, /```(.*?)```/gs); // Code blocks, after front matter
    }

    const aliasPattern = /\[\[(.*?)\|([^\]]*)\]\]/g;
    const emptyLines = /^\s*|\s*$|\s*(\r?\n)\s*|(\s)\s+/g;

    const combinedPattern = new RegExp(removedPatterns.map(r => r.source).join('|'), 'gms');

    markdownContent = markdownContent.replace(aliasPattern, '$2');

	const strippedMarkdown = markdownContent.replace(combinedPattern, '');
	const cleanText = strippedMarkdown
	.replace(emptyLines, '$1')
	.replace(/\r?\n/g, '') // Replace line breaks with spaces
	.replace(/\s+/g, ' '); // Replace multiple spaces with a single space
  
    return cleanText;
  }
}

export default class Markdown2TextPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'strip-markdown',
      name: 'Strip markdown from selection',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const selection = editor.getSelection();
        const converter = new Markdown2Text();
        const text = converter.convertToText(selection);
		
		text ? editor.replaceSelection(text) : null
	
		const cursor = editor.getCursor();
		const lineLength = editor.getLine(cursor.line).length;
		editor.setCursor({ line: cursor.line, ch: lineLength });
      }
    });
  }
}
