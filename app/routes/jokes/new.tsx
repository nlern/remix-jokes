export default function NewJokesRoute() {
  return (
    <div>
      <p>Add your own hilaroius joke</p>
      <form method="post">
        <div>
          <label htmlFor="name">
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label htmlFor="content">
            Content: <textarea name="content" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
