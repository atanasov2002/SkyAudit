// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import {
//   login as apiLogin,
//   logout as apiLogout,
//   refresh as apiRefresh,
// } from "@/lib/authApi";
// import client from "@/lib/api";

// type User = { id: string; email: string; fullName?: string } | null;

// interface AuthContextType {
//   user: User;
//   signin: (email: string, password: string) => Promise<void>;
//   signout: () => Promise<void>;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User>(null);
//   const [loading, setLoading] = useState(true);

//   // try to refresh on load
//   useEffect(() => {
//     (async () => {
//       try {
//         // call refresh to set new access cookie if refresh valid
//         await apiRefresh();
//         // optional: call /auth/me to fetch user
//         // const { data } = await client.get('/auth/me'); setUser(data.user);
//       } catch (err) {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const signin = async (email: string, password: string) => {
//     const res = await apiLogin({ email, password });
//     setUser(res.data.user);
//   };

//   const signout = async () => {
//     await apiLogout();
//     setUser(null);
//   };

//   // Axios interceptor: if 401, try a single refresh then retry
//   useEffect(() => {
//     const interceptor = client.interceptors.response.use(
//       (r) => r,
//       async (error) => {
//         const originalRequest = error.config;
//         if (error.response?.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true;
//           try {
//             await apiRefresh();
//             return client(originalRequest); // retry
//           } catch (e) {
//             setUser(null);
//             return Promise.reject(e);
//           }
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       client.interceptors.response.eject(interceptor);
//     };
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, signin, signout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };
