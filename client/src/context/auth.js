import { useState, useEffect, useContext, createContext } from "react";
import axios from "../config/axios";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    loading: true,  // Track auth initialization status
  });

  // keep axios Authorization in sync with token
  useEffect(() => {
    console.log('🔑 Auth token changed:', auth?.token ? 'TOKEN SET' : 'TOKEN REMOVED');
    if (auth?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
      console.log('✅ Authorization header set:', `Bearer ${auth.token.substring(0, 20)}...`);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      console.log('❌ Authorization header removed');
    }
  }, [auth?.token]);

  useEffect(() => {
    console.log('🚀 Auth context initializing...');
    const data = localStorage.getItem("auth");
    if (data) {
      try {
        const parseData = JSON.parse(data);
        console.log('📦 Loading auth from localStorage:', {
          hasUser: !!parseData.user,
          hasToken: !!parseData.token,
          userName: parseData.user?.name
        });
        setAuth({
          user: parseData.user,
          token: parseData.token,
          loading: false,  // Auth loaded successfully
        });
        console.log('✅ Auth initialization complete with stored data');
      } catch (error) {
        console.error('❌ Error parsing auth data from localStorage:', error);
        localStorage.removeItem("auth");
        setAuth({
          user: null,
          token: "",
          loading: false,  // Auth initialization complete (no data)
        });
      }
    } else {
      console.log('📭 No auth data found in localStorage');
      setAuth(prev => ({
        ...prev,
        loading: false,  // Auth initialization complete (no stored data)
      }));
    }
    //eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
