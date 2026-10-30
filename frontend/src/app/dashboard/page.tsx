import type { Metadata } from "next";
import React from "react";
import Overview from "./Overview";

export const metadata: Metadata = {
  title:
    "Kuizz",
  description: "Kuizz user dashboard"
};

export default function Ecommerce() {
  return <Overview />;
}
