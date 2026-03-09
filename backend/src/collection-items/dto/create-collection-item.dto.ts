import { CollectionItemType } from '../../generated/prisma/enums.js';

export class CreateCollectionItemDto {
  type: CollectionItemType;
  quizId?: string;
  bankId?: string;
}
