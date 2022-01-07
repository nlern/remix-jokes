import {
  ActionFunction,
  Form,
  json,
  redirect,
  useActionData,
  useTransition,
} from "remix";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

function validateJokeName(name: string) {
  if (name.length < 2) {
    return "That joke's name is too short";
  }
}

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");
  const userId = await requireUserId(request);

  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({
      formError: "Form not submitted correctly",
    });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  const fields = { name, content };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokesRoute() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  return (
    <div>
      <p>Add your own hilaroius joke</p>
      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}></fieldset>
        <div>
          <label htmlFor="name">
            Name:{" "}
            <input
              type="text"
              name="name"
              autoComplete="autocomplete_off_absds42342"
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-describedby={
                Boolean(actionData?.fieldErrors?.name)
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData?.fieldErrors?.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="content">
            Content:{" "}
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-describedby={
                Boolean(actionData?.fieldErrors?.content)
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData?.fieldErrors?.content}
            </p>
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
