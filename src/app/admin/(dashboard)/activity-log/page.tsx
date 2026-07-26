import { getActivityLogs } from "@/actions/admin";

export default async function ActivityLogPage() {
  const { items } = await getActivityLogs(1, 50);
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Activity Log</h1>
      <div className="overflow-x-auto border border-[var(--border)]">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[var(--bg-elevated)] text-xs uppercase text-[var(--fg-muted)]">
            <tr>
              <th className="p-3">Vaxt</th>
              <th className="p-3">İstifadəçi</th>
              <th className="p-3">Əməliyyat</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-[var(--border)]">
                <td className="p-3 mono text-xs">
                  {new Date(a.createdAt).toLocaleString("az-AZ")}
                </td>
                <td className="p-3">{a.user?.name || "—"}</td>
                <td className="p-3">{a.action}</td>
                <td className="p-3">
                  {a.entity} {a.entityId ? `· ${a.entityId.slice(0, 8)}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
