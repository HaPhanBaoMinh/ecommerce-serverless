import { Button } from "@windmill/react-ui";
import AccountForm from "components/AccountForm";
import { useUser } from "context/UserContext";
import Layout from "layout/Layout";
import { useState } from "react";
import { Edit2 } from "react-feather";
import toast from "react-hot-toast";
import PulseLoader from "react-spinners/PulseLoader";
import { forgotPassword, signOut } from "services/cognito.service";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const { userData, logout } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const resetPassword = () => {
    forgotPassword(userData.email).then((data) => {
      setIsSending(false);
      toast.success("Email has been sent successfully.");
      logout();
      navigate("/reset-password");
    }).catch((error) => {
      console.log(error);
      toast.error("Error sending email");
      setIsSending(false);
    });
  };

  return (
    <Layout title="Profile" loading={userData === null}>
      {showSettings ? (
        <AccountForm userData={userData} setShowSettings={setShowSettings} />
      ) : (
        <div className="grid place-items-center pt-4 mt-10">
          <div className="w-full md:w-3/4 lg:w-1/2 shadow-md overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your personal information</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userData?.username}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userData?.email}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Password</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Button disabled={isSending} onClick={resetPassword}>
                      {isSending ? (
                        <PulseLoader color={"#0a138b"} size={10} />
                      ) : (
                        "Reset password by email"
                      )}
                    </Button>
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5">
                  <Button iconRight={Edit2} onClick={(e) => setShowSettings(!showSettings)}>
                    {" "}
                    Edit
                  </Button>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Account;
