export class ClipboardHelper {
  static setText(text: string) {
    navigator.clipboard.writeText(text);
  }

  static async getText(): Promise<string> {
    return navigator.clipboard.readText();
  }
}