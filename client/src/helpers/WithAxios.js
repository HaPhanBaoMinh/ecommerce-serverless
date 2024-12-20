import { useMemo } from "react";
import API from "api/axios.config";
import { useUser } from "context/UserContext";
import history from "helpers/history";
import { refreshToken } from "services/cognito.service";

const WithAxios = ({ children }) => {
  const { setIsLoggedIn, setUserData, setAuthData, isLoggedIn } = useUser();

  useMemo(() => {
    if (isLoggedIn) {
      API.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          // if (error?.response?.status === 403) {
          //   return new Promise((resolve, reject) => {
          //     setIsLoggedIn(false);
          //     setAuthData(null);
          //     setUserData(null);
          //     localStorage.removeItem("token");
          //     reject(error);
          //   });
          // }

          if (error?.response?.status === 401 && !originalRequest._retry) {
            try {
              originalRequest._retry = true;
              const res = await refreshToken();
              localStorage.setItem("token", res.idToken.jwtToken);
              return API(originalRequest);
            } catch (error) {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
              setAuthData(null);
              setUserData(null);
              history.push("/login");
            }
          }
          return Promise.reject(error);
        }
      );
    }
  }, [isLoggedIn, setAuthData, setIsLoggedIn, setUserData]);

  return children;
};

export default WithAxios;
