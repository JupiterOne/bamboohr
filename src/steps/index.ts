import { accountSteps } from './account';
import { accessSteps } from './access';
import { employeeFilesSteps } from './employee-files';
import { companyFilesSteps } from './company-files';
import { employeesSteps } from './employees';

const integrationSteps = [
  ...accountSteps,
  ...accessSteps,
  ...employeeFilesSteps,
  ...companyFilesSteps,
  ...employeesSteps,
];

export { integrationSteps };
