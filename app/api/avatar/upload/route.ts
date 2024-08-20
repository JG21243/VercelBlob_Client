import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // This function is called before generating the token
        // You can use this to validate the user's session, check permissions, etc.
        
        // For example, you might check if the user is authenticated:
        // const session = await getSession(request);
        // if (!session) throw new Error('Unauthorized');

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          tokenPayload: JSON.stringify({
            // You can include any data here that you want to receive in onUploadCompleted
            // userId: session.user.id,
            timestamp: Date.now(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This function is called after the upload is completed
        console.log('Upload completed:', blob);
        
        // Parse the token payload
        const { timestamp } = JSON.parse(tokenPayload);
        console.log('Upload started at:', new Date(timestamp).toISOString());

        // Here you can perform any post-upload actions
        // For example, you might want to save the blob URL to your database
        // await db.update({ avatar: blob.url, userId: session.user.id });

        // Note: This function will not work on localhost
        // Use ngrok or a similar tool to test the full upload flow locally
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