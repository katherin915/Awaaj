import React, { useState } from 'react';
import API_BASE from '../utils/api';

function DebugProfile() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      setResult('No token found in localStorage!');
      setLoading(false);
      return;
    }

    setResult(`Token found: ${token.substring(0, 20)}...\n\nCalling API...`);

    try {
      const response = await fetch(`${API_BASE}/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setResult(prev => prev + `\n\nStatus: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        setResult(prev => prev + `\n\nSuccess! Profile data:\n${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        setResult(prev => prev + `\n\nError Response:\n${errorText}`);
      }
    } catch (error) {
      setResult(prev => prev + `\n\nNetwork Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setResult(`Token: ${token ? token.substring(0, 50) + '...' : 'Not found'}\n\nUser: ${user || 'Not found'}`);
  };

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Profile Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={checkToken}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Check localStorage
        </button>
        
        <button 
          onClick={testAPI}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#ccc' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {loading ? 'Testing...' : 'Test Profile API'}
        </button>
      </div>

      {result && (
        <pre style={{ 
          background: '#1e293b', 
          color: '#fff', 
          padding: '20px', 
          borderRadius: '8px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}

export default DebugProfile;
