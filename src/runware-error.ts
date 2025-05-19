import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const runwareErrorSchema = z.object({
  error: z.record(z.any()).optional(),
});

export const runwareFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: runwareErrorSchema,
  errorToMessage: (error) => {
    if (error.error) {
      return `Runware API error: ${JSON.stringify(error.error)}`;
    }
    return 'Unknown Runware API error';
  },
});
