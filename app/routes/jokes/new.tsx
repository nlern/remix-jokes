import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useTransition,
} from "remix";
import { z } from "zod";
import { db } from "~/utils/db.server";

const stringSchema = z.string();

type PostError = {
  name?: boolean;
  content?: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  let errors: PostError = {};

  let name: string = "";
  let content: string = "";

  try {
    name = stringSchema.parse(body.get("name"));
  } catch (error) {
    errors.name = true;
  }

  try {
    content = stringSchema.parse(body.get("content"));
  } catch (error) {
    errors.content = true;
  }

  if (!name) errors.name = true;
  if (!content) errors.content = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  const joke = await db.joke.create({
    data: {
      name,
      content,
    },
    select: { id: true },
  });

  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokesRoute() {
  const formErrors = useActionData<PostError>();
  const transition = useTransition();
  return (
    <div>
      <p>Add your own hilaroius joke</p>
      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}></fieldset>
        <div>
          <label htmlFor="name">
            Name: <input type="text" name="name" autoComplete="autocomplete_off_absds42342" />
          </label>
          {formErrors && formErrors.name ? (
            <p style={{ color: "red" }}>Name is required</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="content">
            Content: <textarea name="content" />
          </label>
          {formErrors && formErrors.content ? (
            <p style={{ color: "red" }}>Content is required</p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            {transition.state === "submitting" ? "Adding" : "Add"}
          </button>
        </div>
      </Form>
    </div>
  );
}
