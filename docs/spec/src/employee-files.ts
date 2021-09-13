import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../src/types';
import { StepSpec } from './types';

export const employeeFilesSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://api.bamboohr.com/api/gateway.php/jupiteronepartneraccount/v1/employees/${employeeId}/files/view
     * PATTERN: Fetch Child Entities
     */
    id: 'fetch-employee-files',
    name: 'Fetch Employee Files',
    entities: [
      {
        resourceName: 'File',
        _class: 'DataObject',
        _type: 'bamboohr_file',
      },
    ],
    relationships: [
      {
        _type: 'bamboohr_user_has_file',
        sourceType: 'bamboohr_user',
        _class: RelationshipClass.HAS,
        targetType: 'bamboohr_file',
      },
    ],
    dependsOn: ['fetch-users'],
    implemented: true,
  },
];
