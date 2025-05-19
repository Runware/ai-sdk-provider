# Runware Provider for Vercel AI SDK

A community provider for the [Vercel AI SDK](https://sdk.vercel.ai/docs) that integrates with the [Runware API](https://runware.ai/) for image generation.

## Installation

Install the Runware provider package along with the Vercel AI SDK:

```bash
npm install @runware/ai-sdk-provider ai@^4.3.16
```

You'll need a Runware API key to use this provider. [Sign up at Runware](https://runware.ai/) to obtain one.

## Quick Start

```typescript
import { runware } from '@runware/ai-sdk-provider';
import { experimental_generateImage as generateImage } from 'ai';
import fs from 'fs';

// Generate an image
const { image } = await generateImage({
  model: runware.image('runware:101@1'),
  prompt: 'A cat wearing an intricate robe',
  size: '1024x1024',
});

// Save the image
const filename = `image-${Date.now()}.png`;
fs.writeFileSync(filename, image.uint8Array);
console.log(`Image saved to ${filename}`);
```

## Provider Configuration

### Default Provider

Import the default provider instance that uses environment variables for configuration:

```typescript
import { runware } from '@runware/ai-sdk-provider';
```

This instance will use the `RUNWARE_API_KEY` environment variable for authentication.

### Custom Provider

Create a custom provider instance with specific settings:

```typescript
import { createRunware } from '@runware/ai-sdk-provider';

const runware = createRunware({
  apiKey: 'your-api-key', // Default: process.env.RUNWARE_API_KEY
  baseURL: 'custom-base-url', // Default: https://api.runware.ai/v1
  headers: {
    // Additional headers
  }
});
```

## Image Generation

### Basic Usage

```typescript
import { runware } from '@runware/ai-sdk-provider';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: runware.image('runware:101@1'),
  prompt: 'A cat wearing an intricate robe',
  size: '1024x1024',
});

// Access the image as a Uint8Array
const imageData = image.uint8Array;
```

### Runtime Options

You can pass additional Runware-specific parameters at runtime:

```typescript
const { image } = await generateImage({
  model: runware.image('runware:101@1'),
  prompt: 'A cat wearing an intricate robe',
  size: '1024x1024',
  providerOptions: {
    runware: {
      steps: 30,
      CFGScale: 7.5,
      scheduler: 'Euler Beta',
    },
  },
});
```

### Model Configuration

Configure the model with default settings that will apply to all generations:

```typescript
const model = runware.image('runware:101@1', {
  maxImagesPerCall: 4,
  outputFormat: 'PNG',
  outputQuality: 90,
  outputType: 'URL',
  checkNSFW: true,
  steps: 30,
  scheduler: 'Euler Beta',
  CFGScale: 7.5,
});
```

### Multiple Images

Generate multiple images in a single request:

```typescript
// First configure the model with the maximum allowed images per call
const model = runware.image('runware:101@1', {
  maxImagesPerCall: 4,  // Allow up to 4 images per request
  // Other settings...
});

// Then use the model, specifying how many images you want
const { images } = await generateImage({
  model,
  prompt: 'A cat wearing an intricate robe',
  n: 4,  // Generate 4 images (must be ≤ maxImagesPerCall)
  size: '1024x1024',
});
```

## Available Settings

### Image Model Settings

| Setting | Type | Description |
|---------|------|-------------|
| `maxImagesPerCall` | number | Maximum number of images to generate per request |
| `outputFormat` | 'PNG' \| 'JPEG' | Output image format |
| `outputQuality` | number | JPEG quality (1-100) |
| `outputType` | 'URL' \| 'BASE64' \| 'BINARY' | How to return the image |
| `checkNSFW` | boolean | Whether to check for NSFW content |
| `negativePrompt` | string | Prompt for what not to include |
| `steps` | number | Number of diffusion steps |
| `scheduler` | string | Diffusion scheduler to use |
| `CFGScale` | number | Guidance scale for the model |

### Additional Parameters

The Runware API supports many more parameters than those currently integrated into this SDK. You can pass any supported parameter through the `providerOptions.runware` object:

```typescript
const { image } = await generateImage({
  model: runware.image('runware:101@1'),
  prompt: 'A cat wearing an intricate robe',
  size: '1024x1024',
  providerOptions: {
    runware: {
      // Core parameters
      steps: 30,
      CFGScale: 7.5,

      // Advanced parameters
      seedImage: 'dce488b6-7da6-4217-a16a-1816f66684ae,
      strength: 0.9,
      // Any other parameter supported by the Runware API
    },
  },
});
```

For a complete list of supported parameters and their documentation, refer to the [Runware API Documentation](https://runware.ai/docs/en/image-inference/api-reference).

## Supported Image Sizes

Runware supports image sizes from 256x256 to 2048x2048 in steps of 64. The `size` parameter should be a string in the format `"widthxheight"` (e.g., `"512x512"`, `"768x512"`, etc.).

The optimal image size depends on the specific model being used:

- Stable Diffusion 1.5-based models work best with `"512x512"`
- SDXL models are optimized for `"1024x1024"`
- Flux models support flexible aspect ratios

Some commonly used sizes:
- `"512x512"` - Standard for SD 1.5 models
- `"768x768"` - Higher quality for SD 1.5 models
- `"1024x1024"` - Standard for SDXL models
- `"512x768"` or `"768x512"` - Portrait/landscape options

For best results, consult the documentation for the specific Runware model you're using. Different models may have different optimal sizes and aspect ratio requirements.

## Model IDs

Runware supports models from three sources: built-in Runware models, Civitai models, and your own custom models. Models are identified using AIR IDs in the format: `provider:ID@version`.

### Model Explorer

Runware provides a convenient **[Model Explorer](https://my.runware.ai/models/all)** tool that allows you to browse, search, and explore all available models.

This is the best way to discover models that match your specific needs and see examples of their capabilities.

### Popular Runware Models

Runware offers a variety of high-quality models, some examples are:

**FLUX Series (Recommended)**
- `runware:100@1` - FLUX.1 S (Schnell) - Ultra-fast text-to-image generation with 4-step distillation
- `runware:101@1` - FLUX.1 D (Dev) - 12B parameter model delivering highest quality output
- `runware:102@1` - FLUX.1 D Fill - State-of-the-art inpainting and outpainting
- `runware:103@1` - FLUX.1 D Depth - Structural guidance based on depth maps
- `runware:104@1` - FLUX.1 D Canny - Structural guidance based on canny edges
- `runware:105@1` - FLUX.1 D Redux - Image variation and restyling (IP-Adapter model)

**Community Models**
- `rundiffusion:130@100` - Juggernaut Pro Flux - Flagship model for realism
- `rundiffusion:110@101` - Juggernaut Lightning Flux - 5x faster high-quality generation
- `civitai:133005@782002` - Juggernaut XL - Photorealistic SDXL model
- `civitai:4384@128713` - DreamShaper - Versatile artistic model
- `civitai:139562@798204` - RealVisXL V5.0 - Realistic image generation
- `civitai:260267@403131` - Animagine XL V3.1 - Anime-focused model
- `runware:5@1` - Stable Diffusion 3 - Enhanced image generation
- `civitai:4201@130072` - Realistic Vision V6.0 - Photorealistic images
- `civitai:9409@30163` - Anything XL V5.0 - Anime aesthetics with realism

```typescript
// Example using FLUX Schnell model
const { image } = await generateImage({
  model: runware.image('runware:100@1'),
  prompt: 'A serene mountain landscape at sunset',
  size: '1024x1024',
});
```

## Error Handling

The provider includes proper error handling with descriptive messages:

```typescript
try {
  const { image } = await generateImage({
    model: runware.image('runware:101@1'),
    prompt: 'A detailed landscape',
    size: '1024x1024',
  });
} catch (error) {
  if (error.name === 'RunwareAPIError') {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The package includes TypeScript type definitions for all APIs.

## Environment Variables

- `RUNWARE_API_KEY` - Your Runware API key (required unless passed explicitly)

## License

MIT
