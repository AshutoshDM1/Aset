export default function Shared() {
  return (
    <div className="w-full p-4 rounded-lg shadow-dx">
      <h1 className="text-2xl font-semibold tracking-tight">Shared with me</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Files shared with you will appear here.
      </p>
      <div className="mt-4">
        <p>No shared items</p>
      </div>
    </div>
  );
}
