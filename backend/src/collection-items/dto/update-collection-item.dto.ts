import { CollectionItemType } from '../../generated/prisma/enums.js';

export class UpdateCollectionItemDto {
  type?: CollectionItemType;
  quizId?: string;
  bankId?: string;
}
