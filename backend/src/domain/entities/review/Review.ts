import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';

export interface ReviewProps {
  id: string;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface CreateReviewProps {
  customerName: string;
  rating: number;
  comment?: string;
}

export class Review extends Entity<string> {
  private readonly _customerName: string;
  private readonly _rating: number;
  private readonly _comment?: string;
  private readonly _createdAt: Date;

  constructor(props: ReviewProps) {
    super(props.id);
    this._customerName = props.customerName;
    this._rating = props.rating;
    this._comment = props.comment;
    this._createdAt = props.createdAt;
  }

  get customerName(): string { return this._customerName; }
  get rating(): number { return this._rating; }
  get comment(): string | undefined { return this._comment; }
  get createdAt(): Date { return this._createdAt; }

  toPlain(): ReviewProps {
    return {
      id: this._id,
      customerName: this._customerName,
      rating: this._rating,
      comment: this._comment,
      createdAt: this._createdAt,
    };
  }

  static create(props: CreateReviewProps): Review {
    if (props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return new Review({
      id: uuidv4(),
      customerName: props.customerName,
      rating: props.rating,
      comment: props.comment,
      createdAt: new Date(),
    });
  }
}