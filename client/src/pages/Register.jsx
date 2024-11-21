import { Button, HelperText, Input, Label } from "@windmill/react-ui";
import API from "api/axios.config";
import { useUser } from "context/UserContext";
import Layout from "layout/Layout";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { signUp, confirmSignUp } from "services/cognito.service";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { state } = useLocation();
  const { isLoggedIn, setUserState } = useUser();
  const [success, setSuccess] = useState(false)
  const [usernameConfirmed, setUsernameConfirmed] = useState()
  const [confirm, setConfirm] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const password = useRef({});
  password.current = watch("password", "");

  const onSubmit = async (data) => {
    const { password, password2, username, name, email } = data;
    setError("");
    setSuccess(false)
    if (password === password2) {
      setIsLoading(!isLoading);
      signUp(username, email, password).then((data) => {
        console.log(data);
        setError("");
        // setUserState(data);
        setUsernameConfirmed(username)
        setSuccess(true)
        toast.success("Account created successfully.");
        setIsLoading(false);
      }).catch((error) => {
        setIsLoading(false);
        setError(error.message);
      });
    }
    else {
      setError("Password doesn't match ");
    }
  };

  const onSubmitConfirm = async (event) => {
    event.preventDefault();
    const code = event.target.code.value;
    setError("");
    setIsLoading(!isLoading);
    confirmSignUp(usernameConfirmed, code).then((data) => {
      setError("");
      toast.success("Account confirmed successfully.");
      setIsLoading(false);
      setConfirm(true)
    }).catch((error) => {
      setIsLoading(false);
      setError(error.message);
      setConfirm(false)
    });
  };

  if (isLoggedIn) {
    return <Navigate to={state?.from || "/"} />;
  }

  if (confirm) {
    return <Navigate to="/login" />;
  }

  if (success) {

    return (
      <Layout title="Create account">
        <div className="flex items-center justify-center mx-auto mt-20 ">
          <form
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-full md:w-1/2 mx-2"
            onSubmit={(event) => onSubmitConfirm(event)}
          >
            <h1 className="text-center text-4xl">Confirm Sign Up</h1>
            <div className="mt-4">
              <Label className="block text-grey-darker text-sm font-bold mb-2">
                <span>Code</span>
              </Label>
              <Input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                type="text"
                name="code"
                defaultValue={""}
                required
                {...register("code", {
                  required: "Code is required",
                })}
              />
            </div>
            {errors?.code && (
              <HelperText className="pt-2" valid={false}>
                {errors.code.message}
              </HelperText>
            )}
            <Button type="submit" className="mt-4">
              {isLoading ? (
                <PulseLoader color={"#0a138b"} size={10} loading={isLoading} />
              ) : (
                "Confirm"
              )}
            </Button>
          </form>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Create account">
      <div className="flex items-center justify-center mx-auto mt-20 ">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-full md:w-1/2 mx-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-center text-4xl">Create Account</h1>
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
          </div>
          {errors?.username && (
            <HelperText className="pt-2" valid={false}>
              {errors.username.message}
            </HelperText>
          )}
          {errors.name && (
            <HelperText className="pt-2" valid={false}>
              {errors.name.message}
            </HelperText>
          )}
          <div className="mt-4">
            <Label className="block text-grey-darker text-sm font-bold mb-2">
              <span>Email</span>
            </Label>
            <Input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              type="email"
              name="email"
              {...register("email", {
                required: "Email required",
                pattern: {
                  // eslint-disable-next-line no-useless-escape
                  value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  message: "Email not valid",
                },
              })}
            />
          </div>
          {errors.email && (
            <HelperText className="pt-2" valid={false}>
              {errors.email.message}
            </HelperText>
          )}
          <div className="mt-4">
            <Label className="block text-grey-darker text-sm font-bold mb-2">
              <span>Password</span>
            </Label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              type="password"
              name="password"
              {...register("password", {
                required: "Password required",
                minLength: {
                  value: 6,
                  message: "Password must be greater than 5 characters",
                },
              })}
            />
          </div>
          {errors.password && (
            <HelperText className="pt-2" valid={false}>
              {errors.password.message}
            </HelperText>
          )}
          <div className="mt-4">
            <Label className="block text-grey-darker text-sm font-bold mb-2">
              <span>Confirm Password</span>
            </Label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              type="password"
              name="password2"
              {...register("password2", {
                validate: (value) => value === password.current || "Passwords do not match",
              })}
            />
            {errors.password2 && (
              <HelperText className="pt-2" valid={false}>
                {errors.password2.message}
              </HelperText>
            )}
          </div>
          <Button type="submit" className="mt-4">
            {isLoading ? (
              <PulseLoader color={"#0a138b"} size={10} loading={isLoading} />
            ) : (
              "Create Account"
            )}
          </Button>
          {error && (
            <HelperText className="pt-2" valid={false}>
              {error}
            </HelperText>
          )}
          <p className="text-sm mt-4">
            Have an account?{" "}
            <Link to="/login" className="font-bold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Register;
