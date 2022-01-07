import { Link, LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = {
  id: string;
  name: string;
  content: string;
};

const getRandomJoke = async (): Promise<LoaderData> => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
    select: { id: true, name: true, content: true },
  });
  return randomJoke;
};

export const loader: LoaderFunction = async () => {
  const randomjoke = await getRandomJoke();
  return randomjoke;
};

export default function JokesIndexRoute() {
  const joke = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{joke.content}</p>
      <Link to={`/jokes/${joke.id}`}>{joke.name} Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies!</div>;
}
