import { createFileRoute } from "@tanstack/react-router";
import { FxApp } from "@/components/fx-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <FxApp />;
}
