const API_URL = process.env.REACT_APP_API_URL || 'https://v7rxxi579a.execute-api.eu-north-1.amazonaws.com/dev/helper/helper';

export default async function resolveErrorCode(errorCode) {
    try {
        console.log('Fetching from API:', API_URL);
        console.log('Payload:', { errorCode });

        if (!errorCode || typeof errorCode !== 'string') {
            throw new Error('Invalid error code: Must be a non-empty string');
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ errorCode }),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Failed to resolve error. Status: ${response.status} - ${errText || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Raw API Response:', JSON.stringify(data, null, 2));

        if (data.body) {
            const parsedBody = JSON.parse(data.body);
            console.log('Parsed Response (Proxy):', parsedBody);
            return parsedBody;
        } else if (data.aiResponses && data.resolutionSummary) {
            console.log('Direct Response:', data);
            return data;
        } else {
            throw new Error('Unexpected response structure: ' + JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error resolving error code:', error);
        return {
            aiResponses: {},
            resolutionSummary: 'Error resolving code: ' + error.message
        };
    }
}
