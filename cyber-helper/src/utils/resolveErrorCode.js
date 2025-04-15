const API_URL = 'https://72a5vfmshf.execute-api.us-east-1.amazonaws.com/stage1/resolve';

export default async function resolveErrorCode(errorCode) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ errorCode }),
        });

        if (!response.ok) throw new Error('Failed to resolve error');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { result: 'Error resolving code' };
    }
}
