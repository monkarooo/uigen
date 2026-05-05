"use client";

import dynamic from "next/dynamic";

const MainContent = dynamic(() => import("./main-content"), { ssr: false });

export { MainContent };
