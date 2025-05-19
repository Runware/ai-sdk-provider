import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRunware } from './runware-provider';
import { RunwareImageModel } from './runware-image-model';

vi.mock('./runware-image-model', () => ({
  RunwareImageModel: vi.fn(),
}));

describe('createRunware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('image', () => {
    it('should construct an image model with default configuration', () => {
      const provider = createRunware();
      const modelId = 'runware:101@1';

      const model = provider.image(modelId);

      expect(model).toBeInstanceOf(RunwareImageModel);
      expect(RunwareImageModel).toHaveBeenCalledWith(
        modelId,
        {},
        expect.objectContaining({
          provider: 'runware.image',
          baseURL: 'https://api.runware.ai/v1',
        })
      );
    });

    it('should construct an image model with custom settings', () => {
      const provider = createRunware();
      const modelId = 'runware:101@1';
      const settings = { maxImagesPerCall: 3 };

      const model = provider.image(modelId, settings);

      expect(model).toBeInstanceOf(RunwareImageModel);
      expect(RunwareImageModel).toHaveBeenCalledWith(
        modelId,
        settings,
        expect.objectContaining({
          provider: 'runware.image',
          baseURL: 'https://api.runware.ai/v1',
        })
      );
    });
  });
});
