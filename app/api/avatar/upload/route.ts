import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          tokenPayload: JSON.stringify({
            timestamp: Date.now(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob);

        if (tokenPayload) {
          const { timestamp } = JSON.parse(tokenPayload);
          console.log('Upload started at:', new Date(timestamp).toISOString());
        } else {
          console.error('Token payload is undefined or null');
        }

        // Perform any post-upload actions here
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}