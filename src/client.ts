import fetch, { Response } from 'node-fetch';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import {
  BambooHREmployee,
  BambooHRFile,
  BambooHRFilesResponse,
  BambooHRUser,
  EmployeeDetails,
  IntegrationConfig,
  StatusError,
} from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

export function normalizeClientNamespace(
  userInput: string,
): string | undefined {
  const match = /(?:https?:\/\/)?([^.]+)(?:\.bamboohr\.com)?/.exec(userInput);
  if (match) {
    return match[1];
  }
}

export class APIClient {
  private readonly clientNamespace: string;
  private readonly clientAccessToken: string;

  constructor(readonly config: IntegrationConfig) {
    this.clientNamespace = normalizeClientNamespace(config.clientNamespace)!;
    this.clientAccessToken = config.clientAccessToken;

    if (!this.clientNamespace) {
      throw new Error(
        `Illegal clientNamespace value: ${JSON.stringify(
          config.clientNamespace,
        )}`,
      );
    }
  }

  private withBaseUri(path: string): string {
    return `https://api.bamboohr.com/api/gateway.php/${this.clientNamespace}/${path}`;
  }

  private async request(
    uri: string,
    method: 'GET' | 'HEAD' = 'GET',
  ): Promise<Response> {
    return await fetch(uri, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(
          this.clientAccessToken + ':x',
        ).toString('base64')}`,
      },
    });
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      const response = await this.request(
        this.withBaseUri('v1/employees/0'),
        'GET',
      );

      // A 200 is expected when authentication works and the employee exists A
      // 404 is expected when authentication works and the employee does not
      // exist There may be a better endpoint to verify authentication, but this
      // one seems the most lightweight at this time.
      if (response.status !== 200 && response.status !== 404) {
        throw new StatusError({
          message: 'Provider authentication failed',
          statusCode: response.status,
          statusText: response.statusText,
        });
      }
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: `https://api.bamboohr.com/api/gateway.php/${this.clientNamespace}/v1/employees/0`,
        status: err.options ? err.options.statusCode : -1,
        statusText: err.options ? err.options.statusText : '',
      });
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<BambooHRUser>,
  ): Promise<void> {
    const usersResponse = await this.request(this.withBaseUri('v1/meta/users'));
    const usersObject = await usersResponse.json();
    const users: BambooHRUser[] = Object.values(usersObject);
    const employees = await this.fetchEmployeeDirectory();

    for (const user of users) {
      await iteratee({
        ...user,
        employeeDetails: employees.get(user.employeeId.toString()) || {},
      });
    }
  }

  public async iterateEmployees(
    iteratee: ResourceIteratee<BambooHREmployee>,
  ): Promise<void> {
    const employees = await this.fetchEmployeeDirectory();
    for (const employee of employees.values()) {
      await iteratee(employee);
    }
  }

  private async fetchEmployeeDirectory(): Promise<
    Map<string, BambooHREmployee>
  > {
    const employeesResponse = await this.request(
      this.withBaseUri('v1/employees/directory'),
    );
    const employeesObject = await employeesResponse.json();
    const employeeMap: Map<string, BambooHREmployee> = new Map();

    for (const employee of employeesObject.employees as Array<
      BambooHREmployee
    >) {
      employeeMap.set(employee.id, employee);
    }

    return employeeMap;
  }

  /**
   * Gets additional employee data as necessary. Currently we just need
   * terminationDate and hireDate, but we can/should extend this whenever
   * we are in need of another property.
   *
   * @param employeeId employee's id
   */
  public async getEmployeeDetails(
    employeeId: string,
  ): Promise<EmployeeDetails> {
    const response = await this.request(
      this.withBaseUri(
        `v1/employees/${employeeId}/?fields=terminationDate,hireDate`,
      ),
    );
    const details = await response.json();

    return {
      hireDate: details.hireDate,
      terminationDate: details.terminationDate,
    };
  }

  /**
   * Iterates each employee file in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateEmployeeFiles(
    employeeId: string,
    iteratee: ResourceIteratee<BambooHRFile>,
  ): Promise<void> {
    const response = await this.request(
      this.withBaseUri(`v1/employees/${employeeId}/files/view`),
    );

    if (response.ok) {
      const files: BambooHRFilesResponse = await response.json();
      const categoryFiles = files.categories.reduce(
        (acc, category) => acc.concat(category.files),
        [] as BambooHRFile[],
      );

      for (const file of categoryFiles) {
        await iteratee(file);
      }
    }
  }

  /**
   * Iterates each company file in the provider
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateCompanyFiles(
    iteratee: ResourceIteratee<BambooHRFile>,
  ): Promise<void> {
    const response = await this.request(this.withBaseUri(`v1/files/view`));

    if (response.ok) {
      const files: BambooHRFilesResponse = await response.json();
      const categoryFiles = files.categories.reduce(
        (acc, category) => acc.concat(category.files),
        [] as BambooHRFile[],
      );

      for (const file of categoryFiles) {
        await iteratee(file);
      }
    }
  }
}
