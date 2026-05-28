import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'admin' | 'user';

export interface UserProps {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface CreateUserProps {
  email: string;
  role?: UserRole;
}

export class User extends Entity<string> {
  private readonly _email: string;
  private readonly _role: UserRole;
  private readonly _createdAt: Date;

  constructor(props: UserProps) {
    super(props.id);
    this._email = props.email;
    this._role = props.role;
    this._createdAt = props.createdAt;
  }

  get email(): string { return this._email; }
  get role(): UserRole { return this._role; }
  get createdAt(): Date { return this._createdAt; }

  isAdmin(): boolean {
    return this._role === 'admin';
  }

  toPlain(): UserProps {
    return {
      id: this._id,
      email: this._email,
      role: this._role,
      createdAt: this._createdAt,
    };
  }

  static create(props: CreateUserProps): User {
    return new User({
      id: uuidv4(),
      email: props.email,
      role: props.role || 'user',
      createdAt: new Date(),
    });
  }
}