import {
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { ACCOUNT_ENTITY_DATA_KEY, entities, relationships } from '../constants';
import { IntegrationConfig } from '../types';
import { getEmployeeKey } from './employees';

export function getUserKey(id: number): string {
  return `bamboohr_user:${id}`;
}

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const accountEntity = (await jobState.getData(
    ACCOUNT_ENTITY_DATA_KEY,
  )) as Entity;

  await apiClient.iterateUsers(async (user) => {
    const userEntity = createIntegrationEntity({
      entityData: {
        source: user,
        assign: {
          _key: getUserKey(user.id),
          _type: entities.USER._type,
          _class: entities.USER._class,
          id: `${user.id}`,
          active: user.status === 'enabled',
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${user.employeeId}`,
          employeeId: `${user.employeeId}`,
          displayName: `${user.firstName} ${user.lastName}`,
          name: `${user.firstName} ${user.lastName}`,
          username: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          location: user.employeeDetails?.location,
          jobTitle: user.employeeDetails?.jobTitle,
          workEmail: user.employeeDetails?.workEmail,
          department: user.employeeDetails?.department,
          division: user.employeeDetails?.division,
          mobilePhone: user.employeeDetails?.mobilePhone,
          workPhone: user.employeeDetails?.workPhone,
          supervisor: user.employeeDetails?.supervisor,
        },
      },
    });

    await jobState.addEntity(userEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: userEntity,
      }),
    );

    if (user.employeeId) {
      const employeeEntity = await jobState.findEntity(
        getEmployeeKey(`${user.employeeId}`),
      );
      if (employeeEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.IS,
            from: userEntity,
            to: employeeEntity,
          }),
        );
      }
    }
  });
}

export const accessSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [entities.USER],
    relationships: [
      relationships.ACCOUNT_HAS_USER,
      relationships.USER_IS_EMPLOYEE,
    ],
    dependsOn: ['fetch-account', 'fetch-employees'],
    executionHandler: fetchUsers,
  },
];
