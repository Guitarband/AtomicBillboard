import Link from "next/link";
import { SavedList } from "./controls";
import "../tasks/tasks.css";
import "../tasks/research.css";

export default function Shortlist() {
  return <main className="catalogue-page research-page"><Link href="/">Research dashboard</Link><h1>Research shortlist</h1><SavedList/></main>;
}
