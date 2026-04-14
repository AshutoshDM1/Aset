export default function Starred() {
  return (
    <div className="w-full p-4 rounded-lg shadow-dx">
      <h1 className="text-2xl font-semibold tracking-tight">Starred</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your starred items will appear here.
      </p>
      <div className="mt-4">
        <p>No starred items</p>
      </div>
    </div>
  );
}
