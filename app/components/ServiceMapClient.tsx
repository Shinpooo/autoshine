"use client";

import dynamic from "next/dynamic";

const ServiceMap = dynamic(() => import("./ServiceMap"), { ssr: false });

export default function ServiceMapClient() {
  return <ServiceMap />;
}
