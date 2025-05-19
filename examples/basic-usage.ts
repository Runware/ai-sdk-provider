import { runware } from '@runware/ai-sdk-provider';
import { experimental_generateImage as generateImage } from 'ai';
import fs from 'fs';

async function main() {
  // Basic usage with minimal parameters
  const { image } = await generateImage({
    model: runware.image('runware:101@1'),
    prompt: 'A cat wearing an intricate robe',
    size: '1024x1024',
  });

  // Save the image to disk
  const filename = `basic-image-${Date.now()}.png`;
  fs.writeFileSync(filename, image.uint8Array);
  console.log(`Basic image saved to ${filename}`);

  // Advanced usage with additional options
  const { images } = await generateImage({
    model: runware.image('civitai:54354@12343', {
      maxImagesPerCall: 4,
      outputFormat: 'PNG',
      outputQuality: 95,
      negativePrompt: 'blurry, bad quality, distorted',
      steps: 30,
      CFGScale: 7.5,
    }),
    prompt: 'A dragon soaring through a starry sky',
    n: 4,
    size: '1024x1024',
    seed: 12345,
    providerOptions: {
      runware: {
        scheduler: 'DPM++ 2M Karras',
        clipSkip: 1,
      },
    },
  });

  // Save multiple images to disk
  images.forEach((image, index) => {
    const advFilename = `advanced-image-${index}-${Date.now()}.png`;
    fs.writeFileSync(advFilename, image.uint8Array);
    console.log(`Advanced image ${index + 1} saved to ${advFilename}`);
  });
}

main().catch((error) => {
  console.error('Error:', error);
});
