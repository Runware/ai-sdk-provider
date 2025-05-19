import type { ImageModelV1, ProviderV1 } from '@ai-sdk/provider';
import { NoSuchModelError } from '@ai-sdk/provider';
import type { FetchFunction } from '@ai-sdk/provider-utils';
import { withoutTrailingSlash } from '@ai-sdk/provider-utils';
import { RunwareImageModel } from './runware-image-model';
import type { RunwareImageModelId, RunwareImageSettings } from './runware-image-settings';

export interface RunwareProviderSettings {
  /**
  Runware API key. Default value is taken from the `RUNWARE_API_KEY` environment variable.
   */
  apiKey?: string;

  /**
  Base URL for the API calls.
  The default prefix is `https://api.runware.ai/v1`.
   */
  baseURL?: string;

  /**
  Custom headers to include in the requests.
   */
  headers?: Record<string, string>;

  /**
  Custom fetch implementation. You can use it as a middleware to intercept
  requests, or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;
}

export interface RunwareProvider extends ProviderV1 {
  /**
  Creates a model for image generation.
   */
  image(modelId: RunwareImageModelId, settings?: RunwareImageSettings): ImageModelV1;

  /**
  Creates a model for image generation.
   */
  imageModel(modelId: RunwareImageModelId, settings?: RunwareImageSettings): ImageModelV1;
}

const defaultBaseURL = 'https://api.runware.ai/v1';

function loadRunwareApiKey({
  apiKey,
  description = 'Runware',
}: {
  apiKey: string | undefined;
  description?: string;
}): string {
  if (typeof apiKey === 'string') {
    return apiKey;
  }

  if (apiKey != null) {
    throw new Error(`${description} API key must be a string.`);
  }

  if (typeof process === 'undefined') {
    throw new Error(
      `${description} API key is missing. Pass it using the 'apiKey' parameter. Environment variables are not supported in this environment.`
    );
  }

  const envApiKey = process.env.RUNWARE_API_KEY;

  if (envApiKey == null) {
    throw new Error(
      `${description} API key is missing. Pass it using the 'apiKey' parameter or set the RUNWARE_API_KEY environment variable.`
    );
  }

  if (typeof envApiKey !== 'string') {
    throw new Error(
      `${description} API key must be a string. The value of the environment variable is not a string.`
    );
  }

  return envApiKey;
}

/**
Create a Runware provider instance.
 */
export function createRunware(options: RunwareProviderSettings = {}): RunwareProvider {
  const baseURL = withoutTrailingSlash(options.baseURL ?? defaultBaseURL);
  const getHeaders = () => ({
    Authorization: `Bearer ${loadRunwareApiKey({
      apiKey: options.apiKey,
    })}`,
    ...options.headers,
  });

  const createImageModel = (modelId: RunwareImageModelId, settings: RunwareImageSettings = {}) =>
    new RunwareImageModel(modelId, settings, {
      provider: 'runware.image',
      baseURL: baseURL || defaultBaseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  return {
    image: createImageModel,
    imageModel: createImageModel,
    languageModel: () => {
      throw new NoSuchModelError({
        modelId: 'languageModel',
        modelType: 'languageModel',
      });
    },
    textEmbeddingModel: () => {
      throw new NoSuchModelError({
        modelId: 'textEmbeddingModel',
        modelType: 'textEmbeddingModel',
      });
    },
  };
}

/**
Default Runware provider instance.
 */
export const runware = createRunware();
