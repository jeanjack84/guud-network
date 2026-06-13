"use client";

import { useActionState } from "react";
import Link from "next/link";
import { captureDemand, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export function DemandCapture({
  location,
  topics,
  query,
}: {
  location: string | null;
  topics: string[];
  query: string;
}) {
  const [state, action, pending] = useActionState(captureDemand, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl2 border border-sage/40 bg-sage-soft/60 p-5 text-center">
        <p className="font-display text-lg text-sage">You&apos;re on the list 💚</p>
        <p className="mt-1 text-sm text-ink/80">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-line bg-surface p-5">
      <h3 className="font-display text-lg text-ink">
        {location
          ? `No one in ${location} yet — want to know when there is?`
          : "Want to know when we have a match for you?"}
      </h3>
      <p className="mt-1 text-sm text-muted">
        We&apos;re growing the network where women need it most. Leave your email
        and we&apos;ll reach out the moment we have someone you can actually reach.
      </p>
      <form action={action} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="location" value={location ?? ""} />
        <input type="hidden" name="topics" value={topics.join(",")} />
        <input type="hidden" name="query" value={query} />
        <label htmlFor="demand-email" className="sr-only">
          Your email
        </label>
        <input
          id="demand-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="w-full flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-plum placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-plum-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : "Notify me"}
        </button>
      </form>
      {state.message && !state.ok && (
        <p className="mt-2 text-sm text-plum-dark">{state.message}</p>
      )}
      <p className="mt-3 text-sm text-muted">
        Know someone good{location ? ` in ${location}` : ""}?{" "}
        <Link href="/practitioners/new" className="text-plum underline">
          Recommend a practitioner
        </Link>{" "}
        and help the next woman find them.
      </p>
    </div>
  );
}
