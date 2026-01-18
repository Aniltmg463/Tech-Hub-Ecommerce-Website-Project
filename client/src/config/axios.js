import axios from 'axios';

// Set base URL for all requests
axios.defaults.baseURL = process.env.REACT_APP_API;

// Request interceptor - logs all outgoing requests
axios.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: {
        Authorization: config.headers?.Authorization ? 'Present' : 'Missing',
        ContentType: config.headers?.['Content-Type']
      },
      hasData: !!config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles common error scenarios
axios.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('💥 API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.message || error.message,
      fullError: error.response?.data
    });

    // Handle 401 errors globally
    if (error.response?.status === 401) {
      console.warn('🚨 401 Unauthorized - Token may be expired or invalid');
      
      // Check if this is a login attempt or auth check (don't clear/redirect for these)
      const url = error.config?.url || '';
      const isAuthCheck = url.includes('/api/v1/auth/user-auth') || url.includes('/api/v1/auth/admin-auth');
      const isLoginAttempt = url.includes('/api/v1/auth/login');
      
      console.warn('🔍 Request URL:', url);
      console.warn('🔍 Is auth check:', isAuthCheck);
      console.warn('🔍 Is login attempt:', isLoginAttempt);
      
      if (!isLoginAttempt && !isAuthCheck) {
        console.warn('🧹 Clearing invalid auth data from localStorage');
        localStorage.removeItem('auth');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          console.warn('🔄 Redirecting to login page');
          window.location.href = '/login';
        }
      } else if (isAuthCheck) {
        console.warn('🔍 Auth check failed - letting route component handle this gracefully');
      }
    }

    return Promise.reject(error);
  }
);

export default axios;