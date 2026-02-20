import type { ErrorResponse } from "../../types/common";

const Error = ({ message }: ErrorResponse) => {
  return (
    <main className="mt-navbar-offset">
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-xl">
          {message ?? "Something went wrong"}
        </div>
      </div>
    </main>
  );
};

export default Error;