import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="text-xl flex gap-3 flex-col items-center px-6 text-red-500 font-bold absolute insert-0 min-h-screen  justify-center w-full">
      <p> 404! Page Not found</p>
      <Link to="/" className=" text-indigo-500 text-sm px-4 underline">
        {"<-"} Go Home
      </Link>
    </div>
  );
}
