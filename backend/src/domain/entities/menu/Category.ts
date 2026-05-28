import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';

export interface CategoryProps {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  createdAt: Date;
}

export class Category extends Entity<string> {
  private readonly _name: string;
  private readonly _description?: string;
  private readonly _icon?: string;
  private readonly _displayOrder: number;
  private readonly _createdAt: Date;

  constructor(props: CategoryProps) {
    super(props.id);
    this._name = props.name;
    this._description = props.description;
    this._icon = props.icon;
    this._displayOrder = props.displayOrder;
    this._createdAt = props.createdAt;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  get displayOrder(): number {
    return this._displayOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toPlain(): CategoryProps {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      icon: this._icon,
      displayOrder: this._displayOrder,
      createdAt: this._createdAt,
    };
  }

  static create(props: Omit<CategoryProps, 'id' | 'createdAt'>): Category {
    return new Category({
      ...props,
      id: uuidv4(),
      createdAt: new Date(),
    });
  }
}