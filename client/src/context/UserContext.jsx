import API from "api/axios.config";
import WithAxios from "helpers/WithAxios";
import { createContext, useContext, useEffect, useState } from "react";
import authService from "services/auth.service";
import { signOut, getCurrentUser } from "services/cognito.service";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [authData, setAuthData] = useState({
    token: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getCurrentUser().then((user) => {
        setUserData(user);
      });
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (localStorage.getItem("token") && localStorage.getItem("token") !== "undefined") {
      setIsLoggedIn(true);
      setAuthData({
        token: localStorage.getItem("token"),
      });
    }
  }, []);

  const updateUserData = async ({ fullname, email, username, address, city, state, country }) => {
    const res = await API.put(`/users/${userData.user_id}`, {
      fullname,
      email,
      username,
      address,
      city,
      state,
      country,
    });
    setUserData(res.data);
  };

  const setUserInfo = (data) => {
    const { user, token } = data;
    setIsLoggedIn(true);
    setUserData(user);
    setAuthData({
      token,
    });
    // localStorage.setItem("token", JSON.stringify(token));
  };

  const logout = () => {
    setUserData(null);
    setAuthData(null);
    setIsLoggedIn(false);
    authService.logout();
    signOut();
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        setUserState: (data) => setUserInfo(data),
        logout,
        isLoggedIn,
        setIsLoggedIn,
        authData,
        setAuthData,
        updateUserData,
      }}
    >
      <WithAxios>{children}</WithAxios>
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export { UserProvider, useUser };
