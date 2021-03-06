import { Joke } from "@prisma/client";
import {
  ActionFunction,
  Link,
  LoaderFunction,
  MetaFunction,
  redirect,
  useCatch,
  useLoaderData,
  useParams,
} from "remix";
import JokeDisplay from "~/components/joke";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

type LoaderData = {
  joke: Joke;
  isOwner: boolean;
};

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const { jokeId } = params;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });
  const userId = await getUserId(request);
  if (!joke) {
    throw new Response("What a Joke! Not found.", { status: 404 });
  }
  return { joke, isOwner: joke.jokesterId === userId } as LoaderData;
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();

  if (form.get("_method") === "delete") {
    const userId = await getUserId(request);
    const joke = await db.joke.findUnique({
      where: { id: params.jokeId },
    });

    if (!joke) {
      throw new Response("Can't delete a joke that does not exist", {
        status: 404,
      });
    }

    if (joke.jokesterId !== userId) {
      throw new Response("That is not your joke.", { status: 401 });
    }

    await db.joke.delete({
      where: { id: params.jokeId },
    });

    return redirect("/jokes");
  }
};

export default function JokeRoute() {
  const { joke, isOwner } = useLoaderData<LoaderData>();

  return <JokeDisplay joke={joke} isOwner={isOwner} />;
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

  if (caught.status === 401) {
    return (
      <div className="error-container">
        Sorry, but {params.jokeId} is not your joke.
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
