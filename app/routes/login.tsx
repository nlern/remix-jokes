import {
  ActionFunction,
  json,
  Link,
  LinksFunction,
  MetaFunction,
  useActionData,
  useSearchParams,
} from "remix";
import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = () => {
  return {
    title: "Remix | login",
    description: "Login to submit your own jokes to remix-jokes!",
  };
};

function validateUsername(username: string) {
  if (typeof username !== "string" || username.length < 3) {
    return "Usernames must be atleast 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be atleast 6 characters long";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const loginType = formData.get("loginType");
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/jokes";

  if (
    typeof loginType !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: "Form not submitted correctly.",
    });
  }

  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fields,
      fieldErrors,
    });
  }

  switch (loginType) {
    case "login":
      // login to get the user
      // if there's no user, return the fields and a formError
      // if there's a user, create their session and redirect to /jokes
      const user = await login({ username, password });
      if (!user) {
        return badRequest({
          formError: "Invalid credentials",
        });
      }
      return await createUserSession(user.id, redirectTo);

    case "register":
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fields,
          formError: `User with username ${username} already exists`,
        });
      }
      // create the user
      // create their session and redirect to /jokes
      const newUser = await register({ username, password });
      if (!newUser) {
        return badRequest({
          fields,
          formError: `Something went wrong trying to create a new user.`,
        });
      }
      return createUserSession(newUser.id, redirectTo);

    default:
      return badRequest({ fields, formError: "Invalid login type" });
  }
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();

  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form
          method="post"
          aria-describedby={
            actionData?.formError ? "form-error-message" : undefined
          }
        >
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <fieldset>
            <legend className="sr-only">Login or Register?</legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={actionData?.fields?.loginType === "register"}
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              autoComplete="autocomplete_username_4jh23i4uyh27ch"
              type="text"
              name="username"
              id="username-input"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.username) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.username ? "username-error" : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData?.fieldErrors?.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              autoComplete="autocomplete_password_skdjfhwie2387r3y"
              type="password"
              name="password"
              id="password-input"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.password ? "password-error" : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData?.fieldErrors?.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData?.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
