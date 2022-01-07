import { Link, LoaderFunction, useLoaderData, useParams } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = {
  name: string;
  content: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { jokeId } = params;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
    select: { name: true, content: true },
  });
  if (!joke) throw new Error("Joke not found");
  return joke as LoaderData;
};

export default function JokeRoute() {
  const joke = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">{joke.name} Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
