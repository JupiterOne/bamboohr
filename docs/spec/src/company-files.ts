import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../src/types';
import { StepSpec } from './types';

export const companyFilesSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://api.bamboohr.com/api/gateway.php/jupiteronepartneraccount/v1/files/view
     * PATTERN: Fetch Entities
     */
    id: 'fetch-company-files',
    name: 'Fetch Company Files',
    entities: [
      {
        resourceName: 'File',
        _class: 'DataObject',
        _type: 'bamboohr_file',
      },
    ],
    relationships: [
      {
        _type: 'bamboohr_account_has_file',
        sourceType: 'bamboohr_account',
        _class: RelationshipClass.HAS,
        targetType: 'bamboohr_file',
      },
    ],
    dependsOn: ['fetch-account'],
    implemented: true,
  },
];
