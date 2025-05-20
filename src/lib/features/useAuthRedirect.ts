"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  email: string;
  // add other user properties if you have them
}

export default function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        // If parsing fails, remove invalid user data
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    const publicPaths = ["/dashboard/auth/signin", "/dashboard/auth/signup"];

    if (!storedUser && !publicPaths.includes(pathname)) {
      router.push("/dashboard/auth/signin");
    }
  }, [pathname, router]);

  return user;
}
