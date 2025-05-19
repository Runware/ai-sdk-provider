// Define supported image sizes
export type RunwareImageSize = {
  width: number;
  height: number;
};

// Define model ID format
export type RunwareImageModelId = string;

// Settings for the Runware image model
export interface RunwareImageSettings {
  /**
   Override the maximum number of images per call (default 1).
   */
  maxImagesPerCall?: number;

  /**
   Output format for the generated images.
   */
  outputFormat?: 'JPG' | 'PNG' | 'WEBP';

  /**
   Output quality for the generated images (20-99).
   */
  outputQuality?: number;

  /**
   Output type for the generated images.
   */
  outputType?: 'URL' | 'base64Data' | 'dataURI';

  /**
   Check if generated images contain NSFW content.
   */
  checkNSFW?: boolean;

  /**
   Include cost information in the response.
   */
  includeCost?: boolean;

  /**
   Negative prompt to guide what should not appear in the generated images.
   */
  negativePrompt?: string;

  /**
   Number of inference steps (1-100).
   */
  steps?: number;

  /**
   Sampler/scheduler to use for generation.
   */
  scheduler?: string;

  /**
   CFG Scale for the generation (0-50).
   */
  CFGScale?: number;

  /**
   Clip Skip value (0-2).
   */
  clipSkip?: number;

  /**
   Prompt weighting method.
   */
  promptWeighting?: '' | 'compel' | 'sdEmbeds';
}
