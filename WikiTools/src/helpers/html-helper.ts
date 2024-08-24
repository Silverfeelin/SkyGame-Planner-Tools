import { ItemType } from '../item.interface';

export class HtmlHelper {  
  static getImageSrc(el: HTMLElement): string | undefined {
    while (el) {
      if (el.tagName !== 'IMG') { el = el.parentElement; continue; }

      let src = el.dataset.src || (el as HTMLImageElement).src;
      const i = src.indexOf('/revision/');
      if (i >= 0) { src = src.substr(0, i); }
      const q = src.indexOf('?');
      if (q >= 0) { src = src.substr(0, q); }
      return src;
    }
  }

  static getName(el: HTMLElement): string {
    if (el.innerText.length > 100) { return ''; }
    let name = el.innerText || '';
    name = this.normalizeName(name);
    return name;
  }

  static normalizeName(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  static getType(el: HTMLElement): ItemType | undefined {
    while (el) {
      const text = el.innerText.toLowerCase();
      if (text.includes('hair accessory')) { return 'Hat' }
      if (text.includes('hat')) { return 'Hat' }
      if (text.includes('hair')) { return 'Hair'; }
      if (text.includes('cape')) { return 'Cape'; }
      if (text.includes('mask')) { return 'Mask'; }
      if (text.includes('face accessory')) { return 'FaceAccessory'; }
      if (text.includes('outfit')) { return 'Outfit'; }
      if (text.includes('shoes')) { return 'Shoes'; }
      if (text.includes('necklace') || text.includes('pendant')) { return 'Necklace'; }
      if (text.includes('prop')) { return 'Prop'; }
      if (text.includes('instrument')) { return 'Held'; }
      el = el.parentElement;
    }
  }

  static getSubtype(el: HTMLElement): string | undefined {
    if (!el) { return; }
    const text = el.innerText.toLowerCase();
    if (text.includes('instrument')) { return 'Instrument'; }
    if (text.includes('friend emote')) { return 'FriendEmote'; }
  }
}