import type { FetchFunction } from '@ai-sdk/provider-utils';
import { createTestServer } from '@ai-sdk/provider-utils/test';
import { describe, expect, it } from 'vitest';
import { RunwareImageModel } from './runware-image-model';
import type { RunwareImageSettings } from './runware-image-settings';

const prompt = 'A cute baby sea otter';

function createBasicModel({
  headers,
  fetch,
  currentDate,
  settings,
}: {
  headers?: Record<string, string | undefined>;
  fetch?: FetchFunction;
  currentDate?: () => Date;
  settings?: RunwareImageSettings;
} = {}) {
  return new RunwareImageModel('runware:101@1', settings ?? {}, {
    provider: 'runware',
    baseURL: 'https://api.example.com/v1',
    headers: headers ?? { Authorization: 'Bearer test-key' },
    fetch,
    _internal: {
      currentDate,
    },
  });
}

describe('RunwareImageModel', () => {
  const server = createTestServer({
    'https://api.example.com/v1': {
      response: {
        type: 'json-value',
        body: {
          data: [
            {
              taskType: 'imageInference',
              taskUUID: '123e4567-e89b-12d3-a456-426614174000',
              imageUUID: '123e4567-e89b-12d3-a456-426614174001',
              imageURL: 'https://api.example.com/image.png',
              seed: 123456,
            },
          ],
        },
      },
    },
    'https://api.example.com/image.png': {
      response: {
        type: 'binary',
        body: Buffer.from('test-binary-content'),
      },
    },
  });

  describe('doGenerate', () => {
    it('should pass the correct parameters including size', async () => {
      const model = createBasicModel();

      await model.doGenerate({
        prompt,
        n: 1,
        aspectRatio: undefined,
        size: '1024x1024',
        seed: 123,
        providerOptions: { runware: { additional_param: 'value' } },
      });

      const requestBody = await server.calls[0].requestBody;
      expect(requestBody).toHaveLength(1);
      expect(requestBody[0]).toMatchObject({
        taskType: 'imageInference',
        positivePrompt: prompt,
        width: 1024,
        height: 1024,
        model: 'runware:101@1',
        numberResults: 1,
        seed: 123,
        additional_param: 'value',
      });
    });

    it('should pass headers', async () => {
      const modelWithHeaders = createBasicModel({
        headers: {
          'Custom-Provider-Header': 'provider-header-value',
        },
      });

      await modelWithHeaders.doGenerate({
        prompt,
        n: 1,
        size: undefined,
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {},
        headers: {
          'Custom-Request-Header': 'request-header-value',
        },
      });

      expect(server.calls[0].requestHeaders).toMatchObject({
        'content-type': 'application/json',
        'custom-provider-header': 'provider-header-value',
        'custom-request-header': 'request-header-value',
      });
    });

    it('should handle API errors', async () => {
      server.urls['https://api.example.com/v1'].response = {
        type: 'error',
        status: 400,
        body: JSON.stringify({
          error: {
            message: 'Invalid prompt',
          },
        }),
      };

      const model = createBasicModel();
      await expect(
        model.doGenerate({
          prompt,
          n: 1,
          size: undefined,
          aspectRatio: undefined,
          seed: undefined,
          providerOptions: {},
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid prompt'),
        statusCode: 400,
        url: 'https://api.example.com/v1',
      });
    });

    describe('response metadata', () => {
      it('should include timestamp, headers and modelId in response', async () => {
        const testDate = new Date('2024-01-01T00:00:00Z');
        const model = createBasicModel({
          currentDate: () => testDate,
        });

        const result = await model.doGenerate({
          prompt,
          n: 1,
          size: undefined,
          aspectRatio: undefined,
          seed: undefined,
          providerOptions: {},
        });

        expect(result.response).toMatchObject({
          timestamp: testDate,
          modelId: 'runware:101@1',
          headers: expect.any(Object),
        });
      });
    });
  });

  describe('constructor', () => {
    it('should expose correct provider and model information', () => {
      const model = createBasicModel();

      expect(model.provider).toBe('runware');
      expect(model.modelId).toBe('runware:101@1');
      expect(model.specificationVersion).toBe('v1');
      expect(model.maxImagesPerCall).toBe(1);
    });

    it('should use maxImagesPerCall from settings', () => {
      const model = createBasicModel({
        settings: {
          maxImagesPerCall: 4,
        },
      });

      expect(model.maxImagesPerCall).toBe(4);
    });

    it('should default maxImagesPerCall to 1 when not specified', () => {
      const model = createBasicModel();

      expect(model.maxImagesPerCall).toBe(1);
    });
  });
});
