import {
  Link,
  LoaderFunction,
  useCatch,
  useLoaderData,
  useParams,
} from "remix";
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
  if (!joke) {
    throw new Response("What a Joke! Not found.", { status: 404 });
  }
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

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  if (caught.status === 404) {
    return (
      <div className="error-container">
        Huh? What the heck is {params.jokeId}
      </div>
    );
  }

  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
