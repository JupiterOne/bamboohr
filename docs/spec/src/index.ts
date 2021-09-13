import { IntegrationSpecConfig } from './types';
import { IntegrationConfig } from '../../../src/types';
import { employeesSpec } from './employees';
import { accessSpec } from './access';
import { companyFilesSpec } from './company-files';
import { employeeFilesSpec } from './employee-files';

export const invocationConfig: IntegrationSpecConfig<IntegrationConfig> = {
  integrationSteps: [
    {
      /**
       * ENDPOINT: n/a
       * PATTERN: Singleton
       */
      id: 'fetch-account',
      name: 'Fetch Account Details',
      entities: [
        {
          resourceName: 'Account',
          _class: 'Account',
          _type: 'bamboohr_account',
        },
      ],
      relationships: [],
      dependsOn: [],
      implemented: true,
    },
    ...employeesSpec,
    ...accessSpec,
    ...companyFilesSpec,
    ...employeeFilesSpec,
  ],
};
