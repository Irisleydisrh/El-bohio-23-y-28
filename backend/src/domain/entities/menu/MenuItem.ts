import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';

export interface MenuItemProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  available: boolean;
  featured: boolean;
  createdAt: Date;
}

export class MenuItem extends Entity<string> {
  private readonly _name: string;
  private readonly _description?: string;
  private readonly _price: number;
  private readonly _categoryId: string;
  private readonly _imageUrl?: string;
  private readonly _available: boolean;
  private readonly _featured: boolean;
  private readonly _createdAt: Date;

  constructor(props: MenuItemProps) {
    super(props.id);
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._categoryId = props.categoryId;
    this._imageUrl = props.imageUrl;
    this._available = props.available;
    this._featured = props.featured;
    this._createdAt = props.createdAt;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
  }

  get available(): boolean {
    return this._available;
  }

  get featured(): boolean {
    return this._featured;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toPlain(): MenuItemProps {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      categoryId: this._categoryId,
      imageUrl: this._imageUrl,
      available: this._available,
      featured: this._featured,
      createdAt: this._createdAt,
    };
  }

  static create(props: Omit<MenuItemProps, 'id' | 'createdAt' | 'available' | 'featured'>): MenuItem {
    return new MenuItem({
      ...props,
      id: uuidv4(),
      available: true,
      featured: false,
      createdAt: new Date(),
    });
  }
}