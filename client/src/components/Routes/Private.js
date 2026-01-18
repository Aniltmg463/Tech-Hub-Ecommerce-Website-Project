import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet } from "react-router-dom";
import axios from "../../config/axios";
import { Spinner } from "../Spinner";

export default function PrivateRoute() {
  const [ok, setOK] = useState(false);
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
      try {
        const apiUrl = '/api/v1/auth/user-auth';
        console.log('🔐 User auth check starting...');
        console.log('🔗 API URL:', apiUrl);
        console.log('🎫 Has token:', !!auth?.token);
        console.log('👤 Current user:', auth?.user?.name);
        
        const res = await axios.get(apiUrl);
        console.log('✅ User auth response:', res.data);
        
        if (res.data.ok) {
          console.log('🎉 User authentication successful');
          setOK(true);
        } else {
          console.log('❌ User authentication failed');
          setOK(false);
        }
      } catch (error) {
        console.error('💥 User auth check failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
          headers: error.config?.headers
        });
        setOK(false);
      }
    };
    
    // Wait for auth context to finish loading before making decisions
    if (auth?.loading) {
      console.log('⏳ PrivateRoute: Auth context still loading, waiting...');
      return;
    }
    
    if (auth?.token) {
      console.log('🔑 PrivateRoute: Token found, checking user authentication...');
      authCheck();
    } else {
      console.log('🚫 PrivateRoute: No token found after auth loading completed');
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
  
  return ok ? <Outlet /> : <Spinner path="login" />;
}

// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/auth";
// import { Outlet } from "react-router-dom";
// import axios from "axios";

// export default function PrivateRoute() {
//   const [ok, setOK] = useState(false);
//   const [auth] = useAuth(); // No need to destructure setAuth if not used

//   useEffect(() => {
//     // ✅ Fixed extra parenthesis
//     const authCheck = async () => {
//       try {
//         const res = await axios.get("/api/v1/auth/user-auth", {
//           headers: {
//             Authorization: auth?.token, // ✅ Proper authorization header
//           },
//         });

//         setOK(res.data.ok);
//       } catch (error) {
//         console.error("Auth check failed:", error);
//         setOK(false);
//       }
//     };

//     if (auth?.token) authCheck();
//   }, [auth?.token]); // ✅ Dependency array

//   return ok ? <Outlet /> : <div>Loading...</div>; // ✅ Use a proper spinner component
// }
