import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const ACCOUNT_ENTITY_DATA_KEY = 'entity:account';

type EntityConstantKeys = 'ACCOUNT' | 'USER' | 'FILE' | 'EMPLOYEE';

export const entities: Record<EntityConstantKeys, StepEntityMetadata> = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'bamboohr_account',
    _class: 'Account',
  },
  USER: {
    resourceName: 'User',
    _type: 'bamboohr_user',
    _class: 'User',
  },
  FILE: {
    resourceName: 'File',
    _type: 'bamboohr_file',
    _class: 'DataObject',
  },
  EMPLOYEE: {
    resourceName: 'Employee',
    _type: 'bamboohr_employee',
    _class: 'Record',
  },
};

type RelationshipConstantKeys =
  | 'ACCOUNT_HAS_USER'
  | 'ACCOUNT_HAS_FILE'
  | 'USER_HAS_FILE'
  | 'USER_IS_EMPLOYEE';

export const relationships: Record<
  RelationshipConstantKeys,
  StepRelationshipMetadata
> = {
  ACCOUNT_HAS_USER: {
    _type: 'bamboohr_account_has_user',
    _class: RelationshipClass.HAS,
    sourceType: entities.ACCOUNT._type,
    targetType: entities.USER._type,
  },
  ACCOUNT_HAS_FILE: {
    _type: 'bamboohr_account_has_file',
    _class: RelationshipClass.HAS,
    sourceType: entities.ACCOUNT._type,
    targetType: entities.FILE._type,
  },
  USER_HAS_FILE: {
    _type: 'bamboohr_user_has_file',
    _class: RelationshipClass.HAS,
    sourceType: entities.USER._type,
    targetType: entities.FILE._type,
  },
  USER_IS_EMPLOYEE: {
    _type: 'bamboohr_user_is_employee',
    _class: RelationshipClass.IS,
    sourceType: entities.USER._type,
    targetType: entities.EMPLOYEE._type,
  },
};
