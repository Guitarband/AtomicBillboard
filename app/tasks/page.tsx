import { redirect } from "next/navigation";

export default function TasksPage() {
  redirect("/?explore=1");
}
