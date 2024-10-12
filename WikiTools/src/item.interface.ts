export type ItemType = 'HairAccessory' | 'HeadAccessory' | 'Hair' | 'Mask' | 'FaceAccessory' | 'Necklace' | 'Outfit' | 'Shoes' | 'Cape' | 'Held' |
  'Furniture' | 'Prop' | 'Emote' | 'Stance' | 'Call' | 'Spell' | 'Music' | 'Quest' | 'WingBuff' | 'Special';
export type ItemSubtype = '' | 'Instrument' | 'FriendEmote';
export type ItemGroup = '' | 'SeasonPass' | 'Ultimate' | 'Elder' | 'Limited';
export type Item = {
  guid: string;
  type: string;
  name: string;
  icon: string;
  group?: ItemGroup;
};

export type Tree = {
  guid: string;
  node: Node;
};

export type Node = {
  guid: string;
  item: string;
  nw?: Node;
  n?: Node;
  ne?: Node;
  c?: number;
  h?: number;
  ac?: number;
  sc?: number;
  sh?: number;
  ec?: number;
};
