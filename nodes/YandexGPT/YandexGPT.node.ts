import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { getIamToken } from '../../utils/auth';

interface IYandexGPTMessage {
	role: 'system' | 'user' | 'assistant';
	text: string;
}

interface IYandexGPTRequest {
	modelUri: string;
	completionOptions: {
		stream: boolean;
		temperature: number;
		maxTokens: number;
	};
	messages: IYandexGPTMessage[];
}

interface IYandexGPTResponse {
	result: {
		alternatives: Array<{
			message: {
				role: string;
				text: string;
			};
			status: string;
		}>;
		usage: {
			inputTextTokens: number;
			completionTokens: number;
			totalTokens: number;
		};
		modelVersion: string;
	};
}

export class YandexGPT implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YandexGPT',
		name: 'yandexGPT',
		icon: 'file:yandexgpt.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with YandexGPT API for text generation and chat completions',
		defaults: {
			name: 'YandexGPT',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'yandexGPTApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.apiEndpoint}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat',
						value: 'chat',
						description: 'Generate chat completions',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Generate text completions',
					},
				],
				default: 'chat',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['chat'],
					},
				},
				options: [
					{
						name: 'Complete',
						value: 'complete',
						description: 'Create a chat completion',
						action: 'Create a chat completion',
					},
				],
				default: 'complete',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['text'],
					},
				},
				options: [
					{
						name: 'Generate',
						value: 'generate',
						description: 'Generate text completion',
						action: 'Generate text completion',
					},
				],
				default: 'generate',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'YandexGPT Lite',
						value: 'yandexgpt-lite',
						description: 'Faster and more economical model',
					},
					{
						name: 'YandexGPT',
						value: 'yandexgpt',
						description: 'More capable model with better quality',
					},
					{
						name: 'YandexGPT Pro',
						value: 'yandexgpt/rc',
						description: 'Latest model with enhanced capabilities',
					},
				],
				default: 'yandexgpt-lite',
				description: 'The model to use for completion',
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['complete'],
					},
				},
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'The messages for the chat completion',
				options: [
					{
						name: 'messageValues',
						displayName: 'Message',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{
										name: 'System',
										value: 'system',
									},
									{
										name: 'User',
										value: 'user',
									},
									{
										name: 'Assistant',
										value: 'assistant',
									},
								],
								default: 'user',
							},
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								typeOptions: {
									rows: 2,
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['text'],
						operation: ['generate'],
					},
				},
				default: '',
				typeOptions: {
					rows: 4,
				},
				description: 'The prompt to generate completion for',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				default: 0.6,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Controls randomness in the output. Higher values make output more random.',
			},
			{
				displayName: 'Max Tokens',
				name: 'maxTokens',
				type: 'number',
				default: 2000,
				typeOptions: {
					minValue: 1,
					maxValue: 8000,
				},
				description: 'The maximum number of tokens to generate',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Stream',
						name: 'stream',
						type: 'boolean',
						default: false,
						description: 'Whether to stream back partial progress',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const temperature = this.getNodeParameter('temperature', i) as number;
				const maxTokens = this.getNodeParameter('maxTokens', i) as number;
				const options = this.getNodeParameter('options', i) as any;

				const credentials = await this.getCredentials('yandexGPTApi');
				const folderId = credentials.folderId as string;

				// Get IAM token
				const iamToken = await getIamToken(credentials, this.helpers.httpRequest);

				// Prepare request
				let messages: IYandexGPTMessage[] = [];

				if (resource === 'chat') {
					const messagesInput = this.getNodeParameter('messages', i) as any;
					if (messagesInput.messageValues) {
						messages = messagesInput.messageValues.map((msg: any) => ({
							role: msg.role,
							text: msg.text,
						}));
					}
				} else if (resource === 'text') {
					const prompt = this.getNodeParameter('prompt', i) as string;
					messages = [
						{
							role: 'user',
							text: prompt,
						},
					];
				}

				if (messages.length === 0) {
					throw new NodeOperationError(this.getNode(), 'No messages provided');
				}

				const modelUri = `gpt://${folderId}/${model}/latest`;

				const requestBody: IYandexGPTRequest = {
					modelUri,
					completionOptions: {
						stream: options.stream || false,
						temperature,
						maxTokens,
					},
					messages,
				};

				// Make request to YandexGPT API
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${credentials.apiEndpoint}/foundationModels/v1/completion`,
					headers: {
						Authorization: `Bearer ${iamToken}`,
						'Content-Type': 'application/json',
					},
					body: requestBody,
					json: true,
				});

				const responseData = response as IYandexGPTResponse;

				if (!responseData.result || !responseData.result.alternatives) {
					throw new NodeOperationError(this.getNode(), 'Invalid response from YandexGPT API');
				}

				const completion = responseData.result.alternatives[0];
				if (completion.status !== 'ALTERNATIVE_STATUS_FINAL') {
					throw new NodeOperationError(
						this.getNode(),
						`Completion failed with status: ${completion.status}`,
					);
				}

				returnData.push({
					json: {
						message: completion.message,
						usage: responseData.result.usage,
						modelVersion: responseData.result.modelVersion,
						input: {
							messages,
							model,
							temperature,
							maxTokens,
						},
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
