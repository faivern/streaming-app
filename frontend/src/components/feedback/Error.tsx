import type { ErrorResponse } from "../../types/common";

const Error = ({ message }: ErrorResponse) => {
  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32">
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-xl">
          {message ?? "Something went wrong"}
        </div>
      </div>
    </main>
  );
};

export default Error;