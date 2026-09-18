import AuthenticationCard from "./authentication-card";

export default function Admin() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8">
      <section className="border-b border-border pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Management
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Admin
        </h1>
        <p className="mt-3 text-muted-foreground">
          Manage league data and connected EventLink services.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <AuthenticationCard />
      </section>
    </main>
  );
}
