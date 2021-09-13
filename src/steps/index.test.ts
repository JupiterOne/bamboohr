import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../types';
import { fetchUsers } from './access';
import { fetchAccountDetails } from './account';
import { fetchCompanyFiles } from './company-files';
import { fetchEmployees } from './employees';
import { fetchEmployeeFiles } from './employee-files';
import { relationships } from '../constants';

const DEFAULT_CLIENT_NAMESPACE = 'jupiteronepartneraccount';
const DEFAULT_CLIENT_ACCESS_TOKEN = 'client_access_token';

const integrationConfig: IntegrationConfig = {
  clientNamespace: process.env.CLIENT_NAMESPACE || DEFAULT_CLIENT_NAMESPACE,
  clientAccessToken:
    process.env.CLIENT_ACCESS_TOKEN || DEFAULT_CLIENT_ACCESS_TOKEN,
};

jest.setTimeout(1000 * 100);

describe('BambooHR', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupRecording({
      directory: __dirname,
      name: 'bamboohr_recordings',
      options: {
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    // Simulates dependency graph execution.
    // See https://github.com/JupiterOne/sdk/issues/262.
    await fetchAccountDetails(context);
    await fetchUsers(context);
    await fetchCompanyFiles(context);
    await fetchEmployeeFiles(context);
    await fetchEmployees(context);

    // Review snapshot, failure is a regression
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const accounts = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Account'),
    );
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_account' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          displayName: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
        required: [],
      },
    });

    const users = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('User'),
    );
    expect(users.length).toBeGreaterThan(0);
    expect(users).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_user' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          employeeId: {
            type: 'string',
          },
          username: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          displayName: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
        required: [],
      },
    });

    const companyFiles = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('DataObject'),
    );
    expect(companyFiles.length).toBeGreaterThan(0);
    expect(companyFiles).toMatchGraphObjectSchema({
      _class: ['DataObject'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_file' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          classification: {
            type: 'string',
          },
        },
        required: [],
      },
    });

    const employeeFiles = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('DataObject'),
    );
    expect(employeeFiles.length).toBeGreaterThan(0);
    expect(employeeFiles).toMatchGraphObjectSchema({
      _class: ['DataObject'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_file' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          classification: {
            type: 'string',
          },
        },
        required: [],
      },
    });

    const employees = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Record'),
    );
    expect(employees.length).toBeGreaterThan(0);
    expect(employees).toMatchGraphObjectSchema({
      _class: ['Record'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_employee' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          displayName: { type: 'string' },
          name: { type: 'string' },
          username: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          location: { type: 'string' },
          jobTitle: { type: 'string' },
          workEmail: { type: 'string' },
          workPhone: { type: 'string' },
          mobilePhone: { type: 'string' },
          department: { type: 'string' },
          division: { type: 'string' },
          supervisor: { type: 'string' },
          preferredName: { type: 'string' },
          gender: { type: 'string' },
          linkedIn: { type: 'string' },
          workPhoneExtension: { type: 'string' },
          photoUploaded: { type: 'boolean' },
          photoUrl: { type: 'string' },
          canUploadPhoto: { type: 'number' },
        },
        required: [],
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === relationships.USER_IS_EMPLOYEE._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'IS' },
          _type: {
            const: 'bamboohr_user_is_employee',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === relationships.ACCOUNT_HAS_USER._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'bamboohr_account_has_user',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === relationships.ACCOUNT_HAS_FILE._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'bamboohr_account_has_file',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === relationships.USER_HAS_FILE._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'bamboohr_user_has_file',
          },
        },
      },
    });
  });
});
