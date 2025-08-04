import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  SigninRequest,
  SignupRequest,
} from "@/types/auth";
import { toast } from "sonner";
import { authApi } from "@/services/authApi";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: number;
  expiryDate: string | null;
  isAppValid: boolean;
  signin: (credentials: SigninRequest) => Promise<boolean>;
  signup: (userData: SignupRequest) => Promise<boolean>;
  logout: () => void;
  updateUserData: (updatedUser: User) => void;
  checkFeatureAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<number>(2); // GUEST by default
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isAppValid, setIsAppValid] = useState<boolean>(false); // false by default
  const [subscriptionHash, setSubscriptionHash] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user and role for UI continuity only
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("userRole");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedRole) setUserRole(parseInt(storedRole, 10));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
      }
    }

    setLoading(false);
  }, []);

  const signin = async (credentials: SigninRequest): Promise<boolean> => {
    try {
      const response = await authApi.signin(credentials);

      if (response.success && response.data?.length > 0) {
        const userData = response.data[0];

        // Assign role
        let roleId = 2;
        if (userData.pi_roles?.length > 0) {
          roleId = userData.pi_roles[0].role_id;
        }

        setUser(userData);
        setUserRole(roleId);
        setExpiryDate(response.expiry_date || null);
        setIsAppValid(response.is_app_valid || false);

        // Secure hash
        const subscriptionData = `${userData.user_id}_${response.is_app_valid}_${response.expiry_date}`;
        const hash = btoa(subscriptionData);
        setSubscriptionHash(hash);

        // UI only: persist user & role (not access control)
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userRole", roleId.toString());

        toast.success("Signed in successfully");

        // Redirect based on user role
        if (roleId === 1) {
          // Super Admin redirects to dashboard
          navigate("/dashboard");
        } else if (roleId === 2) {
          // Other users (like Guests) redirect to workspace
          navigate("/workspace");
        }
        return true;
      } else {
        toast.error(response.msg || "Failed to sign in");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
      return false;
    }
  };

  const signup = async (userData: SignupRequest): Promise<boolean> => {
    try {
      const response = await authApi.signup(userData);

      if (response.success) {
        toast.success("Account created successfully. Please sign in.");
        navigate("/signin");
        return true;
      } else {
        toast.error(response.msg || "Failed to create account");
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(2);
    setExpiryDate(null);
    setIsAppValid(false);
    setSubscriptionHash(null);

    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const checkFeatureAccess = (): boolean => {
    if (!user || !subscriptionHash) return false;
    const expectedData = `${user.user_id}_${isAppValid}_${expiryDate}`;
    const expectedHash = btoa(expectedData);

    if (subscriptionHash !== expectedHash) {
      console.warn("Hash validation failed. Possible tampering.");
      return false;
    }

    return isAppValid;
  };

  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser)); // For UI continuity
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        userRole,
        expiryDate,
        isAppValid,
        signin,
        signup,
        logout,
        updateUserData,
        checkFeatureAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};