import { Button, HelperText, Input, Label } from "@windmill/react-ui";
import Layout from "layout/Layout";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { confirmPassword } from "services/cognito.service";

const ResetPassword = () => {
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const password = useRef({});
  password.current = watch("password", "");

  const handlePasswordReset = (data) => {
    setIsResetting(true);
    setError("");
    confirmPassword(data.username, data.code, data.password)
      .then((data) => {
        toast.success("Password reset successful");
        setIsResetting(false);
        navigate("/login");
      })
      .catch((error) => {
        setError(error.message);
        setIsResetting(false);
      });

  };


  return (
    <Layout title="Reset Password">
      <div className="pt-12">
        <header className="max-w-lg mx-auto mb-4">
          <h1 className="text-4xl font-bold text-center">Reset Password</h1>
        </header>
        <div className="flex items-center justify-center mx-auto mt-0 ">
          <form
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-full md:w-1/2 mx-2"
            onSubmit={handleSubmit(handlePasswordReset)}>
            <div className="mt-4">
              <Label className="block text-grey-darker text-sm font-bold mb-2">
                <span>Username</span>
              </Label>
              <Input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                type="text"
                name="username"
                {...register("username", {
                  minLength: {
                    value: 4,
                    message: "Username must be greater than 3 characters",
                  },
                  required: "Username is required",
                })}
              />
              {errors.username && <HelperText valid={false}>{errors.username.message}</HelperText>}

            </div>

            <Label className="mt-4">
              <span className="block text-gray-700 text-sm font-bold mb-2">Code</span>
              <Input
                className="rounded w-full text-gray-700 focus:outline-none border px-2 py-2 focus:border-purple-600 transition duration-500"
                type="code"
                inputMode="text"
                name="code"
                {...register("code", {
                  required: "Code cannot be empty",
                  minLength: {
                    value: 3,
                    message: "Code must be greater than 3  characters",
                  },
                })}
              />
              {errors.code && <HelperText valid={false}>{errors.code.message}</HelperText>}            </Label>

            <Label className="mt-4">
              <span className="block text-gray-700 text-sm font-bold mb-2">Password</span>
              <Input
                className="rounded w-full text-gray-700 focus:outline-none border px-2 py-2 focus:border-purple-600 transition duration-500"
                type="password"
                inputMode="password"
                name="password"
                {...register("password", {
                  required: "Password cannot be empty",
                  minLength: {
                    value: 6,
                    message: "Password must be greater than 5 characters",
                  },
                })}
              />
              {errors.password && <HelperText valid={false}>{errors.password.message}</HelperText>}

            </Label>
            <Label className="mt-4">
              <span className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</span>
              <Input
                className="rounded w-full text-gray-700 focus:outline-none border px-2 py-2 focus:border-purple-600 transition duration-500"
                type="password"
                inputMode="password"
                name="password2"
                {...register("password2", {
                  validate: (value) => value === password.current || "Passwords do not match",
                })}
              />
            </Label>
            {errors.password2 && <HelperText valid={false}>{errors.password2.message}</HelperText>}

            <Button type="submit" disabled={isResetting} className="mt-4" >
              {isResetting ? <PulseLoader size={10} color={"#0a138b"} /> : "Reset Password"}
            </Button>
            {error && (
              <HelperText className="pt-2" valid={false}>
                {error}
              </HelperText>
            )}
          </form>
        </div>
      </div>

    </Layout>
  );
};

export default ResetPassword;
