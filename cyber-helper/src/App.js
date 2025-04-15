import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import { Collapse, Button } from 'react-bootstrap';
import resolveErrorCode from './resolveError';
import './App.css';
import logo from './Assets/logo.png'; // Added import for logo in src/Assets/

function App() {
  const [errorCode, setErrorCode] = useState('');
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const [disagreementsOpen, setDisagreementsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const errorCodes = [
    'ERR_CONNECTION_TIMED_OUT',
    'Windows security log event: Windows 4704',
    '404 Not Found',
    '500 Internal Server Error',
    'ERR_SSL_PROTOCOL_ERROR',
    'DNS_PROBE_FINISHED_NXDOMAIN',
  ];

  const normalizeStep = (step) => {
    return step
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
  };

  const extractKeyConcepts = (step) => {
    const normalized = normalizeStep(step);
    const commonWords = [
      'the', 'a', 'an', 'in', 'to', 'for', 'if', 'is', 'and', 'or', 'with', 'by', 'on', 'of',
      'such', 'as', 'that', 'can', 'be', 'it', 'this', 'your', 'you', 'are', 'was', 'were',
      'specific', 'details', 'for', 'additional', 'information'
    ];
    const words = normalized.split(' ')
        .filter(word => !commonWords.includes(word) && word.length > 2)
        .slice(0, 4);
    return words.join(' ');
  };

  const areStepsSimilar = (step1, step2) => {
    const concepts1 = extractKeyConcepts(step1);
    const concepts2 = extractKeyConcepts(step2);
    const normalized1 = normalizeStep(step1);
    const normalized2 = normalizeStep(step2);

    const words1 = new Set(concepts1.split(' '));
    const words2 = new Set(concepts2.split(' '));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const overlap = intersection.size / Math.min(words1.size, words2.size);

    if (overlap >= 0.5) return true;
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  };

  const generateConsensusSummary = (aiResponses) => {
    const stepsByAI = Object.entries(aiResponses).map(([ai, response]) => {
      const lines = response.split('\n');
      const stepsStart = lines.findIndex(line => line.trim().startsWith('To resolve') || line.trim().startsWith('*') || line.trim().startsWith('1.'));
      const steps = lines.slice(stepsStart).filter(line => line.trim().startsWith('*') || line.trim().startsWith('1.'));
      return { ai, steps: steps.map(step => step.trim().replace(/^[0-9*.]\s*/, '')) };
    });

    const allSteps = stepsByAI.flatMap(entry => entry.steps);
    const stepGroups = [];
    const usedSteps = new Set();

    allSteps.forEach((step, index) => {
      if (usedSteps.has(index)) return;
      const group = { step, count: 1, indices: [index], ais: [stepsByAI.find(entry => entry.steps.includes(step)).ai] };
      for (let j = index + 1; j < allSteps.length; j++) {
        if (usedSteps.has(j)) continue;
        if (areStepsSimilar(step, allSteps[j])) {
          group.count++;
          group.indices.push(j);
          group.ais.push(stepsByAI.find(entry => entry.steps.includes(allSteps[j])).ai);
        }
      }
      group.indices.forEach(i => usedSteps.add(i));
      stepGroups.push(group);
    });

    const commonSteps = stepGroups
        .filter(group => group.count >= 2)
        .map(group => ({ step: group.step, ais: group.ais }));

    const uniqueSteps = stepGroups
        .filter(group => group.count === 1)
        .map(group => ({ step: group.step, ai: group.ais[0] }));

    const huggingFaceLines = aiResponses.HuggingFace.split('\n');
    const explanationStart = huggingFaceLines.findIndex(line => line.trim() && !line.includes('Give a short explanation'));
    const explanation = huggingFaceLines[explanationStart] || 'No explanation available.';

    let summary = `${explanation}\n\nTo resolve this issue, the AIs agree on the following steps:\n`;
    if (commonSteps.length > 0) {
      summary += commonSteps.map((group, index) => `${index + 1}. ${group.step} (suggested by ${group.ais.join(', ')})`).join('\n');
    } else {
      summary += 'The AIs did not agree on specific steps.';
    }

    if (uniqueSteps.length > 0) {
      summary += '\n\nNotable disagreements (steps suggested by only one AI):\n';
      uniqueSteps.forEach((group, index) => {
        summary += `${index + 1}. ${group.step} (suggested by ${group.ai})\n`;
      });
    } else {
      summary += '\n\nThere were no notable disagreements among the AIs.';
    }

    return summary;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponses(null);
    setErrorMsg('');

    try {
      console.log('Submitting error code:', errorCode);
      const data = await resolveErrorCode(errorCode);
      console.log('Resolved Data:', data);

      if (data.aiResponses && Object.keys(data.aiResponses).length > 0) {
        data.resolutionSummary = generateConsensusSummary(data.aiResponses);
        setSearchHistory(prev => {
          const newHistory = [errorCode, ...prev.filter(item => item !== errorCode)];
          return newHistory.slice(0, 5);
        });
        const initialOpenSections = {};
        Object.keys(data.aiResponses).forEach(ai => {
          initialOpenSections[ai] = true;
        });
        setOpenSections(initialOpenSections);
      }

      setResponses(data);

      if (Object.keys(data.aiResponses).length === 0 && data.resolutionSummary.includes('Error resolving code')) {
        setErrorMsg(data.resolutionSummary);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      setErrorMsg('An unexpected error occurred: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (code) => {
    setErrorCode(code);
    handleSubmit({ preventDefault: () => {} });
  };

  const toggleSection = (ai) => {
    setOpenSections(prev => ({
      ...prev,
      [ai]: !prev[ai],
    }));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
      <div className={`container mt-5 ${darkMode ? 'dark-mode' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <img
                src={logo}
                alt="Cyber Helper Logo"
                style={{ width: '40px', height: '40px', marginRight: '10px' }}
            />
            <h2>Cyber Helper</h2>
          </div>
          <Button variant={darkMode ? 'light' : 'dark'} onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="errorCode" className="form-label">Enter Error Code</label>
            <Typeahead
                id="errorCode"
                onChange={(selected) => {
                  setErrorCode(selected[0] || '');
                }}
                onInputChange={(text) => setErrorCode(text)}
                options={errorCodes}
                placeholder="Enter an error code..."
                selected={errorCode ? [errorCode] : []}
                inputProps={{ required: true }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing...
                </>
            ) : (
                'Analyze'
            )}
          </button>
        </form>

        {searchHistory.length > 0 && (
            <div className="mt-3">
              <h5>Recent Searches:</h5>
              <ul className="list-group">
                {searchHistory.map((code, index) => (
                    <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleHistoryClick(code)}
                    >
                      {code}
                    </li>
                ))}
              </ul>
            </div>
        )}

        {errorMsg && <div className="alert alert-danger mt-4">{errorMsg}</div>}

        {responses && (
            <div className="mt-5">
              <h4>AI Responses:</h4>
              {Object.entries(responses.aiResponses).length > 0 ? (
                  Object.entries(responses.aiResponses).map(([ai, response]) => (
                      <div key={ai} className="mb-3">
                        <h5
                            onClick={() => toggleSection(ai)}
                            style={{ cursor: 'pointer' }}
                            aria-controls={`${ai}-response`}
                            aria-expanded={openSections[ai] || false}
                        >
                          {ai} {openSections[ai] ? '▼' : '▶'}
                        </h5>
                        <Collapse in={openSections[ai] || false}>
                          <div id={`${ai}-response`}>
                    <pre
                        className="bg-light p-3 rounded"
                        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                    >
                      {response.split('\n').map((line, index) => (
                          <p key={index} className="mb-1">{line}</p>
                      ))}
                    </pre>
                          </div>
                        </Collapse>
                      </div>
                  ))
              ) : (
                  <p className="text-muted">No AI responses available.</p>
              )}

              <h4 className="mt-4">Resolution Summary:</h4>
              {responses.resolutionSummary && (
                  <>
              <pre
                  className="bg-success text-white p-3 rounded"
                  style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
              >
                {responses.resolutionSummary.split('\nNotable disagreements')[0].split('\n').map((line, index) => (
                    <p key={index} className="mb-1">{line}</p>
                ))}
              </pre>
                    {responses.resolutionSummary.includes('Notable disagreements') && (
                        <>
                          <button
                              onClick={() => setDisagreementsOpen(!disagreementsOpen)}
                              className="btn btn-link mt-2"
                              aria-expanded={disagreementsOpen}
                          >
                            {disagreementsOpen ? 'Hide Notable Disagreements ▼' : 'Show Notable Disagreements ▶'}
                          </button>
                          <Collapse in={disagreementsOpen}>
                            <div>
                      <pre
                          className="bg-warning text-dark p-3 rounded mt-2"
                          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                      >
                        {responses.resolutionSummary.split('\nNotable disagreements')[1].split('\n').map((line, index) => (
                            <p key={index} className="mb-1">{line}</p>
                        ))}
                      </pre>
                            </div>
                          </Collapse>
                        </>
                    )}
                  </>
              )}
            </div>
        )}
      </div>
  );
}

export default App;
