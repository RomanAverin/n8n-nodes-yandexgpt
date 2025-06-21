import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class YandexGPTApi implements ICredentialType {
	name = 'yandexGPTApi';
	displayName = 'YandexGPT API';
	documentationUrl = 'https://yandex.cloud/en/docs/foundation-models/';
	properties: INodeProperties[] = [
		{
			displayName: 'Authentication Method',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'Service Account Key',
					value: 'serviceAccountKey',
				},
				{
					name: 'OAuth Token',
					value: 'oauthToken',
				},
				{
					name: 'IAM Token',
					value: 'iamToken',
				},
			],
			default: 'serviceAccountKey',
		},
		{
			displayName: 'Service Account Key',
			name: 'serviceAccountKey',
			type: 'json',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			displayOptions: {
				show: {
					authType: ['serviceAccountKey'],
				},
			},
			default: '',
			description: 'The service account key JSON content',
			placeholder: '{\n  "id": "...",\n  "service_account_id": "...",\n  "private_key": "..."\n}',
		},
		{
			displayName: 'OAuth Token',
			name: 'oauthToken',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					authType: ['oauthToken'],
				},
			},
			default: '',
			description: 'The OAuth token for Yandex Cloud',
		},
		{
			displayName: 'IAM Token',
			name: 'iamToken',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					authType: ['iamToken'],
				},
			},
			default: '',
			description: 'The IAM token for Yandex Cloud (valid for 12 hours)',
		},
		{
			displayName: 'Folder ID',
			name: 'folderId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Yandex Cloud folder ID where the model is located',
		},
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'string',
			default: 'https://llm.api.cloud.yandex.net',
			description: 'The YandexGPT API endpoint',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.iamToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiEndpoint}}',
			url: '/foundationModels/v1/models',
			method: 'GET',
			headers: {
				Authorization: '=Bearer {{$credentials.iamToken}}',
			},
		},
	};
}
