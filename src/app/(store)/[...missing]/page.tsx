import { notFound } from "next/navigation";

// Routes unknown URLs to the storefront 404 so they keep the header and footer.
export default function CatchAll() {
  notFound();
}
