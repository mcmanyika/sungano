"use client";

import { Loader2, MapPin, RefreshCw, Trash2, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { deleteVolunteer, getAllVolunteers } from "@/lib/firebase/volunteers";
import { cardSurface } from "@/lib/styles";
import { formatVolunteerDate, type Volunteer } from "@/types/volunteer";

export function VolunteerList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setVolunteers(await getAllVolunteers());
    } catch {
      setError("Unable to load volunteer registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVolunteers();
  }, [loadVolunteers]);

  const filteredVolunteers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return volunteers;
    }

    return volunteers.filter((volunteer) =>
      [
        volunteer.fullName,
        volunteer.email,
        volunteer.phone,
        volunteer.province,
        volunteer.interest,
        volunteer.message,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, volunteers]);

  const provinceCounts = useMemo(() => {
    return volunteers.reduce<Record<string, number>>((counts, volunteer) => {
      counts[volunteer.province] = (counts[volunteer.province] ?? 0) + 1;
      return counts;
    }, {});
  }, [volunteers]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this volunteer registration?")) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await deleteVolunteer(id);
      setVolunteers((current) => current.filter((volunteer) => volunteer.id !== id));
    } catch {
      setError("Unable to delete this registration.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Volunteers
          </h2>
          <p className="mt-1 text-sm text-muted">
            Registrations submitted from the website volunteer form.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => loadVolunteers()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`rounded-2xl p-5 ${cardSurface}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted">Total volunteers</p>
              <p className="font-display text-2xl font-bold text-neutral-900">
                {volunteers.length}
              </p>
            </div>
          </div>
        </div>

        {Object.entries(provinceCounts)
          .slice(0, 5)
          .map(([province, count]) => (
            <div key={province} className={`rounded-2xl p-5 ${cardSurface}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted">{province}</p>
                  <p className="font-display text-2xl font-bold text-neutral-900">
                    {count}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className={`rounded-2xl p-4 ${cardSurface}`}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, phone, province, or interest..."
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <UserPlus className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-neutral-700">
            {search
              ? "No volunteers match your search."
              : "No volunteer registrations yet."}
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Province</th>
                  <th className="px-5 py-3">Interest</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="align-top text-neutral-700">
                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-900">
                        {volunteer.fullName}
                      </p>
                      {volunteer.message && (
                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
                          {volunteer.message}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p>{volunteer.email}</p>
                      <p className="mt-1 text-muted">{volunteer.phone}</p>
                    </td>
                    <td className="px-5 py-4">{volunteer.province}</td>
                    <td className="px-5 py-4">{volunteer.interest}</td>
                    <td className="px-5 py-4 text-muted">
                      {formatVolunteerDate(volunteer.registeredAt)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(volunteer.id)}
                        disabled={deletingId === volunteer.id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Delete ${volunteer.fullName}`}
                      >
                        {deletingId === volunteer.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
