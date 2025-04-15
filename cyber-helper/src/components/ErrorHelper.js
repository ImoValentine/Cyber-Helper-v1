import React, { useState } from 'react';

const ErrorHelper = () => {
    const [errorCode, setErrorCode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError('');

        try {
            const response = await fetch('https://m5o2s9vf20.execute-api.eu-north-1.amazonaws.com/prod', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ errorCode }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError('Failed to fetch response from server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Cyber Helper</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="errorCode" className="form-label">Enter Error Code:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="errorCode"
                        value={errorCode}
                        onChange={(e) => setErrorCode(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Submit'}
                </button>
            </form>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {result && (
                <div className="mt-4">
                    <h4>AI Responses</h4>
                    {Object.entries(result.aiResponses).map(([ai, response]) => (
                        <div key={ai} className="mb-3">
                            <strong>{ai}</strong>
                            <p>{response}</p>
                        </div>
                    ))}
                    <h5>Resolution Summary:</h5>
                    <p>{result.resolutionSummary}</p>
                </div>
            )}
        </div>
    );
};

export default ErrorHelper;
