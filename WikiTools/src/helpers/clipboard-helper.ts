export class ClipboardHelper {
  static setText(text: string) {
    navigator.clipboard.writeText(text);
  }
}