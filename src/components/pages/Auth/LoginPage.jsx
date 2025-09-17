import { Eye, EyeOff, Package } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const [userType, setUserType] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/product";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    // navigate(from, { replace: true });
    // setIsLoading(true);
    // try {
    //   toast.success("Login successful!");
    //   navigate("/product");
    //   // navigate(from, { replace: true });
    // } catch (error) {
    //   if (error.response?.status === 403) {
    //     const errorData = error.response.data;
    //     if (errorData.redirect === "/pricing") {
    //       toast.error(errorData.message);

    //       setTimeout(() => {
    //         navigate("/pricing");
    //       }, 2000);
    //       return;
    //     }
    //   }
    //   toast.error(error.response?.data?.message || "Login failed");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Link to="/">
              <Package className="h-12 w-12 text-blue-600" />
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to PackWorkX
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* User Type Selector */}
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setUserType("admin")}
            className={`px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
              userType === "admin"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Company Admin
          </button>
          <button
            type="button"
            onClick={() => setUserType("super_admin")}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
              userType === "super_admin"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Super Admin
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                autoComplete="email"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          {userType === "admin" && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Start your free trial
                </Link>
              </p>
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-blue-500">
              ← Back to Home
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Demo Credentials:
            </h3>
            {userType === "super_admin" ? (
              <div className="text-xs text-blue-600">
                <p>Email: admin@packworkx.com</p>
                <p>Password: SuperAdmin@123</p>
              </div>
            ) : (
              <div className="text-xs text-blue-600">
                <p>Create a new account or use:</p>
                <p>Email: demo@company.com</p>
                <p>Password: demo123</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
