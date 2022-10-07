export class Notification {
  // todo: not implemented. need to add
  userId: string;

  type: string;

  // todo: Discuss. Used as id currently. Probably need to add userId field and change unique constraint
  timestamp: number;

  title: string;

  category?: string;

  categoryColor?: string;

  body: string;

  read?: boolean;
}
