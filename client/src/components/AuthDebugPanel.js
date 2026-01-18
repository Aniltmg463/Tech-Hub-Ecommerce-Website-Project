import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import axios from '../config/axios';

const AuthDebugPanel = () => {
  const [auth, setAuth] = useAuth();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { timestamp, test, result }]);
  };

  const testUserAuth = async () => {
    try {
      console.log('🧪 Testing user authentication...');
      const response = await axios.get('/api/v1/auth/user-auth');
      addTestResult('User Auth', `✅ Success: ${JSON.stringify(response.data)}`);
    } catch (error) {
      addTestResult('User Auth', `❌ Failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  const testAdminAuth = async () => {
    try {
      console.log('🧪 Testing admin authentication...');
      const response = await axios.get('/api/v1/auth/admin-auth');
      addTestResult('Admin Auth', `✅ Success: ${JSON.stringify(response.data)}`);
    } catch (error) {
      addTestResult('Admin Auth', `❌ Failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('auth');
    setAuth({ user: null, token: '', loading: false });
    addTestResult('Clear Storage', '✅ Cleared localStorage and auth state');
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h3>🔧 Auth Debug Panel</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px' }}>
        <h4>Current Auth State:</h4>
        <p><strong>Loading:</strong> {auth?.loading ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>User:</strong> {auth?.user?.name || 'Not logged in'}</p>
        <p><strong>Email:</strong> {auth?.user?.email || 'N/A'}</p>
        <p><strong>Role:</strong> {auth?.user?.role || 'N/A'}</p>
        <p><strong>Token:</strong> {auth?.token ? `${auth.token.substring(0, 20)}...` : 'No token'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testUserAuth} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Test User Auth
        </button>
        <button onClick={testAdminAuth} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Test Admin Auth
        </button>
        <button onClick={clearLocalStorage} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Clear Auth
        </button>
        <button onClick={clearTestResults} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Clear Results
        </button>
      </div>

      <div>
        <h4>Test Results:</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          {testResults.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No tests run yet...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
                <span style={{ color: '#666' }}>[{result.timestamp}]</span> 
                <strong> {result.test}:</strong> {result.result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPanel;