
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import logo from "./../../public/icons/logo-light1.png";

const formSchema = z.object({
  user_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  user_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  user_mobile: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
      user_email: "",
      user_mobile: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const success = await signup({
        user_name: values.user_name,
        user_email: values.user_email,
        user_pwd: values.password,
        user_mobile: values.user_mobile,
        gender: "OTHER", // Default gender since it's not collected in UI
        is_active: true,
      });

      if (success) {
        navigate("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
      <div className="text-center">
          <img src={logo} alt="logo" className="mx-auto w-80 h-auto" />
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-center mb-4 text-gray-600">
            Enter your details to get started with DataGpt
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center mb-4 text-gray-600">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center mb-4 text-gray-600">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center mb-4 text-gray-600">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123-456-7890"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center mb-4 text-gray-600">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/signin"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
