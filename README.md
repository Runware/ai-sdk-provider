# Runware Provider for Vercel AI SDK

A community provider for the [Vercel AI SDK](https://sdk.vercel.ai/docs) that integrates with [Runware's](https://runware.ai/) ultra-fast image generation API.

## Why Choose Runware?

Runware stands out in the AI image generation space with several key advantages:

- ⚡ **World's Fastest Performance**: Our Sonic Inference Engine with custom-optimized hardware delivers unmatched speed.
- 💰 **Cost-Effective Pricing**: Generate images at up to 5x lower cost than competitors.
- 🔧 **Developer-First API**: Clean, flexible APIs with comprehensive documentation, transparent pricing, and enterprise-grade reliability.
- 🧩 **API Flexibility**: From generating up to 20 images simultaneously without speed penalties to supporting any dimensions from 256×256 to 2048×2048 in 64-pixel increments, our API removes the limitations other providers impose.
- 🎨 **Complete Creative Toolkit**: Beyond basic text-to-image, we support image transformation, inpainting, outpainting, style transfer, and advanced AI techniques.

This provider brings all of Runware's capabilities to the familiar Vercel AI SDK interface, so you can focus on building great experiences instead of managing API complexities.

## Installation

Getting started requires just two packages and an API key:

```bash
npm install @runware/ai-sdk-provider ai@^4.3.16
```

You'll need a Runware API key to authenticate your requests. [Sign up at Runware](https://runware.ai/) to get your key, new accounts include free credits to get you started.

## Quick Start

Set up your API key as an environment variable, this keeps your credentials secure and makes deployment easier:

```bash
export RUNWARE_API_KEY="your-api-key-here"
```

Now you can generate your first image with just a few lines of code:

```typescript
import { runware } from '@runware/ai-sdk-provider';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: runware.image('runware:101@1'), // FLUX.1 Dev - high quality model
  prompt: 'A serene mountain landscape at sunset with reflecting lake',
  size: '1024x1024',
});

// The image is ready to use
console.log('Generated image URL:', image.url);
```

That's it! Your first AI-generated image is ready. The provider handles all the API communication, authentication, and response formatting automatically.

For advanced configuration options like setting the API key in code or custom connection settings, see [Custom Provider Configuration](#custom-provider-configuration) below.

## Understanding Runware's Features

Before diving into examples, it's helpful to understand what makes Runware powerful. The platform supports a comprehensive range of image generation and manipulation techniques:

**Core Generation Types:**
- **Text-to-Image** - Create images from descriptive prompts.
- **Image-to-Image** - Transform existing images while preserving structure or style.
- **Inpainting** - Intelligently fill or replace specific areas of an image.
- **Outpainting** - Extend images beyond their original boundaries.

**Advanced AI Techniques:**
- **ControlNet** - Guide generation with edge maps, poses, depth maps, or other structural inputs.
- **LoRA (Low-Rank Adaptation)** - Apply specific artistic styles or character consistency.
- **Identity Preservation** - Maintain consistent faces and characters using PuLID, ACE++, PhotoMaker, and similar techniques.
- **Custom Embeddings** - Use trained concepts for brand consistency or character persistence.
- **Refiners** - Apply secondary models for enhanced detail and quality.

**Flexible Output Options:**
- **Multiple Formats** - PNG, WEBP, JPEG with quality control.
- **Batch Generation** - Create up to 20 variations in a single request without speed penalties.
- **Custom Dimensions** - Any size from 256×256 to 2048×2048 in 64-pixel increments.
- **Various Delivery Methods** - URLs, Base64, or binary data.

## Key Concepts

### Model IDs and the AIR System

Runware uses the **AIR ID** system to identify models across different sources. This standardized format looks like `provider:ID@version` and gives you access to thousands of models:

- `runware:100@1` - FLUX.1 Schnell (ultra-fast 4-step generation).
- `runware:101@1` - FLUX.1 Dev (high-quality model).
- `civitai:133005@782002` - Community models from Civitai.
- `custom:your-model@1` - Your own fine-tuned models.

The beauty of this system is that you can easily switch between models to find the perfect balance of speed, quality, and style for your use case. Each model has different strengths, some excel at photorealism, others at artistic styles, and some prioritize speed over detail.

Discover the full catalog using our [Model Explorer](https://my.runware.ai/models/all).

### Provider Options: Accessing Full API Power

While the Vercel AI SDK provides a clean, standardized interface, Runware's API offers dozens of advanced parameters for fine-tuning generation. Access these through the `providerOptions.runware` object:

```typescript
const { image } = await generateImage({
  model: runware.image('runware:101@1'),
  prompt: 'A cyberpunk cityscape with neon lights',
  size: '1024x1024',
  providerOptions: {
    runware: {
      steps: 30,               // More steps = higher quality, slower generation
      CFGScale: 7.5,           // How closely to follow the prompt
      scheduler: 'Euler Beta', // Sampling algorithm
      seed: 42,                // For reproducible results
    },
  },
});
```

This approach gives you the best of both worlds: the simplicity of the Vercel AI SDK with access to Runware's full feature set. For a complete list of available parameters, see our [API reference](https://runware.ai/docs/en/image-inference/api-reference).

### Flexible Image Dimensions

One of Runware's standout features is dimensional flexibility. While many providers restrict you to a handful of preset sizes, Runware supports any width and height from 256 to 2048 pixels in 64-pixel increments. This means you can generate:

- Square images: `512x512`, `768x768`, `1024x1024`
- Portraits: `512x768`, `768x1024`, `1024x1536`
- Landscapes: `768x512`, `1024x768`, `1536x1024`
- Custom ratios: `640x384`, `896x640`, `1152x832`

Different models have optimal sizes (FLUX models work best at 1024×1024, while SD 1.5 models prefer 512×512), but the choice is yours. This flexibility is particularly valuable for applications that need specific aspect ratios or when generating content for different platforms.

## Common Examples

### Customized High-Quality Generation

Most real-world applications need more control than basic text-to-image. Here's how to customize generation parameters for professional results:

```typescript
const { image } = await generateImage({
  model: runware.image('runware:101@1'),
  prompt: 'A majestic dragon perched on ancient castle ruins, golden hour lighting, cinematic composition',
  size: '1024x1024',
  providerOptions: {
    runware: {
      steps: 25,                    // Balanced quality/speed
      CFGScale: 8,                  // Strong prompt adherence
      scheduler: 'DPM++ 2M',        // High-quality scheduler
      seed: 12345,                  // Reproducible results
    },
  },
});
```
Experiment with these values to find what works best for your specific use case.

### Image-to-Image Transformation

Transform existing images while preserving their basic structure. This is perfect for style transfer, enhancement, or creative variations:

```typescript
const { image } = await generateImage({
  model: runware.image('runware:97@2'),      // HiDream Dev
  prompt: 'vibrant cyberpunk scene with neon lights and futuristic elements',
  size: '1024x1024',
  providerOptions: {
    runware: {
      seedImage: 'image-uuid',               // Accepts UUID, URL, or Base64
      strength: 0.7,                         // 0.1 = subtle changes, 1.0 = complete transformation
      steps: 20,
    },
  },
});
```

The `strength` parameter is crucial here. Lower values preserve more of the original image structure, while higher values allow more dramatic transformations. Start with 0.6 to 0.8 for most use cases.

### Generating Multiple Variations

Create several variations of the same concept in a single request. This is ideal for giving users choices or A/B testing different approaches. Runware excels here, supporting up to 20 images in one request without any speed penalties:

```typescript
// First, configure the model to allow multiple images
// Note: This model configuration pattern is specific to the Vercel AI SDK
const model = runware.image('runware:100@1', {  // Using Schnell for speed
  maxImagesPerCall: 4,
  outputFormat: 'WEBP',
});

const { images } = await generateImage({
  model,
  prompt: 'A friendly AI assistant robot in a modern office setting',
  n: 4,                    // Generate 4 variations
  size: '1024x1024',
  providerOptions: {
    runware: {
      steps: 4,              // Schnell model works well with fewer steps
    },
  },
});

// Each image is slightly different due to random sampling
images.forEach((img, index) => {
  console.log(`Variation ${index + 1}:`, img.url);
});
```

While this example shows 4 images, you can generate up to 20 in a single request.

### Advanced: Inpainting for Precise Editing

Inpainting lets you selectively replace parts of an image while keeping the rest intact. It's like intelligent Photoshop healing, but guided by AI:

```typescript
const { image } = await generateImage({
  model: runware.image('runware:102@1'), // FLUX.1 Fill specialized for inpainting
  prompt: 'A beautiful zen garden with cherry blossoms and stone lanterns',
  size: '1024x1024',
  providerOptions: {
    runware: {
      seedImage: 'base-image-uuid',    // Your source image
      maskImage: 'mask-image-uuid',    // Black/white mask (white areas get regenerated)
      steps: 25,
    },
  },
});
```

Create masks using any image editor. White pixels indicate areas to regenerate, black pixels are preserved. This technique is powerful for removing objects, changing backgrounds, or adding elements.

## Configuration Options

### Default Provider Setup

The simplest approach uses environment variables for configuration. This works great for most applications:

```typescript
import { runware } from '@runware/ai-sdk-provider';
// Automatically uses RUNWARE_API_KEY from environment
```

This default provider handles authentication automatically and uses Runware's standard API endpoint.

### Custom Provider Configuration

For more complex applications, you might need custom configuration. The provider supports additional options for flexibility, such as API proxying or custom authentication:

```typescript
import { createRunware } from '@runware/ai-sdk-provider';

const runware = createRunware({
 apiKey: 'your-specific-api-key',     // Override environment variable
 baseURL: 'https://your-proxy.com/v1', // For API proxying or custom routing
 headers: {
   'X-Custom-Header': 'value',        // Additional headers for proxying or auth
 }
});
```

### Model-Level Configuration

The Vercel AI SDK allows you to configure models with default parameters, which is different from Runware's native SDKs but provides a convenient way to avoid repeating common settings. These defaults apply to every generation with that model instance:

```typescript
const highQualityModel = runware.image('runware:101@1', {
  outputFormat: 'PNG',       // Always use PNG for this model
  outputQuality: 95,         // High quality
  checkNSFW: true,           // Enable content filtering
  steps: 30,                 // Default to high quality
  scheduler: 'DPM++ 2M',     // Preferred scheduler
});

// Now every generation with this model uses these defaults
const { image } = await generateImage({
  model: highQualityModel,
  prompt: 'A stunning landscape',
  size: '1024x1024',
  // No need to repeat the configuration
});
```

Note that this model configuration approach is specific to the Vercel AI SDK integration.

## Error Handling

Robust error handling is essential for production applications. The provider includes descriptive error messages to help you debug issues quickly:

```typescript
try {
  const { image } = await generateImage({
    model: runware.image('runware:101@1'),
    prompt: 'A detailed architectural rendering',
    size: '1024x1024',
  });

  // Success - use the image
  console.log('Generated successfully:', image.url);

} catch (error) {
  if (error.name === 'RunwareAPIError') {
    // API-specific errors (invalid parameters, etc.)
    console.error('Runware API Error:', error.message);
    console.error('Status Code:', error.status);
  } else {
    // Network errors, timeout, etc.
    console.error('Request failed:', error.message);
  }
}
```

Common error scenarios include insufficient credits, invalid model IDs, unsupported parameter combinations, or network connectivity issues. The provider surfaces these clearly so your application can respond appropriately.

## Next Steps

Now that you understand the basics, explore Runware's full capabilities:

- **[API Documentation](https://runware.ai/docs/en/image-inference/api-reference)**: Complete reference for all parameters, advanced features, and techniques.
- **[Model Explorer](https://my.runware.ai/models/all)**: Browse thousands of models and find the perfect one for your use case.
- **[API Playground](https://my.runware.ai/playground)**: Interactive UI to experiment with all API parameters and see results in real-time.
- **[Technical Blog](https://runware.ai/blog)**: In-depth articles on workflows, new features, and more.

For applications requiring more advanced features like WebSocket connections, consider using our native [Python SDK](https://runware.ai/docs/en/libraries/python) or [JavaScript SDK](https://runware.ai/docs/en/libraries/javascript). These offer a few additional capabilities beyond what's available through the Vercel AI SDK integration.

The provider gives you access to everything Runware offers. As your application grows, these features provide the flexibility to create truly unique experiences.

## Environment Variables

- `RUNWARE_API_KEY` - Your Runware API key (required unless passed explicitly to `createRunware`).

## TypeScript Support

Full TypeScript definitions are included for all APIs, model configurations, and response types. Your IDE will provide autocomplete and type checking for the entire Runware feature set.

## License

[MIT](LICENSE)
