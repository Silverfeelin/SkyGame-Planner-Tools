import { Component } from 'react';
import { HtmlHelper } from '../helpers/html-helper';
import { ItemType, ItemSubtype, ItemGroup } from '../item.interface';
import { ClipboardHelper } from '../helpers/clipboard-helper';

const Indicator = ({active}: {active: boolean}) => {
  return active ? (<span className='indicator'>&gt;&nbsp;</span>) : (<span className='indicator'>&nbsp;&nbsp;</span>);
};

type Action = '' | 'type' | 'subtype' | 'name' | 'icon' | 'preview' | 'group' | 'level';

type State = {
  action: Action;
  type: ItemType;
  subtype: ItemSubtype;
  name: string;
  icon: string;
  preview?: string;
  level?: string;
  group?: ItemGroup;
}

const hotkeyActions = [
  'type', 'name', 'icon', 'preview', 'group', 'level'
];

class ItemForm extends Component {
  props: { disabled: boolean };
  state: State = {
    action: '', type: 'Hat', subtype: '',
    name: '', icon: '', preview: '',
    level: '', group: ''
  };

  listener: any;
  mousePos = [0, 0];

  componentDidMount() {
    document.addEventListener('keydown', this.onKeydown);    
    document.addEventListener('mousemove', e => { [this.mousePos[0], this.mousePos[1]] = [e.clientX, e.clientY]; });

    
    console.log('Controls mounted');
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
  }

  
  scrollToEnds() {    
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
      input.scrollLeft = input.scrollWidth;
    });
  }  

  onKeydown = (e: KeyboardEvent) => {
    if (this.props.disabled) { return; }
    switch (e.key) {
      case 'c': this.copyImage(); break;
      case 'p': this.copyPreviewImage(); break;
      case 'ArrowUp': this.prevAction(); break;
      case 'ArrowDown': this.nextAction(); break;
      case 'ArrowRight': this.handleAction(); break;
      case 'ArrowLeft': this.clearValue(); break;
      default: return;
    }

    e.preventDefault();
    e.stopPropagation();
  }

  setAction(action: string) {
    action = this.state.action === action ? '' : action;
    this.setState({action});
  }

  prevAction() {
    const i = hotkeyActions.indexOf(this.state.action);
    this.setState({action: hotkeyActions[(i - 1 + hotkeyActions.length) % hotkeyActions.length]});
  }

  nextAction() {
    const i = hotkeyActions.indexOf(this.state.action);
    this.setState({action: hotkeyActions[(i + 1) % hotkeyActions.length]});
  }

  handleAction() {
    this.actions[this.state.action]?.();
  }

  clearValue() {
    if (!this.state.action) { return; }
    this.setState({[this.state.action]: ''});
  }

  copyImage() {
    const el = this.getEl();
    const src = HtmlHelper.getImageSrc(el) || '';
    ClipboardHelper.setText(src);
  }

  copyPreviewImage() {    
    const el = this.getEl();
    const src = HtmlHelper.getImageSrc(el) || '';
    ClipboardHelper.setText(`,
"previewUrl": "${src}"`);
  }

  actions: {[key: string]: () => void } = {
    type: () => {      
      const el = this.getEl();
      const type = HtmlHelper.getType(el) || 'Hat';
      this.setState({type}, () => { this.scrollToEnds(); });
    },
    name: () => {
      const el = this.getEl();
      const name = HtmlHelper.getName(el) || '';
      this.setState({name}, () => { this.scrollToEnds(); });
    },
    icon: () => {
      const el = this.getEl();
      const src = HtmlHelper.getImageSrc(el) || '';
      this.setState({icon: src}, () => { this.scrollToEnds(); });
    },
    preview: () => {
      const el = this.getEl();    
      const src = HtmlHelper.getImageSrc(el) || '';
      this.setState({preview: src}, () => { this.scrollToEnds(); });
    }
  };

  getEl() { return document.elementFromPoint(this.mousePos[0], this.mousePos[1]) as HTMLElement; }

  getNameType(type: string): string { 
    switch (type) {
      case 'Hat':
      case 'Hair':
      case 'Mask':
      case 'Face Accessory':
      case 'Necklace':
      case 'Outfit':
      case 'Shoes':
      case 'Cape':
      case 'Stance':
      case 'Call':
      case 'Spell':
        return type;
      case 'Held':
      case 'Furniture':
      case 'Prop':
      case 'Emote':
      case 'Music':
      case 'Quest':
      case 'Wing Buff':
      case 'Special':
      default:
        return '';
    }
  }
  
  createItem() {
    let name = this.state.name || '';
    const nameType = this.getNameType(this.state.type);
    if (nameType && !name.endsWith(nameType)) {
      name += ` ${nameType}`;
    }

    const item: any = {
      type: this.state.type
    };
    if (this.state.subtype) { item.subtype = this.state.subtype;  }
    item.name = name;
    item.icon = this.state.icon;
    if (this.state.preview) { item.previewUrl = this.state.preview; }

    const orderedTypes = new Set(['Hat', 'Hair', 'Mask', 'FaceAccessory', 'Necklace', 'Outfit', 'Shoes', 'Cape', 'Held', 'Furniture', 'Prop', 'Emote', 'Stance', 'Call', 'Spell', 'Music']);
    if (orderedTypes.has(item.type) && !this.state.level) { item.order = 10000; }
    if (this.state.level) { item.level = this.state.level; }
    return item;
  }

  showItem(): void {
    const item = this.createItem();
    alert(JSON.stringify(item, null, 2));
  }

  async saveItem(): Promise<void> {
    const item = this.createItem();    
    await fetch('http://localhost:4201/api/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item) 
    }).then(res => res.json()).then(console.log).catch(console.error);
  }

  render() {
    return (  
      <>
        <table>
        <tbody>
          <tr>
            <td className='pointer' onClick={() => this.setAction('type')}>
              <Indicator active={this.state.action === 'type'} />
              <span>Type:</span>
            </td>
            <td>
              <select id='type' name='type' value={this.state.type} onChange={(e) => this.setState({type: e.target.value})}>
                <option value='Hat'>Hat</option>
                <option value='Hair'>Hair</option>
                <option value='Mask'>Mask</option>
                <option value='FaceAccessory'>Face Accessory</option>
                <option value='Necklace'>Necklace</option>
                <option value='Outfit'>Outfit</option>
                <option value='Shoes'>Shoes</option>
                <option value='Cape'>Cape</option>
                <option value='Held'>Held</option>
                <option value='Furniture'>Furniture</option>
                <option value='Prop'>Prop</option>
                <option value='Emote'>Emote</option>
                <option value='Stance'>Stance</option>
                <option value='Call'>Call</option>
                <option value='Spell'>Spell</option>
                <option value='Music'>Music</option>
                <option value='Quest'>Quest</option>
                <option value='WingBuff'>Wing Buff</option>
                <option value='Special'>Special</option>
              </select>
              
              <select id='subtype' name='subtype' defaultValue={''}>
                <option value=''></option>
                <option value='Instrument'>Instrument</option>
                <option value='FriendEmote'>Friend Emote</option>
              </select>
            </td>
          </tr>       
          <tr>          
            <td className='pointer' onClick={() => this.setAction('name')}>
              <Indicator active={this.state.action === 'name'} />
              <span>Name:</span>
            </td>
            <td>
              <input type='text' id='name' name='name' style={{width:'232px'}} value={this.state.name} onChange={(e) => this.setState({name: e.target.value})} />
            </td>
          </tr>
          <tr>          
            <td className='pointer' onClick={() => this.setAction('icon')}>
              <Indicator active={this.state.action === 'icon'} />
              <span>Icon:</span>
            </td>
            <td>
              <input type='text' id='icon' name='icon' style={{width:'300px'}} value={this.state.icon} onChange={(e) => this.setState({icon: e.target.value})} />
            </td>
          </tr>
          <tr>
            <td className='pointer' onClick={() => this.setAction('preview')}>
              <Indicator active={this.state.action === 'preview'} />
              <span>Preview:</span>
            </td>
            <td>
              <input type='text' id='preview' name='preview' style={{width:'300px'}} value={this.state.preview} onChange={(e) => this.setState({preview: e.target.value})} />
            </td>
          </tr>          
          <tr>
            <td className='pointer' onClick={() => this.setAction('group')}>
              <Indicator active={this.state.action === 'group'} />
              <span>Group:</span>
            </td>
            <td>              
            <select id='group' name='group' value={this.state.group} onChange={(e) => this.setState({group: e.target.value})}>
                <option value=''></option>
                <option value='SeasonPass'>Season Pass</option>
                <option value='Ultimate'>Season Ultimate</option>
                <option value='Elder'>Elder</option>
                <option value='Limited'>Limited</option>
              </select>
            </td>
          </tr>
          <tr>
            <td className='pointer' onClick={() => this.setAction('level')}>
              <Indicator active={this.state.action === 'level'} />
              <span>Level:</span>
            </td>
            <td>
              <input type='text' id='level' name='level' style={{width:'50px'}} value={this.state.level} onChange={(e) => this.setState({level: e.target.value})} />
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{marginTop:'10px'}}>
        <button type='button' onClick={() => this.showItem()}>Show item</button>
        <button type='button' onClick={() => this.saveItem()}>Save item</button>
      </div>
    </>
    );
  }
};

export default ItemForm;