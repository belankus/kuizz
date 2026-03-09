import { CollectionVisibility } from '../../generated/prisma/enums.js';

export class UpdateCollectionDto {
  name?: string;
  description?: string;
  visibility?: CollectionVisibility;
}
