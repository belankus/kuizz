import { CollectionVisibility } from '../../generated/prisma/enums.js';

export class CreateCollectionDto {
  name: string;
  description?: string;
  visibility?: CollectionVisibility;
}
