"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);

    const publicPaths = ["/dashboard/auth/signin", "/dashboard/auth/signup"];

    if (!storedUser && !publicPaths.includes(pathname)) {
      router.push("/dashboard/auth/signin");
    }
  }, [pathname, router]);

  return user;
}
