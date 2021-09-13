import { IntegrationConfig } from '../../../src/types';
import { StepSpec } from './types';

export const employeesSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://api.bamboohr.com/api/gateway.php/jupiteronepartneraccount/v1/employees/directory
     * PATTERN: Fetch Entities
     */
    id: 'fetch-employees',
    name: 'Fetch Employees',
    entities: [
      {
        resourceName: 'Employee',
        _class: 'Record',
        _type: 'bamboohr_employee',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: true,
  },
];
