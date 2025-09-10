import type { ImageModelV2, ImageModelV2CallWarning } from '@ai-sdk/provider';
import type { Resolvable } from '@ai-sdk/provider-utils';
import type { FetchFunction } from '@ai-sdk/provider-utils';
import {
  combineHeaders,
  createBinaryResponseHandler,
  createJsonResponseHandler,
  createStatusCodeErrorResponseHandler,
  getFromApi,
  postJsonToApi,
  resolve,
} from '@ai-sdk/provider-utils';
import { runwareFailedResponseHandler } from './runware-error';
import type { RunwareImageModelId, RunwareImageSettings } from './runware-image-settings';
import { z } from 'zod';

interface RunwareImageModelConfig {
  provider: string;
  baseURL: string;
  headers?: Resolvable<Record<string, string | undefined>>;
  fetch?: FetchFunction;
  _internal?: {
    currentDate?: () => Date;
  };
}

const runwareImageResponseSchema = z.object({
  data: z.array(
    z.object({
      taskType: z.literal('imageInference'),
      taskUUID: z.string(),
      imageUUID: z.string(),
      imageURL: z.string().optional(),
      imageBase64Data: z.string().optional(),
      imageDataURI: z.string().optional(),
      NSFWContent: z.boolean().optional(),
      cost: z.number().optional(),
      seed: z.number(),
    })
  ),
  error: z.record(z.any()).optional(),
});

export class RunwareImageModel implements ImageModelV2 {
  readonly specificationVersion = 'v2';

  get provider(): string {
    return this.config.provider;
  }

  get maxImagesPerCall(): number {
    return this.settings.maxImagesPerCall ?? 1;
  }

  constructor(
    readonly modelId: RunwareImageModelId,
    private readonly settings: RunwareImageSettings,
    private readonly config: RunwareImageModelConfig
  ) {}

  async doGenerate({
    prompt,
    n,
    size,
    seed,
    providerOptions,
    headers,
    abortSignal,
  }: Parameters<ImageModelV2['doGenerate']>[0]): Promise<
    Awaited<ReturnType<ImageModelV2['doGenerate']>>
  > {
    const warnings: Array<ImageModelV2CallWarning> = [];
    const currentDate = this.config._internal?.currentDate?.() ?? new Date();

    // Parse size parameter (format: "widthxheight")
    let width = 512;
    let height = 512;

    if (size) {
      const [widthStr, heightStr] = size.split('x');
      width = parseInt(widthStr, 10);
      height = parseInt(heightStr, 10);
    }

    // Prepare the request payload
    const requestPayload = [
      {
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        width,
        height,
        model: this.modelId,
        numberResults: n || 1,
        seed: seed,
        outputType: this.settings.outputType || 'URL',
        outputFormat: this.settings.outputFormat || 'PNG',
        outputQuality: this.settings.outputQuality || 95,
        checkNSFW: this.settings.checkNSFW || false,
        includeCost: this.settings.includeCost || false,
        negativePrompt: this.settings.negativePrompt,
        steps: this.settings.steps,
        scheduler: this.settings.scheduler,
        CFGScale: this.settings.CFGScale,
        clipSkip: this.settings.clipSkip,
        promptWeighting: this.settings.promptWeighting,
        ...(providerOptions.runware ?? {}),
      },
    ];

    // Make the API call
    const { value, responseHeaders } = await postJsonToApi({
      url: this.config.baseURL,
      headers: combineHeaders(await resolve(this.config.headers), headers),
      body: requestPayload,
      failedResponseHandler: runwareFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(runwareImageResponseSchema),
      abortSignal,
      fetch: this.config.fetch,
    });

    if (value.error) {
      throw new Error(`Runware API error: ${JSON.stringify(value.error)}`);
    }

    // Process the response and download images if needed
    const images: Uint8Array[] = [];

    warnings.push({
      type: 'other',
      message: `Response data: ${JSON.stringify(value.data)}`,
    });

    for (const result of value.data) {
      if (result.imageURL) {
        // Download the image from the URL
        const imageData = await this.downloadImage(result.imageURL, abortSignal);
        images.push(imageData);
      } else if (result.imageBase64Data) {
        // Convert base64 to Uint8Array
        const binaryString = atob(result.imageBase64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        images.push(bytes);
      } else if (result.imageDataURI) {
        // Extract base64 data from data URI
        const base64Data = result.imageDataURI.split(',')[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        images.push(bytes);
      } else {
        warnings.push({
          type: 'other',
          message: `No image data found for result with UUID ${result.imageUUID}`,
        });
      }
    }

    return {
      images,
      warnings,
      response: {
        modelId: this.modelId,
        timestamp: currentDate,
        headers: responseHeaders,
      },
    };
  }

  private async downloadImage(
    url: string,
    abortSignal: AbortSignal | undefined
  ): Promise<Uint8Array> {
    const { value: response } = await getFromApi({
      url,
      abortSignal,
      failedResponseHandler: createStatusCodeErrorResponseHandler(),
      successfulResponseHandler: createBinaryResponseHandler(),
      fetch: this.config.fetch,
    });
    return response;
  }
}
