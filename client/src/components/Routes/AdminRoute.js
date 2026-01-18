import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet } from "react-router-dom";
import axios from "../../config/axios";
import { Spinner } from "../Spinner";

export default function AdminRoute() {
  const [ok, setOK] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
      try {
        setIsChecking(true);
        const apiUrl = '/api/v1/auth/admin-auth';
        console.log('🛡️ Admin auth check starting...');
        console.log('🔗 API URL:', apiUrl);
        console.log('🔗 Full URL will be:', axios.defaults.baseURL + apiUrl);
        console.log('🎫 Has token:', !!auth?.token);
        console.log('🎫 Token in axios defaults:', axios.defaults.headers.common["Authorization"]);
        console.log('👤 Current user:', auth?.user?.name, '| Role:', auth?.user?.role);
        
        // Ensure token is set in axios headers before making request
        if (auth?.token && !axios.defaults.headers.common["Authorization"]) {
          console.log('⚠️ Token exists but not in axios headers, setting it now...');
          axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
        }
        
        const res = await axios.get(apiUrl);
        console.log('✅ Admin auth response:', res.data);
        
        if (res.data.ok) {
          console.log('🎉 Admin authentication successful');
          setOK(true);
        } else {
          console.log('❌ Admin authentication failed - not authorized');
          setOK(false);
        }
      } catch (error) {
        console.error('💥 Admin auth check failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
          headers: error.config?.headers
        });
        setOK(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Wait for auth context to finish loading before making decisions
    if (auth?.loading) {
      console.log('⏳ AdminRoute: Auth context still loading, waiting...');
      return;
    }
    
    console.log('🔍 AdminRoute: Auth state check:', {
      hasToken: !!auth?.token,
      tokenLength: auth?.token?.length,
      hasUser: !!auth?.user,
      userName: auth?.user?.name,
      loading: auth?.loading
    });
    
    if (auth?.token) {
      console.log('🔑 AdminRoute: Token found, checking admin authentication...');
      console.log('🎫 Token preview:', auth.token.substring(0, 30) + '...');
      authCheck();
    } else {
      console.log('🚫 AdminRoute: No token found after auth loading completed');
      setOK(false);
    }
  }, [auth?.token, auth?.loading]);
  // Show loading while auth context is initializing
  if (auth?.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Initializing authentication...</p>
        </div>
      </div>
    );
  }
  
  // Show loading while checking admin authentication
  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // Only show redirect spinner if auth is loaded, not checking, and explicitly not authorized
  return ok ? <Outlet /> : <Spinner path="login" />;
}
