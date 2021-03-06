import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import globalStylesUrl from "~/styles/global.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalLargeStylesUrl from "~/styles/global-large.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    {
      rel: "stylesheet",
      href: globalMediumStylesUrl,
      media: "print, (min-width: 640px)",
    },
    {
      rel: "stylesheet",
      href: globalLargeStylesUrl,
      media: "screen, (min-width: 1024px)",
    },
  ];
};

export const meta: MetaFunction = () => {
  const description = "Learn Remix and laugh at the same time!";
  return {
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description
  }
}

function Document({
  children,
  title = "Remix, so great, it's funny!",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta/>
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const errorMessage = `${caught.status} ${caught.statusText}`;
  return (
    <Document title={errorMessage}>
      <div className="error-container">
        <h1>{errorMessage}</h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="uh-oh!">
      <div className="error-container">
        <h1>App error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
