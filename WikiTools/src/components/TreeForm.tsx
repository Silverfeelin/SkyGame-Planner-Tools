import { Component } from 'react';
import { HtmlHelper } from '../helpers/html-helper';
import { Item, Tree, Node } from '../item.interface';
import { ClipboardHelper } from '../helpers/clipboard-helper';
import { nanoid } from 'nanoid';

type State = {
  items: Array<Item>,
  element?: HTMLElement,
  tree?: Tree,
  treeItems?: Array<Item>
}

class TreeForm extends Component {
  props: { };
  state: State = {
    items: [],
    element: undefined
  };

  mousePos = [0, 0];

  itemIconUrls: Array<Item> = [
    { guid: '', type: 'Special', name: 'Heart', icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d9/Heart.png' },
    { guid: '', type: 'WingBuff', name: 'Wing Buff', icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Winglight.png' },
    { guid: '', type: 'Special', name: 'Placeholder', icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/60/Question-mark-Ray.png' },
    { guid: '', type: 'Quest', name: 'Quest', icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8b/Exclamation-mark-Ray.png' },
    { guid: '', type: 'Special', name: 'Blessing', icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png' },
    { guid: '', type: 'Special', name: 'Warp', icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/67/Icon_warp.png' }
  ]
  itemIconUrlMap: { [key: string]: Item } = this.itemIconUrls.reduce((acc, item) => { acc[item.icon] = item; return acc; }, {} as { [key: string]: Item });

  componentDidMount() {
    document.addEventListener('mousedown', e => { 
      const target = (e.target as HTMLElement).closest('.spirits-table');;
      if (!target) return;
      this.setState({ element: target as HTMLElement });
    });
  }

  componentWillUnmount() {
  }

  getEl() { return document.elementFromPoint(this.mousePos[0], this.mousePos[1]) as HTMLElement; }

  async loadDataFromClipboard(): Promise<void> {
    const data = await ClipboardHelper.getText();
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed?.items)) { throw new Error('Invalid data'); }
      this.setState({ items: parsed.items });
    } catch { /**/ }
  }

  copyTree(): void {
    if (!this.state.tree) { alert('No tree found'); return; }

    const tree = {
      guid: this.state.tree.guid,
      node: this.state.tree.node.guid
    };
    navigator.clipboard.writeText(JSON.stringify(tree, undefined, 2));
  }

  copyNodes(): void {
    if (!this.state.tree) { alert('No tree found'); return; }
    const nodes: any = [];

    const addNode = (n: Node) => {
      const sNode: any = {
        guid: n.guid,
        item: n.item,
      };
      nodes.push(sNode);

      if (n.c >= 0) { sNode.c = n.c; }
      if (n.h >= 0) { sNode.h = n.h; }
      if (n.ac >= 0) { sNode.ac = n.ac; }
      if (n.sc >= 0) { sNode.sc = n.sc; }
      if (n.sh >= 0) { sNode.sh = n.sh; }
      if (n.ec >= 0) { sNode.ec = n.ec; }
      
      if (n.nw) {
        sNode.nw = n.nw.guid;
        addNode(n.nw);
      }

      if (n.ne) {
        sNode.ne = n.ne.guid;
        addNode(n.ne);
      }

      if (n.n) {
        sNode.n = n.n.guid;
        addNode(n.n);
      }
    };
    addNode(this.state.tree.node);

    let json = JSON.stringify(nodes, undefined, 2).replace(/([^,}],?)\n\s*/g, '$1 ').replace('[', '').replace(']', '');
    navigator.clipboard.writeText(json);
  }

  copyItems(): void {
    if (!this.state.treeItems || !this.state.treeItems.length) { alert('No items found'); return; }
    navigator.clipboard.writeText(JSON.stringify(this.state.treeItems, undefined, 2));
  }

  async createTree(): Promise<void> {
    if (!this.state.element) { alert('No element selected'); return; }
    
    const rows = Array.from(this.state.element.querySelectorAll('.node-row')) as Array<HTMLElement>;
    if (!rows.length) { alert ('No rows found'); return; }
    rows.reverse();
    
    const cells = [
      rows.map(r => r.querySelector('.node-cell-left') as HTMLElement),
      rows.map(r => r.querySelector('.node-cell-center') as HTMLElement),
      rows.map(r => r.querySelector('.node-cell-right') as HTMLElement)
    ];

    const itemByIconMap: { [key: string]: Item } = this.state.items.reduce((acc, item) => {
      return (acc[item.icon] = item) && acc;
    }, {} as { [key: string]: Item });
    
    const newItems: Array<Item> = [];    
    const parseNode = (divNode: HTMLElement, node: Node, x: number, y: number): Node | undefined => {
      if (!divNode || !divNode.children.length) { return undefined; }

      // Get item icon.
      const divMain = divNode.querySelector('.node-main-box') as HTMLElement;
      const itemIcon = HtmlHelper.getImageSrc(divMain?.querySelector('img'))
        || this.itemIconUrls.find(i => i.name === 'Placeholder').icon;

      // Create new item or look up existing item.
      const itemTemplate = this.itemIconUrlMap[itemIcon];
      let itemGuid: string;
      if (itemTemplate) {
        const item = { guid: nanoid(10), type: itemTemplate.type, name: itemTemplate.name, icon: itemIcon };
        newItems.push(item);
        itemGuid = item.guid;
      } else {
        let item = itemByIconMap[itemIcon];
        if (!item) { 
          item = { guid: nanoid(10), type: 'Special', name: 'PLACEHOLDER', icon: itemIcon };
          newItems.push(item);
        }
        itemGuid = item.guid;
      }

      // Fill node
      node.guid = nanoid(10);
      node.item = itemGuid;
      const [divLeft, divUp, divRight] = [
        cells[x - 1]?.[y],
        cells[x]?.[y + 1],
        cells[x + 1]?.[y]
      ];
      if (divLeft?.classList.contains('node-line-left')) {
        node.nw = parseNode(divLeft, { guid: '', item: '' }, x - 1, y);
      }
      if (divUp?.classList.contains('node-line-vertical')) {
        node.n = parseNode(divUp, { guid: '', item: '' }, x, y + 1);
      }
      if (divRight?.classList.contains('node-line-right')) {
        node.ne = parseNode(divRight, { guid: '', item: '' }, x + 1, y);
      }

      // Get cost
      const costDiv = divNode.querySelector('.node-cost-box') as HTMLElement;
      const cost = +(costDiv?.textContent || '0');

      if (costDiv && cost) {
        const title = costDiv.querySelector('a')?.title || '';
        if (title === 'Candle') { node.c = cost; }
        if (title === 'Heart') { node.h = cost; }
        if (title === 'Ascended Candle') { node.ac = cost; }
        if (title === 'Season Candle') { node.sc = cost; }
        if (title === 'Season Heart') { node.sh = cost; }
        if (title === 'Ticket') { node.ec = cost; }
      }

      return node;
    }
    
    const firstNode = parseNode(cells[1][0], { guid: '', item: '' }, 1, 0);
    const tree: Tree = { guid: nanoid(10), node: firstNode };

    this.setState({ tree, treeItems: newItems });
    
    console.log(newItems);
    console.log(tree);    

    // const item = {};
    // await fetch('http://localhost:4201/api/item', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(item) 
    // }).then(res => res.json()).then(console.log).catch(console.error);
  }

  render() {
    return (  
      <>
        <table>
        <tbody>   
          <tr>          
            <td>
              <span>Item data:</span>
            </td>
            <td>
              <button onClick={() => this.loadDataFromClipboard()}>Load from clipboard</button>
            </td>
          </tr>
          <tr>
            <td>Element</td>
            <td>{this.state.element?.tagName}</td>
          </tr>
        </tbody>
      </table>
      <div style={{marginTop:'10px'}}>
        <button type='button' onClick={() => this.createTree()}>Create</button>
        <button type='button' onClick={() => this.copyTree()}>Copy tree</button>
        <button type='button' onClick={() => this.copyNodes()}>Node</button>
        <button type='button' onClick={() => this.copyItems()}>Items</button>
      </div>
    </>
    );
  }
};

export default TreeForm;