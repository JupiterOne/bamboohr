import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { entities } from '../constants';
import { IntegrationConfig } from '../types';

export function getEmployeeKey(id: string): string {
  return `bamboohr_employee:${id}`;
}

export async function fetchEmployees({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  await apiClient.iterateEmployees(async (employee) => {
    const employeeEntity = createIntegrationEntity({
      entityData: {
        source: employee,
        assign: {
          _key: getEmployeeKey(employee.id),
          _type: entities.EMPLOYEE._type,
          _class: entities.EMPLOYEE._class,
          id: `${employee.id}`,
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${employee.id}`,
          displayName: `${employee.firstName} ${employee.lastName}`,
          name: `${employee.firstName} ${employee.lastName}`,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.workEmail || undefined,
          location: employee.location,
          jobTitle: employee.jobTitle || undefined,
          workEmail: employee.workEmail || undefined,
          department: employee.department,
          division: employee.division || undefined,
          mobilePhone: employee.mobilePhone || undefined,
          workPhone: employee.workPhone || undefined,
          supervisor: employee.supervisor,
          preferredName: employee.preferredName || undefined,
          gender: employee.gender,
          linkedIn: employee.linkedIn || undefined,
          workPhoneExtension: employee.workPhoneExtension || undefined,
          photoUploaded: employee.photoUploaded,
          photoUrl: employee.photoUrl,
          canUploadPhoto: employee.canUploadPhoto,
        },
      },
    });

    await jobState.addEntity(employeeEntity);
  });
}

export const employeesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-employees',
    name: 'Fetch Employees',
    entities: [entities.EMPLOYEE],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchEmployees,
  },
];
